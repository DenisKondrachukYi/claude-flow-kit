// Verify cfk upgrade overwrites FRAMEWORK_OWNED but preserves USER_OWNED.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from './helpers/run-cli.js';

test('upgrade preserves CLAUDE.md and hot.md', () => {
  const d = mkdtempSync(join(tmpdir(), 'cfk-up-'));
  const initRes = runCli(['init', d, '--no-install-deps']);
  assert.equal(initRes.status, 0);

  // Mutate user-owned files.
  const claudeMdPath = join(d, 'CLAUDE.md');
  const customClaudeMd = '# My Custom Project\n\nTotally different content.\n';
  writeFileSync(claudeMdPath, customClaudeMd);

  const hotMdPath = join(d, 'docs', 'state', 'hot.md');
  const customHotMd = '---\nupdated: 2026-04-27\n---\n\n## Where\nIn the middle.\n';
  writeFileSync(hotMdPath, customHotMd);

  // Mutate a framework-owned file (should be overwritten).
  const startMdPath = join(d, '.claude', 'commands', 'start.md');
  writeFileSync(startMdPath, 'TAMPERED CONTENT');

  // Run upgrade.
  const upRes = runCli(['upgrade'], { cwd: d });
  assert.equal(upRes.status, 0, `upgrade failed: ${upRes.stderr}`);

  assert.equal(readFileSync(claudeMdPath, 'utf8'), customClaudeMd, 'CLAUDE.md should not be touched');
  assert.equal(readFileSync(hotMdPath, 'utf8'), customHotMd, 'hot.md should not be touched');
  assert.notEqual(readFileSync(startMdPath, 'utf8'), 'TAMPERED CONTENT', 'start.md should be refreshed');
});
