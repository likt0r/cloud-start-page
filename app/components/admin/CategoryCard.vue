<script setup lang="ts">
import type { AdminCategory, AdminService, CompanionApp } from "~/composables/useAdminTree";

defineProps<{ cat: AdminCategory }>();

const emit = defineEmits<{
  edit: [cat: AdminCategory];
  delete: [type: "category" | "service" | "companion-app", id: number, name: string];
  "add-service": [categoryId: number];
  "edit-service": [service: AdminService];
  "edit-app": [app: CompanionApp];
  "add-app": [serviceId: number];
}>();
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon :name="cat.icon" class="size-5 text-primary shrink-0" />
        <span class="font-semibold text-lg flex-1">{{ cat.title }}</span>
        <UBadge :label="`order: ${cat.sortOrder}`" color="neutral" variant="subtle" size="sm" />
        <AppButton
          icon="i-lucide-pencil"
          size="sm"
          color="neutral"
          variant="ghost"
          aria-label="Edit category"
          @click="emit('edit', cat)"
        />
        <AppButton
          icon="i-lucide-trash-2"
          size="sm"
          color="error"
          variant="ghost"
          aria-label="Delete category"
          @click="emit('delete', 'category', cat.id, cat.title)"
        />
      </div>
    </template>

    <div class="flex flex-col divide-y divide-default">
      <AdminCategoryRow
        v-for="svc in cat.services"
        :key="svc.id"
        :service="svc"
        @edit="emit('edit-service', $event)"
        @delete="(type, id, name) => emit('delete', type, id, name)"
        @editApp="emit('edit-app', $event)"
        @addApp="emit('add-app', $event)"
      />
      <p v-if="!cat.services.length" class="py-3 px-1 text-sm text-muted">No services yet.</p>
    </div>

    <template #footer>
      <AppButton
        label="Add Service"
        icon="i-lucide-plus"
        size="sm"
        variant="ghost"
        @click="emit('add-service', cat.id)"
      />
    </template>
  </UCard>
</template>
