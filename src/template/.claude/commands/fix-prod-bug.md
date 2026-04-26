---
description: Reproduce → failing test FIRST → root cause → minimal fix → regression guard
---

Bug: $ARGUMENTS

## Pipeline

### Stage 1 — Gather evidence
Task, "debugger" (ClaudeKit або wshobson).
Read:
- Sentry/observability logs через MCP або `gh` CLI
- Recent deployments (Vercel MCP: get_deployment_build_logs, get_runtime_logs)
- Git log since last known-good commit

Output: `.debug/evidence-$(date +%Y%m%d-%H%M).md` з reproducible steps.

### Stage 2 — Write FAILING test FIRST
Task, "vitest-testing-expert" (UI bugs: "playwright-expert").

**Це критично.** Тест має fail з reported symptom. Commit на feature branch. Це regression guard — без нього fix можна знову зламати.

### Stage 3 — Root cause analysis
- **Hard bugs:** Task, "oracle" (ClaudeKit, uses GPT-5 для deep analysis)
- **Standard bugs:** matching language expert (typescript-expert, python-pro, etc.)

Output: root cause document + proposed **minimal** fix.

### Stage 4 — Apply fix
Task, "executor" або language expert.

**Constraint:** smallest possible diff. NO refactoring. NO unrelated changes.

### Stage 5 — Verify
1. Run failing test від Stage 2 — МАЄ pass
2. Run full test suite — МАЄ not regress
3. Run `/team-review --reviewers security,performance` на diff

### Stage 6 — Ship
- Conventional commit: `fix: <scope>: <summary>`
- Link Sentry issue у commit body
- Push

### Stage 7 — Update state
Update `docs/state/decisions.md`:
- Was the bug (1 line)
- Root cause (NOT surface symptom)
- Fix + why it works
- Prevention for future (tests added, hooks added, code review rule)

## Escalation

Якщо root cause requires >20 files touched, STOP. Це не bug — це feature. Escalate до `/ship-full-stack-feature`.
