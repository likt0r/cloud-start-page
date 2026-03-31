<script setup lang="ts">
import type { AdminCategory, AdminService, ServiceFormPayload } from '~/composables/useAdminTree'
import type { UseMutationReturnType } from '@tanstack/vue-query'

const props = defineProps<{
  open: boolean
  service: AdminService | null
  categories: AdminCategory[]
  defaultCategoryId?: number
  createMutation: UseMutationReturnType<unknown, Error, ServiceFormPayload, unknown>
  updateMutation: UseMutationReturnType<unknown, Error, { id: number } & ServiceFormPayload, unknown>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const form = reactive({
  categoryId: 0,
  name: '',
  url: '',
  description: '',
  imagePath: '',
  sortOrder: 0,
  accessGroups: [] as string[]
})

const imageFile = ref<File | null>(null)
const imageUploading = ref(false)
const imageError = ref('')

watch(
  () => [props.open, props.service] as const,
  ([open]) => {
    if (open) {
      form.categoryId = props.service?.categoryId ?? props.defaultCategoryId ?? props.categories[0]?.id ?? 0
      form.name = props.service?.name ?? ''
      form.url = props.service?.url ?? ''
      form.description = props.service?.description ?? ''
      form.imagePath = props.service?.imagePath ?? ''
      form.sortOrder = props.service?.sortOrder ?? 0
      form.accessGroups = props.service?.accessGroups.map((g) => g.keycloakGroup) ?? []
      imageFile.value = null
      imageError.value = ''
    }
  }
)

watch(imageFile, async (file) => {
  if (!file) return
  imageUploading.value = true
  imageError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { path } = await $fetch<{ path: string }>('/api/admin/upload', { method: 'POST', body: fd })
    form.imagePath = path
  } catch (e: any) {
    imageError.value = e?.data?.message ?? 'Upload failed'
    imageFile.value = null
  } finally {
    imageUploading.value = false
  }
})

const categoryOptions = computed(() =>
  props.categories.map((c) => ({ label: c.title, value: c.id }))
)

type FormError = { name: string; message: string }

function validate(state: typeof form): FormError[] {
  const errors: FormError[] = []
  if (!state.categoryId) errors.push({ name: 'categoryId', message: 'Required' })
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  if (!state.url) errors.push({ name: 'url', message: 'Required' })
  return errors
}

const isPending = computed(
  () => props.createMutation.isPending.value || props.updateMutation.isPending.value
)

async function onSubmit() {
  const payload: ServiceFormPayload = {
    categoryId: form.categoryId,
    name: form.name,
    url: form.url,
    description: form.description || null,
    imagePath: form.imagePath || null,
    sortOrder: form.sortOrder,
    accessGroups: form.accessGroups
  }
  if (props.service) {
    await props.updateMutation.mutateAsync({ id: props.service.id, ...payload })
  } else {
    await props.createMutation.mutateAsync(payload)
  }
  emit('saved')
}
</script>

<template>
  <UModal
    :open="open"
    :title="service ? 'Edit Service' : 'New Service'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <UForm :state="form" :validate="validate" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField label="Category" name="categoryId" required>
          <USelect v-model="form.categoryId" :items="categoryOptions" class="w-full" />
        </UFormField>

        <UFormField label="Name" name="name" required>
          <UInput v-model="form.name" placeholder="Gitea" class="w-full" />
        </UFormField>

        <UFormField label="URL" name="url" required>
          <UInput v-model="form.url" placeholder="https://git.example.com" type="url" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea v-model="form.description" placeholder="Short description…" :rows="3" class="w-full" />
        </UFormField>

        <UFormField label="Logo" name="imagePath">
          <div class="flex items-center gap-3">
            <img
              v-if="form.imagePath && !imageFile"
              :src="form.imagePath"
              :alt="form.name"
              class="h-10 w-10 rounded object-contain bg-elevated shrink-0"
            />
            <UFileUpload
              v-model="imageFile"
              variant="button"
              accept="image/*"
              :disabled="imageUploading"
              :label="imageUploading ? 'Uploading…' : (form.imagePath ? 'Replace image' : 'Choose image')"
            />
            <AppButton
              v-if="form.imagePath"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Remove image"
              @click="form.imagePath = ''; imageFile = null"
            />
          </div>
          <p v-if="imageError" class="text-[var(--ui-color-error-500)] text-xs mt-1">{{ imageError }}</p>
        </UFormField>

        <UFormField label="Sort Order" name="sortOrder">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </UFormField>

        <UFormField label="Access Groups" name="accessGroups">
          <UInputTags v-model="form.accessGroups" placeholder="Add a Keycloak group…" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="$emit('update:open', false)"
          />
          <AppButton
            type="submit"
            :label="service ? 'Save' : 'Create'"
            :loading="isPending"
            :disabled="imageUploading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
