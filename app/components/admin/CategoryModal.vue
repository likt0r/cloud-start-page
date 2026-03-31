<script setup lang="ts">
import type { AdminCategory } from "~/composables/useAdminTree";
import type { UseMutationReturnType } from "@tanstack/vue-query";

const props = defineProps<{
  open: boolean;
  category: AdminCategory | null;
  createMutation: UseMutationReturnType<
    unknown,
    Error,
    { title: string; icon: string; sortOrder: number },
    unknown
  >;
  updateMutation: UseMutationReturnType<
    unknown,
    Error,
    { id: number; title: string; icon: string; sortOrder: number },
    unknown
  >;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  saved: [];
}>();

const form = reactive({ title: "", icon: "", sortOrder: 0 });

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.title = props.category?.title ?? "";
      form.icon = props.category?.icon ?? "";
      form.sortOrder = props.category?.sortOrder ?? 0;
    }
  }
);

type FormError = { name: string; message: string };

function validate(state: typeof form): FormError[] {
  const errors: FormError[] = [];
  if (!state.title) errors.push({ name: "title", message: "Required" });
  if (!state.icon) errors.push({ name: "icon", message: "Required" });
  return errors;
}

const isPending = computed(
  () => props.createMutation.isPending.value || props.updateMutation.isPending.value
);

async function onSubmit() {
  if (props.category) {
    await props.updateMutation.mutateAsync({ id: props.category.id, ...form });
  } else {
    await props.createMutation.mutateAsync({ ...form });
  }
  emit("saved");
}
</script>

<template>
  <UModal
    :open="open"
    :title="category ? 'Edit Category' : 'New Category'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <UForm :state="form" :validate="validate" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField label="Title" name="title" required>
          <UInput v-model="form.title" placeholder="Infrastructure" class="w-full" />
        </UFormField>

        <UFormField label="Icon" name="icon" required>
          <div class="flex items-center gap-2">
            <UInput v-model="form.icon" placeholder="i-lucide-server" class="flex-1" />
            <UIcon v-if="form.icon" :name="form.icon" class="size-5 shrink-0 text-primary" />
          </div>
        </UFormField>

        <UFormField label="Sort Order" name="sortOrder">
          <UInputNumber v-model="form.sortOrder" :min="0" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton label="Cancel" color="neutral" variant="ghost" @click="$emit('update:open', false)" />
          <AppButton type="submit" :label="category ? 'Save' : 'Create'" :loading="isPending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
