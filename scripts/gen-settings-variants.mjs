#!/usr/bin/env node
// Generates .claude/settings-variants/<stack>.json from a single source-of-truth.
// Run: npm run gen:settings (writes files), or `--check` to verify in-sync (CI).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATE_DIR = resolve(ROOT, 'src/template/.claude');
const VARIANTS_DIR = resolve(TEMPLATE_DIR, 'settings-variants');

// Single source of truth: base settings.json (no Stop hook).
const base = JSON.parse(readFileSync(resolve(TEMPLATE_DIR, 'settings.json'), 'utf8'));

// Per-stack overrides: extra allows, extra denies, Stop hook command.
const STACKS = {
  nextjs: {
    extraAllow: ['Bash(pnpm:*)', 'Bash(npx:*)', 'Bash(node:*)'],
    extraDeny: ['Write(.next/**)', 'Write(node_modules/**)'],
    stop: 'cd "$CLAUDE_PROJECT_DIR" && pnpm typecheck && pnpm lint --max-warnings 0 && pnpm vitest run --reporter=dot',
    timeout: 300,
  },
  'node-typescript': {
    extraAllow: ['Bash(pnpm:*)', 'Bash(npm:*)', 'Bash(npx:*)', 'Bash(node:*)', 'Bash(tsx:*)'],
    extraDeny: ['Write(node_modules/**)', 'Write(dist/**)'],
    stop: 'cd "$CLAUDE_PROJECT_DIR" && pnpm tsc --noEmit && pnpm eslint . --max-warnings 0 && pnpm vitest run --reporter=dot',
    timeout: 240,
  },
  python: {
    extraAllow: [
      'Bash(uv:*)',
      'Bash(python:*)',
      'Bash(python3:*)',
      'Bash(pip:*)',
      'Bash(pytest:*)',
      'Bash(ruff:*)',
      'Bash(mypy:*)',
    ],
    extraDeny: ['Write(.venv/**)', 'Write(__pycache__/**)', 'Write(.pytest_cache/**)'],
    stop: 'cd "$CLAUDE_PROJECT_DIR" && uv run ruff check . && uv run mypy . && uv run pytest -q --no-header',
    timeout: 240,
  },
  go: {
    extraAllow: ['Bash(go:*)', 'Bash(golangci-lint:*)', 'Bash(gofmt:*)'],
    extraDeny: ['Write(vendor/**)'],
    stop: 'cd "$CLAUDE_PROJECT_DIR" && go vet ./... && golangci-lint run ./... && go test -race -count=1 ./...',
    timeout: 180,
  },
};

function buildVariant(stack, override) {
  // Deep-clone base
  const v = JSON.parse(JSON.stringify(base));
  // Merge allow/deny
  v.permissions.allow = [...v.permissions.allow, ...override.extraAllow];
  v.permissions.deny = [...v.permissions.deny, ...override.extraDeny];
  // Replace TaskCompleted with Stop hook (stack-specific lint+typecheck+test).
  delete v.hooks.TaskCompleted;
  v.hooks.Stop = [
    {
      hooks: [
        {
          type: 'command',
          command: override.stop,
          timeout: override.timeout,
        },
      ],
    },
  ];
  return v;
}

const mode = process.argv.includes('--check') ? 'check' : 'write';
let mismatches = 0;

for (const [stack, override] of Object.entries(STACKS)) {
  const variant = buildVariant(stack, override);
  const out = JSON.stringify(variant, null, 2) + '\n';
  const path = resolve(VARIANTS_DIR, `${stack}.json`);
  if (mode === 'check') {
    const current = readFileSync(path, 'utf8');
    if (current !== out) {
      console.error(`✗ ${stack}.json out of sync — run: npm run gen:settings`);
      mismatches++;
    } else {
      console.log(`✓ ${stack}.json in sync`);
    }
  } else {
    writeFileSync(path, out);
    console.log(`✓ wrote ${stack}.json`);
  }
}

if (mode === 'check' && mismatches > 0) {
  process.exit(1);
}
