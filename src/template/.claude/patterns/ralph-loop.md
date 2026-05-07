# Ralph Loop Pattern

> *"Ralph Wiggum is fearless. Ralph never gets tired. Ralph knows one task and does it forever."*
> — Ghuntley, 2025

Use this pattern when: you have a single well-defined goal that requires many small iterations to complete, and the cost of restarting the agent (fresh context) is lower than the cost of compaction.

## Mechanic

```
while :; do
  cat .ralph/PROMPT.md | claude-code
  # Claude reads PROMPT.md → does ONE task → updates fix_plan.md → exits.
  # Loop restarts with clean 200k context.
done
```

The pattern's power comes from three rules:
1. **One task per loop.** Never let the agent try multiple tasks in one iteration.
2. **Durable state in `fix_plan.md`.** Plain markdown the next iteration reads first.
3. **No "good enough."** The PROMPT.md says: "Continue until fix_plan.md says DONE."

## When to use

- Long-running migrations (React 18→19, Drizzle→Prisma, monorepo splits)
- Multi-file refactors with clear acceptance criteria
- Bulk test scaffolding
- Batch refactors guided by a static analyzer

## When NOT to use

- Small features (use `/ship-feature` instead)
- Tasks requiring user input mid-flight (Ralph runs autonomously)
- Anything where the acceptance criteria are vague ("make it cleaner")
- Tasks with security implications without a sandbox

## File layout

```
.ralph/
├── PROMPT.md         ← the only thing Claude sees (~50 lines)
├── fix_plan.md       ← durable state across iterations
├── checkpoints/      ← optional: snapshots between iterations
└── log.txt           ← append-only loop log
```

## PROMPT.md template

```markdown
# Ralph Loop — <goal>

## Your task this iteration

Read fix_plan.md. Find the FIRST item marked `[ ]` (incomplete).
Implement it. ONLY that one item. Do not try multiple tasks.

When done:
1. Mark the item `[x]` in fix_plan.md
2. Update the "Last iteration" section with what you did
3. Append to log.txt: `<iso-time> — <one-line summary>`
4. Exit (do not continue to next item)

## Rules

- DO NOT skip ahead.
- DO NOT mark items `[x]` you did not actually implement.
- DO NOT remove placeholder code without writing the real implementation.
- If you cannot implement an item, mark it `[blocked]` with a one-line reason.
- If fix_plan.md says DONE at the top, do nothing and exit cleanly.

## Verification

After implementing your one item, run:
- `<test-command>` — must pass
- `<lint-command>` — must pass

If they fail, do not exit yet; fix the failure (still part of this iteration).

## Stop conditions

- fix_plan.md top line is `STATUS: DONE` → exit immediately
- All items in fix_plan.md are `[x]` or `[blocked]` → mark `STATUS: DONE` and exit
- 50 consecutive iterations without progress → exit with error
```

## fix_plan.md initial state

```markdown
STATUS: IN_PROGRESS
GOAL: <one-line goal>

## Tasks

- [ ] <atomic task 1>
- [ ] <atomic task 2>
- [ ] <atomic task 3>
...

## Last iteration

(none yet)
```

## Anti-patterns

- **Multiple goals in one PROMPT.md.** Pick one. Run a separate Ralph for the next goal.
- **Vague acceptance criteria.** "Refactor for cleanliness" is not a Ralph task. "Replace all `var` with `const`" is.
- **Sharing context between iterations.** Each iteration is a fresh agent. The only memory is the markdown files.
- **Running Ralph in production without a checkpoint script.** The loop should `git stash` or `git commit` between iterations so a bad iteration is reversible.

## Empirical results

Reports from production Ralph runs:
- React class→hooks migration: 14h, 89 components, 0 production regressions (Ghuntley)
- Drizzle migration: 6h, 23 model files, 2 manual interventions (community)
- ESLint v9 flat-config: 2h, 12 packages in monorepo (Ghuntley)

## Sources

- [Ralph Wiggum as software engineer](https://ghuntley.com/ralph/) — Geoffrey Huntley, 2025
- [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Anthropic engineering, 2025

## Related patterns

- `pipeline-chain.md` — when stages are heterogeneous (brainstorm → design → implement)
- `wave-parallel.md` — when iterations can run in parallel batches
- `writer-reviewer.md` — when each iteration needs a fresh-context review
