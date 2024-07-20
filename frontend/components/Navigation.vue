<script setup lang="ts">

</script>

<template>
  <nav class="nav">
    <NuxtLink class="nav__link" to="/">Создать</NuxtLink>
    <NuxtLink class="nav__link" to='/find'>Найти</NuxtLink>
    <NuxtLink class="nav__link" to='https://api.codether/docs'>Доки</NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
  .nav {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .nav__link {
    margin: 0;
    padding: 0;
    color: inherit;
    font-size: 20px;
    text-decoration: none;
  }
</style>