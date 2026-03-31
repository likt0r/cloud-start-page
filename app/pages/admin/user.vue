<script setup lang="ts">
definePageMeta({ middleware: ["admin"], ssr: false });

const { data: me } = await useFetch("/api/me", { server: true });

const expiresAt = computed(() => {
  if (!me.value?.expireAt) return null;
  return new Date(me.value.expireAt).toLocaleString();
});
</script>

<template>
  <UContainer class="py-8 max-w-lg">
    <h1 class="text-2xl font-semibold mb-6">Profile</h1>

    <div class="flex flex-col gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-user" class="size-5 text-primary" />
            <span class="font-semibold">Account</span>
          </div>
        </template>

        <div class="flex flex-col gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-muted">Username</span>
            <span class="font-medium">{{ me?.userName ?? "—" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Role</span>
            <UBadge :label="me?.isAdmin ? 'Admin' : 'User'" color="secondary" variant="subtle" size="sm" />
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Session expires</span>
            <span class="font-medium">{{ expiresAt ?? "—" }}</span>
          </div>
        </div>
      </UCard>

      <UCard v-if="me?.groups?.length">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-users" class="size-5 text-primary" />
            <span class="font-semibold">Groups</span>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="group in me.groups"
            :key="group"
            :label="group"
            color="secondary"
            variant="outline"
            size="sm"
          />
        </div>
      </UCard>

      <UCard v-if="me?.scopes?.length">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-shield" class="size-5 text-primary" />
            <span class="font-semibold">Scopes</span>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="scope in me.scopes"
            :key="scope"
            :label="scope"
            color="secondary"
            variant="subtle"
            size="sm"
          />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
