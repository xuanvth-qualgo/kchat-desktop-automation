# Test Guide

> **Prerequisite**: complete environment setup in [`Install&Setup.md`](./Install&Setup.md) first.

---

## 1. Pre-test checklist

Before running any test, make sure the following are **ready** (missing items will cause failures).

### 1.1. Test accounts (kchat server)
Register 2 accounts on the KChat QA backend:

| Role     | Default login | Env override     |
|----------|---------------|------------------|
| Sender   | `autotest01`  | `HOST_ACCOUNT`   |
| Receiver | `autotest02`  | `VM_ACCOUNT`     |

Both must be **friends of each other** and have completed first-login (see `Install&Setup.md` §4).

### 1.2. Conversations (prepared manually on KChat)
Log in as `autotest01` (Host) and create in advance:

| Name                           | Type        | Members                  | Used for |
|--------------------------------|-------------|--------------------------|----------|
| `autotest02` (DM)              | Direct      | autotest01 ↔ autotest02  | Direct context |
| `Group A`                      | Group       | autotest01 + autotest02  | Group context  |
| `Automation Test Community`    | Community   | autotest01 + autotest02  | Community context |
| ↳ `General`                    | Channel     | (default)                | Community → main |
| ↳ `Announcement`               | Channel     | (default)                | Community → announce |

### 1.3. Test data files
Ensure `test-data/` contains all media samples (already committed in repo):
```
test-data/demo.jpeg
test-data/demo.mp4
test-data/demo.pdf
test-data/demo.txt
```
Verify: `ls test-data/demo.*`

### 1.4. Environment variables (`.env`)
Minimum configuration:

```dotenv
# App binary (required)
MAC_APP_PATH=/Users/<host_user>/path/to/KChat QA.app/Contents/MacOS/KChat QA
WIN_APP_PATH=C:\\Users\\<user>\\...\\KChat-QA.exe

# VM connection (required for multi-machine runs)
VM_PLATFORM=macOS              # macOS | Windows
VM_IPADDR=192.168.64.7         # obtained from Install&Setup §2
VM_USER=admin
VM_APP_PATH=Applications/macOS/KChat QA.app/Contents/MacOS/KChat QA
VM_APP_NAME=KChat QA
VM_APP_BUNDLE_ID=com.uney.kchat.qa
VM_CDP_PORT=9222

# Accounts (optional — defaults autotest01/02)
HOST_ACCOUNT=autotest01
VM_ACCOUNT=autotest02

# Tenant (optional — default b2c)
TENANT=b2c                     # b2c | b2b

# Window size (optional)
APP_WINDOW_WIDTH=1800
APP_WINDOW_HEIGHT=1100

# Logging (optional)
LOG_LEVEL=info                 # debug | info | warn | error | silent
LOG_FILE=                      # path → mirror logs to file
```

### 1.5. SSH key Host → VM
One-time setup:
```bash
chmod +x ./add-ssh-key.sh && ./add-ssh-key.sh
ssh admin@<VM_IPADDR> "echo ok"   # must print 'ok' without prompting for password
```

### 1.6. Sanity check
```bash
ssh admin@$VM_IPADDR "node -v && npm -v"   # Node available on VM?
ls "Applications/macOS/KChat QA.app"        # App available on Host?
node -e "require('dotenv').config(); console.log(process.env.VM_IPADDR)"  # .env loaded OK?
```

---

## 2. Test Scenario Flow

### 2.1. Main conversation (8 steps)
1. **Host** opens the app and focuses the scenario conversation.
2. **VM** opens the app, opens an idle (non-target) conversation, then unfocuses the app.
3. **Host** performs the action (send / reply / react) for N round(s).
4. **Host** verifies the last message in its own bubble + screenshot.
5. **VM** Notification Center delta = `+N` (push notifications count).
6. **VM** sidebar badge of the scenario conversation = `baseline + N`.
7. **VM** focuses the app (still without entering the conversation) and re-checks sidebar unread = `baseline + N`.
8. **VM** enters the conversation, verifies the last received message + screenshot.

### 2.2. Thread conversation (6 steps)
1. **VM** opens the conversation, opens the thread panel, then unfocuses the app.
2. **Host** opens the conversation, opens the thread panel.
3. **Host** sends N thread reply message(s).
4. **Host** verifies the last message in the thread + screenshot.
5. **VM** Notification Center delta = `+N`.
6. **VM** verifies the last received thread reply + screenshot.

---

## 3. Run & Debug

### 3.1. First smoke test (verify everything works)

```bash
# Chat smoke: Direct + Group + Community
npm run test -- tests/chat/main_01-send-message --ids=MS-T --smoke
```

If it passes → environment is OK. If it fails → see §3.3.

### 3.2. Common run commands

```bash
# Full chat smoke (send + reply + react, Direct/Group/Community)
npm run test -- tests/chat/main_01-send-message tests/chat/main_02-reply-on-message tests/chat/main_03-react-on-message --ids=MS-T,MRY-T-T,MRA-T --smoke

# Thread smoke (Group + Community)
npm run test -- tests/chat/thread_01-send-message tests/chat/thread_02-reply-on-message tests/chat/thread_03-react-on-message --ids=TS-T,TRY-T-T,TRA-T --smoke

# Run a single test file
npm run test -- tests/chat/main_02-reply-on-message/09-reply-on-mix-types.test.ts --smoke

# Run by test id
npm run test -- tests/chat/main_01-send-message --ids=MS-T-01

# Run by context
npm run test -- tests/chat/main_01-send-message --ctx=Group --smoke

# Switch tenant
npm run test -- tests/chat/... --tenant=b2b --smoke
```

### 3.3. Debugging a failing test

| Artifact type           | Location                                       | When to use |
|-------------------------|------------------------------------------------|-------------|
| **Trace zip**           | `test-results/<test-name>/trace.zip`           | `npx playwright show-trace <path>` — replay each step |
| **Error context (DOM)** | `test-results/<test-name>/error-context.md`   | Read the DOM snapshot at the failure moment |
| **Failure screenshot**  | `test-results/<test-name>/test-failed-*.png`  | Quick view of the UI at failure |
| **Playwright HTML**     | `playwright-report/`                           | `npx playwright show-report` |
| **Allure report**       | `allure-report/` (after `npm run genrpt`)     | `npm run openrpt` — full history & nice UI |
| **App logs**            | `src/user1-logs/`, `src/user3-logs/`          | Per-user Electron app logs |

### 3.4. Generate & open Allure report

```bash
npm run genrpt      # generate (after tests have run)
npm run openrpt     # open in browser
# or
npm run serverpt    # serve directly from allure-results
npm run cleanrpt    # wipe both results + report
```

### 3.5. Common issues

| Symptom                                             | Fix |
|-----------------------------------------------------|-----|
| `KChat QA` does not launch                          | `pkill -9 -f "KChat QA"; sleep 2` then retry |
| SSH still asks for password                         | Re-run `./add-ssh-key.sh`; verify Remote Login is enabled on the VM |
| Wrong `VM_IPADDR`                                   | Run `ipconfig getifaddr en0` on the VM, update `.env` |
| Test reports `MSG_DECRYPT_FAIL`                     | Receiver did not receive the key — re-login on VM or wait for sync |
| `expected ... in both bubble and quote` count = 0   | Conversation name does not match §1.2 |
| Empty Allure report                                 | `npm run cleanrpt` then re-run tests |
| `first-login.test.ts` fails                         | Check `.env` `MAC_APP_PATH`/`WIN_APP_PATH`; app must launch manually first |
| Port `9222` busy                                    | Change `VM_CDP_PORT` in `.env`, or `lsof -i :9222` and kill the process |