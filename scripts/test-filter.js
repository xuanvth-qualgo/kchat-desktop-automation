const { spawn } = require('child_process');
require('dotenv').config();

const argv = process.argv.slice(2);
const passthrough = [];
let tenant = '';
let rawCtx = '';
let rawIds = '';
let smoke  = false;

for (let i = 0; i < argv.length; i++) {
   const a = argv[i];
   if (a === '--tenant')               { tenant = (argv[++i] ?? '').toLowerCase(); continue; }
   if (a.startsWith('--tenant='))      { tenant = a.slice('--tenant='.length).toLowerCase(); continue; }
   if (a === '--ctx')               { rawCtx = argv[++i] ?? ''; continue; }
   if (a.startsWith('--ctx='))      { rawCtx = a.slice('--ctx='.length); continue; }
   if (a === '--ids')               { rawIds = argv[++i] ?? ''; continue; }
   if (a.startsWith('--ids='))      { rawIds = a.slice('--ids='.length); continue; }
   if (a === '--smoke')             { smoke = true; continue; }
   passthrough.push(a);
}

if (tenant && tenant !== 'b2c' && tenant !== 'b2b') {
   console.error(`[test-filter] invalid --tenant "${tenant}"; expected b2c | b2b`);
   process.exit(2);
}

const toList = (raw) =>
   raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

const ctx = toList(rawCtx);
const ids = toList(rawIds);

const idRe  = ids.length ? `\\b(${ids.join('|')})\\b` : '';

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

      console.log(
         `[test-filter] tenant=${tenant || 'b2c (default)'} smoke=${smoke} ctx=[${batch.join(',') || '*'}] ids=[${ids.join(',') || '*'}] grep=${grepBatch ?? '(none)'}`,
      );

      const code = await new Promise((resolve) => {
         const child = spawn('npx', pwArgs, { stdio: 'inherit', env });
         child.on('exit', (c) => resolve(c ?? 0));
      });
      if (code !== 0) finalCode = code;
   }
   process.exit(finalCode);
})();
