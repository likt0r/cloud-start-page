<script setup lang="ts">
import type { AdminCategory, AdminService, CompanionApp } from '~/composables/useAdminTree'

definePageMeta({ middleware: ['admin'], ssr: false })

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
} = useAdminTree()

function platformIcon(platform: string | null) {
  if (platform === 'android') return 'i-simple-icons-googleplay'
  if (platform === 'ios') return 'i-simple-icons-appstore'
  return 'i-lucide-smartphone'
}

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
  if (type === 'category') {
    await deleteCategory.mutateAsync(id)
  } else if (type === 'service') {
    await deleteService.mutateAsync(id)
  } else {
    await deleteCompanionApp.mutateAsync(id)
  }
  deleteModalOpen.value = false
  toast.add({ title: 'Deleted', color: 'neutral', icon: 'i-lucide-trash-2' })
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Admin — Services</h1>
      <UButton label="New Category" icon="i-lucide-plus" @click="openCreateCategory()" />
    </div>

    <!-- Loading -->
    <div v-if="query.isPending.value" class="flex flex-col gap-4">
      <USkeleton v-for="n in 3" :key="n" class="h-16 rounded-lg" />
    </div>

    <!-- Error -->
    <UAlert
      v-else-if="query.isError.value"
      color="error"
      title="Failed to load data"
      :description="query.error.value?.message"
      icon="i-lucide-circle-alert"
    />

    <!-- Tree -->
    <div v-else class="flex flex-col gap-4">
      <UCard v-for="cat in query.data.value" :key="cat.id">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon :name="cat.icon" class="size-5 text-primary shrink-0" />
            <span class="font-semibold text-lg flex-1">{{ cat.title }}</span>
            <UBadge :label="`order: ${cat.sortOrder}`" color="neutral" variant="subtle" size="sm" />
            <UButton
              icon="i-lucide-pencil"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="Edit category"
              @click="openEditCategory(cat)"
            />
            <UButton
              icon="i-lucide-trash-2"
              size="sm"
              color="error"
              variant="ghost"
              aria-label="Delete category"
              @click="confirmDelete('category', cat.id, cat.title)"
            />
          </div>
        </template>

        <!-- Services list -->
        <div class="flex flex-col divide-y divide-default">
          <div v-for="svc in cat.services" :key="svc.id">
            <!-- Service row -->
            <div class="flex items-center gap-3 py-3 px-1">
              <span class="font-medium flex-1">{{ svc.name }}</span>
              <a
                :href="svc.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-muted truncate max-w-48 hover:underline"
              >
                {{ svc.url }}
              </a>
              <UBadge
                v-if="svc.accessGroups.length"
                :label="`${svc.accessGroups.length} group(s)`"
                color="primary"
                variant="subtle"
                size="sm"
              />
              <UBadge :label="`order: ${svc.sortOrder}`" color="neutral" variant="subtle" size="sm" />
              <UButton
                icon="i-lucide-pencil"
                size="sm"
                color="neutral"
                variant="ghost"
                aria-label="Edit service"
                @click="openEditService(svc)"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="sm"
                color="error"
                variant="ghost"
                aria-label="Delete service"
                @click="confirmDelete('service', svc.id, svc.name)"
              />
            </div>

            <!-- Companion apps sub-list -->
            <div class="pl-8 pb-2 flex flex-col gap-0.5">
              <div
                v-for="app in svc.companionApps"
                :key="app.id"
                class="flex items-center gap-2 py-1 text-sm"
              >
                <UIcon :name="platformIcon(app.platform)" class="size-4 shrink-0 text-muted" />
                <span class="flex-1">{{ app.name }}</span>
                <UBadge v-if="app.platform" :label="app.platform" color="neutral" variant="subtle" size="xs" />
                <UButton
                  icon="i-lucide-pencil"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  aria-label="Edit app"
                  @click="openEditApp(app)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  size="xs"
                  color="error"
                  variant="ghost"
                  aria-label="Delete app"
                  @click="confirmDelete('companion-app', app.id, app.name)"
                />
              </div>
              <UButton
                label="Add App"
                icon="i-lucide-plus"
                size="xs"
                variant="ghost"
                @click="openCreateApp(svc.id)"
              />
            </div>
          </div>

          <p v-if="!cat.services.length" class="py-3 px-1 text-sm text-muted">
            No services yet.
          </p>
        </div>

        <template #footer>
          <UButton
            label="Add Service"
            icon="i-lucide-plus"
            size="sm"
            variant="ghost"
            @click="openCreateService(cat.id)"
          />
        </template>
      </UCard>

      <div v-if="!query.data.value?.length" class="text-center text-muted py-16">
        No categories yet. Create one to get started.
      </div>
    </div>

    <!-- Category modal -->
    <AdminCategoryModal
      v-model:open="catModalOpen"
      :category="editingCategory"
      :create-mutation="createCategory"
      :update-mutation="updateCategory"
      @saved="onCategorySaved"
    />

    <!-- Service modal -->
    <AdminServiceModal
      v-model:open="svcModalOpen"
      :service="editingService"
      :categories="query.data.value ?? []"
      :default-category-id="defaultCategoryId"
      :create-mutation="createService"
      :update-mutation="updateService"
      @saved="onServiceSaved"
    />

    <!-- Companion app modal -->
    <AdminCompanionAppModal
      v-model:open="appModalOpen"
      :app="editingApp"
      :service-id="defaultServiceId"
      :create-mutation="createCompanionApp"
      :update-mutation="updateCompanionApp"
      @saved="onAppSaved"
    />

    <!-- Delete confirmation modal -->
    <UModal v-model:open="deleteModalOpen" title="Confirm Delete">
      <template #body>
        <p class="text-sm">
          Delete <strong>{{ deleteTarget?.name }}</strong>?
          <template v-if="deleteTarget?.type === 'category'">
            <br />
            <span class="text-muted">This will also delete all services in this category.</span>
          </template>
          This cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="deleteModalOpen = false"
          />
          <UButton
            label="Delete"
            color="error"
            :loading="isDeleting"
            @click="executeDelete()"
          />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
