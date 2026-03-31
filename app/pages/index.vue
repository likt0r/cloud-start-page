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
            <UIcon :name="category.icon" class="size-5 text-muted" />
            <h2 class="text-lg font-medium">{{ category.title }}</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <ServiceCard
              v-for="service in category.services"
              :key="service.id"
              :service="service"
            />
          </div>
        </section>
      </div>
    </template>
  </UContainer>
</template>
