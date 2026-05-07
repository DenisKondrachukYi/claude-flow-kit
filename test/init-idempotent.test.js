import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { walkTree } from './helpers/walk-tree.js';
import { runCli } from './helpers/run-cli.js';

test('idempotent: second init in same dir does not break', () => {
  const d = mkdtempSync(join(tmpdir(), 'cfk-idem-'));
  // Mark as Node-TS for variety.
  writeFileSync(join(d, 'package.json'), JSON.stringify({ devDependencies: { typescript: '5' } }));

  const r1 = runCli(['init', d, '--no-install-deps']);
  assert.equal(r1.status, 0);
  const tree1 = walkTree(d).filter((p) => !p.endsWith('hot.md.precompact'));

  // Second init: should detect "existing project" and skip prompt with --force.
  const r2 = runCli(['init', d, '--no-install-deps', '--force']);
  assert.equal(r2.status, 0, `Second init failed: ${r2.stderr}`);
  const tree2 = walkTree(d).filter((p) => !p.endsWith('hot.md.precompact'));

  assert.deepEqual(tree2, tree1, 'Tree should be identical after idempotent init');
});

test('init merges into existing .gitignore', () => {
  const d = mkdtempSync(join(tmpdir(), 'cfk-gi-'));
  writeFileSync(join(d, '.gitignore'), 'node_modules/\n');

  const r = runCli(['init', d, '--no-install-deps']);
  assert.equal(r.status, 0);

  const fs = require('node:fs');
  const gi = fs.readFileSync(join(d, '.gitignore'), 'utf8');
  assert.match(gi, /node_modules\//, 'should preserve existing entries');
  assert.match(gi, /hot\.md\.precompact/, 'should add framework entry');
  assert.ok(!fs.existsSync(join(d, '.gitignore.template')), '.gitignore.template should be removed');
});

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
