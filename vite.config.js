import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [visualizer({ open: true })], // opens a chart after `npm run build`
  build: {
    rollupOptions: {
      input: {
        newPost: fileURLToPath(new URL('./part-1/new-shipment.html', import.meta.url)),
        newPostSimplified: fileURLToPath(
          new URL('./part-1-lite/new-shipment.html', import.meta.url),
        ),
        posts: fileURLToPath(new URL('./part-2/shipments.html', import.meta.url)),
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
  },
});
// vite.config.ts
