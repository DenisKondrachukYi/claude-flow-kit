# Changelog

All notable changes to claude-flow-kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-05-07

Hardening + UX release. 4 HIGH and 6 MEDIUM security findings fixed,
test suite added, two-tier config system, `cfk add` for cherry-pick install,
Ralph loop orchestration pattern, and a docs site at GitHub Pages.

### Added

- **`cfk add <component>`** + **`cfk list`** — install a single component
  (e.g. `cfk add ralph-loop`) instead of the full template. Manifest at
  `src/manifest.json` defines 11 named components.
- **Ralph loop pattern** — 6th orchestration pattern for autonomous
  one-task-per-iteration workflows. Includes `/ralph` slash command and
  `.claude/scripts/ralph.sh` runner with checkpointing.
- **Two-tier config system** — `.claude-flow-kit.json` (project, committed)
  and `~/.config/claude-flow-kit/config.json` (user prefs, XDG-compliant).
  `upgrade` reads `preserve` from project config to extend USER_OWNED.
- **CLI flags**: `--yes`/`-y`, `--reset-preferences`, `--skip-install`,
  `--disable-git`. CI auto-detected via `CI=true` enables `--yes`.
- **`SECURITY.md`** with threat model, scope, reporting channel.
- **VitePress documentation site** at `deniskondrachukyi.github.io/claude-flow-kit/`
  built from `docs/*.md` and deployed via GitHub Pages.
- **Auto-generated CLI reference** (`scripts/gen-cli-reference.mjs`) regenerated
  on every docs build.
- **`scripts/gen-settings-variants.mjs`** — single source of truth for
  permissions; 4 variant files derived from base `settings.json`.
- **Test suite**: 34 tests using `node:test` covering stack detection,
  init tree (snapshot), idempotency, symlink defense, config validation,
  upgrade preservation, `cfk add`/`cfk list`. Hand-rolled snapshot helper
  works on Node 18+.
- **`.github/dependabot.yml`** — weekly auto-bumps for GitHub Actions
  (pinned to SHA) and npm devDeps.
- **npm provenance attestations** on release builds (Sigstore via OIDC).
- **`@latest` MCP usage warning** in `SECURITY.md` Known Limitations.

### Changed

- **`session-start.sh` sanitizes git output** — strips control characters,
  truncates branch/commit names to 200 chars, regex-redacts AWS / GitHub /
  `sk-*` token patterns. Mitigates prompt injection through repo metadata.
- **All 4 stack variants** quote `$CLAUDE_PROJECT_DIR` in Stop hook commands.
  Paths with spaces no longer break or inject.
- **`copyDir` rejects symlinks** in both `init.js` and `upgrade.js` — prevents
  npm tarball / git clone escape attacks.
- **Permissions hardening** in `.claude/settings.json` and all variants:
  - Replaced wildcard `Bash(git diff:*)` with explicit safe forms.
  - Extended `deny` with `curl`, `wget`, `nc`, `ssh`, `scp`, `eval`,
    `chmod 777`, plus blocks on writing to `.git/`, `.ssh/`, `.claude/settings.json`,
    `.claude/scripts/`.
  - Added `Read(.env*)`, `Read(**/*.pem|*.key)`, `Read(.ssh/**)` denies.
- **`init.js`** refuses to scaffold into `/` or `$HOME` (B4 hardening).
- **`init.js`** validates `--stack` against allowlist before any file ops.
- **`task-completed.sh`** uses `set -o pipefail` so failed tests actually
  block task completion (was silently passing through `| tail`).
- **All hook scripts** use `set -euo pipefail` and gracefully degrade when
  `jq` is missing (return `{}` instead of breaking).
- **`init`** merges template `.gitignore.template` into target's existing
  `.gitignore`, removes the staging file. Adds `hot.md.precompact` and
  cache directories to ignore.
- **CI workflow** declares top-level `permissions: contents: read`.
- **`ludeeus/action-shellcheck`** pinned to commit SHA (was `@master`).
- **`softprops/action-gh-release`** pinned to commit SHA.

### Fixed

- `printf` format-string injection paths in `status.sh` (A4) — all
  user-controlled values now go through `%s` placeholders.
- `release.yml` no longer fails when `NPM_TOKEN` is missing — skips publish
  step but still creates GitHub Release.

### Security

- A1, A2, A4, A5: prompt injection / format-string / unquoted vars closed.
- B1, B4: symlink escape and `/` / `$HOME` foot-guns closed.
- C1, C3, C4: permissions allow/deny tightened.
- D3, D4: floating Action tags pinned to SHAs.
- F2: `.gitignore` template prevents `hot.md.precompact` leak.
- G2, G5: hook robustness (jq, pipefail).
- H2, I1, J1: input validation, CI permissions, SECURITY.md present.

See [`docs/PLAN-v0.2.md`](./docs/PLAN-v0.2.md) for the full milestone breakdown.

## [0.1.0] - 2026-04-27

### Added
- Initial public release.
- `cfk init` — scaffolds project template, auto-detects stack (nextjs / node-typescript / python / go).
- `cfk status` — terminal dashboard with progress bars and pipeline phases.
- `cfk doctor` — installation diagnostics.
- `cfk upgrade` — refresh framework files, preserve user content.
- 11 slash commands: `/start`, `/handoff`, `/sync`, `/status`, `/spec-interview`, `/ship-feature`, `/ship-full-stack-feature`, `/api-first-feature`, `/fix-prod-bug`, `/debug-systematic`.
- 5 orchestration patterns: orchestrator-worker, writer-reviewer, wave-parallel, adversarial-debate, pipeline-chain.
- 4 stack settings variants with stack-specific Stop hooks.
- 2 user subagents: explorer (read-only), reviewer.
- Living documents: hot.md, decisions.md, glossary.md, specs/, changes/.
- SessionStart, PreCompact, PostCompact, TaskCompleted hooks.
