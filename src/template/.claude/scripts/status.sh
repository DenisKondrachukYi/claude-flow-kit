#!/usr/bin/env bash
# Status dashboard — показує всі active changes, їх прогрес, next task, blockers
# Usage: bash .claude/scripts/status.sh [--verbose]
#        або додай alias: alias cs='bash .claude/scripts/status.sh'

set -e

VERBOSE=false
if [ "$1" = "-v" ] || [ "$1" = "--verbose" ]; then
  VERBOSE=true
fi

# Colors (ANSI)
BOLD='\033[1m'
DIM='\033[2m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
CYAN='\033[36m'
GRAY='\033[90m'
RESET='\033[0m'

CHANGES_DIR="docs/changes"
HOT_FILE="docs/state/hot.md"
DECISIONS_FILE="docs/state/decisions.md"

# ─── Header ───────────────────────────────────────────────
printf "\n${BOLD}📊 Project Status${RESET} "
printf "${GRAY}$(date +"%Y-%m-%d %H:%M")${RESET}\n"
printf "${GRAY}$(pwd)${RESET}\n"
printf "${GRAY}────────────────────────────────────────────────────${RESET}\n\n"

# ─── Git state ────────────────────────────────────────────
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
  LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "no commits")
  LAST_HANDOFF=$(git log --oneline --grep="handoff" -1 2>/dev/null | head -c 80)

  printf "${BOLD}🌿 Git${RESET}\n"
  printf "  Branch:        ${CYAN}%s${RESET}\n" "$BRANCH"
  printf "  Uncommitted:   " 
  if [ "$DIRTY" -eq 0 ]; then
    printf "${GREEN}clean${RESET}\n"
  else
    printf "${YELLOW}%s files${RESET}\n" "$DIRTY"
  fi
  printf "  Last commit:   ${GRAY}%s${RESET}\n" "$LAST_COMMIT"
  if [ -n "$LAST_HANDOFF" ]; then
    printf "  Last handoff:  ${DIM}%s${RESET}\n" "$LAST_HANDOFF"
  else
    printf "  Last handoff:  ${DIM}none yet${RESET}\n"
  fi
  printf "\n"
fi

# ─── Active changes (tasks.md прогрес) ────────────────────
printf "${BOLD}📋 Active changes${RESET}\n"

if [ ! -d "$CHANGES_DIR" ]; then
  printf "  ${DIM}docs/changes/ не існує${RESET}\n\n"
else
  FOUND=0
  # Сортування за датою у назві (YYYY-MM-DD-slug), нові перші
  for change_dir in $(ls -t "$CHANGES_DIR" 2>/dev/null | grep -v '^README' | grep -v '^archive'); do
    CHANGE_PATH="$CHANGES_DIR/$change_dir"
    TASKS_FILE="$CHANGE_PATH/tasks.md"
    [ ! -d "$CHANGE_PATH" ] && continue
    
    FOUND=$((FOUND + 1))

    if [ -f "$TASKS_FILE" ]; then
      DONE=$(grep -c "^- \[x\]" "$TASKS_FILE" 2>/dev/null | tr -d '\n' || echo 0)
      PENDING=$(grep -c "^- \[ \]" "$TASKS_FILE" 2>/dev/null | tr -d '\n' || echo 0)
      DONE=${DONE:-0}
      PENDING=${PENDING:-0}
      TOTAL=$((DONE + PENDING))
      
      if [ "$TOTAL" -eq 0 ]; then
        STATUS_LINE="$(printf "${DIM}no tasks${RESET}")"
        BAR_LINE="         "
      elif [ "$PENDING" -eq 0 ]; then
        STATUS_LINE="$(printf "${GREEN}COMPLETE${RESET}")"
        BAR_LINE="$(printf "${GREEN}█████████${RESET}")"
      else
        PERCENT=$((DONE * 100 / TOTAL))
        FILLED=$((DONE * 9 / TOTAL))
        EMPTY=$((9 - FILLED))
        FILLED_STR=""
        EMPTY_STR=""
        for i in $(seq 1 $FILLED); do FILLED_STR="${FILLED_STR}█"; done
        for i in $(seq 1 $EMPTY); do EMPTY_STR="${EMPTY_STR}░"; done
        BAR_LINE="$(printf "${YELLOW}${FILLED_STR}${EMPTY_STR}${RESET}")"
        STATUS_LINE="$(printf "${YELLOW}${DONE}/${TOTAL}${RESET} (${PERCENT}%%)")"
      fi
      
      printf "\n  ${BOLD}%s${RESET}\n" "$change_dir"
      printf "  %s  %s\n" "$BAR_LINE" "$STATUS_LINE"
      
      # Next task
      NEXT=$(grep -m1 "^- \[ \]" "$TASKS_FILE" 2>/dev/null | sed 's/^- \[ \]//; s/^ *//')
      if [ -n "$NEXT" ]; then
        printf "  ${CYAN}→${RESET} %s\n" "$NEXT"
      fi
      
      # Verbose — показати phases
      if [ "$VERBOSE" = true ]; then
        printf "\n"
        awk '
          function flush() {
            if (prev_phase != "" && p_total > 0) {
              if (p_done == p_total) printf "    \033[32m✓\033[0m %s (%d/%d)\n", prev_phase, p_done, p_total;
              else if (p_done == 0)  printf "    \033[90m○\033[0m %s (%d/%d)\n", prev_phase, p_done, p_total;
              else                   printf "    \033[33m◐\033[0m %s (%d/%d)\n", prev_phase, p_done, p_total;
            }
          }
          /^## / {
            flush();
            prev_phase = $0;
            sub(/^## /, "", prev_phase);
            p_done = 0; p_total = 0;
            next;
          }
          /^- \[x\]/ { p_done++; p_total++; }
          /^- \[ \]/ { p_total++; }
          END { flush(); }
        ' "$TASKS_FILE"
      fi
    else
      printf "\n  ${BOLD}%s${RESET}\n" "$change_dir"
      printf "  ${DIM}no tasks.md yet${RESET}\n"
    fi
  done
  
  if [ "$FOUND" -eq 0 ]; then
    printf "  ${DIM}no active changes${RESET}\n"
  fi
fi

printf "\n"

# ─── Hot state (перші 5 рядків контексту) ─────────────────
if [ -f "$HOT_FILE" ]; then
  printf "${BOLD}🔥 Hot state${RESET} ${DIM}(docs/state/hot.md)${RESET}\n"
  UPDATED=$(grep -m1 "^updated:" "$HOT_FILE" 2>/dev/null | sed 's/updated: //' || echo "?")
  printf "  Updated: ${GRAY}%s${RESET}\n" "$UPDATED"
  
  # Витягаємо секції "Де ми зараз" і "Наступні кроки"
  WHERE=$(awk '/^## Де ми зараз/,/^## /' "$HOT_FILE" | grep -v '^## ' | head -3 | sed 's/^/    /')
  NEXT=$(awk '/^## Наступні кроки/,/^## /' "$HOT_FILE" | grep -E '^[0-9]+\.' | head -3 | sed 's/^/    /')
  
  if [ -n "$WHERE" ]; then
    printf "  Where: \n%s\n" "$WHERE"
  fi
  if [ -n "$NEXT" ]; then
    printf "  Next:  \n%s\n" "$NEXT"
  fi
  printf "\n"
fi

# ─── Recent decisions ─────────────────────────────────────
if [ -f "$DECISIONS_FILE" ]; then
  RECENT_DECISIONS=$(grep -m3 "^## [0-9]" "$DECISIONS_FILE" 2>/dev/null | head -3)
  if [ -n "$RECENT_DECISIONS" ]; then
    printf "${BOLD}💡 Recent decisions${RESET} ${DIM}(docs/state/decisions.md)${RESET}\n"
    echo "$RECENT_DECISIONS" | sed 's/^## /  • /'
    printf "\n"
  fi
fi

# ─── Pipeline status (для active change який не completed) ────
if [ -n "$FOUND" ] && [ "$FOUND" -gt 0 ]; then
  # Знаходимо перший change з незакритими tasks
  ACTIVE_WORK=""
  for c in $(ls -t "$CHANGES_DIR" 2>/dev/null | grep -v '^README' | grep -v '^archive'); do
    [ -f "$CHANGES_DIR/$c/tasks.md" ] && \
      grep -q "^- \[ \]" "$CHANGES_DIR/$c/tasks.md" 2>/dev/null && \
      ACTIVE_WORK="$c" && break
  done
  
  if [ -n "$ACTIVE_WORK" ]; then
    printf "${BOLD}🚀 Pipeline${RESET} ${DIM}(active: %s)${RESET}\n" "$ACTIVE_WORK"
    STAGE1="${GRAY}1.Brainstorm${RESET}"
    STAGE2="${GRAY}2.Design${RESET}"
    STAGE3="${GRAY}3.Tasks${RESET}"
    
    [ -f "$CHANGES_DIR/$ACTIVE_WORK/prd.md" ] || [ -f "$CHANGES_DIR/$ACTIVE_WORK/proposal.md" ] && STAGE1="${GREEN}1.Brainstorm✓${RESET}"
    { [ -f "$CHANGES_DIR/$ACTIVE_WORK/design.md" ] || [ -f "$CHANGES_DIR/$ACTIVE_WORK/openapi.yaml" ]; } && STAGE2="${GREEN}2.Design✓${RESET}"
    [ -f "$CHANGES_DIR/$ACTIVE_WORK/tasks.md" ] && STAGE3="${GREEN}3.Tasks✓${RESET}"
    
    printf "  %s → %s → %s → 4.Implement → 5.Review → 6.Archive\n\n" \
      "$(printf "$STAGE1")" "$(printf "$STAGE2")" "$(printf "$STAGE3")"
  fi
fi

# ─── Help ─────────────────────────────────────────────────
printf "${DIM}─────────────────────────────────────────────────────${RESET}\n"
printf "${DIM}Commands:${RESET}\n"
printf "${DIM}  claude /start       — full ritual start with proposal${RESET}\n"
printf "${DIM}  claude /handoff     — end session, save state${RESET}\n"
printf "${DIM}  bash .claude/scripts/status.sh -v   — verbose mode${RESET}\n"
printf "\n"
