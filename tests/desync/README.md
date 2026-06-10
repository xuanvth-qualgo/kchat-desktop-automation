# Desync / MSG_DECRYPT_FAIL Repro Suite

Hướng dẫn sử dụng + kiến trúc bộ test giả lập kịch bản desync trên Prod:
**1 account login 2 device → join nhiều group (≥10 ng) và community (≥100 ng) →
tất cả member liên tục chat + add/remove/leave → target account nhận message
mã hoá không decode được, bubble hiện "This message can't be displayed"**.

---

## 1. Mục tiêu

- Repro được desync rate ≥ 50% trên môi trường staging.
- Tự động phát hiện qua hook đã có: `ChatView.verifyLastMessage` → catch placeholder → throw `MSG_DECRYPT_FAIL`.
- Log tổng hợp ở `test-logs/[Desync]...log` với category `[MSG_DECRYPT_FAIL]`.
- Báo cáo Allure cho từng case.

---

## 2. Vì sao không dùng UI cho tất cả bot

| Approach | Sessions tối đa thực tế | RAM | CI khả thi |
|---|---|---|---|
| Electron pool (full UI) | ~10 | ~30GB | Không |
| Headless browser context | ~50 | ~5GB | Marginal |
| **API + WebSocket (no UI)** | **300+** | **~500MB** | **Có** |

Kịch bản Prod cần ≥ 100 sessions cùng lúc → bắt buộc dùng API/WS cho "bot
noise", chỉ giữ 2 Electron thật cho target account (1 cho mỗi device).

---

## 3. Kiến trúc

```
src/core/desync/
├── BotClient.ts          # 1 account = login + 2 WebSocket sessions (giả lập 2 device)
├── BotPool.ts            # spawn N bots song song, throttle wave login
├── ChurnEngine.ts        # background loop: random ops (send/add/remove/leave)
├── Scenario.ts           # compose group + community + churn theo config
└── accounts/
    ├── pool.json         # danh sách 200+ bot accounts đã pre-provision
    └── tokens.cache      # cache login token, tự refresh khi 401

tests/desync/
├── README.md             # file này
├── 01-group-10.test.ts   # smallest case: 1 group × 10 members × 2 devices
├── 02-community-100.test.ts  # 1 community × 100 members × 2 devices
└── 03-prod-load.test.ts  # full load: 1 community + 3 groups + churn 2 phút
```

### Components

- **BotClient**: login REST → cache token → mở 2 WS connection. Public API: `joinGroup`, `leaveGroup`, `addMember`, `removeMember`, `sendText`, `close`.
- **BotPool**: quản lý `Map<accountId, BotClient>`. Login theo wave (10 bot/wave, sleep 500ms) để tránh rate-limit. Cleanup tất cả khi test kết thúc.
- **ChurnEngine**: chạy `setInterval`-style loop, random pick 1 bot + 1 op theo `opsMix` weight. Stop khi gọi `.stop()`.
- **Scenario.warmup()**: tất cả bot login + join sẵn group/community trước khi target gửi message.
- **Scenario.startChurn() / .stop()**: bật/tắt storm.

---

## 4. Prerequisites (cần có trước khi chạy)

1. **Bot accounts pre-provision**: 200+ account thật trên staging/test env (vd `autotest100..autotest299`), share password chung. Lưu vào `src/core/desync/accounts/pool.json`:
   ```json
   [
     { "username": "autotest100", "password": "..." },
     { "username": "autotest101", "password": "..." }
   ]
   ```
2. **API endpoints** (cần xác nhận):
   - `POST /api/v4/users/login` → trả về token
   - `POST /api/v4/channels/:id/members` → add member
   - `DELETE /api/v4/channels/:id/members/:userId` → remove / leave
   - `POST /api/v4/posts` → send message
   - `wss://.../api/v4/websocket` → realtime channel
3. **Existing group + community ID** trên staging (target account đã là member).
4. **Target account** với 2 device storage state đã saved:
   - `state/target-device1.json` (HOST_ACCOUNT)
   - `state/target-device2.json` (VM_ACCOUNT, hoặc Electron thứ 2)
5. **Env vars** trong `.env`:
   ```bash
   KCHAT_API_BASE=https://staging.kchat.example.com
   KCHAT_WS_BASE=wss://staging.kchat.example.com
   DESYNC_GROUP_ID=...
   DESYNC_COMMUNITY_ID=...
   DESYNC_BOT_POOL_SIZE=200
   ```

---

## 5. Cách chạy

### Phase 1 — Smoke (10 bots × 1 group, 30s churn)

```bash
npm run cleanRpt
npx playwright test tests/desync/01-group-10.test.ts --headed --retries=0
npm run genRpt && npm run openRpt
```

**Expected**: ~10-20% rate `MSG_DECRYPT_FAIL`. Mục đích validate pipeline.

### Phase 2 — Community load (100 bots × 1 community, 60s)

```bash
npx playwright test tests/desync/02-community-100.test.ts --retries=0
```

**Expected**: ~40-60% rate.

### Phase 3 — Full Prod load (1 community 100 + 3 groups 10 + 120s churn)

```bash
npx playwright test tests/desync/03-prod-load.test.ts --retries=0
```

**Expected**: ≥ 70% rate. Đây là case để verify fix sau khi dev push patch.

---

## 6. Cách đọc kết quả

### Log file

`test-logs/[Desync][...].log` — mỗi run append 1 entry. Filter:
```bash
grep -c '\[MSG_DECRYPT_FAIL\]' test-logs/[Desync]*.log
```

### Allure

- Behaviors → **Desync** → từng scenario.
- Failed step "verifyLastMessage" sẽ kèm parameter:
  - `Bot count`, `Churn ops/sec`, `Duration`, `Decrypt fails (target)`.
- Trace `.zip` của Electron device 2 attach sẵn để xem bubble placeholder.

---

## 7. Roadmap build

| Phase | Việc | Estimate | Blocker |
|---|---|---|---|
| 0 | Hoàn thiện doc này (file này) | 0.5d | ✅ done |
| 1 | Build `BotClient` (login + 1 WS + sendText) | 1d | Cần API docs / DevTools capture |
| 2 | Build `BotPool` + `ChurnEngine` skeleton | 0.5d | — |
| 3 | Build `Scenario` + test `01-group-10` | 1d | Cần bot accounts pre-provision |
| 4 | Tune churn → repro ≥ 50% | 1-2d | Phụ thuộc behavior server |
| 5 | Phase 2 + 3 tests | 1d | — |
| 6 | CI nightly hook | 0.5d | — |

**Tổng**: ~5-6 ngày dev nếu có sẵn API docs + bot pool. Gấp đôi nếu phải reverse-engineer API.

---

## 8. Câu hỏi mở (cần chốt trước khi build)

1. **Bot accounts**: có thể tạo bulk 200 account qua admin API không, hay phải tạo tay?
2. **Rate limit**: server có giới hạn req/min per IP không? (Quyết định `opsPerSec` cap.)
3. **WebSocket multi-device**: mỗi WS connection được server coi là 1 device, hay phải gửi `device_id` header riêng?
4. **Reset state**: sau mỗi test có cần purge messages/membership không, hay để dồn?
5. **CI env**: chạy được trên staging API không, hay phải có env riêng?

---

## 9. Cleanup sau khi run

- `test-logs/` — giữ để analyse, dọn manual.
- Membership thay đổi → optional `Scenario.cleanup()` để remove tất cả bot khỏi group/community (mặc định **OFF** để debug).
- Tokens cache (`tokens.cache`) — auto-refresh khi expired, không cần dọn.
