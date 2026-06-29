import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitize(name: string) {
  return name.trim().replace(/[<>:"/\\|?*]/g, '_');
}

export function deleteAllByPathAndPrefix(
  folderPath: string,
  prefix: string
): void {
  if (!fs.existsSync(folderPath)) return;

  for (const name of fs.readdirSync(folderPath)) {
    const fullPath = path.join(folderPath, name);

    if (name.startsWith(prefix)) {
      fs.rmSync(fullPath, {
        recursive: true,
        force: true,
      });
    }
  }
}
export function deleteAllByPath(
  folderPath: string,
): void {
  if (!fs.existsSync(folderPath)) return;

  fs.rmSync(folderPath, {
    recursive: true,
    force: true,
  });
}


export function moveFolder(
  oldFolder: string,
  newFolder: string,
  isRemoveOldFolder = true
): string {
  if (!fs.existsSync(oldFolder)) {
    throw new Error(`Source folder does not exist: ${oldFolder}`);
  }

  fs.mkdirSync(path.dirname(newFolder), {
    recursive: true,
  });

  if (fs.existsSync(newFolder)) {
    fs.rmSync(newFolder, {
      recursive: true,
      force: true,
    });
  }

  fs.renameSync(oldFolder, newFolder);

  if (isRemoveOldFolder) {
    const tempFolder = path.dirname(oldFolder);

    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, {
        recursive: true,
        force: true,
      });
    }
  }

  return newFolder;
}

let queue: ((v: string) => void)[] = [];

export function ask(q: string): Promise<string> {
  process.stdout.write(q);

  return new Promise((resolve) => {
    queue.push(resolve);
    process.stdin.once('data', (data) => {
      const fn = queue.shift();
      fn?.(data.toString().trim());
    });
  });
}

export function getStringValueFromCLI(key: string): string | null {
  const arg = process.argv.find(a => a.startsWith(`--${key}=`));
  return arg ? arg.split('=')[1]?.trim() : null;
}

export function getNumberValueFromCLI(key: string): number | null {
  const arg = process.argv.find(a => a.startsWith(`--${key}=`));
  if (!arg) return null;

  const value = Number(arg.split('=')[1]?.trim());
  return Number.isNaN(value) ? null : value;
}

const _pad = (n: number) => String(n).padStart(2, '0');
const _d = new Date();

export const RUN_TAG =
  `${_d.getFullYear()}${_pad(_d.getMonth() + 1)}${_pad(_d.getDate())}` +
  `${_pad(_d.getHours())}${_pad(_d.getMinutes())}${_pad(_d.getSeconds())}`;

