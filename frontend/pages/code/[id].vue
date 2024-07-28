<script setup lang="ts">
import {type FindSnippetError, useFindSnippetStore} from "~/store/find/find-snippet";
import { useUpdateSnippetStore } from "~/store/update/update-snippet-store";
import * as z from "zod";
import {useForm} from "vee-validate";
const route = useRoute();
const snippetId = route.params.id;
const language = ref('');
const code = ref('');
const author = ref('');
const error = ref<FindSnippetError | null>(null);
const PASSWORD_LENGTH = 8;
const buttonText = ref('Отправить пароль');

let copyCode = () => {};
let downloadCode = () => {};
let updateCode = () => {};

const findStore = useFindSnippetStore();
onMounted(async () => {
  const codeMeta = await findStore.find(snippetId);
  if (!codeMeta) {
    error.value = findStore.error;
    return;
  }
  code.value = codeMeta.code;
  language.value = codeMeta.language;
  author.value = codeMeta.author;
  copyCode = () => {
    navigator.clipboard.writeText(code.value);
  };
  downloadCode = () => {
    const url = `https://codether.io/code/${snippetId}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.click();
  };
  const updateStore = useUpdateSnippetStore();
  updateCode = () => {
    updateStore.update(snippetId, {
      code: code.value,
      editPassword: 'password'
    });
  };
});

const viewPasswordSchema = toTypedSchema(z.object({
      viewPassword:  z.array(z.coerce.string()).length(8, { message: 'Invalid input' })
}));

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: viewPasswordSchema,
  initialValues: {
    viewPassword: ['','','','','','','',''],
  },
});

const onSubmitValidationPassword = handleSubmit(async (viewPassword) => {
  buttonText.value = 'Проверка...';
  try {
    await retryWithPassword(viewPassword.viewPassword.join(''));
  } catch {
    buttonText.value = 'Попробовать снова';
  }
});


const retryWithPassword = async (viewPassword: string) => {
  error.value = null;
  const codeMeta = await findStore.find(snippetId, viewPassword);
  if (!codeMeta) {
    error.value = findStore.error;
    return;
  }
  code.value = codeMeta.code;
  language.value = codeMeta.language;
  author.value = codeMeta.author;
};
</script>

<template>
  <h1 class="visually-hidden">Код</h1>
  <div class="meta-info bg-accent-foreground container grid justify-between">
    <div>
      <p class="author text-accent">Автор: {{ author }}</p>
      <p class="language text-accent">Язык: {{ language.toUpperCase() }}</p>
    </div>
    <div class="flex flex-col">
      <Button class="mt-5" @click="copyCode">
        <span class="visually-hidden">Скопировать код</span>
      </Button>
      <Button class="mt-5" @click="downloadCode">
        <span class="visually-hidden">Скачать код</span>
      </Button>
      <Button class="mt-5" @click="updateCode">
        <span class="visually-hidden">Редактировать код</span>
      </Button>
    </div>
  </div>
  <div class="w-full h-full flex items-center justify-center" v-if="error && error.errorCode === 'INVALID_VIEW_PASSWORD'">
    <form @submit="onSubmitValidationPassword">
    <FormField v-slot="{ componentField, value }" name="viewPassword">
      <FormItem>
        <FormLabel>Пароль для просмотра</FormLabel>
        <FormControl>
          <PinInput
              id="view-password"
              v-model="value!"
              :name="componentField.name"
              @update:model-value="(arrStr) => {
                    setFieldValue('viewPassword', arrStr.filter(Boolean))
                  }"
              type="number"
          >
            <PinInputGroup>
              <PinInputInput
                  v-for="(id, index) in PASSWORD_LENGTH"
                  :key="id"
                  :index="index"
              />
            </PinInputGroup>
          </PinInput>
        </FormControl>
      </FormItem>
    </FormField>
    <Button class="mt-5 w-100" type="submit">{{ buttonText }}</Button>
    </form>
  </div>
  <CodeEditor
      v-else
      class="mt-5 h-[100%]"
      :editor-language-props="language"
      :code-value-props="code"
      :code-editor-readonly="true"
  />
</template>

<style scoped lang="scss">
.meta-info {
  margin-top: 1rem;
  padding: 1rem;
  grid-template-columns: 1fr 40px;
  border-radius: 8px;
}

.author, .language {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
</style>