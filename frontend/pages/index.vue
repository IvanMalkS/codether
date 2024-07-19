<script setup lang="ts">
import { ref } from 'vue';
import LanguageSelect from "~/components/LanguageSelect.vue";
import CodeEditor from "~/components/CodeEditor.vue";

const editorLanguage = ref('javascript');

function handleLanguageChange(newLanguage: string) {
  editorLanguage.value = newLanguage;
}
</script>

<template>
  <h1 class="main-content__title">Создайте снипет</h1>
  <LanguageSelect @language-changed="handleLanguageChange" />
  <CodeEditor :editorLanguageProps="editorLanguage"/>
</template>

<style scoped lang="scss">
  .main-content__title {
    text-align: center;
  }
</style>