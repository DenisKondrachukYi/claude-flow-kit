# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.x     | :white_check_mark: |

We support the latest minor of v0.x while v1.0 is in development. After v1.0 releases, we will support the two most recent major versions.

## Reporting a Vulnerability

If you find a security issue, please **do not open a public issue**.

Use GitHub's private vulnerability reporting:

1. Go to https://github.com/DenisKondrachukYi/claude-flow-kit/security/advisories
2. Click **Report a vulnerability**
3. Provide a detailed description and reproduction steps

We aim to acknowledge reports within 72 hours and ship a fix within 14 days for HIGH severity, 30 days for MEDIUM. We follow a 90-day coordinated disclosure window unless agreed otherwise.

## Threat Model

`claude-flow-kit` ships:

1. **A Node.js CLI** (`bin/cli.js` + `src/lib/*.js`) — runs on your machine, scaffolds files into project directories.
2. **A template** (`src/template/*`) installed into your projects, which includes:
   - **Bash hooks** that run automatically when you invoke Claude Code (SessionStart, PreCompact, PostCompact, Stop).
   - **Permissions config** (`.claude/settings.json`) that authorizes a fixed set of `Bash`, `Read`, `Write`, `Edit` operations.
   - **Slash commands** that the user explicitly invokes inside Claude Code.

### In scope

- The CLI itself: input validation, path traversal, symlink escape, dependency confusion, supply chain integrity.
- Default `.claude/settings.json` permissions: should not silently allow shell injection, secret exfil, or persistence.
- Bash hook scripts: must safely handle hostile git metadata, malformed user files, missing dependencies.
- Build and release pipeline: GitHub Actions with pinned SHAs, npm provenance attestations.

### Out of scope

- Third-party MCP servers and Claude Code plugins suggested in README. We do not vet them. Audit before installing.
- `qmd`, `claudekit`, `superpowers`, and any other tool listed in install hints — review their own security policies.
- The user's own project code, tests, or scripts that get executed by the `Stop` hook (`npm test`, `pytest`, etc.) — these are user-controlled and outside our trust boundary.
- Models running in Anthropic's cloud infrastructure.

## Security Posture

- **Zero runtime dependencies.** The npm package has no `dependencies` — only Node.js stdlib. Audit surface is the package itself plus `engines` constraint.
- **MIT license.** No usage restrictions, no warranty.
- **npm publish provenance.** Releases ≥ v0.2.0 are published from GitHub Actions with `--provenance`, generating Sigstore attestations linking the npm tarball to its source commit.
- **Pinned GitHub Actions.** Third-party Actions are pinned to a commit SHA. Dependabot weekly auto-bumps with PRs.
- **Permissions allowlist over wildcards.** Default `.claude/settings.json` allows only narrow, audited subcommands rather than `Bash(git:*)` style wildcards.

## What you should do

If you adopt `claude-flow-kit`:

1. **Run `cfk init` only in repositories you trust.** Hooks (`.claude/scripts/*.sh`) execute automatically on every Claude session start. A hostile repo cloned by Claude can run anything via `Stop` hook + project-defined `npm test`.
2. **Review the `deny` list in `.claude/settings.json`** for your threat model. We block curl/wget/ssh/scp by default. If you have a workflow that needs them (deploy scripts, etc.), allow them deliberately at a narrow path.
3. **Rotate any secret ever committed.** `.claudeignore` does not retroactively scrub git history.
4. **Set `cleanupPeriodDays: 99999`** in `~/.claude/settings.json`. This is unrelated to security but prevents accidental session loss that breaks resumability.
5. **Use `cfk doctor`** to verify your installation matches expected state.
6. **Track Dependabot PRs** if you fork or vendor this kit.

## Known Limitations

- **MCP servers in `.mcp.json` use `@latest`** for several packages (Context7, GitHub MCP). This means `npx -y` fetches the current version on every Claude invocation, exposing you to upstream maintainer compromise. Pinning is on the v1.0 roadmap. For higher security, edit `.mcp.json` to pin specific versions after `cfk init`.
- **Status line uses `npx -y @owloops/claude-powerline@latest`** which fetches on every status update. To mitigate, install once globally (`npm i -g @owloops/claude-powerline`) and edit `.claude/settings.json` to invoke the global binary.
- **Bash hooks require macOS or Linux.** Windows is on the v1.0 roadmap (Node-based hooks).
- **Hook output is treated as Claude context.** We sanitize git metadata to prevent the most common prompt injection vectors, but a determined attacker who controls a repo's contents can still influence the session via files Claude reads. Treat Claude session context as untrusted input from a security perspective.

## History

| Date | Version | Notes |
|------|---------|-------|
| 2026-04-27 | 0.1.0 | Initial release. No published vulnerabilities yet. |
| 2026-04-27 | 0.2.0 | First hardening pass: 4 HIGH + 6 MEDIUM findings remediated; npm provenance enabled; Dependabot active. |
