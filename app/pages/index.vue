<script setup lang="ts">
const { loggedIn, login } = useOidcAuth();

const {
  data: categories,
  pending,
  error
} = await useFetch("/api/home", {
  immediate: loggedIn.value,
  server: true
});
</script>

<template>
  <UContainer class="py-10">
    <div v-if="!loggedIn" class="flex flex-col items-center gap-6 py-24">
      <img src="/mean-robot.svg" alt="Cloud Start Page" class="h-64 w-auto" />
      <div class="text-center"></div>
      <UButton
        label="Login into Apollon Realm"
        color="primary"
        icon="i-lucide-log-in"
        size="lg"
        @click="login()"
      />
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold">Services</h1>
      </div>

      <div v-if="pending" class="flex justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="size-8 text-muted animate-spin" />
      </div>

      <div v-else-if="error" class="text-red-500 py-8 text-center">
        Failed to load services: {{ error.message }}
      </div>

      <div v-else-if="!categories?.length" class="text-center text-muted py-16">No services available.</div>

      <div v-else class="flex flex-col gap-10">
        <section v-for="category in categories" :key="category.id">
          <div class="flex items-center gap-2 mb-4">
            <UIcon :name="`i-lucide-${category.icon}`" class="size-5 text-muted" />
            <h2 class="text-lg font-medium">{{ category.title }}</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <UCard
              v-for="service in category.services"
              :key="service.id"
              class="flex flex-col gap-2"
              :ui="{ body: 'flex flex-col gap-2 h-full' }"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-medium leading-tight">{{ service.name }}</span>
                <UButton
                  :to="service.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon="i-lucide-external-link"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="shrink-0 mt-0.5"
                  aria-label="Open"
                />
              </div>
              <p v-if="service.description" class="text-sm text-muted leading-snug">
                {{ service.description }}
              </p>
            </UCard>
          </div>
        </section>
      </div>
    </template>
  </UContainer>
</template>
