# Security Upgrades

How and when to bump pinned versions in `claude-flow-kit`.

## Why pinning matters

`@latest` floats. Anyone who compromises a maintainer's npm token at any future point can ship malicious code that executes silently on every Claude session start (hooks + status line + MCP servers).

Pinning to specific versions reduces the attack window from "forever" to "until the next bump." We accept slightly stale tooling in exchange for a clean review cycle.

## What we pin

| File | Pinned versions |
|---|---|
| `src/template/.mcp.json` | `@upstash/context7-mcp`, `@modelcontextprotocol/server-sequential-thinking` |
| `src/template/.mcp.optional.json` | `@pimzino/spec-workflow-mcp`, `@bitbonsai/mcpvault`, `@modelcontextprotocol/server-memory` |
| `src/template/.claude/settings.json` (and all variants via generator) | `@owloops/claude-powerline` (statusLine command) |
| `.github/workflows/*.yml` | All third-party Actions pinned to commit SHA |

## What we do NOT pin

- `@github/mcp-server` — official, no semver tags published yet (uses `@latest` implicitly via npx).
- `obsidian-claude-code-mcp` — not on npm registry.
- `serena` — installed via `uvx` from git; pinning is the consumer's responsibility.

## Quarterly review cadence

Every 3 months (or on a CVE), open a PR titled `chore(deps): bump pinned MCPs`:

```bash
# Check current → latest
for pkg in \
  @upstash/context7-mcp \
  @modelcontextprotocol/server-sequential-thinking \
  @owloops/claude-powerline \
  @bytebase/dbhub \
  @pimzino/spec-workflow-mcp \
  @bitbonsai/mcpvault \
  @modelcontextprotocol/server-memory; do
  v=$(npm view "$pkg" version 2>/dev/null | head -1)
  echo "$pkg → $v"
done
```

For each package with a newer version:
1. Skim the changelog / release notes.
2. Update the pinned version in `.mcp.json`, `.mcp.optional.json`, or `settings.json` source.
3. Run `npm run gen:settings` to propagate to variants.
4. Run `npm test && npm run smoke-test`.
5. PR titled e.g. `chore(deps): bump context7-mcp to 2.3.0`.

## How to override locally without modifying the template

If you want a different version in your project (e.g. testing a beta), edit `.mcp.json` after `cfk init`. `cfk upgrade` does not overwrite this file (it is in `USER_OWNED`).

If you want to override `statusLine`, edit `.claude/settings.json` directly (also in `USER_OWNED`).

## How to disable update notifier

```bash
NO_UPDATE_NOTIFIER=1 cfk status
# or per-invocation
cfk status --no-update-check
```

## Reporting a supply-chain incident

If you spot suspicious activity in any pinned dependency (typosquat, sudden ownership change, leaked maintainer credentials), open a private vulnerability advisory at:

https://github.com/DenisKondrachukYi/claude-flow-kit/security/advisories

We will bump the pin and ship a patch release within 14 days for HIGH severity.

## Related

- [SECURITY.md](../SECURITY.md) — full threat model and reporting policy.
- [.github/dependabot.yml](../.github/dependabot.yml) — weekly auto-bumps for GitHub Actions.
