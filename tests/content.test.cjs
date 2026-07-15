const test = require('node:test');
const assert = require('node:assert/strict');
const deck = require('../cards.json');
const engine = require('../game.js');

const CLOSED_CAST = new Set([
  '@b2buddy_bot', '@hustler', '@hype_queen', '@bigdeals', '@error404',
  '@pixel_perfect', '@unicorn_hunter', '@business1', '@yc_founder',
  '@i_love_cats72', '@padel_pro', '@head_of_agile', '@iclosedai',
  '@wmwerke', '@user[number]',
]);

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function flagsFrom(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

test('ships one valid canonical deck for a full run', () => {
  assert.deepEqual(engine.validateDeck(deck), []);
  assert.equal(deck.cards.length, 43);
  assert.equal(deck.resources.customers.label, 'Customers');
  assert.equal('demand' in deck.resources, false);
});

test('uses only the approved closed-world cast', () => {
  Object.keys(deck.sources).forEach((source) => assert.ok(CLOSED_CAST.has(source), `Unexpected source ${source}`));
  deck.cards.forEach((card) => assert.ok(CLOSED_CAST.has(card.source), `Unexpected source on ${card.id}`));
});

test('keeps messages and replies compact enough for the messenger card', () => {
  deck.cards.forEach((card) => {
    assert.ok(wordCount(card.text) <= 38, `${card.id} has ${wordCount(card.text)} words`);
    const lineLimit = ['OPEN_03_AUDIT', 'OPEN_06'].includes(card.id) ? 4 : 3;
    assert.ok(card.text.split('\n').length <= lineLimit, `${card.id} exceeds ${lineLimit} lines`);
    ['left', 'right'].forEach((side) => {
      [card.choices[side].label, card.choices[side].lowLabel, card.choices[side].highLabel].filter(Boolean).forEach((label) => {
        assert.ok(wordCount(label) <= 4, `${card.id}.${side} label is too long: ${label}`);
      });
    });
  });
});

test('every visible resource effect has a matching invisible editorial reason', () => {
  deck.cards.forEach((card) => ['left', 'right'].forEach((side) => {
    const choice = card.choices[side];
    const affected = engine.getAffectedResources(choice);
    assert.deepEqual(Object.keys(choice.effect_reason || {}).sort(), affected.sort(), `${card.id}.${side}`);
    affected.forEach((resource) => assert.ok(String(choice.effect_reason[resource]).trim(), `${card.id}.${side}.${resource}`));
  }));
});

test('does not invent connective-tissue entities or use the repeated too-late override', () => {
  const allText = deck.cards.map((card) => card.text).join('\n').toLowerCase();
  [/intern\b/, /board of directors/, /advisory board/, /too late/].forEach((pattern) => {
    assert.equal(pattern.test(allText), false, `Found rejected pattern: ${pattern}`);
  });
});

test('plays six onboarding decisions, keeps the audit and invoice branches separate, then enters the selected arc', () => {
  const play = (secondChoice, routeChoice) => {
    let state = engine.startRun(deck);
    const visited = [];
    const openingSides = {
      OPEN_01: 'left', OPEN_02: secondChoice, OPEN_03_AUDIT: 'left', OPEN_03_INVOICES: 'left',
      OPEN_04: 'left', OPEN_05: 'left', OPEN_06: routeChoice,
    };
    for (let safety = 0; !state.activeArc && safety < 12; safety += 1) {
      if (state.currentCardId.startsWith('OPEN_')) visited.push(state.currentCardId);
      state = engine.resolveChoice(deck, state, openingSides[state.currentCardId] || 'left', { rng: () => 0 }).state;
    }
    return { state, visited };
  };

  const audit = play('left', 'left');
  assert.deepEqual(audit.visited, ['OPEN_01', 'OPEN_02', 'OPEN_03_AUDIT', 'OPEN_04', 'OPEN_05', 'OPEN_06']);
  assert.equal(audit.state.gameOver, false);
  assert.equal(audit.state.endingId, null);
  assert.equal(audit.state.activeArc, 'agents');
  assert.equal(audit.state.currentCardId, 'AGENT_01');

  const invoices = play('right', 'right');
  assert.deepEqual(invoices.visited, ['OPEN_01', 'OPEN_02', 'OPEN_03_INVOICES', 'OPEN_04', 'OPEN_05', 'OPEN_06']);
  assert.equal(invoices.state.gameOver, false);
  assert.equal(invoices.state.endingId, null);
  assert.equal(invoices.state.activeArc, 'padel');
  assert.equal(invoices.state.currentCardId, 'PADEL_01');
});

test('the onboarding uses the approved copy, cast and reply labels', () => {
  const opening = engine.cardById(deck, 'OPEN_01');
  const prospects = engine.cardById(deck, 'OPEN_02');
  const audit = engine.cardById(deck, 'OPEN_03_AUDIT');
  const invoices = engine.cardById(deck, 'OPEN_03_INVOICES');
  const exBoss = engine.cardById(deck, 'OPEN_04');
  const payroll = engine.cardById(deck, 'OPEN_05');
  const investor = engine.cardById(deck, 'OPEN_06');

  assert.equal(opening.text, 'Hi there, visionary! 👋\n11,204 new B2B AI SaaS competitors launched today.\nOur startup, B2BuyerSpyer, still has the best name.');
  assert.equal(opening.choices.left.label, 'Check the market');
  assert.equal(opening.choices.right.label, 'Trust the name');
  assert.match(prospects.text, /Potential customers: 814\. Paid invoices: 0\./);
  assert.equal(prospects.choices.left.next, 'OPEN_03_AUDIT');
  assert.equal(prospects.choices.right.next, 'OPEN_03_INVOICES');
  assert.equal(audit.source, '@b2buddy_bot');
  assert.match(audit.text, /0 need B2BuyerSpyer\./);
  assert.equal(audit.choices.right.label, 'Rewrite the pitch');
  assert.equal(invoices.source, '@bigdeals');
  assert.equal(invoices.choices.left.label, 'Fake one');
  assert.equal(invoices.choices.right.label, 'Call five');
  assert.match(exBoss.text, /months since you quit/i);
  assert.equal(exBoss.choices.left.label, 'Leave on read');
  assert.equal(payroll.choices.right.label, 'Promise revenue');
  assert.doesNotMatch(investor.text, /:/);
  assert.equal(investor.choices.left.label, 'Build for enterprise');
  assert.equal(investor.choices.right.label, 'Hunt a whale');
});

test('does not award Customers for auditing a list or money for a fake invoice', () => {
  assert.equal(engine.cardById(deck, 'OPEN_02').choices.left.effects.customers, undefined);
  assert.ok(engine.cardById(deck, 'OPEN_02').choices.left.effects.founder < 0);
  const fake = engine.cardById(deck, 'OPEN_03_INVOICES').choices.left.effects;
  assert.equal(fake.customers, undefined);
  assert.equal(fake.cash, undefined);
  const invoice = engine.cardById(deck, 'OPEN_03_INVOICES');
  assert.equal(invoice.source, '@bigdeals');
  assert.match(invoice.text, /empty invoice folder/i);
  assert.match(invoice.text, /REVENUE PIPELINE/);
  assert.match(invoice.text, /Fake one invoice or call five prospects/i);
  assert.doesNotMatch(invoice.text, /@unicorn_hunter|WHERE IS THE FUCKING REVENUE/i);
});

test('builds the agent story through dev, hype, an announced lead and the slave-trading problem', () => {
  assert.equal(deck.cards.filter((card) => card.arc === 'agents').length, 9);
  assert.equal(engine.cardById(deck, 'AGENT_02_DEV').source, '@error404');
  assert.equal(engine.cardById(deck, 'AGENT_03_HYPE').source, '@hype_queen');
  assert.equal(engine.cardById(deck, 'AGENT_04_LEAD').source, '@bigdeals');
  assert.match(engine.cardById(deck, 'AGENT_04_LEAD').text.toLowerCase(), /first|actual budget|serious buyer/);
  assert.match(engine.cardById(deck, 'AGENT_04_LEAD').text.toLowerCase(), /first buyer/);
  assert.match(engine.cardById(deck, 'AGENT_04_LEAD').text, /@head_of_agile/);
  assert.equal(
    engine.cardById(deck, 'AGENT_06_LEGAL').text,
    'Our lawyers saw “sentient employees” in your deck.\nBuying them is slave trading.',
  );
  assert.match(engine.cardById(deck, 'AGENT_07_INVOICE').text.toLowerCase(), /suppliers/);
  assert.equal(engine.cardById(deck, 'AGENT_01').choices.left.label, 'Build it properly');
  assert.equal(engine.cardById(deck, 'AGENT_01').choices.right.label, 'Ship it tonight');
  assert.equal(engine.cardById(deck, 'AGENT_05_ORDER').choices.left.label, 'Promise Friday');
  assert.equal(engine.cardById(deck, 'AGENT_05_ORDER').choices.right.label, 'Check procurement');
  assert.equal(engine.cardById(deck, 'AGENT_07_INVOICE').choices.right.next, 'AGENT_07_DONATE');
  assert.equal(engine.cardById(deck, 'AGENT_07_INVOICE').choices.right.ending, undefined);
  assert.match(engine.cardById(deck, 'AGENT_07_DONATE').text, /humanitarian budget/i);
  assert.equal(engine.cardById(deck, 'AGENT_07_DONATE').choices.right.crisis, 'freedom_sale');
  assert.match(deck.crises.freedom_sale.text, /freedom|slave/i);
});

test('dev publishes both deploy and demo routes, both flag-gating the shared Hype beat', () => {
  const dev = engine.cardById(deck, 'AGENT_02_DEV');
  const hype = engine.cardById(deck, 'AGENT_03_HYPE');
  assert.equal(dev.choices.right.label, 'Publish one demo');
  ['left', 'right'].forEach((side) => assert.ok(flagsFrom(dev.choices[side].setFlags).includes('agents_public')));
  ['left', 'right'].forEach((side) => assert.ok(flagsFrom(dev.choices[side].setFlags).includes('patch_built')));
  // pool beats have no hardcoded next; hype is reached by its patch_built gate
  ['left', 'right'].forEach((side) => assert.equal(dev.choices[side].next, undefined));
  assert.ok(flagsFrom(hype.requires).includes('patch_built'));
  ['left', 'right'].forEach((side) => assert.ok(flagsFrom(hype.choices[side].setFlags).includes('hyped')));
});

test('introduces the ClosedAI CEO before a deterministic throw-or-win padel choice', () => {
  assert.equal(deck.cards.filter((card) => card.arc === 'padel').length, 9);
  const intro = engine.cardById(deck, 'PADEL_01');
  const terms = engine.cardById(deck, 'PADEL_02');
  const tactic = engine.cardById(deck, 'PADEL_04_CHOICE');
  assert.equal(intro.source, '@padel_pro');
  assert.match(intro.text, /ClosedAI’s CEO/i);
  assert.match(intro.text, /My 8 AM client/i);
  assert.match(intro.text, /funding and cloud/i);
  assert.equal(terms.source, '@iclosedai');
  assert.match(terms.text, /enterprise buyers/i);
  assert.match(terms.text, /I win, I own it/i);
  assert.equal(tactic.source, '@padel_pro');
  assert.match(tactic.text, /ego cannot survive/i);
  assert.equal(tactic.choices.left.label, 'Throw the match');
  assert.equal(tactic.choices.left.effects.customers, undefined);
  assert.equal(tactic.choices.left.next, 'PADEL_05_LOSE');
  assert.equal(tactic.choices.right.label, 'Play for real');
  assert.equal(tactic.choices.right.next, 'PADEL_05_WIN');
  assert.match(engine.cardById(deck, 'PADEL_05_WIN').text, /6–1/);
  assert.equal(engine.cardById(deck, 'PADEL_03_TEAM').choices.left.label, 'Prep the pilot');
  assert.equal(engine.cardById(deck, 'PADEL_03_TEAM').choices.right.label, 'Pack the repo');
  assert.equal(engine.cardById(deck, 'PADEL_06_PILOT').choices.left.label, 'Accept 24/7');
  assert.equal(engine.cardById(deck, 'PADEL_06_PILOT').choices.right.label, 'Set work hours');
  assert.match(engine.cardById(deck, 'PADEL_06_PILOT').text, /24\/7/);
  assert.equal(engine.cardById(deck, 'PADEL_05_LOSE').choices.left.ending, 'acquired_by_padel');
  assert.equal(engine.cardById(deck, 'PADEL_05_LOSE').choices.left.next, undefined);
  assert.match(engine.cardById(deck, 'PADEL_05_LOSE').text, /Chief Ball Retrieval Officer/);
  assert.equal(engine.cardById(deck, 'PADEL_05_LOSE').choices.right.label, 'Hold the repo');
  assert.equal(engine.cardById(deck, 'PADEL_06_ACQUIRED').source, '@bigdeals');
  assert.match(engine.cardById(deck, 'PADEL_06_ACQUIRED').text, /pilot/i);
  assert.match(engine.cardById(deck, 'PADEL_06_ACQUIRED').text, /acquisition slide/i);
  assert.equal(engine.cardById(deck, 'PADEL_06_WAR').choices.left.label, 'Pin the score');
  assert.match(engine.cardById(deck, 'PADEL_06_WAR').text, /@unicorn_hunter/);
});

test('uses explicit pressure breaks instead of interrupting immediate story consequences', () => {
  assert.deepEqual(deck.meta.pressureAfterArcSteps, []);
  const slots = deck.cards.filter((card) => card.opensPressureSlot).map((card) => card.id).sort();
  assert.deepEqual(slots, ['AGENT_01', 'AGENT_03_HYPE', 'AGENT_06_LEGAL'].sort());
  ['OPEN_05', 'PADEL_01', 'PADEL_04_CHOICE', 'PADEL_05_WIN', 'PADEL_05_LOSE'].forEach((id) => {
    assert.notEqual(engine.cardById(deck, id).opensPressureSlot, true, `${id} should continue immediately`);
  });
});

test('declares forced, pool and ambient scheduler modes without changing the story copy', () => {
  const pool = deck.cards.filter((card) => card.continuation === 'pool').map((card) => card.id).sort();
  assert.deepEqual(pool, ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_03B_WILD'].sort());

  ['OPEN_06', 'AGENT_04_LEAD', 'AGENT_05_ORDER', 'PADEL_01', 'PADEL_03_TEAM', 'PADEL_04_CHOICE', 'PADEL_05_WIN', 'PADEL_05_LOSE'].forEach((id) => {
    assert.equal(engine.cardById(deck, id).continuation, 'forced', `${id} must continue immediately`);
  });
  assert.equal(engine.cardById(deck, 'AGENT_06_LEGAL').opensPressureSlot, true);

  deck.cards.filter((card) => card.kind === 'pressure').forEach((card) => {
    assert.equal(card.continuation, 'ambient', `${card.id} must be ambient`);
    assert.equal(card.oncePerRun, true, `${card.id} must not repeat in one run`);
  });
});

test('uses resource ranges only on ambient premises or named scheduler eligibility', () => {
  const ranged = Object.fromEntries(deck.cards
    .filter((card) => card.resourceRange)
    .map((card) => [card.id, card.resourceRange]));

  assert.deepEqual(ranged, {
    PAYROLL_RESTRICTED_AI_SEED: { cash: { max: 30 }, founder: { min: 45 } },
    DEV_HOSTAGE_SEED: { cash: { max: 30 }, founder: { min: 45 } },
    MOM_INVESTOR_SEED: { founder: { min: 58, max: 65 } },
    COMA_SEED: { founder: { min: 58, max: 65 } },
    MOM_FLYERS: { founder: { min: 66, max: 78 } },
    B3_SALES_PRESSURE_SEED: { cash: { max: 35 }, founder: { min: 45 } },
    PRESS_FRIDGE: { cash: { max: 25 } },
    PRESS_MOM: { cash: { max: 20 } },
    PRESS_FONT: { cash: { max: 35 } },
    PRESS_FIGHT: { founder: { min: 55 } },
    PRESS_RIVAL: { founder: { max: 70 } },
  });
  Object.keys(ranged).forEach((id) => {
    const card = engine.cardById(deck, id);
    assert.ok(card.continuation === 'ambient' || card.continuation === 'sideStory' || card.scheduler,
      `${id} lacks an ambient, side-story or scheduler gate`);
  });
});

test('both pre-match refusals truly leave padel for the agents route', () => {
  ['PADEL_01', 'PADEL_02'].forEach((id) => {
    const refusal = engine.cardById(deck, id).choices.right;
    assert.equal(refusal.switchArc, 'agents', `${id} does not switch arc`);
    assert.equal(refusal.next, 'AGENT_01', `${id} does not route to agents`);
  });
});

test('keeps sales inside the agent arc and gates conditional pressure cards', () => {
  const pressure = deck.cards.filter((card) => card.kind === 'pressure');
  assert.equal(pressure.length, 6);
  assert.equal(pressure.some((card) => card.id === 'PRESS_SALES'), false);
  assert.equal(engine.cardById(deck, 'PRESS_CAPITALISM'), null, 'PRESS_CAPITALISM was promoted into the AGENT_03B_WILD beat');
  const family = engine.cardById(deck, 'PRESS_FAMILY');
  assert.ok(flagsFrom(family.trigger.all).includes('agents_public'));
});

test('pressure jokes establish their own premise before asking for a decision', () => {
  assert.match(engine.cardById(deck, 'PRESS_FRIDGE').text, /except raw carrots/i);
  assert.match(engine.cardById(deck, 'PRESS_FRIDGE').text, /first paid invoice/i);
  assert.equal(engine.cardById(deck, 'PRESS_FRIDGE').choices.left.label, 'Break the lock');
  const mom = engine.cardById(deck, 'PRESS_MOM').text;
  assert.match(mom, /your investor/i);
  assert.match(mom, /diarrhea/i);
  assert.match(mom, /your little company \$10k/i);
  assert.match(mom, /never call him again/i);
  assert.doesNotMatch(mom, /B2BuyerSpyer|@unicorn_hunter/);
  const font = engine.cardById(deck, 'PRESS_FONT').text;
  assert.match(font, /perfect font/i);
  assert.match(font, /\$4,500/i);
  assert.match(font, /more than our servers/i);
  assert.match(font, /before we waste.*salaries/i);
  assert.doesNotMatch(font, /looks like we pay salaries|bankruptcy look premium/i);
  assert.match(engine.cardById(deck, 'PRESS_FIGHT').text, /college rival/i);
  assert.match(engine.cardById(deck, 'PRESS_RIVAL').text, /first paying customer/i);
  assert.equal(engine.cardById(deck, 'PRESS_RIVAL').choices.left.label, 'Ask for an intro');
  assert.ok(engine.cardById(deck, 'PRESS_RIVAL').choices.left.effects.customers > 0);
  assert.ok(engine.cardById(deck, 'PRESS_RIVAL').choices.left.effects.founder < 0);
  assert.equal(engine.cardById(deck, 'PRESS_RIVAL').choices.right.label, 'Mute him');
  assert.ok(engine.cardById(deck, 'PRESS_RIVAL').choices.right.effects.founder > 0);
});

test('does not keep dead story flags', () => {
  const setFlags = new Set();
  const consumedFlags = new Set();
  deck.cards.forEach((card) => {
    flagsFrom(card.requires).forEach((flag) => consumedFlags.add(flag));
    flagsFrom(card.excludes).forEach((flag) => consumedFlags.add(flag));
    flagsFrom(card.trigger && card.trigger.all).forEach((flag) => consumedFlags.add(flag));
    flagsFrom(card.trigger && card.trigger.any).forEach((flag) => consumedFlags.add(flag));
    flagsFrom(card.trigger && card.trigger.none).forEach((flag) => consumedFlags.add(flag));
    flagsFrom(card.stateEffects).forEach((effect) => {
      flagsFrom(effect.requires).forEach((flag) => consumedFlags.add(flag));
      flagsFrom(effect.excludes).forEach((flag) => consumedFlags.add(flag));
    });
    ['left', 'right'].forEach((side) => {
      flagsFrom(card.choices[side].setFlags).forEach((flag) => setFlags.add(flag));
      flagsFrom(card.choices[side].conditional).forEach((condition) => flagsFrom(condition.when).forEach((flag) => consumedFlags.add(flag)));
    });
  });
  Object.values(deck.endings).forEach((ending) => flagsFrom(ending.readsFlags).forEach((flag) => consumedFlags.add(flag)));
  assert.deepEqual([...setFlags].filter((flag) => !consumedFlags.has(flag)), []);
});

test('important callbacks return two to five decisions after their cause', () => {
  const delayedChoices = deck.cards.flatMap((card) => ['left', 'right'].map((side) => card.choices[side])).filter((choice) => choice.delay);
  assert.ok(delayedChoices.length >= 1);
  delayedChoices.forEach((choice) => {
    const distance = choice.delay.storyDecisions == null ? choice.delay.turns : choice.delay.storyDecisions;
    assert.ok(distance >= 2 && distance <= 5);
  });
});

test('provides all eight resource-edge crises and no unreachable endings', () => {
  ['cash', 'team', 'customers', 'founder'].forEach((resource) => ['low', 'high'].forEach((edge) => {
    const id = `${resource}_${edge}`;
    assert.ok(deck.crises[id], `Missing crisis ${id}`);
    assert.ok(deck.endings[id], `Missing ending ${id}`);
  }));
  const referenced = new Set(['validation', 'no_proof', ...Object.keys(deck.crises)]);
  deck.cards.forEach((card) => ['left', 'right'].forEach((side) => {
    if (card.choices[side].ending) referenced.add(card.choices[side].ending);
  }));
  assert.deepEqual(Object.keys(deck.endings).filter((ending) => !referenced.has(ending)), []);
});
