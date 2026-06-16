# Framework Structure

## 1. Tech stack

| Layer                | Technology                                                   |
|----------------------|--------------------------------------------------------------|
| Language             | **TypeScript** (strict, ES2022, CommonJS)                    |
| Runner               | **Playwright Test** `@playwright/test ^1.59`                 |
| Driver               | **Playwright Electron** (chromium-based desktop driver)      |
| App Under Test       | **Electron** `^41.3` — KChat QA macOS build                  |
| Reporting            | **Allure** (`allure-playwright`, `allure-commandline`)       |
| Multi-machine        | **SSH + custom VM bootstrap** (`src/core/vm.ts`)             |
| File transfer/sync   | `sync-app.sh`, `start.sh`, `add-ssh-key.sh`                  |
| Mail / token relay   | `nodemailer` + `express` (OTP / first-login flow)            |
| Compression          | `archiver` (artifact packaging)                              |
| Env                  | `dotenv`                                                     |
| CI/CD (planned)      | GitHub Actions                                               |

### Why TypeScript + Playwright Electron
- Native first-class Electron support (BrowserWindow handle, IPC, file-dialog stub).
- Auto-wait + retry built into locators → less flake on async UI.
- Strong typing for Page Objects, Services and shared fixtures.
- Trace + screenshot + video out-of-the-box → debuggable failures.

---

## 2. Repo layout

```
kchat-desktop-automation/
├── src/
│   ├── core/                # Fixtures, logging, VM orchestration, utils
│   │   ├── fixtures.ts      # Playwright test.extend (sessions, app launch)
│   │   ├── vm.ts            # Two-machine (Host + VM) orchestration
│   │   ├── log.ts           # Structured logging
│   │   └── utils/           # actions.ts (assertToBeVisible, ...)
│   ├── pages/               # Page Objects (pure UI locators + low-level ops)
│   │   ├── chat/            # ChatPage, ChatMessages, ChatComposers, ...
│   │   ├── call/            # CallPage, CallControls
│   │   ├── auth/            # Login, QR
│   │   ├── conversation/    # Sidebar, ConversationList
│   │   ├── notification-push/
│   │   └── notification-tab/
│   ├── services/            # Higher-level business actions (compose PO calls)
│   │   ├── chat/            # ChatService { view, send, actions }
│   │   ├── call/, auth/, conversation/, invitation/, notification-*
│   │   └── common/
│   ├── tenant/              # TenantContext (B2C/B2B) — opens conversation
│   ├── domain/              # Shared domain types
│   ├── reporters/           # Allure metadata helpers
│   └── kchat-qa/            # Mirrored binary / session state
├── tests/
│   ├── chat/                # send / reply / react test suites
│   │   ├── _shared/         # Case factories, runners (main.ts, thread.ts), runtime.ts
│   │   │   ├── cases/       # text, mention, link, emoji, image, video, file, voice, reaction, mix-types
│   │   │   ├── main.ts      # Main conversation runner
│   │   │   ├── thread.ts    # Thread conversation runner
│   │   │   ├── runtime.ts   # seedRoot, retryStep, shared scenario state
│   │   │   └── base.ts      # CaseSpec, factory glue
│   │   ├── main_01-send-message/    # MS-* tests
│   │   ├── main_02-reply-on-message/ # MRY-* tests
│   │   ├── main_03-react-on-message/ # MRA-* tests
│   │   ├── thread_01..thread_03/
│   ├── call/                # Call test suites (planned, mirroring chat)
│   ├── auth/, invitation/, notification-push/, notification-tab/
│   ├── first-login.test.ts
│   ├── open-two-machines.test.ts
│   └── smoke-multi-user.test.ts
├── scripts/                 # test-filter.js (CLI: --ids, --smoke)
├── test-data/               # demo.jpeg/.mp4/.pdf/.txt for media tests
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 3. Architectural layering

```
            ┌──────────────────────────────────────────┐
 tests/ ──► │  CaseSpec (declarative)                  │  what to send & expect
            │  runCases() → main.ts / thread.ts        │  orchestration (Host+VM)
            └──────────────┬───────────────────────────┘
                           │
            ┌──────────────▼───────────────────────────┐
 services/  │  ChatService { view, send, actions }     │  business workflows
            │  CallService, AuthService, ...           │
            └──────────────┬───────────────────────────┘
                           │
            ┌──────────────▼───────────────────────────┐
 pages/     │  ChatPage / ChatMessages / Composers     │  Page Objects (locators)
            │  CallPage, LoginPage, ...                │
            └──────────────┬───────────────────────────┘
                           │
            ┌──────────────▼───────────────────────────┐
 core/      │  fixtures.ts, vm.ts, utils, log, tenant  │  infra & cross-cuts
            └──────────────────────────────────────────┘
```

- **tests** stay declarative — they describe *what* (CaseSpec), not *how*.
- **services** are the only layer that mixes multiple page objects.
- **pages** never call services; they only expose locators + atomic UI ops.
- **core** is leaf — nobody imports tests/services from it.

---

## 4. Key patterns in use

### 4.1 Case factory + runner
`tests/chat/_shared/cases/*.ts` export `buildCases(opts)` producing typed `Case[]`.
`runCases(action, [...cases])` drives the Host+VM scenarios for each Case, providing:
- `seedRoot` (per scenario cache via `runtime.ts`)
- `prelude` (mutation before each case, e.g. reply with parent)
- `verifyOverride` / `verifyQuote` hooks
- Multi-attempt `retryStep` with screenshot + Allure attachment

### 4.2 Two-machine orchestration
`src/core/vm.ts` + `tests/open-two-machines.test.ts` start Electron on Host and via SSH on VM, share workspace state, and synchronize Sender/Receiver assertions.

### 4.3 Type-driven dispatch
`ChatTypeHandlers.ts` maps `MessageType` → handler `{ locator, verify }`. Cases tag themselves with `type` (`text|caption|file|voice|image|...`) and the runner picks the right verifier — eliminating branching in tests.

### 4.4 Auto-wait & retry
`assertToBeVisible(loc, timeout)` + `expect.poll(...)` + outer `retryStep` give 3 layers of retry: locator-level, polled assertion, and step-level (3 attempts).

### 4.5 Smart locators
Page objects expose semantic getters (`getFileMessage(name)`, `getLinkMessage(url)`, `getMessageById(id)`) that compose role + xpath; tests never write CSS/XPath.

---

## 5. Scoring — E2E / POM / OOP / SOLID

> Scale: 1 = absent, 5 = textbook. Average bolded.

### 5.1 E2E coverage and realism — **4.5 / 5**
| Criterion                                            | Score | Note |
|------------------------------------------------------|:----:|------|
| Runs real Electron build (no mocks of the app)       |  5   | Uses installed KChat QA `.app` |
| Multi-user / multi-machine                           |  5   | Host + VM via SSH (`vm.ts`)    |
| Cross-context (Direct / Group / Community / Thread)  |  5   | `tenant/`, parametric scenarios |
| Media coverage (text/link/emoji/image/video/file/voice/mention) | 5 | Full `cases/*` matrix |
| Side-channels (notifications, sidebar unread, badges)|  4   | `notification-push/tab` covered, some gaps |
| Stability / flake control                            |  3   | Some flakes (decrypt fallback, retries help) |
| External system isolation (mail/OTP)                 |  4   | Local SMTP relay for first-login |

### 5.2 POM (Page Object Model) — **4 / 5**
| Criterion                                            | Score | Note |
|------------------------------------------------------|:----:|------|
| Clear page-vs-service separation                     |  5   | `pages/` vs `services/` strict |
| No raw selectors in tests                            |  5   | Tests only call services |
| Composable sub-pages                                 |  5   | `composers/`, `ChatMessages`, `ChatThreadPanel` |
| Page returns locators, not actions across pages      |  4   | Mostly clean; a couple of cross-page peeks |
| One responsibility per Page Object                   |  4   | `ChatPage` near borderline (delegates well) |
| Locator robustness (role/aria over CSS)              |  3   | Mix of role + xpath; xpath used for `data-message-id` |

### 5.3 OOP — **4 / 5**
| Criterion                                            | Score | Note |
|------------------------------------------------------|:----:|------|
| Encapsulation (private state, readonly fields)       |  5   | `ChatService` exposes facade only |
| Composition over inheritance                         |  5   | Services compose Page Objects |
| Polymorphism via handlers                            |  5   | `ChatTypeHandlers` map type→behavior |
| Constructor DI (`TenantContext`, `ChatPage`)         |  4   | DI present, no IoC container (fine for scale) |
| Naming / cohesion                                    |  4   | Consistent; a few god-objects flirt with size |
| Reuse via generic factories                          |  4   | `buildCases`, `toCases` |

### 5.4 SOLID — **4 / 5**

| Principle | Score | Where it shows | Where it bends |
|-----------|:----:|----------------|----------------|
| **S** — Single Responsibility | 4 | `ChatView` only verifies; `ChatSendAction` only sends; `ChatMoreActions` only mutates | `ChatSendAction` ~8 KB; getting close to splitting (text vs media vs voice) |
| **O** — Open/Closed | 5 | New message type = add a `cases/*.ts` + a `handler` entry; no edits to runner | — |
| **L** — Liskov Substitution | 4 | `TenantContext` (B2C/B2B) interchangeable; `MessageTypeHandler` polymorphism | Few `instanceof`-ish checks in runtime around `ret`-shape |
| **I** — Interface Segregation | 4 | `ChatService` facade exposes 3 narrow sub-APIs (`view`, `send`, `actions`) | Tests sometimes touch all three; could split per-feature service |
| **D** — Dependency Inversion | 4 | Services depend on `ChatPage` abstraction not `Page`; runner depends on `CaseSpec` not concrete tests | No formal interface for Service layer (concrete classes), would help testability |

### 5.5 Overall — **~4.1 / 5**

Strengths
- Solid layering, declarative cases, strong polymorphism via handler map.
- Real-app, real-multi-machine E2E — high value, low mock surface.

Improvement levers
- Split `ChatSendAction` into `TextSender / MediaSender / VoiceSender`.
- Define `IChatService` / `ICallService` interfaces to fully enforce DIP.
- Replace remaining xpath with `getByRole` + `data-*` whenever shipped.
- Lock flake budget via dedicated wait helpers (notification arrival, decrypt-ready).
- Promote two-machine helpers from script-y `vm.ts` toward typed `MachineSession` class.

---

## 6. Conventions

- **File naming**: PascalCase for classes (`ChatService.ts`), kebab-case for tests (`09-reply-on-mix-types.test.ts`).
- **Test ids**: `MS-T-01`, `MRY-MX-F-02`, `TRA-MX-01` (`M`ain/`T`hread + `S`end/`R`epl`Y`/`R`e`A`ct + type + index).
- **Smoke**: `smoke: true` on CaseSpec; CLI `--smoke` in `scripts/test-filter.js`.
- **Logs / artifacts**: per-user folders `src/user{N}-logs/`, Allure into `allure-results/`.
- **Imports**: absolute-from-src forbidden; relative paths to keep TS path-free.