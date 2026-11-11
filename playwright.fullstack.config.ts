import 'dotenv/config';
import { defineConfig } from '@playwright/test';
const url = process.env.TEST_DATABASE_URL;
if (!url || !['localhost', '127.0.0.1'].includes(new URL(url).hostname) || !new URL(url).pathname.endsWith('_test')) throw new Error('Set TEST_DATABASE_URL to a migrated local *_test database.');
export default defineConfig({
  testDir: './tests', testMatch: 'fullstack.spec.ts', workers: 1, timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:5180', reducedMotion: 'reduce', timezoneId: 'Europe/Kyiv', trace: 'retain-on-failure' },
  webServer: [
    { command: 'node --import tsx server/index.ts', url: 'http://127.0.0.1:3009/api/health', env: { DATABASE_URL: url, PORT: '3009', APP_ORIGIN: 'http://127.0.0.1:5180' } },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5180 --strictPort', url: 'http://127.0.0.1:5180', env: { API_PORT: '3009', VITE_DEMO_MODE: 'false' } },
  ],
});
