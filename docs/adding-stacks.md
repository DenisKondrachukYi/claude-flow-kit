# Adding a new stack

Adding `rust`, `ruby`, `elixir`, `bun`, etc. is the easiest first contribution.

## Five-step recipe

### 1. Create the settings variant

`src/template/.claude/settings-variants/<stack>.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings",
  "cleanupPeriodDays": 99999,
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" },
  "statusLine": {
    "type": "command",
    "command": "npx -y @owloops/claude-powerline@latest --style=powerline --theme=nord"
  },
  "permissions": {
    "allow": [
      "Bash(git diff:*)",
      "Bash(git status)",
      "Bash(<stack-tool>:*)",
      "Read(**)",
      "Grep(**)",
      "Glob(**)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Write(.env)",
      "Write(.env.*)"
    ]
  },
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "bash .claude/scripts/session-start.sh" }] }
    ],
    "PreCompact": [
      { "hooks": [{ "type": "command", "command": "cp docs/state/hot.md docs/state/hot.md.precompact 2>/dev/null || true" }] }
    ],
    "PostCompact": [
      { "hooks": [{ "type": "command", "command": "bash .claude/scripts/post-compact.sh" }] }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd $CLAUDE_PROJECT_DIR && <test-cmd> && <lint-cmd>",
            "timeout": 240
          }
        ]
      }
    ]
  }
}
```

Replace `<stack-tool>`, `<test-cmd>`, `<lint-cmd>` with stack-specific values.

### 2. Add detection

Edit `src/lib/stack.js`:

```js
const MARKERS = {
  // ... existing
  rust: ({ files }) => files.has('Cargo.toml'),
};

const ORDER = ['nextjs', 'node-typescript', 'python', 'go', 'rust'];
```

Place new stack in `ORDER` based on specificity — more specific markers first.

### 3. Add install hints

Edit `src/lib/init.js` `printNextSteps()`:

```js
case 'rust':
  process.stdout.write(`${c.bold('Rust extras')}:

  rustup component add clippy rustfmt
  cargo install cargo-watch

  ${c.dim('# Recommended Claude plugins:')}
  /plugin marketplace add wshobson/agents
  /plugin install agent-teams plugin-eval

`);
  break;
```

### 4. Update README

Add row to "Supported stacks" table:

```markdown
| `rust` | `Cargo.toml` | `cargo clippy && cargo test` |
```

### 5. Add smoke test

Edit `scripts/smoke-test.sh`:

```bash
run_case "rust" "Cargo.toml" "rust"
```

And handle the marker creation:

```bash
case "$f" in
  Cargo.toml) echo '[package]' > "$dir/$f" ;;
  # ...
esac
```

## Test locally

```bash
node bin/cli.js init /tmp/test-rust --stack rust
cat /tmp/test-rust/.claude/settings.json | jq '.hooks.Stop[0].hooks[0].command'
```

Should print your `<test-cmd> && <lint-cmd>`.

```bash
npm run smoke-test
```

Should pass with the new case.

## Open the PR

Use the PR template. Reference any related issues. CI runs on Linux + macOS for Node 18, 20, 22.
