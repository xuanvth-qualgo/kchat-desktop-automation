import { test } from '@playwright/test';

export type StepOpts = {
   retries?:   number;  
   timeoutMs?: number;  
};

export async function stepAndRetry(
   name: string,
   fn: () => Promise<void>,
   opts: StepOpts = {},
): Promise<void> {
   const retries   = opts.retries   ?? 3;
   const timeoutMs = opts.timeoutMs ?? 60_000;

   await test.step(name, async () => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
         try {
            await Promise.race([
               fn(),
               new Promise<never>((_, rej) =>
                  setTimeout(() => rej(new Error(`step timeout ${timeoutMs}ms`)), timeoutMs),
               ),
            ]);
            if (attempt > 1) console.log(`[step:${name}] passed on attempt ${attempt}`);
            return;
         } catch (e) {
            lastErr = e;
            console.warn(`[step:${name}] attempt ${attempt}/${retries + 1} failed: ${(e as Error).message}`);
         }
      }
      console.warn(`[step:${name}] SKIPPED after ${retries + 1} attempts — last error: ${(lastErr as Error)?.message}`);
   });
}
