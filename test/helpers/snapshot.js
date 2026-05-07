// Tiny hand-rolled snapshot helper that works on Node 18+.
// Stores .snap files next to the test, regenerate via UPDATE_SNAPSHOTS=1.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

export function matchSnapshot(t, name, actual) {
  const testFile = t.filePath ?? guessTestFile(t);
  const snapDir = join(dirname(testFile), '__snapshots__');
  mkdirSync(snapDir, { recursive: true });
  const snapFile = join(snapDir, `${basename(testFile)}--${slug(name)}.snap`);

  const update = process.env.UPDATE_SNAPSHOTS === '1' || process.env.UPDATE_SNAPSHOTS === 'true';
  const actualNorm = normalize(actual);

  if (!existsSync(snapFile) || update) {
    writeFileSync(snapFile, actualNorm);
    if (process.env.CI) {
      throw new Error(`Snapshot missing in CI: ${snapFile}\nRun npm run test:update locally first.`);
    }
    return; // generated
  }

  const expected = readFileSync(snapFile, 'utf8');
  if (expected !== actualNorm) {
    const diff = simpleDiff(expected, actualNorm);
    throw new Error(`Snapshot mismatch: ${snapFile}\n${diff}\n\nIf intentional, run UPDATE_SNAPSHOTS=1 npm test`);
  }
}

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function guessTestFile(t) {
  // Node's TestContext doesn't expose its origin. Fall back to argv[1].
  return process.argv[1] ?? 'unknown.test.js';
}

function normalize(s) {
  if (Array.isArray(s)) return s.join('\n') + '\n';
  if (typeof s === 'string') return s.endsWith('\n') ? s : s + '\n';
  return JSON.stringify(s, null, 2) + '\n';
}

function simpleDiff(a, b) {
  const al = a.split('\n');
  const bl = b.split('\n');
  const out = [];
  const maxLen = Math.max(al.length, bl.length);
  for (let i = 0; i < maxLen; i++) {
    if (al[i] !== bl[i]) {
      if (al[i] !== undefined) out.push(`- ${al[i]}`);
      if (bl[i] !== undefined) out.push(`+ ${bl[i]}`);
    }
  }
  return out.slice(0, 30).join('\n') + (out.length > 30 ? `\n... (${out.length - 30} more)` : '');
}
