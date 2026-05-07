import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { walkTree } from './helpers/walk-tree.js';
import { runCli } from './helpers/run-cli.js';
import { matchSnapshot } from './helpers/snapshot.js';

function tmp(prefix) {
  return mkdtempSync(join(tmpdir(), `cfk-${prefix}-`));
}

const TEST_FILE_PATH = import.meta.url.replace('file://', '');

test('init generic produces expected file tree', (t) => {
  const d = tmp('generic');
  const r = runCli(['init', d, '--no-install-deps']);
  assert.equal(r.status, 0, `CLI failed: ${r.stderr}`);
  const tree = walkTree(d).filter((p) => !p.endsWith('hot.md.precompact'));
  matchSnapshot({ filePath: TEST_FILE_PATH }, 'generic-tree', tree);
});

test('init nextjs applies correct settings.json', () => {
  const d = tmp('nextjs');
  const r = runCli(['init', d, '--stack', 'nextjs', '--no-install-deps']);
  assert.equal(r.status, 0);
  const settings = JSON.parse(
    require('node:fs').readFileSync(join(d, '.claude', 'settings.json'), 'utf8')
  );
  assert.ok(settings.hooks.Stop, 'nextjs variant should have Stop hook');
  assert.match(settings.hooks.Stop[0].hooks[0].command, /pnpm typecheck/);
});

test('init applies python variant', () => {
  const d = tmp('py');
  const r = runCli(['init', d, '--stack', 'python', '--no-install-deps']);
  assert.equal(r.status, 0);
  const settings = JSON.parse(
    require('node:fs').readFileSync(join(d, '.claude', 'settings.json'), 'utf8')
  );
  assert.match(settings.hooks.Stop[0].hooks[0].command, /uv run pytest/);
});

// Use ESM-friendly require shim
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
