#!/bin/bash

set -euo pipefail

# ========================================
# CONFIG
# ========================================
MAC_VM="${MAC_VM:-${VM_USER:-admin}@${VM_IPADDR:-192.168.64.7}}"

PROJECT_NAME=$(basename "$PWD")
PROJECT_PATH="$PWD"

APP_NAME="KChat QA"
APP_DIR="Applications"

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
# ARG PARSING
# ========================================
SYNC_APP=false
EXTRA_PATHS=()

if [ "$#" -eq 0 ]; then
  SYNC_APP=true
else
  for arg in "$@"; do
    case "$arg" in
      --app) SYNC_APP=true ;;
      -h|--help)
        sed -n '2,25p' "$0"
        exit 0
        ;;
      *) EXTRA_PATHS+=("$arg") ;;
    esac
  done
fi

# ========================================
# 1. ENSURE VM PROJECT DIR EXISTS
# ========================================
ssh "$MAC_VM" "mkdir -p \"\$HOME/$PROJECT_NAME\""

# ========================================
# 2. SYNC APP BUNDLE (optional)
# ========================================
if [ "$SYNC_APP" = true ]; then
  log "[APP] Syncing \"$APP_DIR/\" folder to $MAC_VM"

  if [ ! -d "$PROJECT_PATH/$APP_DIR" ]; then
    echo "ERROR: $APP_DIR not found at $PROJECT_PATH" >&2
    exit 1
  fi

  echo "[VM] killing running \"$APP_NAME\""
  ssh "$MAC_VM" "pkill -9 -f \"$APP_NAME\" || true"

  echo "[VM] ensure target dir"
  ssh "$MAC_VM" "mkdir -p \"\$HOME/$PROJECT_NAME/$APP_DIR\""

  echo "[HOST] rsync $APP_DIR/ (mirror, --delete)"
  rsync -av --delete \
    "$PROJECT_PATH/$APP_DIR/" \
    "$MAC_VM:$PROJECT_NAME/$APP_DIR/"
fi

# ========================================
# 3. SYNC EXTRA PATHS (optional)
# ========================================
if [ "${#EXTRA_PATHS[@]}" -gt 0 ]; then
  log "[FILES] Syncing ${#EXTRA_PATHS[@]} path(s) to $MAC_VM"

  for raw in "${EXTRA_PATHS[@]}"; do
    # Normalize: strip leading "./" and absolute prefix if it points inside project.
    p="${raw#./}"
    case "$p" in
      "$PROJECT_PATH"/*) p="${p#$PROJECT_PATH/}" ;;
      /*) echo "SKIP (outside project): $raw" >&2; continue ;;
    esac

    src="$PROJECT_PATH/$p"
    if [ ! -e "$src" ]; then
      echo "SKIP (not found): $src" >&2
      continue
    fi

    # Ensure parent dir exists on VM
    parent=$(dirname "$p")
    ssh "$MAC_VM" "mkdir -p \"\$HOME/$PROJECT_NAME/$parent\""

    if [ -d "$src" ]; then
      echo "[HOST] rsync dir  $p/"
      rsync -av --delete "$src/" "$MAC_VM:$PROJECT_NAME/$p/"
    else
      echo "[HOST] rsync file $p"
      rsync -av "$src" "$MAC_VM:$PROJECT_NAME/$p"
    fi
  done
fi

log "DONE"
