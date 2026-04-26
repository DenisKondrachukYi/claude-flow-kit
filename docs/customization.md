# Customization

## Tweak the Stop hook for your stack

Edit `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "your-test-command && your-lint-command"
          }
        ]
      }
    ]
  }
}
```

Exit code 2 = blocks task completion and sends stderr to the subagent for self-correction.
Exit code 0 = task marked done.

## Disable a hook temporarily

Comment out the entry in `.claude/settings.json` or set `"command": "true"`.

## Add a custom slash command

Create `.claude/commands/<name>.md`:

```markdown
---
description: One-line summary shown in /help
---

Instructions for Claude. Reference files via @path/to/file.
```

The file content becomes the command prompt when user types `/<name>`.

## Add a custom orchestration pattern

Create `.claude/patterns/<name>.md` with instructions on when and how to use it. Reference in prompts:

```
> Use @.claude/patterns/<name>.md for this task
```

## Per-project subagents

Add `.claude/agents/<name>.md`:

```markdown
---
name: db-migrator
description: Use proactively when generating SQL migrations
model: sonnet
tools: Read, Write, Bash
memory: project
---

System prompt for this subagent.
```

`memory: project` accumulates patterns in `.claude/agent-memory/` (committed to git).
`memory: user` puts them in `~/.claude/agent-memory/` (cross-project, your own only).

## Skip stack detection

```bash
cfk init --stack python   # forces python settings
cfk init --stack generic  # uses default settings (no Stop hook)
```

## Customize what `cfk upgrade` preserves

Edit your local `.claude-flow-kit.config.json` (TODO — coming in v0.2):

```json
{
  "preserve": [
    "docs/state/hot.md",
    "CLAUDE.md",
    ".claude/commands/my-custom.md"
  ]
}
```

For now, never-overwrite list is hardcoded in `src/lib/upgrade.js` — open an issue if you need more flexibility.

## Keep your own template fork

Fork the repo, edit `src/template/`, publish as your own npm package:

```bash
git clone https://github.com/DenisKondrachukYi/claude-flow-kit your-team-flow
cd your-team-flow
# edit src/template/CLAUDE.md, .claude/settings-variants/, etc.
# update package.json: name, repository, etc.
npm publish --access public
```

Now your team uses `npx your-team-flow init` for org-specific defaults.
