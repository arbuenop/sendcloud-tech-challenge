import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './part-1/scripts/e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: [
    {
      command: 'npm run mock-backend',
      url: 'http://localhost:3000/shipping-methods', // your mock backend's port and a GET route
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173/part-1/new-shipment.html',
      reuseExistingServer: true,
      env: { VITE_API_BASE_URL: 'http://localhost:3000' }, // same address as the mock backend
    },
  ],
});
