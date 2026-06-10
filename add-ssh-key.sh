#!/bin/bash

set -euo pipefail

# =========================================
# CONFIG
# =========================================
readonly MACVM_USER="admin"
readonly MACVM_HOST="192.168.64.7"

readonly SSH_MACVM="${MACVM_USER}@${MACVM_HOST}"

readonly SSH_KEY="${HOME}/.ssh/id_ed25519"
readonly SSH_PUB="${SSH_KEY}.pub"
readonly SSH_CONFIG="${HOME}/.ssh/config"
readonly SSH_ALIAS="mac-vm"

echo "========================"
echo "🔐 SSH SETUP (FIXED CLEAN)"
echo "========================"

# =========================================
# 1. CREATE SSH KEY
# =========================================
if [[ ! -f "$SSH_KEY" ]]; then
  echo "🔑 Generating SSH key..."
  ssh-keygen -t ed25519 -N "" -f "$SSH_KEY"
else
  echo "🔑 SSH key already exists"
fi

# =========================================
# 2. COPY KEY TO VM (NO DUPLICATE SAFE)
# =========================================
echo "📡 Installing SSH key..."

ssh "$SSH_MACVM" "
  mkdir -p ~/.ssh &&
  chmod 700 ~/.ssh &&
  touch ~/.ssh/authorized_keys &&
  chmod 600 ~/.ssh/authorized_keys
"

# append ONLY if not exists
ssh "$SSH_MACVM" "
  grep -qxF \"$(cat "$SSH_PUB")\" ~/.ssh/authorized_keys || cat >> ~/.ssh/authorized_keys
" <<< "$(cat "$SSH_PUB")"

# =========================================
# 3. SSH CONFIG (FULL VARIABLE SAFE)
# =========================================
echo "⚙️ Writing SSH config..."

mkdir -p "$(dirname "$SSH_CONFIG")"
touch "$SSH_CONFIG"

if ! grep -q "Host ${SSH_ALIAS}" "$SSH_CONFIG"; then
cat >> "$SSH_CONFIG" <<EOF

Host ${SSH_ALIAS}
  HostName ${MACVM_HOST}
  User ${MACVM_USER}
  IdentityFile ${SSH_KEY}
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
EOF
else
  echo "⚙️ SSH config already exists"
fi

chmod 600 "$SSH_CONFIG"

# =========================================
# 4. PERMISSIONS
# =========================================
chmod 700 ~/.ssh
chmod 600 "$SSH_KEY" 2>/dev/null || true
chmod 600 "$SSH_PUB" 2>/dev/null || true

# =========================================
# 5. TEST
# =========================================
echo "🧪 Testing SSH..."

ssh -o BatchMode=yes "$SSH_ALIAS" "echo '✅ SSH OK - NO PASSWORD'"

# =========================================
# 6. VERIFY SCREEN RECORDING PERMISSION (for `screencapture` over SSH)
#    Apple TCC blocks granting this via script — must be done by hand on the VM.
# =========================================
echo "🧪 Probing Screen Recording permission..."
PROBE=$(ssh "$SSH_ALIAS" 'screencapture -x /tmp/.tcc_probe.png 2>&1; \
  [[ -s /tmp/.tcc_probe.png ]] && echo OK || echo FAIL; \
  rm -f /tmp/.tcc_probe.png' | tail -1)

if [[ "$PROBE" == "OK" ]]; then
  echo "✅ Screen Recording permission OK"
else
  cat <<'HINT'
⚠️  Screen Recording permission MISSING on the VM.
    `screencapture` over SSH will produce empty/black images.

    Grant it MANUALLY on the VM (cannot be scripted — Apple TCC):
      1. On the VM open: System Settings → Privacy & Security
         → "Screen & System Audio Recording" (macOS 14+)  or  "Screen Recording" (macOS 13)
      2. Click "+", press ⌘⇧G, paste:  /usr/libexec/sshd-keygen-wrapper
      3. Enable the toggle next to "sshd-keygen-wrapper"
      4. Restart sshd:  sudo launchctl kickstart -k system/com.openssh.sshd
         (or reboot the VM)
      5. Re-run this script to re-probe.
HINT
fi

echo "========================"
echo "✅ DONE"
echo "👉 ssh ${SSH_ALIAS}"
echo "========================"