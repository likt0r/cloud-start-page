<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
}>();
</script>

<template>
  <section>
    <div class="flex items-center gap-2 mb-4">
      <UIcon :name="icon" class="size-5 text-muted" />
      <h2 class="text-lg font-medium">{{ title }}</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <slot />
    </div>
  </section>
</template>
