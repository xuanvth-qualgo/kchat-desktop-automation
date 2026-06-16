import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './tests',
    testIgnore: ['**/*.report.ts'],   // exclude post-run helper test (send-report.report.ts)
    fullyParallel: true,
    workers: 1,
    timeout: 0,        // disable test-level timeout
    retries: 0,        // retry manually via stepWithRetry
    expect: {
        timeout: 8_000,
    },
    use: {
        headless:      true,
        actionTimeout: 10_000,
        trace:         'retain-on-failure',
        screenshot:    'only-on-failure',
        video:         'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['allure-playwright', {
            detail: false,
            outputFolder: 'allure-results',
            suiteTitle: false,
            environmentInfo: {
                node: process.version,
                os: process.platform,
            },
        }],
    ],
});
