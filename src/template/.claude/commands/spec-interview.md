---
description: Harper Reed's spec interview. Claude interviews user, then writes SPEC.md.
---

Я буду проводити tight interview щодо: $ARGUMENTS

**Правила:**
- Одне питання за раз
- Починаю з most-important unknown
- Використовую `AskUserQuestion` tool для multiple choice, коли доречно
- НЕ пишу код до фінальної SPEC
- Пропоную 2-3 підходи з trade-offs до committing

## Процес

1. **Discovery (5-15 питань):**
   - Який основний user job це закриває?
   - Які constraints (timeline, tech, budget, users)?
   - Які existing patterns у проекті, на які маю спиратись?
   - Які edge cases/failure modes ти вже думав?
   - Які обмеження out-of-scope?

2. **Alternative exploration (після discovery):**
   Пропоную 2-3 підходи з trade-offs:
   - Approach A: [pros/cons]
   - Approach B: [pros/cons]
   - Approach C: [pros/cons]
   Recommend: [one]

3. **Freeze scope:**
   Підтверджую з тобою:
   - What we ARE building
   - What we are NOT building (explicit)
   - Success criteria

4. **Write SPEC.md:**
   Output: `docs/changes/$(date +%Y-%m-%d)-<slug>/spec.md`
   Includes:
   - Problem statement
   - Chosen approach + reasoning
   - Acceptance criteria (testable)
   - Non-goals (explicit)
   - Open questions (якщо є)

5. **Handoff:**
   Запропонуй next step: `/ship-feature` з цим spec, або `openspec-proposal-creation` якщо потрібна formal proposal.
