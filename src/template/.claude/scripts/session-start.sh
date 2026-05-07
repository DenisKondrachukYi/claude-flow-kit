#!/usr/bin/env bash
# SessionStart hook — автоінжект hot.md + git context + active task у контекст Claude
# Виводиться JSON з additionalContext, який Claude бачить на старті сесії

set -euo pipefail

# Graceful degradation: якщо jq не встановлений, повертаємо порожній обʼєкт.
# Краще тихий no-op ніж broken session start.
if ! command -v jq >/dev/null 2>&1; then
  echo '{}'
  exit 0
fi

HOT_FILE="docs/state/hot.md"
CHANGES_DIR="docs/changes"

# Sanitize: strip control characters, truncate. Plus regex scrub for known
# token shapes (AWS, GitHub, OpenAI/Anthropic-style sk-*) to prevent secret
# leakage and prompt-injection through git metadata (issue A1, F1).
sanitize() {
  printf '%s' "$1" \
    | tr -d '\000-\010\013\014\016-\037' \
    | head -c 200 \
    | sed -E 's/AKIA[0-9A-Z]{16}/[REDACTED-AWS]/g; s/ghp_[0-9a-zA-Z]{36}/[REDACTED-GH]/g; s/sk-[a-zA-Z0-9_-]{20,}/[REDACTED-KEY]/g'
}

# Git context (sanitized — branch and commit-message can contain anything).
BRANCH=$(sanitize "$(git branch --show-current 2>/dev/null || echo 'not-a-repo')")
LAST_COMMIT=$(sanitize "$(git log --oneline -1 2>/dev/null || echo 'no commits')")
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
LAST_HANDOFF=$(sanitize "$(git log --oneline --grep='handoff' -1 2>/dev/null || echo 'no handoff commits yet')")

# Hot.md content (перші 60 рядків, якщо є)
HOT_CONTENT=""
if [ -f "$HOT_FILE" ]; then
  HOT_CONTENT=$(head -60 "$HOT_FILE")
fi

# Активний change (остання модифікована папка у changes/)
ACTIVE_CHANGE=""
NEXT_TASK=""
PROGRESS=""
if [ -d "$CHANGES_DIR" ]; then
  # Cross-platform sort by mtime (BSD stat on macOS, GNU stat on Linux).
  if stat -f "%m %N" "$CHANGES_DIR" >/dev/null 2>&1; then
    SORTED_CHANGES=$(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null \
                       | xargs -0 -I {} stat -f "%m %N" {} 2>/dev/null \
                       | sort -rn | cut -d' ' -f2-)
  elif stat -c "%Y %n" "$CHANGES_DIR" >/dev/null 2>&1; then
    SORTED_CHANGES=$(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null \
                       | xargs -0 -I {} stat -c "%Y %n" {} 2>/dev/null \
                       | sort -rn | cut -d' ' -f2-)
  else
    SORTED_CHANGES=$(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)
  fi
  ACTIVE_CHANGE=""
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    n=$(basename "$path")
    if [ "${n#README}" != "$n" ]; then
      continue
    fi
    ACTIVE_CHANGE="$n"
    break
  done <<EOF
$SORTED_CHANGES
EOF
  if [ -n "$ACTIVE_CHANGE" ] && [ -f "$CHANGES_DIR/$ACTIVE_CHANGE/tasks.md" ]; then
    # Знаходимо перший незакритий task
    NEXT_TASK=$(grep -m1 -n "^- \[ \]" "$CHANGES_DIR/$ACTIVE_CHANGE/tasks.md" 2>/dev/null || echo "no pending tasks")
    # Рахуємо прогрес
    DONE=$(grep -c "^- \[x\]" "$CHANGES_DIR/$ACTIVE_CHANGE/tasks.md" 2>/dev/null || echo 0)
    TOTAL=$(grep -cE "^- \[( |x)\]" "$CHANGES_DIR/$ACTIVE_CHANGE/tasks.md" 2>/dev/null || echo 0)
    PROGRESS="$DONE/$TOTAL tasks done"
  fi
fi

# Формуємо JSON
CONTEXT="## Session context

### Git
- Branch: $BRANCH
- Last commit: $LAST_COMMIT
- Last handoff checkpoint: $LAST_HANDOFF
- Dirty files: $DIRTY

### Active change
${ACTIVE_CHANGE:-none}
Progress: ${PROGRESS:-N/A}
Next task: ${NEXT_TASK:-N/A}

### Hot state (docs/state/hot.md)
$HOT_CONTENT

---
REMEMBER: run \`/start\` for ritual start with full summary, or \`/handoff\` before ending session."

# Use printf instead of echo to avoid backslash interpretation (A2).
ESCAPED=$(printf '%s' "$CONTEXT" | jq -Rs .)
printf '{"additionalContext": %s}\n' "$ESCAPED"
