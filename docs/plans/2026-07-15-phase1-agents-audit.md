# Фаза 1 — Аудит Agents-вертикального среза

Дата: 15 июля 2026. Ветка: `quality-prototype`. Baseline: 107 тестов зелёные.

Метод: рубрика `REIGNS_RUBRIC.md` + 4 библии + `REJECTED_PATTERNS.md`. Голоса/естественность — Fable. Структура/канон/воронка/scheduler — Opus. Анализатор `audit-deck.cjs`: 0 ошибок, 8 warnings.

Скоуп: онбординг `OPEN_01–06`, арка `AGENT_01–07`, Agents-side-stories (payroll, dev_hostage, b3), Agents-pressure (`PRESS_CAPITALISM`, `PRESS_FAMILY`).

Легенда: **FAIL** = нарушает канон/hard gate/нечитаемо. **WARN** = работает, но риск. `[S]` структура/канон, `[V]` голос/письмо. Многие карты имеют обе.

---

## Системные диагнозы (не привязаны к одной карте)

- **[S] SYS-1 — Весь прогон = одна арка без живой рамки и гейтинга.** `AGENT_01→06` — единственный `next` на каждом шаге; `continuation: weighted` у `AGENT_01/03` тасует только вставку ambient/side-карт, не сам спайн. `activeArcWeightMultiplier` ×3 есть в движке (`game.js:266`), но действовать ему не на что: спайн форсирован, `PRESS_*` без поля `arc`. **Уточнение после лока Варианта B:** forced-цепочка сама по себе НЕ баг — непосредственные последствия и должны быть встык. Баг в том, что склеена ВСЯ арка (включая свободные биты 1–3) и нет условного гейтинга, поэтому рамка не тасуется и прогоны не различаются. Рубрика §7.2, §8.3, §11.3 → FAIL. Фиксится флаг-гейтингом в Фазе 2 (см. `phase2-engine-plan`).
- **[S] SYS-2 — Диспропорция машинерии.** `boundaries` + `protectedPairs` + `reservations` + `remainingSpineSteps` + `reserveCallback` — тяжёлая слот-система ради 3 seed/callback пар. `AGENT_04_LEAD` несёт 7 веток `stateEffects`, `OPEN_06` — 10. Много механики, мало отдачи. Рубрика §6, §7.3 → WARN. Зона Фазы 2.
- **[V] SYS-3 — Семикратный «or»-ультиматум.** Конструкция «делай X or Y» финалом сообщения: `OPEN_03_INVOICES, OPEN_05, OPEN_06, AGENT_01, DEV_HOSTAGE_SEED, DEV_HOSTAGE_CALLBACK, AGENT_07_DONATE`. Минимум в 4 случаях персонаж зачитывает меню кнопок. TOV §6/§9 → WARN. Зона Фазы 5.
- **[V] SYS-4 — Тройной инвесторский капслок на входе в арку.** `OPEN_06` → `PAYROLL_RESTRICTED_AI_SEED` (слот `agents_entry_seed`) → `AGENT_01` — три caps-требования подряд. TOV §9 + Character Bible (дозировать) → FAIL ритма. Зона Фаз 2/4.
- **[V] SYS-5 — Шутка про «apology for capitalism» повторяется 3×.** `AGENT_02_DEV` → `AGENT_05_ORDER` → `PRESS_CAPITALISM`. Callback обязан эскалировать, а не пересказывать. TOV §9 → WARN.

---

## Онбординг

### OPEN_01
- **FAIL [V]** — «Our startup, B2BuyerSpyer, still has the best name»: аппозитив возвращает отклонённый REJECTED §2 (обучающий текст фаундеру о его же продукте). Шутка про «best name» живая — чинить обёртку.
- **WARN [V]** — «Hi there, visionary! 👋»: приветствие-открывашка, дух REJECTED §1. Спасает «visionary» (лесть — канон бота).
- **WARN [S]** — `same-next-without-future-state`: обе кнопки → `OPEN_02`, различия только в мгновенных эффектах, ни один флаг не читается позже. Рубрика §4.4.

### OPEN_02
- **FAIL [V/S]** — «Potential customers: 814. Paid invoices: 0.»: дословный возврат REJECTED §3 (двусмысленное 814, фальшивая ясность). Строка 2 корректно вводит prospects, строка 3 их же переименовывает в запретный термин. STATE_BIBLE §3.

### OPEN_03_AUDIT
- **WARN [S]** — `same-next-without-future-state` (обе → `OPEN_04`). Иначе чисто. **СОХРАНИТЬ** текст: «0 need B2BuyerSpyer. / Want another 814?» — эталон слепой логики бота.

### OPEN_03_INVOICES
- **WARN [V]** — «REVENUE PIPELINE» по REJECTED §6 помечен «не утверждён автоматически, проверить уникальность» — не проверено.
- **WARN [V]** — «Fake one invoice or call five prospects?» — зачитывание кнопок (см. SYS-3).

### OPEN_04
- **WARN [S]** — `same-next`: обе кнопки ставят один флаг `opening_overload_exposed` и → `OPEN_05`. Различия не читаются позже. **СОХРАНИТЬ** текст и кнопки «Leave on read» / «Claim we're close» — messenger-native высшей пробы (REJECTED §5 исполнен точно).

### OPEN_05
- **Чисто. СОХРАНИТЬ** — «are we getting money or another speech about changing b2b forever» — эталонный `@error404`.

### OPEN_06
- **WARN [V]** — вторая подряд caps-карта инвестора + вход в SYS-4.
- **WARN [V]** — «BUILD FOR ENTERPRISE OR HUNT A WHALE» зачитывает route-кнопки (SYS-3).
- **WARN [S]** — 10 веток `stateEffects` (SYS-2), ретро-применение исходов health-модуля.

---

## Agents-арка

### AGENT_01
- **FAIL [V]** — участник тройного caps-стека (SYS-4). Сам текст канонный.
- **WARN [S]** — `same-next-without-future-state` (обе → `AGENT_02_DEV`). **СОХРАНИТЬ** — «ASK MOM FOR MONEY»: инвестор с зубами (анти-REJECTED §9).

### AGENT_02_DEV
- **Чисто. СОХРАНИТЬ** — «it apologizes to every lead for capitalism / and refuses calls during therapy». Не дублировать в `PRESS_CAPITALISM` (SYS-5).

### AGENT_03_HYPE
- **FAIL [S]** — «the demo is trending»: если на `AGENT_02_DEV` выбран «Deploy the patch» (флаги `empathy_deployed, agents_public`), демо не публиковалось — карта врёт о причине хайпа. Карта не читает флаг, чтобы различить ветки. State integrity §3.1.
- **WARN [S]** — `same-next` (обе → `AGENT_04_LEAD`).
- **WARN [V/S]** — «enterprise buyers want the deck»: «buyers» на стадии lead без однозначного референта (STATE_BIBLE §4).

### AGENT_04_LEAD
- **FAIL [V]** — highLabel «Close five thousand» для «Quote all 500»: маниакальный label меняет глагол (quote→close) и количество ×10. TOV §10.
- **WARN [S]** — 7 веток `stateEffects` (SYS-2); собственный выбор карты (Book call vs Quote 500) не создаёт различимого будущего state — все ретро-эффекты приходят из side-модулей.
- **WARN [S]** — `same-next` (обе → `AGENT_05_ORDER`). **СОХРАНИТЬ** — «our first buyer» + «I offered dev's passport as collateral» (эскалация TOV §7).

### AGENT_05_ORDER
- **WARN [V]** — highLabel «Promise tomorrow» для «Promise Friday» — дрейф срока (мягче, чем AGENT_04, но TOV §10).
- **WARN [V]** — регистр `@head_of_agile` спокойно-ироничный, тогда как Character Bible требует тревожные corporate pings с KPI. «Good.» звучит как философ, а не паникующий менеджер.
- **WARN [S]** — `same-next` (обе → `AGENT_06_LEGAL`). **СОХРАНИТЬ** — «expensive-looking AI rollout».

### AGENT_06_LEGAL
- **WARN [V]** — обрезано до диагноза (13 слов при бюджете 28); ask клиента («очистить проблему ради rollout» — Character Bible) существует только в кнопках. Симптом «мутной середины». TOV §4.
- **СОХРАНИТЬ (обязательно)** — панч «Buying them is slave trading.» (план + STATE_BIBLE §8). Дописывать ask, не трогая эти слова.

### AGENT_07_INVOICE
- **Чисто. СОХРАНИТЬ** — «scrape suppliers nobody calls» + «Invoice before Marketing adds feelings».
- **PASS [S]** — payment truth: left → `validation_agents`, `paid:true`, `validationProof:true`, cash+16 (реальный invoice).

### AGENT_07_DONATE
- **WARN [V]** — «Donate all 500 for our logo —»: сжато до непрозрачности, механизм обмена не читается за 3 сек (TOV §3). Юмор «humanitarian budget» точный.
- **PASS [S]** — payment truth: «Donate» → `ai_foundation` (loss, без cash, не paid); «Invoice freedom» → cash+12, `paid:true`, crisis `freedom_sale`, `dirty_validation`. Бесплатное не помечено победой (STATE_BIBLE §5).

---

## Side stories (Agents-scoped)

### PAYROLL_RESTRICTED_AI_SEED
- **FAIL [V]** — часть caps-стека SYS-4 (позиция в слоте `agents_entry_seed`). Текст канонный — чинить позицию, не слова. **СОХРАНИТЬ** — «YOUR TEAM CAN WORK FOR THE SUBSCRIPTION».

### PAYROLL_RESTRICTED_AI_CALLBACK
- **WARN [V]** — «pay us or i shut everything down right now»: generic-angry-worker, не `@error404` (нет сарказма, нет конкретного тех-рычага). Симметрия «the ai has everything / payroll has nothing» слишком аккуратная (TOV §6). Character Bible §2.

### DEV_HOSTAGE_SEED
- **WARN [V]** — зачитывание кнопок (SYS-3) + требование публичной эмоц-защиты слабо вяжется с интровертом-высокомерцем (канон: презрение, не запрос валидации).
- **WARN [V]** — кнопка «Fake investor's apology» читается как noun phrase, глагол теряется (TOV §10).

### DEV_HOSTAGE_CALLBACK
- **FAIL [S/V]** — «updates are back / write down who has access»: причинность отрезана. Seed был про угрозу замены на AI + публичное оскорбление; callback ссылается на off-screen борьбу за access/updates, которой на экране не было. Рубрика §7.3 (callback сохраняет точный смысл исходного действия). «schedule my 3am call now» — живо, но висит на непонятной ситуации.

### B3_SALES_PRESSURE_SEED
- **WARN [V]** — «Boss,» против устойчивого «Chief» у `@bigdeals` во всех прочих картах — трещина консистентности. Сама карта хорошая.

### B3_PAID_OPTOUT_CALLBACK
- **Чисто. СОХРАНИТЬ** — целиком: «We closed their hatred / They'll pay to never hear from us again / hits my commission».
- **PASS [S]** — payment truth: `paid_to_disappear`, `paid:true`, `validationProof:false` (STATE_BIBLE §5 — оплата за opt-out ≠ validation).

---

## Pressure (Agents-triggered)

### PRESS_CAPITALISM
- **WARN [V]** — SYS-5 (третий пересказ «apology for capitalism»); скелет «empathy patch is ready→live» повторяет `AGENT_02_DEV`. Новой информации только «three follow-ups».

### PRESS_FAMILY
- **FAIL [S]** — «My wife and kids share one free AI agent»: врёт про состояние мира. Триггер `agents_public` ставится и за trending demo (`AGENT_02_DEV` right), которое НЕ раздаёт бесплатных агентов. STATE_BIBLE §4 (User) + REJECTED §4 (нельзя вводить users раньше создающего события). **СОХРАНИТЬ** голос+панч «Add family therapy mode or I leave a one-star review» / «Delete the family» — при переносе триггера на реальное событие раздачи бесплатных агентов.

---

## Итог

- **FAIL:** OPEN_01, OPEN_02, AGENT_01 (SYS-4), AGENT_03_HYPE (state), AGENT_04_LEAD (label), DEV_HOSTAGE_CALLBACK, PRESS_FAMILY, PAYROLL_RESTRICTED_AI_SEED (SYS-4); системные: SYS-1, SYS-4.
- **WARN:** ~18 карт/пунктов (см. выше).
- **PASS явно:** payment truth во всех оплачиваемых финалах Agents; `OPEN_05`, `AGENT_02_DEV`, `B3_PAID_OPTOUT_CALLBACK` — эталонные.
- **СОХРАНИТЬ (заморожено):** slave-trade панч (AGENT_06), OPEN_04/OPEN_05, AGENT_02_DEV, AGENT_04 «passport collateral», B3_PAID_OPTOUT целиком, PRESS_FAMILY голос, «Want another 814?».

**Корневая причина «не Reigns»:** SYS-1 (вся арка склеена, нет гейтинга и рамки) + SYS-2 (машинерия ради малого) — это структура, чинится в Фазе 2 до любого письма через флаг-гейтинг (Вариант B): свободные биты 1–3 в тасующемся пуле, склейка 4→7 встык. Обрезанная причинность середины (AGENT_03/06, DEV_HOSTAGE_CALLBACK) — Фаза 4, каждый свободный бит переписать так, чтобы он пережил одно прерывание. Голоса — Фаза 5.
