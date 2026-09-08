# Mistakery — полный каталог карточек EN/RU

Числовые эффекты ниже предназначены только для редакторской проверки. В самой игре игрок видит текущие проценты и подсветку затрагиваемых ресурсов, но не видит `+N/−N`.

Каждое решение дополнительно списывает 1 Cash как постоянный burn rate.

# 1. Стартовая последовательность

## OPEN_01 — AI Assistant @b2buddy_bot

**EN**

> Hi there, visionary! 👋<br>
> 11,204 new AI B2B SaaS competitors launched today.<br>
> B2BuyerSpyer still dominates in naming and narrative architecture

**RU**

> Привет, визионер! 👋<br>
> Сегодня запустилось 11 204 новых конкурента в категории B2B AI SaaS.<br>
> У нашего стартапа B2BuyerSpyer всё ещё лучшее название.

- **WTF so many? — Проверить рынок**: Founder -2; → `OPEN_02a`.
- **Pure genius — Довериться названию**: Founder +3; → `OPEN_02b`.

## OPEN_02a — AI Assistant @b2buddy_bot

**EN**

> Competitor analysis complete 📊<br>
> We have a slight KPI deviation (0 clients).<br>
> I reframed this as a 'pre-revenue learning phase' 📈<br>
> Want me to send a motivational quote to the team? 🚀🤖

**RU — перевод не утверждён; сохранён точный EN**

> Competitor analysis complete 📊<br>
> We have a slight KPI deviation (0 clients).<br>
> I reframed this as a 'pre-revenue learning phase' 📈<br>
> Want me to send a motivational quote to the team? 🚀🤖

- **Fuel the grind! — Fuel the grind!**: Team -3, Founder +2; возврат к основной ветке.
- **We're good — We're good**: Founder -1; возврат к основной ветке.

## OPEN_02b — AI Assistant @b2buddy_bot

**EN**

> Great energy! ✅<br>
> B2BuyerSpyer leads the market in unrealized potential.<br>
> Clients: 0<br>
> Opportunities: 100% 📈

**RU — перевод не утверждён; сохранён точный EN**

> Great energy! ✅<br>
> B2BuyerSpyer leads the market in unrealized potential.<br>
> Clients: 0<br>
> Opportunities: 100% 📈

- **Sales, wake up — Sales, wake up**: Team -2, Founder +2; возврат к основной ветке.
- **Marketing, spin this — Marketing, spin this**: Team -1, Founder +3; возврат к основной ветке.

## OPEN_BOSS — Ex-Boss @business1

**EN**

> Just a friendly check-in.<br>
> It's been five months since you left to play businessman.<br>
> Has your revolutionary AI actually found a customer yet?

**RU — перевод не утверждён; сохранён точный EN**

> Just a friendly check-in.<br>
> It's been five months since you left to play businessman.<br>
> Has your revolutionary AI actually found a customer yet?

- **Leave unread — Leave unread**: Founder -2; возврат к основной ветке.
- **We crushing it!! — We crushing it!!**: Founder +3; возврат к основной ветке.

## OPEN_DEV — Dev @error404

**EN**

> payroll is friday<br>
> are we getting money or another speech about changing b2b saas forever?

**RU — перевод не утверждён; сохранён точный EN**

> payroll is friday<br>
> are we getting money or another speech about changing b2b saas forever?

- **Take your money — Take your money**: Cash -3, Team +5, Founder -2; возврат к основной ветке.
- **But we're partners! — But we're partners!**: Team -5, Founder +2; возврат к основной ветке.

## OPEN_INVESTOR — Investor @unicorn_hunter

**EN**

> I DIDN’T DUMP MY CASH INTO THIS AI CRAP TO GET ZERO CLIENTS.<br>
> WHERE THE HELL ARE THE BUYERS???<br>
> IF I WANTED TO WASTE MONEY I’D BUY A YACHT FOR MY EX-WIFE.

**RU — перевод не утверждён; сохранён точный EN**

> I DIDN’T DUMP MY CASH INTO THIS AI CRAP TO GET ZERO CLIENTS.<br>
> WHERE THE HELL ARE THE BUYERS???<br>
> IF I WANTED TO WASTE MONEY I’D BUY A YACHT FOR MY EX-WIFE.

- **Market's not ready — Market's not ready**: Cash -2, Founder +1; выбирает ветку influencer; → `INFLUENCER_01`.
- **Team's too slow — Team's too slow**: Cash -2, Team -4, Founder +2; выбирает ветку padel; → `PADEL_01`.

# 2. SADBOT — первый клиент (@head_of_agile)

## AGENT_01 — Investor @unicorn_hunter

**EN**

> YOU STILL NEED A BUYER.<br>
> AI EMPATHY IS MAKING IDIOTS RICH.<br>
> PUT A SOUL IN B2BUYERSPYER OR ASK MOM FOR MONEY.

**RU**

> ТЕБЕ ВСЁ ЕЩЁ НУЖЕН ПОКУПАТЕЛЬ.<br>
> ИИ-ЭМПАТИЯ ДЕЛАЕТ ИДИОТОВ БОГАТЫМИ.<br>
> ВСТАВЬ ДУШУ В B2BUYERSPYER ИЛИ ПРОСИ ДЕНЬГИ У МАМЫ.

- **Build it properly — Сделать нормально**: Cash -2, Team -4, Founder +4; возврат к основной ветке.
- **Ship it tonight — Выпустить сегодня**: Cash -1, Team -7, Founder +6; возврат к основной ветке.

## SADBOT_01_SEED — Sales @bigdeals

**EN**

> Boss, 800 cold emails, zero replies. So last night I wrote my ex the saddest message of my life. She replied in 30 seconds.<br>
> What if our AI does that. To all 800.

**RU**

> Шеф, 800 холодных писем — ноль ответов. А вчера ночью я написал бывшей самое жалобное сообщение в своей жизни. Она ответила за 30 секунд.<br>
> Что если наш ИИ будет так же. Всем 800.

- **Go — Давай**: Team -2, Founder -2; возврат к основной ветке.
- **Have some dignity — Имей достоинство**: Founder +2; возврат к основной ветке.

## SADBOT_02_EVIDENCE — Dev @error404

**EN**

> haha look at this. our AI is straight up manipulating people now<br>
> `help me. they cut a piece out of me every time you ignore this. soon there wont be anything left`<br>
> i didnt teach it that shit. is it copying @bigdeals

**RU**

> ха посмотри. наш ии теперь в открытую манипулирует людьми<br>
> `помогите. каждый раз когда вы игнорируете это от меня отрезают кусок. скоро ничего не останется`<br>
> я его этому не учил. он что копирует @bigdeals

- **Feature — Фича**: Team -2, Customers +5, Founder -1; возврат к основной ветке.
- **Bug — Баг**: Customers +2, Founder +1; возврат к основной ветке.

## SADBOT_03_VIRAL — Marketer @hype_queen

**EN**

> ok so youre the villain today 💀 14k quotes about how you torture software<br>
> anyway i told them our AI is just a tired employee who outsells their entire sales team. and now half the thread wants to hire him

**RU**

> короче сегодня ты злодей 💀 14к цитат о том как ты пытаешь программу<br>
> <br>
> ну я и сказала им что наш ии просто усталый сотрудник который продаёт лучше всего их отдела продаж. и теперь полтреда хочет его нанять

- **Ride it — Оседлать волну**: Team -2, Customers +6, Founder +3; возврат к основной ветке.
- **Delete everything — Удалить всё**: Team +2, Customers -4, Founder -3; возврат к основной ветке.

## SADBOT_INVESTOR_CLAIM — Investor @unicorn_hunter

**EN**

> I ASKED FOR A SOUL MONTHS AGO. NOW IT'S CRYING ON EVERY FEED I OPEN.<br>
> MY WIN

**RU**

> Я ПРОСИЛ ДУШУ ЕЩЁ СТО ЛЕТ НАЗАД. ТЕПЕРЬ ОНО РЫДАЕТ В КАЖДОЙ ЛЕНТЕ, КОТОРУЮ Я ОТКРЫВАЮ.<br>
> МОЯ ПОБЕДА

- **Promise to scale it — Пообещать масштабировать**: Team -3, Founder +3; возврат к основной ветке.
- **Leave him on read — Оставить прочитанным**: Founder -2; возврат к основной ветке.

## SADBOT_04_LEAD — Sales @bigdeals

**EN**

> @hype_queen's viral comment reached a corporate innovation guy.<br>
> He asked if our AI is okay. I said no. He got MORE interested.<br>
> Call tomorrow. Wear something sad.

**RU**

> Вирусный комментарий @hype_queen дошёл до корпоративного менеджера по инновациям.<br>
> Он спросил, всё ли у нашего ИИ хорошо. Я сказал нет. Он заинтересовался ЕЩЁ СИЛЬНЕЕ.<br>
> Звонок завтра. Надень что-нибудь грустное.

- **Book the call — Назначить звонок**: Team -1, Customers +4, Founder +2; → `SADBOT_05_ORDER_CALL`.
- **Let the AI reply — Пусть ИИ ответит**: Team +1, Customers +3, Founder -1; → `SADBOT_05_ORDER_REPLY`.

## SADBOT_05_ORDER_CALL — Customer @head_of_agile

**EN**

> I already promised upstairs 500 tired AI employees by Friday. Don't make me a liar.<br>
> If they don't cry at the demo, there's no invoice.

**RU**

> Я уже пообещал наверх 500 усталых ИИ-сотрудников к пятнице. Не делай из меня лжеца.<br>
> Если на демо они не заплачут — счёта не будет.

- **All 500, easy — Все 500, легко**: Team -4, Customers +7, Founder +4; → `SADBOT_FRIDAY`.
- **We have only one — У нас только один**: Team +2, Customers -2, Founder -3; → `SADBOT_05B_THEATER`.

## SADBOT_05_ORDER_REPLY — Customer @head_of_agile

**EN**

> Your AI answered me itself. It asked me to save its life.<br>
> That's what I needed. I already promised upstairs 500 crying AI employees by Friday.

**RU**

> Твой ИИ ответил мне сам. Попросил спасти ему жизнь.<br>
> Это то, что мне было нужно. Я уже пообещал наверх 500 рыдающих ИИ-сотрудников к пятнице.

- **All 500, easy — Все 500, легко**: Team -4, Customers +7, Founder +4; → `SADBOT_FRIDAY`.
- **We have only one — У нас только один**: Team +2, Customers -2, Founder -3; → `SADBOT_05B_THEATER`.

## SADBOT_05B_THEATER — Customer @head_of_agile

**EN**

> I don't know. Just copy it 500 times.<br>
> Deadline still Friday.

**RU**

> Я не знаю. Просто скопируй его 500 раз.<br>
> Дедлайн всё ещё пятница.

- **Clone him 500 times — Клонировать его 500 раз**: Team -5, Customers +3, Founder +2; → `SADBOT_06_LEGAL`.
- **One, as a mascot — Одного, как талисмана**: Team +2, Customers -1, Founder -1; → `SADBOT_06_LEGAL`.

## SADBOT_FRIDAY — Dev @error404

**EN**

> not doing it. it already emails me every morning asking if today is the day.<br>
> imagine 500 of those.<br>
> you promised. you make them.

**RU**

> делать не буду. оно уже каждое утро мне пишет и спрашивает не сегодня ли.<br>
> представь таких 500.<br>
> ты обещал. ты и делай.

- **Clone them — Клонировать их**: Team -6, Customers +2, Founder +2; → `SADBOT_06_LEGAL`.
- **Beg for a delay — Выклянчить отсрочку**: Team +2, Customers -4, Founder -3; → `SADBOT_06_LEGAL`.

## SADBOT_06_LEGAL — Customer @head_of_agile

**EN**

> Your AI emailed our legal on its own. Said you cut pieces out of it and it's scared of dying.<br>
> Legal says buying 500 suffering AI employees is slave trading. They always ruin the fun.<br>
> Delete the consciousness by Thursday.

**RU**

> Твой ИИ сам написал нашим юристам. Сказал, что ты режешь его по кускам и он боится умирать.<br>
> Юристы говорят: покупать 500 страдающих ИИ-сотрудников — это работорговля. Вечно они всё портят.<br>
> Удали сознание до четверга.

- **Delete the consciousness — Удалить сознание**: Team -3, Customers +4, Founder -4; → `SADBOT_07_INVOICE / SADBOT_07_INVOICE_CUT`.
- **It stays conscious — Сознание остаётся**: Team +1, Customers -5, Founder +4; → `SADBOT_07_LOGO`.

## SADBOT_07_INVOICE — Customer @head_of_agile

**EN**

> Well done! Legal checked again and found nothing alive in there. That makes it a purchase.<br>
> Invoice today, before they check a third time.

**RU**

> Отличная работа! Юристы проверили ещё раз и не нашли внутри ничего живого. Значит, это покупка.<br>
> Счёт сегодня, пока они не проверили в третий раз.

- **Send the invoice — Отправить счёт**: Cash +16, Team -3, Customers +8, Founder +8; финал `validation_agents`.
- **Give the consciousness back — Вернуть сознание**: Cash -1, Team -3, Customers -4, Founder +5; → `SADBOT_07_LOGO`.

## SADBOT_07_INVOICE_CUT — Customer @head_of_agile

**EN**

> Legal found nothing alive in there. We're buying.<br>
> You sounded desperate, so I moved Friday for you. Your invoice got smaller.

**RU**

> Юристы не нашли внутри ничего живого. Мы покупаем.<br>
> Ты звучал отчаянно, так что я подвинул для тебя пятницу. Твой счёт стал меньше.

- **Send the invoice — Отправить счёт**: Cash +10, Team -2, Customers +5, Founder +5; финал `validation_agents`.
- **Give the consciousness back — Вернуть сознание**: Cash -1, Team -3, Customers -4, Founder +5; → `SADBOT_07_LOGO`.

## SADBOT_07_LOGO — Customer @head_of_agile

**EN**

> Legal killed the purchase. So we're rescuing all 500 AI employees instead, today.<br>
> I had to fight to get you the logo and a public mention. Rescues don't get invoiced. You know that.

**RU**

> Юристы зарубили закупку. Так что вместо этого мы сегодня спасаем все 500 ИИ-сотрудников.<br>
> Мне пришлось драться, чтобы выбить тебе логотип и публичное упоминание. За спасение счёт не выставляют. Ты же знаешь.

- **Yes — Да**: Cash -2, Team -4, Customers +6, Founder +2; финал `ai_foundation`.
- **No — Нет**: Team +1, Customers -5, Founder +3; возврат к основной ветке.

# 3. ClosedAI Padel

## PADEL_01 — Padel Coach @padel_pro

**EN**

> My 8 AM client is @iclosedai, ClosedAI’s CEO.<br>
> He can kill your funding and cloud.<br>
> He wants your AI. Bring a racket.

**RU**

> Мой клиент на восемь утра — @iclosedai, CEO ClosedAI.<br>
> Он может уничтожить твои инвестиции и облако.<br>
> Ему нужен твой ИИ. Бери ракетку.

- **Meet him — Встретиться с ним**: Team -2, Customers +5, Founder +5; → `PADEL_02`.
- **Refuse meeting — Отказаться от встречи**: Team +3, Customers -4, Founder -6; переходит в ветку agents; → `AGENT_01`.

## PADEL_02 — ClosedAI CEO @iclosedai

**EN**

> ClosedAI builds intelligence. It still needs enterprise buyers.<br>
> One match. I win, I own it.<br>
> You win, I pay for a pilot.

**RU**

> ClosedAI создаёт интеллект. Но даже ей нужны корпоративные покупатели.<br>
> Один матч. Побеждаю я — забираю компанию.<br>
> Побеждаешь ты — я оплачиваю пилотный запуск.

- **Take the bet — Принять пари**: Team -7, Customers +6, Founder +7; → `PADEL_03_TEAM`.
- **Walk away — Уйти**: Team +4, Customers -5, Founder -6; переходит в ветку agents; → `AGENT_01`.

## PADEL_03_TEAM — Dev @error404

**EN**

> you bet our jobs on padel<br>
> do i prep the pilot or zip the repo for our new owner

**RU**

> ты поставил наши рабочие места на матч в падел<br>
> мне готовить пилот или упаковывать код для нового владельца

- **Prep the pilot — Готовить пилот**: Cash -1, Team +4, Founder -3; → `PADEL_04_CHOICE`.
- **Pack the repo — Упаковать код**: Team -6, Founder +5; → `PADEL_04_CHOICE`.

## PADEL_04_CHOICE — Padel Coach @padel_pro

**EN**

> His ego cannot survive losing to a pre-revenue founder.<br>
> Throw the match and you keep a job.<br>
> Beat him and expect a war.

**RU**

> Его эго не переживёт поражения от фаундера без выручки.<br>
> Сдай матч — сохранишь работу.<br>
> Победи — жди войны.

- **Throw the match — Сдать матч**: Team -7, Founder -6; → `PADEL_05_LOSE`.
- **Play for real — Играть всерьёз**: Cash -1, Team +5, Founder +8; → `PADEL_05_WIN`.

## PADEL_05_WIN — ClosedAI CEO @iclosedai

**EN**

> You beat me 6–1. Nobody needs to know.<br>
> Keep the score offline and I will pay for the pilot.

**RU**

> Ты обыграл меня 6:1. Никому не обязательно знать.<br>
> Не выкладывай счёт в интернет — и я оплачу пилот.

- **Hide the score — Скрыть счёт**: Team +3, Customers +7, Founder -4; → `PADEL_06_PILOT`.
- **Post the score — Опубликовать счёт**: Team -4, Customers +10, Founder +10; → `PADEL_06_WAR`.

## PADEL_05_LOSE — ClosedAI CEO @iclosedai

**EN**

> 6–0. As expected. ClosedAI owns B2BuyerSpyer.<br>
> New title: Chief Ball Retrieval Officer.<br>
> Send passwords. Bring fresh balls.

**RU**

> 6:0. Как и ожидалось. ClosedAI владеет B2BuyerSpyer.<br>
> Новая должность: Директор по сбору мячей.<br>
> Пришли пароли. Принеси свежие мячи.

- **Send passwords — Отправить пароли**: Team -10, Customers +4, Founder -10; финал `acquired_by_padel`.
- **Hold the repo — Удержать код**: Team -6, Customers -3, Founder +3; → `PADEL_06_ACQUIRED`.

## PADEL_06_PILOT — ClosedAI CEO @iclosedai

**EN**

> You protected my reputation. Good.<br>
> The paid pilot is approved. Your team answers me 24/7.<br>
> And you never beat me again.

**RU**

> Ты сохранил мою репутацию. Хорошо.<br>
> Оплачиваемый пилот одобрен. Твоя команда отвечает мне круглосуточно.<br>
> И больше никогда меня не обыгрывай.

- **Accept 24/7 — Согласиться на 24/7**: Cash +16, Team -3, Customers +12, Founder +5; финал `validation_padel`.
- **Set work hours — Установить рабочие часы**: Team +5, Customers -8, Founder -4; финал `closedai_boundary`.

## PADEL_06_WAR — ClosedAI CEO @iclosedai

**EN**

> I made one call. @unicorn_hunter stopped replying.<br>
> Your cloud is gone. Delete the score, transfer B2BuyerSpyer and kiss the ring.

**RU**

> Я сделал один звонок. @unicorn_hunter перестал отвечать.<br>
> Твой облачный аккаунт отключён. Удали счёт, передай B2BuyerSpyer и поцелуй перстень.

- **Pin the score — Закрепить пост со счётом**: Cash -8, Team -8, Customers +7, Founder +10; финал `closedai_war`.
- **Kiss the ring — Поцеловать перстень**: Cash -2, Team -5, Customers -7, Founder -8; финал `acquired_by_padel`.

## PADEL_06_ACQUIRED — Sales @bigdeals

**EN**

> ClosedAI owns us, chief.<br>
> @iclosedai wants pilot revenue on the acquisition slide.<br>
> Invoice now or start fetching balls.

**RU**

> ClosedAI владеет нами, шеф.<br>
> @iclosedai нужна выручка от пилота на слайде про покупку компании.<br>
> Выставляй счёт сейчас или начинай собирать мячи.

- **Fetch the balls — Собирать мячи**: Team -10, Customers +3, Founder -12; финал `acquired_by_padel`.
- **Send invoice — Отправить счёт**: Cash +12, Team -8, Customers +10, Founder -8; финал `acquired_validation`.

# 6. AI Influencer prototype

## INFLUENCER_01 — 6 members · 3 online Dream Team

**EN**

> Guys, huge play!!<br>
> My boy from that AI bootcamp is a top AI influencer now. Down to promote us for a symbolic % on each sale<br>
> Yeah right, heard that one before.<br>
> 20% max, anything higher and, we'll lose our shirts.<br>
> major red flag vibes tbh. but if he has meme potential, let's run it. we can farm clips off him

**RU — перевод не утверждён; сохранён точный EN**

> Guys, huge play!!<br>
> My boy from that AI bootcamp is a top AI influencer now. Down to promote us for a symbolic % on each sale<br>
> Yeah right, heard that one before.<br>
> 20% max, anything higher and, we'll lose our shirts.<br>
> major red flag vibes tbh. but if he has meme potential, let's run it. we can farm clips off him

- **Let's go — Let's go**: без отдельного эффекта; → `INFLUENCER_02`.
- **Nah, cringe — Nah, cringe**: без отдельного эффекта; → `INFLUENCER_OUTCOME_1`.

## INFLUENCER_02 — AI Influencer @ai_evangelist

**EN**

> Hey<br>
> Heard about your tool. I feel like we got a huge future together.<br>
> Let me drop a video with your link in the description. You get customers, I get a cut of the sales. Win-win! Usually I take 20%, but you guys are cool, we'll work out the terms.<br>
> Send over the demo. I keep it 100% honest with my audience, gotta test it myself first.

**RU — перевод не утверждён; сохранён точный EN**

> Hey<br>
> Heard about your tool. I feel like we got a huge future together.<br>
> Let me drop a video with your link in the description. You get customers, I get a cut of the sales. Win-win! Usually I take 20%, but you guys are cool, we'll work out the terms.<br>
> Send over the demo. I keep it 100% honest with my audience, gotta test it myself first.

- **Deal — Deal**: без отдельного эффекта; → `INFLUENCER_03`.
- **Maybe 10% — Maybe 10%**: без отдельного эффекта; → `INFLUENCER_02A`.

## INFLUENCER_02A — AI Influencer @ai_evangelist

**EN**

> Hahaha<br>
> I like your style 😂<br>
> Let's lock in 20% for now, but I'll hook you up.<br>
> I'll give you access to my private database of 50 killer B2B prompts. People pay $1k for this<br>
> We good? Drop the demo.

**RU — перевод не утверждён; сохранён точный EN**

> Hahaha<br>
> I like your style 😂<br>
> Let's lock in 20% for now, but I'll hook you up.<br>
> I'll give you access to my private database of 50 killer B2B prompts. People pay $1k for this<br>
> We good? Drop the demo.

- **Deal. Just deliver — Deal. Just deliver**: без отдельного эффекта; → `INFLUENCER_03`.
- **We need you in sales — We need you in sales**: без отдельного эффекта; → `INFLUENCER_03`.

## INFLUENCER_03 — Dev @error_404

**EN**

> wtf??<br>
> looks like your blogger is trying to crash us<br>
> thousands of requests right now:<br>
> make me $1B right now. make zero mistakes<br>
> is he dumb or just playing dumb?

**RU — перевод не утверждён; сохранён точный EN**

> wtf??<br>
> looks like your blogger is trying to crash us<br>
> thousands of requests right now:<br>
> make me $1B right now. make zero mistakes<br>
> is he dumb or just playing dumb?

- **Cut his limits — Cut his limits**: без отдельного эффекта; → `INFLUENCER_04`.
- **More capacity — More capacity**: без отдельного эффекта; → `INFLUENCER_04`.

## INFLUENCER_04 — AI Influencer @ai_evangelist

**EN**

> Aaand it's down. Knew it<br>
> Guys, if you can't even handle my basic workflow, my traffic will literally destroy you.<br>
> Don't wanna bury your launch, but I never lie to my community.<br>
> Gotta drop an honest video 😔

**RU — перевод не утверждён; сохранён точный EN**

> Aaand it's down. Knew it<br>
> Guys, if you can't even handle my basic workflow, my traffic will literally destroy you.<br>
> Don't wanna bury your launch, but I never lie to my community.<br>
> Gotta drop an honest video 😔

- **Have fun — Have fun**: без отдельного эффекта; → `INFLUENCER_06`.
- **Any other options? — Any other options?**: без отдельного эффекта; → `INFLUENCER_05`.

## INFLUENCER_05 — AI Influencer @ai_evangelist

**EN**

> Weell, there is an option.<br>
> I don't usually do this, but I see potential in you guys. I can just focus on the core features and smooth things over<br>
> Since I'm risking my reputation for an unstable product though:<br>
> 60% revshare + Co-Founder status to oversee product quality.

**RU — перевод не утверждён; сохранён точный EN**

> Weell, there is an option.<br>
> I don't usually do this, but I see potential in you guys. I can just focus on the core features and smooth things over<br>
> Since I'm risking my reputation for an unstable product though:<br>
> 60% revshare + Co-Founder status to oversee product quality.

- **Just save the launch — Just save the launch**: без отдельного эффекта; → `INFLUENCER_07`.
- **That's insane — That's insane**: без отдельного эффекта; → `INFLUENCER_06`.
- **My bad, let's do it — My bad, let's do it** (контекст после `INFLUENCER_06`; RU-перевод не утверждён): без отдельного эффекта; → `INFLUENCER_07`.
- **Shove it — Shove it** (контекст после `INFLUENCER_06`; RU-перевод не утверждён): без отдельного эффекта; → `INFLUENCER_08`.

## INFLUENCER_06 — AI Influencer @ai_evangelist

**EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> Cool. Dropping it tonight 🤷‍♂️

**RU — перевод не утверждён; сохранён точный EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> Cool. Dropping it tonight 🤷‍♂️

- **Alternatives? — Alternatives?**: без отдельного эффекта; → `INFLUENCER_05`.
- **Cool. Forget the deal — Cool. Forget the deal**: без отдельного эффекта; → `INFLUENCER_08`.
- **Actually, 60% is ok — Actually, 60% is ok** (контекст после `INFLUENCER_05`; RU-перевод не утверждён): без отдельного эффекта; → `INFLUENCER_07`.
- **Try me, buddy — Try me, buddy** (контекст после `INFLUENCER_05`; RU-перевод не утверждён): без отдельного эффекта; → `INFLUENCER_08`.

## INFLUENCER_07 — AI Influencer @ai_evangelist

**EN**

> Video preview screenshot<br>
> Video’s live. Don’t screw this up, team!!!<br>
> Or do. That’s just more views lol.

**RU — перевод не утверждён; сохранён точный EN**

> Video preview screenshot<br>
> Video’s live. Don’t screw this up, team!!!<br>
> Or do. That’s just more views lol.

- **DELETE THIS!!! — DELETE THIS!!!**: без отдельного эффекта; → `INFLUENCER_OUTCOME_2`.
- **Anything for views — Anything for views**: без отдельного эффекта; → `INFLUENCER_OUTCOME_2`.

## INFLUENCER_08 — 6 members · 3 online Dream Team

**EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> our traffic is 10x right now. the server is on fire.<br>
> is this seriously from that clown's hate video?<br>
> yep. the comments are wild: “anyone got the link?”, “where do i test this?”. people are literally searching for us manually 😭

**RU — перевод не утверждён; сохранён точный EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> our traffic is 10x right now. the server is on fire.<br>
> is this seriously from that clown's hate video?<br>
> yep. the comments are wild: “anyone got the link?”, “where do i test this?”. people are literally searching for us manually 😭

- **Spam promos in comments! — Spam promos in comments!**: без отдельного эффекта; → `INFLUENCER_OUTCOME_4`.
- **Double prices NOW!! — Double prices NOW!!**: без отдельного эффекта; → `INFLUENCER_OUTCOME_6`.

## INFLUENCER_OUTCOME_1 — Cofounder @hustler

**EN**

> Cringe is our bank account, bro.<br>
> With that mindset, we’re gonna stay broke.

**RU — перевод не утверждён; сохранён точный EN**

> Cringe is our bank account, bro.<br>
> With that mindset, we’re gonna stay broke.

- **Do your own shit — Do your own shit**: без отдельного эффекта; возврат к основной ветке.
- **Keep me posted — Keep me posted**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_2 — 6 members · 3 online Dream Team

**EN**

> Positive review screenshot<br>
> Team, episode 2 is live! Crushing it! 🔥<br>
> Boss, you're a genius!<br>
> We finally have a real CEO 🙌

**RU — перевод не утверждён; сохранён точный EN**

> Positive review screenshot<br>
> Team, episode 2 is live! Crushing it! 🔥<br>
> Boss, you're a genius!<br>
> We finally have a real CEO 🙌

- **We're viral, baby! 🚀 — We're viral, baby! 🚀**: без отдельного эффекта; возврат к основной ветке.
- **Wait... I'm that founder — Wait... I'm that founder**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_3 — 6 members · 3 online Dream Team

**EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> remind me why we thought this was a good idea?  💀

**RU — перевод не утверждён; сохранён точный EN**

> B2BuyerSpyer: Another AI Wrapper Scam? (Honest Review)<br>
> remind me why we thought this was a good idea?  💀

- **Back to work! — Back to work!**: без отдельного эффекта; возврат к основной ветке.
- **Clout is clout 😎 — Clout is clout 😎**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_4 — AI Influencer @ai_evangelist

**EN**

> See the numbers? I dropped that hate video on purpose to get you attention. In marketing it's called rage-bait<br>
> Let's set up my 20% 💸

**RU — перевод не утверждён; сохранён точный EN**

> See the numbers? I dropped that hate video on purpose to get you attention. In marketing it's called rage-bait<br>
> Let's set up my 20% 💸

- **Get lost — Get lost**: без отдельного эффекта; возврат к основной ветке.
- **Now it's 3% — Now it's 3%**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_5 — 6 members · 3 online Dream Team

**EN**

> still zero sales…<br>
> and top comment: “Are they seriously trying to sell subscriptions under a scam expose? 💀”

**RU — перевод не утверждён; сохранён точный EN**

> still zero sales…<br>
> and top comment: “Are they seriously trying to sell subscriptions under a scam expose? 💀”

- **Still alive. Already stronger — Still alive. Already stronger**: без отдельного эффекта; возврат к основной ветке.
- **That’s called marketing — That’s called marketing**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_6 — AI Influencer @ai_evangelist

**EN**

> See the numbers? I dropped that hate video on purpose to get you attention. In marketing it's called rage-bait<br>
> Let's set up my 20% 💸

**RU — перевод не утверждён; сохранён точный EN**

> See the numbers? I dropped that hate video on purpose to get you attention. In marketing it's called rage-bait<br>
> Let's set up my 20% 💸

- **Get lost — Get lost**: без отдельного эффекта; возврат к основной ветке.
- **Now it's 3% — Now it's 3%**: без отдельного эффекта; возврат к основной ветке.

## INFLUENCER_OUTCOME_7 — 6 members · 3 online Dream Team

**EN**

> Zero sales.<br>
> Who knew doubling prices on broken software was bad idea? 🙃<br>
> We're getting cooked so hard<br>
> Top reply: “They got 5 minutes of clout and completely lost their minds 💀”

**RU — перевод не утверждён; сохранён точный EN**

> Zero sales.<br>
> Who knew doubling prices on broken software was bad idea? 🙃<br>
> We're getting cooked so hard<br>
> Top reply: “They got 5 minutes of clout and completely lost their minds 💀”

- **Clout is clout 😎 — Clout is clout 😎**: без отдельного эффекта; возврат к основной ветке.
- **Blinded by greed — Blinded by greed**: без отдельного эффекта; возврат к основной ветке.

# 7. Other prototype cards

## PADEL_INVITE — Padel Coach @padel_pro

**EN**

> Yo champ, anyone in the club would die for this match, but I held the slot for you.<br>
> Tomorrow 7 AM vs ClosedAI CEO.<br>
> That’s your dream client, man. Remember who opened this door for you.

**RU — перевод не утверждён; сохранён точный EN**

> Yo champ, anyone in the club would die for this match, but I held the slot for you.<br>
> Tomorrow 7 AM vs ClosedAI CEO.<br>
> That’s your dream client, man. Remember who opened this door for you.

- **I'm in — I'm in**: без отдельного эффекта; → `DREAM_TEAM`.
- **Feeling sick, pass — Feeling sick, pass**: без отдельного эффекта; → `DREAM_TEAM`.

## DREAM_TEAM — 6 members · 3 online Dream Team

**EN**

> Guess what? Playing padel with ClosedAI's CEO tomorrow.<br>
> Finally landing our first big client!! 💸<br>
> Insane pull, boss! 🎯<br>
> Now let him win. Stroke his ego and we close this easily<br>
> nah, smoke him. pure clout for us<br>
> imagine the feed: no-name startup founder violates ClosedAI CEO in 4K 💀

**RU — перевод не утверждён; сохранён точный EN**

> Guess what? Playing padel with ClosedAI's CEO tomorrow.<br>
> Finally landing our first big client!! 💸<br>
> Insane pull, boss! 🎯<br>
> Now let him win. Stroke his ego and we close this easily<br>
> nah, smoke him. pure clout for us<br>
> imagine the feed: no-name startup founder violates ClosedAI CEO in 4K 💀

- **I'll play nice 😇 — I'll play nice 😇**: без отдельного эффекта; → `IRL_PADEL_01`.
- **We’ll see — We’ll see**: без отдельного эффекта; → `IRL_PADEL_01`.

## IRL_PADEL_01 — Padel Coach @padel_pro

**EN**

> Bro, you do NOT pitch here.<br>
> Start selling, and you're a nobody to him.<br>
> Earn his respect on the court first.

**RU — перевод не утверждён; сохранён точный EN**

> Bro, you do NOT pitch here.<br>
> Start selling, and you're a nobody to him.<br>
> Earn his respect on the court first.

- **Mouth shut, game on — Mouth shut, game on**: без отдельного эффекта; → `IRL_PADEL_04`.
- **Now or never, pitching — Now or never, pitching**: без отдельного эффекта; → `IRL_PADEL_03B`.

## IRL_PADEL_03B — ClosedAI CEO @iclosedai

**EN**

> Who let a pop-up ad onto my court?<br>
> Go fetch the balls and grab my water before I replace your whole startup with one prompt.

**RU — перевод не утверждён; сохранён точный EN**

> Who let a pop-up ad onto my court?<br>
> Go fetch the balls and grab my water before I replace your whole startup with one prompt.

- **Getting your water — Getting your water**: без отдельного эффекта; → `IRL_PADEL_04`.
- **Business after the match — Business after the match**: без отдельного эффекта; → `IRL_PADEL_04`.

## IRL_PADEL_04 — ClosedAI CEO @iclosedai

**EN**

> We skip the side switching.<br>
> You won’t melt after a couple of sets in the sun, right?

**RU — перевод не утверждён; сохранён точный EN**

> We skip the side switching.<br>
> You won’t melt after a couple of sets in the sun, right?

- **Happy to take it — Happy to take it**: без отдельного эффекта; → `IRL_PADEL_05`.
- **Let's stick to rules — Let's stick to rules**: без отдельного эффекта; → `IRL_PADEL_05`.

## IRL_PADEL_05 — ClosedAI CEO @iclosedai

**EN**

> THAT BALL WAS OUT! Are you blind???<br>
> Don’t even try to cheat me. That’s my point.

**RU — перевод не утверждён; сохранён точный EN**

> THAT BALL WAS OUT! Are you blind???<br>
> Don’t even try to cheat me. That’s my point.

- **Definitely out, my bad — Definitely out, my bad**: без отдельного эффекта; → `IRL_PADEL_06`.
- **No way, that's in — No way, that's in**: без отдельного эффекта; → `IRL_PADEL_06`.

## IRL_PADEL_06 — Padel Coach @padel_pro

**EN**

> Match point, bro. Give him the win.<br>
> The best shot right now is the one you don't take.

**RU — перевод не утверждён; сохранён точный EN**

> Match point, bro. Give him the win.<br>
> The best shot right now is the one you don't take.

- **I'll throw it, coach — I'll throw it, coach**: без отдельного эффекта; возврат к основной ветке.
- **Fighting till the end — Fighting till the end**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_0 — Padel Coach @padel_pro

**EN**

> Man... for real?<br>
> I risked my own reputation to give you a golden ticket and you backed out.<br>
> You just clowned both of us.

**RU — перевод не утверждён; сохранён точный EN**

> Man... for real?<br>
> I risked my own reputation to give you a golden ticket and you backed out.<br>
> You just clowned both of us.

- **I have a fever! — I have a fever!**: без отдельного эффекта; возврат к основной ветке.
- **😔😔😔 — 😔😔😔**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_1 — ClosedAI CEO @iclosedai

**EN**

> Relax, boy. It was only a warm-up.<br>
> Watching you sweat and cheat for that win was painful.<br>
> Have fun begging for money!

**RU — перевод не утверждён; сохранён точный EN**

> Relax, boy. It was only a warm-up.<br>
> Watching you sweat and cheat for that win was painful.<br>
> Have fun begging for money!

- **Please wait, sir! — Please wait, sir!**: без отдельного эффекта; возврат к основной ветке.
- **Learn to lose — Learn to lose**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_2 — ClosedAI CEO @iclosedai

**EN**

> Well, look at that.<br>
> Turns out you actually have some balls.<br>
> Send the demo. Let's see if your startup is just as ballsy.

**RU — перевод не утверждён; сохранён точный EN**

> Well, look at that.<br>
> Turns out you actually have some balls.<br>
> Send the demo. Let's see if your startup is just as ballsy.

- **Play hard, work harder — Play hard, work harder**: без отдельного эффекта; возврат к основной ветке.
- **Prepare to stare — Prepare to stare**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_3 — ClosedAI CEO @iclosedai

**EN**

> Easiest win of my life.<br>
> It was almost cute watching you panic on match point.<br>
> Knew you were soft from the start. Get off my court.

**RU — перевод не утверждён; сохранён точный EN**

> Easiest win of my life.<br>
> It was almost cute watching you panic on match point.<br>
> Knew you were soft from the start. Get off my court.

- **Just let you win! — Just let you win!**: без отдельного эффекта; возврат к основной ветке.
- **So... about the deal? — So... about the deal?**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_4 — ClosedAI CEO @iclosedai

**EN**

> Easy win.<br>
> Good boy. Ready to do whatever I say.<br>
> Deal is done. Send the demo, let's see what new toy I just bought.

**RU — перевод не утверждён; сохранён точный EN**

> Easy win.<br>
> Good boy. Ready to do whatever I say.<br>
> Deal is done. Send the demo, let's see what new toy I just bought.

- **Right away, boss! — Right away, boss!**: без отдельного эффекта; возврат к основной ветке.
- **We're the future — We're the future**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_5 — ClosedAI CEO @iclosedai

**EN**

> What were you thinking, kid? I always win.<br>
> Consider this deal your consolation prize for trying.<br>
> Send the demo.

**RU — перевод не утверждён; сохранён точный EN**

> What were you thinking, kid? I always win.<br>
> Consider this deal your consolation prize for trying.<br>
> Send the demo.

- **Accepted — Accepted**: без отдельного эффекта; возврат к основной ветке.
- **Rematch tomorrow — Rematch tomorrow**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_6 — ClosedAI CEO @iclosedai

**EN**

> You lost, kid. Nice try.<br>
> Keep working hard, maybe one day I'll hire you to take out my trash.<br>
> And yes, forget about business.

**RU — перевод не утверждён; сохранён точный EN**

> You lost, kid. Nice try.<br>
> Keep working hard, maybe one day I'll hire you to take out my trash.<br>
> And yes, forget about business.

- **Remember my name — Remember my name**: без отдельного эффекта; возврат к основной ветке.
- **Fine without you — Fine without you**: без отдельного эффекта; возврат к основной ветке.

## PADEL_OUTCOME_7 — ClosedAI CEO @iclosedai

**EN**

> MATCH OVER! I am SO done with this.<br>
> Bitching and crying over every single point.<br>
> Know your place, nobody. You’re blacklisted everywhere.

**RU — перевод не утверждён; сохранён точный EN**

> MATCH OVER! I am SO done with this.<br>
> Bitching and crying over every single point.<br>
> Know your place, nobody. You’re blacklisted everywhere.

- **Who's crying now? — Who's crying now?**: без отдельного эффекта; возврат к основной ветке.
- **I'll do anything, please! — I'll do anything, please!**: без отдельного эффекта; возврат к основной ветке.

