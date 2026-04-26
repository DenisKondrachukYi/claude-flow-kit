# Vault Bridge

Коли ти (Claude) потребуєш knowledge, якого нема у поточному проекті — НЕ читай vault напряму. Використовуй QMD як gatekeeper.

## Коли використовувати

- Користувач посилається на patterns з інших проектів ("як ми це робили у X?")
- Тобі треба concept з wiki (архітектурне рішення, API документація, learned pattern)
- Debug нагадує past issue

## Як використовувати

```bash
# Semantic query over vault
qmd query "<your question>" --collection vault --top-k 5

# Лише конкретний domain
qmd query "<question>" --collection vault --path "wiki/tools-agents/**"

# З recency boost (нові нотатки prioritized)
qmd query "<question>" --collection vault --recency 0.3
```

## Що робити з результатом

1. Read top 2-3 matches via Read tool (не більше — контекст обмежений)
2. Extract релевантний snippet
3. НЕ копіюй цілі файли назад у проект — лише apply learning

## Чого НЕ робити

- Glob/Read напряму у vault path — забруднює контекст
- Симлінк vault у проект — defeats isolation
- Full dump of wiki/<domain>/ — token waste

## Path to vault

Vault path визначено у `~/.claude/CLAUDE.md` (global). У типовому setup:
`/Users/<you>/Library/Mobile Documents/com~apple~CloudDocs/ObsidianVault/`
