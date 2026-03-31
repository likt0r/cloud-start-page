<script setup lang="ts">
defineProps<{
  open: boolean
  target: { type: 'category' | 'service' | 'companion-app'; id: number; name: string } | null
  isDeleting: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <UModal :open="open" title="Confirm Delete" @update:open="emit('update:open', $event)">
    <template #body>
      <p class="text-sm">
        Delete <strong>{{ target?.name }}</strong>?
        <template v-if="target?.type === 'category'">
          <br />
          <span class="text-muted">This will also delete all services in this category.</span>
        </template>
        This cannot be undone.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="emit('update:open', false)"
        />
        <AppButton
          label="Delete"
          color="error"
          :loading="isDeleting"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
