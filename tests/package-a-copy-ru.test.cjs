const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalog = fs.readFileSync(path.join(__dirname, '..', 'MISTAKERY_CARDS_EN_RU.md'), 'utf8');

function section(id) {
  const match = catalog.match(new RegExp(`^## ${id} — [\\s\\S]*?(?=^## |^# 5\\.|\\Z)`, 'm'));
  assert.ok(match, `missing catalog section ${id}`);
  return match[0];
}

function russianCopy(id) {
  const source = section(id);
  const marker = source.match(/^\*\*RU(?: — [^*]+)?\*\*$/m);
  assert.ok(marker, `missing RU marker for ${id}`);
  const after = source.slice(marker.index + marker[0].length);
  const lines = [];
  for (const line of after.split(/\r?\n/)) {
    if (line.startsWith('>')) {
      lines.push(line.replace(/^> ?/, '').replace(/<br\s*\/?>/gi, '').trimEnd());
      continue;
    }
    if (lines.length && line.trim() !== '') break;
  }
  const choices = [...source.matchAll(/^- \*\*(.+?) — (.+?)\*\*:/gm)].map((match) => [match[1], match[2]]);
  return { text: lines.join('\n'), choices };
}

test('Package A Russian catalog contains the final approved copy', () => {
  const expected = {
    PAYROLL_RESTRICTED_AI_SEED: ['Я КУПИЛ КРЕДИТЫ НА ИИ.\nПУСТЬ КОМАНДА РАБОТАЕТ ЗА ПОДПИСКУ.\nНЕ БУДЕТ ВЫРУЧКИ — НЕ БУДЕТ ЗАРПЛАТЫ.', [['Accept credits', 'Принять кредиты'], ['Demand payroll', 'Потребовать зарплату']]],
    PAYROLL_RESTRICTED_AI_CALLBACK: ['для ии есть все\nдля зарплат ничего\nдавай деньги, или я прямо сейчас всё вырублю', [['Promise payroll', 'Пообещать зарплату'], ['Pay out of pocket', 'Заплатить из своих']]],
    DEV_HOSTAGE_SEED: ['инвестор сказал, что заменит меня ИИ\nкруто. назови его придурком при всех\nили соври, что он извинился', [['Call him an idiot', 'Назвать его придурком'], ["Fake investor's apology", 'Соврать извинения инвестора']]],
    DEV_HOSTAGE_CALLBACK: ['обновления снова работают\nзапиши, у кого есть доступ\nили сразу назначай мне звонок на три ночи', [['Write the rules', 'Записать правила'], ['Book the call', 'Назначить звонок']]],
    MOM_INVESTOR_SEED: ['Этот инвестор всё звонит из-за денег.\nТы не ешь. Ты не спишь.\nДай мне его номер.', [['Let Mom call', 'Пусть мама звонит'], ["I'm fine, Mom", 'Я в порядке, мам']]],
    MOM_INVESTOR_CALLBACK: ['ТВОЯ МАТЬ ПОЗВОНИЛА МНЕ НАСЧЁТ ТВОЕГО СНА.\nЯ НЕ ФИНАНСИРОВАЛ ТВОЙ РЕЖИМ СНА.\nВОЗВРАЩАЙСЯ К РАБОТЕ.', [['Take the break', 'Послушать маму и отдохнуть'], ['Keep working', 'Продолжить работать']]],
    COMA_SEED: ['так, выслушай меня\nскажем, что ты доработался до комы\nтрагическая легенда фаундера. народ такое обожает 😭', [['Approve the post', 'Разрешить пост'], ['Kill the story', 'Запретить пост']]],
    COMA_CALLBACK_AUTHORIZED: ['боже мой, они поверили в кому 😭\nлюди спрашивают, что мы вообще сделали\nпока не просыпайся в интернете', [['Keep the post', 'Оставить пост'], ['Delete the post', 'Удалить пост']]],
    COMA_CALLBACK_BLOCKED: ['ладно. никакого поста про кому\nно выглядишь ты всё равно как дерьмо\nотдохни. это не контент', [['Take rest', 'Отдохнуть'], ['Keep working', 'Продолжить работать']]],
    MOM_FLYERS: ['Я расклеила объявления.\nНа них B2BuyerSpyer и твой номер телефона.\nТам написано, что тебе нужна помощь. Не сердись.', [['Take them down', 'Снять объявления'], ['Leave them up', 'Оставить объявления']]],
  };

  for (const [id, [text, choices]] of Object.entries(expected)) {
    assert.deepEqual(russianCopy(id), { text, choices }, `${id} Russian copy changed`);
  }
});
