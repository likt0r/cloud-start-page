<script setup lang="ts">
const { loggedIn, login } = useOidcAuth();

const {
  data: me,
  pending,
  error
} = await useFetch("/api/me", {
  immediate: loggedIn.value,
  server: true
});
</script>

<template>
  <UButton
    v-if="loggedIn && me?.isAdmin"
    icon="i-lucide-settings"
    color="neutral"
    variant="ghost"
    to="/admin"
  />
</template>
