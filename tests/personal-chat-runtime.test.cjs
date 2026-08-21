const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const app = read('app.js');
const html = read('index.html');
const css = read('style.css');
const canonicalDeck = require('../cards.json');
const bundledDeck = require('../cards.bundle.js');

function sha256(name) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
}

function activeCardIds() {
  const match = app.match(/const ACTIVE_CARD_IDS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\);/);
  assert.ok(match, 'missing ACTIVE_CARD_IDS runtime gate');
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]);
}

test('runtime exposes only the approved opening, Padel sequence, and eight outcomes', () => {
  assert.deepEqual(activeCardIds(), [
    'OPEN_01',
    'OPEN_02a',
    'OPEN_02b',
    'OPEN_BOSS',
    'OPEN_DEV',
    'OPEN_INVESTOR',
    'PADEL_INVITE',
    'DREAM_TEAM',
    'IRL_PADEL_01',
    'IRL_PADEL_03B',
    'IRL_PADEL_04',
    'IRL_PADEL_05',
    'IRL_PADEL_06',
    'PADEL_OUTCOME_0',
    'PADEL_OUTCOME_1',
    'PADEL_OUTCOME_2',
    'PADEL_OUTCOME_3',
    'PADEL_OUTCOME_4',
    'PADEL_OUTCOME_5',
    'PADEL_OUTCOME_6',
    'PADEL_OUTCOME_7',
  ]);
  assert.match(app, /ACTIVE_CARD_IDS\.includes\(card\.id\)/);
  assert.match(app, /card\.id\s*===\s*['"]OPEN_INVESTOR['"][\s\S]*continueFromInvestor/);
  assert.match(app, /card\.id\s*===\s*['"]DREAM_TEAM['"][\s\S]*continueFromDreamTeam/);
  assert.match(app, /card\.id\s*===\s*['"]IRL_PADEL_06['"][\s\S]*continueFromPadelMatchPoint/);
  assert.match(app, /function\s+finishPadelOutcome[\s\S]*padelCeoScore\s*=\s*null[\s\S]*startSaved\(1\)/);
  assert.doesNotMatch(`${app}\n${html}`, /NEXT CONTENT DISABLED|BOTH ORIGINAL ARCS STOP HERE/);
});

test('copy edits keep the offline bundle canonical and the engine byte-for-byte unchanged', () => {
  assert.deepEqual(bundledDeck, canonicalDeck);
  assert.equal(sha256('game.js'), '4587f9034eb5e83e639c2a96e2bf21d4531511bc6c48234d5a025d94c245e466');
});

test('three active cards preserve the approved message boundaries and revised investor copy', () => {
  const cards = Object.fromEntries(canonicalDeck.cards.map((card) => [card.id, card]));
  assert.equal(cards.OPEN_02a.text, "Competitor analysis complete 📊\nWe have a slight KPI deviation (0 clients).\nI reframed this as a 'pre-revenue learning phase' 📈\n\nWant me to send a motivational quote to the team? 🚀🤖");
  assert.equal(cards.OPEN_DEV.text, 'payroll is friday\n\nare we getting money or another speech about changing b2b saas forever?');
  assert.equal(cards.OPEN_INVESTOR.text, 'I DIDN’T DUMP MY CASH INTO THIS AI CRAP TO GET ZERO CLIENTS.\n\nWHERE THE HELL ARE THE BUYERS???\n\nIF I WANTED TO WASTE MONEY I’D BUY A YACHT FOR MY EX-WIFE.');
});

test('Padel Invite, Dream Team, five IRL cards, and eight outcomes are the canonical scoped Padel graph', () => {
  const investorIndex = canonicalDeck.cards.findIndex((card) => card.id === 'OPEN_INVESTOR');
  assert.deepEqual(
    canonicalDeck.cards.slice(investorIndex, investorIndex + 17).map((card) => card.id),
    [
      'OPEN_INVESTOR',
      'PADEL_INVITE',
      'DREAM_TEAM',
      'IRL_PADEL_01',
      'IRL_PADEL_03B',
      'IRL_PADEL_04',
      'IRL_PADEL_05',
      'IRL_PADEL_06',
      'PADEL_OUTCOME_0',
      'PADEL_OUTCOME_1',
      'PADEL_OUTCOME_2',
      'PADEL_OUTCOME_3',
      'PADEL_OUTCOME_4',
      'PADEL_OUTCOME_5',
      'PADEL_OUTCOME_6',
      'PADEL_OUTCOME_7',
      'AGENT_01',
    ],
  );

  const cards = Object.fromEntries(canonicalDeck.cards.map((card) => [card.id, card]));
  assert.equal(cards.OPEN_INVESTOR.choices.left.next, 'AGENT_01');
  assert.equal(cards.OPEN_INVESTOR.choices.right.next, 'PADEL_01');
  assert.deepEqual(cards.OPEN_INVESTOR.choices.left.effects, { cash: -2, founder: 1 });
  assert.deepEqual(cards.OPEN_INVESTOR.choices.right.effects, { cash: -2, team: -4, founder: 2 });

  assert.equal(cards.PADEL_INVITE.source, '@padel_pro');
  assert.equal(cards.PADEL_INVITE.text, 'Yo champ, anyone in the club would die for this match, but I held the slot for you.\nTomorrow 7 AM vs ClosedAI CEO.\n\nThat’s your dream client, man. Remember who opened this door for you.');
  assert.deepEqual(cards.PADEL_INVITE.choices, {
    left: { label: "I'm in", effects: {}, next: 'DREAM_TEAM' },
    right: { label: 'Feeling sick, pass', effects: {}, next: 'DREAM_TEAM' },
  });

  assert.equal(cards.DREAM_TEAM.mode, 'team');
  assert.deepEqual(cards.DREAM_TEAM.messages, [
    {
      direction: 'outgoing',
      text: "Guess what? Playing padel with ClosedAI's CEO tomorrow.\nFinally landing our first big client!! 💸",
    },
    {
      direction: 'incoming',
      source: '@bigdeals',
      avatar: 'BD',
      text: 'Insane pull, boss! 🎯\nNow let him win. Stroke his ego and we close this easily',
    },
    {
      direction: 'incoming',
      source: '@hype_queen',
      avatar: 'HQ',
      text: 'nah, smoke him. pure clout for us\nimagine the feed: no-name startup founder violates ClosedAI CEO in 4K 💀',
    },
  ]);
  assert.deepEqual(cards.DREAM_TEAM.choices, {
    left: { label: "I'll play nice 😇", effects: {}, next: 'IRL_PADEL_01' },
    right: { label: 'We’ll see', effects: {}, next: 'IRL_PADEL_01' },
  });
  assert.equal(canonicalDeck.sources.dream_team.name, 'Dream Team');
  assert.equal(canonicalDeck.sources.dream_team.role, '6 members · 3 online');
  assert.equal(canonicalDeck.sources['@padel_pro'].irlName, 'Padel coach');
  assert.equal(canonicalDeck.sources['@iclosedai'].irlName, 'ClosedAI CEO');
  assert.equal(canonicalDeck.sources['@padel_pro'].irlAvatar, 'assets/irl-padel-coach-avatar.png');
  assert.equal(canonicalDeck.sources['@iclosedai'].irlAvatar, 'assets/irl-closedai-ceo-avatar.png');
  assert.equal(fs.existsSync(path.join(root, canonicalDeck.sources['@padel_pro'].irlAvatar)), true);
  assert.equal(fs.existsSync(path.join(root, canonicalDeck.sources['@iclosedai'].irlAvatar)), true);

  assert.equal(cards.IRL_PADEL_01.mode, 'irl');
  assert.equal(cards.IRL_PADEL_01.source, '@padel_pro');
  assert.equal(cards.IRL_PADEL_01.location, 'IRL · PADEL CLUB');
  assert.equal(cards.IRL_PADEL_01.score, 'Score: 0–0');
  assert.equal(cards.IRL_PADEL_01.text, "Bro, you do NOT pitch here.\nStart selling, and you're a nobody to him.\nEarn his respect on the court first.");
  assert.deepEqual(cards.IRL_PADEL_01.choices, {
    left: { label: 'Mouth shut, game on', effects: {}, ceoScore: 0, next: 'IRL_PADEL_04' },
    right: { label: 'Now or never, pitching', effects: {}, ceoScore: 1, next: 'IRL_PADEL_03B' },
  });

  assert.equal(cards.IRL_PADEL_03B.mode, 'irl');
  assert.equal(cards.IRL_PADEL_03B.source, '@iclosedai');
  assert.equal(cards.IRL_PADEL_03B.location, 'IRL · PADEL CLUB');
  assert.equal(cards.IRL_PADEL_03B.score, 'Score: 0–0');
  assert.equal(cards.IRL_PADEL_03B.text, 'Who let a pop-up ad onto my court?\nGo fetch the balls and grab my water before I replace your whole startup with one prompt.');
  assert.deepEqual(cards.IRL_PADEL_03B.choices, {
    left: { label: 'Getting your water', effects: {}, ceoScore: -1, next: 'IRL_PADEL_04' },
    right: { label: 'Business after the match', effects: {}, ceoScore: 1, next: 'IRL_PADEL_04' },
  });

  assert.equal(cards.IRL_PADEL_04.mode, 'irl');
  assert.equal(cards.IRL_PADEL_04.source, '@iclosedai');
  assert.equal(cards.IRL_PADEL_04.score, 'Score: 0–0');
  assert.equal(cards.IRL_PADEL_04.text, 'We skip the side switching.\nYou won’t melt after a couple of sets in the sun, right?');
  assert.deepEqual(cards.IRL_PADEL_04.choices, {
    left: { label: 'Happy to take it', effects: {}, ceoScore: -1, next: 'IRL_PADEL_05' },
    right: { label: "Let's stick to rules", effects: {}, ceoScore: 1, next: 'IRL_PADEL_05' },
  });

  assert.equal(cards.IRL_PADEL_05.mode, 'irl');
  assert.equal(cards.IRL_PADEL_05.source, '@iclosedai');
  assert.equal(cards.IRL_PADEL_05.score, 'Score: 4–4');
  assert.equal(cards.IRL_PADEL_05.text, 'THAT BALL WAS OUT! Are you blind???\nDon’t even try to cheat me. That’s my point.');
  assert.deepEqual(cards.IRL_PADEL_05.choices, {
    left: { label: 'Definitely out, my bad', effects: {}, ceoScore: -1, next: 'IRL_PADEL_06' },
    right: { label: "No way, that's in", effects: {}, ceoScore: 1, next: 'IRL_PADEL_06' },
  });

  assert.equal(cards.IRL_PADEL_06.mode, 'irl');
  assert.equal(cards.IRL_PADEL_06.source, '@padel_pro');
  assert.equal(cards.IRL_PADEL_06.score, 'Score: 5–5 · 40–40 · DECIDING POINT');
  assert.equal(cards.IRL_PADEL_06.text, "Match point, bro. Give him the win.\nThe best shot right now is the one you don't take.");
  assert.deepEqual(cards.IRL_PADEL_06.choices, {
    left: { label: "I'll throw it, coach", effects: {} },
    right: { label: 'Fighting till the end', effects: {} },
  });

  const outcomes = {
    0: {
      mode: 'personal',
      source: '@padel_pro',
      score: undefined,
      text: 'Man... for real?\nI risked my own reputation to give you a golden ticket and you backed out.\nYou just clowned both of us.',
      labels: ['I have a fever!', '😔😔😔'],
    },
    1: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU WON THE MATCH',
      text: 'Relax, boy. It was only a warm-up.\nWatching you sweat and cheat for that win was painful to watch.\nHave fun begging for money!',
      labels: ['Please wait, sir!', 'Learn to lose'],
    },
    2: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU WON THE MATCH',
      text: "Well, look at that.\nTurns out you actually have some balls.\nSend the demo. Let's see if your startup is just as ballsy.",
      labels: ['Play hard, work harder', 'Prepare to stare'],
    },
    3: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU LOST THE MATCH',
      text: 'Easiest win of my life.\nIt was almost cute watching you panic on match point.\nKnew you were soft from the start. Get off my court.',
      labels: ['Just let you win!', 'So... about the deal?'],
    },
    4: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU LOST THE MATCH',
      text: "Easy win.\nGood boy. Ready to do whatever I say.\nDeal is done. Send the demo, let's see what new toy I just bought.",
      labels: ['Right away, boss!', "We're the future"],
    },
    5: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU LOST THE MATCH',
      text: 'What were you thinking, kid? I always win.\nConsider this deal your consolation prize for trying.\nSend the demo.',
      labels: ['Accepted', 'Rematch tomorrow'],
    },
    6: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'YOU LOST THE MATCH',
      text: "You lost, kid. Nice try.\nKeep working hard, maybe one day I'll hire you to take out my trash.\nAnd yes, forget about business.",
      labels: ['Remember my name', 'Fine without you'],
    },
    7: {
      mode: 'irl',
      source: '@iclosedai',
      score: 'MATCH ABORTED',
      text: 'MATCH OVER! I am SO done with this.\nBitching and crying over every single point.\nKnow your place, nobody. You’re blacklisted everywhere.',
      labels: ["Who's crying now?", "I'll do anything, please!"],
    },
  };
  Object.entries(outcomes).forEach(([number, expected]) => {
    const card = cards[`PADEL_OUTCOME_${number}`];
    assert.ok(card, `missing PADEL_OUTCOME_${number}`);
    assert.equal(card.mode, expected.mode);
    assert.equal(card.source, expected.source);
    assert.equal(card.score, expected.score);
    assert.equal(card.text, expected.text);
    assert.deepEqual([card.choices.left.label, card.choices.right.label], expected.labels);
    assert.deepEqual(card.choices.left.effects, {});
    assert.deepEqual(card.choices.right.effects, {});
    assert.equal(card.choices.left.next, undefined);
    assert.equal(card.choices.right.next, undefined);
  });

  const padelIds = new Set(activeCardIds().filter((id) => (
    id === 'PADEL_INVITE'
    || id === 'DREAM_TEAM'
    || id.startsWith('IRL_PADEL_')
    || id.startsWith('PADEL_OUTCOME_')
  )));
  canonicalDeck.cards.filter((card) => padelIds.has(card.id)).forEach((card) => {
    Object.values(card.choices).forEach((choice) => assert.deepEqual(choice.effects, {}));
  });
  assert.equal(fs.existsSync(path.join(root, 'assets', 'irl-padel-court.png')), true);
});

test('onboarding and Saved Messages retain the approved copy and stages', () => {
  for (const fragment of [
    'Congratulations! 🎉\\nYou successfully escaped the corporate grind',
    'No more working for the man. From now on, you are THE MAN.',
    'Fast forward 5 months:\\nyou have your own AI startup',
    'Does the world actually need your product? It’s AI. Of course they do.\\n\\nAre there any paying customers?',
    'So long, corporate jail!',
    'Trust the process',
    'Open the Masterplan',
    'NEVER WORK AGAIN PLAN',
    '<b>3.</b> Pick up a fancy sport (Golf?? Padel??)',
    '<b>9.</b> Buy mom a house (finally be the favorite son)',
    '<b>10.</b> Hire ex-boss to fire him',
    '5 MONTHS AS A FOUNDER',
    '<b>2.</b> Bro as a cofounder ✅',
    '<b>3.</b> Padel (CEO networking) ✅',
    '<b>4.</b> Built AI B2B SaaS. B2B sales - easy money ✅',
    '<b>9.</b> Unicorn 🦄🎯 (waiting for the market to wake up)',
    'Right on track',
    'Slightly behind',
    'WE’RE SO BACK',
    'it’s so over',
  ]) assert.ok(app.includes(fragment), `missing approved copy: ${fragment}`);

  assert.doesNotMatch(app, /Duh\./);

  assert.match(app, /shellStage:\s*['"]intro['"]/);
  assert.match(app, /shellStage:\s*['"]optimistic['"]/);
  assert.match(app, /shellStage:\s*['"]real['"]/);
  assert.match(app, /Array\.from\([^)]*delivered/);
});

test('index uses one Screen 13 Personal Chat shell in semantic row order', () => {
  assert.match(html, /class="frame"/);
  assert.match(html, /class="phone"[^>]*data-game/);
  assert.match(html, /class="top"/);
  assert.match(html, /class="resources"[^>]*data-resources/);
  assert.match(html, /class="messenger-scene scene--card personal-scene"/);
  assert.match(html, /class="contact"/);
  assert.match(html, /data-pinned/);
  assert.match(html, /class="chat"[^>]*data-chat[\s\S]*data-reply-hint[\s\S]*class="choices"[^>]*data-choices/);
  assert.match(html, /data-message-avatar/);
  assert.match(html, /data-card-id/);
});

test('CSS matches the approved phone, typography, Quiet Glass, and shadow spacing', () => {
  assert.match(css, /\.frame\s*\{[^}]*width:\s*340px;[^}]*height:\s*700px;/s);
  assert.match(css, /\.phone\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*#bdd5e8 0%,\s*#d4e4f0 100%\);/s);
  assert.match(css, /\.message p\s*\{[^}]*font-size:\s*13\.5px;[^}]*line-height:\s*1\.42;/s);
  assert.match(css, /--message-clearance:\s*4px;/);
  assert.match(css, /\.chat\s*\{[^}]*gap:\s*8px;[^}]*overflow:\s*visible;[^}]*z-index:\s*2;/s);
  assert.match(css, /\.message-clearance\s*\{[^}]*height:\s*var\(--message-clearance\);[^}]*flex:\s*0 0 var\(--message-clearance\);/s);
  assert.match(css, /\.reply-hint-dock\s*\{[^}]*padding:\s*4px 10px 8px;[^}]*z-index:\s*3;/s);
  assert.match(css, /\.reply-hint\s*\{[^}]*width:\s*100%;[^}]*height:\s*34px;[^}]*font-weight:\s*400;/s);
  assert.match(css, /\.reply-hint__arrow\s*\{[^}]*flex:\s*0 0 24px;[^}]*width:\s*24px;[^}]*height:\s*24px;/s);
  assert.match(css, /\.self-message p,\s*\.team-bubble p\s*\{[^}]*font-size:\s*12\.2px;/s);
  assert.match(css, /\.pinned\s*\{[^}]*height:\s*48px;/s);
  assert.doesNotMatch(css, /\.irl-location\s+\.pin\s*\{/);
  assert.match(css, /\.irl-scene\s*\{[^}]*background:\s*#d2dbe1;/s);
  assert.match(css, /\.irl-scene::before\s*\{[^}]*background:\s*#d2dbe1;/s);
  assert.match(css, /url\(["']assets\/irl-padel-court\.png["']\)/);
  assert.match(css, /\.irl-scene::after\s*\{[^}]*inset:\s*1px;[^}]*background:\s*linear-gradient\(180deg,\s*rgba\(7,\s*20,\s*32,\s*\.12\),\s*rgba\(7,\s*20,\s*32,\s*\.22\)\s*48%,\s*rgba\(7,\s*20,\s*32,\s*\.38\)\),\s*url\(["']assets\/irl-padel-court\.png["']\)\s*center\s*54%\s*\/\s*cover\s*no-repeat;[^}]*filter:\s*blur\(1\.8px\)\s*saturate\(\.88\);[^}]*clip-path:\s*inset\(0\s*round\s*25px\);/s);
  assert.doesNotMatch(css, /\.irl-scene::after\s*\{[^}]*(?:border-radius:\s*24px|box-shadow:)/s);
  assert.match(css, /\.irl-dialog p\s*\{[^}]*font-size:\s*14px;[^}]*font-weight:\s*400;[^}]*line-height:\s*1\.38;/s);
});
