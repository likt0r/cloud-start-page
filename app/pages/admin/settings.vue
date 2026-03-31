<script setup lang="ts">
import type { SettingsUpdatePayload } from "~/composables/useAdminSettings";

definePageMeta({ middleware: ["admin"], ssr: false });

const { query, updateSettings } = useAdminSettings();
const toast = useToast();

const form = reactive<SettingsUpdatePayload>({
  loginButtonText: "",
  pageTitle: "",
  logoPath: "",
  logoSmallPath: ""
});

watch(
  () => query.data.value,
  (data) => {
    if (data) {
      form.loginButtonText = data.loginButtonText;
      form.pageTitle = data.pageTitle;
      form.logoPath = data.logoPath;
      form.logoSmallPath = data.logoSmallPath;
    }
  },
  { immediate: true }
);

const logoFile = ref<File | null>(null);
const logoSmallFile = ref<File | null>(null);
const logoUploading = ref(false);
const logoSmallUploading = ref(false);
const logoError = ref("");
const logoSmallError = ref("");

async function uploadLogo(
  file: File,
  field: "logoPath" | "logoSmallPath",
  uploadingRef: Ref<boolean>,
  errorRef: Ref<string>
) {
  uploadingRef.value = true;
  errorRef.value = "";
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { path } = await $fetch<{ path: string }>("/api/admin/upload", { method: "POST", body: fd });
    form[field] = path;
  } catch (e: unknown) {
    errorRef.value = (e as { data?: { message?: string } })?.data?.message ?? "Upload failed";
  } finally {
    uploadingRef.value = false;
  }
}

watch(logoFile, (f) => f && uploadLogo(f, "logoPath", logoUploading, logoError));
watch(logoSmallFile, (f) => f && uploadLogo(f, "logoSmallPath", logoSmallUploading, logoSmallError));

async function onSubmit() {
  await updateSettings.mutateAsync({ ...form });
  await refreshNuxtData("site-settings");
  toast.add({ title: "Settings saved", color: "success", icon: "i-lucide-check" });
}

const isSaving = computed(() => updateSettings.isPending.value);
const isUploading = computed(() => logoUploading.value || logoSmallUploading.value);
</script>

<template>
  <UContainer class="py-8 max-w-lg">
    <h1 class="text-2xl font-semibold mb-6">Admin — Site Settings</h1>

    <div v-if="query.isPending.value" class="flex flex-col gap-4">
      <USkeleton v-for="n in 4" :key="n" class="h-10 rounded-lg" />
    </div>

    <UAlert
      v-else-if="query.isError.value"
      color="error"
      title="Failed to load settings"
      :description="query.error.value?.message"
      icon="i-lucide-circle-alert"
    />

    <UCard v-else>
      <UForm :state="form" class="flex flex-col gap-6" @submit="onSubmit">
        <UFormField label="Page Title" name="pageTitle" required>
          <UInput v-model="form.pageTitle" placeholder="Cloud Start Page" class="w-full" />
        </UFormField>

        <UFormField label="Login Button Text" name="loginButtonText" required>
          <UInput v-model="form.loginButtonText" placeholder="Login" class="w-full" />
        </UFormField>

        <UFormField label="Logo" name="logoPath">
          <div class="flex items-center gap-3 mb-1">
            <img
              :src="form.logoPath || '/logo.svg'"
              alt="Logo preview"
              class="h-10 w-auto rounded bg-elevated shrink-0 object-contain"
            />
            <UButton
              color="neutral"
              variant="outline"
              :loading="logoUploading"
              :label="logoUploading ? 'Uploading…' : 'Choose logo'"
              icon="i-lucide-upload"
              @click="($refs.logoInput as HTMLInputElement).click()"
            />
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="
                (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) logoFile = f;
                }
              "
            />
          </div>
          <p v-if="logoError" class="text-[var(--ui-color-error-500)] text-xs mt-1">{{ logoError }}</p>
          <p v-if="form.logoPath" class="text-xs text-muted mt-1">{{ form.logoPath }}</p>
        </UFormField>

        <UFormField label="Logo (small / mobile)" name="logoSmallPath">
          <div class="flex items-center gap-3 mb-1">
            <img
              :src="form.logoSmallPath || '/logo-small.svg'"
              alt="Small logo preview"
              class="h-8 w-auto rounded bg-elevated shrink-0 object-contain"
            />
            <UButton
              color="neutral"
              variant="outline"
              :loading="logoSmallUploading"
              :label="logoSmallUploading ? 'Uploading…' : 'Choose small logo'"
              icon="i-lucide-upload"
              @click="($refs.logoSmallInput as HTMLInputElement).click()"
            />
            <input
              ref="logoSmallInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="
                (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) logoSmallFile = f;
                }
              "
            />
          </div>
          <p v-if="logoSmallError" class="text-[var(--ui-color-error-500)] text-xs mt-1">
            {{ logoSmallError }}
          </p>
          <p v-if="form.logoSmallPath" class="text-xs text-muted mt-1">{{ form.logoSmallPath }}</p>
        </UFormField>

        <div class="flex justify-end">
          <AppButton
            type="submit"
            label="Save Settings"
            :loading="isSaving"
            color="primary"
            variant="outline"
            :disabled="isUploading"
          />
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
