# Chat tests — Conventions

Tài liệu này định nghĩa quy ước viết test cho mọi chat action (`send`, `reply`, `edit`, `copy`, `forward`, `delete`, `react`, `create-thread`, ...). Mỗi action sẽ có 1 folder `tests/chat/<action-name>/` chứa `01-...test.ts` → `0N-...test.ts` cho từng data type.

---

## 1. Folder & file layout

```
tests/chat/
├── _shared/                # cases, runtime, base, helpers
│   ├── cases/_index.ts     # Text, Mention, Link, Emoji, Image, Video, File, Voice
│   ├── base.ts             # Action type, constants (RUN_TAG, dataName, dataPath)
│   ├── main.ts             # runCases() — main conversation
│   └── thread.ts           # runCases() — thread conversation
├── send-message/           # action: send  (main)
├── send-message-thread/    # action: send  (thread)
├── reply-on-message/       # action: reply
├── edit-message/           # (future)
├── copy-message/           # (future)
├── forward-message/        # (future)
├── delete-message/         # (future)
└── README.md
```

- 1 file `.test.ts` = 1 **root data kind** (cho action có root) hoặc 1 **target data kind** (cho action không root như send).
- File đánh số `01..08` theo thứ tự cố định: Text, Mention, Link, Emoji, Image, Video, File, Voice.

---

## 2. IDPrefix scheme

Format: `<ACTION>-<KIND>` (root kind cho action có root, target kind cho action không root).

| Folder | Prefix root | Ví dụ file |
|---|---|---|
| `send-message/` | `S-<X>` | `S-T`, `S-M`, `S-L`, `S-E`, `S-I`, `S-V`, `S-F`, `S-VO` |
| `send-message-thread/` | `ST-<X>` | `ST-T` ... `ST-VO` |
| `reply-on-message/` | `R-<X>` | `R-T` ... `R-VO` |
| `edit-message/` | `E-<X>` | `E-T` ... `E-VO` |
| `copy-message/` | `C-<X>` | `C-T` ... `C-VO` |
| `forward-message/` | `F-<X>` | `F-T` ... `F-VO` |
| `delete-message/` | `D-<X>` | `D-T` ... `D-VO` |
| `react-on-message/` | `RA-<X>` | `RA-T` ... `RA-VO` |

Action với sub-cases (action data type khác root data type) dùng suffix `-<X>` thêm vào: `R-T-T`, `R-T-M`, ..., `R-T-VO`.

**Kind suffix bảng**:

| Kind | Suffix |
|------|--------|
| Text | `T` |
| Mention | `M` |
| Link | `L` |
| Emoji | `E` |
| Image | `I` |
| Video | `V` |
| File | `F` |
| Voice | `VO` |

---

## 3. Template chuẩn

### 3.1. Action **không root** (send-message, send-message-thread)

```ts
import { Text } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';     // hoặc '../_shared/thread'

const IDPrefix   = 'S-T';
const NamePrefix = 'Verify that User can send text message by';

runCases(
   {
      feature:     '[Main Conversation] Send message',
      severity:    'critical',
      scope:       'all',
      description: ctx => `Send text message to ${ctx}`,
   },
   [
      Text.buildCases({ idPrefix: IDPrefix, namePrefix: NamePrefix }),
   ],
);
```

### 3.2. Action **có root** (reply, edit, copy, forward, delete, react)

```ts
import { Text, Mention, Link, Emoji, Image, Video, File, Voice } from '../_shared/cases/_index';
import { runCases } from '../_shared/main';
import { RUN_TAG } from '../_shared/base';

const ROOT       = { kind: 'text' as const, value: `ROOT TEXT ${RUN_TAG}` };
const IDPrefix   = 'R-T';
const NamePrefix = 'Verify that User can reply on text message by';

runCases(
   {
      feature:     '[Main Conversation] Reply on message',
      severity:    'critical',
      scope:       'once',
      description: ctx => `Reply on text message to ${ctx}`,

      seedRoot: async svc => {
         await svc.send.sendText(ROOT.value);
         return ROOT.value;
      },
      prelude: async (sender, shared) => {
         await sender.actions.do('reply', { id: shared.rootId, ...ROOT });
      },
      verifyQuote: true,
   },
   [
      Text   .buildCases({ idPrefix: `${IDPrefix}-T`,  namePrefix: NamePrefix }),
      Mention.buildCases({ idPrefix: `${IDPrefix}-M`,  namePrefix: NamePrefix }),
      Link   .buildCases({ idPrefix: `${IDPrefix}-L`,  namePrefix: NamePrefix }),
      Emoji  .buildCases({ idPrefix: `${IDPrefix}-E`,  namePrefix: NamePrefix }),
      Image  .buildCases({ idPrefix: `${IDPrefix}-I`,  namePrefix: NamePrefix }),
      Video  .buildCases({ idPrefix: `${IDPrefix}-V`,  namePrefix: NamePrefix }),
      File   .buildCases({ idPrefix: `${IDPrefix}-F`,  namePrefix: NamePrefix }),
      Voice  .buildCases({ idPrefix: `${IDPrefix}-VO`, namePrefix: NamePrefix }),
   ],
);
```

---

## 4. Quy ước format

**Imports** — thứ tự bắt buộc:
1. `cases/_index`
2. `main` hoặc `thread`
3. `base` (gộp 1 dòng, không tách)

**Const declarations** — align dấu `=`:
```ts
const ROOT_PATH  = `${dataPath}.jpeg`;     // nếu cần
const ROOT       = { kind: '...', value: '...' };
const IDPrefix   = '...';
const NamePrefix = '...';
```

**Object `Action`** — align dấu `:` trong cụm metadata (4-5 dòng đầu), blank line phân tách với cụm hooks (`seedRoot`/`prelude`):
```ts
{
   feature:     '...',
   severity:    'critical',
   scope:       'once',         // 'all' | 'once'
   description: ctx => `... ${ctx}`,

   seedRoot: ...,
   prelude:  ...,
   verifyQuote: true,
}
```

**`buildCases` array** — align cột `namePrefix:`:
- Suffix 1 ký tự (`-T`, `-M`, ...): 2 spaces sau dấu `,`.
- Suffix 2 ký tự (`-VO`): 1 space sau dấu `,`.

**`prelude`** — dùng spread `...ROOT` thay vì lặp `kind: ROOT.kind, value: ROOT.value`:
```ts
await sender.actions.do('reply', { id: shared.rootId, ...ROOT });
```

**API surface** — `ChatService` chỉ giữ `chatPage`, `tenant`, `view`, `send`, `actions`, `page`, `openConversation`. Mọi action gọi qua sub-service:
- `svc.send.<sendText|sendMedia|sendVoice|...>` — gửi message
- `svc.view.<verifyLastMessage|verifyMessageById|takeScreenShot|...>` — verify UI
- `svc.actions.do('<action>', target, opts?)` — context-menu actions
- `svc.chatPage.composers.focusMessage()` / `svc.chatPage.thread.close()` — UI primitives

**ROOT shape**:
- Text/Mention/Link: `{ kind, value: string }`.
- Emoji: thêm `ROOT_PICKER`, `ROOT = { kind: 'emoji', value: ROOT_PICKER.emojis.join('') }`.
- Image/Video/File: thêm `ROOT_PATH = \`${dataPath}.<ext>\``, `ROOT = { kind, value: \`${dataName}.<ext>\` }`.
- Voice: `{ kind: 'voice' as const }` (không value).

---

## 5. `scope`

- `'all'` — chạy tất cả round biến thể (dùng cho send-message: 1 lần / nhiều lần / nhiều line / line dài / unicode / offline).
- `'once'` — chỉ chạy 1 round mỗi case (dùng cho reply/edit/copy/... khi không cần verify variant).

---

## 6. Behavior matrix (per data type)

**text, mention, link, emoji**:
- Gửi 1 lần
- Gửi nhiều lần
- Nhiều line 1 lần gửi
- 1 line dài 1 lần gửi
- Gửi khi offline
- Gửi error unicode

**image, video, file, voice** (mỗi case nhân 2 vì có/không caption):
- Gửi 1 lần
- Gửi nhiều lần
- Nhiều file 1 lần gửi
- Gửi file lớn (max size)
- Gửi file không support format
- Gửi khi offline
- Gửi error unicode

**Mix type**:
- text/mention/link/emoji + image/video/file/voice
- Nhiều image/video/file/voice 1 lần gửi

---

## 7. Verification rule

**Main conversation** (context: `Direct`, `Group`, `Community`):
1. Action
2. Check push notification
3. Check unread message count
4. Check last message
5. (optional) Check quote — `verifyQuote: true`

**Thread conversation** (context: `Group`, `Community` only):
1. Action
2. Open thread (nếu chưa tồn tại → create thread)
3. Check push notification
4. Check last message

---

## 8. Run commands

**Clean previous report**:
```bash
npm run cleanRpt
```

**Single file**:
```bash
npm run test -- tests/chat/send-message/01-send-text.test.ts --ctx Group --smoke
```

**Multiple files**:
```bash
npm run test -- \
   tests/chat/send-message/01-send-text.test.ts \
   tests/chat/send-message/02-send-mention.test.ts \
   --ctx Direct,Group,Community --smoke
```

**Filter by IDs**:
```bash
npm run test -- tests/chat/send-message/01-send-text.test.ts \
   --ctx Direct,Group,Community \
   --ids S-T-01,S-T-03 \
   --smoke
```

**Multiple files + IDs**:
```bash
npm run test -- \
   tests/chat/send-message/01-send-text.test.ts \
   tests/chat/send-message/04-send-emoji.test.ts \
   --ctx Group,Community \
   --ids S-T-01,S-E-02 \
   --smoke
```

**All in folder**:
```bash
npm run test -- tests/chat/send-message/ --ctx Direct,Group,Community --smoke
```

**Generate + open report**:
```bash
npm run genRpt && npm run openRpt
```

---

## 9. Checklist khi thêm action mới (edit/copy/forward/delete/...)

1. Tạo folder `tests/chat/<action>-message/`.
2. Định nghĩa `IDPrefix` root cho action ở bảng mục 2 (tránh trùng).
3. Copy template mục 3.2, đổi:
   - `feature` → `'[Main Conversation] <Action verb>'`
   - `description` → `\`<verb> <kind> message to ${ctx}\``
   - `NamePrefix` → `'Verify that User can <verb> <kind> message by'`
   - `prelude` → gọi `sender.actions.do('<action>', { id: shared.rootId, ...ROOT })`
   - `verifyQuote` → giữ `true` nếu action có quote (reply/forward), bỏ nếu không (delete/copy).
4. Tạo 8 file `01..08` cho 8 data kind theo thứ tự cố định.
5. Nếu action thread cần test riêng → tạo thêm `<action>-message-thread/` dùng `runCases` từ `_shared/thread`.

---

## 10. Action types & data types reference

**Action types** (`sender.actions.do(type, ...)`):  
`send`, `reply`, `edit`, `copy`, `forward`, `delete`, `react`, `create-thread`, `open-thread`, `close-thread`.

**Data types** (8 loại, thứ tự cố định trong mọi file):  
`text`, `mention`, `link`, `emoji`, `image`, `video`, `file`, `voice`.
