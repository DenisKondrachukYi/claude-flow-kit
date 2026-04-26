# Pipeline Chain Pattern

Використовуй коли: spec-driven workflow з чіткими stages (brainstorm → design → implement → review).

## Mechanic

Linear handoff через file artifacts. Кожен stage читає output попереднього, пише input для наступного. Нема inter-agent messaging — лише файли.

## Canonical pipeline (obra/superpowers-style)

```
Stage 1: brainstorming skill
  → writes: docs/changes/<date>-<name>/design.md

Stage 2: writing-plans skill
  → reads: design.md
  → writes: docs/changes/<date>-<name>/tasks.md
  → each task: file path + complete code + verification command

Stage 3: subagent-driven-development skill
  → reads: tasks.md (one task at a time)
  → dispatches fresh subagent per task with clean 200k context
  → each subagent receives COMPLETE context for its task

Stage 4: requesting-code-review skill
  → spawns reviewer subagent
  → two-stage: spec compliance + code quality

Stage 5: finishing-a-development-branch skill
  → merge/PR/keep/discard decision
  → cleanup worktree
```

## Чому artifacts > messaging

- Persistent across restart / compaction
- Human-readable checkpoint — ти можеш intervene
- Fresh subagent не несе накопичений noise прідущих stages
- Git-diffable

## Template

```
Execute 5-stage pipeline via file artifacts.

Stage 1: Invoke brainstorming skill. Output: design.md
[wait for approval]

Stage 2: Invoke writing-plans skill reading design.md. Output: tasks.md
[wait for approval]

Stage 3: For each task in tasks.md:
  Task(prompt="Read tasks.md section X. Execute atomically.
               Verify with the shell command specified. Return summary.")

Stage 4: Reviewer subagent reads diff + tasks.md, returns JSON findings.

Stage 5: If review passes: PR + worktree cleanup. Else: loop to Stage 3 with fixes.
```

## Installation note

Потребує obra/superpowers:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

## Anti-patterns

- Skip stages "to save time" → pipeline broken
- Stage N reads Stage N+2 artifact → out-of-order dependencies
- Everything у одному subagent → втрачаєш всі переваги fresh context
