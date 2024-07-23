<script setup lang="ts">
import '/assets/css/tailwind.css'
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<template>
  <div class="page-theme" :class="{ 'dark': true }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>
