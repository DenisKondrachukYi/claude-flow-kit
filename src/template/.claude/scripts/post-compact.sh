#!/usr/bin/env bash
# PostCompact hook — після компакції контексту, повторно інжектимо hot.md
# Щоб після auto-compact Claude не "забув" де він і з чим працює

set -e

HOT_FILE="docs/state/hot.md"

if [ ! -f "$HOT_FILE" ]; then
  echo "{}"
  exit 0
fi

CONTENT=$(head -60 "$HOT_FILE")
ESCAPED=$(echo "## Post-compact context refresh

$CONTENT" | jq -Rs .)

echo "{\"additionalContext\": $ESCAPED}"
