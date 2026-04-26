# Changes

Пропозиції змін у роботі. Формат — OpenSpec.

## Структура

Один change = одна папка, іменована як `YYYY-MM-DD-<slug>`:

```
changes/
├── 2026-04-20-add-auth/
│   ├── proposal.md     ← що і чому
│   ├── tasks.md        ← чеклист з чекбоксами
│   └── design.md       ← (опційно) дизайн-рішення
└── 2026-04-22-refactor-cache/
    └── ...
```

## Lifecycle

1. **Створення** (`openspec-proposal-creation` skill): пишемо `proposal.md` + `tasks.md`
2. **Approval**: людина ревʼю і schvaлення
3. **Implementation** (`openspec-implementation` skill): йдемо по `tasks.md`, ставимо `[x]`
4. **Archive** (`openspec-archiving` skill): після завершення папка переноситься в `archive/` або видаляється, а `specs/<capability>/spec.md` оновлюється

## Формат proposal.md

```markdown
# <Proposal Title>

## Why
<Проблема / можливість>

## What
<Що пропонуємо зробити — 3-5 bullet points>

## Impact
- Specs affected: <список>
- Breaking changes: <yes/no, які>
- Migration: <потрібна/ні>

## Non-goals
<Що явно НЕ входить у цей change>
```

## Формат tasks.md

```markdown
# Tasks — <Proposal Title>

## Phase 1: <name>
- [ ] Task 1.1
- [ ] Task 1.2

## Phase 2: <name>
- [ ] Task 2.1

## Verification
- [ ] Tests pass
- [ ] Lint clean
- [ ] Manual QA: <scenario>
```

## Приклад tasks.md на середині фічі (як виглядає "save game")

```markdown
# Tasks — CSV export for users

Created: 2026-04-20
Status: in-progress
Current phase: Phase 2

## Phase 1: API contract ✅
- [x] OpenAPI 3.1 spec для /api/users/export
- [x] Error envelope schema
- [x] Auth requirements

## Phase 2: Backend 🔄 (3/5 done)
- [x] GET /api/users/export/list
- [x] GET /api/users/export/:id
- [x] GET /api/users/export/stream
- [ ] POST /api/users/export/batch      ← CURRENT
- [ ] GET /api/users/export/status/:id

## Phase 3: Frontend (not started)
- [ ] useCsvExport hook
- [ ] ExportButton component
- [ ] Progress toast

## Phase 4: E2E (not started)
- [ ] Happy path: click → download
- [ ] Error: quota exceeded
- [ ] Error: network failure

## Verification
- [ ] All tests pass (vitest + playwright)
- [ ] Lint clean
- [ ] Manual QA: export 10k rows, verify byte count

## Last handoff
2026-04-20: 3/5 Phase 2 tasks done. Stream handler має memory issue на >50k rows — фіксити у наступному task. Blocker: немає.
```

**Як Claude продовжить:** `/start` → читає цей tasks.md → знаходить перше `[ ]` → пропонує "продовжити з POST /api/users/export/batch". Жодної інформації з пам'яті не треба — все у файлі.
