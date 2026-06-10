import { chromium, Browser } from 'playwright';
import { spawn, spawnSync, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import { log } from './log';

dotenv.config();

const VM_USER          = process.env.VM_USER          || 'admin';
const VM_IPADDR        = process.env.VM_IPADDR        || '';
const VM_PROJECT_NAME  = process.env.VM_PROJECT_NAME  || 'kchat-desktop-automation';
const VM_APP_NAME      = process.env.VM_APP_NAME      || 'KChat QA';
const VM_APP_BUNDLE_ID = process.env.VM_APP_BUNDLE_ID || 'com.uney.kchat.qa';
const VM_CDP_PORT      = Number(process.env.VM_CDP_PORT   || '9222');
const VM_LOCAL_PORT    = Number(process.env.VM_LOCAL_PORT || VM_CDP_PORT);
const VM_TARGET        = `${VM_USER}@${VM_IPADDR}`;
const VM_APP_BUNDLE    = `Applications/macOS/${VM_APP_NAME}.app`;

let vmApp: Browser | null = null;
let vmTunnel: ChildProcess | null = null;

function sshRun(cmd: string): void {
   const r = spawnSync('ssh', [VM_TARGET, 'bash', '-s'], {
      input: cmd, stdio: ['pipe', 'inherit', 'inherit'],
   });
   if (r.status !== 0) throw new Error(`ssh ${VM_TARGET} failed (exit ${r.status})`);
}

async function waitForCdp(host: string, port: number, timeoutMs: number): Promise<void> {
   const deadline = Date.now() + timeoutMs;
   while (Date.now() < deadline) {
      try {
         const res = await fetch(`http://${host}:${port}/json/version`, { signal: AbortSignal.timeout(2000) });
         if (res.ok) return;
      } catch { }
      await new Promise(r => setTimeout(r, 1000));
   }
   throw new Error(`CDP ${host}:${port} not ready in ${timeoutMs}ms`);
}

function killLocalPort(port: number): void {
   const r = spawnSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], { encoding: 'utf8' });
   for (const pid of (r.stdout || '').trim().split('\n').filter(Boolean)) {
      try { process.kill(Number(pid), 'SIGKILL'); } catch { }
   }
}

export async function getVmApp(): Promise<Browser | null> {
   if (!VM_IPADDR) return null;
   if (vmApp) {
      try { vmApp.contexts(); return vmApp; } catch { vmApp = null; }
   }

   const rawArgs = process.env.USER_LOGS || '';
   const appArgs = rawArgs.split(/\s+/).filter(a => a && !a.startsWith('--user-data-dir')).join(' ');
   sshRun(`
set -e
cd "$HOME/${VM_PROJECT_NAME}"
if curl -fsS --max-time 1 http://127.0.0.1:${VM_CDP_PORT}/json/version >/dev/null 2>&1; then
   echo "[VM] reuse running app" >&2; exit 0
fi
pkill -9 -f "${VM_APP_BUNDLE}" 2>/dev/null || true
sleep 1

open "./${VM_APP_BUNDLE}" --args --remote-debugging-port=${VM_CDP_PORT} ${appArgs}
for i in $(seq 1 60); do
   curl -fsS --max-time 1 http://127.0.0.1:${VM_CDP_PORT}/json/version >/dev/null 2>&1 && exit 0
   sleep 1
done
echo "[VM] CDP not ready after 60s (see /tmp/vm-kchat.log on VM)" >&2; exit 1
`);

   killLocalPort(VM_LOCAL_PORT);
   vmTunnel = spawn('ssh', [
      '-o', 'ExitOnForwardFailure=yes',
      '-N', '-L', `${VM_LOCAL_PORT}:127.0.0.1:${VM_CDP_PORT}`,
      VM_TARGET,
   ], { stdio: ['ignore', 'ignore', 'pipe'] });
   vmTunnel.stderr?.on('data', d => log.warn(`[ssh-tunnel] ${d.toString().trim()}`));

   await waitForCdp('127.0.0.1', VM_LOCAL_PORT, 30_000);
   vmApp = await chromium.connectOverCDP(`http://127.0.0.1:${VM_LOCAL_PORT}`);
   return vmApp;
}

export function resizeVmWindow(
   w: number = Number(process.env.APP_WINDOW_WIDTH  || 1800),
   h: number = Number(process.env.APP_WINDOW_HEIGHT || 1100),
): void {
   if (!VM_IPADDR) return;
   const script =
      `osascript ` +
      `-e 'tell application "${VM_APP_NAME}" to activate' ` +
      `-e 'delay 0.2' ` +
      `-e 'tell application "System Events" to tell process "${VM_APP_NAME}" to set size of window 1 to {${w}, ${h}}' ` +
      `-e 'tell application "System Events" to tell process "${VM_APP_NAME}" to set position of window 1 to {100, 80}' ` +
      `2>/dev/null || true`;
   try {
      const r = spawnSync('ssh', [VM_TARGET, 'bash', '-s'], { input: script, encoding: 'utf8' });
      if (r.status !== 0) log.warn(`[resizeVmWindow] exit=${r.status} stderr=${(r.stderr || '').trim()}`);
   } catch (e) {
      log.warn(`[resizeVmWindow] failed: ${(e as Error).message}`);
   }
}

export function unfocusVmApp(): void {
   if (!VM_IPADDR) return;
   const script =
      `for i in 1 2 3 4 5; do ` +
      `  osascript -e 'tell application "Finder" to activate' 2>/dev/null; ` +
      `  sleep 0.2; ` +
      `  front=$(osascript -e 'tell application "System Events" to name of first process whose frontmost is true' 2>/dev/null); ` +
      `  if [ "$front" != "${VM_APP_NAME}" ]; then echo "unfocused (front=$front)"; exit 0; fi; ` +
      `done; ` +
      `echo "WARN: kChat still frontmost after retries"`;
   try {
      const r = spawnSync('ssh', [VM_TARGET, 'bash', '-s'], { input: script, encoding: 'utf8' });
      const out = (r.stdout || '').trim();
      if (out.startsWith('WARN')) log.warn(`[unfocusVmApp] ${out}`);
   } catch { }
}

export function clearVmNotifications(bundleId: string = VM_APP_BUNDLE_ID): void {
   if (!VM_IPADDR) return;
   const script =
      `DB="$HOME/Library/Group Containers/group.com.apple.usernoted/db2/db"; ` +
      `killall usernoted 2>/dev/null || true; ` +
      `for i in 1 2 3 4 5; do pgrep -x usernoted >/dev/null || break; sleep 0.2; done; ` +
      `sqlite3 "$DB" "PRAGMA wal_checkpoint(TRUNCATE); DELETE FROM record WHERE app_id IN (SELECT app_id FROM app WHERE identifier='${bundleId}');" 2>/dev/null || true; ` +
      `killall NotificationCenter 2>/dev/null || true; ` +
      `true`;
   try { sshRun(script); } catch { }
}

export function getVmNotificationCenterCount(bundleId: string = VM_APP_BUNDLE_ID): number {
   if (!VM_IPADDR) return 0;

   const sql = `SELECT count(*) FROM record r JOIN app a ON r.app_id=a.app_id WHERE a.identifier='${bundleId}';`;
   const script =
      `set -e; ` +
      `SRC="$HOME/Library/Group Containers/group.com.apple.usernoted/db2"; ` +
      `DST=/tmp/.kn-count; ` +
      `rm -rf "$DST"; mkdir -p "$DST"; ` +
      // Fold WAL into the main db (safe, idempotent) so the snapshot reflects latest writes.
      `sqlite3 "$SRC/db" "PRAGMA wal_checkpoint(PASSIVE);" >/dev/null 2>&1 || true; ` +
      `cp "$SRC/db"     "$DST/db"     2>/dev/null || true; ` +
      `cp "$SRC/db-wal" "$DST/db-wal" 2>/dev/null || true; ` +
      `cp "$SRC/db-shm" "$DST/db-shm" 2>/dev/null || true; ` +
      `sqlite3 -readonly "$DST/db" "${sql}"`;
   const r = spawnSync('ssh', [VM_TARGET, 'bash', '-s'], { input: script, encoding: 'utf8' });
   const out = (r.stdout || '').trim();
   const err = (r.stderr || '').trim();
   const n = Number(out.split('\n').pop());
   if (!Number.isFinite(n)) {
      log.warn(`[getVmNotificationCenterCount] could not parse count. stdout=${JSON.stringify(out)} stderr=${JSON.stringify(err)}`);
      return 0;
   }
   if (err) log.warn(`[getVmNotificationCenterCount] stderr=${err}`);
   return n;
}

export type VmNotifRow = {
   rowid: number;
   presentedDate: string;
   deliveredDate: string;
   raw: string;
};

/** Dump latest notification rows for the given bundle (best-effort diagnostic).
 *  Schema of usernoted db2/db varies by macOS version; we select robust columns. */
export function getVmNotificationRows(
   bundleId: string = VM_APP_BUNDLE_ID,
   limit: number = 5,
): VmNotifRow[] {
   if (!VM_IPADDR) return [];
   // usernoted schema varies across macOS versions: select only the always-present columns.
   const sql =
      `SELECT r.rowid, a.identifier ` +
      `  FROM record r JOIN app a ON r.app_id=a.app_id ` +
      ` WHERE a.identifier='${bundleId}' ` +
      ` ORDER BY r.rowid DESC LIMIT ${limit};`;
   const script =
      `set -e; ` +
      `SRC="$HOME/Library/Group Containers/group.com.apple.usernoted/db2"; ` +
      `DST=/tmp/.kn-rows; rm -rf "$DST"; mkdir -p "$DST"; ` +
      `sqlite3 "$SRC/db" "PRAGMA wal_checkpoint(PASSIVE);" >/dev/null 2>&1 || true; ` +
      `cp "$SRC/db"     "$DST/db"     2>/dev/null || true; ` +
      `cp "$SRC/db-wal" "$DST/db-wal" 2>/dev/null || true; ` +
      `cp "$SRC/db-shm" "$DST/db-shm" 2>/dev/null || true; ` +
      `sqlite3 -readonly -separator '|' "$DST/db" "${sql}"`;
   const r = spawnSync('ssh', [VM_TARGET, 'bash', '-s'], { input: script, encoding: 'utf8' });
   const out = (r.stdout || '').trim();
   if (!out) return [];
   return out.split('\n').filter(Boolean).map(line => {
      const parts = line.split('|');
      return {
         rowid: Number(parts[0]),
         presentedDate: '',
         deliveredDate: '',
         raw: line,
      };
   });
}

export function showVmApp(): void {
   if (!VM_IPADDR) return;
   try {
      sshRun(
         `osascript -e 'tell application "${VM_APP_NAME}" to activate' ` +
         `-e 'tell application "System Events" to set visible of process "${VM_APP_NAME}" to true' ` +
         `2>/dev/null || true`
      );
   } catch { }
}

export async function closeVmApp() {
   if (vmApp) {
      try { await vmApp.close(); } catch { }
      vmApp = null;
   }
   if (vmTunnel && !vmTunnel.killed) {
      try { vmTunnel.kill('SIGTERM'); } catch { }
      vmTunnel = null;
   }
   if (VM_IPADDR) {
      try { sshRun(`pkill -9 -f "${VM_APP_BUNDLE}" 2>/dev/null || true`); }
      catch { }
   }
}
