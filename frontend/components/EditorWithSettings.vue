<script setup lang="ts">
import CodeEditor from "~/components/CodeEditor.vue";
import LanguageSelect from "~/components/LanguageSelect.vue";
import {ref} from "vue";
import {useCreateSnippetStore} from "~/store/CreateSnippet.store";

const editorLanguage = ref('javascript');
const viewPassword = ref('');
const editPassword = ref('');
const code = ref('');
const disableSubmit = ref(false);
const textSubmit = ref('Создать');

const createSnippetStore = useCreateSnippetStore();

const handleCodeUpdate = (updatedCode: string) => {
  code.value = updatedCode;
};
const handleLanguageChange = (newLanguage: string) => {
  editorLanguage.value = newLanguage;
}

const createSnippet = async () => {
  console.log(code.value)
  if (code.value != '') {
    try {
      textSubmit.value = 'Отправка...';
      disableSubmit.value = true;
      await createSnippetStore.create({
        language: editorLanguage.value,
        code: code.value,
        viewPassword: viewPassword.value,
        editPassword: editPassword.value,
      });
      await useRouter().push('/find');
    } catch (error) {
      console.error('Something went wrong...')
      textSubmit.value = 'Создать';
      disableSubmit.value = false;
    } finally {
      textSubmit.value = 'Создать';
      disableSubmit.value = false;
    }
  } else {
    alert('Пустой код не дам закинуть :)')
  }
};

</script>

<template>
  <section class="editor-settings">
    <div class="editor-settings__container container">
      <h2 class="visually-hidden">Здесь вы можете отредактировать и отправить код</h2>
      <form class="editor-settings__form" @submit.prevent="createSnippet">
        <LanguageSelect @language-changed="handleLanguageChange" />
        <CodeEditor :editorLanguageProps="editorLanguage" @code-updated="handleCodeUpdate"/>
        <div class='editor-settings__inputs'>
          <Input inputLabel="Пароль для просмотра" v-model="viewPassword" type="password" />
          <Input inputLabel="Пароль для редактирования" v-model="editPassword" type="password" />
        </div>
        <SubmitButton class="editor-settings__submit" :disabled="disableSubmit"  :text-submit="textSubmit" />
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.editor-settings__inputs {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
  -webkit-appearance: textfield;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
</style>