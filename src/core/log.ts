import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
   debug:  0,
   info:   1,
   warn:   2,
   error:  3,
   silent: 4,
};

const envLevel = (process.env.LOG_LEVEL || '').toLowerCase() as LogLevel;
const threshold = LEVELS[envLevel] ?? LEVELS.info;

/* Optional file sink. Set LOG_FILE=path/to/file.log to mirror every emitted
 * line into a file (append mode). Directory is created on demand. */
const LOG_FILE = process.env.LOG_FILE || '';
let fileStream: fs.WriteStream | null = null;
if (LOG_FILE) {
   try {
      fs.mkdirSync(path.dirname(path.resolve(LOG_FILE)), { recursive: true });
      fileStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
   } catch {
      /* fall back to console-only if the file sink fails to initialise */
      fileStream = null;
   }
}

function formatForFile(level: LogLevel, args: unknown[]): string {
   const parts = args.map(a => typeof a === 'string' ? a : JSON.stringify(a));
   return `${new Date().toISOString()} [${level.toUpperCase()}] ${parts.join(' ')}\n`;
}

function emit(level: LogLevel, args: unknown[]): void {
   if (LEVELS[level] < threshold) return;
   const out = level === 'error' ? console.error
             : level === 'warn'  ? console.warn
             :                     console.log;
   out(...args);
   if (fileStream) fileStream.write(formatForFile(level, args));
}

export const log = {
   debug: (...args: unknown[]) => emit('debug', args),
   info:  (...args: unknown[]) => emit('info',  args),
   warn:  (...args: unknown[]) => emit('warn',  args),
   error: (...args: unknown[]) => emit('error', args),
};
