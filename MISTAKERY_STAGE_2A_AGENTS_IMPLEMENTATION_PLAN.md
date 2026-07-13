# Mistakery Stage 2A Agents Pool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Реализовать утверждённый расширенный пул Agents с 2–4 новыми consequence-картами за завершённый Agents run, сохранив paid truth, причинный позвоночник, текущий UI и лимит `maxTurns: 24`.

**Architecture:** Два choice-specific последствия идут принудительно сразу после `AGENT_01` и `AGENT_02_DEV`, а shared и post-hype cards выбираются только в отдельных weighted-окнах. Большинство последствий применяет ресурсы немедленно на видимой consequence-карте; два действительно отложенных случая получают короткую условную строку вместе с эффектом, а therapy live возвращается отдельной видимой `PRESS_CAPITALISM`. Скрытые resource modifiers без видимого объяснения запрещены.

**Tech Stack:** vanilla JavaScript, JSON deck, CommonJS, `node:test`, проектный analyzer, Playwright browser smoke.

---

## Статус и ограничения

- Этот файл — только implementation plan. На этапе его подготовки `game.js`, `cards.json`, тесты и английский card copy не меняются.
- Канонический проект: `/Users/Newschxxl/Desktop/Mistakery Игра/mistakery`.
- В проекте нет Git metadata. Не инициализировать Git и не добавлять в выполнение шаги с commit; checkpoint — это подтверждённый RED/GREEN и сохранённый отчёт тестов.
- Перед фактическим добавлением восьми карточек нужен отдельный утверждённый English copy packet. Если его нет, выполнение останавливается перед Task 4.
- Не добавлять новые арки, ресурсы, персонажей, метапрогрессию или новые типы финалов.
- `Customers` не переименовывать. Internal/self-generated activity не увеличивает Customers. Cash растёт только из оплаты, инвестиций или явно описанной экономии.

## Свежий production baseline

Проверено 12 июля 2026 до подготовки плана:

- analyzer: `0 errors`, `10 warnings`;
- logic/content/balance/offline: `54/54 PASS`;
- 10,000 seeded runs: длина `9–19`, средняя `15.05`, `no_proof` из-за лимита ходов — `0`;
- `maxTurns: 24`, `maxPressureCards: 4`;
- production flags: только `agents_public` и `empathy_deployed`;
- `AGENT_01` и `AGENT_05_ORDER` сейчас открывают pressure windows; после реализации эти окна переносятся в безопасные consequence-слоты, а цепочка после serious lead становится forced.

## Решения, зафиксированные перед реализацией

### 1. Канонический словарь flags

Правило именования:

- `empathy_*` — состояние самого empathy patch;
- `agents_*` — состояние Agents arc, funnel и видимых callbacks;
- существующие production flags не дублируются новым синонимом;
- direct `choice.next` используется вместо routing flag везде, где выбор уже однозначно ведёт к своей карточке;
- callback flag разрешён только если он приводит к отдельной карточке или условной строке, которую увидит игрок;
- lifecycle flag не добавляется, если тот же порядок гарантируется списком next-candidates и `oncePerRun`.

#### Сохраняемые production flags

| Flag | Значение | Reader | Очистка |
| --- | --- | --- | --- |
| `agents_public` | Агенты стали внешне видимы через live deploy или demo | `PRESS_FAMILY` | До конца run |
| `empathy_deployed` | Patch реально развёрнут в production | `PRESS_CAPITALISM` | До конца run |

#### Замена рабочих имён утверждённой схемы

| Рабочее имя схемы | Production-решение | Причина |
| --- | --- | --- |
| `agents_build_proper`, `agents_ship_tonight` | Не создавать | Build и Ship имеют разные forced next cards |
| `agents_patch_deployed` | Использовать существующий `empathy_deployed` | Нужен только для live callback |
| `agents_demo_published` | Не создавать | Demo имеет собственный direct next |
| `agents_post_boosted`, `agents_disclaimer_added` | Не создавать | У Hype разные next-candidate lists |
| `agents_*_consequence_seen` | Не создавать | Shared slot существует только в next list конкретного consequence |
| `agents_serious_lead` | Не создавать | После Lead вся оставшаяся цепочка forced |
| UI, CI, Demo, Testimonial и Risk choice flags | Не создавать | Их дополнительные эффекты разрешаются немедленно на видимой исходной карточке |

#### Итоговый набор новых flags

| Flag | Видимое последствие | Reader / очистка |
| --- | --- | --- |
| `agents_shared_seen` | После первой shared-card в этом run вторая shared-card больше не появляется | Eligibility второй shared slot; до конца run |
| `agents_therapy_live` | Гарантирует отдельную видимую `PRESS_CAPITALISM` после Hype | `PRESS_CAPITALISM`; очистить на ней |
| `agents_training_internal` | Добавляет одну короткую privacy-строку и связанный effect на `AGENT_06_LEGAL` | Legal; очистить после выбора |
| `agents_inbound_qualified` | Добавляет на Lead строку о budget/volume/deadline signal `@head_of_agile` | `AGENT_04_LEAD`; очистить после выбора |
| `agents_pipeline_padded` | Добавляет на Lead строку о том, что из recruiter noise реальным оказался только `@head_of_agile` | `AGENT_04_LEAD`; очистить после выбора |

Итого: пять новых flags вместо первоначально запланированных двадцати с лишним. Каждый из них меняет то, что игрок реально видит: состав run или строку следующей карточки.

### 2. Видимая модель всех modifiers

Для каждого ранее запланированного modifier выбран ровно один канал объяснения.

| Source choice | Канал | Где игрок видит причину и effect | Flag |
| --- | --- | --- | --- |
| Dataset → licensed data | Немедленный effect | На `AGENT_C_DATASET` после выбора | нет |
| Dataset → internal chats | Условная строка | Одна privacy-строка на `AGENT_06_LEGAL`; effect применяется только вместе с этой строкой | `agents_training_internal` |
| Emotional UI → text-only | Немедленный effect | На `AGENT_C_EMOTIONAL_UI` | нет |
| Emotional UI → animated tears | Немедленный effect | На `AGENT_C_EMOTIONAL_UI` | нет |
| Apology CI → rerun tests | Немедленный effect | На `AGENT_C_APOLOGY_CI` | нет |
| Apology CI → accept apologies | Немедленный effect | На `AGENT_C_APOLOGY_CI` | нет |
| Prospect Therapy → redirect | Немедленный effect | На `AGENT_C_PROSPECT_THERAPY` | нет |
| Prospect Therapy → keep therapy | Отдельная callback-card | `PRESS_CAPITALISM` после Hype | `agents_therapy_live` |
| Demo Loop → rate-limit | Немедленный effect | На `AGENT_C_DEMO_LOOP` | нет |
| Demo Loop → leave open | Немедленный effect | На `AGENT_C_DEMO_LOOP` | нет |
| Self-Testimonial → delete | Немедленный effect | На `AGENT_C_SELF_TESTIMONIAL` | нет |
| Self-Testimonial → use | Немедленный effect | На `AGENT_C_SELF_TESTIMONIAL` | нет |
| Recruiter Pipeline → qualify | Условная строка | Одна causal строка на `AGENT_04_LEAD` | `agents_inbound_qualified` |
| Recruiter Pipeline → count everyone | Условная строка | Одна corrective строка на `AGENT_04_LEAD` | `agents_pipeline_padded` |
| Risk Appendix → disclose | Немедленный effect | На `AGENT_C_RISK_APPENDIX` | нет |
| Risk Appendix → bury | Немедленный effect | На `AGENT_C_RISK_APPENDIX` | нет |

Bare `conditionalEffects` полностью запрещены. Отложенный effect оформляется только через `visibleCallbacks`, где непустая `line` и effect являются одной атомарной записью. Немедленный effect должен иметь причинный `effect_reason` на той же source card.

### 3. Как Hype и Legal избегают перегрузки

`AGENT_03_HYPE` больше не агрегирует resource callbacks. UI, demo и testimonial choices уже дали видимый немедленный результат на своих карточках. Hype отвечает только за своё основное решение и post-hype weighted window:

- Boost предлагает Recruiter Pipeline или прямой Lead;
- Disclaimer предлагает Risk Appendix или прямой Lead;
- при `agents_therapy_live` due `PRESS_CAPITALISM` имеет приоритет, а branch-specific card пропускается.

Поэтому в Hype нет conditional paragraphs, скрытых modifiers или комбинационного взрыва.

`AGENT_06_LEGAL` может получить максимум один delayed callback: `agents_training_internal`. При нём к базовому legal message добавляется одна короткая privacy-строка, и только вместе с ней применяется небольшой resource modifier. Все UI, testimonial и risk effects уже разрешены на видимых source cards. Legal по-прежнему задаёт только основной выбор `Remove souls / Keep sentient`, а callback не меняет next.

`AGENT_04_LEAD` также показывает максимум одну условную строку: qualified или padded. Эти flags взаимоисключающие и появляются только после Recruiter Pipeline.

### 4. Решение по длине run и `maxTurns`

`maxTurns` остаётся равным `24`. Его нельзя повышать автоматически.

Расчёт верхней границы после перестройки:

- onboarding: 6 решений;
- максимальный Padel detour до перехода в Agents: 2 решения;
- основной Agents spine с длинным invoice→donate путём: 8 решений;
- новые consequence cards: максимум 4;
- безопасные pressure windows в таком маршруте: максимум 3, потому что `AGENT_05_ORDER` становится forced;
- теоретический максимум: `6 + 2 + 8 + 4 + 3 = 23`.

Это оставляет один ход до hard cap. Если фактический детерминированный тест получает 24 или `no_proof`, нельзя просто поднять `maxTurns`: сначала убрать лишнее ambient window или снизить optional coverage и вернуть изменение на review.

Гарантия «минимум две consequence-карты» относится к run, который не оборвался resource crisis до `AGENT_03_HYPE`. Любой завершивший pre-lead Agents spine run обязан показать ровно 2–4 новых cards.

---

## Порядок реализации

### Task 1: Добавить только видимые conditional callbacks — TDD

**Files:**

- Modify: `tests/engine.test.cjs:1-443`
- Modify: `game.js:95-112, 229-240, 400-428`
- Modify: `app.js:74-107`
- Modify: `tests/browser-smoke.cjs`

**Step 1: написать failing engine tests**

Добавить fixture card с одним совпавшим `visibleCallbacks` entry:

```json
"visibleCallbacks": [
  {
    "id": "internal_training_privacy",
    "when": { "all": ["agents_training_internal"] },
    "line": "<approved short callback line>",
    "effects": { "team": -1 },
    "effect_reason": { "team": "<approved reason>" }
  }
]
```

Проверить:

- callback line добавляется к message только при совпавшем flag;
- callback effect применяется только в том же состоянии, где показана line;
- callback без непустой `line` отклоняется validation/content test;
- на одной карточке Stage 2A показывается максимум одна callback line;
- `baseCashBurn` списывается ровно один раз;
- условия читают flags до `clearFlags` текущего choice;
- отсутствие `visibleCallbacks` сохраняет старое поведение;
- preview подсвечивает базовые и активные callback resources.

**Step 2: подтвердить правильный RED**

Run:

```bash
node --test tests/engine.test.cjs
```

Expected: новые тесты FAIL, потому что движок не умеет выбирать callback line и связывать её с effect.

**Step 3: минимальная реализация**

Вынести общий matcher для `all / any / none`, переиспользовать его в card triggers и `visibleCallbacks.when`. Добавить:

- `getCardText(card, state)`, который возвращает base lines плюс совпавшую короткую line;
- `applyEffects(deck, state, card, choice)`, который добавляет общий callback effect к любой стороне только при показанной line;
- `getAffectedResources(card, choice, state)` для state-aware preview.

`app.js` рендерит результат `getCardText(card, app.state)` и передаёт card в preview, не создавая отдельный UI-компонент. Не добавлять новый глобальный state или новый callback queue. Bare hidden conditional effects не поддерживать.

**Step 4: подтвердить GREEN**

Run:

```bash
node --test tests/engine.test.cjs tests/browser-smoke.cjs
```

Expected: PASS; обычные карточки выглядят как раньше, callback card укладывается максимум в четыре строки, preview объяснимо совпадает с видимой строкой.

**Checkpoint A:** остановиться, если conditional line не помещается в четыре визуальные строки или требует менять layout.

### Task 2: Научить analyzer различать immediate и visible delayed consequences — TDD

**Files:**

- Modify: `.agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs`
- Modify: `.agents/skills/reigns-like-narrative-design/tests/fixtures/broken-deck.json`
- Modify: `.agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs:36-82`
- Modify: `tests/content.test.cjs:281-290`

**Step 1: написать failing tests**

Добавить fixtures для:

- `card.requires`;
- `card.excludes`;
- `card.visibleCallbacks[].when.all/any/none`;
- consequence card с `consequenceResolution: "immediate"` и различимыми effects;
- ошибочного visible callback с effects, но без line.

Проверить, что visible callback flag не считается unused, настоящий orphan flag по-прежнему получает warning, а hidden effect without line получает error. `consequenceResolution: "immediate"` снимает future-state warning только если обе choices имеют причинные, различимые effects и полные `effect_reason`.

**Step 2: подтвердить RED**

Run:

```bash
node --test .agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs
```

Expected: FAIL, потому что analyzer не знает `visibleCallbacks` и explicit immediate resolution.

**Step 3: минимальная реализация**

Собирать readers из `trigger`, `requires`, `excludes` и `visibleCallbacks.when`. Аналогично расширить production content test на dead flags. `clearFlags` не считать reader.

Добавить правило analyzer:

- main decision без future state продолжает получать warning;
- consequence card может объявить `consequenceResolution: "immediate"`;
- такой marker валиден только при разных non-zero resource outcomes с полными reasons;
- `visibleCallbacks.effects` без `line` — error;
- callback line без effect допустима только как чисто narrative callback и должна быть явно отмечена `narrativeOnly: true`.

**Step 4: подтвердить GREEN**

Run:

```bash
node --test .agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs tests/content.test.cjs
```

Expected: PASS на baseline deck.

### Task 3: Зафиксировать structural contract новыми failing tests

**Files:**

- Modify: `tests/content.test.cjs:125-310`
- Modify: `tests/balance.test.cjs:45-137`

**Step 1: добавить exact-card-set tests**

Ожидать восемь новых IDs:

```text
AGENT_C_DATASET
AGENT_C_EMOTIONAL_UI
AGENT_C_APOLOGY_CI
AGENT_C_PROSPECT_THERAPY
AGENT_C_DEMO_LOOP
AGENT_C_SELF_TESTIMONIAL
AGENT_C_RECRUITER_PIPELINE
AGENT_C_RISK_APPENDIX
```

Для каждого проверить `arc: agents`, существующий source, `oncePerRun: true`, два choices, отсутствие новых resources/sources и корректный direct routing. Immediate cards обязаны иметь `consequenceResolution: "immediate"` и полные reasons.

**Step 2: добавить flag-vocabulary test**

Проверить точный новый flag set:

```text
agents_shared_seen
agents_therapy_live
agents_training_internal
agents_inbound_qualified
agents_pipeline_padded
```

И отсутствие удалённых aliases/лишних flags:

```text
agents_build_proper
agents_ship_tonight
agents_patch_deployed
agents_demo_published
agents_post_boosted
agents_disclaimer_added
serious_lead
agents_build_consequence_seen
agents_exposure_consequence_seen
agents_ui_tears
agents_demo_unlimited
agents_testimonial_used
agents_risk_disclosed
```

**Step 3: добавить routing invariants**

Проверить:

- Build всегда ведёт в Dataset, Ship — в Apology CI;
- Deploy всегда ведёт в Prospect Therapy, Demo — в Demo Loop;
- shared card входит только в next candidates соответствующего специфического consequence;
- `agents_shared_seen` блокирует вторую shared card;
- после `AGENT_04_LEAD` последовательность до `AGENT_07_*` forced и без ambient;
- post-hype branch card не обязателен и не входит в минимум двух consequences.
- every resource callback is immediate, a visible line, or a separate card; hidden-only effect отсутствует.

**Step 4: подтвердить правильный RED**

Run:

```bash
node --test tests/content.test.cjs tests/balance.test.cjs
```

Expected: FAIL на отсутствующих card IDs и старых переходах; baseline-утверждения про 8 Agents cards и старый weighted set также должны явно потребовать обновления.

### Task 4: Вставить восемь cards и перестроить guaranteed/weighted slots

**Prerequisite:** утверждённый English copy packet для всех восьми cards, labels, `actor_action`, `player_decision`, base effects и `effect_reason`. Без него остановиться; не писать временный или финальный copy внутри structural patch.

**Files:**

- Modify: `cards.json:107-163`
- Modify: `tests/content.test.cjs`
- Modify: `tests/balance.test.cjs`

**Routing/data contract:**

| Card | Как достигается | Continuation after choice | Flags produced |
| --- | --- | --- | --- |
| `AGENT_C_DATASET` | direct Build next | weighted candidates: Emotional UI or `AGENT_02_DEV` | only internal choice sets `agents_training_internal` |
| `AGENT_C_APOLOGY_CI` | direct Ship next | weighted candidates: Emotional UI or `AGENT_02_DEV` | none |
| `AGENT_C_EMOTIONAL_UI` | candidate exists only after Dataset/Apology; excludes shared seen | forced `AGENT_02_DEV` | `agents_shared_seen` |
| `AGENT_C_PROSPECT_THERAPY` | direct Deploy next | weighted candidates: Self-Testimonial or Hype | only keep therapy sets `agents_therapy_live` |
| `AGENT_C_DEMO_LOOP` | direct Demo next | weighted candidates: Self-Testimonial or Hype | none |
| `AGENT_C_SELF_TESTIMONIAL` | candidate exists only after Prospect/Demo; excludes shared seen | forced Hype | `agents_shared_seen` |
| `AGENT_C_RECRUITER_PIPELINE` | candidate exists only in Boost next list; excludes therapy live | forced Lead | qualified/padded |
| `AGENT_C_RISK_APPENDIX` | candidate exists only in Disclaimer next list; excludes therapy live | forced Lead | none |

Main card changes:

- `AGENT_01`: forced; left routes Dataset, right routes Apology CI; не ставит routing flags; remove old pressure window.
- `AGENT_02_DEV`: Deploy keeps production flags `empathy_deployed` + `agents_public` and routes Prospect Therapy; Demo keeps only `agents_public` and routes Demo Loop; remove old capitalism delay.
- Guaranteed consequence cards are weighted after their own resolution, so ambient/shared can occur only after the specific consequence.
- Core next cards use relative story weight `2`; optional shared/post-hype cards use weight `1`. Active-arc multiplier applies equally and does not change the ratio.
- `AGENT_05_ORDER`: set `continuation: forced`, remove `opensPressureSlot`; serious-lead spine cannot be interrupted.
- `AGENT_04_LEAD` и `AGENT_06_LEGAL` используют максимум по одной `visibleCallbacks` line; Hype не использует callbacks effects вообще.

**TDD sequence per pair:**

1. Make Dataset/Apology tests RED, add only these cards/routing, make GREEN.
2. Make Emotional UI slot tests RED, add shared eligibility, make GREEN.
3. Repeat for Prospect Therapy/Demo Loop.
4. Repeat for Self-Testimonial.
5. Repeat for Recruiter Pipeline/Risk Appendix.
6. Run content + engine tests after every pair.

### Task 5: Разрешить source effects немедленно и подключить post-hype window

**Files:**

- Modify: `cards.json` entries for all eight new cards, `AGENT_03_HYPE`, `AGENT_04_LEAD`
- Modify: `tests/engine.test.cjs`
- Modify: `tests/content.test.cjs`
- Modify: `tests/balance.test.cjs`

**Step 1: failing visibility tests**

Для каждого из 16 source choices из таблицы «Видимая модель всех modifiers» проверить ровно один выбранный канал. Immediate choices должны менять ресурс на исходной карточке и иметь полный `effect_reason`; delayed cases должны показывать line/card до применения effect.

Отдельно проверить, что Hype:

- не имеет `visibleCallbacks` и bare `conditionalEffects`;
- не читает UI/demo/testimonial flags;
- по-прежнему имеет разные Boost/Disclaimer resource outcomes;
- открывает разные post-hype candidate lists.

**Step 2: минимальные immediate effects**

Настроить эффекты на Dataset licensed, обеих UI choices, обеих CI choices, therapy redirect, обеих Demo choices, обеих Testimonial choices и обеих Risk choices. Точные значения минимальны и проходят semantic gates:

- internal/self-generated activity не повышает Customers;
- demo views/testimonial не дают Cash;
- Risk choice может менять доверие/нагрузку немедленно, но не изображает заключённую сделку;
- разные choices имеют различимые resource consequences;
- карточка помечается `consequenceResolution: "immediate"` только когда именно здесь полностью закрывается дополнительное последствие.

**Step 3: post-hype candidates**

- Boost напрямую предлагает weighted candidates Recruiter Pipeline / Lead.
- Disclaimer напрямую предлагает Risk Appendix / Lead.
- `AGENT_04_LEAD` остаётся первой карточкой, которая называет `@head_of_agile` serious lead.
- Recruiter `qualify` ставит `agents_inbound_qualified`; `count everyone` ставит `agents_pipeline_padded` и не повышает Customers за recruiters.
- `AGENT_04_LEAD` показывает ровно одну соответствующую causal line, применяет связанный effect и очищает оба inbound flags.
- Lead не ставит serious-lead flag: дальнейшая цепочка уже forced.

**Step 4: GREEN**

Run:

```bash
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs
```

### Task 6: Подключить единственный видимый Legal callback

**Files:**

- Modify: `cards.json` entry for `AGENT_06_LEGAL`
- Modify: `tests/engine.test.cjs`
- Modify: `tests/content.test.cjs`
- Modify: `tests/balance.test.cjs`

**Step 1: failing tests**

Создать два состояния: без internal training и с `agents_training_internal`. Проверить, что:

- без flag Legal показывает только base message и base effects;
- с flag добавляется ровно одна короткая privacy-line;
- связанный modifier применяется только вместе с этой line;
- итоговая карточка остаётся не длиннее четырёх строк;
- flag очищается после выбора;
- next по-прежнему зависит только от `Remove souls / Keep sentient`.

**Step 2: минимальный visible callback**

Добавить один `visibleCallbacks` entry на Legal. Modifier отражает privacy/team или procurement cost и не создаёт Cash/Customers из внутренней переписки. Не добавлять UI, testimonial или Risk callbacks на Legal: они уже разрешены немедленно на source cards.

Не создавать отдельные Legal variants или новый legal choice. Не менять paid/unpaid endings.

**Step 3: GREEN**

Run:

```bash
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs
```

### Task 7: Перенести `PRESS_CAPITALISM` в безопасный post-hype slot

**Files:**

- Modify: `cards.json` entries for `AGENT_02_DEV`, `AGENT_C_PROSPECT_THERAPY`, `AGENT_03_HYPE`, `PRESS_CAPITALISM`
- Modify: `tests/balance.test.cjs:102-122`
- Modify: `tests/content.test.cjs:244-297`

**Step 1: failing sequence tests**

Проверить точную последовательность:

```text
AGENT_02_DEV: Deploy
→ AGENT_C_PROSPECT_THERAPY: keep therapy
→ [optional pre-hype shared/ambient or direct]
→ AGENT_03_HYPE
→ PRESS_CAPITALISM
→ AGENT_04_LEAD
```

Дополнительно проверить:

- redirect не планирует и не показывает Capitalism;
- при therapy live Recruiter/Risk не показываются;
- Capitalism занимает один pressure slot и возвращает queued Lead;
- между Deploy и callback остаётся 2–5 решений;
- callback не может появиться после `AGENT_04_LEAD`.

**Step 2: минимальная data change**

- удалить `delay` из Deploy;
- keep therapy устанавливает `agents_therapy_live` и планирует `PRESS_CAPITALISM` с `delay.turns: 1`;
- Capitalism требует `empathy_deployed` + `agents_therapy_live`;
- оба ответа Capitalism очищают `agents_therapy_live`;
- Recruiter/Risk исключают `agents_therapy_live`, поэтому due callback queues только Lead.

Raw-правило «каждый delay должен быть 2–5» заменить observed-causality тестом. Здесь delay создаётся на consequence-карте, но причинный Deploy находится на два решения раньше; проверять нужно фактический gap от Deploy, а не локальное число в JSON.

**Step 3: GREEN**

Run:

```bash
node --test tests/content.test.cjs tests/balance.test.cjs
```

### Task 8: Проверить coverage, длину run и `maxTurns`

**Files:**

- Modify: `tests/balance.test.cjs`

**Step 1: consequence coverage tests**

Для каждого run, который дошёл до Hype и завершил Agents spine:

- число показанных новых consequence cards `>= 2` и `<= 4`;
- ровно одна из Dataset/Apology CI;
- ровно одна из Prospect Therapy/Demo Loop;
- не более одной shared card;
- не более одной post-hype branch card;
- все восемь новых cards никогда не появляются в одном run.

Добавить детерминированные сценарии с ровно 2, 3 и 4 новыми cards, чтобы все три длины были достижимы.

**Step 2: hard max-turn tests**

Добавить два worst-case scripts:

1. прямой Agents route: длинный invoice→donate ending, четыре новых cards и максимум доступных pressure slots; ожидать `history.length <= 21`;
2. Padel → отказ на втором шаге → Agents: тот же длинный путь; ожидать `history.length <= 23`.

Оба сценария должны завершаться narrative ending, а не `no_proof`. Все seeded runs должны удовлетворять `history.length <= deck.meta.maxTurns`.

**Step 3: 10,000 seeded simulation**

Run:

```bash
node --test tests/balance.test.cjs
```

Отчёт должен явно вывести/зафиксировать:

- min/max/average run length;
- Agents consequence distribution: 2 / 3 / 4;
- win rate;
- число `no_proof` из-за turn cap;
- max observed pressure cards;
- отсутствие repeated/consecutive pressure cards.

Acceptance:

- turn-cap `no_proof = 0`;
- observed max `<= 23`;
- все три consequence counts достижимы;
- сдвиг win rate более чем на 5 процентных пунктов от fresh pre-change baseline требует отдельного balance review, а не тихой правки `maxTurns` или ending effects.

### Task 9: Обновить generated views и провести полную verification

**Prerequisite:** утверждены English copy и соответствующая RU localization для новых карточек.

**Files:**

- Regenerate: `cards.bundle.js`
- Modify generator data, then regenerate: `MISTAKERY_CARDS_EN_RU.md`
- Modify if required: `scripts/build-card-catalog.cjs`
- Test: `tests/offline.test.cjs`
- Test: `tests/browser-smoke.cjs`

**Step 1: generated artifacts**

Run:

```bash
node scripts/build-offline-deck.cjs
node scripts/build-card-catalog.cjs
```

Не редактировать `cards.bundle.js` вручную.

**Step 2: analyzer**

Run:

```bash
node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json
```

Expected target: `0 errors`, `8 warnings`. Должны исчезнуть warnings `AGENT_01` и `AGENT_03_HYPE`; ожидаемо остаются OPEN_01, OPEN_03_AUDIT, OPEN_03_INVOICES, OPEN_04, OPEN_05, AGENT_04_LEAD, AGENT_05_ORDER, PADEL_03_TEAM. Новые warnings или unused flags — FAIL.

**Step 3: полный test suite**

Run:

```bash
node --test .agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs
node --test tests/engine.test.cjs tests/content.test.cjs tests/balance.test.cjs tests/offline.test.cjs
node --test tests/browser-smoke.cjs
```

Expected: полный PASS, offline deck равен `cards.json`, browser открывает и проходит обе основные routes.

Browser smoke дополнительно должен подтвердить, что conditional line появляется на Lead/Legal только при нужном flag, укладывается в четыре строки и исчезает в контрольном run без flag.

**Step 4: ручной narrative playtest**

Пройти минимум пять runs:

- Build + Demo + Disclaimer;
- Ship + Deploy + therapy live;
- Build + Deploy + redirect + Boost;
- run ровно с двумя consequences;
- Padel refusal → самый длинный Agents path.

Зафиксировать для каждого card order, число consequences, число ambient cards, ending и decisions survived. Для каждого resource change отметить видимую причину: source card, callback line или `PRESS_CAPITALISM`. Проверить, что serious lead начинается только на `AGENT_04_LEAD`, Customers не растут от recruiters/self-testimonial/internal work, а paid win происходит только через существующие paid endings.

## Финальный checkpoint перед заявлением о готовности

Использовать `superpowers:verification-before-completion`. В отчёте привести только свежие факты:

- список изменённых файлов;
- analyzer errors/warnings и IDs;
- точные test pass/fail totals;
- 10,000-run length/consequence/win statistics;
- результаты пяти manual playtests;
- подтверждение, что ни один callback effect не сработал без видимой строки или карточки;
- оставшиеся риски balance/copy;
- подтверждение, что `maxTurns` остался 24 и observed max не превысил 23.

После checkpoint остановиться. Не начинать старый Этап 2 или переработку Padel без нового утверждения.
