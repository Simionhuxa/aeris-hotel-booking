import { defineConfig } from '@playwright/test';
import local from '../playwright.config';

export default defineConfig({
  ...local,
  testDir: '../tests',
  outputDir: '../test-results/firebase',
  use: { ...local.use, baseURL: 'https://hotel-booking-portfolio-7c9a2.web.app' },
});
