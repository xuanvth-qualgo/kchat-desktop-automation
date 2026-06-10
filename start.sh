#!/bin/bash

set -euo pipefail

# ========================================
# CONFIG
# ========================================
MAC_VM="admin@192.168.64.7"

PROJECT_NAME=$(basename "$PWD")
PROJECT_PATH="$PWD"

APP_DIR="kchat-qa"
APP_NAME="KChat QA"
APP_PATH="Applications/macOS/$APP_NAME.app"
APP_BIN="$APP_PATH/Contents/MacOS"

# ========================================
# LOG
# ========================================
log() {
  echo ""
  echo "========================================"
  echo "$1"
  echo "========================================"
}

# ========================================
# 1. HOST - CLEAN UP LOGS
# ========================================
log "[1] HOST - CLEAN UP LOGS"

rm -rf "$HOME/Library/Logs/"*$APP_DIR* || true
rm -rf "$HOME/Library/Application Support/"*$APP_DIR* || true
rm -rf "$HOME/Library/Caches/"*$APP_DIR* || true
rm -rf "$HOME/Library/Saved Application State/"*$APP_DIR* || true

echo "[HOST] clean app-logs folder"
rm -rf "$PROJECT_PATH/app-logs"/* || true

# ========================================
# 2. HOST - SETUP
# ========================================
log "[2] HOST - SETUP"

cd "$PROJECT_PATH"

if [ ! -d node_modules ]; then
  echo "[HOST] setup"
  chmod +x setup.sh
  ./setup.sh
fi

# ========================================
# 3. VIRTUAL - CLEAN UP LOGS
# ========================================
log "[3] VIRTUAL - CLEAN UP LOGS"

ssh "$MAC_VM" "bash -lc '
pkill -f \"$APP_NAME\" || true

rm -rf \"\$HOME/Library/Application Support/\"*$APP_DIR* || true
rm -rf \"\$HOME/Library/Caches/\"*$APP_DIR* || true
rm -rf \"\$HOME/Library/Saved Application State/\"*$APP_DIR* || true
rm -rf \"\$HOME/Library/Logs/\"*$APP_DIR* || true

if [ -d \"\$HOME/$PROJECT_NAME\" ]; then
  rm -rf \"\$HOME/$PROJECT_NAME\"/app-*/* \"\$HOME/$PROJECT_NAME\"/test-*/* || true
fi
'"

# ========================================
# 4. VIRTUAL - SYNC UP CODE
# ========================================
log "[4] VIRTUAL - SYNC UP CODE"

if ssh "$MAC_VM" "test -d \"\$HOME/$PROJECT_NAME\""; then
  for dir in "$PROJECT_PATH"/app-* "$PROJECT_PATH"/test-*; do
    [ -d "$dir" ] || continue
    dirname=$(basename "$dir")
    rsync -av "$dir/" "$MAC_VM:$PROJECT_NAME/$dirname/"
  done
else
  rsync -av \
    "$PROJECT_PATH/" \
    "$MAC_VM:$PROJECT_NAME/"
fi

# ========================================
# DONE
# ========================================
log "DONE"