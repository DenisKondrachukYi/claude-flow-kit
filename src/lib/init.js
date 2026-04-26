// init: scaffold template into a project (new or existing)
import { existsSync, mkdirSync, statSync, copyFileSync, readdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { detectStack, applyStackSettings } from './stack.js';
import { c, banner, ok, warn, fail, info, hr } from './print.js';

const PROTECTED_FILES = ['CLAUDE.md', 'AGENTS.md', '.claude'];

export async function runInit({ targetDir, templateDir, flags, version }) {
  const target = resolve(process.cwd(), targetDir);

  // Create dir if not exists
  let isNewDir = false;
  if (!existsSync(target)) {
    if (flags.dryRun) {
      info(`[dry-run] Would create: ${target}`);
    } else {
      mkdirSync(target, { recursive: true });
    }
    isNewDir = true;
  }

  banner(`claude-flow-kit ${version}`);
  info(`Target:  ${target}`);
  info(`Mode:    ${isNewDir ? 'new project' : 'existing project'}`);
  if (flags.dryRun) info(c.yellow('Dry-run: no files will be written.'));
  hr();

  // Pre-flight: detect existing claude-flow-kit
  const existing = detectExisting(target);
  if (existing.found && !flags.force && !flags.dryRun) {
    warn(`Existing claude-flow-kit detected: ${existing.detected.join(', ')}`);
    const ans = await prompt('Continue? Use --force to overwrite. (y/N): ');
    if (!/^y(es)?$/i.test(ans)) {
      info('Aborted.');
      return 0;
    }
  }

  // Stack detection
  hr();
  info('Detecting stack...');
  const detectedStack = flags.stack || detectStack(target);
  ok(`Stack: ${c.cyan(detectedStack)}`);

  // Copy template
  hr();
  info('Copying template files...');
  const stats = { created: 0, skipped: 0, overwritten: 0 };
  copyDir(templateDir, target, { flags, stats, force: flags.force });
  ok(`${stats.created} new, ${stats.overwritten} overwritten, ${stats.skipped} skipped`);

  // Apply stack-specific settings
  if (!flags.dryRun) {
    const applied = applyStackSettings(target, detectedStack);
    if (applied) ok(`Applied ${detectedStack} settings`);
    else info('Using default settings.json');
  }

  // Make scripts executable
  if (!flags.dryRun) {
    const scriptsDir = join(target, '.claude', 'scripts');
    if (existsSync(scriptsDir)) {
      for (const f of readdirSync(scriptsDir)) {
        if (f.endsWith('.sh')) {
          chmodSync(join(scriptsDir, f), 0o755);
        }
      }
    }
  }

  // Final report
  hr();
  ok('Installed successfully.');
  hr();

  if (!flags.noInstallDeps) printNextSteps(detectedStack, isNewDir);

  return 0;
}

function detectExisting(target) {
  const detected = [];
  for (const f of PROTECTED_FILES) {
    if (existsSync(join(target, f))) detected.push(f);
  }
  return { found: detected.length > 0, detected };
}

function copyDir(src, dst, opts) {
  const entries = readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dst, e.name);
    if (e.isDirectory()) {
      if (!existsSync(d)) {
        if (!opts.flags.dryRun) mkdirSync(d, { recursive: true });
      }
      copyDir(s, d, opts);
    } else if (e.isFile()) {
      const exists = existsSync(d);
      if (exists && !opts.force) {
        opts.stats.skipped++;
        continue;
      }
      if (!opts.flags.dryRun) {
        copyFileSync(s, d);
      }
      if (exists) opts.stats.overwritten++;
      else opts.stats.created++;
    }
  }
}

async function prompt(q) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(q);
  rl.close();
  return answer.trim();
}

function printNextSteps(stack, isNewDir) {
  process.stdout.write(`
${c.bold('Critical one-time setup')} (across all your projects):

  Edit ~/.claude/settings.json and add:
    ${c.dim('{')} ${c.cyan('"cleanupPeriodDays"')}: ${c.green('99999')} ${c.dim('}')}

  Without this, Claude deletes sessions after 30 days
  and resumability breaks.

${c.bold('Recommended Claude Code plugins')} (run inside Claude):

  ${c.dim('# obra/superpowers — adds writing-plans skill (critical missing link)')}
  /plugin marketplace add obra/superpowers-marketplace
  /plugin install superpowers@obra

  ${c.dim('# wshobson/agents — orchestration plugins')}
  /plugin marketplace add wshobson/agents
  /plugin install agent-teams plugin-eval

`);

  // Stack-specific
  switch (stack) {
    case 'nextjs':
    case 'node-typescript':
      process.stdout.write(`${c.bold('Next.js / Node extras')}:

  npm i -g claudekit
  claudekit setup --agents typescript-expert,react-expert,nextjs-expert,vitest-testing-expert,playwright-expert

  ${c.dim('# MCP servers:')}
  claude mcp add playwright npx '@playwright/mcp@latest'
  claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest

`);
      break;
    case 'python':
      process.stdout.write(`${c.bold('Python extras')}:

  /plugin install python-development@wshobson
  /plugin install full-stack-orchestration@wshobson

  ${c.dim('# Postgres MCP:')}
  claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "$POSTGRES_URL"

`);
      break;
    case 'go':
      process.stdout.write(`${c.bold('Go extras')}:

  /plugin marketplace add sgaunet/claude-plugins
  /plugin install go-specialist

`);
      break;
  }

  process.stdout.write(`${c.bold('Next steps')}:

  ${c.cyan('1.')} Fill placeholders in CLAUDE.md, docs/project/*, docs/state/hot.md
  ${c.cyan('2.')} ${c.dim('cd')} ${isNewDir ? c.cyan(targetDirOrCwd()) : c.dim('# stay here')}
  ${c.cyan('3.')} ${c.dim('claude')}
  ${c.cyan('4.')} ${c.green('> /start')}

${c.bold('Slash commands available')}:

  /start              Read hot.md, summarize state, propose next step
  /handoff            Update hot.md, decisions.md, git checkpoint
  /sync               Mid-session state snapshot
  /status             Dashboard of active changes + progress
  /spec-interview     Harper Reed technique — Claude interviews you
  /ship-feature       Generic pipeline (brainstorm → plan → execute)
  /ship-full-stack-feature   8-stage fullstack pipeline
  /api-first-feature  Contract-first development
  /fix-prod-bug       Systematic debug — failing test FIRST
  /debug-systematic   Root-cause debugging (6 phases)

${c.bold('Standalone commands')}:

  cfk status          Progress dashboard (no Claude needed)
  cfk status -v       Verbose with phases
  cfk doctor          Diagnose installation
  cfk upgrade         Pull latest template updates

`);
}

function targetDirOrCwd() {
  return process.argv[3] || '.';
}
