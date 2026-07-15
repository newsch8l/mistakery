# Mistakery — Stage 2B Package A Copy Audition

**Status:** author-approved copy, awaiting production integration.

The ten cards below are the complete approved Package A copy checkpoint. Each card has one approved message and one approved button pair. They are not yet integrated into `cards.json`, the scheduler, or the game.

The fact locks and placements remain binding during later production integration. The approved wording, punctuation, casing, line breaks, and buttons must not be edited during that step.

## 1. Restricted AI Payroll — seed

**Положение:** `agents_entry_seed`, после входа в Agents и до `AGENT_01`. Показывается только после существующего выбора **Promise revenue**.

**Sender:** Investor @unicorn_hunter.

**Fact lock:** Payroll не решён. Investor предлагает cloud credits, которыми можно оплачивать servers и AI compute, но нельзя платить зарплаты. Credits не являются Cash, invoice или revenue. Никто ещё не получил зарплату. Customer signal не появляется.

> I BOUGHT CLOUD CREDITS.  
> SERVERS GET PAID. YOUR PEOPLE DON'T.  
> BRING ME REVENUE BEFORE YOU ASK FOR CASH.

**Buttons:** `Accept credits` / `Demand payroll`

## 2. Restricted AI Payroll — callback

**Положение:** reserved callback в `agents_pre_serious_lead`, после `AGENT_03_HYPE` и до `AGENT_04_LEAD`.

**Sender:** Dev @error404.

**Fact lock:** AI/compute полностью обеспечен, пока payroll живой team задержан. Dev может сократить AI hours до того, как люди уйдут. Здесь нет вопроса о правах AI, выплаты зарплат, customer или payment.

> the ai is fully funded  
> payroll isn't  
> i can cut its hours before the team walks

**Buttons:** `Keep AI running` / `Cut AI hours`

## 3. Dev Hostage — seed

**Положение:** `agents_entry_seed`, после входа в Agents и до `AGENT_01`. Требует unresolved payroll и видимый payroll risk для Dev.

**Sender:** Dev @error404.

**Fact lock:** Investor публично назвал Dev заменяемым. Продукт продолжает работать, но Dev останавливает выпуск новых обновлений. Founder выбирает публично защитить Dev либо обойти его и восстановить возможность выпускать обновления. Dev не увольняется, не уничтожает продукт, не крадёт и не сливает код и остаётся доступен будущим карточкам. Cash и Customers не меняются.

> investor says i'm replaceable  
> cool. the product stays online  
> updates stop until you tell everyone he was wrong

**Buttons:** `Defend Dev` / `Bypass Dev`

## 4. Dev Hostage — callback

**Положение:** reserved callback в `agents_pre_serious_lead`, после `AGENT_03_HYPE` и до `AGENT_04_LEAD`.

**Sender:** Dev @error404.

**Fact lock:** Обновления снова работают. Founder выбирает письменные правила доступа либо временный shortcut, который снова оставляет Dev аварийной точкой вызова. Dev остаётся в компании и доступен будущим карточкам. Cash и Customers не меняются.

> updates work again  
> write down who gets access this time  
> the shortcut still ends with you calling me at 3am

**Buttons:** `Write rules` / `Use shortcut`

## 5. Mom vs Investor — seed

**Положение:** `opening_shared_seed`, после `OPEN_04` и до `OPEN_05`, только в health-control class. Fake Founder Coma исключается на весь run.

**Sender:** Mom @i_love_cats72.

**Fact lock:** Mom видит, что founder не ест и не спит. Путь к контакту Investor приходит только из повторяющегося money-demand notification на телефоне founder. Mom не знает runway, cap table, fundraising, product architecture или startup vocabulary. Founder разрешает её звонок либо сам принимает звонок Investor.

> That man keeps calling about money.You aren't eating.  
> You aren't sleeping.Give me his number

**Buttons:** `Let Mom call` / `Take his call`

## 6. Mom vs Investor — callback

**Положение:** reserved callback в `opening_health_resolution`, после `OPEN_05` и до `OPEN_06`.

**Sender:** Investor @unicorn_hunter.

**Fact lock:** Mom действительно связалась с Investor. Founder выбирает краткосрочную бытовую границу Mom либо directive Investor продолжать работу. Это не funding event: Cash, Customers и route availability не меняются.

> YOUR MOTHER CALLED ME ABOUT SLEEP.  
> I DIDN'T FUND A BEDTIME.  
> GET BACK TO WORK.

**Buttons:** `Take Mom's break` / `Keep working`

## 7. Fake Founder Coma — seed

**Положение:** `opening_shared_seed`, после `OPEN_04` и до `OPEN_05`, только в health-control class. Mom vs Investor исключается на весь run.

**Sender:** Marketer @hype_queen.

**Fact lock:** Founder visibly overworked. Marketer до публикации предлагает соврать, что founder впал в кому из-за работы. Она ещё ничего не публиковала и не создала reaction, registration, customer или Cash. Founder заранее разрешает post либо блокирует историю.

> okay hear me out  
> we say you worked yourself into a coma  
> tragic founder lore. people will eat this up 😭

**Buttons:** `Approve post` / `Kill story`

## 8. Fake Founder Coma — authorized callback

**Положение:** `opening_health_resolution`, после `OPEN_05` и до `OPEN_06`, только если story была заранее authorized.

**Sender:** Marketer @hype_queen.

**Fact lock:** Ложный coma post опубликован и получил реальную внешнюю реакцию. Люди спрашивают, что построила команда. Это attention/interest signal, а не customer, payment или validation. Founder оставляет post либо удаляет его. Cash не меняется.

> oh my god they believed the coma 😭  
> people are asking what we built  
> do not wake up online yet

**Buttons:** `Keep post` / `Delete post`

## 9. Fake Founder Coma — blocked callback

**Положение:** `opening_health_resolution`, после `OPEN_05` и до `OPEN_06`, только если story была заранее blocked.

**Sender:** Marketer @hype_queen.

**Fact lock:** Coma post не опубликован, внешней реакции нет. Реальная перегрузка founder остаётся. Игрок выбирает настоящий отдых либо продолжение работы без отдыха. Customers, Cash и новый public event не создаются.

> fine. no coma post  
> you still look like shit though  
> go home. this one isn't content

**Buttons:** `Go home` / `Keep working`

## 10. Mom Flyers

**Положение:** `opening_health_resolution`, после `OPEN_05` и до `OPEN_06`, только когда нет health seed, reservation или due callback и Founder находится в диапазоне 66–78.

**Sender:** Mom @i_love_cats72.

**Fact lock:** Mom знает публичное название B2BuyerSpyer из пяти месяцев семейных разговоров и номер founder как мать. Она уже разместила бумажные flyers с названием и номером, чтобы найти помощь перегруженному ребёнку. Это не sales outreach. Prospect, lead, user, customer, payment и Cash не появляются. Founder снимает flyers либо оставляет их.

> I put up flyers.  
> B2BuyerSpyer and your phone number are on them  
> They say you need help.Don't be mad

**Buttons:** `Take them down` / `Leave them up`

## Integration boundary

This checkpoint approves copy only. Production integration remains a separate task and must not begin from this document alone.
