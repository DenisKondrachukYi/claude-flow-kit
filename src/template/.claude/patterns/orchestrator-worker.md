# Orchestrator-Worker Pattern

Використовуй коли: задача розбивається на N незалежних підзадач, які можуть виконуватись паралельно.

## Mechanic

1. Ти — orchestrator. Не пиши код сам.
2. Decompose задачу на 3-7 незалежних subtasks.
3. Для кожного subtask викликай `Task` tool з fresh subagent (general-purpose).
4. Кожен subagent отримує повний контекст саме для свого subtask (anti-telephone game).
5. Коли всі повертаються — synthesize результати у coherent output.

## Critical rules

- **Independent subtasks only.** Якщо B depends on A — НЕ паралель.
- **File-disjoint.** Два subagents не пишуть у той самий файл.
- **Each subagent's context < 200k.** Не роздувай prompt; pass тільки релевантне.
- **Return structured summaries**, не full file dumps.

## Template prompt для orchestrator

```
I will orchestrate this task. I will NOT write code myself.

Decomposition:
- Subtask 1: [what, which files, expected output]
- Subtask 2: [...]
- Subtask N: [...]

Parallelism check: Are all subtasks truly independent? [yes/no]
File disjoint check: [list file sets per subtask]

Dispatching N subagents via Task tool in a single turn.
After all return, I synthesize findings.
```

## Anti-patterns

- Orchestrator пише код сам замість делегувати → marнує token budget
- Sequential dispatch одного за одним → втрачаєш parallelism
- Один massive subagent з 10 responsibilities → fresh context марнується
