# Changelog

All notable changes to claude-flow-kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
