import { _electron as electron, ElectronApplication, Page } from 'playwright';
import { getAppExecutablePath, waitForAppExecutable } from '../core/electron';

let sharedApp: ElectronApplication | null = null;
let sharedPage: Page | null = null;

export async function startSharedApp(): Promise<{
  app: ElectronApplication;
  page: Page;
}> {
  if (sharedApp && sharedPage) {
    return { app: sharedApp, page: sharedPage };
  }

  const execPath = getAppExecutablePath();
  await waitForAppExecutable(execPath);

  sharedApp = await electron.launch({
    executablePath: execPath,
  });

  sharedPage = await sharedApp.waitForEvent('window', {
    timeout: 60000,
  });

  await sharedPage.waitForLoadState('domcontentloaded');

  return { app: sharedApp, page: sharedPage };
}

export function getSharedApp() {
  return sharedApp;
}

export function getSharedPage() {
  return sharedPage;
}

export async function stopSharedApp(): Promise<void> {
  if (!sharedApp) return;

  try {
    await sharedApp.close();
  } catch {
  } finally {
    sharedApp = null;
    sharedPage = null;
  }
}