# Contributing to claude-flow-kit

Thanks for your interest. This guide gets you productive.

## Project structure

```
claude-flow-kit/
├── bin/cli.js              ← CLI entry point
├── src/
│   ├── lib/                ← init, status, doctor, upgrade implementations
│   └── template/           ← what gets copied into user projects
├── docs/                   ← user-facing docs
├── test/                   ← node:test based tests
├── scripts/smoke-test.sh   ← end-to-end install test
└── .github/workflows/      ← CI
```

## Development workflow

```bash
git clone https://github.com/REPLACE_OWNER/claude-flow-kit
cd claude-flow-kit
npm install                  # no runtime deps; this just enables npm scripts

# Test locally on a temp project
node bin/cli.js init /tmp/test-project
node bin/cli.js status       # cd into the project first

# Run smoke test
npm run smoke-test
```

## Common contributions

### Adding a new stack (easiest)

1. Create `src/template/.claude/settings-variants/<stack>.json` (copy `python.json` as a base).
2. Customize `permissions.allow` and the `Stop` hook command for the stack.
3. Add detection in `src/lib/stack.js` (`MARKERS` map + `ORDER` list).
4. Add stack-specific install hints in `src/lib/init.js` `printNextSteps()`.
5. Update README "Supported stacks" table.
6. Add a smoke test scenario in `scripts/smoke-test.sh`.

### Adding a slash command

1. Create `src/template/.claude/commands/<name>.md` with frontmatter `description:`.
2. Update README slash commands table.
3. Add to `src/lib/init.js` `printNextSteps()` if it should be highlighted.
4. Update `src/lib/upgrade.js` `FRAMEWORK_OWNED` so users get the new command on `cfk upgrade`.

### Adding an orchestration pattern

1. Create `src/template/.claude/patterns/<name>.md`.
2. Update `src/template/.claude/patterns/README.md` table.
3. Mention in user-facing README "Orchestration patterns".

### Modifying a hook script

1. Edit `src/template/.claude/scripts/<name>.sh`.
2. Run `shellcheck` on it: `npm run lint:shell`.
3. Test in a fresh init: `node bin/cli.js init /tmp/test && cd /tmp/test && bash .claude/scripts/<name>.sh`.

## Coding standards

- **No runtime dependencies** in the npm package. Use Node.js stdlib only.
- **Bash scripts** must pass `shellcheck` (zero warnings preferred).
- **JSON** must be valid (CI validates).
- **CLI output** uses ANSI helpers from `src/lib/print.js`.
- Keep `src/lib/*.js` ESM-only (`type: module`).

## Testing

```bash
npm test                 # node:test based unit tests
npm run smoke-test       # end-to-end: init → verify → cleanup
npm run lint:shell       # shellcheck on all template scripts
npm run lint:json        # validate all JSON files
```

CI runs all of the above on PRs.

## Release process

1. Update `CHANGELOG.md` (`[Unreleased]` → new version section).
2. Bump version: `npm version patch|minor|major`.
3. Push tag: `git push --follow-tags`.
4. GitHub Actions publishes to npm on tag push.

## Code of conduct

Be kind. Issues and PRs over personal attacks. Disagree without being a jerk.

## Questions

Open an issue or discussion on GitHub.
