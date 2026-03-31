<script setup lang="ts">
import type { CompanionApp } from '~/composables/useAdminTree'

defineProps<{ app: CompanionApp }>()

const emit = defineEmits<{
  edit: [app: CompanionApp]
  delete: [type: 'companion-app', id: number, name: string]
}>()

function platformIcon(platform: string | null) {
  if (platform === 'android') return 'i-simple-icons-googleplay'
  if (platform === 'ios') return 'i-simple-icons-appstore'
  return 'i-lucide-smartphone'
}
</script>

<template>
  <div class="flex items-center gap-2 py-1 text-sm">
    <UIcon :name="platformIcon(app.platform)" class="size-4 shrink-0 text-muted" />
    <span class="font-medium">{{ app.name }}</span>
    <a
      v-if="app.storeUrl"
      :href="app.storeUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="text-muted truncate max-w-48 hover:underline"
    >
      {{ app.storeUrl }}
    </a>
    <div class="flex items-center gap-1 ml-auto shrink-0">
      <UBadge v-if="app.platform" :label="app.platform" color="neutral" variant="subtle" size="xs" />
      <AppButton
        icon="i-lucide-pencil"
        size="xs"
        color="neutral"
        variant="ghost"
        aria-label="Edit app"
        @click="emit('edit', app)"
      />
      <AppButton
        icon="i-lucide-trash-2"
        size="xs"
        color="error"
        variant="ghost"
        aria-label="Delete app"
        @click="emit('delete', 'companion-app', app.id, app.name)"
      />
    </div>
  </div>
</template>
