<script setup lang="ts">
const { $supabase } = useNuxtApp()

</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <NuxtNotifications position="top right" :speed="500" />
  </div>
</template>
