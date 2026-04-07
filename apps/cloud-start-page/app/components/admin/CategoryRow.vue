<script setup lang="ts">
import type { AdminService, CompanionApp } from "~/composables/useAdminTree";

defineProps<{ service: AdminService }>();

const emit = defineEmits<{
  edit: [service: AdminService];
  delete: [type: "service" | "companion-app", id: number, name: string];
  "edit-app": [app: CompanionApp];
  "add-app": [serviceId: number];
}>();
</script>

<template>
  <div>
    <AdminServiceRow
      :service="service"
      @edit="emit('edit', $event)"
      @delete="(type, id, name) => emit('delete', type, id, name)"
    />

    <!-- Companion apps sub-list -->
    <div class="pl-8 pb-2 flex flex-col gap-0.5">
      <AdminCompanionAppRow
        v-for="app in service.companionApps"
        :key="app.id"
        :app="app"
        @edit="emit('edit-app', $event)"
        @delete="(type, id, name) => emit('delete', type, id, name)"
      />
      <div class="flex justify-end">
        <AppButton
          label="Add App"
          icon="i-lucide-plus"
          size="xs"
          variant="ghost"
          @click="emit('add-app', service.id)"
        />
      </div>
    </div>
  </div>
</template>
