<script setup lang="ts">
import type { Group } from "~/composables/useAdminGroups";
import type { UseMutationReturnType } from "@tanstack/vue-query";

const props = defineProps<{
  open: boolean;
  group: Group | null;
  createMutation: UseMutationReturnType<unknown, Error, { name: string }, unknown>;
  updateMutation: UseMutationReturnType<unknown, Error, { id: number; name: string }, unknown>;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  saved: [];
}>();

const form = reactive({ name: "" });

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.name = props.group?.name ?? "";
    }
  }
);

type FormError = { name: string; message: string };

function validate(state: typeof form): FormError[] {
  const errors: FormError[] = [];
  if (!state.name.trim()) errors.push({ name: "name", message: "Required" });
  return errors;
}

const isPending = computed(
  () => props.createMutation.isPending.value || props.updateMutation.isPending.value
);

async function onSubmit() {
  if (props.group) {
    await props.updateMutation.mutateAsync({ id: props.group.id, name: form.name.trim() });
  } else {
    await props.createMutation.mutateAsync({ name: form.name.trim() });
  }
  emit("saved");
}
</script>

<template>
  <UModal
    :open="open"
    :title="group ? 'Edit Group' : 'New Group'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <UForm :state="form" :validate="validate" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField label="Group Name" name="name" required>
          <UInput v-model="form.name" placeholder="cloud-admins" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton label="Cancel" color="neutral" variant="ghost" @click="$emit('update:open', false)" />
          <AppButton type="submit" :label="group ? 'Save' : 'Create'" :loading="isPending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
