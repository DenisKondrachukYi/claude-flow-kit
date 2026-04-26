---
description: Full feature delivery pipeline — brainstorm to PR. Uses obra/superpowers pipeline.
---

Execute обраний pipeline для фічі: $ARGUMENTS

Це повний цикл від ідеї до merged PR. НЕ скорочуй stages.

## Stage 1: Brainstorm
Invoke `brainstorming` skill. Refine $ARGUMENTS у concrete design. Output: `docs/changes/$(date +%Y-%m-%d)-<slug>/design.md`

Пауза: покажи design, чекай підтвердження перед Stage 2.

## Stage 2: Plan
Invoke `writing-plans` skill (з obra/superpowers). Read design.md, write atomic tasks у `docs/changes/<...>/tasks.md`. Кожен task — 2-5 хв, з точним file path + complete code + verification command.

Пауза: покажи plan, чекай підтвердження.

## Stage 3: Worktree
Invoke `using-git-worktrees` skill. Auto-create isolated worktree на new branch.

## Stage 4: Execute
Invoke `subagent-driven-development` skill. Dispatches fresh subagent на кожен task. Each subagent bears повний context для свого task — main context залишається thin.

Use wave parallelism (@.claude/patterns/wave-parallel.md) якщо tasks мають dep DAG.

## Stage 5: Review
Invoke `requesting-code-review` + `receiving-code-review` skills. Two-stage review (spec compliance + code quality) у окремому subagent.

If must_fix non-empty → loop to Stage 4 з feedback, max 3 rounds.

## Stage 6: Finish
Invoke `finishing-a-development-branch` skill. Merge/PR decision + worktree cleanup.

## Stage 7: Archive spec
Invoke `openspec-archiving` skill. Update `docs/specs/` з living doc, move proposal to archive.

## Stage 8: Update state
Update `docs/state/hot.md` і `docs/state/decisions.md` з результатами.
