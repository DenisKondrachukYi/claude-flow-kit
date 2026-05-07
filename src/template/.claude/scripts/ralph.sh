#!/usr/bin/env bash
# Ralph loop runner — feeds .ralph/PROMPT.md to claude one iteration at a time.
# Stops when .ralph/fix_plan.md says STATUS: DONE, or after CFK_RALPH_MAX_ITERS.

set -euo pipefail

RALPH_DIR=".ralph"
PROMPT_FILE="$RALPH_DIR/PROMPT.md"
PLAN_FILE="$RALPH_DIR/fix_plan.md"
LOG_FILE="$RALPH_DIR/log.txt"

MAX_ITERS="${CFK_RALPH_MAX_ITERS:-50}"
SLEEP_BETWEEN="${CFK_RALPH_SLEEP:-2}"

if [ ! -f "$PROMPT_FILE" ] || [ ! -f "$PLAN_FILE" ]; then
  echo "Error: $RALPH_DIR/PROMPT.md or fix_plan.md missing." >&2
  echo "Run \`/ralph <goal>\` inside Claude Code first." >&2
  exit 1
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "Error: 'claude' CLI not found in PATH." >&2
  echo "Install: npm install -g @anthropic-ai/claude-code" >&2
  exit 1
fi

mkdir -p "$RALPH_DIR/checkpoints"
touch "$LOG_FILE"

iter=0
while [ "$iter" -lt "$MAX_ITERS" ]; do
  iter=$((iter + 1))

  # Stop if STATUS: DONE.
  if head -1 "$PLAN_FILE" | grep -q "STATUS: DONE"; then
    echo "[ralph] STATUS: DONE — exiting after $iter iteration(s)."
    break
  fi

  echo "[ralph] iteration $iter/$MAX_ITERS"
  printf '%s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')  iter=$iter  start" >> "$LOG_FILE"

  # Optional checkpoint: commit current state if inside a git repo.
  if git rev-parse --git-dir >/dev/null 2>&1; then
    git add -A 2>/dev/null || true
    git commit -q -m "ralph: pre-iter $iter checkpoint" --allow-empty 2>/dev/null || true
  fi

  # Run Claude with PROMPT.md piped in.
  if ! claude < "$PROMPT_FILE"; then
    echo "[ralph] iteration $iter failed (claude exited non-zero)" >&2
    printf '%s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')  iter=$iter  FAILED" >> "$LOG_FILE"
    exit 1
  fi

  printf '%s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')  iter=$iter  end" >> "$LOG_FILE"
  sleep "$SLEEP_BETWEEN"
done

if [ "$iter" -ge "$MAX_ITERS" ]; then
  echo "[ralph] reached MAX_ITERS=$MAX_ITERS without STATUS: DONE — stopping for safety." >&2
  exit 2
fi
