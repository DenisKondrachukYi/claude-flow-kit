---
description: Show dashboard of active changes, tasks progress, hot state, pipeline status
---

Запусти status dashboard щоб показати поточний стан проекту:

```bash
bash .claude/scripts/status.sh
```

Для детального view з phases усередині кожного change:

```bash
bash .claude/scripts/status.sh -v
```

Output показує:
- 🌿 Git state (branch, dirty files, last handoff commit)
- 📋 Active changes з progress bar і next pending task
- 🔥 Hot state (де ми, наступні кроки)
- 💡 Recent decisions
- 🚀 Pipeline stages (1-8 для /ship-full-stack-feature)

Після виведення status, якщо я бачу потенційні наступні дії — запропоную їх. Якщо у користувача є питання про state, відповім на основі output.
