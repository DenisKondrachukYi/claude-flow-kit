# Settings Variants

Stack-specific версії `settings.json`. Installer (`install.sh`) автоматично визначає stack і копіює відповідний variant у `.claude/settings.json`.

| File | Для чого |
|---|---|
| `nextjs.json` | Next.js / React / TypeScript (pnpm) |
| `node-typescript.json` | Generic Node.js backend (Fastify/Hono/Express) |
| `python.json` | FastAPI / Django / Flask (uv + ruff + mypy + pytest) |
| `go.json` | Go (golangci-lint + go test -race) |

Кожен variant містить:
- `cleanupPeriodDays: 99999`
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: 1`
- Stack-specific `Stop` hook (tests + lint + typecheck)
- Stack-specific `allow/deny` permissions
- Powerline status line

## Як застосувати вручну

```bash
cp .claude/settings-variants/nextjs.json .claude/settings.json
# або python.json, go.json, node-typescript.json
```

## Додавання нового stack

1. Скопіюй `nextjs.json` як шаблон
2. Заміни `Stop` hook command на твій stack
3. Додай stack-specific permissions у `allow`
4. Назви файл `<stack>.json`
5. Додай detection в `install.sh` (`if [ -f "<marker>" ]; then STACK="<stack>"`)
6. Додай stack у `case "$STACK"` блоки
