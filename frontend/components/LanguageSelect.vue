<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';

const selectedLanguage = ref('javascript');
const emit = defineEmits(['language-changed']);

watch(selectedLanguage, (newLanguage) => {
  emit('language-changed', newLanguage);
});
</script>

<template>
  <div class="language">
    <label for="language__label" class="language__label">Выберите язык программирования</label>
    <select class="language__select" id="language" v-model="selectedLanguage" ref="selectValue">
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
  </div>
</template>

<style scoped lang="scss">
  .language {
    display: flex;
    flex-direction: column;
    gap: 8px;

  }

  .language__select {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    color: #66FCF1;
    border-radius: 0.25rem;
    background-color: transparent;
    display: block;

    &:focus {
      outline: none;
      border-color: #45A29E;
    }

    &:hover {
      border-color: #45A29E;
    }

    option {
      background-color: #1F2833;
    }
  }

  .language__label {
    display: block;
    text-align: center;
  }
</style>