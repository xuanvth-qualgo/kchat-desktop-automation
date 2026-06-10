import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    workers: 1,
    timeout: 360000,
    retries: 1,
    expect: {
        timeout: 8_000,
    },
    use: {
        headless:      true,
        actionTimeout: 10_000,
        trace:         'on-first-retry',
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
