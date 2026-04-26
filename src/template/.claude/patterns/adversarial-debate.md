# Adversarial Debate Pattern

Використовуй коли: architectural decision з trade-offs, де single-perspective reasoning biased.

## Mechanic

1. **Proposer subagent** захищає підхід A.
2. **Critic subagent** атакує підхід A, захищає B.
3. Loop N rounds (звичайно 2-3) з updated claims.
4. **Judge subagent** читає весь dialogue і робить рекомендацію.
5. Ти бачиш summary і приймаєш фінальне рішення.

## Чому це працює

Single agent reasoning often anchors на перший плавзибельний підхід. Adversarial structure forces explicit trade-off analysis.

## Template

```
Task(description="Round 1 Proposer",
     prompt="You defend: [approach A]. List 3 strongest arguments.
             Then anticipate 2 critiques.")

Task(description="Round 1 Critic",
     prompt="You attack [approach A], defend [approach B].
             Read proposer's arguments from @.cache/round1-proposer.md.
             List 3 strongest counter-arguments.")

[Round 2 — both update with opponent's claims]

Task(description="Judge",
     prompt="Read @.cache/round1-*.md and @.cache/round2-*.md.
             Recommend: A, B, or hybrid, with reasoning.
             Flag remaining uncertainties for human decision.")
```

## Коли НЕ використовувати

- Простий choice де один варіант явно кращий — overkill
- Нема реального trade-off — просто unknown facts; краще research
- Tight deadline — дебат втратить toky без proportional gain

## Anti-patterns

- Один agent грає обидві ролі — collapses to single POV
- Debate без judge → endless argument
- >3 rounds — diminishing returns
