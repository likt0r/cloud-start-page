<script setup lang="ts">
const { loggedIn, logout } = useOidcAuth();

const { data: settings } = await useFetch("/api/settings", { key: "site-settings", server: true });
const { data: me } = await useFetch("/api/me", { immediate: loggedIn.value, server: true });

const pageTitle = computed(() => settings.value?.pageTitle || "Cloud Start Page");
const logoPath = computed(() => settings.value?.logoPath || "/logo.svg");

const route = useRoute();
function isActive(path: string) {
  return route.path === path;
}
</script>

<template>
  <UHeader :toggle="!!(loggedIn && me?.isAdmin)">
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-end gap-2.5 min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <img :src="logoPath" alt="Logo" class="h-6 w-auto shrink-0" />
        <span class="font-semibold text-primary truncate text-xl leading-none sm:text-2xl">{{
          pageTitle
        }}</span>
      </NuxtLink>
    </template>

    <template v-if="loggedIn && me?.isAdmin" #default>
      <nav class="flex items-center gap-1">
        <AppButton
          icon="i-lucide-server"
          label="Services"
          :color="isActive('/admin') ? 'primary' : 'neutral'"
          :variant="isActive('/admin') ? 'outline' : 'ghost'"
          to="/admin"
          size="sm"
        />
        <AppButton
          icon="i-lucide-settings"
          label="Settings"
          :color="isActive('/admin/settings') ? 'primary' : 'neutral'"
          :variant="isActive('/admin/settings') ? 'outline' : 'ghost'"
          to="/admin/settings"
          size="sm"
        />
        <AppButton
          icon="i-lucide-user"
          label="User"
          :color="isActive('/admin/user') ? 'primary' : 'neutral'"
          :variant="isActive('/admin/user') ? 'outline' : 'ghost'"
          to="/admin/user"
          class="w-full justify-start"
        />
      </nav>
    </template>

    <template v-if="loggedIn && me?.isAdmin" #body>
      <nav class="flex flex-col gap-1 p-2">
        <AppButton
          icon="i-lucide-server"
          label="Services"
          :color="isActive('/admin') ? 'primary' : 'neutral'"
          :variant="isActive('/admin') ? 'outline' : 'ghost'"
          to="/admin"
          class="w-full justify-start"
        />
        <AppButton
          icon="i-lucide-settings"
          label="Settings"
          :color="isActive('/admin/settings') ? 'primary' : 'neutral'"
          :variant="isActive('/admin/settings') ? 'outline' : 'ghost'"
          to="/admin/settings"
          class="w-full justify-start"
        />
      </nav>
    </template>

    <template #right>
      <template v-if="loggedIn">
        <AppButton color="neutral" variant="ghost" icon="i-lucide-log-out" @click="logout()" />
      </template>
    </template>
  </UHeader>
</template>
