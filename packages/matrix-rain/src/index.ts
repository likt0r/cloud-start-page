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

interface Cell   { char: string | null; alpha: number; }
interface Writer { col: number; y: number; speed: number; lastRow: number; }
interface Eraser { col: number; y: number; speed: number; length: number; }

export function createMatrixRain(canvas: HTMLCanvasElement, options: MatrixRainOptions = {}): MatrixRainInstance {
  const FONT_SIZE           = options.fontSize           ?? 12;
  const FALL_SPEED_MIN      = options.fallSpeedMin      ?? 0.04;
  const FALL_SPEED_MAX      = options.fallSpeedMax      ?? 0.14;
  const MUTATE_CHANCE       = options.mutateChance      ?? 0.002;
  const BLANK_CHANCE        = options.blankChance       ?? 0.00005;
  const SPAWN_CHANCE        = options.spawnChance       ?? 0.00005;
  const BASE_ALPHA          = options.baseAlpha         ?? 0.65;
  const ERASER_STRENGTH     = options.eraserStrength    ?? 0.04;
  const ERASER_LENGTH_MIN   = options.eraserLengthMin   ?? 8;
  const ERASER_LENGTH_MAX   = options.eraserLengthMax   ?? 12;
  const EMPTY_COL_CHANCE    = options.emptyColChance    ?? 0.25;
  const WRITER_SPAWN_CHANCE = options.writerSpawnChance ?? 0.00020;
  const ERASER_SPAWN_CHANCE = options.eraserSpawnChance ?? 0.00017;
  const CHARS               = options.chars             ?? DEFAULT_CHARS;
  const [cr, cg, cb]        = options.color             ?? [0, 255, 70];
  const [hr, hg, hb]        = options.headColor         ?? [180, 255, 180];

  const FALL_SPEED_MID = (FALL_SPEED_MIN + FALL_SPEED_MAX) / 2;

  const ctx = canvas.getContext("2d")!;

  let cells:   Cell[][]  = [];
  let emptyCol: boolean[] = [];
  let writers:  Writer[]  = [];
  let erasers:  Eraser[]  = [];
  let rows = 0;
  let cols = 0;
  let animationId = 0;

  function randomChar(): string {
    return CHARS[Math.floor(Math.random() * CHARS.length)]!;
  }

  function randomEraserLen(): number {
    return ERASER_LENGTH_MIN + Math.floor(Math.random() * (ERASER_LENGTH_MAX - ERASER_LENGTH_MIN + 1));
  }

  function randomSpeed(): number {
    return FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN);
  }

  function maxSpeedForCol(col: number, list: Writer[] | Eraser[], newY: number): number {
    let cap = Infinity;
    for (const item of list) {
      if (item.col === col && item.y > newY) cap = Math.min(cap, item.speed);
    }
    return cap;
  }

  function spawnWriter(col: number, y?: number): Writer {
    const startY = y ?? -(Math.random() * 3 * 60 * FALL_SPEED_MID);
    const speed  = Math.min(randomSpeed(), maxSpeedForCol(col, writers, startY));
    return { col, y: startY, speed, lastRow: -1 };
  }

  function spawnEraser(col: number, y?: number): Eraser {
    const startY = y ?? -(Math.random() * 2 * 60 * FALL_SPEED_MID);
    const speed  = Math.min(randomSpeed(), maxSpeedForCol(col, erasers, startY));
    return { col, y: startY, speed, length: randomEraserLen() };
  }

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cols = Math.floor(canvas.width  / FONT_SIZE);
    rows = Math.floor(canvas.height / FONT_SIZE);

    emptyCol = Array.from({ length: cols }, () => Math.random() < EMPTY_COL_CHANCE);
    cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, (_, c) =>
        emptyCol[c] || Math.random() >= 0.6
          ? { char: null, alpha: 0 }
          : { char: randomChar(), alpha: 0.8 }
      )
    );

    const writerDensity = Math.min(1, WRITER_SPAWN_CHANCE * (rows / FALL_SPEED_MID));
    writers = [];
    for (let c = 0; c < cols; c++) {
      if (!emptyCol[c] && Math.random() < writerDensity)
        writers.push({ col: c, y: -Math.random() * rows, speed: randomSpeed(), lastRow: -1 });
    }

    const eraserDensity = Math.min(1, ERASER_SPAWN_CHANCE * (rows / FALL_SPEED_MID));
    erasers = [];
    for (let c = 0; c < cols; c++) {
      if (Math.random() < eraserDensity)
        erasers.push({ col: c, y: -Math.random() * rows, speed: randomSpeed(), length: randomEraserLen() });
    }

    warmup();
    renderGrid();
  }

  function warmup() {
    const simFrames = Math.round(rows / FALL_SPEED_MID);
    for (let f = 0; f < simFrames; f++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r]![c]!;
          if (cell.char) {
            if (Math.random() < BLANK_CHANCE) { cell.char = null; cell.alpha = 0; continue; }
            if (Math.random() < MUTATE_CHANCE) cell.char = randomChar();
          } else {
            if (!emptyCol[c] && Math.random() < SPAWN_CHANCE) {
              cell.char  = randomChar();
              cell.alpha = 0.4 + Math.random() * 0.4;
            }
          }
        }
      }
      for (let i = erasers.length - 1; i >= 0; i--) {
        const e = erasers[i]!;
        e.y += e.speed;
        const headRow = Math.floor(e.y);
        for (let t = 0; t < e.length; t++) {
          const r = headRow - t;
          if (r < 0 || r >= rows) continue;
          const cell = cells[r]![e.col]!;
          if (!cell.char) continue;
          cell.alpha -= ERASER_STRENGTH;
          if (cell.alpha <= 0) { cell.char = null; cell.alpha = 0; }
        }
        if (e.y > rows + e.length) erasers.splice(i, 1);
      }
      for (let c = 0; c < cols; c++) {
        if (Math.random() < ERASER_SPAWN_CHANCE) erasers.push(spawnEraser(c));
      }
      for (let i = writers.length - 1; i >= 0; i--) {
        const w = writers[i]!;
        w.y += w.speed;
        const r = Math.floor(w.y);
        if (r >= 0 && r < rows && r !== w.lastRow && !emptyCol[w.col]) {
          cells[r]![w.col] = { char: randomChar(), alpha: 1.0 };
          w.lastRow = r;
        }
        if (w.y > rows) writers.splice(i, 1);
      }
      const occupied = new Set(writers.map((w) => w.col));
      for (let c = 0; c < cols; c++) {
        if (!emptyCol[c] && !occupied.has(c) && Math.random() < WRITER_SPAWN_CHANCE)
          writers.push(spawnWriter(c));
      }
    }
  }

  function renderGrid() {
    ctx.font = `${FONT_SIZE}px monospace`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r]![c]!;
        if (!cell.char || cell.alpha <= 0.01) continue;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(cell.alpha * BASE_ALPHA).toFixed(3)})`;
        ctx.fillText(cell.char, c * FONT_SIZE, (r + 1) * FONT_SIZE);
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FONT_SIZE}px monospace`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[r]![c]!;
        if (cell.char) {
          if (Math.random() < BLANK_CHANCE) { cell.char = null; cell.alpha = 0; continue; }
          if (Math.random() < MUTATE_CHANCE) cell.char = randomChar();
        } else {
          if (Math.random() < SPAWN_CHANCE) {
            cell.char  = randomChar();
            cell.alpha = 0.4 + Math.random() * 0.4;
          }
        }
      }
    }

    for (let i = erasers.length - 1; i >= 0; i--) {
      const e = erasers[i]!;
      e.y += e.speed;
      const headRow = Math.floor(e.y);
      for (let t = 0; t < e.length; t++) {
        const r = headRow - t;
        if (r < 0 || r >= rows) continue;
        const cell = cells[r]![e.col]!;
        if (!cell.char) continue;
        cell.alpha -= ERASER_STRENGTH;
        if (cell.alpha <= 0) { cell.char = null; cell.alpha = 0; }
      }
      if (e.y > rows + e.length) erasers.splice(i, 1);
    }
    for (let c = 0; c < cols; c++) {
      if (Math.random() < ERASER_SPAWN_CHANCE) erasers.push(spawnEraser(c));
    }

    for (let i = writers.length - 1; i >= 0; i--) {
      const w = writers[i]!;
      w.y += w.speed;
      const r = Math.floor(w.y);
      if (r >= 0 && r < rows && r !== w.lastRow) {
        cells[r]![w.col] = { char: randomChar(), alpha: 1.0 };
        w.lastRow = r;
      }
      if (w.y > rows) writers.splice(i, 1);
    }
    const occupied = new Set(writers.map((w) => w.col));
    for (let c = 0; c < cols; c++) {
      if (!occupied.has(c) && Math.random() < WRITER_SPAWN_CHANCE)
        writers.push(spawnWriter(c));
    }

    const headPositions = new Set<number>();
    for (const w of writers) {
      const r = Math.floor(w.y);
      if (r >= 0 && r < rows) headPositions.add(r * cols + w.col);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (headPositions.has(r * cols + c)) continue;
        const cell = cells[r]![c]!;
        if (!cell.char || cell.alpha <= 0.01) continue;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(cell.alpha * BASE_ALPHA).toFixed(3)})`;
        ctx.fillText(cell.char, c * FONT_SIZE, (r + 1) * FONT_SIZE);
      }
    }

    for (const w of writers) {
      const r = Math.floor(w.y);
      const x = w.col * FONT_SIZE;

      for (let t = 2; t <= 4; t++) {
        const tr = r - t;
        if (tr < 0 || tr >= rows) continue;
        const cell = cells[tr]![w.col]!;
        if (!cell.char) continue;
        const progress = (t - 2) / 3;
        const alpha = 0.9 - progress * (0.9 - BASE_ALPHA);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
        ctx.fillText(cell.char, x, (tr + 1) * FONT_SIZE);
      }

      if (r - 1 >= 0 && r - 1 < rows) {
        const cell = cells[r - 1]![w.col]!;
        if (cell.char) {
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.fillText(cell.char, x, r * FONT_SIZE);
        }
      }

      if (r >= 0 && r < rows) {
        const headChar = cells[r]![w.col]!.char;
        if (headChar) {
          const revealPx = Math.ceil((w.y - r) * FONT_SIZE);
          if (revealPx > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, r * FONT_SIZE, FONT_SIZE, revealPx);
            ctx.clip();
            ctx.fillStyle = `rgba(${hr},${hg},${hb},0.95)`;
            ctx.fillText(headChar, x, (r + 1) * FONT_SIZE);
            ctx.restore();
          }
        }
      }
    }
  }

  function draw() {
    tick();
    animationId = requestAnimationFrame(draw);
  }

  const onResize = () => init();
  window.addEventListener("resize", onResize);

  init();
  draw();

  return {
    destroy() {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    },
  };
}
