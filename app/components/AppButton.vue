<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variant = computed(() => attrs.variant as string | undefined);
const isSolid = computed(() => !variant.value || variant.value === "solid");
const isOutline = computed(() => variant.value === "outline");
</script>

<template>
  <UButton
    v-bind="$attrs"
    class="cursor-pointer transition-all"
    :class="
      isOutline
        ? 'backdrop-blur-md bg-white/1 hover:bg-white/6 active:primary/20'
        : isSolid
        ? 'hover:brightness-115 active:brightness-85'
        : 'hover:bg-current/15 active:bg-current/30'
    "
  />
</template>
