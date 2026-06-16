#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

TEST_ARGS="$@"

echo "==> [1/5] Clean old reports"
rm -rf test-results playwright-report allure-results allure-report report.zip

echo "==> [2/5] Run tests ${TEST_ARGS:-(all)}"
npx playwright test $TEST_ARGS
TEST_EXIT=$?
echo "    tests exit code: $TEST_EXIT"

echo "==> [3/5] Generate Allure report"
if [ ! -d "allure-results" ] || [ -z "$(ls -A allure-results 2>/dev/null)" ]; then
   echo "    no allure-results produced — abort"
   exit 1
fi
npx allure generate allure-results --clean -o allure-report

echo "==> [4/5] Zip allure-report → report.zip"
(cd allure-report && zip -qr ../report.zip .)
ls -lh report.zip

echo "==> [5/5] Send report.zip via kChat to ${REPORT_TO:-KChat Desktop Automation Report}"
npx playwright test --config=playwright.report.config.ts

echo "==> Done. Test exit code was: $TEST_EXIT"
echo "==> Opening Allure report for sender..."
npx allure open allure-report &

exit $TEST_EXIT
