<script setup>
const { data: settings } = await useFetch("/api/settings", { key: "site-settings", server: true });

const pageTitle = computed(() => settings.value?.pageTitle || "Cloud Start Page");
const faviconPath = computed(() => settings.value?.logoSmallPath || "/logo-small.svg");
const { loggedIn } = useOidcAuth();
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: faviconPath }],
  htmlAttrs: { lang: "en" }
});

useSeoMeta({ title: pageTitle });
</script>

<template>
  <UApp>
    <MatrixRain />
    <AppHeader v-if="loggedIn" />

    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
