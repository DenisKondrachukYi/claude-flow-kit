---
description: Start a Ralph loop — autonomous one-task-per-iteration loop with durable state.
---

You are about to start (or continue) a Ralph loop for: $ARGUMENTS

## Your job in THIS message

1. Read `@.claude/patterns/ralph-loop.md` if you do not already know the pattern.
2. Check whether `.ralph/PROMPT.md` and `.ralph/fix_plan.md` exist.

### If neither exists (new Ralph)

Create both files:
- `.ralph/PROMPT.md` — copy the template from the pattern doc, fill in <goal>,
  <test-command>, <lint-command> for this project.
- `.ralph/fix_plan.md` — list 5-20 atomic tasks toward the goal. Each task
  must be implementable in a single agent iteration.

Then STOP. Show me the proposed task list and wait for approval.
Do not run the loop in this message.

### If both exist (resume Ralph)

Show the current state:
- STATUS line of fix_plan.md
- Count of `[x]`, `[ ]`, `[blocked]` tasks
- The next 3 unfinished tasks
- The most recent log.txt entries

Then ask: "Proceed with one iteration? Or skip ahead / abort?"

## To run iterations from your shell

Once approved, run from a separate terminal:

```bash
bash .claude/scripts/ralph.sh
```

This loops `cat .ralph/PROMPT.md | claude` until `STATUS: DONE`.

Each iteration is a FRESH Claude session with no memory beyond `.ralph/*`.
That is the entire point of the pattern.
