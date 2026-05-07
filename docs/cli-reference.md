# CLI Reference

> Auto-generated from `cfk --help` at build time.
> Version: `0.1.0`

```
claude-flow-kit 0.1.0
Production-ready Claude Code project template with orchestration.

Usage:
  npx claude-flow-kit <command> [options]
  cfk <command> [options]              # if installed globally

Commands:
  init [path]       Scaffold template into a project (new or existing).
                    Auto-detects stack (Next.js, Node/TS, Python, Go).
                    Default path: current directory.
  add <component>   Add a single component (e.g. status-dashboard).
                    Run `cfk list` to see available components.
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

Examples:
  npx claude-flow-kit init                      # current dir
  npx claude-flow-kit init my-new-project       # new dir
  npx claude-flow-kit init --stack python       # force stack
  cfk status                                    # progress dashboard
  cfk doctor                                    # diagnose

Documentation: https://github.com/DenisKondrachukYi/claude-flow-kit
```

## Examples

### init

```bash
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
```

### add / list

```bash
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
```

### status / doctor / upgrade

```bash
# Dashboard with progress bars
cfk status
cfk status -v   # verbose, with phases

# Diagnose installation
cfk doctor

# Refresh framework files (preserves user content)
cfk upgrade
cfk upgrade --dry-run
```

## Environment Variables

| Variable | Effect |
|---|---|
| `CI=true` | Auto-enables `--yes` (non-interactive) |
| `XDG_CONFIG_HOME` | Override user config location (default: `~/.config`) |
| `UPDATE_SNAPSHOTS=1` | When running tests, regenerate snapshots |
| `CFK_RALPH_MAX_ITERS` | Max iterations for `ralph.sh` (default: 50) |
| `CFK_RALPH_SLEEP` | Seconds between ralph iterations (default: 2) |
| `DOCS_BASE` | VitePress base path (default: `/claude-flow-kit/`) |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Generic error (invalid flag, unknown command, refusal) |
| 2 | Quality gate failure (tests/lint failed in TaskCompleted hook) |
