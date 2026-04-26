---
description: End session. Update hot.md, decisions.md, and specs.
---

Здійсни ритуал завершення сесії.

1. Онови `docs/state/hot.md`:
   - Секція "Де ми зараз" — актуальний стан
   - Секція "Останнє зроблено" — що закрили у цій сесії
   - Секція "Наступні кроки" — 3 пункти пріоритетно
   - Секція "Блокери" — якщо виникли
   - Оновлено: today's date

2. Якщо у цій сесії були важливі рішення (вибір підходу, відмова від чогось, trade-off) — додай запис у `docs/state/decisions.md`.

3. Якщо імплементували частину capability:
   - Якщо є відповідний `docs/specs/<capability>/spec.md` — онови його
   - Якщо спека ще не зафіксована у `specs/` — НЕ створюй її зараз, тільки через openspec-archiving після завершення всього change

4. Якщо працювали над активним change у `docs/changes/` — онови чекбокси у його `tasks.md`.

5. **Git checkpoint** — запиши прогрес у git:
   - `git add docs/state/ docs/changes/ docs/specs/`
   - Якщо є зміни: `git commit -m "chore(state): handoff $(date +%Y-%m-%d) — <stage/feature>"`
   - Це не зачіпає робочий код, лише документи стану

6. У кінці виведи підсумок:
   - Що оновив (які файли)
   - Статус change (якщо був)
   - Git checkpoint: commit SHA
   - Що запам'ятати для наступної сесії

Нічого більше не роби після `/handoff` — сесію треба закривати.
