<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as monaco from 'monaco-editor';

  export let value = '';
  export let language = 'html';
  export let theme = 'vs-dark';
  export let options = {};

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor | null = null;
  let mounted = false;

  onMount(async () => {
    // Configure Monaco Editor
    monaco.editor.defineTheme('vs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    });

    // Create the editor
    editor = monaco.editor.create(container, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      ...options
    });

    // Listen for changes
    editor.onDidChangeModelContent(() => {
      if (mounted && editor) {
        value = editor.getValue();
      }
    });

    mounted = true;
  });

  onDestroy(() => {
    mounted = false;
    if (editor) {
      editor.dispose();
    }
  });

  // Update editor when props change
  $: if (editor && mounted) {
    const currentValue = editor.getValue();
    if (currentValue !== value) {
      editor.setValue(value);
    }
  }

  $: if (editor && mounted) {
    monaco.editor.setModelLanguage(editor.getModel()!, language);
  }
</script>

<div bind:this={container} class="monaco-editor-container"></div>

<style>
  .monaco-editor-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
  }
</style>
