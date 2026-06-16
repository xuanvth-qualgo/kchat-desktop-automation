# Install & Setup

## 0. Platform & Prerequisites

**Platform**: macOS (`.app`) · Windows (`.exe`)

### Global (PC)

#### Visual Studio Code
- Download: https://code.visualstudio.com/download

#### Node.js (LTS)
- Download: https://nodejs.org/en/download
- Verify on Terminal:
```bash
node -v
npm -v
```

### Local (Project)

#### Create a new project
> Skip if cloning `kchat-desktop-automation` repo from GitHub.

```bash
cd <path_name of new project>
mkdir <project_name>
cd <project_name>
```

#### Create a new `.env` / `.env.example`
> Skip if cloning `kchat-desktop-automation` repo from GitHub.

`.env` (public key) / `.env.example` (private key):

```dotenv
MAC_APP_PATH=/Users/<username>/Automation/kchat-desktop/Applications/KChat QA.app/Contents/MacOS/KChat QA
WIN_APP_PATH=C:\\Users\\<username>\\Automation\\kchat-desktop\\Applications\\KChat-QA.exe
```

### Virtual Machine (on Mac host)

#### Setup Windows VM on Mac
- **VMware Fusion**: https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion

#### Setup macOS VM on Mac
- **Orka Desktop**: https://github.com/macstadium/orka-desktop/releases

> After installing the VM:
> 1. Enable **Remote Login (SSH)** on the VM (`System Settings → General → Sharing → Remote Login`).
> 2. Use bridged networking so the VM has its own LAN IP (see §2 to retrieve it).
> 3. Create the same `admin` user on the VM (see §5).

---

## 1. Github flow

```bash
git clone "https://github.com/xuanvth-qualgo/kchat-desktop-automation.git" && cd kchat-desktop-automation

git fetch --all

git checkout -b demo-1 origin/demo-1

git add -A

git diff --staged

git reset {file}

git commit -m "{datetime} - {jira id} - {summary}"

git push origin demo-1

git status
```

---

## 2. Find IP Address (Terminal at VM)

```bash
ipconfig getifaddr en0
```

---

## 3. Setup brew and node (Terminal at Host and VM)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo >> /Users/admin/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/admin/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"

brew --version

brew install node

node -v
npm -v
```

---

## 4. Setup and save first login account

### 4.1. Open Terminal 1 — at Host

```bash
cd kchat-desktop-automation

pkill -9 -f "KChat QA"; sleep 2

chmod +x ./add-ssh-key.sh && ./add-ssh-key.sh

chmod +x ./start.sh && ./start.sh

npx playwright test first-login.test.ts
# save at app-logs/kchat-qa/

open "./Applications/macOS/KChat QA.app" --args --disable-gpu
# save at Library/Application Support/kchat-qa/
```

### 4.2. Open Terminal 2 — at Host (ssh to VM)

```bash
ssh admin@192.168.64.7

cd kchat-desktop-automation

pkill -9 -f "KChat QA"; sleep 2

open "./Applications/macOS/KChat QA.app" --args --disable-gpu
# save at Library/Application Support/kchat-qa/
```

### 4.3. Open Terminal 3 — at VM

```bash
npx playwright test first-login.test.ts
# save at app-logs/kchat-qa/
```

---

## 5. Account

- **Mac User**: `xuanvth`
- **VM Mac User**: `admin` / `admin`

---

## 6. Sync updated KChat-Desktop app to VM

```bash
chmod +x ./sync-app.sh && ./sync-app.sh
```