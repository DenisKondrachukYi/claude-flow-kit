---
description: Systematic debug using obra/superpowers methodology. Root cause, not symptoms.
---

Debug issue: $ARGUMENTS

**ПРАВИЛО:** не fix першого підозрюваного. Йди phase-by-phase.

## Phase 1: Reproduce
Invoke `systematic-debugging` skill. Extract reproducible scenario.
- Exact steps
- Environment conditions
- Expected vs actual
Write result у `.cache/debug-phase1.md`

## Phase 2: Hypothesis
Generate 3-5 hypotheses. Для кожної:
- Мінімальне test яке confirms or refutes
- Файли/функції до перевірки

## Phase 3: Narrow down
Run tests для hypothesis у priority order. STOP коли знайшов root cause — не продовжуй "just in case".

Invoke `root-cause-tracing` skill якщо root cause нетривіальний.

## Phase 4: Fix
Invoke `defense-in-depth` skill. Fix у decreasing order:
1. Root cause fix
2. Guard against regression (test)
3. Better error message якщо знову
4. Logging для future

## Phase 5: Verify
Invoke `verification-before-completion` skill. 
- Rerun repro — confirmed fixed
- Run relevant test suite
- Sanity: check no NEW breakage

## Phase 6: Log
Update `docs/state/decisions.md`:
- What was the bug
- Root cause (not surface symptom)
- Fix + why it works
- Prevention for future
