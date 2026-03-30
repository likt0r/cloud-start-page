<script setup lang="ts">
import type { CompanionApp, CompanionAppFormPayload } from '~/composables/useAdminTree'
import type { UseMutationReturnType } from '@tanstack/vue-query'

const props = defineProps<{
  open: boolean
  app: CompanionApp | null
  serviceId: number
  createMutation: UseMutationReturnType<unknown, Error, CompanionAppFormPayload, unknown>
  updateMutation: UseMutationReturnType<unknown, Error, { id: number } & Omit<CompanionAppFormPayload, 'serviceId'>, unknown>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const platformOptions = [
  { label: '—', value: null },
  { label: 'Android (Play Store)', value: 'android' },
  { label: 'iOS (App Store)', value: 'ios' }
]

function platformIcon(platform: string | null) {
  if (platform === 'android') return 'i-simple-icons-googleplay'
  if (platform === 'ios') return 'i-simple-icons-appstore'
  return 'i-lucide-smartphone'
}

const form = reactive({ name: '', platform: null as string | null, storeUrl: '' })

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.name = props.app?.name ?? ''
      form.platform = props.app?.platform ?? null
      form.storeUrl = props.app?.storeUrl ?? ''
    }
  }
)

type FormError = { name: string; message: string }

function validate(state: typeof form): FormError[] {
  const errors: FormError[] = []
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  return errors
}

const isPending = computed(
  () => props.createMutation.isPending.value || props.updateMutation.isPending.value
)

async function onSubmit() {
  const payload = {
    name: form.name,
    platform: form.platform,
    storeUrl: form.storeUrl || null
  }
  if (props.app) {
    await props.updateMutation.mutateAsync({ id: props.app.id, ...payload })
  } else {
    await props.createMutation.mutateAsync({ serviceId: props.serviceId, ...payload })
  }
  emit('saved')
}
</script>

<template>
  <UModal
    :open="open"
    :title="app ? 'Edit Companion App' : 'New Companion App'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <UForm :state="form" :validate="validate" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="form.name" placeholder="My App" class="w-full" />
        </UFormField>

        <UFormField label="Platform" name="platform">
          <div class="flex items-center gap-2">
            <USelect v-model="form.platform" :items="platformOptions" class="flex-1" />
            <UIcon :name="platformIcon(form.platform)" class="size-5 shrink-0 text-muted" />
          </div>
        </UFormField>

        <UFormField label="Store URL" name="storeUrl">
          <UInput v-model="form.storeUrl" placeholder="https://play.google.com/…" class="w-full" />
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
            :label="app ? 'Save' : 'Create'"
            :loading="isPending"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
