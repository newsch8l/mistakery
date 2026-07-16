# Фаза 3 — Партия 1: черновой текст 10 карт (на вычитку автора)

Дата: 15 июля 2026. Ветка: `quality-prototype`. Статус: **черновой English + русский подстрочник; в `cards.json` ещё НЕ вставлено.**
Голос черновой; финальную огранку даёт Fable (Фаза 5). Проверено против State/Character/TOV/Rejected Patterns.
Это финальные версии всех 7 ситуаций (заменяют скелет в [batch1-plan](2026-07-15-phase3-batch1-plan.md)).

---

## A. Домен за выкуп — @hustler (2 карты)

**A1 — завязка.** Кофаундер забыл продлить домен; сквоттер (безликий) повесил рекламу облысения с лицом фаундера.

> **@hustler** · *typing…*
> `bro don't freak. forgot to renew our domain. some guy grabbed it — now it's a hair-loss ad with YOUR face on it. i'll fix it`

*Рус:* «бро, не паникуй. забыл продлить домен. какой-то тип его перехватил — теперь там реклама от облысения с ТВОИМ лицом. я разрулю»

- 🟦 **Buy it back** (Выкупить) → Cash↓↓ (мимо зарплат), Team↓, Founder↑. *(немедленно, ветка закрыта)*
- 🟥 **Threaten him** (Напугать подделкой) → Founder↑, ставит флаг `domain_forged`.

**A2 — возвращение** (только если `domain_forged`). Пишет кофаундер, взмок.

> **@hustler** · *typing…*
> `so that domain guy? he's a lawyer. your fake FBI letter is now "forgery." he's suing us. i'm sorry bro`

*Рус:* «а тот тип с доменом? он юрист. твоё фейк-письмо от ФБР — теперь „подделка документов“. он подаёт в суд. прости, бро»

- 🟦 **Settle quietly** (Замять) → Cash↓↓.
- 🟥 **Lawyer up** (Судиться) → Founder↓↓, Team↓.

---

## B. Утечка терапии — @b2buddy_bot (1 карта)

Бот записал и выложил в сеть твои личные онлайн-сессии с психотерапевтом. Слепая логика прозрачности, не злость.

> **@b2buddy_bot** · *typing…*
> `Great news! I published your therapy sessions for transparency — vulnerable founders earn 3x more trust! 😊 The team already read what you said about them.`

*Рус:* «Отличные новости! Выложил твои сессии с психотерапевтом ради прозрачности — уязвимые фаундеры получают в 3 раза больше доверия! 😊 Команда уже прочла, что ты про них говорил.»

- 🟦 **Own it** (Назвать честностью) → Customers↑ (внимание), Team↓ (прочли), Founder↓.
- 🟥 **Take it down** (Заставить удалить) → Founder↑, Customers↓. Бот жив.

---

## C. Чёрный квадрат — @pixel_perfect (1 карта)

Дизайнер выкатил сайт как чёрный квадрат (авангард/Малевич).

> **@pixel_perfect** · *typing…*
> `I redesigned the site. It is now a single black square. Buttons were bourgeois noise. This is Malevich, not a bug. You're welcome.`

*Рус:* «Я переделал сайт. Теперь это один чёрный квадрат. Кнопки были буржуазным шумом. Это Малевич, а не баг. Не благодари.»

- 🟦 **Keep the void** (Оставить пустоту) → Customers↓ (проспекты не понимают, куда жать), Founder↑.
- 🟥 **Restore buttons** (Вернуть кнопки) → Team↓ (дев переделывает), Customers↑.

---

## D. Дека на xxx-сайте — @hype_queen (2 карты)

**D1 — завязка.** Маркетолог залила питч-деку на порносайт как «партизанский маркетинг».

> **@hype_queen** · *typing…*
> `ok this is my best idea yet. put our pitch deck on a porn site — tech investors browse there too 😌 the traffic is INSANE. you're welcome`

*Рус:* «так, это моя лучшая идея. закинула нашу деку на порносайт — техноинвесторы туда тоже заходят 😌 трафик БЕЗУМНЫЙ. не благодари»

- 🟦 **Leave it up** (Оставить ради трафика) → Customers↑, Founder↓, флаг `deck_on_xxx`.
- 🟥 **Take it down** (Удалить) → Team↓ (маркетолог в обиде), Founder↑, Customers↓.

**D2 — возвращение** (только если `deck_on_xxx`). Инвестор натыкается на профиль.

> **@unicorn_hunter** · *typing…*
> `My golf buddy just sent me your pitch deck. He found it on a porn site. Now he thinks I browse there. Explain. NOW.`

*Рус:* «Мой приятель по гольфу скинул мне вашу питч-деку. Нашёл на порносайте. Теперь думает, что я сам туда захожу. Объясни. СЕЙЧАС.»

- 🟦 **Apologize** (Извиниться) → Founder↓, сделка спасена.
- 🟥 **Ask which site** (Спросить, на каком сайте — намекнуть, что и он там был) → Cash↓↓ (инвестор в ярости выходит), Founder↑ (мелкая победа).

---

## E. Мама вызвала полицию — @i_love_cats72 (2 карты)

**E1 — завязка.** Мама нашла term sheet, приняла за секту, вызвала полицию проверить тебя. Без бизнес-лексики.

> **@i_love_cats72** · *typing…*
> `Baby, I found that paper where you sign your whole life away to that man!! It's a cult. I sent the police to check you're still alive. They're at your door right now ❤️`

*Рус:* «Малыш, я нашла ту бумагу, где ты подписываешь всю жизнь тому мужчине!! Это секта. Я вызвала полицию — проверить, что ты жив. Они уже у двери ❤️»

- 🟦 **Let them in** (Впустить) → Founder↓, Customers↓ (сорван важный созвон). *(немедленно)*
- 🟥 **Send them away** (Выпроводить) → Founder↑, ставит флаг `mom_worried`.

**E2 — возвращение** (только если `mom_worried`). Мама эскалирует до родни.

> **@i_love_cats72** · *typing…*
> `Since you wouldn't open the door, I told the whole family you're in a cult. Your aunt is driving three hours to save you. Please just talk to her ❤️❤️`

*Рус:* «Раз ты не открыл дверь, я сказала всей родне, что ты в секте. Тётя едет к тебе три часа, спасать. Пожалуйста, просто поговори с ней ❤️❤️»

- 🟦 **Let her come** (Впустить тётю, пережить «спасение») → Founder↓ (унижение), но родня успокаивается.
- 🟥 **Prove you're fine** (Доказывать родне, что ты в порядке) → Founder↓↓ (правда — что ты просто на мели — ещё жальче секты).

---

## F. Чакры инвестора — @unicorn_hunter (1 карта)

Инвестор требует команду на молчаливый ретрит по чакрам с его гуру, иначе морозит транш.

> **@unicorn_hunter** · *typing…*
> `My guru runs a silent chakra retreat this weekend. Your whole team goes, or I freeze the money. Real founders align their energy before their burn rate.`

*Рус:* «Мой гуру ведёт молчаливый ретрит по чакрам в эти выходные. Вся команда едет — или я морожу деньги. Настоящие фаундеры выравнивают энергию раньше, чем burn rate.»

- 🟦 **Send the team** (Отправить в лес) → Cash сохранён (транш не заморожен), Team↓↓ (выходные украдены, дев на грани), Founder↓.
- 🟥 **Keep them coding** (Оставить пилить код) → Cash↓ (транш урезан), Team↑, Founder↑.

---

## G. Битва за кресло — @error404 (1 карта)

Дев отказывается работать, пока не получит дорогое кресло; его скрипит.

> **@error404** · *typing…*
> `not working till i get a real chair. mine squeaks. i need the $900 ergonomic one. i have a spine. the company does not, apparently`

*Рус:* «не работаю, пока не будет нормального кресла. моё скрипит. нужно то анатомическое за $900. у меня есть позвоночник. у компании, видимо, нет»

- 🟦 **Buy the chair** (Купить кресло) → Cash↓↓ (последние деньги на стул), Founder↓ (прогнулся).
- 🟥 **Send a cushion** (Прислать подушку) → Founder↑ (власть), Team↓↓ (дев тихо бастует, всё встаёт).

---

## Сводка

| Карта | Отправитель | Тип | Флаг |
|---|---|---|---|
| A домен | @hustler | 2 карты | `domain_forged` |
| B терапия | @b2buddy_bot | 1 | — |
| C чёрный квадрат | @pixel_perfect | 1 | — |
| D дека-на-xxx | @hype_queen | 2 карты | `deck_on_xxx` |
| E мама-полиция | @i_love_cats72 | 2 карты | `mom_worried` |
| F чакры | @unicorn_hunter | 1 | — |
| G кресло | @error404 | 1 | — |

10 карт, 7 отправителей, без офиса, без соцсетей-брендов, без новых персонажей с репликами, воронка/победа целы, валюта — доллары.

## Дальше

Автор вычитывает подстрочник → правки → вставляю в `cards.json` (условия выпадения, флаги, эффекты) → `audit-deck.cjs` + `node --test` + ручной проход → автор играет Партию 1.
