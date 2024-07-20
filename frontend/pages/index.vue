<script setup lang="ts">
import { ref } from 'vue';
import LanguageSelect from "~/components/LanguageSelect.vue";
import CodeEditor from "~/components/CodeEditor.vue";
import EditorWithSettings from "~/components/EditorWithSettings.vue";

const editorLanguage = ref('javascript');

function handleLanguageChange(newLanguage: string) {
  editorLanguage.value = newLanguage;
}
</script>

<template>
  <h1 class="visually-hidden">Создать код</h1>
  <EditorWithSettings class="main-content__editor-settings" />
</template>

<style scoped lang="scss">
.main-content__editor-settings {
  padding-top: 35px;
}
</style>