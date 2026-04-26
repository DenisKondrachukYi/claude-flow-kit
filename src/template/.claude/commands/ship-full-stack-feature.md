---
description: End-to-end fullstack feature delivery — brainstorm → API contract → backend → frontend → E2E tests → deploy
---

Фіча: $ARGUMENTS

Ти оркеструєш fullstack feature через спеціалізовані subagents. НЕ пиши код сам — делегуй.

## Pipeline (sequential, validate each stage)

### Stage 1 — Brainstorm + scope
Task tool, subagent_type "general-purpose" з instruction "use brainstorming skill".
Output: `docs/changes/$(date +%Y-%m-%d)-<slug>/prd.md` — user stories, acceptance criteria, non-goals.

**Gate:** human approval перед Stage 2.

### Stage 2 — API contract (parallel з Stage 3)
Task, "api-designer" (wshobson/VoltAgent) АБО general-purpose з api-design instruction.
Output: OpenAPI 3.1 spec у `docs/changes/<...>/openapi.yaml` АБО tRPC router type file.

### Stage 3 — Data model
Task, "postgres-expert" (ClaudeKit) АБО "database-architect" (wshobson).
Output: Drizzle/Prisma migration file. Query через Postgres MCP (dbhub) щоб confirm schema fit.

### Stage 4 — Backend implementation
Task, matching stack: "fastapi-pro" / "typescript-pro" / "golang-pro".
Preload skills: api-conventions, error-handling-patterns, async patterns.
Requirement: ВСІ handlers покриті тестами перед наступним stage.

### Stage 5 — Frontend implementation
Task, "nextjs-expert" або "react-specialist".
- Use shadcn MCP для scaffold components
- Use `frontend-design` skill щоб уникнути generic AI aesthetic
- Wire API client зі згенерованих типів (npx openapi-typescript openapi.yaml -o src/api/types.ts)

### Stage 6 — E2E tests
Task, "playwright-expert".
Use Playwright MCP для write + run tests проти localhost.
Require: 1 happy path + 2 error paths per feature.

### Stage 7 — Review
Run `/team-review` з wshobson agent-teams plugin:
```
/team-review src/ --reviewers security,performance,architecture
```
Require 0 P0 findings перед deploy.

### Stage 8 — Deploy
Task, "deployment-engineer".
- Conventional commit format
- Push
- Check build status через Vercel/Railway MCP або `gh` CLI

## Failure protocol

Any stage returning `status: "failed"` зупиняє pipeline. Report user з partial artifacts у `docs/changes/<...>/`.

## Update state

После completion update:
- `docs/state/hot.md` — new feature shipped
- `docs/state/decisions.md` — key decisions
- `docs/specs/<capability>/spec.md` — behavior documented
