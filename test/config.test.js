// M3: config system tests.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readProjectConfig, writeProjectConfig, PROJECT_CONFIG_FILE } from '../src/lib/config.js';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'cfk-cfg-'));
}

test('readProjectConfig returns defaults when file missing', () => {
  const d = tmp();
  const c = readProjectConfig(d);
  assert.equal(c.version, 1);
  assert.equal(c.stack, null);
  assert.deepEqual(c.preserve, []);
});

test('writeProjectConfig persists and validates', () => {
  const d = tmp();
  const written = writeProjectConfig(d, { stack: 'python', preserve: ['CLAUDE.md'] });
  assert.equal(written.stack, 'python');
  assert.deepEqual(written.preserve, ['CLAUDE.md']);
  const fileContent = JSON.parse(readFileSync(join(d, PROJECT_CONFIG_FILE), 'utf8'));
  assert.equal(fileContent.stack, 'python');
});

test('writeProjectConfig rejects invalid stack value', () => {
  const d = tmp();
  const written = writeProjectConfig(d, { stack: 'evil-stack' });
  assert.equal(written.stack, null, 'invalid stack should be coerced to null');
});

test('writeProjectConfig sanitizes preserve to string[]', () => {
  const d = tmp();
  const written = writeProjectConfig(d, { preserve: ['a.md', 42, null, 'b.md'] });
  assert.deepEqual(written.preserve, ['a.md', 'b.md']);
});

test('readProjectConfig handles malformed JSON', () => {
  const d = tmp();
  writeFileSync(join(d, PROJECT_CONFIG_FILE), '{not json');
  const c = readProjectConfig(d);
  assert.equal(c.stack, null);
  assert.deepEqual(c.preserve, []);
});
