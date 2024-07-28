<script setup lang="ts">
import '/assets/css/tailwind.css'
import Toaster from '@/components/ui/toast/Toaster.vue'
onBeforeMount(() => {
  if( window.matchMedia('(prefers-color-scheme: dark)').matches )
  {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})
</script>

<template>
   <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
</template>
