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

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.categoryId = props.service?.categoryId ?? props.defaultCategoryId ?? props.categories[0]?.id ?? 0
      form.name = props.service?.name ?? ''
      form.url = props.service?.url ?? ''
      form.description = props.service?.description ?? ''
      form.imagePath = props.service?.imagePath ?? ''
      form.sortOrder = props.service?.sortOrder ?? 0
      form.accessGroups = props.service?.accessGroups.map((g) => g.keycloakGroup) ?? []
    }
  }
)

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

        <UFormField label="Image Path" name="imagePath">
          <UInput v-model="form.imagePath" placeholder="/img/gitea.png" class="w-full" />
        </UFormField>

        <UFormField label="Sort Order" name="sortOrder">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </UFormField>

        <UFormField label="Access Groups" name="accessGroups">
          <UInputTags v-model="form.accessGroups" placeholder="Add a Keycloak group…" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="$emit('update:open', false)"
          />
          <UButton
            type="submit"
            :label="service ? 'Save' : 'Create'"
            :loading="isPending"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
