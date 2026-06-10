# 1. Github flow

git clone "https://github.com/xuanvth-qualgo/kchat-desktop-automation.git" && cd kchat-desktop-automation

git fetch --all

git checkout -b demo-1 origin/demo-1

git add -A

git diff --staged

git reset {file}

git commit -m "{datetime} - {jira id} - {summary}"

git push origin demo-1

git status

# 2. Find IP Address (Terminal at VM)

ipconfig getifaddr en0

# 3. Setup brew and node (Terminal at Host and VM)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo >> /Users/admin/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/admin/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"

brew --version

brew install node

node -v
npm -v

# 4. Setup and save first login account

# 4.1. Open Terminal 1: at Host

cd kchat-desktop-automation

pkill -9 -f "KChat QA"; sleep 2

chmod +x ./add-ssh-key.sh && ./add-ssh-key.sh

chmod +x ./start.sh && ./start.sh

npx playwright test first-login.test.ts 
/*save at app-logs/kchat-qa/*/

open "./Applications/macOS/KChat QA.app" --args --disable-gpu /*save at Library/Application Support/kchat-qa/*/

# 4.2. Open Terminal 2: at Host (ssh to VM)

ssh admin@192.168.64.7

cd kchat-desktop-automation

pkill -9 -f "KChat QA"; sleep 2

open "./Applications/macOS/KChat QA.app" --args --disable-gpu /*save at Library/Application Support/kchat-qa/*/

# 4.3. Open Terminal 3: at VM

npx playwright test first-login.test.ts /*save at app-logs/kchat-qa/*/

# 5. Run test: 

# B2C (default, không cần flag)
npm run cleanRpt && \
npm run test:send-msg -- --ctx=Direct --ids=SM04,SM05,SM06,SM07

npm run cleanRpt && \
npm run test:reply -- --ctx=Direct --ids=RM01-07,RM01-11,RM01-15

npm run genRpt && npm run openRpt

# B2B run
npm run cleanRpt && \
npm run test:send-msg -- --tenant=b2b --ctx=Group --ids=SM01-02,SM03-02

npm run genRpt && npm run openRpt

# 6. Sync updated KChat-Desktop app to VM:

chmod +x ./sync-app.sh && ./sync-app.sh

# 7. VM Account
Mac User: xuanvth
VM Mac User: admin - admin
VM Windows User: admin - admin@12

# 8. Framework Structure



1. chat: send, reply, forward, edit, delete, react, create thread, open/close thread
2. call: start, cancel, accept, reject, end, on/off share screen, on/off micro, on/off camera, update settings
3. invitation: send, cancel, accept, decline
4. pushed notification: content, unread app-bar, unread side-bar
5. notification tab: all, thread, invitation, mention, reaction
6. object:
   friend: edit nickname, delete conversation
   group: 
    . member: view all members, search message, leave and delete conversation
    . admin: view all members, search message, leave and delete conversation, edit group info, invite members, remove member
    . owner: view all members, search message, edit group info, invite members, remove member
   community: 
    . member: search members, group (view all members, search message, leave and delete conversation)
    . admin: search members, group (view all members, search message, leave and delete conversation, edit group info, invite members, remove member)
    . owner: search members, group (view all members, search message, edit group info, invite members, remove member)
7. auth: login via QR Code, sign out, delete account

chat type: text, link, emoji, image, video, file, voice, gif, sticker
call type: voice, video
invitation type: friend, group, community
permission type: owner, admin, member



Main conversation                Thread panel (subset)
─────────────────                ──────────────────────
composer:                        composer: ✓ (giống main)
  ✓ send (9 type)                  ✓ send (9 type)
  ✓ input                          ✓ input
                                 
messages context:                messages context:
  ✓ reply                          ✓ reply
  ✓ forward                        ✓ forward
  ✓ edit                           ✓ edit
  ✓ delete                         ✓ delete
  ✓ copy                           ✓ copy
  ✓ react                          ✓ react
  ✓ createThread  ← entry          ✗ createThread (đã trong thread)
  ✓ openThread    ← entry          ✗ openThread   (đã trong thread)
                                   ✓ close ← thoát panel



b2c
select conversation: direct user, group
select conversation in community: community > select conversation


b2b
select conversation in organization: organization > select conversation


# Smoke Test
npm run cleanRpt

npm run test -- tests/chat/send-message-main --ctx Group,Community --smoke 2>&1 | tail -30

npm run test -- tests/chat/send-message-thread --ctx Group,Community --smoke 2>&1 | tail -30

npm run test -- tests/chat/reply-on-message-main --ctx Group,Community --smoke 2>&1 | tail -30

npm run test -- tests/chat/reply-on-message-thread --ctx Group,Community --smoke 2>&1 | tail -30

npm run genRpt && npm run openRpt

# Regression Test by file
npm run cleanrpt

npm run test -- tests/chat/send-message-main --ctx Group,Community 2>&1 | tail -30

npm run test -- tests/chat/send-message-thread --ctx Group,Community 2>&1 | tail -30

npm run test -- tests/chat/reply-on-message-main --ctx Group,Community 2>&1 | tail -30

npm run test -- tests/chat/reply-on-message-thread --ctx Group,Community 2>&1 | tail -30

npm run genRpt && npm run openRpt

# Regression Test by ids
npm run cleanrpt 2>&1 | tail -2; for line in "main_send-message|MS-T-01" "thread_send-message|TS-T-01" "main_reply-on-message|MRY-T-T-01" "thread_reply-on-message|TRY-T-T-01" "main_react-on-message|MRA-T-01" "thread_react-on-message|TRA-T-01"; do dir="${line%|*}"; id="${line#*|}"; echo "========= $dir / $id ========="; npm run test -- tests/chat/$dir --ctx Group --ids=$id 2>&1 | tail -12; done

npm run genrpt && npm run openrpt



* demo: smoke test, group context, text type
send msg into main conv
reply msg into main conv
react msg into main conv

precond: must create thread, open thread
send msg into thread conv 
reply msg into thread conv 
react msg into thread conv

npm run cleanrpt 2>&1 | tail -2; for line in "main_send-message"; do dir="${line%|*}"; id="${line#*|}"; echo "========= $dir / $id ========="; npm run test -- tests/chat/$dir 2>&1 | tail -12; done


Debug:
for i in 1 2 3 4 5; do echo "===== Run $i ====="; OUT=$(npm run test -- tests/chat/main_send-message --ctx Group --ids=MS-M-02,MS-M-03 2>&1); STATUS=$(echo "$OUT" | grep -E 'flaky|failed|passed' | tail -1); echo "$STATUS"; if echo "$STATUS" | grep -qE 'flaky|failed'; then echo "$OUT" | grep -B1 -E 'Error|Timeout|✘|expect|locator' | head -40; break; fi; done




main
send text
send link
send mention
send emoji
send image
send video
send file

thread
send text
send link
send mention
send emoji
send image
send video
send file



# DEMO 1: chat (send, reply, react) - direct, group, community - TEXT
npm run cleanrpt 2>&1 | tail -2
// Direct, Group, Community
npm run test -- tests/chat/main_01-send-message tests/chat/main_02-reply-on-message tests/chat/main_03-react-on-message --ids=MS-T,MRY-T-T,MRA-T --smoke
// Group, Community
npm run test -- tests/chat/thread_01-send-message tests/chat/thread_02-reply-on-message tests/chat/thread_03-react-on-message --ids=TS-T,TRY-T-T,TRA-T --smoke
npm run genrpt && npm run openrpt


# DEMO 2: call (voice, video) - direct, group, community


# DEMO 3: CI/CD Integration via Github

Viết các file testcase vào folder 'call' giúp tui, tổ chức code như 'chat'
1. autotest01 voice call autotest02 directly > after 29s, autotest01 end call
2. autotest01 voice call autotest02 directly > after 29s, autotest02 reject call
3. autotest01 voice call autotest02 directly > after 29s, autotest02 accept call > autotest01 off microphone and autotest02 on camera > after 60s, autotest01 end call
4. autotest01 voice call autotest02 directly > after 29s, autotest02 accept call > autotest01 on camera and autotest02 off microphone  > after 60s, autotest02 end call
5. autotest01 voice call autotest02 directly > after 29s, autotest02 accept call > autotest0, autotest02 update settings of Camera <> Default > after 60s, autotest02 end call


1. aututest01 call autotest02 in group: Automation Test Group > after 29s, autotest01 end call
2. aututest01 call autotest02 in group: Automation Test Group > after 29s, autotest02 reject call
3. aututest01 call autotest02 in group: Automation Test Group > after 29s, autotest02 accept call > autotest01 off microphone and autotest02 on camera > after 60s, autotest01 end call
4. aututest01 call autotest02 in group: Automation Test Group > after 29s, autotest02 accept call > autotest01 on camera and autotest02 off microphone  > after 60s, autotest02 end call
5. aututest01 call autotest02 in group: Automation Test Group > after 29s, autotest02 accept call > autotest0, autotest02 update settings of Default <> Default > after 60s, autotest02 end call

