<script setup lang="ts">
const { loggedIn, logout, login } = useOidcAuth()

const { data: settings } = await useFetch('/api/settings', { key: 'site-settings', server: true })
const { data: me } = await useFetch('/api/me', { immediate: loggedIn.value, server: true })

const pageTitle = computed(() => settings.value?.pageTitle || 'Cloud Start Page')
const logoPath = computed(() => settings.value?.logoPath || '/logo.svg')
const loginButtonText = computed(() => settings.value?.loginButtonText || 'Login')
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-end gap-2.5 min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img :src="logoPath" alt="Logo" class="h-6 w-auto shrink-0" />
        <span class="font-semibold text-primary truncate text-xl leading-none sm:text-2xl">{{ pageTitle }}</span>
      </NuxtLink>
    </template>

    <template v-if="loggedIn && me?.isAdmin" #default>
      <nav class="flex items-center gap-1">
        <AppButton label="Services" color="neutral" variant="ghost" to="/admin" size="sm" />
        <AppButton label="Settings" color="neutral" variant="ghost" to="/admin/settings" size="sm" />
      </nav>
    </template>

    <template #right>
      <AppButton v-if="loggedIn" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="logout()" />
      <AppButton
        v-else
        :label="loginButtonText"
        color="neutral"
        variant="ghost"
        icon="i-lucide-log-in"
        @click="login()"
      />
    </template>
  </UHeader>
</template>
