const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const argv = process.argv.slice(2);
const passthrough = [];
let tenant = '';
let rawCtx = '';
let rawIds = '';
let smoke  = false;
let noClean = false;
let rawScope    = '';
let rawAction   = '';
let rawDatatype = '';
let receiverMode = '';

for (let i = 0; i < argv.length; i++) {
   const a = argv[i];
   if (a === '--tenant')               { tenant = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--tenant='))      { tenant = a.slice('--tenant='.length).toLowerCase(); continue; }
   if (a === '--ctx')               { rawCtx = argv[++i] ?? ''; continue; }
   if (a.startsWith('--ctx='))      { rawCtx = a.slice('--ctx='.length); continue; }
   if (a === '--ids')               { rawIds = argv[++i] ?? ''; continue; }
   if (a.startsWith('--ids='))      { rawIds = a.slice('--ids='.length); continue; }
   if (a === '--scope')             { rawScope = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--scope='))    { rawScope = a.slice('--scope='.length).toLowerCase(); continue; }
   if (a === '--action')            { rawAction = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--action='))   { rawAction = a.slice('--action='.length).toLowerCase(); continue; }
   if (a === '--datatype')          { rawDatatype = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--datatype=')) { rawDatatype = a.slice('--datatype='.length).toLowerCase(); continue; }
   if (a === '--receiver')          { receiverMode = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--receiver=')) { receiverMode = a.slice('--receiver='.length).toLowerCase(); continue; }
   if (a === '--smoke')             { smoke = true; continue; }
   if (a === '--no-clean')          { noClean = true; continue; }
   passthrough.push(a);
}

if (receiverMode) {
   if (!['vm', 'local'].includes(receiverMode)) {
      console.error(`[test-filter] invalid --receiver "${receiverMode}"; expected vm | local`);
      process.exit(2);
   }
   process.env.RECEIVER_MODE = receiverMode;
}

// ---------------------------------------------------------------------------
// Auto-clear: xoá log/artifact của lần chạy trước, GIỮ session Electron
// (kchat-qa/* nguyên vẹn để khỏi phải đăng nhập lại).
// Dùng cờ --no-clean để bỏ qua bước này khi cần debug log cũ.
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');

function rmrf(p) {
   try { fs.rmSync(p, { recursive: true, force: true }); }
   catch (e) { console.warn(`[clean] skip ${p}: ${e.message}`); }
}

function cleanArtifacts() {
   const dirs = ['allure-results', 'allure-report'];
   for (const d of dirs) rmrf(path.join(ROOT, d));
   console.log(`[clean] cleared: ${dirs.join(', ')}`);
}

if (!noClean) cleanArtifacts();

if (tenant && tenant !== 'b2c' && tenant !== 'b2b') {
   console.error(`[test-filter] invalid --tenant "${tenant}"; expected b2c | b2b`);
   process.exit(2);
}

const toList = (raw) =>
   raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

const ctx       = toList(rawCtx);
const ids       = toList(rawIds);
const actions   = toList(rawAction);
const datatypes = toList(rawDatatype);

const VALID_SCOPES    = ['main', 'thread', 'all'];
const VALID_ACTIONS   = ['send', 'reply', 'react', 'edit', 'delete', 'forward', 'copy'];
const VALID_DATATYPES = ['text', 'mention', 'link', 'emoji', 'image', 'video', 'file', 'voice', 'mix-types'];

if (rawScope && !VALID_SCOPES.includes(rawScope)) {
   console.error(`[test-filter] invalid --scope "${rawScope}"; expected ${VALID_SCOPES.join(' | ')}`);
   process.exit(2);
}
for (const a of actions) {
   if (!VALID_ACTIONS.includes(a)) {
      console.error(`[test-filter] invalid --action "${a}"; expected ${VALID_ACTIONS.join(' | ')}`);
      process.exit(2);
   }
}
for (const d of datatypes) {
   if (!VALID_DATATYPES.includes(d)) {
      console.error(`[test-filter] invalid --datatype "${d}"; expected ${VALID_DATATYPES.join(' | ')}`);
      process.exit(2);
   }
}

// Build positional file-path regex từ --scope / --action / --datatype.
// Playwright nhận positional arg như regex match trên path file test.
// Folder pattern : `{scope}_NN-{action}-...`
// File   pattern : `NN-{action}-{datatype}.test.ts`
function buildPathRegex() {
   const parts = [];
   if (rawScope && rawScope !== 'all') parts.push(`${rawScope}_`);
   if (actions.length) {
      const a = `(${actions.join('|')})`;
      // action xuất hiện ở folder (sau `NN-`) hoặc trong tên file
      parts.push(`-${a}-`);
   }
   if (datatypes.length) {
      const d = `(${datatypes.join('|')})`;
      parts.push(`-${d}\\.test\\.ts$`);
   }
   if (!parts.length) return '';
   // Prefix `tests/` để regex không bắt đầu bằng `-` (sẽ bị xem như flag).
   return `tests/.*${parts.join('.*')}`;
}

const idRe       = ids.length ? `\\b(${ids.join('|')})\\b` : '';
const pathRegex  = buildPathRegex();

const env = { ...process.env };
if (tenant) env.TENANT = tenant;

const ctxBatches = ctx.length > 1 ? ctx.map(c => [c]) : [ctx];

(async () => {
   let finalCode = 0;
   for (const batch of ctxBatches) {
      const ctxReBatch = batch.length ? `\\b(${batch.join('|')})\\b` : '';
      const partsBatch = [];
      if (smoke)       partsBatch.push('@smoke');
      if (ctxReBatch)  partsBatch.push(ctxReBatch);
      if (idRe)        partsBatch.push(idRe);
      const grepBatch = partsBatch.length === 1
         ? partsBatch[0]
         : partsBatch.length > 1
            ? partsBatch.map(p => `(?=.*${p})`).join('')
            : undefined;

      const pwArgs = ['playwright', 'test', ...passthrough];
      if (grepBatch) pwArgs.push('-g', grepBatch);
      if (pathRegex) pwArgs.push(pathRegex);

      console.log(
         `[test-filter] tenant=${tenant || 'b2c (default)'} smoke=${smoke}` +
         ` receiver=${process.env.RECEIVER_MODE || 'vm (default)'}` +
         ` scope=${rawScope || '*'} action=[${actions.join(',') || '*'}]` +
         ` datatype=[${datatypes.join(',') || '*'}]` +
         ` ctx=[${batch.join(',') || '*'}] ids=[${ids.join(',') || '*'}]` +
         ` grep=${grepBatch ?? '(none)'} path=${pathRegex || '(none)'}`,
      );

      const code = await new Promise((resolve) => {
         const child = spawn('npx', pwArgs, { stdio: 'inherit', env });
         child.on('exit', (c) => resolve(c ?? 0));
      });
      if (code !== 0) finalCode = code;
   }
   process.exit(finalCode);
})();
