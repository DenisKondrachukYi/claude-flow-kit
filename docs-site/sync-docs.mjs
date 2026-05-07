// Copy ../docs/*.md into this dir before VitePress build.
// VitePress + symlinks doesn't play nicely with Vite's preserveSymlinks logic.
import { readdirSync, copyFileSync, statSync, unlinkSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', 'docs');
const DST = __dirname;

let copied = 0;
for (const f of readdirSync(SRC)) {
  if (!f.endsWith('.md')) continue;
  const s = join(SRC, f);
  if (!statSync(s).isFile()) continue;
  copyFileSync(s, join(DST, f));
  copied++;
}
console.log(`✓ synced ${copied} doc files into docs-site/`);
