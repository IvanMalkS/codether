<script setup lang="ts">
import {ref, watch} from "vue";
import {useFindSnippetStore} from "~/store/findSnippet";

const viewPassword = ref('');
const disableSubmit = ref(false);
const textSubmit = ref('Найти');
const isCodeFounded = ref(false);
const id = ref(1);
const language = ref('javascript');
const code = ref('');
const errorMessage = ref('');
const findSnippetStore = useFindSnippetStore();


const findSnippet = async () => {
  try {
    disableSubmit.value = true;
    textSubmit.value = 'Поиск...';
    await findSnippetStore.find(+id.value, viewPassword.value)
    isCodeFounded.value = true;
    language.value = findSnippetStore.language;
    code.value = findSnippetStore.code;
    console.log(code.value)
  } catch (error) {
    disableSubmit.value = false;
    textSubmit.value = 'Найти';
    try {
      const errorData = JSON.parse(error.message);
      if (errorData.errorCode === 'INVALID_PASSWORD') {
        errorMessage.value = 'Введен неверный пароль. Пожалуйста, попробуйте снова.';
      } else {
        errorMessage.value = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
      }
    } catch (parseError) {
      errorMessage.value = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
    }
  } finally {
    disableSubmit.value = false;
    textSubmit.value = 'Найти';
  }
}
</script>

<template>
<section class="search-cell">
  <h2 class="visually-hidden">Здесь вы можете найти код</h2>
  <CodeEditor :editorLanguageProps="language" :code-value="code" v-if="isCodeFounded" />
  <form v-else class="search-cell__form" @submit.prevent="findSnippet">
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <Input class="search-cell__input" inputLabel="Введите ID" v-model="id" min="1" type="number" />
    <Input class="search-cell__input" inputLabel="Введите пароль для просмотра" v-model="viewPassword" type="password" />
    <SubmitButton :disabled="disableSubmit" :text-submit="textSubmit" />
  </form>
</section>
</template>

<style scoped lang="scss">
.search-cell__input {
  text-align: center;
}

.search-cell__form {
  display: flex;
  flex-direction: column;
  background-color: #1E1E1E;
  height: 400px;
  border-radius: 5px;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

.error-message {
  color: red;
  margin-bottom: 15px;
}

@media (max-width: 600px) {
  .search-cell__form{
    height: 400px;
  }
}

@media (max-width: 480px) {
  .search-cell__form {
    height: 300px;
  }
}
</style>