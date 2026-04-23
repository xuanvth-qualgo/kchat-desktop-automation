#!/bin/bash

echo "1. Configuring"
MAC_VM="xuan.vth@192.168.64.4"
WIN_VM="xuan.vth@192.168.100.148"
PROJECT_PATH="$(pwd)"
PROJECT_NAME=$(basename "$PWD")
PARENT_DIR="$(dirname "$PROJECT_PATH")"
APP_NAME="KChat QA"

echo "2. Running on real macOS machine"
(
cd "$PROJECT_PATH"
if [ ! -d "node_modules" ]; then
    ./setup.sh
else
    echo "node_modules already exists → skip setup.sh"
fi
open "./Applications/macOS/$APP_NAME.app"
) &

echo "3. Running on virtual macOS machine"
cd "$PARENT_DIR"
rm -rf $PROJECT_NAME $MAC_VM:~
scp -r $PROJECT_NAME $MAC_VM:~
ssh "$MAC_VM" "
cd ~/$PROJECT_NAME
if [ ! -d "node_modules" ]; then
    ./setup.sh
else
    echo "node_modules already exists → skip setup.sh"
fi
open \"./Applications/macOS/$APP_NAME.app\"
" &

echo "4. Running on virtual Windows machine"
rm -rf $PROJECT_NAME $WIN_VM:/c/Users/
scp -r $PROJECT_NAME $WIN_VM:/c/Users/
ssh "$WIN_VM" "
cd /c/Users/$PROJECT_NAME
if [ ! -d "node_modules" ]; then
    ./setup.bat
else
    echo "node_modules already exists → skip setup.bat"
fi
start \"\" \"Applications\\win32\\$APP_NAME.exe\"
" &

echo "5. Waiting to complete"
wait

echo "DONE"