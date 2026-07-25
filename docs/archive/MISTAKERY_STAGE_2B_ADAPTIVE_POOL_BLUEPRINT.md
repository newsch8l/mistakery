# Mistakery — Stage 2B: Adaptive Pool Blueprint

Статус: Package A встроен в production и остановлен на техническом checkpoint 13 июля 2026; Package B не начинался. Утверждённый английский copy находится в игре без редакторских изменений. Фактические проверки и частоты зафиксированы в `MISTAKERY_STAGE_2B_PACKAGE_A_PRODUCTION_CHECKPOINT.md`.

Для Package A этот Blueprint является источником правды о составе и творческой причинности. Техническим источником правды для slot-ов, eligibility, диапазонов, эффектов, reader-ов, количеств и тестов является `MISTAKERY_STAGE_2B_PACKAGE_A_IMPLEMENTATION_PLAN.md`; при расхождении действует implementation plan.

## 1. Production snapshot

Сейчас в deck 43 decision cards: 7 opening, 17 story, 12 side-story (10 Package A + 2 B3) и 7 pressure; также 9 crises и 20 endings. После понятного onboarding `OPEN_06` ведёт либо в Agents, либо в Padel. Немедленный отказ на `PADEL_01` может вернуть игрока в Agents; принятие встречи закрывает дальнейшие variable insertions до финала.

Движок поддерживает flags, `requires`/`excludes`, resource ranges, active arcs, named scheduler boundaries, callback reservations, state readers, delayed legacy callbacks, queued continuation, protected pairs и Padel lock. Package A использует утверждённые route-aware slots; Package B остаётся только дизайном.

Read-only analyzer: **0 errors, 8 warnings** `same-next-without-future-state` — `OPEN_01`, `OPEN_03_AUDIT`, `OPEN_04`, `AGENT_01`, `AGENT_03_HYPE`, `AGENT_04_LEAD`, `AGENT_05_ORDER`, `PADEL_03_TEAM`. Package A state readers распознаются analyzer как настоящая память; ложных `unused-flag` нет.

## 2. Границы и окончательный объём

### Утверждённый набор

| Модуль | Новых карт | Scope |
| --- | ---: | --- |
| Restricted AI Payroll | 2 | `agents_entry_seed` → зарезервированный callback до серьёзного Lead |
| Dev Hostage | 2 | `agents_entry_seed` → зарезервированный callback до серьёзного Lead |
| Mom vs Investor | 2 | `opening_shared_seed` → `opening_health_resolution`; mutually exclusive с Fake Founder Coma |
| Bankruptcy Prediction | 2 | только Agents, после внешнего interest; 1-of-3 с Voice Clone/B3 |
| Fake Founder Coma | 3 | `opening_shared_seed` → `opening_health_resolution`; один seed и две взаимоисключающие callback-карты |
| Founder Voice Clone | 2 | только Agents, после внешнего interest; 1-of-3 с Prediction/B3 |
| Startup for $1 | 2 | низкий Cash или Founder; второй beat — только после отказа |
| State reactions | 3 | одиночные, без отдельной ветки; Mom Flyers — только `opening_health_resolution` |
| B3 | 0 | две существующие карты сохранить без изменения |

Итого Stage 2B предлагает **18 новых карточек**: Package A — 10, Package B — 8. Вместе с двумя уже существующими B3-картами это **20 variable cards в deck**, но не 20 карт за один run.

### Техническое зеркало Package A

Это краткая синхронизация с implementation plan, а не второй источник технических решений. Среди 32 реальных opening traces health-control доступен на **16/32**, union Agents lane — на **20/32**, обе линии вместе — на **11/32**. Restricted AI Payroll eligible на **16/32**, Dev Hostage на **16/32** (полное overlap 16/32), а существующий B3 на **8/32**: 4 пересекаются с Payroll/Dev и 4 являются B3-only Agents traces. В 5 traces есть только health pair; в 9 — Flyers плюс Agents; в 7 — только Flyers.

B3 занимает Agents lane, но не является Package A. Поэтому на health + Agents trace Payroll/Dev дают 4 Package A cards, а B3 даёт 2 Package A + 2 B3 = 4 non-legacy variable cards. На Flyers + Agents trace это соответственно 3 Package A либо 1 Package A + 2 B3 = 3 non-legacy variable cards. Legacy reactions учитываются отдельно. Начальные веса: Mom vs Investor/Fake Coma — **2:1**; Payroll/Dev/B3 — **3:2:1**. Они проверяются в fixture report по eligibility, selection и callback completion rate.

Health seed занимает `opening_shared_seed` после `OPEN_04`; due callback имеет приоритет в `opening_health_resolution` после `OPEN_05`. Только когда health seed/reservation/due callback отсутствует, Mom Flyers может появиться один раз с Founder 66–78. Flyers не требует `sales_outreach_started`, не создаёт Cash или Customers и читается существующей `OPEN_06`. Все Package A Agents seed идут только через `agents_entry_seed`, а их due callback — через callback-only Hype → Lead; Lead → Order → Legal остаётся неразрывной парой.

### Удалено из Stage 2B

Полностью удалены Family Bridge Control, Crawler Governance, Prospect Roadshow Covenant, Founder-Time Debt, Designer/logo/watermark, Demo Collateral и все прочие неутверждённые кандидаты. G2 не возвращается ни целиком, ни в ослабленной форме: нет скрытых human demo-workers, юридического очеловечивания software и попытки спасти длинное объяснение меньшим шрифтом.

### Неизменные ограничения

- Финальные реплики и labels Package A зафиксированы в copy audition и встроены в production без изменений.
- Одна карточка содержит одну читаемую ситуацию; будущий текст — максимум четыре визуальные строки на 390×844.
- Новых именованных людей, компаний, брендов и платформ нет. `@yc_founder` — уже существующий персонаж.
- Поздние события говорят о prospect list, а не повторяют число 814. Prospect не является lead, customer или user без соответствующего события.
- Cash растёт только от реальной оплаты, funding или явно названной экономии. Cloud credits — не Cash; они лишь могут уменьшить конкретный расход.
- Customers меняется только от внешнего сигнала: ответа, публичной реакции, намерения купить, конфликта или коммерческого действия.
- Никакого routine `too late`: игрок разрешает ложь, клон или объявление **до** их публикации/использования.

## 3. Архитектура и правила прохождения

### Режимы карт

1. **Forced** — непосредственная причинная пара; не прерывается.
2. **Micro seed** — старт одного двухкарточного модуля. Сохраняет flag и сразу резервирует callback slot.
3. **Reserved callback** — обязательное следствие выбранного seed. Новый seed не может конкурировать с ним.
4. **State reaction** — одиночная реакция мира. Не запускает отдельную ветку и не идёт перед reserved callback.

### Жёсткие scheduler rules

- Одновременно открыт максимум **один** микросюжет: от seed до resolution нельзя показать seed другого модуля.
- Когда seed выбран, scheduler резервирует callback до того, как выбирает следующую variable card. Нельзя открыть seed, если callback уже не помещается до terminal ending, кризиса или закрытой Padel-последовательности.
- Shared/reaction cards не уменьшают и не подменяют счётчик обещанного callback. Задержка считается только по заранее определённым spine decisions; callback никогда не «теряется» из-за случайной вставки.
- **Health-control exclusion.** Первый seed в группе `health_control` записывает runtime quality `health_control_story: coma` либо `health_control_story: mom_investor`. Fake Founder Coma требует, чтобы quality отсутствовала и `mom_investor_seen` отсутствовал; Mom vs Investor требует того же и отсутствия `fake_coma_seen`. Качество не очищается после callback: эти две истории не могут появиться в одном run, даже если первая ветка была заблокирована выбором игрока.
- **Agents commercial exclusion.** Bankruptcy Prediction, Founder Voice Clone и B3 принадлежат одной группе `agents_commercial_side_story`. Когда выбран первый из трёх seed, scheduler сохраняет `agentsCommercialStory: prediction | voice_clone | b3`. Два остальных требуют отсутствия этого значения и остаются недоступными до конца run. Это runtime eligibility metadata; содержание существующих B3-карт не меняется.
- Для обеих групп callback выбранной истории имеет приоритет над новым seed и state reaction. Только после его resolution scheduler продолжает обычный pool; group quality остаётся как память о показанной истории.
- Для Package A health seed появляется только после `OPEN_04`; его due callback имеет первый приоритет после `OPEN_05`. Если health callback/reservation отсутствует, там может появиться только Mom Flyers, затем продолжается `OPEN_06`. Flyers и health callback не идут подряд на одной физической границе.
- После `PADEL_01` общий pool, state reactions и новые seeds закрыты до финала. Padel остаётся локальной плотной цепочкой coach → CEO → wager → team → match → outcome.
- Внутри Agents Package A seed появляется только на `agents_entry_seed`; его due callback может использовать только осознанно разрешённый `agents_pre_serious_lead` между Hype и Lead. Нельзя вклиниваться между Lead → Order → Legal.
- Для Package A не закрепляется утверждение «обычный run = 4 variable cards» и не сохраняется устаревший hard cap 6. Достижимое распределение и его acceptance gates определены техническим plan-ом и должны подтверждаться симуляцией.

### Честная длина run

| Path | Fixed decisions сейчас | Возможные variable cards | Реалистичная длина |
| --- | ---: | ---: | ---: |
| Padel, встреча принята | 12 (`OPEN_01`–`OPEN_06` + `PADEL_01`–`PADEL_06`) | Package A: 1 Flyers или 2 health cards до `OPEN_06`; после `PADEL_01` — 0 | 13–14 для Package A |
| Padel refusal → Agents | 14 (opening + `PADEL_01` + Agents) | Package A проверяется отдельной fixture-матрицей; никаких новых insertions после accepted `PADEL_01` | определяется симуляцией |
| Direct Agents | 13 (opening + `AGENT_01`–`AGENT_07`) | Package A: 1–4 по матрице 7/9/5/11; B3 считается отдельно, а non-legacy pool — как Package A + B3 | 14–17 для Package A |

Следовательно, прежнее обещание «все run 15–18 и каждый получает 4–6 variable cards» несовместимо с утверждённой Padel-моделью. Blueprint не подгоняет арифметику: Padel остаётся короче и плотнее; Agents получает основную replayability. Общий hard cap здесь не зафиксирован: он должен следовать из fixture simulation, а не из старого допущения.

Новые правила взаимного исключения уменьшают частоту конкурирующих тем, а не добавляют карточки. В частности, Agents может получить только один двухкарточный коммерческий модуль из Prediction/Voice Clone/B3; это не даёт оснований возвращать прежний общий cap.

## 4. Микросюжеты

### M1. Restricted AI Payroll — 2 карты

**Scope и eligibility.** Только `agents_entry_seed` после direct Agents или реального Padel refusal. Требует `payroll_unresolved`, написанный существующим ответом **Promise revenue**, и достижимый Agents range; callback резервируется для `agents_pre_serious_lead`. Не является shared-middle и не может появиться в accepted Padel.

**Причина и персонажи.** `@unicorn_hunter` даёт конкретные **cloud credits**: ими можно платить за servers и AI compute, но нельзя платить зарплаты. Он хочет одновременно выглядеть AI-native и распоряжаться людьми через деньги. `@error404` видит, кто реально будет supervise compute, а `@b2buddy_bot` видит provisioning. Жертва — живая team, которой платёжные credits не помогают. Это не абстрактный restricted budget и не история о правах AI.

**Карты и память.**

1. Seed: founder решает принять cloud credits либо требовать money, который можно направить на payroll. Сохраняется `cloud_credits_accepted` или `cloud_credits_refused`.
2. Callback: Dev замечает, что bot/AI account — единственный полностью обеспеченный «сотрудник», пока зарплата team задержана. Игрок выбирает работающий AI ценой team priority либо ограничивает compute в пользу живой команды. `cloud_credits_resolved` закрывает модуль.

**Ресурсы и большие ветки.** Credits дают только явную экономию server/compute expense; Cash не увеличивается как от invoice. Сохранённый исход читается существующими `AGENT_01` и `AGENT_04_LEAD`: compute expense уменьшается либо Team получает финальное следствие. Padel не получает ни seed, ни callback.

**Почему не скетч.** Логика читается сразу: investor оплатил машину, но не людей; Dev видит последствия. Две карты — funding instrument и его жертва, а не повторный «бот что-то перепутал».

### M2. Dev Hostage — 2 карты

**Scope и eligibility.** Только `agents_entry_seed`, при `payroll_unresolved` и `dev_payroll_risk_visible`, которые пишет существующий **Promise revenue**, в достижимом Agents range. Callback резервируется для `agents_pre_serious_lead`; accepted Padel исключён.

**Причина и персонажи.** Investor публично называет `@error404` заменяемым. Продукт продолжает работать, но Dev останавливает выпуск новых обновлений: он перестаёт бесплатно поддерживать невидимую зависимость команды от одного человека. Его цель — сделать невыплату и унижение видимыми, а не уничтожить компанию. Investor хочет показать, что control принадлежит деньгам; жертва — Dev и team, которая больше не может выпускать изменения обычным способом.

**Карты и память.**

1. Seed: после публичного унижения Dev оставляет продукт online, но прекращает выпускать новые обновления. Founder выбирает публично защитить Dev либо обойти его и восстановить возможность обновлений без уступки. Flags: `investor_humiliated_over_dev` или `dev_bypassed`.
2. Callback: обновления снова работают. Founder выбирает письменные правила доступа либо временный shortcut, который решает сегодняшний выпуск, но оставляет Dev человеком, которому снова позвонят в 3am. Сохраняются `dev_terms_visible` либо `dev_access_contested`.

**Ресурсы и большие ветки.** Публичный ответ бьёт по Founder, но может поднять Team. Обход ухудшает Team; сохранённая пара решений читается именно существующей `AGENT_04_LEAD`, меняя delivery capacity. Cash и Customers не меняются; Padel не получает эту историю.

**Почему не скетч.** Ситуация — не техническая демонстрация и не увольнение ради панчлайна. Она продолжает уже существующую payroll pain через понятное действие: текущий продукт жив, но новые обновления остановлены. Dev не увольняется, не уничтожает продукт, не крадёт код и остаётся доступен будущим карточкам.

### M3. Mom vs Investor — 2 карты

**Scope и eligibility.** Только `opening_shared_seed` после `OPEN_04`, в health-control class с Founder 58–65 и `opening_overload_exposed`. Seed требует отсутствия `health_control_story`, записывает `health_control_story: mom_investor` и резервирует resolution после `OPEN_05`. Это 16/32 candidate opening traces, конкурирующих с Fake Coma; не кризисная reaction и не post-Padel content.

**Причина и персонажи.** `@i_love_cats72` видит бессонницу и отсутствие еды; для неё Investor — мужчина, который звонит про деньги и делает ребёнку хуже. Она не говорит о runway, cap table или architecture. Investor считает founder своей ставкой и требует результат. Комизм в том, что оба уверены в праве распоряжаться founder; жертва — сам founder, а затем team, зависящая от того, чья власть победит.

**Карты и память.**

1. Seed: Mom собирается лично приструнить Investor. Игрок поддерживает Mom или поддерживает Investor. Flags: `mom_backed_against_investor` либо `investor_backed_against_mom`.
2. Callback: Investor меняет доступность следующего funding/условий, а Mom либо усиливает бытовое спасение, либо отступает, но не исчезает. Игрок выбирает, чью краткосрочную власть признаёт в конкретной ситуации team/founder. Flags: `mom_investor_clash_resolved` + направление исхода.

**Ресурсы и большие ветки.** Полная пара решений читается существующей `OPEN_06` и меняет только Team/Founder выбранного маршрута; она не меняет Cash, Customers или route availability. Fake Founder Coma исключена во всём таком run.

**Почему не скетч.** Mom действует из узнаваемой семейной власти и информации о здоровье, Investor — из власти денег. Ни один не заменяет другого голосом или должностью.

### M4. Bankruptcy Prediction — 2 карты

**Scope и eligibility.** Только Agents. Требует уже возникший **внешний interest** после Hype, но до named buyer/order pair; безопасный slot должен быть подтверждён scheduler test. Требует отсутствия `agentsCommercialStory`; при выборе записывает `agentsCommercialStory: prediction`. Не показывается, если callback due или `AGENT_04_LEAD` уже стал current/queued.

**Причина и персонажи.** Sales хочет удержать ответивший prospect и обещает функцию, которой нет: якобы B2BuyerSpyer назовёт точную дату банкротства конкурентов prospect. Это не оплата, не customer и не реальный forecast. `@bigdeals` знает обещание, потому что сам вёл переписку; Dev знает, что такой feature отсутствует. Жертва — founder, которому предлагают превратить полученный interest в опасный claim, и team, которой придётся его имитировать.

**Карты и память.**

1. Seed: игрок разрешает имитировать прогноз либо требует честно признать отсутствие функции. Flags: `bankruptcy_prediction_promised` или `prediction_refused`.
2. Callback: prospect воспринимает обещание как конкретное деловое условие либо Sales должен отозвать claim. В первом пути возникает конкретная legal/reputation threat (`prediction_claim_exposed`); во втором — потерянный interest/честный scope. Никакого нового именованного клиента, реальной компании или платёжного обещания.

**Связь с Agents.** `prediction_claim_exposed` читается следующей Agents commercial scene как дополнительное обязательство Sales, но не переписывает смысл `@head_of_agile` и не создаёт деньги. Модуль объясняет, почему later customer доверяет компании меньше/ставит жёстче boundary, а не случайно появляется с другой шуткой.

### M5. Fake Founder Coma — 3 карты

**Scope и eligibility.** Только `opening_shared_seed` после `OPEN_04`, в той же health-control class с Founder 58–65 и `opening_overload_exposed`. Seed требует отсутствия `health_control_story`, сохраняет `health_control_story: coma` и резервирует один из двух callback ID для `opening_health_resolution`. Это 16/32 candidate traces, конкурирующих с Mom vs Investor. Не использует реальные social networks.

**Причина и персонажи.** `@hype_queen` боится тишины и видит в переработке founder публично понятный повод для жалости, registrations и внимания. Она не делает продукт и не публикует ничего до решения игрока. Жертва — founder: его здоровье становится campaign asset; team получает внешний attention ценой правды.

**Карты и память.**

1. Общий seed: Hype предлагает объявить, что founder госпитализирован из-за работы. Игрок разрешает кампанию либо запрещает ложь до публикации. Каждый выбор резервирует конкретный callback ID: `coma_campaign: authorized` → callback разрешённой кампании; `coma_campaign: blocked` → callback заблокированной кампании.
2. Callback разрешённой кампании: отдельная обычная карточка с двумя кнопками; внешняя публикация может остаться фактом или быть отозвана. Она читает `coma_campaign: authorized` и сохраняет собственный итог.
3. Callback заблокированной кампании: другая обычная карточка с двумя кнопками; она читает `coma_campaign: blocked` и разрешает реальную перегрузку через отдых либо её отрицание. В одном run появляется только один из двух callbacks.

Не использовать `choice.conditional`, динамическую замену текста или кнопок: это две отдельные callback-карты в одном named slot.

**Ресурсы и большие ветки.** Кампания может дать Customers только потому, что публикация действительно вызвала реакцию; Cash не растёт. Одна из четырёх сохранённых развязок читается существующей `OPEN_06` и меняет Team/Founder, но не route availability. `health_control_story: coma` исключает Mom vs Investor до конца run.

### M6. Founder Voice Clone — 2 карты

**Scope и eligibility.** Только Agents, после external interest и до named buyer/order pair, в том же строго ограниченном safe-slot family, что Bankruptcy Prediction. Требует отсутствия `agentsCommercialStory`; при выборе записывает `agentsCommercialStory: voice_clone`. Эта история взаимно исключена с Bankruptcy Prediction и B3 не только в одном slot, а до конца run.

**Причина и персонажи.** Sales хочет масштабировать cold calls; Bot может предложить технический tool. Они предлагают voice clone founder, который звонит и договаривается от его имени. Это не шутка про accent, stutter или viral video: риск в полномочии говорить и обещать. Жертва — founder, чьи слова становятся коммерческим обязательством, и team, которой надо исполнять договорённость.

**Карты и память.**

1. Seed: founder разрешает клону говорить/договариваться либо запрещает выдавать clone за себя. Flags: `voice_clone_authorized` или `voice_clone_blocked`.
2. Callback: clone принимает опасное условие — цену, срок или scope — от ответившего prospect. Если clone был запрещён, Sales получает меньше охвата, но не создаёт obligation. Если разрешён, сохраняется `clone_commitment_made` с конкретным видом обязательства.

**Связь с Agents.** `clone_commitment_made` читается следующей Agents commercial scene: не как новый customer и не как Cash, а как дополнительная цена уже существующей Sales/Buyer договорённости. Это делает callback причинным. Padel clone не получает: после `PADEL_01` коммуникация с CEO уже должна быть прямой.

### M7. Startup for $1 — 2 карты

**Scope и eligibility.** `cash <= 25` или `founder <= 30`; только если нет открытого модуля. `@business1` знает, что founder ушёл с прежней работы и как унизить его понятным карьерным предложением. Он не нуждается в Git, IP или commit lore.

**Причина и персонажи.** Ex-Boss предлагает купить весь startup за $1, закрыть долги и вернуть founder младшим аналитиком на испытательный срок. Его личное желание — вернуть founder в прежнюю иерархию и доказать, что уход был ошибкой. Жертва — независимость founder и перспектива team.

**Карты и память.**

1. Seed: принять долларовую сделку или отказаться. Принятие ведёт к отдельному проигрышному `startup_for_one_dollar` outcome: компания и выбор пути закончены, не притворяются validation. Отказ сохраняет `one_dollar_offer_refused`.
2. Callback только для отказа: Ex-Boss пытается переманить `@error404` настоящей зарплатой. Игрок защищает team через реальную контрофферту/прозрачность либо оставляет Dev выбирать. Flags: `dev_poached_attempted` + развязка. Dev не исчезает из игры и product не уничтожается автоматически.

**Ресурсы и большие ветки.** Отказ не создаёт Cash, но сохраняет Founder autonomy; callback проверяет Team. В Agents contested Dev availability повышает цену patch/commitments; в Padel влияет лишь на Team/Founder до `PADEL_01`. Это не случайная насмешка Ex-Boss: его первое предложение логически создаёт второй рычаг — настоящую зарплату для человека, которого startup не может полноценно оплачивать.

### M8. B3 — paid opt-out (сохранить без изменения содержания)

B3 остаётся двухкарточной Agents-only side-story: company платит за permanent suppression, чтобы Sales больше не писал. Это настоящая оплата и может увеличить Cash, но не core-product validation, Customer или User. Она не eligible внутри active Padel. При выборе B3 seed scheduler записывает `agentsCommercialStory: b3`; поэтому Bankruptcy Prediction и Founder Voice Clone становятся недоступны до конца run. B3 callback имеет тот же reserved priority, что и новые модули; его видимое содержание не меняется.

## 5. Три одиночные state reactions

Каждая карта имеет `oncePerRun`, не открывает callback и не появляется, если due callback уже зарезервирован или следующий beat forced.

| Reaction | Eligibility и sender | Выбор и persistent effect | Почему это реакция мира |
| --- | --- | --- | --- |
| **Mom flyers** | Только после `OPEN_05`: Founder 66–78, нет health seed/reservation/due callback, один раз за run. Mom знает телефон как мать, а имя B2BuyerSpyer — потому что founder пять месяцев строил и называл компанию дома. Никакого `sales_outreach_started` и startup vocabulary. | Снять flyers → Team `+1`, Founder `-1`, `mom_flyers: removed`; оставить → Team `-1`, Founder `-3`, `mom_flyers: public`. Существующий `OPEN_06` читает outcome: privacy даёт Founder `+1`, public добавляет Team `-1`, Founder `-3`. Cash/Customers не меняются. | Mom буквально пытается найти помощь для слишком уверенного и перегруженного ребёнка; это не воронка и не sales action. |
| **Rival discredits the list** | После `funnel_audited`, `invoice_theater_tolerated` или публичного traction claim; `@yc_founder` показывает, что большой prospect list не доказывает спрос. | Reply with evidence / ignore him. Flags `prospect_list_discredited` или `rival_claim_unanswered` меняют eligibility будущего hype/claim, Cash не меняется. | Rival превращает собственный успех в конкретное сравнение, не повторяя generic humblebrag. |
| **Bot prepares shutdown** | Низкий Founder плюс слабый Cash/Team; Bot анализирует доступные ему operational signals и **самостоятельно объявляет подготовку** к закрытию внутри компании. | Founder отменяет подготовку или разрешает подготовить конкретные экономящие меры. Flags `shutdown_preparation_stopped`/`shutdown_prepared`; Cash может вырасти только от явно отменённого расхода. | Bot действует из метрики и заботливого pseudo-operations, а не физически закрывает компанию без решения игрока. |

## 6. Связь с Agents и Padel

| Модуль | Где появляется | Сохраняемое решение | Обязательное последствие | Влияние на большие ветки | Почему не случайный скетч |
| --- | --- | --- | --- | --- | --- |
| Restricted AI Payroll | `agents_entry_seed` | Cloud credits vs people | `AGENT_01` читает relief expense; `AGENT_04_LEAD` читает финальную Team цену | Только Agents; Padel исключён | Credits имеют конкретный объект и конкретную жертву. |
| Dev Hostage | `agents_entry_seed` | Publicly defend Dev vs bypass him to restore updates | Обновления возвращаются; `AGENT_04_LEAD` читает written-rules/shortcut pair и delivery capacity | Только Agents; Padel исключён | Невыплата + публичное унижение останавливают новые обновления, не сам продукт. |
| Mom vs Investor | `opening_shared_seed`; исключает Fake Coma | Back Mom vs Investor | `OPEN_06` читает полный control pair | Меняет только Team/Founder выбранного `OPEN_06` route | Два уже существующих человека борются за власть над founder, а не продолжают чужую campaign. |
| Bankruptcy Prediction | Agents only | Fake forecast vs disclosure | Legal/reputation exposure либо потеря interest | Читается следующей commercial сценой Agents; Padel исключён | Sales promise создаёт конкретное обязательство. |
| Fake Founder Coma | `opening_shared_seed`; исключает Mom vs Investor | Publish lie vs block it | `OPEN_06` читает одну из четырёх seed/callback развязок | Только Team/Founder route state; public callback может дать Customers от реальной реакции | Публичная ложь меняет реальную власть над founder. |
| Founder Voice Clone | Agents only; 1-of-3 с Prediction/B3 | Clone may negotiate vs no impersonation | Clone commitment либо отсутствие obligation | Читается следующей commercial сценой Agents; Padel исключён | Tool получает опасное полномочие, а не просто делает шум. |
| Startup for $1 | Cash/Founder crisis | Accept vs refuse | Losing outcome либо Ex-Boss poaches Dev | Agents/Padel получают только state before `PADEL_01` | Старый начальник превращает прошлую иерархию в реальное предложение. |
| B3 | Agents only; 1-of-3 с Prediction/Voice Clone | Follow up vs stop; invoice vs waive | Paid opt-out либо free opt-out | Платёж не доказывает продукт; Padel исключён | Sales продаёт прекращение вреда, который сам создал. |

## 7. Implementation plan (после отдельного одобрения)

### Пакет A — 10 карт: opening + Agents modules

- Restricted AI Payroll (2), Dev Hostage (2), Mom vs Investor (2), Fake Founder Coma (3), Mom flyers reaction (1).
- Минимальный engine contract и численные eligibility принадлежат implementation plan: health seed → after-`OPEN_05` due callback либо Flyers; Agents seed → callback-only Hype → Lead; protected Lead → Order → Legal.
- Порядок: RED scheduler/slot-policy tests на fixture cards → reservations/callback-only boundary → exhaustive reachability + 10k fixture simulation → отдельная задача final English copy → approved copy/production data → полный browser/UI/playtest checkpoint.
- RED tests: один active micro; callback survives reactions; Flyers reachable, но исключён при health module; cloud credits do not add Cash; Fake Coma cannot publish before player approval; mutual exclusion; no insertion after accepted `PADEL_01`.

### Пакет B — 8 карт: commercial modules, completion и remaining reactions

- Bankruptcy Prediction (2), Founder Voice Clone (2), Startup for $1 (2), Rival reaction (1), Bot shutdown reaction (1). B3 gets scheduler tests only; its content is unchanged.
- Минимальный engine contract: Agents safe-slot eligibility tied to existing forced pairs; `activeMicro` exclusion; persistent `agentsCommercialStory` one-of-three exclusion; flags are read by a named future beat rather than merely set; distinct terminal outcome for `$1` acceptance.
- RED tests: no Bankruptcy/Voice Clone before external interest; exactly one of Bankruptcy/Voice Clone/B3 can seed in an Agents run and its callback has priority over every reaction/new seed; no B3/new module in active Padel; `$1` acceptance ends run and refusal alone schedules poaching callback; clone/prediction never mark payment or customer; state reactions cannot create a long branch.
- Manual runs: Agents with one commercial module, Padel with no post-`PADEL_01` variable card, Ex-Boss refusal path, B3 payment vs free opt-out.

## 8. Remaining risks and decisions not hidden by the blueprint

1. **Padel content budget.** The approved closure rule makes Padel a 12–15 decision run with 0–3 variable cards. Reaching 15–18 or 4–6 variable cards there would require a new content beat or allowing cards after `PADEL_01`; neither is proposed here.
2. **Agents safe slot.** Bankruptcy Prediction, Voice Clone and B3 now compete in a strict one-of-three group. Implementation must still prove one causally defensible pause after external interest but before the serious-lead/order pair. If it does not exist, none of the three enters that run rather than interrupting the pair.
3. **Mom’s knowledge.** Mom vs Investor получает контакт из money-demand notification; Flyers использует только семейно известное имя компании и телефон founder. Она никогда не получает product/fundraising vocabulary ради удобства сюжета.
4. **Investor frequency.** Three approved modules use Investor. Playtest must ensure he does not dominate the voice mix; if he does, reduce eligibility/weight before changing character logic.

После production checkpoint не менять утверждённый Package A copy, не начинать Package B и не менять фундаментальные scheduler-инварианты без отдельного одобрения.
