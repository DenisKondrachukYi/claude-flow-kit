#!/usr/bin/env node
// claude-flow-kit CLI — entry point for npx and global install
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

import { runInit } from '../src/lib/init.js';
import { runStatus } from '../src/lib/status.js';
import { runDoctor } from '../src/lib/doctor.js';
import { runUpgrade } from '../src/lib/upgrade.js';
import { runAdd, runList } from '../src/lib/add.js';
import { checkForUpdates } from '../src/lib/update-notifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const HELP = `
claude-flow-kit ${pkg.version}
Production-ready Claude Code project template with orchestration.

Usage:
  npx claude-flow-kit <command> [options]
  cfk <command> [options]              # if installed globally

Commands:
  init [path]       Scaffold template into a project (new or existing).
                    Auto-detects stack (Next.js, Node/TS, Python, Go).
                    Default path: current directory.
  add <component>   Add a single component (e.g. status-dashboard).
                    Run \`cfk list\` to see available components.
  list              List components and their installed status.
                      ● installed   ◐ partial   ○ not added
  status [-v]       Show progress dashboard for current project.
                    -v / --verbose: show phases inside each change.
  doctor            Diagnose installation: hooks, permissions, deps.
  upgrade           Pull latest template updates while preserving your edits.
  --help, -h        Show this help.
  --version         Print version.

Flags for init:
  --stack <name>    Force stack (nextjs|node-typescript|python|go|generic).
                    Default: auto-detect.
  --force           Overwrite existing CLAUDE.md/.claude/ without prompt.
  --skip-install    Skip dependency hints at the end.
                    Aliases: --no-install-deps
  --dry-run         Print what would be done, don't write files.
  --yes, -y         Non-interactive mode (auto-detected when CI=true).
  --reset-preferences  Wipe ~/.config/claude-flow-kit/config.json before init.
  --disable-git     Reserved (no-op currently).

Universal flags:
  --no-update-check Skip the daily npm registry update check.
                    Also: NO_UPDATE_NOTIFIER=1 env var. Auto-skipped in CI.

Examples:
  npx claude-flow-kit init                      # current dir
  npx claude-flow-kit init my-new-project       # new dir
  npx claude-flow-kit init --stack python       # force stack
  cfk status                                    # progress dashboard
  cfk doctor                                    # diagnose

Documentation: ${pkg.homepage}
`;

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    process.stdout.write(HELP);
    return 0;
  }

  if (cmd === '--version' || cmd === '-V') {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }

    const flags = {
    stack: null,
    force: false,
    noInstallDeps: false,
    dryRun: false,
    verbose: false,
    yes: false,
    resetPreferences: false,
    skipInstall: false,
    disableGit: false,
    installed: false,
  };
  const positionals = [];

  // Auto-detect CI: enables --yes by default.
  if (process.env.CI === 'true' || process.env.CI === '1') {
    flags.yes = true;
  }

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--stack') flags.stack = args[++i];
    else if (a === '--force') flags.force = true;
    else if (a === '--no-install-deps' || a === '--skip-install') {
      flags.noInstallDeps = true;
      flags.skipInstall = true;
    }
    else if (a === '--dry-run') flags.dryRun = true;
    else if (a === '-v' || a === '--verbose') flags.verbose = true;
    else if (a === '-y' || a === '--yes') flags.yes = true;
    else if (a === '--reset-preferences') flags.resetPreferences = true;
    else if (a === '--disable-git') flags.disableGit = true;
    else if (a === '--installed') flags.installed = true;
    else if (a === '--no-update-check') flags.noUpdateCheck = true;
    else if (a.startsWith('-')) {
      console.error(`Unknown flag: ${a}`);
      return 1;
    } else {
      positionals.push(a);
    }
  }

  const templateDir = resolve(__dirname, '..', 'src', 'template');
  if (!existsSync(templateDir)) {
    console.error(`Template directory missing: ${templateDir}`);
    return 1;
  }

  // Fire-and-forget update check; never blocks the CLI.
  checkForUpdates(pkg.version, { disable: flags.noUpdateCheck }).catch(() => {});

  switch (cmd) {
    case 'init':
      return runInit({
        targetDir: positionals[0] || '.',
        templateDir,
        flags,
        version: pkg.version,
      });
    case 'add':
      return runAdd({ component: positionals[0], templateDir, flags });
    case 'list':
    case 'ls':
      return runList({ flags });
    case 'status':
      return runStatus({ flags });
    case 'doctor':
      return runDoctor({ templateDir });
    case 'upgrade':
      return runUpgrade({ templateDir, flags });
    default:
      console.error(`Unknown command: ${cmd}`);
      console.error(`Run 'cfk --help' for usage.`);
      return 1;
  }
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((err) => {
    console.error('Error:', err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  });
