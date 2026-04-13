const DEFAULT_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵ" +
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface MatrixRainOptions {
  fontSize?: number;
  fallSpeedMin?: number;
  fallSpeedMax?: number;
  mutateChance?: number;
  blankChance?: number;
  spawnChance?: number;
  baseAlpha?: number;
  eraserStrength?: number;
  eraserLengthMin?: number;
  eraserLengthMax?: number;
  emptyColChance?: number;
  writerSpawnChance?: number;
  eraserSpawnChance?: number;
  chars?: string;
  /** RGB tuple for glyph color. Default: matrix green [0, 255, 70] */
  color?: [number, number, number];
  /** RGB tuple for the head character. Default: light green [180, 255, 180] */
  headColor?: [number, number, number];
}

export interface MatrixRainInstance {
  destroy: () => void;
}

/* ── Internal types ──────────────────────────────────────────────────────── */

interface Writer {
  col: number;
  y: number;
  speed: number;
  lastRow: number;
}
interface Eraser {
  col: number;
  y: number;
  speed: number;
  length: number;
}

interface Cfg {
  fontSize: number;
  fallSpeedMin: number;
  fallSpeedMax: number;
  fallSpeedMid: number;
  mutateChance: number;
  blankChance: number;
  spawnChance: number;
  baseAlpha: number;
  eraserStrength: number;
  eraserLengthMin: number;
  eraserLengthMax: number;
  emptyColChance: number;
  writerSpawnChance: number;
  eraserSpawnChance: number;
  chars: string;
  cr: number;
  cg: number;
  cb: number;
  hr: number;
  hg: number;
  hb: number;
}

function resolveCfg(opt: MatrixRainOptions): Cfg {
  const fontSize = opt.fontSize ?? 12;
  const fallSpeedMin = opt.fallSpeedMin ?? 0.04;
  const fallSpeedMax = opt.fallSpeedMax ?? 0.14;
  const [cr, cg, cb] = opt.color ?? [0, 255, 70];
  const [hr, hg, hb] = opt.headColor ?? [180, 255, 180];
  return {
    fontSize,
    fallSpeedMin,
    fallSpeedMax,
    fallSpeedMid: (fallSpeedMin + fallSpeedMax) / 2,
    mutateChance: opt.mutateChance ?? 0.002,
    blankChance: opt.blankChance ?? 0.00005,
    spawnChance: opt.spawnChance ?? 0.00005,
    baseAlpha: opt.baseAlpha ?? 0.65,
    eraserStrength: opt.eraserStrength ?? 0.04,
    eraserLengthMin: opt.eraserLengthMin ?? 8,
    eraserLengthMax: opt.eraserLengthMax ?? 12,
    emptyColChance: opt.emptyColChance ?? 0.25,
    writerSpawnChance: opt.writerSpawnChance ?? 0.00020,
    eraserSpawnChance: opt.eraserSpawnChance ?? 0.00017,
    chars: opt.chars ?? DEFAULT_CHARS,
    cr,
    cg,
    cb,
    hr,
    hg,
    hb,
  };
}

/* ── Simulation helpers ──────────────────────────────────────────────────── */

function randCharIdx(c: Cfg): number {
  return 1 + Math.floor(Math.random() * c.chars.length);
}
function randSpeed(c: Cfg): number {
  return c.fallSpeedMin + Math.random() * (c.fallSpeedMax - c.fallSpeedMin);
}
function randEraserLen(c: Cfg): number {
  return c.eraserLengthMin + Math.floor(Math.random() * (c.eraserLengthMax - c.eraserLengthMin + 1));
}
function capSpeed(col: number, list: { col: number; y: number; speed: number }[], y: number): number {
  let cap = Infinity;
  for (const it of list) if (it.col === col && it.y > y) cap = Math.min(cap, it.speed);
  return cap;
}

/* ── Simulation state ────────────────────────────────────────────────────── */

interface Sim {
  rows: number;
  cols: number;
  /** 0 = blank, 1..N = index into chars string (+1 offset) */
  charIdx: Uint8Array;
  alpha: Float32Array;
  emptyCol: Uint8Array;
  writers: Writer[];
  erasers: Eraser[];
}

function createSim(c: Cfg, cols: number, rows: number): Sim {
  const n = rows * cols;
  const charIdx = new Uint8Array(n);
  const alpha = new Float32Array(n);
  const emptyCol = new Uint8Array(cols);

  for (let i = 0; i < cols; i++) emptyCol[i] = Math.random() < c.emptyColChance ? 1 : 0;

  for (let r = 0; r < rows; r++)
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      if (!emptyCol[col] && Math.random() < 0.6) {
        charIdx[i] = randCharIdx(c);
        alpha[i] = 0.8;
      }
    }

  const wd = Math.min(1, c.writerSpawnChance * (rows / c.fallSpeedMid));
  const writers: Writer[] = [];
  for (let col = 0; col < cols; col++)
    if (!emptyCol[col] && Math.random() < wd)
      writers.push({ col, y: -Math.random() * rows, speed: randSpeed(c), lastRow: -1 });

  const ed = Math.min(1, c.eraserSpawnChance * (rows / c.fallSpeedMid));
  const erasers: Eraser[] = [];
  for (let col = 0; col < cols; col++)
    if (Math.random() < ed)
      erasers.push({ col, y: -Math.random() * rows, speed: randSpeed(c), length: randEraserLen(c) });

  return { rows, cols, charIdx, alpha, emptyCol, writers, erasers };
}

/**
 * Advance the simulation by one frame.
 * @param warmup - When true, respects emptyCol restrictions (matching original warmup behaviour).
 */
function simStep(s: Sim, c: Cfg, warmup = false): void {
  const { charIdx, alpha, emptyCol, rows, cols } = s;

  // Cell mutations / spawns
  for (let r = 0; r < rows; r++)
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      if (charIdx[i]) {
        if (Math.random() < c.blankChance) {
          charIdx[i] = 0;
          alpha[i] = 0;
          continue;
        }
        if (Math.random() < c.mutateChance) charIdx[i] = randCharIdx(c);
      } else if ((!warmup || !emptyCol[col]) && Math.random() < c.spawnChance) {
        charIdx[i] = randCharIdx(c);
        alpha[i] = 0.4 + Math.random() * 0.4;
      }
    }

  // Erasers – forward iterate with swap-and-pop
  let ei = 0;
  while (ei < s.erasers.length) {
    const e = s.erasers[ei]!;
    e.y += e.speed;
    const hr = Math.floor(e.y);
    for (let t = 0; t < e.length; t++) {
      const r = hr - t;
      if (r < 0 || r >= rows) continue;
      const idx = r * cols + e.col;
      if (!charIdx[idx]) continue;
      alpha[idx] -= c.eraserStrength;
      if (alpha[idx] <= 0) {
        charIdx[idx] = 0;
        alpha[idx] = 0;
      }
    }
    if (e.y > rows + e.length) {
      s.erasers[ei] = s.erasers[s.erasers.length - 1]!;
      s.erasers.pop();
    } else {
      ei++;
    }
  }
  for (let col = 0; col < cols; col++)
    if (Math.random() < c.eraserSpawnChance) {
      const y0 = -(Math.random() * 2 * 60 * c.fallSpeedMid);
      s.erasers.push({ col, y: y0, speed: Math.min(randSpeed(c), capSpeed(col, s.erasers, y0)), length: randEraserLen(c) });
    }

  // Writers – forward iterate with swap-and-pop
  let wi = 0;
  while (wi < s.writers.length) {
    const w = s.writers[wi]!;
    w.y += w.speed;
    const r = Math.floor(w.y);
    if (r >= 0 && r < rows && r !== w.lastRow && (!warmup || !emptyCol[w.col])) {
      const idx = r * cols + w.col;
      charIdx[idx] = randCharIdx(c);
      alpha[idx] = 1.0;
      w.lastRow = r;
    }
    if (w.y > rows) {
      s.writers[wi] = s.writers[s.writers.length - 1]!;
      s.writers.pop();
    } else {
      wi++;
    }
  }
  const occ = new Set(s.writers.map((w) => w.col));
  for (let col = 0; col < cols; col++)
    if ((!warmup || !emptyCol[col]) && !occ.has(col) && Math.random() < c.writerSpawnChance) {
      const y0 = -(Math.random() * 3 * 60 * c.fallSpeedMid);
      s.writers.push({ col, y: y0, speed: Math.min(randSpeed(c), capSpeed(col, s.writers, y0)), lastRow: -1 });
    }
}

function simWarmup(s: Sim, c: Cfg): void {
  const frames = Math.round(s.rows / c.fallSpeedMid);
  for (let f = 0; f < frames; f++) simStep(s, c, true);
}

/* ── Render data pre-computation ─────────────────────────────────────────── */

/**
 * Build uint8 arrays that both renderers consume.
 * - `renderAlpha[i]` – final alpha (0-255), includes BASE_ALPHA and head/trail boosts.
 * - `headReveal[i]`  – 0 = normal cell, 1-255 = head with that reveal fraction.
 */
function prepareRenderData(s: Sim, c: Cfg, renderAlpha: Uint8Array, headReveal: Uint8Array): void {
  const { charIdx, alpha, cols, rows, writers } = s;
  const n = rows * cols;

  for (let i = 0; i < n; i++)
    renderAlpha[i] = charIdx[i] ? Math.min(255, Math.round(alpha[i] * c.baseAlpha * 255)) : 0;
  headReveal.fill(0);

  for (const w of writers) {
    const r = Math.floor(w.y);
    const col = w.col;

    // Trail: rows r-4 … r-2 — alpha gradient from 0.9 → baseAlpha
    for (let t = 2; t <= 4; t++) {
      const tr = r - t;
      if (tr < 0 || tr >= rows) continue;
      const idx = tr * cols + col;
      if (!charIdx[idx]) continue;
      const progress = (t - 2) / 3;
      renderAlpha[idx] = Math.min(255, Math.round((0.9 - progress * (0.9 - c.baseAlpha)) * 255));
    }

    // Row r-1: full brightness
    if (r - 1 >= 0 && r - 1 < rows) {
      const idx = (r - 1) * cols + col;
      if (charIdx[idx]) renderAlpha[idx] = 255;
    }

    // Head at row r
    if (r >= 0 && r < rows) {
      const idx = r * cols + col;
      if (charIdx[idx]) {
        renderAlpha[idx] = Math.round(0.95 * 255);
        const rev = w.y - r;
        headReveal[idx] = rev > 0 ? Math.max(1, Math.round(Math.min(rev, 1) * 255)) : 0;
      }
    }
  }
}

/* ── Canvas 2D fallback renderer ─────────────────────────────────────────── */

function createCanvas2DRenderer(canvas: HTMLCanvasElement, c: Cfg): MatrixRainInstance {
  const ctx = canvas.getContext("2d")!;
  let sim: Sim;
  let renderAlpha: Uint8Array;
  let headReveal: Uint8Array;
  let animId = 0;

  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / c.fontSize);
    const rows = Math.floor(canvas.height / c.fontSize);
    if (cols === 0 || rows === 0) return;
    sim = createSim(c, cols, rows);
    renderAlpha = new Uint8Array(rows * cols);
    headReveal = new Uint8Array(rows * cols);
    simWarmup(sim, c);
    prepareRenderData(sim, c, renderAlpha, headReveal);
    renderFrame();
  }

  function renderFrame() {
    const { charIdx, cols, rows } = sim;
    const fs = c.fontSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fs}px monospace`;

    for (let r = 0; r < rows; r++)
      for (let col = 0; col < cols; col++) {
        const i = r * cols + col;
        const ci = charIdx[i];
        if (!ci) continue;
        const a = renderAlpha[i];
        if (a < 2) continue;
        const af = (a / 255).toFixed(3);
        const ch = c.chars[ci - 1]!;
        const head = headReveal[i];

        if (head) {
          const revealPx = Math.ceil((head / 255) * fs);
          if (revealPx > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(col * fs, r * fs, fs, revealPx);
            ctx.clip();
            ctx.fillStyle = `rgba(${c.hr},${c.hg},${c.hb},${af})`;
            ctx.fillText(ch, col * fs, (r + 1) * fs);
            ctx.restore();
          }
        } else {
          ctx.fillStyle = `rgba(${c.cr},${c.cg},${c.cb},${af})`;
          ctx.fillText(ch, col * fs, (r + 1) * fs);
        }
      }
  }

  function frame() {
    simStep(sim, c);
    prepareRenderData(sim, c, renderAlpha, headReveal);
    renderFrame();
    animId = requestAnimationFrame(frame);
  }

  const onResize = () => init();
  window.addEventListener("resize", onResize);
  init();
  animId = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    },
  };
}

/* ── WebGL2 shader sources ───────────────────────────────────────────────── */

const VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform sampler2D uAtlas;
uniform sampler2D uCharTex;
uniform sampler2D uAlphaTex;
uniform sampler2D uHeadTex;
uniform vec3  uColor;
uniform vec3  uHeadColor;
uniform float uCols;
uniform float uRows;
uniform float uAtlasCols;
uniform float uCellW;
uniform float uCellH;
uniform float uAtlasW;
uniform float uAtlasH;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  float gx = vUV.x * uCols;
  float gy = (1.0 - vUV.y) * uRows;
  float col = floor(gx);
  float row = floor(gy);

  if (col < 0.0 || col >= uCols || row < 0.0 || row >= uRows) {
    fragColor = vec4(0.0);
    return;
  }

  vec2 dUV = (vec2(col, row) + 0.5) / vec2(uCols, uRows);

  float ci = texture(uCharTex, dUV).r * 255.0;
  int charIdx = int(ci + 0.5);
  if (charIdx == 0) { fragColor = vec4(0.0); return; }

  float a = texture(uAlphaTex, dUV).r;
  if (a < 0.004) { fragColor = vec4(0.0); return; }

  float headVal = texture(uHeadTex, dUV).r;

  vec2 cf = vec2(fract(gx), fract(gy));

  // Head reveal clipping — headVal encodes the visible fraction (top → bottom)
  if (headVal > 0.004 && cf.y > headVal) { fragColor = vec4(0.0); return; }

  int ai = charIdx - 1;
  float ac = mod(float(ai), uAtlasCols);
  float ar = floor(float(ai) / uAtlasCols);

  vec2 atlasUV = vec2(
    (ac + cf.x) * uCellW / uAtlasW,
    (ar + cf.y) * uCellH / uAtlasH
  );

  float mask = texture(uAtlas, atlasUV).a;
  vec3  color = headVal > 0.004 ? uHeadColor : uColor;
  float fa = mask * a;

  fragColor = vec4(color * fa, fa);
}`;

/* ── WebGL helpers ───────────────────────────────────────────────────────── */

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)!);
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const pg = gl.createProgram()!;
  gl.attachShader(pg, vs);
  gl.attachShader(pg, fs);
  gl.linkProgram(pg);
  if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pg)!);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return pg;
}

function makeDataTex(gl: WebGL2RenderingContext, w: number, h: number): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, null);
  return t;
}

interface Atlas {
  tex: WebGLTexture;
  cols: number;
  cellW: number;
  cellH: number;
  w: number;
  h: number;
}

function buildAtlas(gl: WebGL2RenderingContext, c: Cfg): Atlas {
  const n = c.chars.length;
  const atlasCols = Math.ceil(Math.sqrt(n));
  const atlasRows = Math.ceil(n / atlasCols);
  const cellW = c.fontSize;
  const cellH = c.fontSize;
  const w = atlasCols * cellW;
  const h = atlasRows * cellH;

  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const cx = cv.getContext("2d")!;
  cx.font = `${c.fontSize}px monospace`;
  cx.textBaseline = "alphabetic";
  cx.fillStyle = "#fff";
  for (let i = 0; i < n; i++) {
    const col = i % atlasCols;
    const row = Math.floor(i / atlasCols);
    cx.fillText(c.chars[i]!, col * cellW, (row + 1) * cellH);
  }

  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);

  return { tex, cols: atlasCols, cellW, cellH, w, h };
}

/* ── WebGL2 renderer ─────────────────────────────────────────────────────── */

function createWebGLRenderer(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, c: Cfg): MatrixRainInstance {
  const prog = linkProgram(gl);

  // Full-screen quad VAO
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  // Uniform locations
  gl.useProgram(prog);
  const loc = {
    uAtlas: gl.getUniformLocation(prog, "uAtlas")!,
    uCharTex: gl.getUniformLocation(prog, "uCharTex")!,
    uAlphaTex: gl.getUniformLocation(prog, "uAlphaTex")!,
    uHeadTex: gl.getUniformLocation(prog, "uHeadTex")!,
    uColor: gl.getUniformLocation(prog, "uColor")!,
    uHeadColor: gl.getUniformLocation(prog, "uHeadColor")!,
    uCols: gl.getUniformLocation(prog, "uCols")!,
    uRows: gl.getUniformLocation(prog, "uRows")!,
    uAtlasCols: gl.getUniformLocation(prog, "uAtlasCols")!,
    uCellW: gl.getUniformLocation(prog, "uCellW")!,
    uCellH: gl.getUniformLocation(prog, "uCellH")!,
    uAtlasW: gl.getUniformLocation(prog, "uAtlasW")!,
    uAtlasH: gl.getUniformLocation(prog, "uAtlasH")!,
  };

  // Constant uniforms
  gl.uniform3f(loc.uColor, c.cr / 255, c.cg / 255, c.cb / 255);
  gl.uniform3f(loc.uHeadColor, c.hr / 255, c.hg / 255, c.hb / 255);
  gl.uniform1i(loc.uAtlas, 0);
  gl.uniform1i(loc.uCharTex, 1);
  gl.uniform1i(loc.uAlphaTex, 2);
  gl.uniform1i(loc.uHeadTex, 3);

  const atlas = buildAtlas(gl, c);
  gl.uniform1f(loc.uAtlasCols, atlas.cols);
  gl.uniform1f(loc.uCellW, atlas.cellW);
  gl.uniform1f(loc.uCellH, atlas.cellH);
  gl.uniform1f(loc.uAtlasW, atlas.w);
  gl.uniform1f(loc.uAtlasH, atlas.h);

  let charTex: WebGLTexture | null = null;
  let alphaTex: WebGLTexture | null = null;
  let headTex: WebGLTexture | null = null;
  let sim: Sim;
  let renderAlpha: Uint8Array;
  let headRevealData: Uint8Array;
  let animId = 0;

  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const cols = Math.floor(canvas.width / c.fontSize);
    const rows = Math.floor(canvas.height / c.fontSize);
    if (cols === 0 || rows === 0) return;

    sim = createSim(c, cols, rows);
    renderAlpha = new Uint8Array(rows * cols);
    headRevealData = new Uint8Array(rows * cols);

    if (charTex) gl.deleteTexture(charTex);
    if (alphaTex) gl.deleteTexture(alphaTex);
    if (headTex) gl.deleteTexture(headTex);
    charTex = makeDataTex(gl, cols, rows);
    alphaTex = makeDataTex(gl, cols, rows);
    headTex = makeDataTex(gl, cols, rows);

    gl.useProgram(prog);
    gl.uniform1f(loc.uCols, cols);
    gl.uniform1f(loc.uRows, rows);

    simWarmup(sim, c);
    prepareRenderData(sim, c, renderAlpha, headRevealData);
    uploadAndDraw();
  }

  function uploadAndDraw() {
    const { cols, rows, charIdx } = sim;

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, charTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.UNSIGNED_BYTE, charIdx);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, alphaTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.UNSIGNED_BYTE, renderAlpha);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, headTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.UNSIGNED_BYTE, headRevealData);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlas.tex);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame() {
    simStep(sim, c);
    prepareRenderData(sim, c, renderAlpha, headRevealData);
    uploadAndDraw();
    animId = requestAnimationFrame(frame);
  }

  const onResize = () => init();
  window.addEventListener("resize", onResize);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(animId);
  });
  canvas.addEventListener("webglcontextrestored", () => {
    init();
    animId = requestAnimationFrame(frame);
  });

  init();
  animId = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(atlas.tex);
      if (charTex) gl.deleteTexture(charTex);
      if (alphaTex) gl.deleteTexture(alphaTex);
      if (headTex) gl.deleteTexture(headTex);
    },
  };
}

/* ── Public API ──────────────────────────────────────────────────────────── */

export function createMatrixRain(canvas: HTMLCanvasElement, options: MatrixRainOptions = {}): MatrixRainInstance {
  const c = resolveCfg(options);

  const gl = canvas.getContext("webgl2");
  if (gl) {
    try {
      return createWebGLRenderer(canvas, gl, c);
    } catch (_) {
      // WebGL2 context was claimed — need a fresh canvas for the 2D fallback
      const fallback = document.createElement("canvas");
      for (const attr of canvas.attributes) fallback.setAttribute(attr.name, attr.value);
      canvas.parentNode?.replaceChild(fallback, canvas);
      return createCanvas2DRenderer(fallback, c);
    }
  }

  return createCanvas2DRenderer(canvas, c);
}
