import type { Page } from 'playwright';

const HOOK_SCRIPT = `
(() => {
   if (window.__notifHookInstalled) return;
   window.__notifHookInstalled = true;
   window.__pushes = [];
   const Real = window.Notification;
   if (!Real) return;
   function Hooked(title, opts) {
      try {
         window.__pushes.push({
            title: String(title ?? ''),
            body:  String(opts && opts.body ? opts.body : ''),
            tag:   String(opts && opts.tag  ? opts.tag  : ''),
            ts:    Date.now(),
         });
      } catch (_) { /* swallow */ }
      return new Real(title, opts);
   }
   Hooked.prototype = Real.prototype;
   Object.setPrototypeOf(Hooked, Real);
   try {
      Object.defineProperty(Hooked, 'permission', { get: () => Real.permission });
   } catch (_) { /* readonly fallback */ }
   if (typeof Real.requestPermission === 'function') {
      Hooked.requestPermission = Real.requestPermission.bind(Real);
   }
   window.Notification = Hooked;
})();
`;

export type PushEvent = { title: string; body: string; tag: string; ts: number };

export async function installPushHook(page: Page): Promise<void> {
   try {
      await page.context().addInitScript({ content: HOOK_SCRIPT });
   } catch (_) { }
   try {
      await page.addInitScript({ content: HOOK_SCRIPT });
   } catch (_) { }
   try {
      await page.evaluate(HOOK_SCRIPT);
   } catch (_) { }
}

export async function clearPushes(page: Page): Promise<void> {
   await page.evaluate(() => {
      const w = window as unknown as { __pushes?: unknown[] };
      w.__pushes = [];
   }).catch(() => {  });
}

export async function getPushCount(page: Page): Promise<number> {
   return page.evaluate(() => {
      const w = window as unknown as { __pushes?: unknown[] };
      return Array.isArray(w.__pushes) ? w.__pushes.length : 0;
   }).catch(() => 0);
}

export async function getPushes(page: Page): Promise<PushEvent[]> {
   return page.evaluate(() => {
      const w = window as unknown as { __pushes?: PushEvent[] };
      return Array.isArray(w.__pushes) ? w.__pushes.slice() : [];
   }).catch(() => []);
}

import { spawnSync } from 'child_process';

export const APP_BUNDLE_ID =
   process.env.APP_BUNDLE_ID ?? 'com.uney.kchat';

const USERNOTED_DIR =
   '$HOME/Library/Group Containers/group.com.apple.usernoted/db2';

function isMac(): boolean {
   return process.platform === 'darwin';
}

function runBash(script: string): { stdout: string; stderr: string } {
   const r = spawnSync('bash', ['-s'], { input: script, encoding: 'utf8' });
   return { stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function snapshotScript(dst: string): string {
   return (
      `set -e; ` +
      `SRC="${USERNOTED_DIR}"; ` +
      `DST=${dst}; ` +
      `rm -rf "$DST"; mkdir -p "$DST"; ` +
      `sqlite3 "$SRC/db" "PRAGMA wal_checkpoint(PASSIVE);" >/dev/null 2>&1 || true; ` +
      `cp "$SRC/db"     "$DST/db"     2>/dev/null || true; ` +
      `cp "$SRC/db-wal" "$DST/db-wal" 2>/dev/null || true; ` +
      `cp "$SRC/db-shm" "$DST/db-shm" 2>/dev/null || true; `
   );
}

export function getNotificationCenterCount(
   bundleId: string = APP_BUNDLE_ID,
): number {
   if (!isMac()) return 0;
   const sql =
      `SELECT count(*) FROM record r JOIN app a ON r.app_id=a.app_id ` +
      `WHERE a.identifier='${bundleId}';`;
   const script =
      snapshotScript('/tmp/.kn-count') +
      `sqlite3 -readonly /tmp/.kn-count/db "${sql}"`;
   const { stdout, stderr } = runBash(script);
   const n = Number(stdout.split('\n').pop());
   if (!Number.isFinite(n)) {
      console.warn(
         `[getNotificationCenterCount] could not parse count. ` +
         `stdout=${JSON.stringify(stdout)} stderr=${JSON.stringify(stderr)}`,
      );
      return 0;
   }
   if (stderr) console.warn(`[getNotificationCenterCount] stderr=${stderr}`);
   return n;
}

export type NotifRow = {
   rowid: number;
   presentedDate: string;
   deliveredDate: string;
   raw: string;
};

export function getNotificationRows(
   bundleId: string = APP_BUNDLE_ID,
   limit: number = 5,
): NotifRow[] {
   if (!isMac()) return [];
   const sql =
      `SELECT r.rowid, a.identifier ` +
      `  FROM record r JOIN app a ON r.app_id=a.app_id ` +
      ` WHERE a.identifier='${bundleId}' ` +
      ` ORDER BY r.rowid DESC LIMIT ${limit};`;
   const script =
      snapshotScript('/tmp/.kn-rows') +
      `sqlite3 -readonly -separator '|' /tmp/.kn-rows/db "${sql}"`;
   const { stdout } = runBash(script);
   if (!stdout) return [];
   return stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => {
         const parts = line.split('|');
         return {
            rowid: Number(parts[0]),
            presentedDate: '',
            deliveredDate: '',
            raw: line,
         };
      });
}

export function clearNotifications(
   bundleId: string = APP_BUNDLE_ID,
): void {
   if (!isMac()) return;
   const sql =
      `DELETE FROM record WHERE app_id IN ` +
      `(SELECT app_id FROM app WHERE identifier='${bundleId}');`;
   const script =
      `sqlite3 "${USERNOTED_DIR}/db" "${sql}" 2>/dev/null || true; ` +
      `killall NotificationCenter 2>/dev/null || true;`;
   runBash(script);
}
