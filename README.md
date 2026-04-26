# claude-flow-kit

> Production-ready Claude Code project template. Orchestration patterns, status dashboard, stack-aware setup. Works on new and existing projects.

[![npm version](https://img.shields.io/npm/v/claude-flow-kit.svg)](https://www.npmjs.com/package/claude-flow-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/DenisKondrachukYi/claude-flow-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/DenisKondrachukYi/claude-flow-kit/actions/workflows/ci.yml)

## What it does

Drop-in setup for any Claude Code project that gives you:

- **Resumable sessions** — `hot.md` + git checkpoints + auto-injected context on every session start
- **Visible progress** — built-in `cfk status` dashboard with progress bars and pipeline phases
- **Spec-driven pipelines** — `/ship-feature`, `/ship-full-stack-feature`, `/api-first-feature`, `/fix-prod-bug`, `/spec-interview`
- **Orchestration patterns** — orchestrator-worker, writer-reviewer, wave-parallel, adversarial-debate, pipeline-chain
- **Stack-aware setup** — auto-detects Next.js / Node-TS / Python / Go and applies right hooks (lint, typecheck, test on every Stop)
- **Session continuity** — PreCompact/PostCompact hooks, subagent memory, decisions log

## Quick start

```bash
# Inside an existing project (auto-detects stack)
npx claude-flow-kit init

# New project from scratch
npx claude-flow-kit init my-new-app
cd my-new-app

# Or install globally for the cfk shortcut
npm install -g claude-flow-kit
cfk init
cfk status
cfk doctor
```

## What gets installed

```
your-project/
├── CLAUDE.md                  ← entry point for Claude
├── AGENTS.md                  ← cross-tool entry (Cursor/Codex/OpenCode)
├── .claudeignore
├── .mcp.json                  ← MCP servers (core)
├── .mcp.optional.json         ← MCP servers (optional)
├── docs/
│   ├── project/               ← static context (product, tech, structure)
│   ├── state/                 ← living docs (hot, decisions, glossary)
│   ├── specs/                 ← living specs per capability
│   └── changes/               ← active OpenSpec proposals
└── .claude/
    ├── settings.json          ← stack-specific (auto-applied)
    ├── settings-variants/     ← nextjs / node-typescript / python / go
    ├── commands/              ← 11 slash commands
    ├── agents/                ← explorer (read-only), reviewer
    ├── patterns/              ← 5 orchestration patterns
    ├── shared/                ← wiki-bridge
    └── scripts/               ← session-start, post-compact, status, task-completed
```

## Slash commands

| Command | Purpose |
|---|---|
| `/start` | Read hot.md + git + active tasks, summarize state |
| `/handoff` | Update hot.md / decisions.md / specs/, git checkpoint |
| `/sync` | Mid-session state snapshot |
| `/status` | Dashboard of active changes |
| `/spec-interview` | Harper Reed technique — Claude interviews you |
| `/ship-feature` | Generic pipeline (brainstorm → plan → execute → review) |
| `/ship-full-stack-feature` | 8-stage fullstack pipeline |
| `/api-first-feature` | Contract-first development |
| `/fix-prod-bug` | Systematic debug — failing test FIRST |
| `/debug-systematic` | Root-cause debugging (6 phases) |

## Standalone CLI

```bash
cfk init              # scaffold into current dir (or new dir)
cfk init --stack python
cfk init --force      # overwrite without prompts
cfk init --dry-run    # preview only
cfk status            # progress dashboard
cfk status -v         # verbose with phases
cfk doctor            # diagnose installation
cfk upgrade           # pull latest framework updates, preserve your edits
```

## Critical first-time setup

Edit `~/.claude/settings.json` once:

```json
{
  "cleanupPeriodDays": 99999,
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
}
```

Without `cleanupPeriodDays`, Claude deletes sessions after 30 days and resumability breaks.

## Recommended companion plugins

Inside Claude Code:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@obra

/plugin marketplace add wshobson/agents
/plugin install agent-teams plugin-eval
```

The `superpowers` plugin adds `writing-plans` skill which is the missing link between brainstorming and subagent-driven-development.

## How session continuity works

1. **`/handoff`** writes `docs/state/hot.md`, appends to `decisions.md`, updates `tasks.md` checkboxes, makes git commit `chore(state): handoff <date>`
2. **SessionStart hook** auto-injects `hot.md` + git context + next pending task on every new session
3. **PreCompact/PostCompact hooks** survive context compaction
4. **`/start`** reads everything and proposes next concrete step

After any pause (day, week, month) you can resume to the exact next task with zero memory.

## Orchestration patterns

Reference any pattern in your prompts:

```
> Use @.claude/patterns/wave-parallel.md to refactor auth + payments in parallel
```

| Pattern | When |
|---|---|
| `orchestrator-worker` | Breadth-first independent subtasks |
| `writer-reviewer` | Quality-critical code |
| `wave-parallel` | Multi-module with dep DAG |
| `adversarial-debate` | Architecture decisions with trade-offs |
| `pipeline-chain` | Spec-driven workflow (default in /ship commands) |

## Supported stacks

| Stack | Auto-detected by | Stop hook runs |
|---|---|---|
| `nextjs` | `next.config.{js,mjs,ts}` | `pnpm typecheck && lint && vitest` |
| `node-typescript` | `package.json` with TS dep | `pnpm tsc --noEmit && eslint && vitest` |
| `python` | `pyproject.toml` / `setup.py` / `requirements.txt` | `uv run ruff && mypy && pytest` |
| `go` | `go.mod` | `go vet && golangci-lint && go test -race` |
| `generic` | nothing matched | none (configurable) |

Force a stack with `--stack <name>`.

## Upgrading

```bash
cfk upgrade
```

This refreshes framework files (`.claude/scripts/`, `.claude/patterns/`, slash commands) while **preserving** your `CLAUDE.md`, `hot.md`, `decisions.md`, settings.json. Run `git diff` after.

## Documentation

- [Quick start](./docs/quick-start.md)
- [Architecture](./docs/architecture.md)
- [Customization guide](./docs/customization.md)
- [How session continuity works](./docs/continuity.md)
- [Adding a new stack](./docs/adding-stacks.md)
- [Contributing](./CONTRIBUTING.md)

## Inspiration / related work

- [obra/superpowers](https://github.com/obra/superpowers) — skill pipeline (`brainstorming` → `writing-plans` → `subagent-driven-development`)
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) — spec-driven workflow with change proposals
- [carlrannaberg/claudekit](https://github.com/carlrannaberg/claudekit) — 20+ specialized subagents
- [wshobson/agents](https://github.com/wshobson/agents) — orchestration plugins
- [Pimzino/spec-workflow-mcp](https://github.com/Pimzino/spec-workflow-mcp) — web dashboard for specs

claude-flow-kit composes patterns from these projects into a single drop-in installer.

## License

MIT — see [LICENSE](./LICENSE).

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md). New stack support is the easiest first contribution.
