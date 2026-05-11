import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-crossorigin',
      enforce: 'post',
      transformIndexHtml(html) {
        return html
          .replace(/ crossorigin/g, '')
          .replace(/<link rel="modulepreload"[^>]*>/g, '')
      },
    },
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    target: 'ES2020',
    modulePreload: false,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background.ts'),
        options: path.resolve(__dirname, 'options.html'),
        sidepanel: path.resolve(__dirname, 'sidepanel.html'),
        content: path.resolve(__dirname, 'src/contentScript/content.ts'),
        phitronContent: path.resolve(__dirname, 'src/contentScript/phitronContent.ts'),
        colabBridge: path.resolve(__dirname, 'src/contentScript/colabBridge.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        inlineDynamicImports: false,
        manualChunks(id) {
          // Don't chunk content scripts - inline everything
          if (
            id.includes('contentScript/phitronContent') ||
            id.includes('contentScript/content') ||
            id.includes('contentScript/colabBridge')
          ) {
            return undefined
          }
          // Keep other entry points chunked normally
          return null
        },
      },
    },
  },
})
