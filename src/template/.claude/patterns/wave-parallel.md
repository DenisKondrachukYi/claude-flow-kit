# Wave-Parallel Pattern (GSD-style)

Використовуй коли: feature торкає кількох модулів з DAG залежностей.

## Mechanic

1. Побудуй DAG: які модулі від чого залежать.
2. Групуй вузли у waves: вузли без unresolved deps → одна wave.
3. Wave N виконується FULLY PARALLEL (всі subagents одночасно).
4. Wave N+1 чекає barrier — всі з Wave N завершені.
5. Main context стає thin — реальна робота в fresh subagent contexts.

## Приклад для web app

```
WAVE 1 (independent, parallel):
  - Task A: UserModel (src/models/user.ts, tests/user.test.ts)
  - Task B: ProductModel (src/models/product.ts, tests/product.test.ts)
  - Task C: NetworkLayer (src/lib/api-client.ts) — no deps on models

[barrier]

WAVE 2 (depends on Wave 1):
  - Task D: OrdersAPI (src/services/orders.ts) — uses User, Product, Network
  - Task E: CartAPI (src/services/cart.ts) — uses Product, Network

[barrier]

WAVE 3:
  - Task F: CheckoutUI (src/features/checkout/*) — uses OrdersAPI, CartAPI
```

## Template

```
I will execute this feature via wave parallelism.

DAG analysis:
[list modules and dependencies]

Wave plan:
Wave 1 (parallel): [subtasks A, B, C]
Wave 2 (parallel): [subtasks D, E]
Wave 3: [subtask F]

Dispatching Wave 1 via N Task calls in one turn.
After barrier (all return), dispatching Wave 2.
...

Each subagent receives:
- Its specific task description + files
- Reference to @docs/project/structure.md
- NOT other tasks' context (keep fresh)

Main session stays at <40% context throughout.
```

## Anti-patterns

- Waves of 1 (not real parallelism) → just use orchestrator-worker
- Subagent у Wave N читає output Wave N+1 → circular
- Shared file targets між subagents у одній wave → race conditions
