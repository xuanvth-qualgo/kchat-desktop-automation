#!/bin/bash 
echo - Initializing npm if not existing 
if [ ! -f "package.json" ]; then 
npm init -y fi 

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
if [ ! -f "playwright.config.ts" ]; then 
cat <<EOF > playwright.config.ts 
import { defineConfig } from '@playwright/test'; 

export default defineConfig({ 
    testDir: './tests', 
    timeout: 30000, 
    retries: 0, 
    use: { headless: true, }, 
}); 
EOF fi 

echo "DONE"