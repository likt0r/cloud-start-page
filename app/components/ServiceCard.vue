<script setup lang="ts">
interface Service {
  id: number;
  name: string;
  url: string;
  imagePath: string | null;
  description: string | null;
  companionApps: { id: number; name: string; platform: string | null; storeUrl: string | null }[];
}

defineProps<{ service: Service }>();

function platformIcon(platform: string | null) {
  if (platform === "android") return "i-simple-icons-android";
  if (platform === "ios") return "i-simple-icons-appstore";
  if (platform === "windows") return "i-simple-icons-windows";
  if (platform === "linux") return "i-simple-icons-linux";
  if (platform === "macos") return "i-simple-icons-apple";
  if (platform === "pc") return "i-lucide-monitor";
  return "i-lucide-smartphone";
}
</script>

<template>
  <UCard
    class="flex flex-col gap-2 transition-all duration-200 hover:brightness-135"
    :ui="{ body: 'flex flex-col gap-2 h-full' }"
  >
    <a
      :href="service.url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 min-w-0 group"
    >
      <img
        v-if="service.imagePath"
        :src="service.imagePath"
        :alt="service.name"
        class="h-6 w-6 object-contain rounded shrink-0"
      />
      <span class="font-medium leading-tight flex-1 group-hover:text-primary">{{ service.name }}</span>
      <UIcon name="i-lucide-external-link" class="shrink-0 text-primary" />
    </a>

    <p v-if="service.description" class="text-sm text-muted leading-snug">
      {{ service.description }}
    </p>

    <div v-if="service.companionApps?.length" class="flex items-center justify-end gap-1 mt-auto pt-2">
      <AppButton
        v-for="app in service.companionApps"
        :key="app.id"
        :to="app.storeUrl ?? undefined"
        target="_blank"
        rel="noopener noreferrer"
        :icon="platformIcon(app.platform)"
        :aria-label="app.name"
        color="neutral"
        variant="ghost"
        size="xs"
      />
    </div>
  </UCard>
</template>
