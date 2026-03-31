<script setup lang="ts">
import type { AdminCategory, AdminService, CompanionApp } from '~/composables/useAdminTree'

definePageMeta({ middleware: ['admin'], ssr: false })

const {
  query,
  createCategory, updateCategory, deleteCategory,
  createService, updateService, deleteService,
  createCompanionApp, updateCompanionApp, deleteCompanionApp
} = useAdminTree()

const toast = useToast()

// --- Category modal ---
const catModalOpen = ref(false)
const editingCategory = ref<AdminCategory | null>(null)

function openCreateCategory() {
  editingCategory.value = null
  catModalOpen.value = true
}

function openEditCategory(cat: AdminCategory) {
  editingCategory.value = cat
  catModalOpen.value = true
}

function onCategorySaved() {
  catModalOpen.value = false
  toast.add({ title: 'Category saved', color: 'success', icon: 'i-lucide-check' })
}

// --- Service modal ---
const svcModalOpen = ref(false)
const editingService = ref<AdminService | null>(null)
const defaultCategoryId = ref<number | undefined>()

function openCreateService(categoryId: number) {
  editingService.value = null
  defaultCategoryId.value = categoryId
  svcModalOpen.value = true
}

function openEditService(svc: AdminService) {
  editingService.value = svc
  defaultCategoryId.value = undefined
  svcModalOpen.value = true
}

function onServiceSaved() {
  svcModalOpen.value = false
  toast.add({ title: 'Service saved', color: 'success', icon: 'i-lucide-check' })
}

// --- Companion app modal ---
const appModalOpen = ref(false)
const editingApp = ref<CompanionApp | null>(null)
const defaultServiceId = ref(0)

function openCreateApp(serviceId: number) {
  editingApp.value = null
  defaultServiceId.value = serviceId
  appModalOpen.value = true
}

function openEditApp(app: CompanionApp) {
  editingApp.value = app
  defaultServiceId.value = app.serviceId
  appModalOpen.value = true
}

function onAppSaved() {
  appModalOpen.value = false
  toast.add({ title: 'App saved', color: 'success', icon: 'i-lucide-check' })
}

// --- Delete confirmation ---
const deleteTarget = ref<{ type: 'category' | 'service' | 'companion-app'; id: number; name: string } | null>(null)
const deleteModalOpen = ref(false)

function confirmDelete(type: 'category' | 'service' | 'companion-app', id: number, name: string) {
  deleteTarget.value = { type, id, name }
  deleteModalOpen.value = true
}

const isDeleting = computed(
  () => deleteCategory.isPending.value || deleteService.isPending.value || deleteCompanionApp.isPending.value
)

async function executeDelete() {
  if (!deleteTarget.value) return
  const { type, id } = deleteTarget.value
  if (type === 'category') await deleteCategory.mutateAsync(id)
  else if (type === 'service') await deleteService.mutateAsync(id)
  else await deleteCompanionApp.mutateAsync(id)
  deleteModalOpen.value = false
  toast.add({ title: 'Deleted', color: 'neutral', icon: 'i-lucide-trash-2' })
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
        @add-service="openCreateService"
        @edit-service="openEditService"
        @edit-app="openEditApp"
        @add-app="openCreateApp"
      />
      <div v-if="!query.data.value?.length" class="text-center text-muted py-16">
        No categories yet. Create one to get started.
      </div>
    </div>

    <AdminCategoryModal
      v-model:open="catModalOpen"
      :category="editingCategory"
      :create-mutation="createCategory"
      :update-mutation="updateCategory"
      @saved="onCategorySaved"
    />

    <AdminServiceModal
      v-model:open="svcModalOpen"
      :service="editingService"
      :categories="query.data.value ?? []"
      :default-category-id="defaultCategoryId"
      :create-mutation="createService"
      :update-mutation="updateService"
      @saved="onServiceSaved"
    />

    <AdminCompanionAppModal
      v-model:open="appModalOpen"
      :app="editingApp"
      :service-id="defaultServiceId"
      :create-mutation="createCompanionApp"
      :update-mutation="updateCompanionApp"
      @saved="onAppSaved"
    />

    <AdminDeleteModal
      v-model:open="deleteModalOpen"
      :target="deleteTarget"
      :is-deleting="isDeleting"
      @confirm="executeDelete"
    />
  </UContainer>
</template>
