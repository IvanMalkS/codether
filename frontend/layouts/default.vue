<script setup lang="ts">

import VueHeader from "~/components/layout/VueHeader.vue";
</script>

<template>
  <VueHeader/>
  <main class="main-content">
    <slot />
  </main>
</template>

<style scoped lang="scss">

</style>
