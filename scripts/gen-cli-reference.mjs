#!/usr/bin/env node
// Generate docs/cli-reference.md from cfk --help output.
// Runs in CI before docs build.

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'bin', 'cli.js');
const OUT = resolve(__dirname, '..', 'docs', 'cli-reference.md');

const help = execFileSync('node', [CLI, '--help'], { encoding: 'utf8' });
const version = execFileSync('node', [CLI, '--version'], { encoding: 'utf8' }).trim();

const md = `# CLI Reference

> Auto-generated from \`cfk --help\` at build time.
> Version: \`${version}\`

\`\`\`
${help.trim()}
\`\`\`

## Examples

### init

\`\`\`bash
# In an existing project (auto-detect stack)
npx claude-flow-kit init

# New project
npx claude-flow-kit init my-new-app

# Force a specific stack
cfk init --stack python

# Non-interactive (e.g. CI)
cfk init --yes

# Preview without writing
cfk init --dry-run

# Wipe user preferences first
cfk init --reset-preferences
\`\`\`

### add / list

\`\`\`bash
# See available components
cfk list

# Filter to installed only
cfk list --installed

# Add a single component
cfk add patterns
cfk add ralph-loop
cfk add status-dashboard

# Overwrite existing files
cfk add hooks --force
\`\`\`

### status / doctor / upgrade

\`\`\`bash
# Dashboard with progress bars
cfk status
cfk status -v   # verbose, with phases

# Diagnose installation
cfk doctor

# Refresh framework files (preserves user content)
cfk upgrade
cfk upgrade --dry-run
\`\`\`

## Environment Variables

| Variable | Effect |
|---|---|
| \`CI=true\` | Auto-enables \`--yes\` (non-interactive) |
| \`XDG_CONFIG_HOME\` | Override user config location (default: \`~/.config\`) |
| \`UPDATE_SNAPSHOTS=1\` | When running tests, regenerate snapshots |
| \`CFK_RALPH_MAX_ITERS\` | Max iterations for \`ralph.sh\` (default: 50) |
| \`CFK_RALPH_SLEEP\` | Seconds between ralph iterations (default: 2) |
| \`DOCS_BASE\` | VitePress base path (default: \`/claude-flow-kit/\`) |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Generic error (invalid flag, unknown command, refusal) |
| 2 | Quality gate failure (tests/lint failed in TaskCompleted hook) |
`;

writeFileSync(OUT, md);
console.log(`✓ wrote ${OUT}`);
