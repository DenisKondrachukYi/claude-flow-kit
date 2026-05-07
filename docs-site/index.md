---
layout: home

hero:
  name: claude-flow-kit
  text: Production-ready Claude Code project template
  tagline: Orchestration patterns, status dashboard, stack-aware setup. Zero runtime deps. Works on new and existing projects.
  actions:
    - theme: brand
      text: Quick Start
      link: /quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/DenisKondrachukYi/claude-flow-kit
    - theme: alt
      text: View on npm
      link: https://www.npmjs.com/package/claude-flow-kit

features:
  - icon: 🔁
    title: Resumable sessions
    details: hot.md + git checkpoints + auto-injected context on every session start. Pick up exactly where you left off, even after weeks.
  - icon: 📊
    title: Visible progress
    details: Built-in cfk status dashboard with progress bars and pipeline phases. No more "where was I?"
  - icon: 🚀
    title: Spec-driven pipelines
    details: 11 slash commands like /ship-feature, /api-first-feature, /fix-prod-bug, /spec-interview, /ralph.
  - icon: 🧩
    title: 6 orchestration patterns
    details: orchestrator-worker, writer-reviewer, wave-parallel, adversarial-debate, pipeline-chain, ralph-loop.
  - icon: 🛠️
    title: Stack-aware setup
    details: Auto-detects Next.js / Node-TS / Python / Go and applies the right hooks (lint, typecheck, test) on every Stop event.
  - icon: 🔒
    title: Secure by default
    details: Explicit allowlists, denylists for curl/wget/ssh/.env, npm provenance attestations, pinned GitHub Actions.
---

## Install

```bash
# In an existing project (auto-detects stack)
npx claude-flow-kit init

# New project from scratch
npx claude-flow-kit init my-new-app

# Or globally for the cfk shortcut
npm install -g claude-flow-kit
cfk init
cfk status
cfk add patterns
cfk list
```

## What you get

- 11 slash commands ready in `.claude/commands/`
- 6 orchestration pattern docs in `.claude/patterns/`
- Stack-specific Stop hooks that run lint+typecheck+test
- SessionStart / PreCompact / PostCompact hooks for context survival
- Living docs in `docs/state/` and `docs/specs/` for resumability
- Built-in CLI dashboard via `cfk status`
