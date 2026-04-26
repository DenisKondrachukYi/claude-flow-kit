// upgrade: pull latest template updates while preserving user edits
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { c, banner, ok, warn, info, hr } from './print.js';

// Files we NEVER overwrite — they contain user edits
const USER_OWNED = [
  'CLAUDE.md',
  'AGENTS.md',
  'docs/project/product.md',
  'docs/project/tech.md',
  'docs/project/structure.md',
  'docs/state/hot.md',
  'docs/state/decisions.md',
  'docs/state/glossary.md',
  '.claude/settings.json',
  '.mcp.json',
];

// Files we ALWAYS update — they're framework infrastructure
const FRAMEWORK_OWNED = [
  '.claude/scripts/',
  '.claude/patterns/',
  '.claude/commands/start.md',
  '.claude/commands/handoff.md',
  '.claude/commands/sync.md',
  '.claude/commands/status.md',
  '.claude/commands/ship-feature.md',
  '.claude/commands/ship-full-stack-feature.md',
  '.claude/commands/api-first-feature.md',
  '.claude/commands/fix-prod-bug.md',
  '.claude/commands/debug-systematic.md',
  '.claude/commands/spec-interview.md',
  '.claude/agents/explorer.md',
  '.claude/agents/reviewer.md',
  '.claude/settings-variants/',
  '.claude/shared/wiki-bridge.md',
];

export async function runUpgrade({ templateDir, flags }) {
  banner('claude-flow-kit upgrade');
  const cwd = process.cwd();

  if (!existsSync(join(cwd, '.claude'))) {
    warn('No .claude/ directory in current dir — nothing to upgrade.');
    info(`Run ${c.cyan('cfk init')} first.`);
    return 1;
  }

  let updated = 0;
  let preserved = 0;

  for (const rel of FRAMEWORK_OWNED) {
    const srcPath = join(templateDir, rel);
    const dstPath = join(cwd, rel);
    if (!existsSync(srcPath)) continue;

    if (statSync(srcPath).isDirectory()) {
      updated += copyDirRecursive(srcPath, dstPath, flags.dryRun);
    } else {
      if (!flags.dryRun) {
        mkdirSync(dirname(dstPath), { recursive: true });
        copyFileSync(srcPath, dstPath);
      }
      updated++;
    }
  }

  preserved = USER_OWNED.length;

  hr();
  ok(`${updated} framework files updated`);
  info(c.dim(`${preserved} user-owned files preserved (CLAUDE.md, hot.md, etc.)`));
  hr();
  info(c.dim('Run `git diff` to review changes.'));
  return 0;
}

function copyDirRecursive(src, dst, dryRun) {
  let count = 0;
  if (!existsSync(src)) return 0;
  if (!dryRun) mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) {
      count += copyDirRecursive(s, d, dryRun);
    } else if (entry.isFile()) {
      if (!dryRun) copyFileSync(s, d);
      count++;
    }
  }
  return count;
}
