@echo off

echo - Initializing npm if not existing
IF NOT EXIST package.json (
  npm init -y
)

echo - Installing dotenv
npm install dotenv

echo - Installing Playwright and browsers
npm install -D @playwright/test
npx playwright install

echo - Installing electron
npm install -D electron

echo - Installing allure-playwright
npm install -D allure-playwright

echo - Creating playwright config if not existing
IF NOT EXIST playwright.config.ts (
(
echo import { defineConfig } from '@playwright/test';
echo.
echo export default defineConfig^({
echo   testDir: './tests',
echo   timeout: 30000,
echo   retries: 0,
echo   use: ^{
echo     headless: true,
echo   ^},
echo ^});
) > playwright.config.ts
)

echo DONE