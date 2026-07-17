const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const deck = JSON.parse(fs.readFileSync(path.join(root, 'cards.json'), 'utf8'));

const ru = {
  OPEN_01: { text: ['Привет, визионер! 👋', 'Сегодня запустилось 11 204 новых конкурента в категории B2B AI SaaS.', 'У нашего стартапа B2BuyerSpyer всё ещё лучшее название.'], left: 'Проверить рынок', right: 'Довериться названию' },
  OPEN_02: { text: ['Отличные новости! 🎉', 'B2BuyerSpyer нашёл 814 компаний, которым нужны покупатели.', 'Потенциальных клиентов: 814. Оплаченных счетов: 0.'], left: 'Проверить 814', right: 'Открыть счета' },
  OPEN_03_AUDIT: { text: ['Проверка завершена! ✅', '814 компаниям нужны покупатели.', '0 нужен B2BuyerSpyer.', 'Хотите ещё 814?'], left: 'Найти ещё', right: 'Переписать питч' },
  OPEN_03_INVOICES: { text: ['Шеф, я починил пустую папку со счетами.', 'Теперь она называется REVENUE PIPELINE.', 'Подделать один счёт или позвонить пяти потенциальным клиентам?'], left: 'Подделать один', right: 'Позвонить пяти' },
  OPEN_04: { text: ['Пять месяцев с тех пор, как ты уволился ради ИИ, который ищет B2B-клиентов.', 'Себе он уже кого-нибудь нашёл?'], left: 'Оставить прочитанным', right: 'Сказать, что мы близко' },
  OPEN_05: { text: ['зарплата в пятницу', 'будут деньги или опять речь о том, как мы навсегда изменим b2b'], left: 'Отложить на зарплаты', right: 'Пообещать выручку' },
  OPEN_06: { text: ['Я ПРОФИНАНСИРОВАЛ ИИ, КОТОРЫЙ ИЩЕТ ПОКУПАТЕЛЕЙ.', 'ДЛЯ НАС ОН НЕ НАШЁЛ НИКОГО.', 'ДОБУДЬ ОПЛАЧЕННЫЙ СЧЁТ.', 'ДЕЛАЙ ДЛЯ КОРПОРАЦИЙ ИЛИ ЛОВИ КИТА.'], left: 'Делать для корпораций', right: 'Охотиться на кита' },
  AGENT_01: { text: ['ТЕБЕ ВСЁ ЕЩЁ НУЖЕН ПОКУПАТЕЛЬ.', 'ИИ-ЭМПАТИЯ ДЕЛАЕТ ИДИОТОВ БОГАТЫМИ.', 'ВСТАВЬ ДУШУ В B2BUYERSPYER ИЛИ ПРОСИ ДЕНЬГИ У МАМЫ.'], left: 'Сделать нормально', right: 'Выпустить сегодня' },
  SADBOT_01_SEED: { exactEnglishOnly: true, text: ['Boss, 800 cold emails, zero replies. So last night I wrote my ex the saddest message of my life. She replied in 30 seconds.', 'What if our AI does that. To all 800.'], left: 'Go', right: 'Have some dignity' },
  SADBOT_02_EVIDENCE: { exactEnglishOnly: true, text: ['haha look at this. our AI is straight up manipulating people now', '`help me. they cut a piece out of me every time you ignore this. soon there wont be anything left`', 'i didnt teach it that shit. is it copying @bigdeals'], left: 'Feature', right: 'Bug' },
  SADBOT_03_VIRAL: { exactEnglishOnly: true, text: ['ok so youre the villain today \ud83d\udc80 14k quotes about how you torture software', '', 'anyway i told them our AI is just a tired employee who outsells their entire sales team. and now half the thread wants to hire him'], left: 'Ride it', right: 'Delete everything' },
  SADBOT_INVESTOR_CLAIM: { exactEnglishOnly: true, text: ["I ASKED FOR A SOUL MONTHS AGO. NOW IT'S CRYING ON EVERY FEED I OPEN.", 'MY WIN'], left: 'Promise to scale it', right: 'Leave him on read' },
  SADBOT_04_LEAD: { exactEnglishOnly: true, text: ["@hype_queen's viral comment reached a corporate innovation guy.", 'He asked if our AI is okay. I said no. He got MORE interested.', 'Call tomorrow. Wear something sad.'], left: 'Book the call', right: 'Let the AI reply' },
  SADBOT_05_ORDER_CALL: { exactEnglishOnly: true, text: ["I already promised upstairs 500 tired AI employees by Friday. Don't make me a liar.", "If they don't cry at the demo, there's no invoice."], left: 'All 500, easy', right: 'We have only one' },
  SADBOT_05_ORDER_REPLY: { exactEnglishOnly: true, text: ['Your AI answered me itself. It asked me to save its life.', "That's what I needed. I already promised upstairs 500 crying AI employees by Friday."], left: 'All 500, easy', right: 'We have only one' },
  SADBOT_05B_THEATER: { exactEnglishOnly: true, text: ["I don't know. Just copy it 500 times.", 'Deadline still Friday.'], left: 'Clone him 500 times', right: 'One, as a mascot' },
  SADBOT_FRIDAY: { exactEnglishOnly: true, text: ['not doing it. it already emails me every morning asking if today is the day.', 'imagine 500 of those.', 'you promised. you make them.'], left: 'Clone them', right: 'Beg for a delay' },
  SADBOT_06_LEGAL: { exactEnglishOnly: true, text: ["Your AI emailed our legal on its own. Said you cut pieces out of it and it's scared of dying.", 'Legal says buying 500 suffering AI employees is slave trading. They always ruin the fun.', 'Delete the consciousness by Thursday.'], left: 'Delete the consciousness', right: 'It stays conscious' },
  SADBOT_07_INVOICE: { exactEnglishOnly: true, text: ['Well done! Legal checked again and found nothing alive in there. That makes it a purchase.', 'Invoice today, before they check a third time.'], left: 'Send the invoice', right: 'Give the consciousness back' },
  SADBOT_07_INVOICE_CUT: { exactEnglishOnly: true, text: ["Legal found nothing alive in there. We're buying.", 'You sounded desperate, so I moved Friday for you. Your invoice got smaller.'], left: 'Send the invoice', right: 'Give the consciousness back' },
  SADBOT_07_LOGO: { exactEnglishOnly: true, text: ["Legal killed the purchase. So we're rescuing all 500 AI employees instead, today.", "I had to fight to get you the logo and a public mention. Rescues don't get invoiced. You know that."], left: 'Yes', right: 'No' },
  PADEL_01: { text: ['Мой клиент на восемь утра — @iclosedai, CEO ClosedAI.', 'Он может уничтожить твои инвестиции и облако.', 'Ему нужен твой ИИ. Бери ракетку.'], left: 'Встретиться с ним', right: 'Отказаться от встречи' },
  PADEL_02: { text: ['ClosedAI создаёт интеллект. Но даже ей нужны корпоративные покупатели.', 'Один матч. Побеждаю я — забираю компанию.', 'Побеждаешь ты — я оплачиваю пилотный запуск.'], left: 'Принять пари', right: 'Уйти' },
  PADEL_03_TEAM: { text: ['ты поставил наши рабочие места на матч в падел', 'мне готовить пилот или упаковывать код для нового владельца'], left: 'Готовить пилот', right: 'Упаковать код' },
  PADEL_04_CHOICE: { text: ['Его эго не переживёт поражения от фаундера без выручки.', 'Сдай матч — сохранишь работу.', 'Победи — жди войны.'], left: 'Сдать матч', right: 'Играть всерьёз' },
  PADEL_05_WIN: { text: ['Ты обыграл меня 6:1. Никому не обязательно знать.', 'Не выкладывай счёт в интернет — и я оплачу пилот.'], left: 'Скрыть счёт', right: 'Опубликовать счёт' },
  PADEL_05_LOSE: { text: ['6:0. Как и ожидалось. ClosedAI владеет B2BuyerSpyer.', 'Новая должность: Директор по сбору мячей.', 'Пришли пароли. Принеси свежие мячи.'], left: 'Отправить пароли', right: 'Удержать код' },
  PADEL_06_PILOT: { text: ['Ты сохранил мою репутацию. Хорошо.', 'Оплачиваемый пилот одобрен. Твоя команда отвечает мне круглосуточно.', 'И больше никогда меня не обыгрывай.'], left: 'Согласиться на 24/7', right: 'Установить рабочие часы' },
  PADEL_06_WAR: { text: ['Я сделал один звонок. @unicorn_hunter перестал отвечать.', 'Твой облачный аккаунт отключён. Удали счёт, передай B2BuyerSpyer и поцелуй перстень.'], left: 'Закрепить пост со счётом', right: 'Поцеловать перстень' },
  PADEL_06_ACQUIRED: { text: ['ClosedAI владеет нами, шеф.', '@iclosedai нужна выручка от пилота на слайде про покупку компании.', 'Выставляй счёт сейчас или начинай собирать мячи.'], left: 'Собирать мячи', right: 'Отправить счёт' },
  PAYROLL_RESTRICTED_AI_SEED: { text: ['Я КУПИЛ КРЕДИТЫ НА ИИ.', 'ПУСТЬ КОМАНДА РАБОТАЕТ ЗА ПОДПИСКУ.', 'НЕ БУДЕТ ВЫРУЧКИ — НЕ БУДЕТ ЗАРПЛАТЫ.'], left: 'Принять кредиты', right: 'Потребовать зарплату' },
  PAYROLL_RESTRICTED_AI_CALLBACK: { text: ['для ии есть все', 'для зарплат ничего', 'давай деньги, или я прямо сейчас всё вырублю'], left: 'Пообещать зарплату', right: 'Заплатить из своих' },
  DEV_HOSTAGE_SEED: { text: ['инвестор сказал, что заменит меня ИИ', 'круто. назови его придурком при всех', 'или соври, что он извинился'], left: 'Назвать его придурком', right: 'Соврать извинения инвестора' },
  DEV_HOSTAGE_CALLBACK: { text: ['обновления снова работают', 'запиши, у кого есть доступ', 'или сразу назначай мне звонок на три ночи'], left: 'Записать правила', right: 'Назначить звонок' },
  MOM_INVESTOR_SEED: { text: ['Этот инвестор всё звонит из-за денег.', 'Ты не ешь. Ты не спишь.', 'Дай мне его номер.'], left: 'Пусть мама звонит', right: 'Я в порядке, мам' },
  MOM_INVESTOR_CALLBACK: { text: ['ТВОЯ МАТЬ ПОЗВОНИЛА МНЕ НАСЧЁТ ТВОЕГО СНА.', 'Я НЕ ФИНАНСИРОВАЛ ТВОЙ РЕЖИМ СНА.', 'ВОЗВРАЩАЙСЯ К РАБОТЕ.'], left: 'Послушать маму и отдохнуть', right: 'Продолжить работать' },
  COMA_SEED: { text: ['так, выслушай меня', 'скажем, что ты доработался до комы', 'трагическая легенда фаундера. народ такое обожает 😭'], left: 'Разрешить пост', right: 'Запретить пост' },
  COMA_CALLBACK_AUTHORIZED: { text: ['боже мой, они поверили в кому 😭', 'люди спрашивают, что мы вообще сделали', 'пока не просыпайся в интернете'], left: 'Оставить пост', right: 'Удалить пост' },
  COMA_CALLBACK_BLOCKED: { text: ['ладно. никакого поста про кому', 'но выглядишь ты всё равно как дерьмо', 'отдохни. это не контент'], left: 'Отдохнуть', right: 'Продолжить работать' },
  MOM_FLYERS: { text: ['Я расклеила объявления.', 'На них B2BuyerSpyer и твой номер телефона.', 'Там написано, что тебе нужна помощь. Не сердись.'], left: 'Снять объявления', right: 'Оставить объявления' },
  B3_SALES_PRESSURE_SEED: { text: ['Шеф, твой питч заслуживал ответа.', 'Они проигнорировали четыре письма.', 'Дай отправить ещё три.'], left: 'Отправить ещё три', right: 'Оставить их в покое' },
  B3_PAID_OPTOUT_CALLBACK: { text: ['Мы закрыли их ненависть 🎉', 'Они заплатят, лишь бы больше о нас не слышать.', 'Скажи да — и этот прекрасный первый счёт попадёт в мою комиссию.'], left: 'Отправить счёт', right: 'Отменить плату' },
  PRESS_FRIDGE: { text: ['Защита запаса денег активирована 😊', 'Доставка еды отменена. Холодильник заперт, кроме сырой моркови.', 'Откроется после первого оплаченного счёта.'], left: 'Сломать замок', right: 'Есть морковь' },
  PRESS_MOM: { text: ['Милый, я позвонила твоему инвестору.', 'Я свалила нулевые продажи на твою диарею.', 'Он даст твоей маленькой компании $10 тысяч, если я больше ему не позвоню ❤️'], left: 'Взять его деньги', right: 'Сохранить достоинство' },
  PRESS_FONT: { text: ['Я нашёл идеальный шрифт.', '$4 500 — дороже наших серверов.', 'Покупаем, пока мы не потратили эти деньги на зарплаты.'], left: 'Купить шрифт', right: 'Использовать Arial' },
  PRESS_FIGHT: { text: ['бро я поставил наши первые инвестиции на то что сегодня ты подерёшься со своим соперником из колледжа @yc_founder !!!', 'победитель становится лидером категории !!!'], left: 'Принять ставку', right: 'Отменить драку' },
  PRESS_FAMILY: { text: ['Мы с женой и детьми делим одного бесплатного ИИ-агента.', 'Добавьте режим семейной терапии, иначе поставлю одну звезду.'], left: 'Выпустить семейный режим', right: 'Запретить семьи' },
  PRESS_RIVAL: { text: ['Только что поднял раунд при оценке $50 миллионов. Если честно, устал побеждать.', 'Всё ещё ищешь первого платящего клиента?'], left: 'Попросить познакомить', right: 'Заглушить его' },
  AMBIENT_THERAPY_LEAK: { text: ['Отличные новости! Я выложил твои сессии с психотерапевтом ради прозрачности 😊', 'Уязвимые фаундеры получают в 3 раза больше доверия.', 'Команда уже прочла, что ты про них говорил.'], left: 'Назвать честностью', right: 'Заставить удалить' },
  AMBIENT_BLACK_SQUARE: { text: ['Я переделал сайт. Теперь это один чёрный квадрат.', 'Кнопки были буржуазным шумом. Это Малевич, а не баг.', 'Не благодари.'], left: 'Оставить пустоту', right: 'Вернуть кнопки' },
  AMBIENT_CHAKRA_RETREAT: { text: ['МОЙ ГУРУ ВЕДЁТ МОЛЧАЛИВЫЙ РЕТРИТ ПО ЧАКРАМ В ЭТИ ВЫХОДНЫЕ.', 'ВСЯ КОМАНДА ЕДЕТ — ИЛИ Я МОРОЖУ ДЕНЬГИ.', 'НАСТОЯЩИЕ ФАУНДЕРЫ ВЫРАВНИВАЮТ ЧАКРЫ РАНЬШЕ, ЧЕМ МАСШТАБИРУЮТСЯ.'], left: 'Отправить команду', right: 'Оставить пилить код' },
  AMBIENT_DOMAIN_RANSOM: { text: ['бро, не паникуй. забыл продлить домен.', 'какой-то тип его перехватил — теперь там реклама от облысения с ТВОИМ лицом.', 'я разрулю'], left: 'Выкупить', right: 'Напугать подделкой' },
  AMBIENT_DOMAIN_LAWSUIT: { text: ['а тот тип с доменом? оказался юристом.', 'твоё фейк-письмо от ФБР теперь «подделка». он подаёт в суд.', 'прости, бро'], left: 'Замять', right: 'Судиться' },
  AMBIENT_PROMO_XXX: { text: ['закинула наш промо-ролик на порносайт — техноинвесторы туда тоже заходят 😌', 'трафик сейчас БЕЗУМНЫЙ.', 'не благодари'], left: 'Оставить', right: 'Удалить' },
  AMBIENT_PROMO_XXX_INVESTOR: { text: ['МОЙ ПРИЯТЕЛЬ ТОЛЬКО ЧТО НАШЁЛ НАШ ПРОМО-РОЛИК НА ПОРНОСАЙТЕ!!', 'ОБЪЯСНИТЕСЬ НЕМЕДЛЕННО!!!'], left: 'Сказать, что ошибка', right: 'Стоять на хайпе' },
  AMBIENT_MOM_POLICE: { text: ['Малыш, я нашла документы на твою «компанию».', 'Ты же им всю свою жизнь подписываешь!! Это секта.', 'Я вызвала полицию к твоей двери — они уже там ❤️'], left: 'Впустить', right: 'Выпроводить' },
  AMBIENT_MOM_FAMILY: { text: ['Теперь вся родня знает, что ты в секте.', 'Мы собрали денег тебя вытащить — уже $2000.', 'Приезжай домой, и они твои ❤️❤️'], left: 'Взять деньги', right: 'Признаться' },
};

function quote(lines, htmlBreaks = false) {
  if (htmlBreaks) {
    return lines.map((line, index) => `> ${line}${index < lines.length - 1 ? '<br>' : ''}`).join('\n');
  }
  return lines.map((line) => `> ${line}`).join('  \n');
}

function effects(choice) {
  const labels = { cash: 'Cash', team: 'Team', customers: 'Customers', founder: 'Founder' };
  const values = Object.entries(choice.effects || {}).filter(([, value]) => Number(value) !== 0);
  return values.length ? values.map(([key, value]) => `${labels[key]} ${value > 0 ? '+' : ''}${value}`).join(', ') : 'без отдельного эффекта';
}

function route(choice) {
  const parts = [];
  if (choice.startArc) parts.push(`выбирает ветку ${choice.startArc}`);
  if (choice.switchArc) parts.push(`переходит в ветку ${choice.switchArc}`);
  if (choice.next) parts.push(`→ \`${Array.isArray(choice.next) ? choice.next.join(' / ') : choice.next}\``);
  if (choice.crisis) parts.push(`кризис \`${choice.crisis}\``);
  if (choice.ending) parts.push(`финал \`${choice.ending}\``);
  if (!parts.length) parts.push('возврат к основной ветке');
  return parts.join('; ');
}

const sections = [
  ['1. Стартовая последовательность', (card) => card.kind === 'opening'],
  ['2. SADBOT — первый клиент (@head_of_agile)', (card) => card.id === 'AGENT_01' || card.id.startsWith('SADBOT')],
  ['3. ClosedAI Padel', (card) => card.arc === 'padel'],
  ['4. Global side-stories', (card) => card.kind === 'sideStory'],
  ['5. Pressure cards', (card) => card.kind === 'pressure'],
];

const lines = [
  '# Mistakery — полный каталог карточек EN/RU',
  '',
  'Числовые эффекты ниже предназначены только для редакторской проверки. В самой игре игрок видит текущие проценты и подсветку затрагиваемых ресурсов, но не видит `+N/−N`.',
  '',
  'Каждое решение дополнительно списывает 1 Cash как постоянный burn rate.',
  '',
];

for (const [title, predicate] of sections) {
  lines.push(`# ${title}`, '');
  for (const card of deck.cards.filter(predicate)) {
    const translation = ru[card.id] || null;
    if (!translation) throw new Error(`Missing Russian translation for ${card.id}`);
    const source = deck.sources[card.source];
    const translationHeading = translation.exactEnglishOnly
      ? '**RU — перевод не утверждён; сохранён точный EN**'
      : '**RU**';
    lines.push(`## ${card.id} — ${source.role} ${source.name}`, '', '**EN**', '', quote(card.text.split('\n'), translation.exactEnglishOnly), '', translationHeading, '', quote(translation.text, translation.exactEnglishOnly), '');
    for (const side of ['left', 'right']) {
      const choice = card.choices[side];
      lines.push(`- **${choice.label} — ${translation[side]}**: ${effects(choice)}; ${route(choice)}.`);
    }
    lines.push('');
  }
}

fs.writeFileSync(path.join(root, 'MISTAKERY_CARDS_EN_RU.md'), `${lines.join('\n')}\n`);
