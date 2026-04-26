# Orchestration Patterns

Конкретні prompt-patterns для використання з Claude Code Task tool.
Кожен файл — копіюваний блок, що можна викликати через `@.claude/patterns/<name>.md` або вставляти у prompt вручну.

## Що всередині

| File | Pattern | Коли використовувати |
|---|---|---|
| `orchestrator-worker.md` | 1 planner → N workers | Breadth-first independent subtasks |
| `writer-reviewer.md` | Implementer + reviewer loop | Code quality, PRs |
| `wave-parallel.md` | Barrier-sync batches | Multi-module features з DAG залежностей |
| `adversarial-debate.md` | Critic + defender | Architecture decisions |
| `pipeline-chain.md` | Linear handoff через artifacts | Spec-driven workflow |

## Anthropic research insight

Token usage пояснює 80% варіації performance у multi-agent. Orchestration має сенс ТІЛЬКИ там, де є справжня паралелізованість. Інакше це витрати токенів без ROI.

## Як використовувати

```
"Use the wave-parallel pattern from @.claude/patterns/wave-parallel.md
to refactor the auth + payments + notifications modules"
```

Claude прочитає pattern і адаптує до задачі.
