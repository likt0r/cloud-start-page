<script setup lang="ts">
const { loggedIn, login } = useOidcAuth();

const { data: settings } = await useFetch("/api/settings", { key: "site-settings", server: true });

const {
  data: categories,
  pending,
  error
} = await useFetch("/api/home", {
  immediate: loggedIn.value,
  server: true
});

const loginButtonText = computed(() => settings.value?.loginButtonText || "Login");
</script>

<template>
  <UContainer class="py-10">
    <div v-if="!loggedIn" class="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-10rem)]">
      <img src="/mean-robot.svg" alt="Cloud Start Page" class="h-64 w-auto" />
      <AppButton
        :label="loginButtonText"
        color="primary"
        variant="outline"
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
        <CategorySection
          v-for="category in categories"
          :key="category.id"
          :icon="category.icon"
          :title="category.title"
        >
          <ServiceCard v-for="service in category.services" :key="service.id" :service="service" />
        </CategorySection>
      </div>
    </template>
  </UContainer>
</template>
