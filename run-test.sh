#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

TEST_ARGS="$@"

echo "==> [1/5] Clean old reports"
rm -rf test-results playwright-report allure-results allure-report test-screenshots


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
npx allure serve allure-results

exit $TEST_EXIT
