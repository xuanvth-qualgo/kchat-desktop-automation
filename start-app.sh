#!/bin/bash

sudo -v

PROJECT="/Users/xuan.vth/Automation/kchat-desktop"

echo "Start user 503..."
sudo launchctl asuser 503 bash -c "cd '$PROJECT' && npm run open-app"

echo "Start user 504..."
sudo launchctl asuser 504 bash -c "cd '$PROJECT' && npm run open-app"

echo "Start user 505..."
sudo launchctl asuser 505 bash -c "cd '$PROJECT' && npm run open-app"

wait
echo "Done"