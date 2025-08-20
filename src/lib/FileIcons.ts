import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  FileCode,
  Braces,
  Palette,
  Globe
} from 'lucide-svelte';

export interface FileIconInfo {
  component: any;
  color: string;
}

export function getFileIcon(fileName: string, isDirectory: boolean, isExpanded: boolean = false): FileIconInfo {
  if (isDirectory) {
    return {
      component: isExpanded ? FolderOpen : Folder,
      color: '#dcb67a'
    };
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    // Web files
    case 'html':
    case 'htm':
      return { component: Globe, color: '#e34c26' };
    
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return { component: Palette, color: '#1572b6' };
    
    case 'js':
    case 'mjs':
    case 'jsx':
      return { component: FileCode, color: '#f7df1e' };
    
    case 'ts':
    case 'tsx':
      return { component: FileCode, color: '#3178c6' };
    
    // Config and data files
    case 'json':
    case 'jsonc':
      return { component: Braces, color: '#cbcb41' };
    
    // Documentation
    case 'md':
    case 'markdown':
      return { component: FileText, color: '#083fa1' };
    
    case 'txt':
    case 'log':
      return { component: FileText, color: '#6d6d6d' };
    
    default:
      return { component: File, color: '#6d6d6d' };
  }
}

export { 
  Folder, 
  FolderOpen, 
  File,
  FileText, 
  FileCode, 
  Braces,
  Palette,
  Globe
};
