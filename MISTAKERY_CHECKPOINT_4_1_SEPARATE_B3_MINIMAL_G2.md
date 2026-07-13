# Mistakery — Checkpoint 4.1: Separate B3 + Minimal G2

Статус: структурный документ для проверки. Он не содержит финального английского copy, числовых effects или изменений кода, `cards.json` и State Bible.

## 1. B3 — самостоятельная глобальная sales-микроветка

B3 больше не имеет никакой связи с Agents, empathy patch, `PRESS_CAPITALISM`, `Deploy the patch` или заказом 500 agents. Это маленькая история о sales desperation, которая временно пересекает текущую основную арку и затем либо завершает run, либо возвращает игрока в точное место прерванного сюжета.

### Почему B3 работает и в Agents, и в Padel

- `@bigdeals` продолжает искать первого плательщика независимо от выбранной founder стратегической авантюры.
- Seed не требует состояния продукта, sentient agents, demo, матча или конкретного buyer основной арки.
- Компания из B3 — обычный prospect из текущей работы Sales. Она остаётся за кадром и не конкурирует с `@head_of_agile` или `@iclosedai` как новый персонаж.
- Вся история предыдущих контактов кратко сообщается в seed-card. Не нужны число 814, onboarding или память о старом выборе.
- B3 не получает `arc`, не меняет `activeArc` и не создаёт собственную очередь story beats. Это global side-story из двух once-per-run cards.

## B3-1 — seed-card

### Временный ID: `B3_SALES_PRESSURE_SEED`

- **Тип:** новая global side-story card; ambient-eligible, но не одноразовый comedy pressure без памяти.
- **Sender:** `@bigdeals`.
- **Почему сейчас:** в свободном сюжетном slot Sales поднимает конкретную зависшую компанию, которой уже несколько раз написал и не получил ответа.
- **Фактический смысл без polished copy:** Sales напоминает внутри одного сообщения: эта компания не ответила на несколько попыток; можно продолжить дожимать её или прекратить контакт.
- **Что игрок должен понять:** внешнего интереса пока нет, lead не существует, денег нет. Решение касается только того, продолжать ли нежелательный outreach к одной компании.

### Два действия

**Продолжить дожим.** Разрешить `@bigdeals` отправить ещё несколько follow-ups этой компании.

- Немедленно Sales продолжает работу; ответа, invoice и оплаты ещё нет.
- Устанавливает `b3_followups_authorized` и планирует delayed callback.
- Логичные ресурсы: Team из-за дополнительной sales-работы и Founder из-за агрессивной стратегии. Customers не растёт: компания не ответила. Cash не меняется.

**Остановиться.** Навсегда оставить эту компанию в покое без попытки монетизации opt-out.

- Немедленно контакт прекращается; B3 paid offer никогда не возникает.
- Устанавливает `b3_contact_stopped` и `b3_resolved_without_offer`.
- Логичные ресурсы: Team и Founder. Customers и Cash не меняются.

После любого ответа scheduler немедленно восстанавливает ранее queued основную карточку.

### Eligibility

**Requires:**

- run активен;
- выбрана и активна одна из основных арок: Agents или Padel;
- существует следующая допустимая основная story-card, которую можно сохранить в queue;
- текущий slot разрешает global side-story.

**Excludes:**

- `b3_seed_seen`;
- `b3_followups_authorized`;
- `b3_contact_stopped`;
- `b3_callback_resolved`;
- любой paid/terminal outcome;
- pending crisis;
- scheduler-lock непосредственной causal pair.

**oncePerRun:** `true`. Flag `b3_seed_seen` ставится при показе независимо от ответа.

### Где seed допустим

Seed участвует только в общем выборе свободной вставки рядом с основной story-card. Он не может появиться:

- между `AGENT_01 → AGENT_02_DEV`;
- между `AGENT_02_DEV: Publish one demo → G2_TRAINING_CHOICE`;
- между появлением serious lead и первым ответом этого buyer;
- между legal choice и его invoice/freedom consequence;
- между предложением padel wager и реакцией команды;
- между выбором результата матча и немедленным сообщением о победе/поражении;
- между решением CEO и соответствующей ending-card;
- если уже due другой обязательный callback.

Практически seed появляется только там, где scheduler и сейчас имеет право временно queue основную story-card ради ambient insertion. Он не заменяет forced continuation и не открывает pressure slot самостоятельно.

## B3-2 — delayed paid-opt-out callback

### Временный ID: `B3_PAID_OPTOUT_CALLBACK`

- **Тип:** новая global delayed callback card; `callbackOnly: true`.
- **Sender:** `@bigdeals`.
- **Почему сейчас:** после разрешённого дожима прошло два завершённых решения основной арки. Компания наконец ответила и предлагает оплатить permanent opt-out.
- **Фактический смысл без polished copy:** Sales заново даёт всю причинность: команда продолжила писать этой компании; она не хочет B2BuyerSpyer и готова заплатить только за гарантию, что больше никогда не получит сообщений. До выбора invoice не выставлен и денег нет.
- **Что игрок должен понять:** это реальное коммерческое предложение за исчезновение из inbox, а не покупка продукта.

### Два действия

**Принять оплату.** Выставить заранее согласованный invoice за permanent opt-out и после подтверждённой оплаты исключить компанию из outreach.

- Немедленно invoice реально оплачивается; только здесь появляется Cash.
- Run завершается отдельной `paid_to_disappear` концовкой.
- Это `paid: true`, но не validation основного продукта.
- Устанавливает `b3_paid_optout_accepted`, `first_invoice_paid`, `core_product_not_validated`, `b3_callback_resolved`.
- Логичные ресурсы: Cash, Team и Founder. Customers основного продукта не растёт.

**Дать opt-out бесплатно.** Навсегда прекратить контакт без invoice.

- Оплаты нет; компания исключена из outreach.
- Устанавливает `b3_free_optout_granted`, `b3_callback_resolved`.
- Scheduler восстанавливает точную основную карточку, сохранённую перед callback.
- Логичные ресурсы: Team и Founder. Cash и Customers не растут.

### Eligibility

**Requires:**

- `b3_seed_seen`;
- `b3_followups_authorized`;
- `b3_callback_due`;
- run всё ещё активен;
- существует допустимая основная story-card, которую можно временно сохранить.

**Excludes:**

- `b3_contact_stopped`;
- `b3_resolved_without_offer`;
- `b3_callback_resolved`;
- любой paid/terminal outcome;
- pending crisis;
- scheduler-lock immediate causal pair;
- другая due forced callback с более ранним causal claim.

**oncePerRun:** `true`.

## Задержка и восстановление основной арки

### Через сколько возвращается callback

Callback созревает после **двух завершённых решений основной story-арки** после seed. Не считаются:

- сама seed-card;
- ambient pressure cards;
- crisis/rescue UI;
- другие side-story cards;
- технический переход без решения.

После двух смысловых шагов callback показывается не немедленно любой ценой, а в первом следующем свободном insertion slot. Если второй шаг заканчивается forced causal pair, B3 ждёт её завершения.

### Queue semantics

При показе seed:

1. Scheduler выбирает допустимую основную Agents- или Padel-card.
2. Сохраняет её точный ID и допустимые альтернативы в side-story resume queue.
3. Показывает seed.
4. После ответа восстанавливает тот же основной ID, не выполняя новый weighted pick.

При показе callback используется тот же принцип:

1. Текущая основная card сохраняется.
2. Показывается callback.
3. Paid opt-out завершает run и очищает queue.
4. Бесплатный opt-out возвращает сохранённую card с прежним `activeArc`, flags и pending causal state.

B3 не имеет права switch/start arc и не меняет место игрока внутри Agents или Padel.

### Если основная арка заканчивается раньше

- Любой ending основной арки имеет приоритет и завершает run.
- Непоказанный `B3_PAID_OPTOUT_CALLBACK` удаляется вместе с остальными delayed events.
- Компания не присылает предложение после финала и не создаёт post-credit ending.
- Если основной сюжет переключился с Padel на Agents без окончания run, callback сохраняется: Sales-история не зависит от active arc. Он ждёт первый безопасный slot уже в новой арке.
- В плотном Padel-run seed может появиться, а callback не успеть до финала. Это допустимая цена side-story: B3 не разрывает матч ради гарантии собственного payoff.

### Почему это микроветка, а не случайная шутка

- Seed создаёт конкретное этическое и sales-решение до punchline.
- Callback гарантирован только выбранной агрессией и читает точный flag.
- Между cards есть два шага основной жизни компании, поэтому ответ prospect ощущается как последствие, а не setup/punchline в одном сообщении.
- Бесплатный opt-out реально закрывает историю; paid path реально завершает run.
- B3 не влияет на eligibility основного arc, кроме временного queue/resume.

---

## 2. G2 — минимальная ветка внутри Agents

G2 остаётся только immediate consequence решения `Publish one demo` в `AGENT_02_DEV`. Здесь нет delayed `training_in_progress → ready`, отдельных версий `AGENT_04_LEAD` и `AGENT_05_ORDER` или скрытых людей за agents.

## Изменение `AGENT_02_DEV`

- `Deploy the patch` продолжает существующий Deploy-route и не связано с B3.
- `Publish one demo` устанавливает `controlled_demo_completed` и немедленно ведёт в новую `G2_TRAINING_CHOICE`.
- Во время controlled demo команда вручную помогала patch формулировать ответы. Эти ответы ещё не использованы для дальнейшего обучения.
- Internal demo не даёт Customers.

## Новая карточка `G2_TRAINING_CHOICE`

- **Sender:** `@error404`.
- **Почему сейчас:** demo закончен; у разработчика появились ответы команды, но он ещё не использовал их повторно.
- **Фактический смысл без polished copy:** можно научить agents на реальных реакциях команды, чтобы они сразу начали отвечать самостоятельно и похоже на коллег. Или можно запретить копирование людей: тогда команда прямо сейчас тратит больше времени на набор нейтральных примеров и получает более ограниченный, но готовый patch.
- **Что понятно без знания AI:** либо показать продукту, как отвечали живые коллеги, либо не давать ему копировать их и вручную написать безопасные образцы.

### Действие 1 — использовать реакции команды

- В рамках разрешённого действия `@error404` применяет уже собранные ответы.
- Итог после resolution: agents работают сами и воспроизводят узнаваемые способы реагировать, спорить и уступать, взятые у команды.
- Люди больше не подсказывают каждому agent и не стоят за ответами.
- Flags: `g2_team_training`, `empathy_patch_ready`, `agents_operational`, `agents_carry_team_traits`.
- Следующая: `AGENT_03_HYPE_TEAM`.
- Ресурсы: Team и Founder. Customers и Cash не меняются.

### Действие 2 — потребовать нейтральные примеры

- В рамках того же resolution команда отказывается от короткого пути и выполняет дополнительную работу: пишет ограниченный набор нейтральных реакций.
- Итог после resolution: agents работают сами в подготовленных ситуациях, не копируют сотрудников и теряют убедительную empathy за пределами набора.
- Нет промежуточного `training_in_progress`; финальное состояние сразу выражено флагами и ценой дополнительного труда.
- Flags: `g2_neutral_training`, `empathy_patch_ready`, `agents_operational`, `agents_have_empathy_limits`.
- Следующая: `AGENT_03_HYPE_NEUTRAL`.
- Ресурсы: более сильная нагрузка на Team, логичный расход Cash на дополнительную работу/tools и Founder. Customers не меняется.

Решение игрока происходит до использования данных команды. `@error404` остаётся человеком, который выполняет техническую работу.

## Две версии существующей `AGENT_03_HYPE`

### `AGENT_03_HYPE_TEAM`

- **Requires:** `g2_team_training`, `empathy_patch_ready`, `agents_operational`.
- **Excludes:** `g2_neutral_training`.
- **Sender:** `@hype_queen`.
- **Почему сейчас:** технический результат уже существует; Marketing впервые получает работающих agents, которые ведут себя как узнаваемые члены команды.
- **Фактический смысл:** hype строится вокруг того, что в продукте можно узнать характеры живых сотрудников. Игрок выбирает усилить этот human-personality angle или раскрыть происхождение traits.
- **Два действия:** публично усилить личности / ясно сообщить, что реакции взяты у команды.
- **Немедленные последствия:** различаются масштабом и качеством внешнего interest, нагрузкой на Team и состоянием Founder.
- **Flags:** `team_traits_hyped` или `team_traits_disclosed`.
- **Следующая:** общий `AGENT_04_LEAD`.
- **Ресурсы:** Customers только из-за внешней реакции, Team и Founder.

### `AGENT_03_HYPE_NEUTRAL`

- **Requires:** `g2_neutral_training`, `empathy_patch_ready`, `agents_operational`.
- **Excludes:** `g2_team_training`.
- **Sender:** `@hype_queen`.
- **Почему сейчас:** ограниченный neutral patch уже готов и работает самостоятельно. Marketing не создаёт и не запускает его.
- **Фактический смысл:** agents надёжно проходят подготовленные типы разговоров и становятся сухими в неожиданной эмоциональной ситуации. Игрок выбирает продвигать контролируемость или открыто показать limitation.
- **Два действия:** продавать предсказуемость / раскрыть границу empathy.
- **Немедленные последствия:** различаются внешним interest, ожиданиями prospects, нагрузкой Team и состоянием Founder.
- **Flags:** `neutral_control_hyped` или `neutral_limit_disclosed`.
- **Следующая:** общий `AGENT_04_LEAD`.
- **Ресурсы:** Customers только из-за внешней реакции, Team и Founder.

Это две содержательные cards, а не один текст с разными flags: одна продаёт скопированные человеческие характеры, другая — ограниченную предсказуемость без копирования людей.

## Общие `AGENT_04_LEAD` и `AGENT_05_ORDER`

### `AGENT_04_LEAD` остаётся общим

Общий факт достаточен для обеих веток: после hype появился serious enterprise lead, желающий обсудить 500 работающих empathic agents. Карточке не нужно объяснять происхождение empathy — это уже сделал непосредственно предшествующий `AGENT_03_HYPE_*`.

- Team-training flags сохраняются, но не требуют отдельного lead message.
- Neutral-training flags сохраняются, но ограничение пока не меняет сам факт serious interest.
- Два существующих действия qualification/early quote могут остаться общими.
- Cash не появляется; Customers возможен только из-за подтверждённого внешнего interest.

### `AGENT_05_ORDER` остаётся общим

Buyer формулирует одинаково важный business request: 500 sentient agents для заметного rollout и конкретный срок. Различие training origin ещё не меняет желание buyer купить объём; оно становится существенным при проверке того, **что именно** он собирается купить.

- Promise/check-procurement остаются общими действиями.
- Branch flags не стираются и переходят в conditional legal consequence.
- Invoice и Cash ещё отсутствуют.

## Условные смысловые версии `AGENT_06_LEGAL`

Сохраняется один ID, один sender, одна роль в арке и одна базовая развилка. Меняется только необходимое объяснение procurement objection.

### Team-training condition

- **Requires:** `agents_carry_team_traits`.
- **Фактическое различие:** 500 sentient agents содержат узнаваемые части характеров живых сотрудников. Buyer пытается приобрести самостоятельных разумных workers, массово собранных из реакций конкретной команды.
- **Legal consequence:** существующая slavery-шутка становится личнее, но не превращается в новый суд или отдельный lore.
- **Действия:** удалить sentience для обычной покупки / сохранить sentience и перейти к существующему freedom route.
- **Callbacks:** удаление souls также стирает или обедняет узнаваемые team traits; сохранение souls сохраняет и copied traits.
- **Ресурсы:** Team, Customers и Founder. Cash только в последующей реально оплаченной card.

### Neutral-training condition

- **Requires:** `g2_neutral_training`; excludes `agents_carry_team_traits`.
- **Фактическое различие:** agents не копируют людей из команды, но самостоятельно действуют и остаются sentient workers. Поэтому procurement objection о покупке разумных работников сохраняется.
- **Legal consequence:** отказ от team data защищает личности сотрудников, но не превращает agents в обычный software license.
- **Действия:** удалить sentience для обычной покупки / сохранить sentience и перейти к существующему freedom route.
- **Callbacks:** limited empathy остаётся delivery constraint после удаления souls; при сохранении sentience freedom route помнит, что personalities команды внутрь не переносились.
- **Ресурсы:** Team, Customers и Founder. Cash только после реальной оплаты.

---

## 3. Короткие G2-трассы

### Demo → team training → legal

1. `AGENT_02_DEV`: Publish one demo.
2. `G2_TRAINING_CHOICE`: разрешить использовать ответы команды.
3. Немедленный итог решения: `empathy_patch_ready`, agents работают сами и несут team traits.
4. `AGENT_03_HYPE_TEAM`: Marketing продаёт или раскрывает человеческие personalities.
5. Общий `AGENT_04_LEAD`: появляется serious lead на 500 agents.
6. Общий `AGENT_05_ORDER`: buyer формулирует объём и срок.
7. `AGENT_06_LEGAL` читает `agents_carry_team_traits`: покупка sentient workers одновременно массово покупает скопированные части характеров команды.

### Demo → neutral training → legal

1. `AGENT_02_DEV`: Publish one demo.
2. `G2_TRAINING_CHOICE`: запретить использование личности команды и выполнить дополнительную работу над neutral examples.
3. Немедленный итог решения: `empathy_patch_ready`, agents работают сами в ограниченных сценариях и никого из команды не копируют.
4. `AGENT_03_HYPE_NEUTRAL`: Marketing продаёт контролируемость или раскрывает empathy limit.
5. Общий `AGENT_04_LEAD`: появляется serious lead на 500 agents.
6. Общий `AGENT_05_ORDER`: buyer формулирует тот же объём и срок.
7. `AGENT_06_LEGAL` читает `g2_neutral_training`: личности сотрудников защищены, но покупка самостоятельно действующих sentient workers всё равно выглядит как работорговля.

---

## 4. Глобальная B3-трасса

### Через Agents

1. В свободном Agents-slot scheduler сохраняет следующую Agents-card и показывает `B3_SALES_PRESSURE_SEED`.
2. Stop → B3 закрыта, точная Agents-card восстанавливается.
3. Continue → Agents-card восстанавливается; проходят два основных Agents-решения.
4. В первом безопасном slot scheduler сохраняет следующую Agents-card и показывает `B3_PAID_OPTOUT_CALLBACK`.
5. Paid opt-out → реальная оплата и отдельная ending.
6. Free opt-out → сохранённая Agents-card восстанавливается.

### Через Padel

1. В свободном Padel-slot scheduler сохраняет следующую Padel-card и показывает seed.
2. Stop → Padel продолжается, callback исключён.
3. Continue → Padel продолжается; callback ждёт два основных решения и первый безопасный slot.
4. Если безопасный slot наступает до ending, paid/free choice работает так же, как в Agents.
5. Если Padel заканчивается раньше, pending callback удаляется без появления после финала.

---

## 5. Независимость B3 и G2

- B3 eligibility не читает `deploy_route`, `demo_route`, empathy flags или Agents card IDs.
- G2 eligibility требует только `Publish one demo` и существует исключительно внутри Agents.
- B3 может временно пересечь G2-run лишь в свободном slot после завершения immediate `AGENT_02_DEV → G2_TRAINING_CHOICE` pair.
- B3 не меняет training origin, sentience, 500-agent order или legal consequence.
- G2 не создаёт и не усиливает B3 prospect; paid opt-out не является реакцией на empathy agents.
- Если B3 paid callback завершает run, любые дальнейшие G2/Agents beats закономерно не показываются. Это terminal priority, а не зависимость сюжетов.

## 6. Точный список затронутых карточек

### Новые карточки

1. `B3_SALES_PRESSURE_SEED` — global side-story seed.
2. `B3_PAID_OPTOUT_CALLBACK` — global delayed callback.
3. `G2_TRAINING_CHOICE` — immediate Agents decision после controlled demo.

### Существующие карточки с необходимыми изменениями/условными версиями

1. `AGENT_02_DEV` — demo choice ведёт в `G2_TRAINING_CHOICE`; Deploy не связан с B3.
2. `AGENT_03_HYPE` — две содержательные версии: `AGENT_03_HYPE_TEAM` и `AGENT_03_HYPE_NEUTRAL`.
3. `AGENT_06_LEGAL` — один ID с двумя необходимыми смысловыми условиями для team/neutral origin.

### Существующие карточки без отдельных версий

- `AGENT_04_LEAD` — общий serious-lead beat.
- `AGENT_05_ORDER` — общий заказ 500 agents.
- `PRESS_CAPITALISM` — не участвует в B3 и не меняется ради этой микроветки.
- Все Padel cards — не требуют B3-specific copy или вариантов; интеграция происходит только через global queue/resume scheduler.

## 7. Границы checkpoint

- B3 — ровно две cards и не third arc.
- G2 — ровно одна новая card и две версии hype плюс conditional legal detail.
- Новых персонажей и handles нет.
- Cash появляется в B3 только после реальной оплаты; G2 не создаёт Cash.
- Internal work в G2 не даёт Customers.
- Никакое решение не отменяется через `too late`.
- Основная queued card восстанавливается только при продолжении run; ending очищает queue.
