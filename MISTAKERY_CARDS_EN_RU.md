# Mistakery — полный каталог карточек EN/RU

Числовые эффекты ниже предназначены только для редакторской проверки. В самой игре игрок видит текущие проценты и подсветку затрагиваемых ресурсов, но не видит `+N/−N`.

Каждое решение дополнительно списывает 1 Cash как постоянный burn rate.

# 1. Стартовая последовательность

## OPEN_01 — AI Assistant @b2buddy_bot

**EN**

> Hi there, visionary! 👋  
> 11,204 new B2B AI SaaS competitors launched today.  
> Our startup, B2BuyerSpyer, still has the best name.

**RU**

> Привет, визионер! 👋  
> Сегодня запустилось 11 204 новых конкурента в категории B2B AI SaaS.  
> У нашего стартапа B2BuyerSpyer всё ещё лучшее название.

- **Check the market — Проверить рынок**: Team -1, Founder -2; → `OPEN_02`.
- **Trust the name — Довериться названию**: Founder +3; → `OPEN_02`.

## OPEN_02 — AI Assistant @b2buddy_bot

**EN**

> Great news! 🎉  
> B2BuyerSpyer found 814 companies that need buyers.  
> Potential customers: 814. Paid invoices: 0.

**RU**

> Отличные новости! 🎉  
> B2BuyerSpyer нашёл 814 компаний, которым нужны покупатели.  
> Потенциальных клиентов: 814. Оплаченных счетов: 0.

- **Audit the 814 — Проверить 814**: Team -2, Founder -3; → `OPEN_03_AUDIT`.
- **Open invoices — Открыть счета**: Founder -5; → `OPEN_03_INVOICES`.

## OPEN_03_AUDIT — AI Assistant @b2buddy_bot

**EN**

> Audit complete! ✅  
> 814 companies need buyers.  
> 0 need B2BuyerSpyer.  
> Want another 814?

**RU**

> Проверка завершена! ✅  
> 814 компаниям нужны покупатели.  
> 0 нужен B2BuyerSpyer.  
> Хотите ещё 814?

- **Find more — Найти ещё**: Cash -2, Team -3, Founder +2; → `OPEN_04`.
- **Rewrite the pitch — Переписать питч**: Team -2, Customers +3, Founder -2; → `OPEN_04`.

## OPEN_03_INVOICES — Sales @bigdeals

**EN**

> Chief, I fixed the empty invoice folder.  
> It’s called REVENUE PIPELINE now.  
> Fake one invoice or call five prospects?

**RU**

> Шеф, я починил пустую папку со счетами.  
> Теперь она называется REVENUE PIPELINE.  
> Подделать один счёт или позвонить пяти потенциальным клиентам?

- **Fake one — Подделать один**: Team -5, Founder +5; → `OPEN_04`.
- **Call five — Позвонить пяти**: Team -3, Customers +4, Founder -2; → `OPEN_04`.

## OPEN_04 — Ex-Boss @business1

**EN**

> Five months since you quit to build AI that finds B2B customers.  
> Has it found one for you yet?

**RU**

> Пять месяцев с тех пор, как ты уволился ради ИИ, который ищет B2B-клиентов.  
> Себе он уже кого-нибудь нашёл?

- **Leave on read — Оставить прочитанным**: Founder +2; → `OPEN_05`.
- **Claim we’re close — Сказать, что мы близко**: Founder +7; → `OPEN_05`.

## OPEN_05 — Dev @error404

**EN**

> payroll is friday  
> are we getting money or another speech about changing b2b forever

**RU**

> зарплата в пятницу  
> будут деньги или опять речь о том, как мы навсегда изменим b2b

- **Reserve payroll — Отложить на зарплаты**: Cash -3, Team +5, Founder -2; → `OPEN_06`.
- **Promise revenue — Пообещать выручку**: Team -4, Founder +3; → `OPEN_06`.

## OPEN_06 — Investor @unicorn_hunter

**EN**

> I FUNDED AI THAT FINDS BUYERS.  
> IT FOUND ZERO FOR US.  
> GET A PAID INVOICE.  
> BUILD FOR ENTERPRISE OR HUNT A WHALE.

**RU**

> Я ПРОФИНАНСИРОВАЛ ИИ, КОТОРЫЙ ИЩЕТ ПОКУПАТЕЛЕЙ.  
> ДЛЯ НАС ОН НЕ НАШЁЛ НИКОГО.  
> ДОБУДЬ ОПЛАЧЕННЫЙ СЧЁТ.  
> ДЕЛАЙ ДЛЯ КОРПОРАЦИЙ ИЛИ ЛОВИ КИТА.

- **Build for enterprise — Делать для корпораций**: Team -3, Founder +3; выбирает ветку agents; → `AGENT_01`.
- **Hunt a whale — Охотиться на кита**: Team -4, Founder +6; выбирает ветку padel; → `PADEL_01`.

# 2. Empathic AI Agents

## AGENT_01 — Investor @unicorn_hunter

**EN**

> YOU STILL NEED A BUYER.  
> AI EMPATHY IS MAKING IDIOTS RICH.  
> PUT A SOUL IN B2BUYERSPYER OR ASK MOM FOR MONEY.

**RU**

> ТЕБЕ ВСЁ ЕЩЁ НУЖЕН ПОКУПАТЕЛЬ.  
> ИИ-ЭМПАТИЯ ДЕЛАЕТ ИДИОТОВ БОГАТЫМИ.  
> ВСТАВЬ ДУШУ В B2BUYERSPYER ИЛИ ПРОСИ ДЕНЬГИ У МАМЫ.

- **Build it properly — Сделать нормально**: Cash -2, Team -4, Founder +4; → `AGENT_02_DEV`.
- **Ship it tonight — Выпустить сегодня**: Cash -1, Team -7, Founder +6; → `AGENT_02_DEV`.

## AGENT_02_DEV — Dev @error404

**EN**

> empathy patch is ready  
> it apologizes to every lead for capitalism  
> and refuses calls during therapy

**RU**

> патч эмпатии готов  
> он извиняется перед каждым потенциальным клиентом за капитализм  
> и отказывается созваниваться во время терапии

- **Deploy the patch — Выпустить патч**: Cash -1, Team -4, Founder +3; → `AGENT_03_HYPE`.
- **Publish one demo — Опубликовать демо**: Team +2, Founder -2; → `AGENT_03_HYPE`.

## AGENT_03_HYPE — Marketer @hype_queen

**EN**

> the demo is trending 💅  
> i called them emotionally abandoned AI employees  
> enterprise buyers want the deck

**RU**

> демо завирусилось 💅  
> я назвала их эмоционально брошенными ИИ-сотрудниками  
> корпораты хотят презентацию

- **Boost the post — Разогнать пост**: Team -3, Customers +7, Founder +5; → `AGENT_04_LEAD`.
- **Add disclaimer — Добавить оговорку**: Team +3, Customers -4, Founder -4; → `AGENT_04_LEAD`.

## AGENT_04_LEAD — Sales @bigdeals

**EN**

> Chief, holy shit: our first buyer.  
> @head_of_agile wants 500 agents by Friday.  
> I offered dev’s passport as collateral.

**RU**

> Шеф, охуеть: наш первый покупатель.  
> @head_of_agile хочет 500 агентов к пятнице.  
> Я оставил паспорт разработчика в залог.

- **Book the call — Назначить звонок**: Team -2, Customers +7, Founder +3; → `AGENT_05_ORDER`.
- **Quote all 500 — Назвать цену за 500**: Team -5, Customers +10, Founder +5; → `AGENT_05_ORDER`.

## AGENT_05_ORDER — Customer @head_of_agile

**EN**

> Your AI apologized for capitalism. Good.  
> I need 500 agents for an expensive-looking AI rollout.  
> Can you deliver Friday?

**RU**

> Ваш ИИ извинился за капитализм. Хорошо.  
> Мне нужны 500 агентов для внедрения ИИ, которое выглядит дорого.  
> Доставите к пятнице?

- **Promise Friday — Пообещать пятницу**: Team -8, Customers +8, Founder +5; → `AGENT_06_LEGAL`.
- **Check procurement — Свериться с закупками**: Team +3, Customers +4, Founder -3; → `AGENT_06_LEGAL`.

## AGENT_06_LEGAL — Customer @head_of_agile

**EN**

> Our lawyers saw “sentient employees” in your deck.  
> Buying them is slave trading.

**RU**

> Наши юристы увидели в вашей презентации «разумных сотрудников».  
> Покупать их — это работорговля.

- **Remove souls — Удалить души**: Team -5, Customers +5, Founder -5; → `AGENT_07_INVOICE`.
- **Keep them sentient — Оставить разумными**: Team +3, Customers -4, Founder +6; → `AGENT_07_DONATE`.

## AGENT_07_INVOICE — Customer @head_of_agile

**EN**

> Souls removed.  
> We need them to scrape suppliers nobody calls.  
> Invoice before Marketing adds feelings.

**RU**

> Души удалены.  
> Они нужны нам, чтобы парсить поставщиков, которым никто не звонит.  
> Выставляйте счёт, пока маркетинг не добавил чувства.

- **Send invoice — Отправить счёт**: Cash +16, Team -4, Customers +10, Founder +19; финал `validation_agents`.
- **Restore the souls — Вернуть души**: Cash -2, Team -4, Customers -6, Founder +9; → `AGENT_07_DONATE`.

## AGENT_07_DONATE — Customer @head_of_agile

**EN**

> We cannot buy conscious workers.  
> Donate all 500 for our logo —  
> or invoice our humanitarian budget.

**RU**

> Мы не можем покупать работников с сознанием.  
> Пожертвуйте все 500 за наш логотип —  
> или выставьте счёт нашему гуманитарному бюджету.

- **Donate them — Пожертвовать их**: Cash -3, Team -5, Customers +12, Founder +10; финал `ai_foundation`.
- **Invoice freedom — Выставить счёт за свободу**: Cash +12, Team -8, Customers +8, Founder -5; кризис `freedom_sale`; финал `dirty_validation`.

# 3. ClosedAI Padel

## PADEL_01 — Padel Coach @padel_pro

**EN**

> My 8 AM client is @iclosedai, ClosedAI’s CEO.  
> He can kill your funding and cloud.  
> He wants your AI. Bring a racket.

**RU**

> Мой клиент на восемь утра — @iclosedai, CEO ClosedAI.  
> Он может уничтожить твои инвестиции и облако.  
> Ему нужен твой ИИ. Бери ракетку.

- **Meet him — Встретиться с ним**: Team -2, Customers +5, Founder +5; → `PADEL_02`.
- **Refuse meeting — Отказаться от встречи**: Team +3, Customers -4, Founder -6; переходит в ветку agents; → `AGENT_01`.

## PADEL_02 — ClosedAI CEO @iclosedai

**EN**

> ClosedAI builds intelligence. It still needs enterprise buyers.  
> One match. I win, I own it.  
> You win, I pay for a pilot.

**RU**

> ClosedAI создаёт интеллект. Но даже ей нужны корпоративные покупатели.  
> Один матч. Побеждаю я — забираю компанию.  
> Побеждаешь ты — я оплачиваю пилотный запуск.

- **Take the bet — Принять пари**: Team -7, Customers +6, Founder +7; → `PADEL_03_TEAM`.
- **Walk away — Уйти**: Team +4, Customers -5, Founder -6; переходит в ветку agents; → `AGENT_01`.

## PADEL_03_TEAM — Dev @error404

**EN**

> you bet our jobs on padel  
> do i prep the pilot or zip the repo for our new owner

**RU**

> ты поставил наши рабочие места на матч в падел  
> мне готовить пилот или упаковывать код для нового владельца

- **Prep the pilot — Готовить пилот**: Cash -1, Team +4, Founder -3; → `PADEL_04_CHOICE`.
- **Pack the repo — Упаковать код**: Team -6, Founder +5; → `PADEL_04_CHOICE`.

## PADEL_04_CHOICE — Padel Coach @padel_pro

**EN**

> His ego cannot survive losing to a pre-revenue founder.  
> Throw the match and you keep a job.  
> Beat him and expect a war.

**RU**

> Его эго не переживёт поражения от фаундера без выручки.  
> Сдай матч — сохранишь работу.  
> Победи — жди войны.

- **Throw the match — Сдать матч**: Team -7, Founder -6; → `PADEL_05_LOSE`.
- **Play for real — Играть всерьёз**: Cash -1, Team +5, Founder +8; → `PADEL_05_WIN`.

## PADEL_05_WIN — ClosedAI CEO @iclosedai

**EN**

> You beat me 6–1. Nobody needs to know.  
> Keep the score offline and I will pay for the pilot.

**RU**

> Ты обыграл меня 6:1. Никому не обязательно знать.  
> Не выкладывай счёт в интернет — и я оплачу пилот.

- **Hide the score — Скрыть счёт**: Team +3, Customers +7, Founder -4; → `PADEL_06_PILOT`.
- **Post the score — Опубликовать счёт**: Team -4, Customers +10, Founder +10; → `PADEL_06_WAR`.

## PADEL_05_LOSE — ClosedAI CEO @iclosedai

**EN**

> 6–0. As expected. ClosedAI owns B2BuyerSpyer.  
> New title: Chief Ball Retrieval Officer.  
> Send passwords. Bring fresh balls.

**RU**

> 6:0. Как и ожидалось. ClosedAI владеет B2BuyerSpyer.  
> Новая должность: Директор по сбору мячей.  
> Пришли пароли. Принеси свежие мячи.

- **Send passwords — Отправить пароли**: Team -10, Customers +4, Founder -10; финал `acquired_by_padel`.
- **Hold the repo — Удержать код**: Team -6, Customers -3, Founder +3; → `PADEL_06_ACQUIRED`.

## PADEL_06_PILOT — ClosedAI CEO @iclosedai

**EN**

> You protected my reputation. Good.  
> The paid pilot is approved. Your team answers me 24/7.  
> And you never beat me again.

**RU**

> Ты сохранил мою репутацию. Хорошо.  
> Оплачиваемый пилот одобрен. Твоя команда отвечает мне круглосуточно.  
> И больше никогда меня не обыгрывай.

- **Accept 24/7 — Согласиться на 24/7**: Cash +16, Team -3, Customers +12, Founder +5; финал `validation_padel`.
- **Set work hours — Установить рабочие часы**: Team +5, Customers -8, Founder -4; финал `closedai_boundary`.

## PADEL_06_WAR — ClosedAI CEO @iclosedai

**EN**

> I made one call. @unicorn_hunter stopped replying.  
> Your cloud is gone. Delete the score, transfer B2BuyerSpyer and kiss the ring.

**RU**

> Я сделал один звонок. @unicorn_hunter перестал отвечать.  
> Твой облачный аккаунт отключён. Удали счёт, передай B2BuyerSpyer и поцелуй перстень.

- **Pin the score — Закрепить пост со счётом**: Cash -8, Team -8, Customers +7, Founder +10; финал `closedai_war`.
- **Kiss the ring — Поцеловать перстень**: Cash -2, Team -5, Customers -7, Founder -8; финал `acquired_by_padel`.

## PADEL_06_ACQUIRED — Sales @bigdeals

**EN**

> ClosedAI owns us, chief.  
> @iclosedai wants pilot revenue on the acquisition slide.  
> Invoice now or start fetching balls.

**RU**

> ClosedAI владеет нами, шеф.  
> @iclosedai нужна выручка от пилота на слайде про покупку компании.  
> Выставляй счёт сейчас или начинай собирать мячи.

- **Fetch the balls — Собирать мячи**: Team -10, Customers +3, Founder -12; финал `acquired_by_padel`.
- **Send invoice — Отправить счёт**: Cash +12, Team -8, Customers +10, Founder -8; финал `acquired_validation`.

# 4. Global side-stories

## PAYROLL_RESTRICTED_AI_SEED — Investor @unicorn_hunter

**EN**

> I BOUGHT AI CREDITS.  
> YOUR TEAM CAN WORK FOR THE SUBSCRIPTION.  
> NO REVENUE, NO PAYROLL.

**RU**

> Я КУПИЛ КРЕДИТЫ НА ИИ.  
> ПУСТЬ КОМАНДА РАБОТАЕТ ЗА ПОДПИСКУ.  
> НЕ БУДЕТ ВЫРУЧКИ — НЕ БУДЕТ ЗАРПЛАТЫ.

- **Accept credits — Принять кредиты**: Team -2, Founder +2; возврат к основной ветке.
- **Demand payroll — Потребовать зарплату**: Founder -2; возврат к основной ветке.

## PAYROLL_RESTRICTED_AI_CALLBACK — Dev @error404

**EN**

> the ai has everything  
> payroll has nothing  
> pay us or i shut everything down right now

**RU**

> для ии есть все  
> для зарплат ничего  
> давай деньги, или я прямо сейчас всё вырублю

- **Promise payroll — Пообещать зарплату**: Team -3; возврат к основной ветке.
- **Pay out of pocket — Заплатить из своих**: Team +2, Founder -2; возврат к основной ветке.

## DEV_HOSTAGE_SEED — Dev @error404

**EN**

> investor says he'll replace me with ai  
> cool. call him an idiot in public  
> or lie and say he apologized

**RU**

> инвестор сказал, что заменит меня ИИ  
> круто. назови его придурком при всех  
> или соври, что он извинился

- **Call him an idiot — Назвать его придурком**: Team +1, Founder -3; возврат к основной ветке.
- **Fake investor's apology — Соврать извинения инвестора**: Team -3, Founder +2; возврат к основной ветке.

## DEV_HOSTAGE_CALLBACK — Dev @error404

**EN**

> updates are back  
> write down who has access  
> or schedule my 3am call now

**RU**

> обновления снова работают  
> запиши, у кого есть доступ  
> или сразу назначай мне звонок на три ночи

- **Write the rules — Записать правила**: Team +2, Founder -1; возврат к основной ветке.
- **Book the call — Назначить звонок**: Team -3, Founder +2; возврат к основной ветке.

## MOM_INVESTOR_SEED — Mom @i_love_cats72

**EN**

> That investor keeps calling about money.  
> You don't eat. You don't sleep.  
> Give me his number.

**RU**

> Этот инвестор всё звонит из-за денег.  
> Ты не ешь. Ты не спишь.  
> Дай мне его номер.

- **Let Mom call — Пусть мама звонит**: Team +1, Founder -2; возврат к основной ветке.
- **I'm fine, Mom — Я в порядке, мам**: Team -2, Founder +2; возврат к основной ветке.

## MOM_INVESTOR_CALLBACK — Investor @unicorn_hunter

**EN**

> YOUR MOTHER CALLED ME ABOUT YOUR SLEEP.  
> WHAT THE HELL? I DIDN'T FUND A BEDTIME.  
> GET BACK TO WORK.

**RU**

> ТВОЯ МАТЬ ПОЗВОНИЛА МНЕ НАСЧЁТ ТВОЕГО СНА.  
> Я НЕ ФИНАНСИРОВАЛ ТВОЙ РЕЖИМ СНА.  
> ВОЗВРАЩАЙСЯ К РАБОТЕ.

- **Take the break — Послушать маму и отдохнуть**: без отдельного эффекта; возврат к основной ветке.
- **Keep working — Продолжить работать**: без отдельного эффекта; возврат к основной ветке.

## COMA_SEED — Marketer @hype_queen

**EN**

> okay hear me out  
> we say you worked yourself into a coma  
> tragic founder lore. people will eat this up 😭

**RU**

> так, выслушай меня  
> скажем, что ты доработался до комы  
> трагическая легенда фаундера. народ такое обожает 😭

- **Approve the post — Разрешить пост**: Team -2, Founder +1; возврат к основной ветке.
- **Kill the story — Запретить пост**: Team +1, Founder -2; возврат к основной ветке.

## COMA_CALLBACK_AUTHORIZED — Marketer @hype_queen

**EN**

> oh my god they believed the coma 😭  
> people are asking what we built  
> do not wake up online yet

**RU**

> боже мой, они поверили в кому 😭  
> люди спрашивают, что мы вообще сделали  
> пока не просыпайся в интернете

- **Keep the post — Оставить пост**: Customers +2; возврат к основной ветке.
- **Delete the post — Удалить пост**: Founder -2; возврат к основной ветке.

## COMA_CALLBACK_BLOCKED — Marketer @hype_queen

**EN**

> fine. no coma post  
> you still look like shit though  
> take a rest. this one isn't content

**RU**

> ладно. никакого поста про кому  
> но выглядишь ты всё равно как дерьмо  
> отдохни. это не контент

- **Take rest — Отдохнуть**: Team +2, Founder -3; возврат к основной ветке.
- **Keep working — Продолжить работать**: Team -2, Founder -3; возврат к основной ветке.

## MOM_FLYERS — Mom @i_love_cats72

**EN**

> I put up flyers.  
> B2BuyerSpyer and your phone number are on them.  
> They say you need help. Don't be mad.

**RU**

> Я расклеила объявления.  
> На них B2BuyerSpyer и твой номер телефона.  
> Там написано, что тебе нужна помощь. Не сердись.

- **Take them down — Снять объявления**: Team +1, Founder -1; возврат к основной ветке.
- **Leave them up — Оставить объявления**: Team -1, Founder -3; возврат к основной ветке.

## B3_SALES_PRESSURE_SEED — Sales @bigdeals

**EN**

> Boss, your pitch deserved a reply.  
> They ignored four emails.  
> Let me send three more.

**RU**

> Шеф, твой питч заслуживал ответа.  
> Они проигнорировали четыре письма.  
> Дай отправить ещё три.

- **Send three more — Отправить ещё три**: Team -2, Founder +2; возврат к основной ветке.
- **Leave them alone — Оставить их в покое**: Team +2, Founder -2; возврат к основной ветке.

## B3_PAID_OPTOUT_CALLBACK — Sales @bigdeals

**EN**

> We closed their hatred 🎉  
> They’ll pay to never hear from us again.  
> Say yes and this beautiful first invoice hits my commission.

**RU**

> Мы закрыли их ненависть 🎉  
> Они заплатят, лишь бы больше о нас не слышать.  
> Скажи да — и этот прекрасный первый счёт попадёт в мою комиссию.

- **Send invoice — Отправить счёт**: Cash +12, Team -1, Founder +6; финал `paid_to_disappear`.
- **Waive the fee — Отменить плату**: Team +2, Founder -3; возврат к основной ветке.

# 5. Pressure cards

## PRESS_FRIDGE — AI Assistant @b2buddy_bot

**EN**

> Runway protection activated 😊  
> Food delivery canceled. Fridge locked except raw carrots.  
> Unlocks after our first paid invoice.

**RU**

> Защита запаса денег активирована 😊  
> Доставка еды отменена. Холодильник заперт, кроме сырой моркови.  
> Откроется после первого оплаченного счёта.

- **Break the lock — Сломать замок**: Cash -1, Founder +5; возврат к основной ветке.
- **Eat carrots — Есть морковь**: Founder -5; возврат к основной ветке.

## PRESS_MOM — Mom @i_love_cats72

**EN**

> Sweetie, I called your investor.  
> I blamed your diarrhea for zero sales.  
> He’ll send your little company $10k if I never call him again ❤️

**RU**

> Милый, я позвонила твоему инвестору.  
> Я свалила нулевые продажи на твою диарею.  
> Он даст твоей маленькой компании $10 тысяч, если я больше ему не позвоню ❤️

- **Take his money — Взять его деньги**: Cash +10, Founder -7; возврат к основной ветке.
- **Protect dignity — Сохранить достоинство**: Founder +7; возврат к основной ветке.

## PRESS_FONT — Designer @pixel_perfect

**EN**

> I found the perfect font.  
> $4,500—more than our servers.  
> Buy it before we waste that money on salaries.

**RU**

> Я нашёл идеальный шрифт.  
> $4 500 — дороже наших серверов.  
> Покупаем, пока мы не потратили эти деньги на зарплаты.

- **Buy the font — Купить шрифт**: Cash -2, Team -3; возврат к основной ветке.
- **Use Arial — Использовать Arial**: Team +5, Founder -4; возврат к основной ветке.

## PRESS_FIGHT — Cofounder @hustler

**EN**

> bro i bet our pre-seed on you fighting your college rival @yc_founder tonight !!!  
> winner becomes category leader !!!

**RU**

> бро я поставил наши первые инвестиции на то что сегодня ты подерёшься со своим соперником из колледжа @yc_founder !!!  
> победитель становится лидером категории !!!

- **Accept the bet — Принять ставку**: Cash -2, Team -3, Founder +8; возврат к основной ветке.
- **Cancel fight — Отменить драку**: Team +5, Founder -5; возврат к основной ветке.

## PRESS_FAMILY — Free User @user481516

**EN**

> My wife and kids share one free AI agent.  
> Add family therapy mode or I leave a one-star review.

**RU**

> Мы с женой и детьми делим одного бесплатного ИИ-агента.  
> Добавьте режим семейной терапии, иначе поставлю одну звезду.

- **Ship family mode — Выпустить семейный режим**: Cash -2, Team -5, Customers +7; возврат к основной ветке.
- **Ban families — Запретить семьи**: Customers -6, Founder +5; возврат к основной ветке.

## PRESS_RIVAL — College Rival @yc_founder

**EN**

> Just raised at a $50M cap. Honestly exhausted by winning.  
> Still hunting your first paying customer?

**RU**

> Только что поднял раунд при оценке $50 миллионов. Если честно, устал побеждать.  
> Всё ещё ищешь первого платящего клиента?

- **Ask for an intro — Попросить познакомить**: Customers +4, Founder -5; возврат к основной ветке.
- **Mute him — Заглушить его**: Founder +4; возврат к основной ветке.

## PRESS_CAPITALISM — Dev @error404

**EN**

> empathy patch is live  
> every lead now gets three follow-ups and a personal apology for capitalism

**RU**

> патч эмпатии уже работает  
> каждый потенциальный клиент теперь получает три повторных сообщения и личное извинение за капитализм

- **Keep apologies — Оставить извинения**: Customers -5, Founder +5; возврат к основной ветке.
- **Remove apologies — Убрать извинения**: Team -5, Customers +5; возврат к основной ветке.

