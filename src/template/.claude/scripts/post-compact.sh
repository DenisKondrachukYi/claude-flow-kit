#!/usr/bin/env bash
# PostCompact hook — після компакції контексту, повторно інжектимо hot.md
# Щоб після auto-compact Claude не "забув" де він і з чим працює

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo '{}'
  exit 0
fi

HOT_FILE="docs/state/hot.md"

if [ ! -f "$HOT_FILE" ]; then
  echo "{}"
  exit 0
fi

CONTENT=$(head -60 "$HOT_FILE")
ESCAPED=$(printf '%s\n%s' "## Post-compact context refresh" "$CONTENT" | jq -Rs .)
printf '{"additionalContext": %s}\n' "$ESCAPED"
