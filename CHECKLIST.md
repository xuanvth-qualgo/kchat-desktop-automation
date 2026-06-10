# Self-Audit Checklist

Dùng trước mỗi commit / PR review. Mỗi câu hỏi đánh **✅ / ❌**. Mục tiêu: 20/20 ✅.

| Score | ✅ count |
|-------|----------|
| 9.0+  | 18-20 |
| 8.0-8.9 | 14-17 |
| 7.0-7.9 | 10-13 |
| < 7.0 | ≤ 9 → cần refactor |

---

## 1. E2E robustness — "test chạy có ổn định không?"

- [ ] **E1.** Không dùng `waitForTimeout(N)` cứng *(trừ semantic durations: voice recording, longPress hold, screenshot delay)*
- [ ] **E2.** Action có thể fail tạm thời → có retry semantic (loop với `maxRetries` / `deadline`), không one-shot
- [ ] **E3.** Mọi log đi qua `log.info/warn/error`, không có `console.*` rải rác
- [ ] **E4.** Selectors stable: dùng `data-testid`, `role`, `aria-label`. Tránh CSS class, `nth-child`, xpath cứng
- [ ] **E5.** `expect.poll` có set `timeout` + `intervals` cụ thể, không dùng default

---

## 2. POM — "page object có sạch không?"

- [ ] **P1.** Page object **không** expose Locator công khai khi consumer ngoài chỉ cần action → trả `Promise<void>` / `Promise<boolean>`
- [ ] **P2.** Raw string label (`'Send message'`, `'Reply'`, ...) centralized trong `labels.ts`, không inline rải rác
- [ ] **P3.** Service code **không** dùng `locator.locator(...)` / `getByRole(...)` trực tiếp → gọi method của page object
- [ ] **P4.** Selector chains (multi-step lookup) sống trong page object, không trong test / service
- [ ] **P5.** Mỗi page object đại diện **1 vùng UI rõ ràng** — class name = tên vùng UI

---

## 3. SOLID — "có dễ thêm/sửa feature không?"

- [ ] **S1. (OCP)** Thêm 1 message type / action mới chỉ cần **1-2 file** (add entry vào registry/labels), không sửa 3+ switch
- [ ] **S2. (SRP)** Mỗi class có **1 lý do thay đổi**. Không "đụng class này khi đổi nhiều thứ"
- [ ] **S3. (DIP)** Service depend on **interface**, không `new ConcreteThing()` rải khắp
- [ ] **S4. (ISP/LSP)** Không subclass nào throw "unsupported" cho method parent định nghĩa → tách interface hẹp hơn
- [ ] **S5.** Function < 50 dòng. Function dài → tách private methods, mỗi cái 1 trách nhiệm

---

## 4. OOP — "encapsulation + composition tốt không?"

- [ ] **O1.** Class field default `private` / `protected`. Chỉ public khi consumer ngoài thật sự cần
- [ ] **O2.** **Không** leak raw `Locator` / state nguyên thuỷ ra ngoài class
- [ ] **O3.** Ưu tiên **composition** (has-a). Tránh inheritance sâu ≥ 3 tầng
- [ ] **O4.** Dùng discriminated union (`{ type: 'text', value }`) thay vì magic string + `if/switch` rải rác
- [ ] **O5.** Constructor ≤ 3-4 dependency. Nhiều hơn → class đang ôm nhiều việc

---

## Quy trình áp dụng khi thêm feature mới

Vd: thêm "react với emoji custom":

1. **POM (P1, P2):** Tạo method ở page object cho UI mới. String label → vào `labels.ts`.
2. **SOLID (S1):** Nếu là variant của action có sẵn → thêm 1 entry vào registry (`MENU_LABEL_FOR`, `HANDLERS`), không sửa switch.
3. **E2E (E1):** Action có thể chậm/race → `expect.poll` hoặc `waitFor({ state })`, không `waitForTimeout`.
4. **OOP (O1, O2):** Sub-class field private; chỉ expose method.
5. **E2E (E3):** Log debug → `log.info(...)`, không `console.log`.

Sau commit: **scan 20 câu** ≈ 15-20 phút. Đếm ✅. So với bảng threshold.

---

## Note

- File này là "rubric review", không phải linter rule.
- Reuse cho mọi PR liên quan đến `src/` hoặc `tests/chat/_shared/`.
- Không áp dụng cho `*.test.ts` (test cases declarative — auto-tuân theo via runCases).

---

## Reference: dimension hiện tại

Hiện tại codebase đạt: **E2E 8.9 · SOLID 9.0 · OOP 9.0 · POM 9.2** → avg **9.03**.

Nếu drop sau khi thêm feature → re-audit, fix các ❌ tương ứng.
