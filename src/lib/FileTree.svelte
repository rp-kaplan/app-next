<script lang="ts"></script>
  import { readDir, exists, writeTextFile, createDir } from "@tauri-apps/plugin-fs";
  import { join } from "@tauri-apps/api/path";
  import { createEventDispatcher } from 'svelte';

  export let projectFolder: string;
  export let selectedFile: string;

  const dispatch = createEventDispatcher();

  interface FileItem {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileItem[];
    expanded?: boolean;
  }

  let fileTree: FileItem[] = [];
  let contextMenu: { x: number; y: number; item: FileItem | null } | null = null;
  let showNewDialog = false;
  let newItemName = "";
  let newItemType: 'file' | 'folder' = 'file';
  let newItemParent: FileItem | null = null;

  // File type icons
  function getFileIcon(name: string, isDirectory: boolean): string {
    if (isDirectory) return '📁';
    if (name.endsWith('.html')) return '📄';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.js') || name.endsWith('.ts')) return '⚡';
    if (name.endsWith('.json')) return '📋';
    if (name.endsWith('.md')) return '📝';
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return '🖼️';
    return '📄';
  }

  // Load directory contents recursively
  async function loadDirectory(dirPath: string): Promise<FileItem[]> {
    try {
      const entries = await readDir(dirPath);
      const items: FileItem[] = [];

      for (const entry of entries) {
        const fullPath = await join(dirPath, entry.name);
        const item: FileItem = {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory,
          expanded: false
        };

        if (entry.isDirectory) {
          item.children = [];
        }

        items.push(item);
      }

      // Sort: directories first, then files, both alphabetically
      return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error loading directory:', error);
      return [];
    }
  }

  // Toggle directory expansion
  async function toggleDirectory(item: FileItem) {
    if (!item.isDirectory) return;

    item.expanded = !item.expanded;
    
    if (item.expanded && (!item.children || item.children.length === 0)) {
      item.children = await loadDirectory(item.path);
    }
    
    fileTree = fileTree; // Trigger reactivity
  }

  // Handle file selection
  function selectFile(item: FileItem) {
    if (!item.isDirectory) {
      dispatch('fileSelected', { 
        fileName: item.name, 
        filePath: item.path 
      });
    }
  }

  // Show context menu
  function showContextMenu(event: MouseEvent, item: FileItem | null) {
    event.preventDefault();
    event.stopPropagation();
    
    contextMenu = {
      x: event.clientX,
      y: event.clientY,
      item
    };
  }

  // Hide context menu
  function hideContextMenu() {
    contextMenu = null;
  }

  // Show new item dialog
  function showNewItemDialog(type: 'file' | 'folder', parent: FileItem | null = null) {
    newItemType = type;
    newItemParent = parent;
    newItemName = "";
    showNewDialog = true;
    hideContextMenu();
  }

  // Create new file or folder
  async function createNewItem() {
    if (!newItemName.trim()) return;

    try {
      const parentPath = newItemParent ? newItemParent.path : projectFolder;
      const newItemPath = await join(parentPath, newItemName.trim());

      if (newItemType === 'folder') {
        await createDir(newItemPath, { recursive: true });
      } else {
        // Create empty file
        await writeTextFile(newItemPath, '');
      }

      // Refresh the tree
      await refreshTree();
      
      // If it's a file, select it
      if (newItemType === 'file') {
        dispatch('fileSelected', { 
          fileName: newItemName.trim(), 
          filePath: newItemPath 
        });
      }

      showNewDialog = false;
    } catch (error) {
      console.error('Error creating new item:', error);
      alert(`Error creating ${newItemType}: ${error}`);
    }
  }

  // Refresh the entire tree
  async function refreshTree() {
    fileTree = await loadDirectory(projectFolder);
  }

  // Initialize tree when component mounts
  $: if (projectFolder) {
    refreshTree();
  }

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      hideContextMenu();
      showNewDialog = false;
    }
  }

  // Close context menu when clicking outside
  function handleDocumentClick() {
    hideContextMenu();
  }
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleDocumentClick} />

<!-- Context Menu -->
{#if contextMenu}
  <div 
    class="fixed z-50 bg-editor-sidebar border border-editor-border rounded-lg shadow-xl py-2 min-w-[160px]"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    on:click|stopPropagation
  >
    <button 
      class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
      on:click={() => showNewItemDialog('file', contextMenu?.item)}
    >
      📄 New File
    </button>
    <button 
      class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
      on:click={() => showNewItemDialog('folder', contextMenu?.item)}
    >
      📁 New Folder
    </button>
    <hr class="my-2 border-editor-border">
    <button 
      class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
      on:click={refreshTree}
    >
      🔄 Refresh
    </button>
  </div>
{/if}

<!-- New Item Dialog -->
{#if showNewDialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-editor-sidebar border border-editor-border rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold text-white mb-4">
        Create New {newItemType === 'file' ? 'File' : 'Folder'}
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            {newItemType === 'file' ? 'File' : 'Folder'} Name
          </label>
          <input 
            type="text" 
            bind:value={newItemName}
            placeholder={newItemType === 'file' ? 'example.html' : 'folder-name'}
            class="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
            on:keydown={(e) => e.key === 'Enter' && createNewItem()}
          />
        </div>
        
        {#if newItemParent}
          <div class="text-sm text-gray-400">
            Creating in: {newItemParent.name}/
          </div>
        {/if}
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <button 
          class="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          on:click={() => showNewDialog = false}
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          on:click={createNewItem}
          disabled={!newItemName.trim()}
        >
          Create
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- File Tree -->
<div class="space-y-1">
  <!-- Root level context menu trigger -->
  <div 
    class="flex items-center justify-between px-2 py-1 text-xs uppercase tracking-wider text-gray-400 font-semibold"
    on:contextmenu={(e) => showContextMenu(e, null)}
  >
    <span>Project Files</span>
    <button 
      class="text-gray-400 hover:text-white text-sm"
      on:click={() => showNewItemDialog('file')}
      title="Add new file"
    >
      ➕
    </button>
  </div>

  {#each fileTree as item}
    <FileTreeItem 
      {item} 
      {selectedFile}
      on:toggle={() => toggleDirectory(item)}
      on:select={() => selectFile(item)}
      on:contextmenu={(e) => showContextMenu(e.detail, item)}
    />
  {/each}
</div>

<!-- File Tree Item Component -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const itemDispatch = createEventDispatcher();
</script>

<!-- Recursive File Tree Item -->
<script lang="ts" context="module">
  export { FileTreeItem };
</script>

<script lang="ts">
  export let item: FileItem;
  export let selectedFile: string;
  export let level: number = 0;
</script>

{#snippet FileTreeItem(props: { item: FileItem, selectedFile: string, level?: number })}
  {@const { item, selectedFile, level = 0 } = props}
  
  <div class="select-none">
    <!-- File/Folder Item -->
    <div 
      class="flex items-center px-2 py-1 hover:bg-gray-700 rounded cursor-pointer group transition-colors"
      class:bg-accent-blue={!item.isDirectory && selectedFile === item.name}
      class:text-white={!item.isDirectory && selectedFile === item.name}
      style="padding-left: {level * 16 + 8}px"
      on:click={() => {
        if (item.isDirectory) {
          itemDispatch('toggle');
        } else {
          itemDispatch('select');
        }
      }}
      on:contextmenu={(e) => {
        e.preventDefault();
        itemDispatch('contextmenu', e);
      }}
    >
      <!-- Expand/Collapse Arrow -->
      {#if item.isDirectory}
        <span class="text-gray-400 text-xs mr-1 transition-transform" class:rotate-90={item.expanded}>
          ▶
        </span>
      {:else}
        <span class="w-3 mr-1"></span>
      {/if}
      
      <!-- Icon -->
      <span class="text-sm mr-2">
        {getFileIcon(item.name, item.isDirectory)}
      </span>
      
      <!-- Name -->
      <span class="text-sm font-mono flex-1 truncate" title={item.name}>
        {item.name}
      </span>
    </div>

    <!-- Children (if directory is expanded) -->
    {#if item.isDirectory && item.expanded && item.children}
      {#each item.children as child}
        <svelte:self 
          item={child} 
          {selectedFile}
          level={level + 1}
          on:toggle
          on:select  
          on:contextmenu
        />
      {/each}
    {/if}
  </div>
{/snippet}
