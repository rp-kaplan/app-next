<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import { writeTextFile, readTextFile, exists } from "@tauri-apps/plugin-fs";
  import { join } from "@tauri-apps/api/path";
  import MonacoEditor from "$lib/MonacoEditor.svelte";
  import { defaultHTML, defaultCSS, defaultJS } from "$lib/templates";

  let projectFolder = "";
  let files = ["index.html", "style.css", "script.js"];
  let selectedFile = "index.html";
  let fileContents = "";
  let serverRunning = false;
  let showFolderDialog = true;
  let statusMessage = "";
  let isLoading = false;

  // Function to discover existing files in the project folder
  async function discoverProjectFiles() {
    const defaultFiles = ["index.html", "style.css", "script.js"];
    const existingFiles = [];
    
    for (const file of defaultFiles) {
      const filePath = await join(projectFolder, file);
      const fileExists = await exists(filePath);
      if (fileExists) {
        existingFiles.push(file);
      }
    }
    
    // Update the files list to show only existing files, but always include index.html
    if (!existingFiles.includes("index.html")) {
      existingFiles.unshift("index.html");
    }
    
    files = existingFiles;
    console.log('Discovered files:', files);
  }

  // Test function to verify dialog API works
  async function testDialog() {
    try {
      console.log('Testing dialog...');
      const result = await open({ directory: true });
      console.log('Test dialog result:', result);
      alert(`Dialog test result: ${result || 'No selection'}`);
    } catch (error) {
      console.error('Dialog test error:', error);
      alert(`Dialog test error: ${error.message || error}`);
    }
  }

  async function selectProjectFolder() {
    try {
      isLoading = true;
      statusMessage = "Opening folder dialog...";
      
      console.log('About to open dialog...');
      
      // Try to open the dialog
      const folder = await open({ 
        directory: true,
        multiple: false,
        title: "Select Project Folder"
      });
      
      console.log('Dialog result:', folder, typeof folder);
      
      if (folder && folder !== null) {
        projectFolder = folder as string;
        console.log('Project folder set to:', projectFolder);
        
        statusMessage = "Checking project files...";
        try {
          await createProjectFiles();
          console.log('Project files setup completed successfully');
          
          statusMessage = "Discovering project files...";
          await discoverProjectFiles();
          
          statusMessage = "Loading files...";
          await loadFile(selectedFile);
          console.log('Files loaded successfully');
          
          showFolderDialog = false;
          statusMessage = "Project ready!";
          setTimeout(() => statusMessage = "", 2000);
        } catch (fileError) {
          console.error('Error creating/loading files:', fileError);
          statusMessage = `Error with project files: ${fileError.message || fileError}`;
          setTimeout(() => statusMessage = "", 5000);
        }
      } else {
        console.log('No folder selected or dialog cancelled');
        statusMessage = "No folder selected";
        setTimeout(() => statusMessage = "", 2000);
      }
    } catch (error) {
      console.error('Error in selectProjectFolder:', error);
      statusMessage = `Error: ${error.message || error.toString()}`;
      setTimeout(() => statusMessage = "", 5000);
    } finally {
      isLoading = false;
    }
  }

  async function createProjectFiles() {
    // Check and create index.html (required)
    const indexPath = await join(projectFolder, "index.html");
    const indexExists = await exists(indexPath);
    if (!indexExists) {
      console.log('Creating index.html');
      await writeTextFile(indexPath, defaultHTML);
    } else {
      console.log('index.html already exists, skipping');
    }

    // Check and create style.css (optional)
    const cssPath = await join(projectFolder, "style.css");
    const cssExists = await exists(cssPath);
    if (!cssExists) {
      console.log('Creating style.css');
      await writeTextFile(cssPath, defaultCSS);
    } else {
      console.log('style.css already exists, skipping');
    }

    // Check and create script.js (optional)
    const jsPath = await join(projectFolder, "script.js");
    const jsExists = await exists(jsPath);
    if (!jsExists) {
      console.log('Creating script.js');
      await writeTextFile(jsPath, defaultJS);
    } else {
      console.log('script.js already exists, skipping');
    }
  }

  async function loadFile(file: string) {
    selectedFile = file;
    try {
      const filePath = await join(projectFolder, file);
      const fileExists = await exists(filePath);
      
      if (fileExists) {
        fileContents = await readTextFile(filePath);
        console.log(`Loaded ${file} successfully`);
      } else {
        console.log(`File ${file} does not exist`);
        fileContents = `// ${file} does not exist\n// Create this file to start editing`;
      }
    } catch (error) {
      console.error('Error loading file:', error);
      fileContents = `// Error loading ${file}: ${error.message || error}`;
    }
  }

  async function saveFile() {
    try {
      await writeTextFile(await join(projectFolder, selectedFile), fileContents);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  async function startServer() {
    try {
      isLoading = true;
      statusMessage = "Starting server...";
      const result = await invoke("start_server", { folder: projectFolder });
      serverRunning = true;
      statusMessage = result as string;
      setTimeout(() => statusMessage = "", 3000);
    } catch (error) {
      console.error('Error starting server:', error);
      statusMessage = `Error starting server: ${error}`;
      setTimeout(() => statusMessage = "", 5000);
    } finally {
      isLoading = false;
    }
  }

  async function stopServer() {
    try {
      isLoading = true;
      statusMessage = "Stopping server...";
      const result = await invoke("stop_server");
      serverRunning = false;
      statusMessage = result as string;
      setTimeout(() => statusMessage = "", 2000);
    } catch (error) {
      console.error('Error stopping server:', error);
      statusMessage = `Error stopping server: ${error}`;
      setTimeout(() => statusMessage = "", 5000);
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-ui">
  {#if showFolderDialog}
    <div class="flex items-center justify-center min-h-screen p-8">
      <div class="glass-card p-12 max-w-md w-full text-center space-y-6">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚀 Project Builder
          </h1>
          <p class="text-gray-300 text-lg">Create and manage your web projects with ease</p>
        </div>
        
        <div class="space-y-4">
          <button 
            class="btn-primary w-full text-lg"
            on:click={selectProjectFolder}
            disabled={isLoading}
          >
            {#if isLoading}
              <div class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {statusMessage}
              </div>
            {:else}
              <div class="flex items-center justify-center gap-2">
                📁 Choose Project Folder
              </div>
            {/if}
          </button>
          
          <button 
            class="btn-secondary w-full"
            on:click={testDialog}
            disabled={isLoading}
          >
            <div class="flex items-center justify-center gap-2">
              🧪 Test Dialog
            </div>
          </button>
        </div>
        
        {#if statusMessage && !isLoading}
          <div class="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p class="text-green-300 font-medium">{statusMessage}</p>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex flex-col h-screen bg-editor-bg">
      <!-- Top Bar -->
      <header class="bg-editor-topbar border-b border-editor-border px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              📁 {projectFolder.split('/').pop()}
            </h2>
            <span class="text-sm text-gray-400 font-mono">{projectFolder}</span>
          </div>
          
          <div class="flex items-center gap-4">
            {#if statusMessage}
              <div class="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span class="text-yellow-300 text-sm font-medium">{statusMessage}</span>
              </div>
            {/if}
            
            <div class="flex items-center gap-2">
              <button 
                class="btn-server flex items-center gap-2"
                class:btn-server-active={serverRunning}
                on:click={startServer} 
                disabled={serverRunning || isLoading}
              >
                {#if isLoading}
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {:else}
                  ▶️
                {/if}
                {serverRunning ? 'Running' : 'Start'}
              </button>
              
              <button 
                class="btn-server btn-server-stop flex items-center gap-2"
                on:click={stopServer} 
                disabled={!serverRunning || isLoading}
              >
                ⏹️ Stop
              </button>
              
              {#if serverRunning}
                <a href="http://localhost:8080" target="_blank" 
                   class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                  🌐 Preview
                </a>
              {/if}
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <div class="flex flex-1 overflow-hidden">
        <!-- File Sidebar -->
        <nav class="w-64 bg-editor-sidebar border-r border-editor-border p-4 overflow-y-auto">
          <h3 class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4 px-2">
            Project Files
          </h3>
          
          <div class="space-y-1">
            {#each files as file}
              <button 
                class="file-tab"
                class:file-tab-selected={selectedFile === file}
                on:click={() => loadFile(file)}
              >
                <span class="text-lg">
                  {#if file.endsWith('.html')}📄
                  {:else if file.endsWith('.css')}🎨
                  {:else if file.endsWith('.js')}⚡
                  {:else}📝
                  {/if}
                </span>
                <span class="font-mono text-sm">{file}</span>
              </button>
            {/each}
          </div>
        </nav>
        
        <!-- Editor Area -->
        <div class="flex flex-col flex-1">
          <!-- Editor Header -->
          <div class="bg-editor-topbar border-b border-editor-border px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-lg">
                {#if selectedFile.endsWith('.html')}📄
                {:else if selectedFile.endsWith('.css')}🎨
                {:else if selectedFile.endsWith('.js')}⚡
                {:else}📝
                {/if}
              </span>
              <span class="text-white font-mono text-sm">{selectedFile}</span>
            </div>
            
            <button 
              class="bg-accent-blue hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              on:click={saveFile} 
              disabled={isLoading}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {:else}
                💾
              {/if}
              Save
            </button>
          </div>
          
          <!-- Monaco Editor -->
          <div class="flex-1 bg-editor-bg">
            <MonacoEditor 
              bind:value={fileContents} 
              language={selectedFile.endsWith('.js') ? 'javascript' : selectedFile.endsWith('.css') ? 'css' : 'html'}
              theme="vs-dark"
            />
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>
