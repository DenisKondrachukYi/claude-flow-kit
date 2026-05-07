// add: install a single component (or list available ones).
import { existsSync, mkdirSync, copyFileSync, readFileSync, chmodSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { c, banner, ok, warn, fail, info, hr } from './print.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, '..', 'manifest.json');

export function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

export async function runAdd({ component, templateDir, flags }) {
  if (!component) {
    fail('Missing component name. Run `cfk list` to see available components.');
    return 1;
  }

  const manifest = loadManifest();
  const def = manifest.components[component];
  if (!def) {
    fail(`Unknown component '${component}'.`);
    info(`Run ${c.cyan('cfk list')} to see what's available.`);
    return 1;
  }

  banner(`Adding component: ${c.cyan(component)}`);
  info(c.dim(def.description));
  hr();

  const cwd = process.cwd();
  let added = 0;
  let skipped = 0;

  for (const rel of def.files) {
    const src = join(templateDir, rel);
    const dst = join(cwd, rel);

    if (!existsSync(src)) {
      warn(`source missing: ${rel} (template incomplete?)`);
      continue;
    }

    if (existsSync(dst) && !flags.force) {
      info(c.dim(`  ${c.yellow('skip')} ${rel} (exists; --force to overwrite)`));
      skipped++;
      continue;
    }

    if (!flags.dryRun) {
      mkdirSync(dirname(dst), { recursive: true });
      copyFileSync(src, dst);
      // Mark scripts executable.
      if (rel.endsWith('.sh')) chmodSync(dst, 0o755);
    }
    info(`  ${c.green('+')} ${rel}`);
    added++;
  }

  hr();
  ok(`${added} added, ${skipped} skipped`);
  if (flags.dryRun) info(c.yellow('(dry-run: no files were written)'));
  return 0;
}

export async function runList({ flags }) {
  const manifest = loadManifest();
  const cwd = process.cwd();

  banner('Available components');
  hr();

  const longest = Math.max(...Object.keys(manifest.components).map((k) => k.length));

  for (const [name, def] of Object.entries(manifest.components)) {
    const padded = name.padEnd(longest + 2);
    const installed = def.files.every((f) => existsSync(join(cwd, f)));
    const partially = !installed && def.files.some((f) => existsSync(join(cwd, f)));

    let badge;
    if (installed) badge = c.green('●');
    else if (partially) badge = c.yellow('◐');
    else badge = c.dim('○');

    if (flags.installed && !installed) continue;

    process.stdout.write(`  ${badge} ${c.bold(padded)} ${c.dim(def.description)}\n`);
  }

  hr();
  info(c.dim('●'.padStart(3) + ' installed   ' + c.dim('◐') + ' partial   ' + c.dim('○') + ' not added'));
  info(c.dim(`Add a component:    cfk add <name>`));
  info(c.dim(`Show only installed: cfk list --installed`));
  return 0;
}
