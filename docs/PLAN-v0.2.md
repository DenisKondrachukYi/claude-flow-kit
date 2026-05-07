# claude-flow-kit v0.2 Plan

**Source of truth for all v0.2 PRs.** Based on:
- Security audit (20 findings, 4 HIGH / 7 MED / 6 LOW / 3 INFO)
- Opensource CLI best practices research (2026)

**Released:** v0.1.0 — 2026-04-27.
**Target:** v0.2.0 — 1-2 weeks calendar time, ~25-30 hours of work.

## Philosophy (preserved across all changes)

- Zero **runtime** dependencies. Dev deps OK (VitePress, etc.)
- MIT license, opensource-first
- Local-first; no cloud requirements
- Cross-platform where reasonable (macOS+Linux first; Windows in v1.0)

---

## Milestones

| ID | Name | Effort | Status |
|----|------|--------|--------|
| M1.1 | Security HIGH fixes | ~3h | ☐ |
| M1.2 | Security MEDIUM fixes | ~3h | ☐ |
| M1.3 | Security infrastructure (SECURITY.md, dependabot, provenance) | ~1h | ☐ |
| M2 | Test suite (node:test snapshots) | ~5h | ☐ |
| M3 | Config system (`.claude-flow-kit.json` + XDG) | ~3h | ☐ |
| M4 | `cfk add <feature>` + manifest | ~6h | ☐ |
| M5 | Ralph loop pattern + CI flags | ~4h | ☐ |
| M6 | VitePress docs site | ~3h | ☐ |
| Release | CHANGELOG + version bump + tag + verify | ~1h | ☐ |

---

## M1.1 — Security HIGH (4 findings)

### A1: Prompt injection via git branch/commit name

**Location:** `src/template/.claude/scripts/session-start.sh:11-79`
**Fix:**
```bash
sanitize() { printf '%s' "$1" | tr -d '\000-\010\013\014\016-\037' | head -c 200; }
BRANCH=$(sanitize "$(git branch --show-current 2>/dev/null || echo 'not-a-repo')")
LAST_COMMIT=$(sanitize "$(git log --oneline -1 2>/dev/null || echo 'no commits')")
LAST_HANDOFF=$(sanitize "$(git log --oneline --grep='handoff' -1 2>/dev/null || echo 'no handoff commits yet')")
```
Plus token regex scrub: `AKIA[0-9A-Z]{16}`, `ghp_[0-9a-zA-Z]{36}`, `sk-[a-zA-Z0-9]{32,}` → `[REDACTED]`.

### A5: Unquoted `$CLAUDE_PROJECT_DIR` in Stop hooks

**Location:** all 4 stack variants `Stop` hook command field.
**Fix:** wrap variable in escaped double quotes inside JSON string:
```json
"command": "cd \"$CLAUDE_PROJECT_DIR\" && pnpm typecheck && pnpm lint --max-warnings 0 && pnpm vitest run --reporter=dot"
```

### B1: `copyDir` follows symlinks

**Location:** `src/lib/init.js:96`, `src/lib/upgrade.js:83`
**Fix:**
```js
if (e.isSymbolicLink()) {
  opts.stats.skipped++;
  continue;
}
```

### D3: `ludeeus/action-shellcheck@master` floating tag

**Location:** `.github/workflows/ci.yml:42`
**Fix:** pin to SHA, add `# v2.0.0` comment, enable Dependabot for actions.

---

## M1.2 — Security MEDIUM (6 findings)

### A4: `printf` format-string injection in status.sh

Replace every `printf "$VAR"` with `printf '%s' "$VAR"`. Lines 117-118, 218-223 specifically.

### C1: `Bash(git diff:*)` allows config injection

Replace wildcard with explicit safe forms:
```json
"Bash(git diff)",
"Bash(git diff --stat)",
"Bash(git diff --cached)",
"Bash(git diff HEAD)",
"Bash(git diff --name-only:*)",
```
Apply to base settings.json + all 4 variants.

### C3: `deny` missing high-value targets

Add to all variants:
```json
"Bash(curl:*)", "Bash(wget:*)", "Bash(nc:*)", "Bash(ssh:*)",
"Bash(scp:*)", "Bash(eval:*)",
"Write(.git/**)", "Edit(.git/**)",
"Read(.ssh/**)", "Write(.ssh/**)",
"Write(.claude/settings.json)", "Edit(.claude/settings.json)",
"Write(.claude/scripts/**)", "Edit(.claude/scripts/**)"
```

### C4: `Read(**)` allows reading `.env` and SSH keys

Add to deny:
```json
"Read(.env)", "Read(.env.*)", "Read(**/.env)", "Read(**/.env.*)",
"Read(**/*.pem)", "Read(**/*.key)"
```

### G2: Missing `jq` aborts hooks confusingly

Top of session-start.sh, post-compact.sh:
```bash
if ! command -v jq >/dev/null 2>&1; then
  echo '{}'
  exit 0
fi
```

### G5: `task-completed.sh` swallows test exits via pipe

Add `set -o pipefail` at top, restructure:
```bash
if ! npm test --silent 2>&1 | tail -20; then
  exit 2
fi
```

---

## M1.3 — Security infrastructure

- Create `SECURITY.md` (8-30 lines, npm template-oss style)
- Create `.github/dependabot.yml` for actions and npm
- `ci.yml`: top-level `permissions: contents: read`
- `release.yml`: add `id-token: write` + `npm publish --provenance`
- README: provenance badge, "Security" section linking SECURITY.md
- F2: ship `src/template/.gitignore` covering `hot.md.precompact`

---

## M2 — Test suite

Use `node --test` (Node 22+) with `t.assert.snapshot()`.

```
test/
├── helpers/walk-tree.js        # walk dir, return sorted list of files
├── stack-detection.test.js     # 5 cases
├── init-tree.test.js           # snapshot per stack
├── init-idempotent.test.js     # second init same dir
├── init-symlink.test.js        # B1 regression
├── init-paths.test.js          # H2 stack allowlist, B4 home/root refusal
├── upgrade-preserve.test.js    # FRAMEWORK_OWNED updated, USER_OWNED preserved
├── doctor-checks.test.js       # mock global config, verify pass/fail
└── add.test.js                 # cfk add adds expected files
```

Run once with `--test-update-snapshots` to baseline; CI runs without flag.
Update CI to run `npm test` after smoke-test.

---

## M3 — Configuration system

New file `src/lib/config.js` (~60 LOC):

```js
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const xdg = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
export const userConfigPath = join(xdg, 'claude-flow-kit', 'config.json');
export const projectConfigPath = (cwd) => join(cwd, '.claude-flow-kit.json');

const DEFAULTS = { version: 1, stack: null, lastUsedAt: null };

export function readUserConfig() { /* ... */ }
export function writeUserConfig(patch) { /* ... */ }
export function readProjectConfig(cwd) { /* ... */ }
```

Schema (validated with simple typeof checks, no zod):
```json
{
  "version": 1,
  "stack": "nextjs",
  "preserve": ["docs/state/hot.md", "CLAUDE.md"],
  "skipPlugins": false,
  "lastUsedAt": "2026-04-27T..."
}
```

`upgrade.js` reads `.preserve` from project config to extend `USER_OWNED`.
`init.js` writes `lastUsedAt` and `stack` after success.
`--reset-preferences` deletes user config.

---

## M4 — `cfk add <feature>` + `cfk list`

`src/manifest.json`:
```json
{
  "components": {
    "status-dashboard": {
      "description": "CLI dashboard for active changes",
      "files": [
        ".claude/commands/status.md",
        ".claude/scripts/status.sh"
      ]
    },
    "ralph-loop": {
      "description": "Ralph Wiggum autonomous loop pattern",
      "files": [
        ".claude/patterns/ralph-loop.md",
        ".claude/commands/ralph.md",
        ".claude/scripts/ralph.sh"
      ]
    },
    "hooks": { ... },
    "memory-bridge": { ... },
    "agents": { ... },
    "patterns-all": { ... },
    "pipelines-fullstack": { ... }
  }
}
```

New file `src/lib/add.js` (~80 LOC). Reuses `copyDir`-style logic.

CLI:
```
cfk add <feature> [--force]
cfk list
cfk list --installed
```

---

## M5 — Ralph loop pattern + CI flags

### Ralph loop

Source: ghuntley.com/ralph + Anthropic "Effective Harnesses for Long-Running Agents"

Add files:
- `src/template/.claude/patterns/ralph-loop.md` (300 lines, the pattern itself)
- `src/template/.claude/commands/ralph.md` (slash command wrapper)
- `src/template/.claude/scripts/ralph.sh` (`while :; do ... done` shell)
- `src/template/.claude/scripts/ralph.mjs` (Node twin for Windows)

### CI flags

`bin/cli.js` additions:
- `--yes` / `-y` — auto-accept all prompts (CI mode)
- `--reset-preferences` — wipe user config and re-prompt
- `--skip-install` — don't print install bundle (already exists as `--no-install-deps`, alias)
- `--disable-git` — reserved (no-op currently, future-proof)
- Auto-detect `process.env.CI === 'true'` → enable `--yes`

---

## M6 — VitePress docs site

```
docs-site/
├── .vitepress/
│   └── config.ts
├── index.md
└── (links to ../docs/*.md)
```

`.github/workflows/docs.yml` — deploys to GitHub Pages on push to main.

VitePress in `devDependencies` only.

URL: `deniskondrachukyi.github.io/claude-flow-kit/`

Auto-CLI reference script: 50 LOC in `scripts/gen-cli-reference.js` reads HELP from `bin/cli.js`, writes `docs/cli-reference.md`. CI runs in docs.yml.

---

## Release v0.2.0

```bash
# 1. Update CHANGELOG.md [Unreleased] → [0.2.0]
# 2. Bump version
npm version minor --no-git-tag-version
# 3. Commit + push
git commit -am "chore(release): v0.2.0"
git push
# 4. Tag (release.yml will auto-publish with --provenance)
git tag v0.2.0
git push --tags
# 5. Verify
npm view claude-flow-kit
# Should show provenance attestation
```

---

## Tracking

GitHub Issues: one per M1.1, M1.2, M1.3, M2, M3, M4, M5, M6.
Project board: `v0.2-roadmap` with columns Backlog → In Progress → Review → Done.

## Out of scope for v0.2 (deferred)

- D1+D2: pin `@latest` MCP versions — research in v1.0
- Hooks rewrite to Node.js — v1.0 (Windows support)
- Plugin marketplace dual-publish — v0.3
- Update notifier — v0.4
- Compound engineering capture — v0.5
- `cfk migrate` — v1.0
- `cfk eject` — never (architecture obviates need)
- Telemetry — never
