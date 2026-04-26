# Specs

Living specs — документи, що описують ЯК реально працює кожен capability (модуль/фіча) після імплементації.

## Структура

Один capability = одна папка:

```
specs/
├── auth/
│   └── spec.md
├── payments/
│   └── spec.md
└── notifications/
    └── spec.md
```

## Коли створюється spec

Після того, як capability проходить через повний цикл:

1. `brainstorming` → design
2. `openspec-proposal-creation` → `docs/changes/<name>/`
3. Імплементація
4. `openspec-archiving` → оновлення цього `specs/<name>/spec.md`

## Формат spec.md

```markdown
# <Capability Name>

## Що робить
<1-2 речення>

## Як використовувати
<Публічний API: функції, компоненти, ендпоінти, події>

## Залежності
<Від яких інших capabilities залежить>

## Обмеження
<Що НЕ робить, edge cases, performance limits>

## Internal design (опційно)
<Тільки якщо когось цікавлять внутрішні деталі>
```

## Правило

Spec — джерело істини для ПОВЕДІНКИ, не реалізації. Якщо реалізація змінилась, але поведінка ні — spec не чіпаємо. Якщо поведінка змінилась — spec оновлюється через openspec-archiving.
