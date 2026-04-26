---
description: Contract-first — OpenAPI spec → types → backend scaffold → frontend client у lockstep
---

Feature: $ARGUMENTS

Eliminates "frontend waiting on backend" через single source of truth (OpenAPI spec).

## Pipeline (aggressively parallel)

### Stage 1 — Design the contract
Task, "api-designer" (VoltAgent).

Output: `openapi/$FEATURE.yaml` (OpenAPI 3.1). Include:
- Request/response schemas
- Error envelope
- Auth
- Versioning strategy

**Gate:** human reviews contract перед ANY code. Це дешевше змінити YAML ніж код з двох сторін.

### Stage 2 — Generate artifacts (PARALLEL)

Виклич три Task tools у **одному message** для справжнього parallelism:

**Task A — Types:**
subagent_type "typescript-pro"
```bash
npx openapi-typescript openapi/$FEATURE.yaml -o src/api/types.ts
```

**Task B — Backend scaffold:**
subagent_type "fastapi-pro" або "typescript-pro"
Scaffold handlers matching operations з OpenAPI. **Empty bodies**, typed signatures. No business logic yet.

**Task C — Frontend scaffold:**
subagent_type "react-specialist"
API client з TanStack Query hooks з generated types. **Empty UI components.**

### Stage 3 — Contract tests
Task, "test-automator".

Generate contract tests які hit кожен backend handler з valid + invalid payloads. Verify response matches schema.

Tools: Schemathesis (Python), Dredd (generic), або custom з OpenAPI.

### Stage 4 — Parallel implementation

Spawn TWO Task tools одночасно:

**Backend worker:**
- Fill handler bodies
- Query database через dbhub MCP щоб inspect schema
- Write unit tests

**Frontend worker:**
- Build UI використовуючи shadcn MCP + frontend-design skill
- Connect до TanStack Query hooks
- Mock data з OpenAPI examples doки backend not ready

Обидва reference same OpenAPI spec. **No drift possible.**

### Stage 5 — E2E через Playwright MCP
Same як Stage 6 у `/ship-full-stack-feature`.

### Stage 6 — Commit both sides atomically
- ONE PR
- Conventional commit
- Include OpenAPI diff у commit body
- CI runs contract tests + E2E

## Why це works

Contract-first eliminates:
- Frontend чекає backend
- Types drift (ручно копіюються і розходяться)
- Breaking changes не помічені (contract diff у PR видний)
- Mock data ad-hoc (generated з OpenAPI examples)
