<script setup lang="ts">
import { ref } from 'vue';
const editorLanguage = ref('javascript');
const viewPassword = ref<string[]>([]);
const editPassword = ref<string[]>([]);
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {useForm} from "vee-validate";
import {toast, ToastAction} from "~/components/ui/toast";
import {useCreateSnippetStore} from "~/store/create/create-snippet.store";
const PASSWORD_LENGTH = 8;
const SELECT_LANGUAGES_OPTIONS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  go: 'Go',
  cpp: 'C++',
  csharp: 'C#',
  python: 'Python',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown',
  json: 'JSON',
}

const CODE_SIZE_LIMIT = 1000000;

const getCodeSize = (code: string) => {
  return new Blob([code]).size;
}

const codeFormSchema = toTypedSchema(z.object({
  author: z.string().min(2).max(50).optional(),
  language: z.string(),
  viewPassword:  z.array(z.coerce.string()).length(8, { message: 'Invalid input' }).optional(),
  editPassword:  z.array(z.coerce.string()).length(8, { message: 'Invalid input' }).optional(),
}))

let codeToSent = '';

const passwordGenerator = (passwordLength: number) => {
  return Array.from({ length: passwordLength }, () => Math.floor(Math.random() * 10).toString());
}

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: codeFormSchema,
  initialValues: {
    language: 'javascript',
    author: `Undefined-${Math.floor(Math.random() * 1000)}`,
  },
});

const buttonText = ref('Создать код');
const buttonDisabled = ref(false);

const onSubmit =  handleSubmit( async (values) => {
  try {
    buttonDisabled.value = true;
    buttonText.value = 'Создание кода...';
    const store = useCreateSnippetStore();

    if (getCodeSize(codeToSent) > CODE_SIZE_LIMIT) {
      toast({
        title: 'Слишком большой код',
        description: 'Максимальный размер кода больше требуемого',
      });
      return;
    }
    const response = await store.create({
      language: values.language,
      code: codeToSent,
      viewPassword: values.viewPassword?.join(''),
      editPassword: values.editPassword?.join(''),
      author: values.author,
    })
    const roomId = response.shortid;

    toast({
      title: 'Код создан',
      description: `Вы будете перенаправлены на страницу с кодом: ${roomId}`,
    });

    await useRouter().push({ path: `/code/${roomId}` });

  } catch {
    toast({
      title: 'Ошибка',
      description: 'Произошла ошибка при создании кода',
    });
  } finally {
    buttonDisabled.value = false;
    buttonText.value = 'Создать код';
  }

})

</script>

<template>
  <h1 class="visually-hidden">Создать код</h1>
  <div class="main-content__editor-settings editor-settings container">
    <form @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="language">
        <FormItem>
        <label for="editor-language" class=" visually-hidden">Язык:</label>
        <Select v-model="editorLanguage" v-bind="componentField" class="flex-grow">
          <SelectTrigger className="w-[100%]">
            <SelectValue placeholder="Выберите ЯП" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                  v-for="[key, name] in Object.entries(SELECT_LANGUAGES_OPTIONS)"
                  :key="key"
                  :value="key">
                {{ name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        </FormItem>
      </FormField>
      <CodeEditor
          @code-updated="(codeFromEditor) => {
            codeToSent = codeFromEditor;
          }"
          :editor-language-props="editorLanguage"
          class="flex-grow editor-settings"
      />
      <div class="mt-10 flex flex-col gap-3 items-center">
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
        <FormField v-slot="{ componentField, value }" name="editPassword">
          <FormItem>
            <FormLabel>Пароль для редактирования</FormLabel>
            <FormControl>
              <PinInput
                  id="edit-password"
                  v-model="value!"
                  :name="componentField.name"
                  @update:model-value="(arrStr) => {
                    setFieldValue('editPassword', arrStr.filter(Boolean))
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
        <FormField v-slot="{ componentField }" name="author">
          <FormItem>
            <Label for="author">Ваше имя</Label>
            <Input v-bind="componentField" id="author" placeholder="Undefined" class="w-[292px]" />
          </FormItem>
        </FormField>
        <Button class="mt-5 w-100" type="submit" :disabled="buttonDisabled">{{ buttonText }}</Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.main-content__editor-settings {
  padding-top: 35px;
}

.editor-settings {
  height: 400px;

  @media (min-width: 768px) {
    height: 500px;
  }

  @media (min-width: 1024px) {
    height: 600px;
  }
}

</style>