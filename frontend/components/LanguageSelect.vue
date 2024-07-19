<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';

const selectedLanguage = ref('javascript');
const emit = defineEmits(['language-changed']);

watch(selectedLanguage, (newLanguage) => {
  emit('language-changed', newLanguage);
});
</script>

<template>
  <select v-model="selectedLanguage" ref="selectValue">
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="java">Java</option>
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="markdown">Markdown</option>
    <option value="json">JSON</option>
    <option value="sql">SQL</option>
    <option value="php">PHP</option>
    <option value="ruby">Ruby</option>
    <option value="swift">Swift</option>
    <option value="csharp">C#</option>
    <option value="cpp">C++</option>
    <option value="go">Go</option>
  </select>
</template>