import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { isNewer } from '../src/lib/update-notifier.js';
import { runCli } from './helpers/run-cli.js';

test('isNewer: 0.3.0 > 0.2.0', () => {
  assert.equal(isNewer('0.3.0', '0.2.0'), true);
});

test('isNewer: 0.2.1 > 0.2.0', () => {
  assert.equal(isNewer('0.2.1', '0.2.0'), true);
});

test('isNewer: same version not newer', () => {
  assert.equal(isNewer('0.2.0', '0.2.0'), false);
});

test('isNewer: 0.1.5 not newer than 0.2.0', () => {
  assert.equal(isNewer('0.1.5', '0.2.0'), false);
});

test('isNewer: handles v-prefix', () => {
  assert.equal(isNewer('v0.3.0', 'v0.2.0'), true);
});

test('isNewer: handles missing values', () => {
  assert.equal(isNewer(null, '0.2.0'), false);
  assert.equal(isNewer('0.3.0', null), false);
});

test('CI mode skips update check (no banner stderr)', () => {
  const r = runCli(['--version'], { env: { CI: 'true', NO_UPDATE_NOTIFIER: '1' } });
  assert.equal(r.status, 0);
  // banner would land on stderr; in CI mode it should be empty.
  assert.equal(r.stderr, '');
});

test('--no-update-check honored', () => {
  const r = runCli(['--version', '--no-update-check']);
  assert.equal(r.status, 0);
});
