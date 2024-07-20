<template>
  <section class="code-editor">
    <div ref="editorContainer" :data-mode-id="props.editorLanguageProps" class="editor-container">
      <div v-if="isEditorLoading" class="code-editor__loading">Загрузка...</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, type Ref, watch } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['code-updated']);
const props = defineProps({
  editorLanguageProps: {
    type: String,
    default: 'javascript',
  },
  codeValue: {
    type: String,
  }
});

const defaultCodeSnippets: Record<string, string> = {
  javascript: 'function hello() {\n\talert("Hello, world!");\n}',
  python: 'def hello():\n\tprint("Hello, world!")',
  java: 'public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
  html: '<!DOCTYPE html>\n<html>\n<head>\n\t<title>Hello user!</title>\n</head>\n<body>\n\t<h1>Hello, world!</h1>\n</body>\n</html>',
  css: 'body {\n\tbackground-color: #f0f0f0;\n\tfont-family: Arial, sans-serif;\n}',
  markdown: '# Hello, world!\n\nThis is a markdown document.',
  json: '{\n\t"hello": "world"\n}',
  sql: 'SELECT * FROM users;',
  php: '<?php\n\techo "Hello, world!";\n?>',
  ruby: 'puts "Hello, world!"',
  swift: 'import Swift\nprint("Hello, world!")',
  csharp: 'using System;\n\nnamespace HelloWorld\n{\n\tclass Program\n\t{\n\t\tstatic void Main(string[] args)\n\t\t{\n\t\t\tConsole.WriteLine("Hello, world!");\n\t\t}\n\t}\n}',
  cpp: '#include <iostream>\n\nint main() {\n\tstd::cout << "Hello, world!" << std::endl;\n\treturn 0;\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, world!")\n}',
};

const editorContainer: Ref<HTMLElement | null> = ref(null);
let editor: any = null;
const isEditorLoading = ref(true);

const initializeEditor = () => {
  if (editorContainer.value) {
    const defaultCode = props.codeValue || defaultCodeSnippets[props.editorLanguageProps] || 'function hello() {\n\talert("Hello, world!");\n}'; // Fallback to JavaScript if no match
    // @ts-ignore
    editor = monaco.editor.create(editorContainer.value, {
      value: defaultCode,
      language: props.editorLanguageProps,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: window.innerWidth > 600 },
      fontSize: window.innerWidth <= 600 ? 12 : 14,
      renderLineHighlight: 'all',
      wordWrap: 'on'
    });
    isEditorLoading.value = false;
  }
};

const attachChangeEvent = () => {
  if (editor) {
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();
      emit('code-updated', currentCode);
    });
  }
};

// Load Monaco Editor via cdn for better performance and stability
const loadMonacoEditor = () => {
  // @ts-ignore
  if (!window.monaco) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/loader.js';
    script.onload = () => {
      // @ts-ignore
      require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' }});
      // @ts-ignore
      require(['vs/editor/editor.main'], () => {
        // Ensure initializeEditor is called here, inside the callback
        initializeEditor();
      });
    };
    document.body.appendChild(script);
  } else {
    // If monaco is already defined, call initializeEditor directly
    initializeEditor();
  }
};

watch(() => props.editorLanguageProps, (newVal) => {
  if (editor) {
    const newCode = defaultCodeSnippets[newVal] || 'function hello() {\n\talert("Hello, world!");\n}'; // Fallback to JavaScript if no match
    const model = monaco.editor.createModel(newCode, newVal);
    editor.setModel(model);
  } else {
    initializeEditor(); // Initialize the editor if it's not already initialized
  }
}, { immediate: true });

onMounted(() => {
  nextTick().then(() => {
    loadMonacoEditor();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateEditorSettings);
    }
  });
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateEditorSettings);
  }
});

const updateEditorSettings = () => {
  if (editor) {
    editor.updateOptions({
      fontSize: window.innerWidth <= 600 ? 12 : 20,
      minimap: { enabled: window.innerWidth > 600 }
    });
  }
};
</script>

<style scoped>
.code-editor {
  height: 400px;
  border: 1px solid #45A29E;
  position: relative;
  background-color: #1E1E1E;
}

.editor-container {
  height: 100%;
  border: 1px solid #45A29E;
  position: relative;
  background-color: #1E1E1E;
}

@media (max-width: 600px) {
  .code-editor {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .code-editor {
    height: 300px;
  }
}

.code-editor__loading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
</style>
