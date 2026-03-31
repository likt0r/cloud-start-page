<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null);
let animationId = 0;

const FONT_SIZE = 14;
const TAIL_ROWS = 24; // rows behind the drop still visibly fading; rows above are cleared to pure black
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵ" +
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

onMounted(() => {
  const el = canvas.value!;
  const ctx = el.getContext("2d")!;

  let drops: number[] = [];
  let frame = 0;
  const SPEED = 3; // advance drops every N frames

  function init() {
    el.width = window.innerWidth;
    el.height = window.innerHeight;
    ctx.clearRect(0, 0, el.width, el.height);
    const cols = Math.floor(el.width / FONT_SIZE);
    drops = Array.from({ length: cols }, () => Math.floor((Math.random() * -el.height) / FONT_SIZE));
  }

  init();

  const onResize = () => init();
  window.addEventListener("resize", onResize);

  function tick() {
    frame++;

    // Fade previous frame toward black every frame for smooth glow decay
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, el.width, el.height);

    // Only advance drops every SPEED frames
    if (frame % SPEED === 0) {
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Clear rows above the visible tail window to pure black
        const clearUntilRow = drops[i]! - TAIL_ROWS;
        if (clearUntilRow > 0) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(i * FONT_SIZE, 0, FONT_SIZE, clearUntilRow * FONT_SIZE);
        }

        if (drops[i]! < 0) {
          drops[i]!++;
          continue;
        }

        const x = i * FONT_SIZE;
        const y = drops[i]! * FONT_SIZE;

        // Bright white head
        ctx.fillStyle = "rgba(255, 240, 220, 0.95)";
        ctx.fillText(randomChar(), x, y);

        // Orange shoulder — overwrites last frame's white one row back
        if (drops[i]! > 0) {
          ctx.fillStyle = "#FF5E1F";
          ctx.fillText(randomChar(), x, (drops[i]! - 1) * FONT_SIZE);
        }

        // Randomly mutate 1-2 chars in the visible tail for the shimmer effect
        const tailStart = drops[i]! - TAIL_ROWS;
        if (tailStart >= 0) {
          const mutations = Math.random() < 0.5 ? 1 : 2;
          for (let m = 0; m < mutations; m++) {
            const mutRow = tailStart + Math.floor(Math.random() * (TAIL_ROWS - 2));
            ctx.fillStyle = "rgba(180, 80, 20, 0.45)";
            ctx.fillText(randomChar()!, x, mutRow * FONT_SIZE);
          }
        }

        drops[i]!++;

        // Reset when drop exits the bottom
        if (y > el.height + FONT_SIZE * TAIL_ROWS) {
          drops[i] = Math.floor(Math.random() * -50);
        }
      }
    }
  }

  function draw() {
    tick();
    animationId = requestAnimationFrame(draw);
  }

  // Pre-warm: simulate ~5s of frames so the screen starts populated
  const WARMUP_FRAMES = Math.round(60 * 7);
  for (let w = 0; w < WARMUP_FRAMES; w++) tick();

  draw();

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
  });
});
</script>

<template>
  <canvas ref="canvas" class="fixed inset-0 w-full h-full pointer-events-none" style="z-index: -1" />
</template>
