#!/usr/bin/env bash
# End-to-end smoke test: init for each stack, verify result, cleanup
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d -t cfk-smoke-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT

PASS=0
FAIL=0

run_case() {
  local name="$1"
  local marker_files="$2"
  local expected_stack="$3"

  local dir="$TMP/$name"
  mkdir -p "$dir"

  # Create marker files
  for f in $marker_files; do
    case "$f" in
      package.json) echo '{"devDependencies":{"typescript":"5"}}' > "$dir/$f" ;;
      next.config.js) echo "module.exports = {};" > "$dir/$f" ;;
      pyproject.toml) echo "[project]" > "$dir/$f" ;;
      go.mod) echo "module test" > "$dir/$f" ;;
      *) touch "$dir/$f" ;;
    esac
  done

  # Run init
  if ! node "$ROOT/bin/cli.js" init "$dir" --no-install-deps > "$dir/init.log" 2>&1; then
    echo "✗ $name (init failed)"
    cat "$dir/init.log"
    FAIL=$((FAIL+1))
    return
  fi

  # Verify expected files
  for required in "CLAUDE.md" ".claude/settings.json" ".claude/scripts/session-start.sh" "docs/state/hot.md"; do
    if [ ! -f "$dir/$required" ]; then
      echo "✗ $name (missing $required)"
      FAIL=$((FAIL+1))
      return
    fi
  done

  # Verify stack detection
  if ! grep -q "Stack: $expected_stack" "$dir/init.log"; then
    echo "✗ $name (expected stack=$expected_stack, got: $(grep "Stack:" "$dir/init.log" || echo "?"))"
    FAIL=$((FAIL+1))
    return
  fi

  # Verify scripts executable
  if [ ! -x "$dir/.claude/scripts/session-start.sh" ]; then
    echo "✗ $name (session-start.sh not executable)"
    FAIL=$((FAIL+1))
    return
  fi

  # Verify status.sh runs without error
  if ! ( cd "$dir" && bash .claude/scripts/status.sh > /dev/null 2>&1 ); then
    echo "✗ $name (status.sh failed)"
    FAIL=$((FAIL+1))
    return
  fi

  echo "✓ $name (stack=$expected_stack)"
  PASS=$((PASS+1))
}

echo "Running smoke tests in $TMP"
echo "─────────────────────────────"

run_case "next-js"       "next.config.js package.json" "nextjs"
run_case "node-ts"       "package.json"                 "node-typescript"
run_case "python"        "pyproject.toml"               "python"
run_case "go"            "go.mod"                       "go"
run_case "generic"       ""                             "generic"

echo "─────────────────────────────"
echo "Pass: $PASS, Fail: $FAIL"
[ "$FAIL" -eq 0 ]
