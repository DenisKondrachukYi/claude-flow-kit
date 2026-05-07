// Regression: no @latest tags in template (M9 hardening).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '..', 'src', 'template');

// Files where @latest is allowed (not first-party, not on registry).
const ALLOW_LATEST_IN = ['obsidian-claude-code-mcp']; // packages, not file paths

function* walkJson(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkJson(full);
    else if (entry.isFile() && entry.name.endsWith('.json')) yield full;
  }
}

test('no unpinned @latest tags in template JSON files', () => {
  const offenders = [];
  for (const file of walkJson(TEMPLATE_DIR)) {
    const content = readFileSync(file, 'utf8');
    // Look for "<pkg>@latest" patterns inside arg arrays.
    const matches = content.match(/[a-z@/0-9_-]+@latest/g) || [];
    for (const m of matches) {
      const pkg = m.replace('@latest', '');
      if (!ALLOW_LATEST_IN.includes(pkg)) {
        offenders.push(`${file}: ${m}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `Found unpinned @latest references:\n${offenders.join('\n')}`);
});

test('settings statusLine uses pinned claude-powerline', () => {
  const settings = JSON.parse(
    readFileSync(join(TEMPLATE_DIR, '.claude', 'settings.json'), 'utf8')
  );
  const cmd = settings.statusLine?.command || '';
  assert.match(cmd, /@owloops\/claude-powerline@\d+\.\d+\.\d+/, 'statusLine should pin powerline version');
  assert.doesNotMatch(cmd, /@latest/);
});

test('all settings variants pin claude-powerline identically', () => {
  const variantsDir = join(TEMPLATE_DIR, '.claude', 'settings-variants');
  for (const f of readdirSync(variantsDir)) {
    if (!f.endsWith('.json')) continue;
    const v = JSON.parse(readFileSync(join(variantsDir, f), 'utf8'));
    const cmd = v.statusLine?.command || '';
    assert.match(cmd, /@owloops\/claude-powerline@\d+\.\d+\.\d+/, `${f} should pin powerline`);
  }
});
