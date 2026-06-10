import {
   test as base,
   expect,
   Page,
   Browser,
   ElectronApplication,
} from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import dotenv from 'dotenv';
import { getVmApp, closeVmApp, resizeVmWindow } from './vm';
import { log } from './log';
import { TenantContext, TenantKind } from '../tenant/TenantContext';
import { B2CContext } from '../tenant/B2CContext';
import { B2BContext } from '../tenant/B2BContext';

dotenv.config();

let cachedApp: ElectronApplication | null = null;

function getExecutablePath(): string {
   const key = process.platform === 'darwin' ? 'MAC_APP_PATH' : 'WIN_APP_PATH';
   const raw = process.env[key];
   if (!raw) throw new Error(`${key} env is not set`);
   const resolved = path.resolve(raw);
   if (!fs.existsSync(resolved)) throw new Error(`App not found: ${resolved}`);
   return resolved;
}

function parseArgs(): string[] {
   const raw = process.env.USER_LOGS;
   if (!raw) return [];
   return raw.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(s => s.replace(/^"|"$/g, '')) ?? [];
}

function killStaleHostApp(): void {
   if (process.platform !== 'darwin') return;
   try {
      const appName = path.basename(getExecutablePath(), '.app');
      spawnSync('pkill', ['-9', '-f', appName], { stdio: 'ignore' });
   } catch { }
}

export async function getApp(): Promise<ElectronApplication> {
   if (cachedApp) {
      try { cachedApp.windows(); return cachedApp; }
      catch { cachedApp = null; }
   }
   let lastErr: Error | undefined;
   for (let attempt = 1; attempt <= 3; attempt++) {
      try {
         cachedApp = await electron.launch({
            executablePath: getExecutablePath(),
            args: parseArgs(),
            timeout: 30_000,
         });
         return cachedApp;
      } catch (e) {
         lastErr = e as Error;
         log.warn(`[getApp] launch attempt ${attempt} failed: ${lastErr.message}`);
         killStaleHostApp();
         await new Promise(r => setTimeout(r, 1000));
      }
   }
   throw lastErr!;
}

export async function closeApp(): Promise<void> {
   if (!cachedApp) return;
   const pid = cachedApp.process()?.pid;
   try { await cachedApp.close(); } catch { }
   cachedApp = null;
   if (pid && process.platform === 'darwin') {
      for (let i = 0; i < 20; i++) {
         try { process.kill(pid, 0); } catch { return; }
         await new Promise(r => setTimeout(r, 100));
      }
      try { process.kill(pid, 'SIGKILL'); } catch { }
   }
}

export async function stubFileDialog(app: ElectronApplication, file: string): Promise<void> {
   await app.evaluate(({ dialog }, p) => {
      (dialog as any).__origShowOpenDialog ??= dialog.showOpenDialog;
      dialog.showOpenDialog = (async () => ({ canceled: false, filePaths: [p] })) as any;
      (dialog as any).showOpenDialogSync = (() => [p]) as any;
   }, file);
}

const WINDOW_WIDTH  = Number(process.env.APP_WINDOW_WIDTH  || 1800);
const WINDOW_HEIGHT = Number(process.env.APP_WINDOW_HEIGHT || 1100);

export async function resizeHostWindow(
   app: ElectronApplication,
   w: number = WINDOW_WIDTH,
   h: number = WINDOW_HEIGHT,
): Promise<void> {
   try {
      await app.evaluate(({ BrowserWindow }, { w, h }) => {
         const wins = BrowserWindow.getAllWindows().filter(b => !b.isDestroyed());
         const win  = wins.find(b => b.isVisible()) ?? wins[0] ?? BrowserWindow.getFocusedWindow();
         if (!win) return;
         win.setBounds({ width: w, height: h });
         win.center();
      }, { w, h });
   } catch (e) {
      log.warn(`[resizeHostWindow] failed: ${(e as Error).message}`);
   }
}

async function waitForAppReady(page: Page, label: string, timeout = 60_000): Promise<void> {
   const t0 = Date.now();
   try {
      await page.waitForLoadState('networkidle', { timeout: 15_000 });
   } catch (e) {
      log.warn(`[appReady:${label}] networkidle skipped: ${(e as Error).message}`);
   }
   try {
      await page.getByRole('button', { name: 'Chat', exact: true }).first()
         .waitFor({ state: 'visible', timeout });
      log.info(`[appReady:${label}] ok in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
   } catch (e) {
      log.warn(`[appReady:${label}] timeout: ${(e as Error).message}`);
   }
}

function pickMainPage(pages: Page[]): Page | null {
   return pages.find(p => {
      const u = p.url();
      return u && u !== 'about:blank' && !u.startsWith('devtools://') && !u.startsWith('chrome-extension://');
   }) ?? pages[0] ?? null;
}

export type Role = 'host' | 'vm';
export type UserContext = {
   page: Page;
   role: Role;
   displayName: string;
   app: ElectronApplication | null;
};

export const accountFor = (role: Role): string =>
   role === 'host'
      ? (process.env.HOST_ACCOUNT || 'autotest01')
      : (process.env.VM_ACCOUNT   || 'autotest02');

type TestOptions = {
   tenant:    TenantKind;
   user1Role: Role;
   user2Role: Role;
};

type TestFixtures = {
   app:            ElectronApplication;   // legacy alias of hostApp
   mainWindow:     Page;                  // legacy alias of hostWindow
   tenantContext:  TenantContext;
   user1:          UserContext;
   user2:          UserContext;
};

type WorkerFixtures = {
   hostApp:    ElectronApplication;
   hostWindow: Page;
   vmApp:      Browser | null;
   vmWindow:   Page | null;
};

export const test = base.extend<TestOptions & TestFixtures, WorkerFixtures>({
   tenant:    [(process.env.TENANT === 'b2b' ? 'b2b' : 'b2c') as TenantKind, { option: true }],
   user1Role: ['host', { option: true }],
   user2Role: ['vm',   { option: true }],

   tenantContext: async ({ tenant }, use) => {
      const ctx: TenantContext = tenant === 'b2b' ? new B2BContext() : new B2CContext();
      await use(ctx);
   },

   hostApp: [async ({}, use) => {
      const app = await getApp();
      await use(app);
      await closeApp();
   }, { scope: 'worker' }],

   hostWindow: [async ({ hostApp }, use) => {
      const page = await hostApp.firstWindow();
      await resizeHostWindow(hostApp);
      await waitForAppReady(page, 'host');
      await use(page);
   }, { scope: 'worker' }],

   vmApp: [async ({}, use) => {
      let app: Browser | null = null;
      try { app = await getVmApp(); }
      catch (e) { log.warn(`[vmApp] unavailable: ${(e as Error).message}`); }
      await use(app);
      await closeVmApp();
   }, { scope: 'worker' }],

   vmWindow: [async ({ vmApp }, use) => {
      let page: Page | null = null;
      if (vmApp) {
         const ctx = vmApp.contexts()[0];
         for (let i = 0; i < 60 && !page; i++) {
            page = ctx ? pickMainPage(ctx.pages()) : null;
            if (page) break;
            await new Promise(r => setTimeout(r, 500));
         }
      }
      if (page) log.info(`[vmWindow] url=${page.url()}`);
      else      log.warn('[vmWindow] no main page found');
      if (page) resizeVmWindow();
      if (page) await waitForAppReady(page, 'vm');
      await use(page);
   }, { scope: 'worker' }],

   app: async ({ hostApp }, use) => {
      await use(hostApp);
   },

   mainWindow: async ({ hostWindow }, use) => {
      await use(hostWindow);
   },

   user1: async ({ user1Role, hostApp, hostWindow, vmWindow }, use, testInfo) => {
      const page = user1Role === 'host' ? hostWindow : vmWindow;
      if (!page) {
         testInfo.skip(true, `user1=${user1Role} unavailable`);
         await use(undefined as unknown as UserContext);
         return;
      }
      const app = user1Role === 'host' ? hostApp : null;
      await use({ page, role: user1Role, displayName: accountFor(user1Role), app });
   },

   user2: async ({ user2Role, hostApp, hostWindow, vmWindow }, use, testInfo) => {
      const page = user2Role === 'host' ? hostWindow : vmWindow;
      if (!page) {
         testInfo.skip(true, `user2=${user2Role} unavailable`);
         await use(undefined as unknown as UserContext);
         return;
      }
      const app = user2Role === 'host' ? hostApp : null;
      await use({ page, role: user2Role, displayName: accountFor(user2Role), app });
   },
});

export { expect };
