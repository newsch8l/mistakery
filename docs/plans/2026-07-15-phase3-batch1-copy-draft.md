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
> `put our pitch deck on a porn site — tech investors browse there too 😌 traffic is INSANE rn. you're welcome`

*Рус:* «закинула нашу деку на порносайт — техноинвесторы туда тоже заходят 😌 трафик сейчас БЕЗУМНЫЙ. не благодари»

- 🟦 **Leave it up** (Оставить ради трафика) → Customers↑, Founder↓, флаг `deck_on_xxx`.
- 🟥 **Take it down** (Удалить) → Team↓ (маркетолог в обиде), Founder↑, Customers↓.

**D2 — возвращение** (только если `deck_on_xxx`). Инвестор натыкается на профиль.

> **@unicorn_hunter** · *typing…*
> `MY FRIEND JUST FOUND OUR PITCH DECK ON A PORN SITE!! EXPLAIN YOURSELF RIGHT NOW!!!`

*Рус:* «МОЙ ПРИЯТЕЛЬ ТОЛЬКО ЧТО НАШЁЛ НАШ ПИТЧ НА ПОРНОСАЙТЕ!! ОБЪЯСНИТЕСЬ НЕМЕДЛЕННО!!!»

- 🟦 **Apologize** (Извиниться) → Founder↓, сделка спасена.
- 🟥 **Ask which site** (Спросить, а на каком сайте — намекнуть, что его приятель там и был) → Cash↓↓ (инвестор в ярости выходит), Founder↑ (мелкая победа).

---

## E. Мама вызвала полицию — @i_love_cats72 (2 карты)

**E1 — завязка.** Мама нашла term sheet, приняла за секту, вызвала полицию проверить тебя. Без бизнес-лексики.

> **@i_love_cats72** · *typing…*
> `Baby, I found that contract where you sign your whole life away!! This is a cult. I sent the police to check you're still alive. They're at your door right now ❤️`

*Рус:* «Малыш, я нашла тот контракт, где ты подписываешь всю свою жизнь!! Это секта. Я вызвала полицию — проверить, что ты жив. Они уже у двери ❤️»

- 🟦 **Let them in** (Впустить) → Founder↓, Customers↓ (сорван важный созвон). *(немедленно)*
- 🟥 **Send them away** (Выпроводить) → Founder↑, ставит флаг `mom_worried`.

**E2 — возвращение** (только если `mom_worried`). Мама эскалирует до родни.

> **@i_love_cats72** · *typing…*
> `The whole family knows you're in a cult now. We pooled money to get you out — Aunt Vera already put in $2000. Come home and it's yours ❤️❤️`

*Рус:* «Теперь вся родня знает, что ты в секте. Мы собрали денег, чтобы тебя вытащить — тётя Вера уже внесла $2000. Приезжай домой, и они твои ❤️❤️»

**Дилемма — настоящие деньги за настоящее унижение:**
- 🟦 **Take the money** (Взять «фонд спасения») → Cash↑ (родня собрала), Founder↓↓ (ты официально жертва секты для всей семьи).
- 🟥 **Come clean** (Признаться, что это стартап) → денег нет, родня в ужасе, что ты неудачник-фаундер → Founder↓, но достоинство при тебе.

---

## F. Чакры инвестора — @unicorn_hunter (1 карта)

Инвестор требует команду на молчаливый ретрит по чакрам с его гуру, иначе морозит транш.

> **@unicorn_hunter** · *typing…*
> `MY GURU RUNS A SILENT CHAKRA RETREAT THIS WEEKEND. SEND THE WHOLE TEAM OR I FREEZE THE MONEY. REAL FOUNDERS ALIGN THEIR CHAKRAS BEFORE THEY SCALE.`

*Рус:* «МОЙ ГУРУ ВЕДЁТ МОЛЧАЛИВЫЙ РЕТРИТ ПО ЧАКРАМ В ВЫХОДНЫЕ. ВСЯ КОМАНДА ЕДЕТ — ИЛИ Я МОРОЖУ ДЕНЬГИ. НАСТОЯЩИЕ ФАУНДЕРЫ ВЫРАВНИВАЮТ ЧАКРЫ РАНЬШЕ, ЧЕМ МАСШТАБ.»

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
