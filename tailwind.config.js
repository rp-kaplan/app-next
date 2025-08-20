/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#1e1e1e',
        'editor-sidebar': '#252526',
        'editor-topbar': '#2d2d30',
        'editor-border': '#3e3e42',
        'accent-blue': '#0e639c',
        'accent-green': '#16c60c',
        'accent-red': '#d13438',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        'ui': ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
