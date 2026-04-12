<script setup lang="ts">
import { createMatrixRain } from "matrix-rain";

const canvas = ref<HTMLCanvasElement | null>(null);
let controller: ReturnType<typeof createMatrixRain> | null = null;

onMounted(() => {
  controller = createMatrixRain(canvas.value!, { color: [255, 94, 31], headColor: [255, 240, 220] });
});

onUnmounted(() => {
  controller?.destroy();
  controller = null;
});
</script>

<template>
  <canvas ref="canvas" class="fixed inset-0 w-full h-full pointer-events-none" style="z-index: -1" />
</template>
