# 1. Github flow

git clone "https://github.com/xuanvth-qualgo/kchat-desktop-automation.git" && cd kchat-desktop-automation

git update-index --chmod=+x *.sh

git fetch --all

git checkout -b demo-1 origin/demo-1

git add -A

git diff --staged

git reset {file}

git commit -m "{datetime} - {jira id} - {summary}"

git push origin demo-1

git status

# 2. Find IP Address on the virtual machines (Terminal)

MacOS: ipconfig getifaddr en0

Windows: ipconfig 

# 3. Start app:

MacOS: real machine

./start-app.sh

# 4. Setup dependencies: if run outside

MacOS:

./setup.sh

Windows:

.\setup.bat

# 5. Run test by manually: 

Default (headless): npx playwright test  

Headed:  npx playwright test --headed 

Debug: npx playwright test --debug 

# 6. Others:

Applications: app de run
core: xuong song
helpers: tien ich
locators: xpath, css element
screens: man hinh thuc hien thao tac
suites: flow hoan chinh can test (test suite)
tests: execute 
screenshots: evidence
test-results, playwright-report: cua playwright tu gen