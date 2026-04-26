// doctor: diagnose installation
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { c, banner, ok, warn, fail, info, hr } from './print.js';

export async function runDoctor({ templateDir }) {
  banner('claude-flow-kit doctor');

  const cwd = process.cwd();
  const checks = [];

  // Project-local files
  checks.push(check('.claude/settings.json exists', () => existsSync(join(cwd, '.claude', 'settings.json'))));
  checks.push(check('docs/state/hot.md exists', () => existsSync(join(cwd, 'docs', 'state', 'hot.md'))));
  checks.push(check('CLAUDE.md exists', () => existsSync(join(cwd, 'CLAUDE.md'))));
  checks.push(check('Hooks scripts executable', () => {
    const dir = join(cwd, '.claude', 'scripts');
    if (!existsSync(dir)) return false;
    try {
      const sh = join(dir, 'session-start.sh');
      if (!existsSync(sh)) return false;
      return (statSync(sh).mode & 0o111) !== 0;
    } catch {
      return false;
    }
  }));

  // Global Claude config
  const globalSettings = join(homedir(), '.claude', 'settings.json');
  checks.push(check('~/.claude/settings.json exists', () => existsSync(globalSettings)));
  checks.push(check('cleanupPeriodDays >= 99999 in global settings', () => {
    if (!existsSync(globalSettings)) return false;
    try {
      const cfg = JSON.parse(readFileSync(globalSettings, 'utf8'));
      return (cfg.cleanupPeriodDays ?? 30) >= 99999;
    } catch {
      return false;
    }
  }));

  // Required tools
  checks.push(checkCmd('jq', 'brew install jq'));
  checks.push(checkCmd('git', 'install git'));
  checks.push(checkCmd('claude', 'npm install -g @anthropic-ai/claude-code'));

  // Optional tools
  hr();
  info(c.dim('Optional tools:'));
  checkOptional('qmd', 'npm install -g @tobilu/qmd');
  checkOptional('skilz', 'pip install skilz');
  checkOptional('shellcheck', 'brew install shellcheck (for development)');

  // Summary
  hr();
  const failed = checks.filter((c) => !c.pass).length;
  if (failed === 0) {
    ok(c.green('All required checks passed.'));
    return 0;
  }
  fail(`${failed} check${failed > 1 ? 's' : ''} failed. Fix the items above.`);
  return 1;
}

function check(name, fn) {
  try {
    const pass = Boolean(fn());
    if (pass) ok(name);
    else fail(name);
    return { name, pass };
  } catch (err) {
    fail(`${name} (error: ${err.message})`);
    return { name, pass: false };
  }
}

function checkCmd(cmd, hint) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    ok(`${cmd} installed`);
    return { name: cmd, pass: true };
  } catch {
    fail(`${cmd} missing — ${c.dim(hint)}`);
    return { name: cmd, pass: false };
  }
}

function checkOptional(cmd, hint) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    ok(`${cmd} installed`);
  } catch {
    warn(`${cmd} not installed — ${c.dim(hint)}`);
  }
}
