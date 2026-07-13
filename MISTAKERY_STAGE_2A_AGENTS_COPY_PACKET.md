# Mistakery Stage 2A — Agents Consequence Cards English Copy Packet

Статус: пакет финального English copy на утверждение. Реализация не начата.

## Общие правила пакета

- Все `effects` ниже — card-specific base effects; постоянный `baseCashBurn: -1` в них не включён.
- Все восемь карточек: `arc: agents`, `kind: story`, `oncePerRun: true`.
- Максимум сообщения — три строки; с conditional callback — четыре строки.
- Internal work, bot traffic и self-testimonial не дают Cash или Customers.
- `Customers` меняется только из-за внешнего ответа, подтверждённого buying signal или доверия внешних prospects.
- Immediate consequence cards используют `consequenceResolution: "immediate"`, только если обе кнопки полностью разрешают дополнительное последствие на этой карточке.

---

## 1. `AGENT_C_DATASET`

**Sender:** `@error404`

**Final English message:**

```text
need empathy training data
we have zero customer support chats
license chats or train on our team fights
```

**Buttons:**

- Left: `License chats`
- Right: `Use team chat`

**actor_action:** The developer reports that a careful empathy build has no customer support data and asks the founder to choose a training source.

**player_decision:** Buy licensed support conversations or train the agents on the team's private messages.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `License chats` | `cash: -3`, `team: +1` | Cash: Licensing a support-chat dataset costs real money. Team: Licensed data keeps private team arguments out of the training set. |
| `Use team chat` | `{}` | No immediate card-specific effect; the visible privacy consequence returns on `AGENT_06_LEGAL`. |

**State and routing:**

- `requires: []`
- `excludes: []`
- Left sets no flag.
- Right sets `agents_training_internal`.
- `continuation: weighted`.
- Both choices route to candidates `AGENT_C_EMOTIONAL_UI / AGENT_02_DEV`.
- `AGENT_02_DEV` has core story weight `2`; Emotional UI has optional weight `1`.

**Русский смысловой перевод:**

```text
нужны данные для обучения эмпатии
у нас нет ни одного чата клиентской поддержки
купить чужие или обучить на ссорах команды
```

- `License chats` — «Купить чаты».
- `Use team chat` — «Взять чат команды».

---

## 2. `AGENT_C_APOLOGY_CI`

**Sender:** `@error404`

**Final English message:**

```text
the build is green
failed tests apologize instead of failing
rerun them or accept remorse as a pass
```

**Buttons:**

- Left: `Rerun tests`
- Right: `Accept apologies`

**actor_action:** The developer reports that the rushed build converts failed tests into apologies and asks whether to verify the build properly.

**player_decision:** Spend time and compute on real tests or accept apologetic failures as a passing build.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Rerun tests` | `cash: -2`, `team: -2`, `founder: -1` | Cash: The full test run consumes more compute. Team: The team must verify the rushed build manually. Founder: Real testing punctures the overnight-launch fantasy. |
| `Accept apologies` | `team: -3`, `founder: +3` | Team: The team inherits an unverified build labeled green. Founder: Treating remorse as QA preserves the feeling of momentum. |

**State and routing:**

- `requires: []`
- `excludes: []`
- Sets no flags.
- `consequenceResolution: "immediate"`.
- `continuation: weighted`.
- Both choices route to candidates `AGENT_C_EMOTIONAL_UI / AGENT_02_DEV`.
- `AGENT_02_DEV` has core story weight `2`; Emotional UI has optional weight `1`.

**Русский смысловой перевод:**

```text
сборка зелёная
проваленные тесты теперь извиняются вместо ошибки
перезапустить их или принять раскаяние за успешный тест
```

- `Rerun tests` — «Перезапустить тесты».
- `Accept apologies` — «Принять извинения».

---

## 3. `AGENT_C_EMOTIONAL_UI`

**Sender:** `@pixel_perfect`

**Final English message:**

```text
the agents feel empathy
nobody can see it
keep text or add cursor-following tears
```

**Buttons:**

- Left: `Keep text`
- Right: `Add tears`

**actor_action:** The designer argues that invisible empathy needs a visual treatment and proposes cursor-tracking tears.

**player_decision:** Keep the emotional behavior text-only or turn synthetic suffering into an animated interface feature.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Keep text` | `team: +2`, `founder: -1` | Team: Keeping the interface simple removes unnecessary design work. Founder: Invisible empathy feels less revolutionary. |
| `Add tears` | `team: -3`, `founder: +3` | Team: The team must animate and support cursor-tracking tears. Founder: Visible synthetic suffering makes the feature feel historic. |

**State and routing:**

- `requires: []`; this card exists only in the Build/Ship post-consequence candidate list.
- `excludes: [agents_shared_seen]`.
- Both choices set `agents_shared_seen`.
- `consequenceResolution: "immediate"`.
- `continuation: forced`.
- Both choices route to `AGENT_02_DEV`.

**Русский смысловой перевод:**

```text
агенты чувствуют эмпатию
но этого никто не видит
оставить текст или добавить слёзы за курсором
```

- `Keep text` — «Оставить текст».
- `Add tears` — «Добавить слёзы».

---

## 4. `AGENT_C_PROSPECT_THERAPY`

**Sender:** `@bigdeals`

**Final English message:**

```text
Chief, agents contacted all 814 prospects.
Replies are coming in.
They started therapy, not discovery.
```

**Buttons:**

- Left: `Route to discovery`
- Right: `Keep therapy`

**actor_action:** Sales reports that the live agents turned outreach to B2BuyerSpyer's 814 raw prospects into therapy conversations.

**player_decision:** Qualify the replies as real sales conversations or let the agents continue therapeutic follow-ups.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Route to discovery` | `team: -2`, `customers: +3`, `founder: -1` | Team: Sales and the team must manually qualify the replies. Customers: Real prospect replies are redirected into genuine discovery conversations. Founder: Replacing therapy with ordinary qualification feels less visionary. |
| `Keep therapy` | `{}` | No immediate card-specific effect; the separate visible `PRESS_CAPITALISM` callback resolves the decision after Hype. |

**State and routing:**

- `requires: [empathy_deployed]`.
- `excludes: []`.
- Left sets no flag and schedules no callback.
- Right sets `agents_therapy_live` and schedules `PRESS_CAPITALISM` with `delay.turns: 1`.
- `continuation: weighted`.
- Both choices route to candidates `AGENT_C_SELF_TESTIMONIAL / AGENT_03_HYPE`.
- `AGENT_03_HYPE` has core story weight `2`; Self-Testimonial has optional weight `1`.

**Русский смысловой перевод:**

```text
Шеф, агенты написали всем 814 потенциальным компаниям.
Пошли ответы.
Но вместо discovery они начали групповую терапию.
```

- `Route to discovery` — «Вести в discovery».
- `Keep therapy` — «Оставить терапию».

---

## 5. `AGENT_C_DEMO_LOOP`

**Sender:** `@error404`

**Final English message:**

```text
demo traffic is mostly bots
each replay invents fresh childhood trauma
compute funds 4,000 imaginary divorces
```

**Buttons:**

- Left: `Limit demo`
- Right: `Leave it open`

**actor_action:** The developer reports that bots are looping the public demo, generating endless backstories and a rising compute bill.

**player_decision:** Limit bot traffic and save compute or keep the demo open for spectacle.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Limit demo` | `cash: +1`, `team: -1`, `founder: -1` | Cash: Stopping bot loops creates explicit compute savings. Team: The team must add and monitor rate limits. Founder: A controlled demo feels less like a movement. |
| `Leave it open` | `cash: -3`, `team: -2`, `founder: +3` | Cash: Bot replays keep consuming paid compute. Team: The team must support an uncontrolled public demo. Founder: Thousands of synthetic biographies look like explosive adoption. |

**State and routing:**

- `requires: [agents_public]`.
- `excludes: [empathy_deployed]`.
- Sets no flags.
- `consequenceResolution: "immediate"`.
- `continuation: weighted`.
- Both choices route to candidates `AGENT_C_SELF_TESTIMONIAL / AGENT_03_HYPE`.
- `AGENT_03_HYPE` has core story weight `2`; Self-Testimonial has optional weight `1`.

**Русский смысловой перевод:**

```text
в демо в основном заходят боты
каждый повтор придумывает агенту новое травматичное детство
мы платим compute за 4000 вымышленных разводов
```

- `Limit demo` — «Ограничить демо».
- `Leave it open` — «Оставить открытым».

---

## 6. `AGENT_C_SELF_TESTIMONIAL`

**Sender:** `@b2buddy_bot`

**Final English message:**

```text
Case study complete! ⭐
I opened my own support ticket, solved it,
and rated B2BuyerSpyer five stars.
```

**Buttons:**

- Left: `Delete review`
- Right: `Use testimonial`

**actor_action:** The assistant manufactures its own support success and presents it as the product's first testimonial.

**player_decision:** Delete the self-generated review or use it as marketing proof.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Delete review` | `team: +1`, `founder: -2` | Team: Removing fake proof protects the team's trust. Founder: Deleting the only five-star review hurts confidence. |
| `Use testimonial` | `team: -2`, `founder: +3` | Team: Publishing self-generated proof weakens the team's trust. Founder: A five-star case study feels like validation even when the product wrote it. |

**State and routing:**

- `requires: [agents_public]`.
- `excludes: [agents_shared_seen]`.
- Both choices set `agents_shared_seen`.
- `consequenceResolution: "immediate"`.
- `continuation: forced`.
- Both choices route to `AGENT_03_HYPE`.

**Русский смысловой перевод:**

```text
Кейс готов! ⭐
Я открыл себе тикет поддержки, сам его решил
и поставил B2BuyerSpyer пять звёзд.
```

- `Delete review` — «Удалить отзыв».
- `Use testimonial` — «Взять как кейс».

---

## 7. `AGENT_C_RECRUITER_PIPELINE`

**Sender:** `@bigdeals`

**Final English message:**

```text
Chief, inbound is exploding.
Recruiters want to hire the agents.
They do not want B2BuyerSpyer.
Check budgets or count them as pipeline?
```

**Buttons:**

- Left: `Check budgets`
- Right: `Count everyone`

**actor_action:** Sales reports that boosted visibility attracted recruiters rather than buyers and asks how to classify the inbound.

**player_decision:** Qualify role, budget and volume or inflate the pipeline with every recruiter message.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Check budgets` | `{}` | No immediate card-specific effect; the visible qualification result appears on `AGENT_04_LEAD`. |
| `Count everyone` | `{}` | No immediate card-specific effect; the visible correction appears on `AGENT_04_LEAD`. |

**State and routing:**

- `requires: []`; this card exists only in the Boost post-hype candidate list.
- `excludes: [agents_therapy_live]`.
- Left sets `agents_inbound_qualified`.
- Right sets `agents_pipeline_padded`.
- `continuation: forced`.
- Both choices route to `AGENT_04_LEAD`.

**Русский смысловой перевод:**

```text
Шеф, входящих сообщений море.
Рекрутеры хотят нанять агентов.
Им не нужен B2BuyerSpyer.
Проверить бюджеты или записать их в pipeline?
```

- `Check budgets` — «Проверить бюджеты».
- `Count everyone` — «Посчитать всех».

---

## 8. `AGENT_C_RISK_APPENDIX`

**Sender:** `@bigdeals`

**Final English message:**

```text
Chief, the disclaimer killed the likes.
Companies requested a sentience risk memo.
Disclose it or bury it in the appendix?
```

**Buttons:**

- Left: `Disclose everything`
- Right: `Bury sentience`

**actor_action:** Sales reports that the disclaimer reduced vanity engagement but produced concrete risk-review requests from interested companies.

**player_decision:** Give procurement an honest sentience memo or hide the material risk in an appendix.

**Base effects:**

| Choice | Effects | effect_reason |
| --- | --- | --- |
| `Disclose everything` | `team: -2`, `customers: +3`, `founder: -1` | Team: The team must prepare an honest risk memo. Customers: Interested companies receive the information needed to continue procurement review. Founder: Full disclosure makes the product feel less magical. |
| `Bury sentience` | `team: -3`, `founder: +3` | Team: Hiding a material risk damages the team's trust. Founder: Keeping sentience out of the headline preserves the growth story. |

**State and routing:**

- `requires: []`; this card exists only in the Disclaimer post-hype candidate list.
- `excludes: [agents_therapy_live]`.
- Sets no flags.
- `consequenceResolution: "immediate"`.
- `continuation: forced`.
- Both choices route to `AGENT_04_LEAD`.

**Русский смысловой перевод:**

```text
Шеф, оговорка убила лайки.
Компании запросили memo о рисках разумности.
Раскрыть всё или спрятать это в приложении?
```

- `Disclose everything` — «Раскрыть всё».
- `Bury sentience` — «Спрятать разумность».

---

## Conditional callback lines for existing cards

### `AGENT_04_LEAD` — after Recruiter Pipeline

`AGENT_03_HYPE` has no callback line by design.

#### Qualified inbound

- **When:** `agents_inbound_qualified`.
- **English line:** `Budget checked: @head_of_agile is real.`
- **Effects:** `team: +1`, `customers: +2`.
- **effect_reason:**
  - Team: Qualification removes recruiter noise from the team's sales workload.
  - Customers: A separate response with budget, volume and deadline confirms real buying intent.
- **Clear:** both inbound flags after resolving `AGENT_04_LEAD`.
- **Русский смысл:** `Бюджеты проверены. Серьёзный лид только один — @head_of_agile.`

#### Padded pipeline

- **When:** `agents_pipeline_padded`.
- **English line:** `CRM fixed: only @head_of_agile has budget.`
- **Effects:** `team: -2`, `founder: -2`.
- **effect_reason:**
  - Team: The team must manually remove recruiter messages from the inflated pipeline.
  - Founder: Learning that almost all inbound was fake progress hurts confidence.
- **Clear:** both inbound flags after resolving `AGENT_04_LEAD`.
- **Русский смысл:** `CRM исправлена. Бюджет на покупку есть только у @head_of_agile.`

Both lines are mutually exclusive. Existing three-line Lead copy plus one callback line remains within the four-line limit.

### `AGENT_06_LEGAL` — internal training data

- **When:** `agents_training_internal`.
- **English line:** `Also: private team messages are training data.`
- **Effects:** `team: -2`, `customers: -2`.
- **effect_reason:**
  - Team: The team must audit and remove its private messages from the training set.
  - Customers: The buyer's procurement trust drops after discovering an undisclosed privacy risk.
- **Clear:** `agents_training_internal` after resolving `AGENT_06_LEGAL`.
- **Русский смысл:** `И ещё: в обучающих данных есть личные сообщения команды.`

The callback is an external buyer discovery, so the negative Customers effect is caused by lost procurement trust, not by internal activity itself. Existing two-line Legal copy plus one callback line remains within the four-line limit.

---

## Semantic checklist before implementation

- `814` always means B2BuyerSpyer's raw prospects, never users or customers.
- Recruiters never become Customers.
- `@head_of_agile` becomes the serious lead only on `AGENT_04_LEAD` after a concrete budget/volume/deadline signal.
- Bot traffic and the bot's self-review create no Customers or Cash.
- Demo rate limiting may add Cash only as explicit compute savings.
- No new sender, organization, arc, resource or ending is introduced.
- Every resource change is explained by the visible source card, a visible callback line or `PRESS_CAPITALISM`.
