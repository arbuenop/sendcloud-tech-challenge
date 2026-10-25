/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { configDefaults, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      '**/*.spec.ts', // Playwright specs
      '**/e2e/**',
      '**/part-2/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['part-1/scripts/**/*.ts', 'part-1-lite/scripts/**/*.ts'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/e2e/**',
        '**/types.ts',
        '**/index.ts', // wiring only
        '**/controller.ts', // covered by Playwright e2e
        '**/controller/**', // covered by Playwright e2e
        '**/part-2/**', // don't apply
      ],
    },
  },
});
