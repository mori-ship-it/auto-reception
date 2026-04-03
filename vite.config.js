import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        drink: 'drink.html',
        register: 'register.html'
      }
    }
  }
})
