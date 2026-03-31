<script setup lang="ts">
const { loggedIn, logout, login } = useOidcAuth();
</script>

<template>
  <UHeader v-if="loggedIn">
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-end gap-2.5 min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <AppLogo class="h-6 w-auto shrink-0" />
        <span class="font-semibold text-primary truncate text-xl leading-none sm:text-2xl">Apollon Realm</span>
      </NuxtLink>
    </template>

    <template #right>
      <AdminSettings />

      <AppButton v-if="loggedIn" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="logout()" />
      <AppButton
        v-else
        label="Login"
        color="neutral"
        variant="ghost"
        icon="i-lucide-log-in"
        @click="login()"
      />
    </template>
  </UHeader>
</template>
