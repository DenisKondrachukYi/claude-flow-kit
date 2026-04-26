# Session continuity

How to resume work from any point — day, week, month later.

## Four save slots

| Slot | What it stores | When updated |
|---|---|---|
| `docs/state/hot.md` | Where we are NOW + next 3 steps | Every `/handoff` and `/sync` |
| `docs/state/decisions.md` | Why-log: choices, alternatives, trade-offs | When decisions are made |
| `docs/changes/<slug>/tasks.md` | Atomic task checklist | Per-task on completion |
| `docs/specs/<cap>/spec.md` | Real behavior of capability | After capability ships |

## SessionStart hook

`.claude/scripts/session-start.sh` runs at every new Claude session and injects:

- Git state (branch, dirty count, last handoff commit)
- Active change name + progress (X/Y tasks done)
- Next pending task (first `- [ ]` in tasks.md)
- First 60 lines of `hot.md`

Claude sees this as `additionalContext` before responding to your first message.

## /handoff workflow

When you run `/handoff`:

1. Update `hot.md` sections "Where we are" / "Last done" / "Next steps" / "Blockers"
2. Append to `decisions.md` if decisions were made
3. Update `specs/<cap>/spec.md` if a capability stabilized
4. Tick checkboxes in active `tasks.md`
5. `git add docs/state/ docs/changes/ docs/specs/`
6. `git commit -m "chore(state): handoff <date> — <feature/stage>"`

The git commit is your durable checkpoint. Code commits are separate, made during pipeline execution.

## Compaction safety

Claude periodically auto-compacts the context window. By default this loses everything — your hot.md context disappears.

Two hooks fix this:

- **PreCompact** copies `hot.md` to `hot.md.precompact` as backup
- **PostCompact** re-injects `hot.md` as `additionalContext`

Result: compaction is invisible. The agent picks up where it left off.

## Real example

You stop work mid-feature on Monday. Open laptop next Monday:

```bash
$ cd ~/Developer/my-app
$ claude
> /start
```

Claude responds:

```
Reading docs/state/hot.md... docs/changes/2026-04-20-csv-export/tasks.md...

Where we are: CSV export feature, Stage 4 backend implementation
Last done: 3/5 handlers (list, detail, stream)
Next: POST /api/users/export/batch handler
Blockers: stream handler had memory issue >50k rows — relevant for /batch
Active pipeline: stage 4/8 of /ship-full-stack-feature

Proposal: spawn typescript-pro subagent to implement POST /batch
with chunked processing, fixing the stream memory issue.
Approve?
```

Nothing in Claude's memory. Everything from files.

## When state files diverge

If you edit code outside Claude (manual fix, external tool), state files can lag.

Run:

```bash
> /sync
```

This reconciles `tasks.md` checkboxes and updates "Last done" in `hot.md` without ending the session.

## Multiple machines

Sync `docs/` via git, sync `~/.claude/projects/<id>/*.jsonl` (raw session log) via Syncthing or iCloud Drive. The `hot.md` and `decisions.md` survive any sync conflict because they're regular markdown files.

## What can break continuity

- Skipping `/handoff` — state gets stale, but code work is preserved
- Force-pushing `docs/state/` over teammate's commits — use `git rebase` carefully
- Editing `tasks.md` checkboxes by hand — fine, just be consistent
- `git revert` of a handoff commit — undoes state, not code; usually safe

## Best practice

- `/handoff` before closing the laptop, even on small breaks longer than 30 minutes
- `/sync` after any significant non-Claude work (manual fixes, design changes, conversations)
- Make decisions explicit: "I'll record this in decisions.md before continuing"
