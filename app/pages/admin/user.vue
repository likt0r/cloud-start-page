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
  <UContainer class="py-8">
    <div v-if="!loggedIn" class="flex flex-col items-center gap-4 py-16">
      <p class="text-muted">You are not logged in.</p>
      <AppButton label="Login with Keycloak" icon="i-lucide-log-in" size="lg" @click="login()" />
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Session Debug</h1>
        <AppButton
          v-if="me?.isAdmin"
          label="Admin"
          icon="i-lucide-settings"
          color="neutral"
          variant="ghost"
          to="/admin"
        />
      </div>

      <div v-if="pending" class="text-muted">Loading…</div>
      <div v-else-if="error" class="text-red-500">Failed to load session: {{ error.message }}</div>

      <div v-else-if="me" class="flex flex-col gap-6">
        <div>
          <h2 class="text-sm font-medium text-muted uppercase tracking-wide mb-1">Username</h2>
          <p class="font-mono">{{ me.userName ?? "(not set)" }}</p>
        </div>

        <div>
          <h2 class="text-sm font-medium text-muted uppercase tracking-wide mb-1">
            Groups ({{ me.groups.length }})
          </h2>
          <div v-if="me.groups.length" class="flex flex-wrap gap-2">
            <UBadge v-for="group in me.groups" :key="group" :label="group" color="primary" variant="subtle" />
          </div>
          <p v-else class="text-muted text-sm">No groups</p>
        </div>

        <div>
          <h2 class="text-sm font-medium text-muted uppercase tracking-wide mb-1">
            Client Scopes ({{ me.scopes.length }})
          </h2>
          <div v-if="me.scopes.length" class="flex flex-wrap gap-2">
            <UBadge v-for="scope in me.scopes" :key="scope" :label="scope" color="neutral" variant="subtle" />
          </div>
          <p v-else class="text-muted text-sm">No scope claim in token</p>
        </div>

        <div>
          <h2 class="text-sm font-medium text-muted uppercase tracking-wide mb-1">Session Expires</h2>
          <p class="font-mono text-sm">{{ new Date(me.expireAt * 1000).toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
