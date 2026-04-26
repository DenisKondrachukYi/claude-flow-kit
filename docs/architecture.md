# Architecture

## Three layers

```
┌─────────────────────────────────────────────────────┐
│  Layer 3: Pipelines                                 │
│  /ship-feature, /ship-full-stack-feature,           │
│  /api-first-feature, /fix-prod-bug                  │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│  Layer 2: Orchestration patterns                    │
│  orchestrator-worker, writer-reviewer,              │
│  wave-parallel, adversarial-debate, pipeline-chain  │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│  Layer 1: Primitives                                │
│  Task tool subagents, hooks, skills, MCP servers    │
└─────────────────────────────────────────────────────┘
```

## State storage

Four "save slots" with different update cadence:

| File | Updates | Owner |
|---|---|---|
| `docs/state/hot.md` | Every `/handoff` and `/sync` | Claude (auto) |
| `docs/state/decisions.md` | When non-trivial decisions are made | Claude (auto) |
| `docs/changes/<slug>/tasks.md` | Per-task completion | Claude (auto) |
| `docs/specs/<cap>/spec.md` | After capability ships | Claude (auto via openspec-archiving) |

Plus user-owned static context in `docs/project/` (product, tech, structure) — rarely updated.

## Hook lifecycle

```
SessionStart
  → reads hot.md + git + active task
  → injects as additionalContext

[user works]

PreCompact (Claude triggers)
  → backs up hot.md to hot.md.precompact

PostCompact
  → re-injects hot.md so context survives compaction

[subagent finishes]

TaskCompleted (configurable per stack)
  → runs lint + typecheck + tests
  → exit 2 = block completion, send stderr to subagent
  → exit 0 = task marked done
```

## Subagent isolation

Pipeline commands delegate to fresh subagents via Task tool. Each gets:

- Clean 200k context (no orchestrator noise)
- Specific task description + relevant files
- NOT other subagents' output (prevents game-of-telephone)

Communication happens via **file artifacts** in `docs/changes/<slug>/` — not in-memory messaging. This is intentional: artifacts are durable across compaction, restarts, and multi-week pauses.

## Stack detection

`src/lib/stack.js` probes for marker files in priority order:

1. `next.config.{js,mjs,ts}` → `nextjs`
2. `package.json` with TypeScript dep → `node-typescript`
3. `pyproject.toml` / `setup.py` / `requirements.txt` → `python`
4. `go.mod` → `go`
5. else → `generic`

Each stack has a matching `.claude/settings-variants/<stack>.json` with stack-specific `Stop` hook (lint + typecheck + test).

## Why no runtime dependencies

The npm package ships zero runtime dependencies. `bin/cli.js` uses Node.js stdlib only. Reasons:

- Faster `npx` cold start
- No supply-chain risk
- Easier audit
- Works on offline / air-gapped machines
