# 🚀 Project Builder - Web Development IDE

A modern, desktop-based web development environment built with Tauri, SvelteKit, and TypeScript. Create, edit, and preview web projects with an integrated file tree, Monaco editor, and live server.

## ✨ Features

- **File Management**: Interactive file tree with create, delete, and organize operations
- **Code Editor**: Monaco Editor with syntax highlighting for HTML, CSS, and JavaScript/TypeScript
- **Live Preview**: Built-in development server with live preview functionality
- **Project Templates**: Automatically generates starter files (HTML, CSS, JS)
- **Modern UI**: Clean, professional interface with proper accessibility support
- **Cross-Platform**: Desktop application that runs on Windows, macOS, and Linux

## 🛠️ Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install from rustup.rs](https://rustup.rs/)
- **Git** - [Download here](https://git-scm.com/)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/rp-kaplan/app-next.git
   cd app-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   This will start the Vite development server at `http://localhost:1420`

4. **Run the Tauri desktop app** (in a new terminal)
   ```bash
   npm run tauri dev
   ```
   This will compile the Rust backend and launch the desktop application

### 🔧 Available Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run tauri dev` - Start the Tauri development environment
- `npm run tauri build` - Build the desktop application for distribution
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run type checking in watch mode

### 📁 Project Structure

```
app-next/
├── src/                    # Frontend source code
│   ├── lib/               # Svelte components and utilities
│   │   ├── FileTreeComponent.svelte
│   │   ├── MonacoEditor.svelte
│   │   ├── FileIcons.ts
│   │   └── templates.ts
│   ├── routes/            # SvelteKit routes
│   │   └── +page.svelte
│   └── app.html           # Main HTML template
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Main Rust entry point
│   │   └── lib.rs         # Library functions
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── static/                # Static assets
└── package.json           # Node.js dependencies and scripts
```

## 🎯 Usage

1. **Launch the application**
2. **Choose a project folder** - Select or create a folder for your web project
3. **Start coding** - The app will create starter files (index.html, style.css, script.js)
4. **Use the file tree** to navigate and manage your project files
5. **Edit code** in the Monaco editor with syntax highlighting
6. **Start the server** to preview your project in the browser
7. **Save your work** with Ctrl/Cmd + S or the Save button

## 🔧 Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) 
- [Svelte Extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [Rust Analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 🚀 Building for Production

To create a distributable version of the application:

```bash
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the existing [Issues](https://github.com/rp-kaplan/app-next/issues)
2. Create a new issue with detailed information
3. Join our discussions in the [Discussions](https://github.com/rp-kaplan/app-next/discussions) tab
