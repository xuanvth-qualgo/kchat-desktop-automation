import fs from 'fs';
import path from 'path';
import type { TestInfo } from '@playwright/test';
import { log } from '../log';
import { RUN_TAG } from '../utils/helpers';

export const LOG_DIR = path.resolve(process.cwd(), 'test-logs');

export type ErrorCategory =
   | 'SEND_FAIL'         // Message could not be sent (Retry exhausted)
   | 'NO_PUSH_NOTIF'     // VM Notification Center delta != expected
   | 'UNREAD_COUNT'      // Sidebar / app-bar unread mismatch
   | 'MSG_DECRYPT_FAIL'  // Receiver can't decrypt — bubble shows "This message can't be displayed"
   | 'LAST_MESSAGE'      // Last message verification failed
   | 'ELEMENT_FAIL'      // Locator / waitFor timeout (other than the above)
   | 'OTHER';

function categorize(message: string): ErrorCategory {
   const m = message ?? '';
   if (/sendMessage.*gave up|Retry click/i.test(m)) return 'SEND_FAIL';
   if (/kChat push notifications|Notification Center/i.test(m)) return 'NO_PUSH_NOTIF';
   if (/unread|app-bar|sidebar/i.test(m)) return 'UNREAD_COUNT';
   if (/This message can'?t be displayed|decrypt/i.test(m)) return 'MSG_DECRYPT_FAIL';
   if (/Last Message|verifyLast|reply quote|root text/i.test(m)) return 'LAST_MESSAGE';
   if (/locator|waitFor|toBeVisible|Timeout/i.test(m)) return 'ELEMENT_FAIL';
   return 'OTHER';
}

function sanitizeForFilename(s: string): string {
   return s.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

export interface SuiteKey {
   epic:     string;
   feature:  string;
}

function fileNameOf(k: SuiteKey): string {
   const epic     = k.epic.startsWith('[')    ? k.epic    : `[${k.epic}]`;
   const feature  = k.feature.startsWith('[') ? k.feature : `[${k.feature}]`;
   return sanitizeForFilename(`${epic}${feature}.${RUN_TAG}.log`);
}

export function recordTestErrors(testInfo: TestInfo, key: SuiteKey): void {
   try {
      if (testInfo.status === 'passed' || testInfo.errors.length === 0) return;

      fs.mkdirSync(LOG_DIR, { recursive: true });
      const filePath = path.join(LOG_DIR, fileNameOf(key));

      const ts    = new Date().toISOString();
      const lines: string[] = [];
      lines.push('');
      lines.push('────────────────────────────────────────────────────────────');
      lines.push(`Time:    ${ts}`);
      lines.push(`Test:    ${testInfo.title}`);
      lines.push(`Status:  ${testInfo.status}`);
      lines.push(`Project: ${testInfo.project.name}`);

      for (let i = 0; i < testInfo.errors.length; i++) {
         const err      = testInfo.errors[i];
         const msg      = (err.message ?? '').trim();
         const category = categorize(msg);
         const firstLn  = msg.split('\n')[0] || '<empty>';
         lines.push('');
         lines.push(`[${category}] (#${i + 1}) ${firstLn}`);
         if (err.stack) {
            lines.push(err.stack.split('\n').map(l => '   ' + l).join('\n'));
         } else if (msg.includes('\n')) {
            lines.push(msg.split('\n').slice(1).map(l => '   ' + l).join('\n'));
         }
      }

      fs.appendFileSync(filePath, lines.join('\n') + '\n');
   } catch (e) {
      log.warn(`[error-log] failed to write log: ${(e as Error).message}`);
   }
}
