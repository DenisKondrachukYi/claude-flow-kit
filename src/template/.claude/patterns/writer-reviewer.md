# Writer-Reviewer Pattern

Використовуй коли: quality матеріалу критичний (production code, public APIs, PRs).

## Mechanic

1. **Writer subagent** implements fresh — не знає про попередні attempts.
2. **Reviewer subagent** читає тільки diff — не знає intent, лише результат.
3. Reviewer повертає findings у JSON.
4. Якщо є must-fix → loop до writer з feedback.
5. Max 3 raunds, інакше escalate до людини.

## Чому окремі контексти

Writer tunnel-visions на своєму коді. Fresh reviewer ловить те, що автор не бачить — mindset of first reader.

## Template

```
Phase 1 — Writer:
Task(description="Implement X",
     subagent_type="general-purpose",
     prompt="Implement [feature]. Follow @docs/project/structure.md.
             Write tests. Return: list of files changed + summary.")

Phase 2 — Reviewer:
Task(description="Review X",
     subagent_type="general-purpose",
     prompt="You have NO context about what I wanted — only what was built.
             Review diff from writer. Check:
             - Alignment with @docs/project/structure.md
             - Error handling, edge cases
             - Tests coverage of new logic
             Return JSON: {must_fix:[], should_fix:[], nit:[], ok:[]}")

Phase 3 — Decision:
If must_fix non-empty → loop to Writer with feedback.
Max 3 rounds. Otherwise escalate.
```

## Anti-patterns

- Reviewer знає intent → biased toward author's approach
- Writer та reviewer в одній сесії → shared context defeats purpose
- Loop без limit → infinite iteration
