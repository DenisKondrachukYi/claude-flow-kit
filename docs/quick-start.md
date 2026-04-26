# Quick Start

Get from zero to first `/ship-feature` in under 10 minutes.

## 1. One-time global setup (60 seconds)

Edit `~/.claude/settings.json`:

```json
{
  "cleanupPeriodDays": 99999,
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
}
```

Without `cleanupPeriodDays` Claude deletes your sessions after 30 days and resumability breaks.

## 2. Install the kit

```bash
# Per-project (recommended)
npx claude-flow-kit init

# Or globally for the cfk shortcut
npm install -g claude-flow-kit
cfk init
```

In an existing project: run from the project root, it detects your stack automatically.
For a new project: `npx claude-flow-kit init my-new-app && cd my-new-app`.

## 3. Add the missing-link plugin

Inside Claude Code:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@obra
```

This adds the `writing-plans` skill which is the bridge between brainstorming and execution. Without it `/ship-feature` works at ~60% effectiveness.

## 4. Fill the four template files

```
CLAUDE.md                 ← project name, stack, build/test commands
docs/project/product.md   ← what is it, for whom
docs/project/tech.md      ← stack, versions, deps
docs/state/hot.md         ← starting state: where we are, what's next
```

Five minutes each. Replace `<placeholders>`.

## 5. First session

```
claude
> /start
```

Claude reads `hot.md` + git context + active task and proposes the next step.

## 6. Try a tiny feature

```
> /ship-feature "add a CLI flag --verbose to my-tool"
```

Watch the pipeline:

1. Brainstorm — Claude asks clarifying questions
2. Plan — `writing-plans` skill produces atomic tasks
3. Execute — fresh subagent per task with clean 200k context
4. Review — separate reviewer subagent reads only the diff
5. Finish — merge / PR / cleanup

## 7. End the session

```
> /handoff
```

Claude updates `hot.md`, appends to `decisions.md`, ticks checkboxes in `tasks.md`, makes git checkpoint.

Tomorrow `/start` resumes exactly here.

## What next?

- [Architecture overview](./architecture.md) — how it all fits together
- [Continuity guide](./continuity.md) — resume from any point
- [Customization](./customization.md) — adapt to your workflow
- [Adding a new stack](./adding-stacks.md) — contribute back
