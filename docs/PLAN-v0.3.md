# claude-flow-kit v0.3 Plan

**Released:** v0.2.0 — 2026-05-07. Hardening + UX done.
**Target:** v0.3.0 — Discovery, freshness signals, supply-chain pin.

## Philosophy (preserved)

Zero runtime deps. MIT. Local-first. Cross-platform (macOS+Linux first).

## Milestones

| ID | Name | Effort | Status |
|----|------|--------|--------|
| M7 | Plugin marketplace dual-publish | ~1h | ☐ |
| M8 | Zero-dep update notifier | ~1.5h | ☐ |
| M9 | Pin MCP versions + upgrade docs | ~1h | ☐ |
| Release | CHANGELOG + tag + verify | ~0.5h | ☐ |

Total: ~4h.

---

## M7 — Plugin marketplace dual-publish

Make claude-flow-kit installable via Claude Code's `/plugin marketplace add` *in addition to* npm. Captures users who never run npm.

### Add `.claude-plugin/marketplace.json`

```json
{
  "name": "claude-flow-kit-marketplace",
  "owner": { "name": "Denis Kondrachuk", "url": "https://github.com/DenisKondrachukYi" },
  "metadata": {
    "description": "Production-ready Claude Code project template",
    "version": "0.3.0"
  },
  "plugins": [
    {
      "name": "claude-flow-kit-template",
      "source": "./src/template/.claude",
      "description": "Hooks, commands, patterns, agents — the cfk template",
      "version": "0.3.0"
    }
  ]
}
```

### README addition

> ## Two install paths
>
> - **npm (full CLI):** `npx claude-flow-kit init` — recommended
> - **Claude Code plugin:** `/plugin marketplace add DenisKondrachukYi/claude-flow-kit` then `/plugin install claude-flow-kit-template@claude-flow-kit-marketplace` — installs hooks/commands/patterns only, no scaffolding

### Compatibility matrix in README

| cfk version | Claude Code | Node.js |
|---|---|---|
| 0.3.x | ≥2.1 | ≥18 |
| 0.2.x | ≥2.1 | ≥18 |
| 0.1.x | ≥2.1 | ≥18 |

---

## M8 — Update notifier

Pattern from yeoman, expo-cli, vercel-cli — but zero-dep.

### Mechanic

1. On each `cfk` invocation, check user config for `lastUpdateCheck` timestamp.
2. If older than 24h, async-fetch `registry.npmjs.org/claude-flow-kit/latest`.
3. Cache result in user config.
4. If newer version exists, print non-blocking banner before normal output.

### File: `src/lib/update-notifier.js`

- Uses `node:https` only (zero deps).
- AbortController with 1s timeout — never blocks CLI.
- Honors `NO_UPDATE_NOTIFIER=1`, `NO_COLOR=1`, `CI=true`.
- Honors `--no-update-check` flag.

### Output

```
┌────────────────────────────────────────────────┐
│  Update available: 0.3.0 → 0.4.0               │
│  Run: npm i -g claude-flow-kit                 │
└────────────────────────────────────────────────┘
```

### Tests

3 new tests:
- Skip when CI=true
- Cache TTL respected
- Banner shows on stale + newer version

---

## M9 — Pin MCP versions

D1 + D2 from security audit. Reduces supply-chain attack surface from "any future maintainer compromise of @latest" to "specific commit / version."

### Investigate current stable

```bash
npm view @upstash/context7-mcp version
npm view @modelcontextprotocol/server-sequential-thinking version
npm view @owloops/claude-powerline version
npm view @bytebase/dbhub version
```

### Update `src/template/.mcp.json`

Replace each `@latest` with current pinned semver.

### Update `src/template/.claude/settings.json` and variants

Replace `npx -y @owloops/claude-powerline@latest` in `statusLine` with pinned version.

### New doc: `docs/security-upgrades.md`

Documents:
- Why pinning matters
- How to bump pins (PR template)
- Quarterly review cadence
- How to override locally without modifying template

### Tests

1 test: ensure `.mcp.json` and settings have no `@latest` strings.

---

## Release v0.3.0

```bash
node scripts/gen-cli-reference.mjs
npm version minor --no-git-tag-version
git add -A && git commit -m "chore(release): v0.3.0"
git tag v0.3.0
git push --follow-tags
```

If NPM_TOKEN configured: release.yml auto-publishes with provenance.

---

## Out of scope for v0.3 (still deferred)

- Hooks rewrite to Node.js — v1.0 (Windows support)
- Compound engineering capture — v0.5
- `cfk migrate` — v1.0
- `cfk eject` — never
- Telemetry — never
