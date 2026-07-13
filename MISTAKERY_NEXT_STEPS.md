# Mistakery Reigns-like Core — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Превратить работающий full-run vertical slice в устойчивую Reigns-like систему, не переписывая карточки раньше времени.

**Architecture:** Сохраняем утверждённый onboarding и причинные основы Agents/Padel. Добавляем минимальный scheduler с тремя режимами продолжения — forced, weighted и ambient — после чего решения, active arc, flags и ресурсы начинают реально влиять на следующие события.

**Tech Stack:** `cards.json`, `game.js`, Node.js test runner, Playwright, проектный `audit-deck.cjs`.

---

## Главный порядок работы

1. Логика и scheduler.
2. Структура Agents и Padel.
3. Тексты карточек.
4. Ресурсы и баланс.
5. Финальный full-run review.

Порядок не менять. До этапа 3 не редактировать английский текст карточек.

## Постоянные ограничения

- Игрок — фаундер B2BuyerSpyer.
- На старте нет пользователей, клиентов и оплат.
- 814 компаний — prospects самого B2BuyerSpyer.
- Победа — только настоящий paid invoice или paid pilot.
- `Customers` не переименовывать.
- Внутренние действия не увеличивают `Customers`.
- Cash растёт только от оплаты, инвестиций или явной экономии.
- Не добавлять новые арки, метапрогрессию и новые ресурсы на этом этапе.

---

## Этап 0. Зафиксировать рабочую базу

**Файлы:**
- Проверить: `cards.json`
- Проверить: `game.js`
- Проверить: `tests/*.test.cjs`

### Шаги

1. Запустить анализатор:

```bash
node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json
```

Ожидаемая база: `0 errors`, `10 warnings` про same-next choices.

2. Запустить logic/content/offline tests:

```bash
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs tests/offline.test.cjs
```

Ожидаемая база: `39 pass`, `0 fail`.

3. Запустить browser smoke tests с локальным сервером.

**Готово, когда:** текущий full-run воспроизводимо проходит Agents и Padel, а результаты сохранены как baseline.

---

## Этап 1. Минимальный adaptive scheduler

**Файлы:**
- Изменить: `game.js`
- Изменить: `cards.json`
- Изменить: `tests/engine.test.cjs`
- Изменить: `tests/content.test.cjs`

### Шаг 1. Сначала написать failing tests

Добавить отдельные тесты:

- forced continuation нельзя прервать pressure card;
- weighted continuation строит eligible pool;
- `activeArc` повышает вес карт своей арки;
- `requires` и `excludes` убирают нелогичные карты;
- показанная once-per-run карта не повторяется;
- ambient card не появляется два раза подряд;
- пустой pool имеет безопасный fallback и не создаёт dead end.

Запустить:

```bash
node --test tests/engine.test.cjs
```

Ожидаемый результат: новые тесты падают, потому что функций ещё нет.

### Шаг 2. Добавить минимальную модель

Поддержать в данных только необходимые поля:

```json
{
  "continuation": "forced | weighted | ambient",
  "requires": ["flag"],
  "excludes": ["flag"],
  "weight": 1,
  "arc": "agents | padel",
  "oncePerRun": true
}
```

Не добавлять cooldown, urgency и сложные формулы, пока их необходимость не доказана тестом.

### Шаг 3. Подключить state к выбору карты

Scheduler должен учитывать:

- `activeArc`;
- flags прошлых решений;
- `shown`;
- текущий ресурсный диапазон;
- forced continuation;
- запрет последовательных ambient cards.

### Шаг 4. Прогнать тесты

```bash
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs
```

**Готово, когда:** следующая story card больше не всегда определяется только `choice.next`, а forced пары остаются полностью детерминированными.

---

## Этап 2. Перестроить структуру Agents и Padel

**Файлы:**
- Изменить: `cards.json`
- Изменить: `tests/content.test.cjs`
- Изменить: `tests/balance.test.cjs`

Тексты пока не менять. Менять только flags, triggers, continuation, eligibility и маршруты.

### Agents

Сохранить обязательный позвоночник:

```text
AGENT_01 → AGENT_02_DEV → AGENT_03_HYPE → AGENT_04_LEAD
→ AGENT_05_ORDER → AGENT_06_LEGAL → paid/free endings
```

Защитить как forced:

- `AGENT_04_LEAD → AGENT_05_ORDER`;
- `AGENT_05_ORDER → AGENT_06_LEGAL`;
- `AGENT_06_LEGAL → AGENT_07_*`.

Добавить память минимум для решений:

- `AGENT_01`: properly / tonight;
- `AGENT_03_HYPE`: boost / disclaimer;
- `AGENT_04_LEAD`: call / quote;
- `AGENT_05_ORDER`: promise / procurement.

Каждый flag должен изменить хотя бы один callback, эффект будущей карты или eligibility. Мёртвые flags запрещены.

### Padel

Сохранить forced пары:

- `PADEL_01 → PADEL_02`;
- `PADEL_04_CHOICE → PADEL_05_WIN/LOSE`;
- `PADEL_05_WIN → PADEL_06_PILOT/WAR`.

Сделать `PADEL_03_TEAM` запоминаемым:

- prep pilot должен помочь paid-pilot пути;
- pack repo должен изменить acquisition путь.

Отказы на `PADEL_01` и `PADEL_02` должны по-прежнему действительно переключать игру на Agents.

### Проверка

Добавить deterministic playthrough tests для всех основных endings и callback tests для новых flags.

**Готово, когда:** анализатор больше не сообщает same-next-without-future-state для ключевых story choices, а обе арки остаются причинно понятными.

---

## Этап 3. Pressure и callbacks

**Файлы:**
- Изменить: `cards.json`
- Изменить: `game.js`
- Изменить: `tests/engine.test.cjs`
- Изменить: `tests/balance.test.cjs`

### Шаги

1. Разрешать pressure только в `ambient` или явно безопасных `weighted` паузах.
2. Не вставлять pressure между срочным вопросом buyer и его непосредственным последствием.
3. Сделать pressure совместимым с текущим миром и активной аркой.
4. Сохранить запрет повторов и двух pressure подряд.
5. Сохранить `PRESS_CAPITALISM` как delayed callback после настоящего deploy.
6. Проверить, что `PRESS_FAMILY` не создаёт бесплатного пользователя раньше события, которое действительно открыло продукт людям.

**Готово, когда:** pressure ощущается частью текущего run, а не отдельной случайной шуткой.

---

## Этап 4. Только теперь исправить тексты

**Файлы:**
- Изменить: `cards.json`
- Пересобрать: `cards.bundle.js`
- Пересобрать: `MISTAKERY_CARDS_EN_RU.md`

Первый список для проверки:

- `AGENT_01`: текст должен предлагать те действия, которые есть на кнопках;
- `AGENT_04_LEAD`: не называть serious lead состоявшимся buyer слишком рано;
- `AGENT_03_HYPE`, `AGENT_05_ORDER`, `PADEL_03_TEAM`: текст должен отражать добавленную память решений;
- `PADEL_06_PILOT`: ясно различить approved pilot и фактическую оплату;
- onboarding: проверить понимание prospects, продукта и цели без изменения утверждённого смысла.

Каждую карточку редактировать только после записи её causal state, sender motive и ожидаемых последствий кнопок.

**Готово, когда:** три ручных прохождения — naive, resource optimizer и founder role-play — не обнаруживают систематического непонимания.

---

## Этап 5. Ресурсы, crises и баланс

**Файлы:**
- Изменить: `cards.json`
- Изменить: `tests/balance.test.cjs`

### Шаги

1. Запустить минимум 10 000 seeded simulations.
2. Считать результаты отдельно по выбранной арке.
3. Проверить достижимость всех задуманных resource edges.
4. Убедиться, что один случайный кризис не доминирует над стратегией.
5. Решить отдельно судьбу `freedom_sale`: paid invoice не должен переставать быть фактом из-за случайного rescue roll.
6. Настроить эффекты только после проверки narrative причин.

Временные ориентиры, которые надо подтвердить playtest, а не считать законами Reigns:

- run: примерно 12–20 решений;
- win rate: примерно 20–35%;
- отсутствие одного кризиса, который забирает непропорционально большую долю runs;
- обе основные арки имеют воспроизводимый paid path.

**Готово, когда:** игрок понимает причину проигрыша, а стратегия заметно влияет на outcome distribution.

---

## Этап 6. Финальный Direction Review

Запустить:

```bash
node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs tests/offline.test.cjs
```

Затем провести минимум три полных ручных прохождения и browser smoke test.

## Финальное Definition of Done

- Onboarding по-прежнему понятен и ведёт в обе арки.
- Agents и Padel имеют ясный paid path.
- Forced causal pairs не разрываются.
- `activeArc`, flags и ресурсы реально влияют на следующий контент.
- Ключевые решения имеют callbacks или меняют будущие события.
- Pressure не повторяется и соответствует текущему миру.
- Нет dead ends и технических preview endings.
- Analyzer не имеет errors и не сообщает ложные ключевые choices.
- Все automated и browser tests проходят.
- Только после этого можно начинать новый цикл расширения контента.
