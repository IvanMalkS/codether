<script setup lang="ts">
import { ref } from 'vue';
const editorLanguage = ref('javascript');

function handleLanguageChange(newLanguage: string) {
  editorLanguage.value = newLanguage;
}
</script>

<template>
  <h1 class="visually-hidden">Создать код</h1>
</template>

<style scoped lang="scss">
.main-content__editor-settings {
  padding-top: 35px;
}
</style>