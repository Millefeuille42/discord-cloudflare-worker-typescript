import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/register',
    target: 'node20',
    sourcemap: true,
    minify: true,
    emptyOutDir: true,
    lib: {
      entry: 'src/register/register.ts',
      formats: ['es'],
      fileName: () => 'register.js'
    },
    ssr: true,
  },
})
