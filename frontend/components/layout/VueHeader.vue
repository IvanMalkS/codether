<script setup lang="ts">

import Navigation from "~/components/Navigation.vue";
</script>

<template>
  <header class="header">
    <div class="header__container container">
      <NuxtLink class="header__logo-link" href="https://github.com/IvanMalkS/codether">
        <picture>
          <source
              media="(min-width: 1200px)"
              srcset="/logo-desktop.svg"
              width="417"
              height="35.5"
          >
          <source
              media="(min-width: 600px)"
              srcset="/logo-tablet.svg"
              width="150"
              height="29,5"
          >
          <NuxtImg
              class="header__logo-image"
              src="/logo-mobile.svg"
              width="34"
              height="52"
              alt="Логотип кодетхер"
          />
        </picture>
      </NuxtLink>
      <Navigation class="header__nav" />
    </div>
  </header>
</template>

<style scoped lang="scss">
  .header__container {
    display: flex;
    justify-content: space-around;
    padding-top: 10px;
    padding-bottom: 10px;
  }
</style>