<script setup lang="ts">
import type { AdminCategory, AdminService, CompanionApp } from "~/composables/useAdminTree";
import type { Group } from "~/composables/useAdminGroups";

definePageMeta({ middleware: ["admin"], ssr: false });

const {
  query,
  createCategory,
  updateCategory,
  deleteCategory,
  createService,
  updateService,
  deleteService,
  createCompanionApp,
  updateCompanionApp,
  deleteCompanionApp
} = useAdminTree();

const { query: groupsQuery, createGroup, updateGroup, deleteGroup } = useAdminGroups();

const toast = useToast();

// --- Category modal ---
const catModalOpen = ref(false);
const editingCategory = ref<AdminCategory | null>(null);

function openCreateCategory() {
  editingCategory.value = null;
  catModalOpen.value = true;
}

function openEditCategory(cat: AdminCategory) {
  editingCategory.value = cat;
  catModalOpen.value = true;
}

function onCategorySaved() {
  catModalOpen.value = false;
  toast.add({ title: "Category saved", color: "success", icon: "i-lucide-check" });
}

// --- Service modal ---
const svcModalOpen = ref(false);
const editingService = ref<AdminService | null>(null);
const defaultCategoryId = ref<number | undefined>();

function openCreateService(categoryId: number) {
  editingService.value = null;
  defaultCategoryId.value = categoryId;
  svcModalOpen.value = true;
}

function openEditService(svc: AdminService) {
  editingService.value = svc;
  defaultCategoryId.value = undefined;
  svcModalOpen.value = true;
}

function onServiceSaved() {
  svcModalOpen.value = false;
  toast.add({ title: "Service saved", color: "success", icon: "i-lucide-check" });
}

// --- Companion app modal ---
const appModalOpen = ref(false);
const editingApp = ref<CompanionApp | null>(null);
const defaultServiceId = ref(0);

function openCreateApp(serviceId: number) {
  editingApp.value = null;
  defaultServiceId.value = serviceId;
  appModalOpen.value = true;
}

function openEditApp(app: CompanionApp) {
  editingApp.value = app;
  defaultServiceId.value = app.serviceId;
  appModalOpen.value = true;
}

function onAppSaved() {
  appModalOpen.value = false;
  toast.add({ title: "App saved", color: "success", icon: "i-lucide-check" });
}

// --- Group modal ---
const groupModalOpen = ref(false);
const editingGroup = ref<Group | null>(null);

function openCreateGroup() {
  editingGroup.value = null;
  groupModalOpen.value = true;
}

function openEditGroup(group: Group) {
  editingGroup.value = group;
  groupModalOpen.value = true;
}

function onGroupSaved() {
  groupModalOpen.value = false;
  toast.add({ title: "Group saved", color: "success", icon: "i-lucide-check" });
}

// --- Delete confirmation ---
const deleteTarget = ref<{
  type: "category" | "service" | "companion-app" | "group";
  id: number;
  name: string;
} | null>(null);
const deleteModalOpen = ref(false);

function confirmDelete(type: "category" | "service" | "companion-app" | "group", id: number, name: string) {
  deleteTarget.value = { type, id, name };
  deleteModalOpen.value = true;
}

const isDeleting = computed(
  () =>
    deleteCategory.isPending.value ||
    deleteService.isPending.value ||
    deleteCompanionApp.isPending.value ||
    deleteGroup.isPending.value
);

async function executeDelete() {
  if (!deleteTarget.value) return;
  const { type, id } = deleteTarget.value;
  if (type === "category") await deleteCategory.mutateAsync(id);
  else if (type === "service") await deleteService.mutateAsync(id);
  else if (type === "group") await deleteGroup.mutateAsync(id);
  else await deleteCompanionApp.mutateAsync(id);
  deleteModalOpen.value = false;
  toast.add({ title: "Deleted", color: "neutral", icon: "i-lucide-trash-2" });
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Admin — Services</h1>
      <AppButton label="New Category" icon="i-lucide-plus" variant="outline" @click="openCreateCategory()" />
    </div>

    <div v-if="query.isPending.value" class="flex flex-col gap-4">
      <USkeleton v-for="n in 3" :key="n" class="h-16 rounded-lg" />
    </div>

    <UAlert
      v-else-if="query.isError.value"
      color="error"
      title="Failed to load data"
      :description="query.error.value?.message"
      icon="i-lucide-circle-alert"
    />

    <div v-else class="flex flex-col gap-4">
      <AdminCategoryCard
        v-for="cat in query.data.value"
        :key="cat.id"
        :cat="cat"
        @edit="openEditCategory"
        @delete="confirmDelete"
        @addService="openCreateService"
        @editService="openEditService"
        @editApp="openEditApp"
        @addApp="openCreateApp"
      />
      <div v-if="!query.data.value?.length" class="text-center text-muted py-16">
        No categories yet. Create one to get started.
      </div>
    </div>

    <div class="mt-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Groups</h2>
        <AppButton label="New Group" icon="i-lucide-plus" variant="outline" @click="openCreateGroup()" />
      </div>
      <AdminGroupsTable
        :groups="groupsQuery.data.value ?? []"
        :isLoading="groupsQuery.isPending.value"
        @edit="openEditGroup"
        @delete="(g) => confirmDelete('group', g.id, g.name)"
      />
    </div>

    <AdminGroupModal
      v-model:open="groupModalOpen"
      :group="editingGroup"
      :createMutation="createGroup"
      :updateMutation="updateGroup"
      @saved="onGroupSaved"
    />

    <AdminCategoryModal
      v-model:open="catModalOpen"
      :category="editingCategory"
      :createMutation="createCategory"
      :updateMutation="updateCategory"
      @saved="onCategorySaved"
    />

    <AdminServiceModal
      v-model:open="svcModalOpen"
      :service="editingService"
      :categories="query.data.value ?? []"
      :groups="groupsQuery.data.value ?? []"
      :defaultCategoryId="defaultCategoryId"
      :createMutation="createService"
      :updateMutation="updateService"
      @saved="onServiceSaved"
    />

    <AdminCompanionAppModal
      v-model:open="appModalOpen"
      :app="editingApp"
      :serviceId="defaultServiceId"
      :createMutation="createCompanionApp"
      :updateMutation="updateCompanionApp"
      @saved="onAppSaved"
    />

    <AdminDeleteModal
      v-model:open="deleteModalOpen"
      :target="deleteTarget"
      :isDeleting="isDeleting"
      @confirm="executeDelete"
    />
  </UContainer>
</template>
