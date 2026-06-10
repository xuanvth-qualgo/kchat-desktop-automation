import fs from 'fs';
import path from 'path';

export function escapeRegex(s: string): string {
   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deleteFilesWithPrefix(folderPath: string, prefix: string): void {
  if (!fs.existsSync(folderPath)) return;
  for (const file of fs.readdirSync(folderPath)) {
    if (file.startsWith(prefix)) fs.unlinkSync(path.join(folderPath, file));
  }
}

const _pad = (n: number) => String(n).padStart(2, '0');
const _d = new Date();

export const RUN_TAG = `${_pad(_d.getHours())}${_pad(_d.getMinutes())}${_pad(_d.getSeconds())}`;
