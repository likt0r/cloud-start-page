<script setup lang="ts">
import type { AdminService } from "~/composables/useAdminTree";

defineProps<{ service: AdminService }>();

const emit = defineEmits<{
  edit: [service: AdminService];
  delete: [type: "service", id: number, name: string];
}>();
</script>

<template>
  <div class="flex items-start gap-3 py-3 px-1">
    <img
      v-if="service.imagePath"
      :src="service.imagePath"
      :alt="service.name"
      class="h-6 w-6 rounded object-contain shrink-0 mt-0.5"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="font-medium">{{ service.name }}</span>
        <a
          :href="service.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-muted truncate max-w-48 hover:underline"
        >
          {{ service.url }}
        </a>
      </div>
      <p v-if="service.description" class="text-xs text-muted mt-0.5">{{ service.description }}</p>
      <div v-if="service.accessGroups.length" class="flex flex-wrap gap-1 mt-1">
        <UBadge
          v-for="group in service.accessGroups"
          :key="group.keycloakGroup"
          :label="group.keycloakGroup"
          color="secondary"
          variant="subtle"
          size="xs"
        />
      </div>
    </div>
    <div class="flex items-center gap-1 ml-auto shrink-0">
      <UBadge :label="`order: ${service.sortOrder}`" color="neutral" variant="subtle" size="sm" />
      <AppButton
        icon="i-lucide-pencil"
        size="sm"
        color="neutral"
        variant="ghost"
        aria-label="Edit service"
        @click="emit('edit', service)"
      />
      <AppButton
        icon="i-lucide-trash-2"
        size="sm"
        color="error"
        variant="ghost"
        aria-label="Delete service"
        @click="emit('delete', 'service', service.id, service.name)"
      />
    </div>
  </div>
</template>
