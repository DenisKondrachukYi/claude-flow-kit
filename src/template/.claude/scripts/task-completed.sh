#!/usr/bin/env bash
# TaskCompleted hook — quality gate before task is marked done
# Exit 2 blocks completion with feedback to the agent
# Customize the command per project (npm test, pytest, go test, etc.)

set -euo pipefail
# pipefail required so `cmd | tail` does not swallow cmd's failure (G5).

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
  # Node.js project
  if command -v jq >/dev/null 2>&1 && [ -n "$(jq -r '.scripts.test // empty' package.json 2>/dev/null)" ]; then
    if ! npm test --silent 2>&1 | tail -20; then
      exit 2
    fi
  fi
  if command -v jq >/dev/null 2>&1 && [ -n "$(jq -r '.scripts.lint // empty' package.json 2>/dev/null)" ]; then
    if ! npm run lint --silent 2>&1 | tail -10; then
      exit 2
    fi
  fi
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  # Python project
  if command -v pytest >/dev/null 2>&1; then
    if ! pytest --quiet 2>&1 | tail -20; then
      exit 2
    fi
  fi
  if command -v ruff >/dev/null 2>&1; then
    if ! ruff check . 2>&1 | head -10; then
      exit 2
    fi
  fi
elif [ -f "go.mod" ]; then
  # Go project
  if ! go vet ./... 2>&1 | tail -10; then
    exit 2
  fi
  if command -v golangci-lint >/dev/null 2>&1; then
    if ! golangci-lint run ./... 2>&1 | tail -10; then
      exit 2
    fi
  fi
  if ! go test ./... 2>&1 | tail -10; then
    exit 2
  fi
fi

# Hook exits 0 on success. Exit 2 + message = block task completion.
exit 0
