import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from './helpers/run-cli.js';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'cfk-add-'));
}

test('cfk list returns 0 in any directory', () => {
  const d = tmp();
  const r = runCli(['list'], { cwd: d });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Available components/);
  assert.match(r.stdout, /status-dashboard/);
});

test('cfk add status-dashboard installs only that component', () => {
  const d = tmp();
  const r = runCli(['add', 'status-dashboard'], { cwd: d });
  assert.equal(r.status, 0, `add failed: ${r.stderr}`);
  assert.ok(existsSync(join(d, '.claude/commands/status.md')));
  assert.ok(existsSync(join(d, '.claude/scripts/status.sh')));
  assert.ok(!existsSync(join(d, '.claude/agents/explorer.md')), 'should not install other components');
});

test('cfk add unknown component fails with helpful error', () => {
  const d = tmp();
  const r = runCli(['add', 'totally-fake'], { cwd: d });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /Unknown component/);
});

test('cfk add without name shows help', () => {
  const d = tmp();
  const r = runCli(['add'], { cwd: d });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /Missing component name/);
});

test('cfk add skips existing files without --force', () => {
  const d = tmp();
  // First add.
  runCli(['add', 'status-dashboard'], { cwd: d });
  // Second add — should skip.
  const r = runCli(['add', 'status-dashboard'], { cwd: d });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /skip|skipped/);
});

test('cfk list --installed filters to installed only', () => {
  const d = tmp();
  runCli(['add', 'status-dashboard'], { cwd: d });
  const r = runCli(['list', '--installed'], { cwd: d });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /status-dashboard/);
  assert.ok(!r.stdout.includes('hooks ') || r.stdout.includes('● hooks'),
    'should not list non-installed hooks line in installed-only mode');
});
