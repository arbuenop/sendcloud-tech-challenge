import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        newPost: fileURLToPath(new URL('./part-1/new-shipment.html', import.meta.url)),
        posts: fileURLToPath(new URL('./part-2/shipments.html', import.meta.url)),
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
  },
})