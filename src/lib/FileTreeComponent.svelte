<script lang="ts">
  import { readDir, writeTextFile, mkdir, remove, stat } from "@tauri-apps/plugin-fs";
  import { join } from "@tauri-apps/api/path";
  import { createEventDispatcher } from 'svelte';
  import { getFileIcon, type FileIconInfo, File, Folder } from './FileIcons';
  import { Plus, RotateCcw, Trash2, ChevronRight } from 'lucide-svelte';

  export let projectFolder: string;
  export let selectedFile: string;

  const dispatch = createEventDispatcher();

  interface FileItem {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileItem[];
    expanded?: boolean;
    icon?: FileIconInfo;
  }

  let fileTree: FileItem[] = [];
  let contextMenu: { x: number; y: number; item: FileItem | null } | null = null;
  let showNewDialog = false;
  let showDeleteDialog = false;
  let newItemName = "";
  let newItemType: 'file' | 'folder' = 'file';
  let newItemParent: FileItem | null = null;
  let deleteItem: FileItem | null = null;




  // Load directory contents
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
          expanded: false,
          icon: getFileIcon(entry.name, entry.isDirectory, false)
        };

        if (entry.isDirectory) {
          item.children = [];
        }

        items.push(item);
      }

      // Sort: directories first, then files alphabetically
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
    
    // Update icon to reflect expanded state
    item.icon = getFileIcon(item.name, item.isDirectory, item.expanded);
    
    if (item.expanded && (!item.children || item.children.length === 0)) {
      item.children = await loadDirectory(item.path);
    }
    
    fileTree = [...fileTree]; // Trigger reactivity
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
    
    // Calculate position to keep menu on screen
    const menuWidth = 180;
    const menuHeight = 120; // Approximate height
    const x = event.clientX + menuWidth > window.innerWidth 
      ? event.clientX - menuWidth 
      : event.clientX;
    const y = event.clientY + menuHeight > window.innerHeight 
      ? event.clientY - menuHeight 
      : event.clientY;
    
    contextMenu = {
      x: Math.max(0, x),
      y: Math.max(0, y),
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
    
    // Auto-focus input field after a brief delay
    setTimeout(() => {
      const input = document.getElementById('newItemName');
      if (input) input.focus();
    }, 100);
  }

  // Create new file or folder
  async function createNewItem() {
    if (!newItemName.trim()) return;

    try {
      const parentPath = newItemParent ? newItemParent.path : projectFolder;
      const newItemPath = await join(parentPath, newItemName.trim());

      if (newItemType === 'folder') {
        await mkdir(newItemPath, { recursive: true });
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

  // Show delete confirmation dialog
  function showDeleteConfirmation(item: FileItem) {
    deleteItem = item;
    showDeleteDialog = true;
    hideContextMenu();
  }

  // Delete file or folder
  async function confirmDelete() {
    if (!deleteItem) return;

    try {
      await remove(deleteItem.path, { recursive: deleteItem.isDirectory });
      
      // If the deleted file was selected, clear selection
      if (!deleteItem.isDirectory && selectedFile === deleteItem.name) {
        dispatch('fileSelected', { 
          fileName: '', 
          filePath: ''
        });
      }

      // Refresh the tree
      await refreshTree();
      
      showDeleteDialog = false;
      deleteItem = null;
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error deleting ${deleteItem?.isDirectory ? 'folder' : 'file'}: ${error}`);
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
      showDeleteDialog = false;
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
  <!-- Background overlay -->
  <div 
    class="fixed inset-0 z-40"
    role="button"
    tabindex="0"
    on:click={hideContextMenu}
    on:keydown={(e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        hideContextMenu();
      }
    }}
    aria-label="Close context menu"
  ></div>
  
  <!-- Context Menu -->
  <div 
    class="fixed z-50 bg-gray-850 border border-gray-600 rounded-lg shadow-lg py-2 min-w-[180px]"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px; background-color: rgb(26, 32, 44);"
    role="menu"
    tabindex="-1"
    on:click|stopPropagation
    on:keydown={() => {}}
  >
    <!-- Show different options based on whether we're right-clicking on a folder or not -->
    {#if contextMenu?.item?.isDirectory}
      <!-- For folders: show options to create inside the folder -->
      <button 
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
        on:click={() => showNewItemDialog('file', contextMenu?.item)}
      >
        <File size={14} />
        New File
      </button>
      <button 
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
        on:click={() => showNewItemDialog('folder', contextMenu?.item)}
      >
        <Folder size={14} />
        New Folder
      </button>
    {:else}
      <!-- For root or files: show general options -->
      <button 
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
        on:click={() => showNewItemDialog('file', null)}
      >
        <File size={14} />
        New File
      </button>
      <button 
        class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
        on:click={() => showNewItemDialog('folder', null)}
      >
        <Folder size={14} />
        New Folder
      </button>
    {/if}
    
    <hr class="my-1 border-gray-600">
    <button 
      class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
      on:click={refreshTree}
    >
      <RotateCcw size={14} />
      Refresh
    </button>
    {#if contextMenu?.item}
      <hr class="my-2 border-editor-border">
      <button 
        class="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-600 hover:text-white flex items-center gap-2 transition-colors"
        on:click={() => contextMenu?.item && showDeleteConfirmation(contextMenu.item)}
      >
        <Trash2 size={14} />
        Delete {contextMenu.item.isDirectory ? 'Folder' : 'File'}
      </button>
    {/if}
  </div>
{/if}

<!-- New Item Dialog -->
{#if showNewDialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-w-md mx-4">
      <h3 class="text-lg font-semibold text-white mb-4">
        Create New {newItemType === 'file' ? 'File' : 'Folder'}
      </h3>
      
      <div class="space-y-4">
        <div>
          <label for="newItemName" class="block text-sm font-medium text-gray-300 mb-2">
            {newItemType === 'file' ? 'File' : 'Folder'} Name
          </label>
          <input 
            id="newItemName"
            type="text" 
            bind:value={newItemName}
            placeholder={newItemType === 'file' ? 'example.html' : 'folder-name'}
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={createNewItem}
          disabled={!newItemName.trim()}
        >
          Create
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Dialog -->
{#if showDeleteDialog && deleteItem}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-w-md mx-4">
      <h3 class="text-lg font-semibold text-white mb-4">
        Delete {deleteItem.isDirectory ? 'Folder' : 'File'}
      </h3>
      
      <div class="space-y-4">
        <div class="text-sm text-gray-300">
          Are you sure you want to delete <span class="font-mono text-white">"{deleteItem.name}"</span>?
          {#if deleteItem.isDirectory}
            <div class="mt-2 text-red-300 font-medium">
              ⚠️ This will permanently delete the folder and all its contents.
            </div>
          {:else}
            <div class="mt-2 text-red-300">
              This action cannot be undone.
            </div>
          {/if}
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <button 
          class="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          on:click={() => { showDeleteDialog = false; deleteItem = null; }}
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          on:click={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- File Tree Header -->
<div class="space-y-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
  <div 
    class="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 bg-gray-800"
    role="button"
    tabindex="0"
    on:contextmenu={(e) => showContextMenu(e, null)}
    on:keydown={() => {}}
  >
    <span>Project Files</span>
    
    <div class="flex items-center gap-1">
      <!-- Refresh button -->
      <button 
        class="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded transition-colors"
        on:click={refreshTree}
        title="Refresh file tree"
      >
        <RotateCcw size={14} />
      </button>
      
      <!-- Add new file button -->
      <button 
        class="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded transition-colors"
        on:click={() => showNewItemDialog('file')}
        title="Add new file"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>

  <!-- File Tree Items -->
  <div class="py-2">
    {#each fileTree as item}
      {@render TreeItem(item, 0)}
    {/each}
  </div>
</div>

<!-- Tree Item Snippet -->
{#snippet TreeItem(item: FileItem, level: number)}
  <div class="select-none">
    <!-- File/Folder Item -->
    <div 
      class="flex items-center px-2 py-1.5 hover:bg-gray-700 rounded-sm cursor-pointer group transition-colors mx-1"
      class:bg-blue-600={!item.isDirectory && selectedFile === item.name}
      class:text-white={!item.isDirectory && selectedFile === item.name}
      class:hover:bg-blue-700={!item.isDirectory && selectedFile === item.name}
      style="padding-left: {level * 20 + 12}px"
      role="button"
      tabindex="0"
      on:click={() => {
        if (item.isDirectory) {
          toggleDirectory(item);
        } else {
          selectFile(item);
        }
      }}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (item.isDirectory) {
            toggleDirectory(item);
          } else {
            selectFile(item);
          }
        }
      }}
      on:contextmenu={(e) => {
        e.preventDefault();
        showContextMenu(e, item);
      }}
    >
      <!-- Expand/Collapse Arrow -->
      {#if item.isDirectory}
        <span class="text-gray-400 mr-2 transition-transform flex-shrink-0" class:rotate-90={item.expanded}>
          <ChevronRight size={14} />
        </span>
      {:else}
        <span class="w-4 mr-2"></span>
      {/if}
      
      <!-- Icon -->
      <span class="mr-2 flex-shrink-0" style="color: {item.icon?.color}">
        {#if item.icon?.component}
          <svelte:component this={item.icon.component} size={16} />
        {/if}
      </span>
      
      <!-- Name -->
      <span class="text-sm flex-1 truncate" title={item.name}>
        {item.name}
      </span>
    </div>

    <!-- Children (if directory is expanded) -->
    {#if item.isDirectory && item.expanded && item.children}
      {#each item.children as child}
        {@render TreeItem(child, level + 1)}
      {/each}
    {/if}
  </div>
{/snippet}
