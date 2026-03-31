<script setup lang="ts">
import type { Group } from "~/composables/useAdminGroups";

defineProps<{
  groups: Group[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  edit: [group: Group];
  delete: [group: Group];
}>();
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex flex-col gap-2">
      <USkeleton v-for="n in 3" :key="n" class="h-10 rounded-lg" />
    </div>
    <div v-else-if="!groups.length" class="text-center text-muted py-8">
      No groups yet. Create one to restrict service access.
    </div>
    <UCard v-else>
      <div class="flex flex-col divide-y divide-default">
        <div v-for="group in groups" :key="group.id" class="flex items-center gap-3 py-2 px-1">
          <UIcon name="i-lucide-users" class="size-4 text-muted shrink-0" />
          <span class="flex-1 font-medium">{{ group.name }}</span>
          <div class="flex items-center gap-1">
            <AppButton
              icon="i-lucide-pencil"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="Edit group"
              @click="emit('edit', group)"
            />
            <AppButton
              icon="i-lucide-trash-2"
              size="sm"
              color="error"
              variant="ghost"
              aria-label="Delete group"
              @click="emit('delete', group)"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
