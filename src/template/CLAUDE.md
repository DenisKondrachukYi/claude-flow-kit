# <Project Name>

<Одне речення: що це, для кого, стадія.>

## Як починати сесію

1. Прочитай @docs/state/hot.md — там поточний стан і next steps
2. Велика задача / нова фіча → `/ship-feature` pipeline
3. Bug → `/debug-systematic`
4. Не впевнений scope → `/spec-interview`

## Як закінчувати сесію

Перед `/handoff` онови @docs/state/hot.md:
- Де ми завершили
- Next steps (3 max)
- Blockers / open questions

## Стек

- Мова: <TypeScript 5.4 / Python 3.12 / Go 1.22>
- Фреймворк: <Next.js 15 / FastAPI / Hono>
- Ключові deps: <3-5>
- Target: <Node 20+ / Python 3.12+ / Go 1.22+>

## Команди shell

- `<build>` — збірка
- `<test>` — тести (prefer single test)
- `<lint>` — лінт
- `<run>` — запуск локально

## Pipeline skills (obra/superpowers)

Для нетривіальних змін використовуй full pipeline:

```
brainstorming → writing-plans → subagent-driven-development → review → finish
```

Викликається через `/ship-feature`. НЕ скорочуй stages.

## Orchestration patterns

Складна задача → подивись @.claude/patterns/
- orchestrator-worker — breadth-first independent subtasks
- writer-reviewer — quality-critical output
- wave-parallel — multi-module з dep DAG
- adversarial-debate — architecture decisions
- pipeline-chain — spec-driven workflow (стандарт)

## Правила проекту

- YOU MUST: читати @docs/state/hot.md на початку сесії
- YOU MUST: оновлювати hot.md перед /handoff
- YOU MUST: пропонувати план перед нетривіальними змінами (через /spec-interview або /ship-feature)
- YOU MUST: записувати важливі рішення у @docs/state/decisions.md
- YOU MUST: `qmd query` before `Grep` для knowledge lookup у vault (@.claude/shared/wiki-bridge.md)
- DO NOT: редагувати generated files у <папки>
- DO NOT: додавати залежності без обговорення
- DO NOT: читати Obsidian vault напряму — use QMD через wiki-bridge

## Subagent memory

Workhorse subagents (code-reviewer, etc.) мають `memory: user` — накопичують patterns across projects. Path: `~/.claude/agent-memory/<agent>/MEMORY.md`.

## Конвенції коду

<Тільки те, що відрізняється від стандартних практик мови/фреймворку.>

## Додатковий контекст

@docs/project/product.md
@docs/project/tech.md
@docs/project/structure.md
@.claude/shared/wiki-bridge.md
