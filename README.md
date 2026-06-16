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

# 5. Account

Mac User: xuanvth

VM Mac User: admin - admin

# 6. Sync updated KChat-Desktop app to VM:

chmod +x ./sync-app.sh && ./sync-app.sh

# 7. Framework Structure



# 8. Supported features
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

# 9. Test Execution:

npm run cleanrpt | tail -2 & npm run test -- {<<}test_file_name} --ctx={context_list} --ids={case_id_list} --smoke

npm run genrpt & npm run openrpt

# Example 1: Send message to main conversation (B2C, both Direct-Group-Community, all cases)

npm run cleanrpt | tail -2 & npm run test -- tests/chat/main_01-send-message

npm run genrpt & npm run openrpt

# Example 2: Reply on message to main conversation (B2C, both Direct-Group-Community, only send Text and case 1 of send Link)

npm run cleanrpt | tail -2 & npm run test -- tests/chat/main_02-reply-on-message --ids=MS-T,MS-L-01

npm run genrpt & npm run openrpt

# Example 3: React on message to main conversation (B2C, only Direct, all cases)

npm run cleanrpt | tail -2 & npm run test -- tests/chat/main_03-react-on-message --ctx=Direct

npm run genrpt & npm run openrpt

# Example 4: Send message to thread conversation (B2C, both Direct-Group-Community, all cases, smoke)

npm run cleanrpt | tail -2 & npm run test -- tests/chat/thread_01-send-message --smoke

npm run genrpt & npm run openrpt

# Example 5: Send message to main conversation (B2B) - have not implemented yet

npm run cleanrpt | tail -2 & npm run test -- ... --tenant=b2b ...

npm run genrpt & npm run openrpt





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


Impact: image, video, file, voice
=====
     26 …Reply on text to Direct › MRY-T-I-01 - Verify that User can reply on text message by image in 1 round @smoke (retry #1)
0|0|0
[step-retry] "STEP 4: Host verifies "Last Message" + screenshot" attempt 1/3 failed: expected "demo.jpeg" in both the original bubble and the reply quote

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2
Received:    0
=====
 37 …versation] Reply on link to Direct › MRY-L-I-01 - Verify that User can reply on link message by image in 1 round @smoke
0|0|0
[step-retry] "STEP 4: Host verifies "Last Message" + screenshot" attempt 1/3 failed: expected "demo.jpeg" in both the original bubble and the reply quote

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2
Received:    0



Limitation:
VM MacOS:
- Flaky when push notification center --> macOS DB cannot get the latest data from BE
- Send image/video/file from Dialog --> VM hasn't electron app as like Host

--> Consideration: add more 1 host macOS (acc 3) to seed root or call


pkill -f "playwright test" 2>/dev/null; sleep 2; npx playwright test tests/chat/main_0{1,2,3}-*-message/09-*
st.ts tests/chat/thread_0{1,2,3}-*-message/09-*-mix-types.test.ts --reporter=list --grep @smoke








First Login: npm run first-login
Test Execution:


chi retry testcase -> max 3 lan, neu sau 3 lan van fail skip luon, run testcase tiep theo


# Toàn bộ tests
npm run ci

# 1 file
./run-test.sh send-text-to-direct.test.ts

# Nhiều file
./run-test.sh send-text-to-direct.test.ts pick-file.test.ts

# Pattern (Playwright support)
./run-test.sh tests/send-*.test.ts

# Filter theo grep
./run-test.sh -g "direct chat"

# Đổi user nhận report
REPORT_TO="My Channel" ./run-test.sh send-text-to-direct.test.ts