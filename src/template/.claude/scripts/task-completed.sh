#!/usr/bin/env bash
# TaskCompleted hook — quality gate before task is marked done
# Exit 2 blocks completion with feedback to the agent
# Customize the command per project (npm test, pytest, go test, etc.)

set -e

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
  # Node.js project
  if [ -n "$(jq -r '.scripts.test // empty' package.json 2>/dev/null)" ]; then
    npm test --silent 2>&1 | tail -20
  fi
  if [ -n "$(jq -r '.scripts.lint // empty' package.json 2>/dev/null)" ]; then
    npm run lint --silent 2>&1 | tail -10
  fi
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  # Python project
  if [ -x "$(command -v pytest)" ]; then
    pytest --quiet 2>&1 | tail -20
  fi
  if [ -x "$(command -v ruff)" ]; then
    ruff check . 2>&1 | head -10
  fi
elif [ -f "go.mod" ]; then
  # Go project
  go vet ./... 2>&1 | tail -10
  if [ -x "$(command -v golangci-lint)" ]; then
    golangci-lint run ./... 2>&1 | tail -10
  fi
  go test ./... 2>&1 | tail -10
fi

# Hook exits 0 on success. Exit 2 + message = block task completion.
exit 0
