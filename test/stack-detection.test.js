import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { detectStack } from '../src/lib/stack.js';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'cfk-stack-'));
}

test('detect nextjs from next.config.js', () => {
  const d = tmp();
  writeFileSync(join(d, 'next.config.js'), 'module.exports = {};');
  assert.equal(detectStack(d), 'nextjs');
});

test('detect nextjs from next.config.ts', () => {
  const d = tmp();
  writeFileSync(join(d, 'next.config.ts'), 'export default {};');
  assert.equal(detectStack(d), 'nextjs');
});

test('detect node-typescript from package.json with TS dep', () => {
  const d = tmp();
  writeFileSync(join(d, 'package.json'), JSON.stringify({ devDependencies: { typescript: '5' } }));
  assert.equal(detectStack(d), 'node-typescript');
});

test('detect node-typescript from tsconfig.json', () => {
  const d = tmp();
  writeFileSync(join(d, 'package.json'), '{}');
  writeFileSync(join(d, 'tsconfig.json'), '{}');
  assert.equal(detectStack(d), 'node-typescript');
});

test('detect python from pyproject.toml', () => {
  const d = tmp();
  writeFileSync(join(d, 'pyproject.toml'), '[project]\nname="x"');
  assert.equal(detectStack(d), 'python');
});

test('detect python from requirements.txt', () => {
  const d = tmp();
  writeFileSync(join(d, 'requirements.txt'), 'flask');
  assert.equal(detectStack(d), 'python');
});

test('detect go from go.mod', () => {
  const d = tmp();
  writeFileSync(join(d, 'go.mod'), 'module x');
  assert.equal(detectStack(d), 'go');
});

test('fallback to generic', () => {
  const d = tmp();
  writeFileSync(join(d, 'README.md'), '# foo');
  assert.equal(detectStack(d), 'generic');
});

test('empty dir → generic', () => {
  assert.equal(detectStack(tmp()), 'generic');
});

test('non-existent dir → generic', () => {
  assert.equal(detectStack('/tmp/does-not-exist-' + Date.now()), 'generic');
});
