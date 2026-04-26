#!/usr/bin/env bash
# SessionStart hook — автоінжект hot.md + git context + active task у контекст Claude
# Виводиться JSON з additionalContext, який Claude бачить на старті сесії

set -e

HOT_FILE="docs/state/hot.md"
CHANGES_DIR="docs/changes"

# Git context
BRANCH=$(git branch --show-current 2>/dev/null || echo "not-a-repo")
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "no commits")
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
LAST_HANDOFF=$(git log --oneline --grep="handoff" -1 2>/dev/null || echo "no handoff commits yet")

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
  ACTIVE_CHANGE=$(echo "$SORTED_CHANGES" | while IFS= read -r path; do
                    [ -z "$path" ] && continue
                    n=$(basename "$path")
                    case "$n" in README*) continue ;; esac
                    echo "$n"
                    break
                  done)
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

# Екрануємо JSON
ESCAPED=$(echo "$CONTEXT" | jq -Rs .)

echo "{\"additionalContext\": $ESCAPED}"
