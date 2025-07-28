import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/worker',
    target: 'es2020',
    sourcemap: true,
    minify: true,
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/worker/index.ts',
      output: {
        entryFileNames: 'main.js',
        format: 'es'
      }
    }
  },
})
