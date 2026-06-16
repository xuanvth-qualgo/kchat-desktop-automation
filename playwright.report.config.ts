import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
   testDir:     './tests',
   testMatch:   ['**/*.report.ts'],
   timeout:     120_000,
   retries:     0,
   workers:     1,
   reporter:    [['list']],
   use: {
      headless:      true,
      actionTimeout: 10_000,
   },
});
