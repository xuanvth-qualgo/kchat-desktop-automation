import path from 'path';
import os from 'os';
import fs from 'fs';
import fsPromises from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const REPO_ROOT = path.join(__dirname, '..');

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

const ENV = {
  MAC_APP_PATH: process.env.MAC_APP_PATH || '',
  WIN_APP_PATH: process.env.WIN_APP_PATH || '',
  APP_TIMEOUT_MS: Number(process.env.APP_TIMEOUT_MS || '600000'),
};

export function getAppExecutablePath(): string {
  const platform = os.platform();

  let appPath: string | undefined;

  if (platform === 'darwin') {
    appPath = ENV.MAC_APP_PATH;
  } else if (platform === 'win32') {
    appPath = ENV.WIN_APP_PATH;
  } else {
    throw new Error(`❌ Unsupported platform: ${platform}`);
  }

  if (!appPath) {
    throw new Error(`❌ Missing APP_PATH in .env`);
  }

  const resolvedPath = path.isAbsolute(appPath)
    ? appPath
    : path.join(REPO_ROOT, appPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`❌ App not found at path: ${resolvedPath}`);
  }

  console.log('✅ Using app path:', resolvedPath);

  return resolvedPath;
}


export async function waitForAppExecutable(execPath: string, timeoutMs = ENV.APP_TIMEOUT_MS): Promise<void> {
  const start = Date.now();
  const isWindows = os.platform() === 'win32';
  const flags = isWindows ? fs.constants.F_OK : (fs.constants.F_OK | fs.constants.X_OK);

  while (Date.now() - start < timeoutMs) {
    try {
      await fsPromises.access(execPath, flags);
      return;
    } catch {
      await sleep(300);
    }
  }
  throw new Error(`Timed out (${timeoutMs}ms) waiting for executable: ${execPath}`);
}