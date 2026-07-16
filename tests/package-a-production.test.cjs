const test = require('node:test');
const assert = require('node:assert/strict');
const deck = require('../cards.json');
const engine = require('../game.js');

const IDS = {
  payrollSeed: 'PAYROLL_RESTRICTED_AI_SEED',
  payrollCallback: 'PAYROLL_RESTRICTED_AI_CALLBACK',
  devSeed: 'DEV_HOSTAGE_SEED',
  devCallback: 'DEV_HOSTAGE_CALLBACK',
  momSeed: 'MOM_INVESTOR_SEED',
  momCallback: 'MOM_INVESTOR_CALLBACK',
  comaSeed: 'COMA_SEED',
  comaAuthorized: 'COMA_CALLBACK_AUTHORIZED',
  comaBlocked: 'COMA_CALLBACK_BLOCKED',
  flyers: 'MOM_FLYERS',
};

const PACKAGE_A_IDS = new Set(Object.values(IDS));
const B3_IDS = new Set(['B3_SALES_PRESSURE_SEED', 'B3_PAID_OPTOUT_CALLBACK']);

function card(id) {
  const result = engine.cardById(deck, id);
  assert.ok(result, `Missing production card ${id}`);
  return result;
}

function stateAt(id, { activeArc = null, flags = [], resources = {} } = {}) {
  const state = engine.startRun(deck);
  state.currentCardId = id;
  state.activeArc = activeArc;
  state.flags = [...flags];
  Object.assign(state.resources, resources);
  Object.assign(state.schedulerResources, resources);
  return state;
}

function resolveAt(id, side, options = {}) {
  return engine.resolveChoice(deck, stateAt(id, options), side, { rng: () => 0 }).state;
}

function effectDifference(actual, baseline) {
  return Object.fromEntries(engine.RESOURCE_KEYS.map((key) => [key, actual[key] - baseline[key]]));
}

function bitsFor(index) {
  return index.toString(2).padStart(5, '0').split('').map((bit) => bit === '1' ? 'right' : 'left');
}

function playOpening(index, rngValue = 0) {
  const bits = bitsFor(index);
  const events = [];
  let openingStep = 0;
  let state = engine.startRun(deck);
  for (let safety = 0; safety < 20 && state.currentCardId !== 'AGENT_01'; safety += 1) {
    const id = state.currentCardId;
    let side = 'left';
    if (['OPEN_01', 'OPEN_02', 'OPEN_03_AUDIT', 'OPEN_03_INVOICES', 'OPEN_04', 'OPEN_05'].includes(id)) {
      side = bits[openingStep] || 'left';
      openingStep += 1;
    } else if (id === 'OPEN_06') {
      side = 'left';
    }
    state = engine.resolveChoice(deck, state, side, {
      rng: () => rngValue,
      onSchedulerBoundary: (event) => events.push({
        boundaryId: event.boundary.id,
        cardIds: event.pool.map((entry) => entry.cardId),
      }),
    }).state;
    if (state.gameOver || state.activeCrisisId) break;
  }
  return { bits, events, state, history: state.history.map((entry) => entry.cardId) };
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

test('Package A contains exactly the ten author-approved messages and button pairs', () => {
  const approved = {
    [IDS.payrollSeed]: ['I BOUGHT AI CREDITS.\nYOUR TEAM CAN WORK FOR THE SUBSCRIPTION.\nNO REVENUE, NO PAYROLL.', 'Accept credits', 'Demand payroll'],
    [IDS.payrollCallback]: ['the ai has everything\npayroll has nothing\npay us or i shut everything down right now', 'Promise payroll', 'Pay out of pocket'],
    [IDS.devSeed]: ['investor says he\'ll replace me with ai\ncool. call him an idiot in public\nor lie and say he apologized', 'Call him an idiot', 'Fake investor\'s apology'],
    [IDS.devCallback]: ['updates are back\nwrite down who has access\nor schedule my 3am call now', 'Write the rules', 'Book the call'],
    [IDS.momSeed]: ['That investor keeps calling about money.\nYou don\'t eat. You don\'t sleep.\nGive me his number.', 'Let Mom call', 'I\'m fine, Mom'],
    [IDS.momCallback]: ['YOUR MOTHER CALLED ME ABOUT YOUR SLEEP.\nWHAT THE HELL? I DIDN\'T FUND A BEDTIME.\nGET BACK TO WORK.', 'Take the break', 'Keep working'],
    [IDS.comaSeed]: ['okay hear me out\nwe say you worked yourself into a coma\ntragic founder lore. people will eat this up 😭', 'Approve the post', 'Kill the story'],
    [IDS.comaAuthorized]: ['oh my god they believed the coma 😭\npeople are asking what we built\ndo not wake up online yet', 'Keep the post', 'Delete the post'],
    [IDS.comaBlocked]: ['fine. no coma post\nyou still look like shit though\ntake a rest. this one isn\'t content', 'Take rest', 'Keep working'],
    [IDS.flyers]: ['I put up flyers.\nB2BuyerSpyer and your phone number are on them.\nThey say you need help. Don\'t be mad.', 'Take them down', 'Leave them up'],
  };
  assert.equal(Object.keys(approved).length, 10);
  Object.entries(approved).forEach(([id, [text, left, right]]) => {
    const current = card(id);
    assert.equal(current.text, text, `${id} copy changed`);
    assert.equal(current.choices.left.label, left, `${id} left button changed`);
    assert.equal(current.choices.right.label, right, `${id} right button changed`);
  });
});

test('health module keeps named slots; migrated startup modules use typed delayed callbacks', () => {
  const health = {
    [IDS.momSeed]: ['seed', 'opening_shared_seed', 2],
    [IDS.momCallback]: ['callback', 'opening_health_resolution', 1],
    [IDS.comaSeed]: ['seed', 'opening_shared_seed', 1],
    [IDS.comaAuthorized]: ['callback', 'opening_health_resolution', 1],
    [IDS.comaBlocked]: ['callback', 'opening_health_resolution', 1],
    [IDS.flyers]: ['reaction', 'opening_health_resolution', 1],
  };
  Object.entries(health).forEach(([id, [role, slot, weight]]) => {
    const current = card(id);
    assert.equal(current.scheduler.role, role, id);
    assert.equal(current.scheduler.slot, slot, id);
    assert.equal(Number(current.weight || 1), weight, id);
    assert.equal(current.oncePerRun, true, id);
  });
  // Migrated startup modules (payroll/dev): no scheduler metadata; typed delayed callbacks.
  [[IDS.payrollSeed, IDS.payrollCallback], [IDS.devSeed, IDS.devCallback]].forEach(([seed, cb]) => {
    assert.equal(card(seed).scheduler, undefined, `${seed} dropped scheduler metadata`);
    assert.equal(card(cb).scheduler, undefined, `${cb} dropped scheduler metadata`);
    assert.equal(card(cb).callbackOnly, true, `${cb} is a typed callbackOnly callback`);
    assert.equal(card(seed).oncePerRun, true, seed);
    ['left', 'right'].forEach((side) => assert.equal(card(seed).choices[side].delay.card, cb, `${seed} ${side} schedules ${cb}`));
  });
  assert.deepEqual(card(IDS.payrollSeed).resourceRange, {
    cash: { max: 30 }, founder: { min: 45 },
  });
  assert.deepEqual(card(IDS.devSeed).resourceRange, {
    cash: { max: 30 }, founder: { min: 45 },
  });
  assert.deepEqual(card(IDS.flyers).resourceRange, { founder: { min: 66, max: 78 } });
});

test('the 32 real opening traces reproduce the approved health eligibility matrix', () => {
  // The startup seeds (payroll/dev/b3) now fire from the Agents pool, not from an
  // opening boundary, so the opening traces only exercise the health module.
  const traces = Array.from({ length: 32 }, (_, index) => playOpening(index));
  const health = traces.map((trace) => trace.events.find((event) => event.boundaryId === 'opening_shared_seed')?.cardIds || []);
  const count = (collections, id) => collections.filter((items) => items.includes(id)).length;
  assert.equal(count(health, IDS.momSeed), 16);
  assert.equal(count(health, IDS.comaSeed), 16);
});

test('health callbacks have priority, Flyers is fallback-only, and the two health stories are mutually exclusive', () => {
  const healthState = stateAt('OPEN_05', {
    flags: ['opening_overload_exposed'], resources: { founder: 62 },
  });
  assert.deepEqual(engine.buildBoundaryPool(deck, healthState, 'opening_shared_seed').map((entry) => entry.card.id), [IDS.momSeed, IDS.comaSeed]);
  healthState.flags.push('health_control_story');
  assert.deepEqual(engine.buildBoundaryPool(deck, healthState, 'opening_shared_seed'), []);

  const callbackState = stateAt('OPEN_06', {
    flags: ['health_control_story', 'health_control_story_mom_investor', 'control_seed_mom'], resources: { founder: 70 },
  });
  callbackState.reservations = [{
    callbackId: IDS.momCallback, callbackSlot: 'opening_health_resolution', remainingSpineSteps: 0, moduleId: 'mom_investor',
  }];
  assert.deepEqual(engine.buildBoundaryPool(deck, callbackState, 'opening_health_resolution').map((entry) => entry.card.id), [IDS.momCallback]);
  callbackState.reservations = [];
  assert.deepEqual(engine.buildBoundaryPool(deck, callbackState, 'opening_health_resolution'), []);

  const flyersState = stateAt('OPEN_06', { resources: { founder: 70 } });
  assert.deepEqual(engine.buildBoundaryPool(deck, flyersState, 'opening_health_resolution').map((entry) => entry.card.id), [IDS.flyers]);
});

test('Restricted AI Payroll never creates Cash or Customers and both saved values reach their readers', () => {
  const seed = card(IDS.payrollSeed);
  ['left', 'right'].forEach((side) => {
    assert.equal(Number(seed.choices[side].effects.cash || 0), 0);
    assert.equal(Number(seed.choices[side].effects.customers || 0), 0);
  });
  const baselineAgent = resolveAt('AGENT_01', 'left', { activeArc: 'agents' });
  const creditedAgent = resolveAt('AGENT_01', 'left', { activeArc: 'agents', flags: ['payroll_offer_compute_only'] });
  assert.equal(creditedAgent.history[0].deltas.cash - baselineAgent.history[0].deltas.cash, 1);

  const cases = [
    [['payroll_offer_compute_only', 'payroll_priority_machines', 'cloud_credits_resolved'], { team: -2, founder: 0 }],
    [['payroll_offer_ordinary_compute', 'payroll_priority_machines', 'cloud_credits_resolved'], { team: -2, founder: 0 }],
    [['payroll_offer_compute_only', 'payroll_priority_people', 'cloud_credits_resolved'], { team: 2, founder: -1 }],
    [['payroll_offer_ordinary_compute', 'payroll_priority_people', 'cloud_credits_resolved'], { team: 2, founder: -1 }],
  ];
  const baseLead = resolveAt('AGENT_04_LEAD', 'left', { activeArc: 'agents' }).history[0].deltas;
  cases.forEach(([flags, expected]) => {
    const actual = resolveAt('AGENT_04_LEAD', 'left', { activeArc: 'agents', flags }).history[0].deltas;
    const extra = effectDifference(actual, baseLead);
    assert.equal(extra.team, expected.team, flags.join(','));
    assert.equal(extra.founder, expected.founder, flags.join(','));
  });
});

test('both Dev Hostage decisions survive its callback and produce all four Lead consequences', () => {
  const seed = card(IDS.devSeed);
  assert.equal(Number(seed.choices.left.effects.cash || 0), 0);
  assert.equal(Number(seed.choices.right.effects.customers || 0), 0);
  assert.match(seed.text, /replace me with ai/);
  assert.doesNotMatch(`${seed.text} ${seed.actor_action}`, /quit|stole|steal|disappear/i);

  const cases = [
    [['dev_conflict_public', 'dev_access_protected', 'dev_updates_restored'], { team: 2, founder: 0 }],
    [['dev_conflict_public', 'dev_access_contested', 'dev_updates_restored'], { team: -1, founder: -1 }],
    [['dev_conflict_bypassed', 'dev_access_protected', 'dev_updates_restored'], { team: 0, founder: -2 }],
    [['dev_conflict_bypassed', 'dev_access_contested', 'dev_updates_restored'], { team: -4, founder: 1 }],
  ];
  const baseline = resolveAt('AGENT_04_LEAD', 'right', { activeArc: 'agents' }).history[0].deltas;
  cases.forEach(([flags, expected]) => {
    const actual = resolveAt('AGENT_04_LEAD', 'right', { activeArc: 'agents', flags }).history[0].deltas;
    const extra = effectDifference(actual, baseline);
    assert.equal(extra.team, expected.team, flags.join(','));
    assert.equal(extra.founder, expected.founder, flags.join(','));
  });
});

test('Fake Founder Coma reserves one branch-specific callback and all four outcomes reach OPEN_06', () => {
  const seed = card(IDS.comaSeed);
  assert.equal(seed.choices.left.reserveCallback.callbackId, IDS.comaAuthorized);
  assert.equal(seed.choices.right.reserveCallback.callbackId, IDS.comaBlocked);
  assert.equal(Number(seed.choices.left.effects.customers || 0), 0);
  assert.equal(Number(seed.choices.right.effects.customers || 0), 0);
  assert.equal(card(IDS.comaAuthorized).choices.left.effects.customers, 2);
  assert.equal(Number(card(IDS.comaBlocked).choices.left.effects.customers || 0), 0);

  const cases = [
    [['coma_campaign_authorized', 'coma_callback_public'], { team: -3, founder: -4 }],
    [['coma_campaign_authorized', 'coma_callback_retracted'], { team: -1, founder: -2 }],
    [['coma_campaign_blocked', 'coma_callback_rest'], { team: 2, founder: -3 }],
    [['coma_campaign_blocked', 'coma_callback_denied'], { team: -2, founder: -3 }],
  ];
  const baseline = resolveAt('OPEN_06', 'left').history[0].deltas;
  cases.forEach(([flags, expected]) => {
    const actual = resolveAt('OPEN_06', 'left', { flags }).history[0].deltas;
    const extra = effectDifference(actual, baseline);
    assert.equal(extra.team, expected.team, flags.join(','));
    assert.equal(extra.founder, expected.founder, flags.join(','));
  });
});

test('Mom vs Investor and Mom Flyers retain their decisions until OPEN_06', () => {
  const momCases = [
    [['control_seed_mom', 'route_control_mom_boundary', 'mom_investor_clash_resolved'], { team: 3, founder: -4 }],
    [['control_seed_mom', 'route_control_investor_directive', 'mom_investor_clash_resolved'], { team: -1, founder: -1 }],
    [['control_seed_investor', 'route_control_mom_boundary', 'mom_investor_clash_resolved'], { team: 1, founder: -4 }],
    [['control_seed_investor', 'route_control_investor_directive', 'mom_investor_clash_resolved'], { team: -3, founder: 3 }],
    [['mom_flyers_removed'], { team: 0, founder: 1 }],
    [['mom_flyers_public'], { team: -1, founder: -3 }],
  ];
  const baseline = resolveAt('OPEN_06', 'right').history[0].deltas;
  momCases.forEach(([flags, expected]) => {
    const actual = resolveAt('OPEN_06', 'right', { flags }).history[0].deltas;
    const extra = effectDifference(actual, baseline);
    assert.equal(extra.team, expected.team, flags.join(','));
    assert.equal(extra.founder, expected.founder, flags.join(','));
  });
  ['left', 'right'].forEach((side) => {
    assert.equal(Number(card(IDS.flyers).choices[side].effects.cash || 0), 0);
    assert.equal(Number(card(IDS.flyers).choices[side].effects.customers || 0), 0);
  });
});

test('deterministic traces cover every Package A branch pair through its existing reader', () => {
  // Migrated startup modules: each seed branch schedules the typed callback and
  // sets its branch flag + shared seed flag; each callback branch sets its reader flag.
  const agentModules = [
    [IDS.payrollSeed, IDS.payrollCallback, ['payroll_offer_compute_only', 'payroll_offer_ordinary_compute'], ['payroll_priority_machines', 'payroll_priority_people'], 'payroll_seeded'],
    [IDS.devSeed, IDS.devCallback, ['dev_conflict_public', 'dev_conflict_bypassed'], ['dev_access_protected', 'dev_access_contested'], 'dev_hostage_seeded'],
  ];
  agentModules.forEach(([seedId, callbackId, seedFlags, callbackFlags, seededFlag]) => {
    ['left', 'right'].forEach((seedSide, seedIndex) => {
      let state = stateAt(seedId, { activeArc: 'agents', flags: ['payroll_unresolved', 'dev_payroll_risk_visible'] });
      state.queuedCardId = 'AGENT_01';
      state.queuedCardIds = ['AGENT_01'];
      state.queuedPool = true;
      state = engine.resolveChoice(deck, state, seedSide, { rng: () => 0 }).state;
      assert.ok(state.flags.includes(seedFlags[seedIndex]), `${seedId} ${seedSide}`);
      assert.ok(state.flags.includes(seededFlag), `${seedId} sets shared seed flag`);
      assert.ok(state.delayed.some((entry) => entry.card === callbackId), `${seedId} schedules ${callbackId}`);
    });
    ['left', 'right'].forEach((callbackSide, callbackIndex) => {
      const state = stateAt(callbackId, { activeArc: 'agents', flags: [seededFlag] });
      const after = engine.resolveChoice(deck, state, callbackSide, { rng: () => 0 }).state;
      assert.ok(after.flags.includes(callbackFlags[callbackIndex]), `${callbackId} ${callbackSide}`);
    });
  });

  ['left', 'right'].forEach((seedSide, seedIndex) => ['left', 'right'].forEach((callbackSide, callbackIndex) => {
    let state = stateAt(IDS.momSeed);
    state.queuedCardId = 'OPEN_05';
    state.queuedCardIds = ['OPEN_05'];
    state.queuedBoundary = { id: 'opening_shared_seed', before: 'OPEN_04', after: 'OPEN_05' };
    state = engine.resolveChoice(deck, state, seedSide, { rng: () => 0 }).state;
    state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
    assert.equal(state.currentCardId, IDS.momCallback);
    state = engine.resolveChoice(deck, state, callbackSide, { rng: () => 0 }).state;
    state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
    assert.ok(state.flags.includes(['control_seed_mom', 'control_seed_investor'][seedIndex]));
    assert.ok(state.flags.includes(['route_control_mom_boundary', 'route_control_investor_directive'][callbackIndex]));
    assert.deepEqual(state.history.map((entry) => entry.cardId), [IDS.momSeed, 'OPEN_05', IDS.momCallback, 'OPEN_06']);
  }));

  [
    ['left', IDS.comaAuthorized, ['coma_callback_public', 'coma_callback_retracted']],
    ['right', IDS.comaBlocked, ['coma_callback_rest', 'coma_callback_denied']],
  ].forEach(([seedSide, callbackId, callbackFlags]) => ['left', 'right'].forEach((callbackSide, callbackIndex) => {
    let state = stateAt(IDS.comaSeed);
    state.queuedCardId = 'OPEN_05';
    state.queuedCardIds = ['OPEN_05'];
    state.queuedBoundary = { id: 'opening_shared_seed', before: 'OPEN_04', after: 'OPEN_05' };
    state = engine.resolveChoice(deck, state, seedSide, { rng: () => 0 }).state;
    state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
    assert.equal(state.currentCardId, callbackId);
    state = engine.resolveChoice(deck, state, callbackSide, { rng: () => 0 }).state;
    state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
    assert.ok(state.flags.includes(callbackFlags[callbackIndex]));
    assert.deepEqual(state.history.map((entry) => entry.cardId), [IDS.comaSeed, 'OPEN_05', callbackId, 'OPEN_06']);
  }));

  ['left', 'right'].forEach((side, index) => {
    let state = stateAt(IDS.flyers);
    state.queuedCardId = 'OPEN_06';
    state.queuedCardIds = ['OPEN_06'];
    state.queuedBoundary = { id: 'opening_health_resolution', before: 'OPEN_05', after: 'OPEN_06' };
    state = engine.resolveChoice(deck, state, side, { rng: () => 0 }).state;
    state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
    assert.ok(state.flags.includes(['mom_flyers_removed', 'mom_flyers_public'][index]));
    assert.deepEqual(state.history.map((entry) => entry.cardId), [IDS.flyers, 'OPEN_06']);
  });
});

// Phase 3 Batch 1 side-stories. Each payoff is branch-specific: only the listed
// side sets the flag and schedules the delay, so only that side owes a callback.
const NEW_PAIRS = [
  ['AMBIENT_DOMAIN_RANSOM', 'right', 'AMBIENT_DOMAIN_LAWSUIT'],
  ['AMBIENT_PROMO_XXX', 'left', 'AMBIENT_PROMO_XXX_INVESTOR'],
  ['AMBIENT_MOM_POLICE', 'right', 'AMBIENT_MOM_FAMILY'],
];

test('10,000 production runs lose no continuing callback and preserve every protected lock', () => {
  const packageCounts = [];
  const nonLegacyCounts = [];
  const frequency = Object.fromEntries([...PACKAGE_A_IDS].map((id) => [id, 0]));
  let directAgents = 0;
  let zeroPackageA = 0;
  let callbackLoss = 0;
  // Per pair, never aggregated: one pair going unreachable must not hide behind
  // the other two. `leaked` is a real engine fault; `preempted` is the run ending
  // before the payoff could ever land, which no gating can prevent.
  const pairStats = Object.fromEntries(NEW_PAIRS.map(([seedId]) => [seedId, {
    scheduled: 0, late: 0, leaked: 0, preempted: 0,
  }]));
  // Anti-dilution guard: Batch 1 must not crowd the pre-existing side stories out
  // of the ambient pool. Rates are measured over direct-Agents runs only.
  const legacyRate = { [IDS.payrollSeed]: 0, [IDS.devSeed]: 0, B3_SALES_PRESSURE_SEED: 0 };
  let protectedPairViolations = 0;
  let postPadelInsertions = 0;
  let mutexViolations = 0;
  for (let seed = 1; seed <= 10000; seed += 1) {
    const rng = seeded(seed);
    let state = engine.startRun(deck, { seed });
    for (let safety = 0; !state.gameOver && safety < 60; safety += 1) {
      state = state.activeCrisisId
        ? engine.resolveCrisis(deck, state, 'rescue', { rng }).state
        : engine.resolveChoice(deck, state, rng() < 0.5 ? 'left' : 'right', { rng }).state;
    }
    assert.equal(state.gameOver, true, `seed ${seed}`);
    const ids = state.history.map((entry) => entry.cardId);
    PACKAGE_A_IDS.forEach((id) => { if (ids.includes(id)) frequency[id] += 1; });
    const packageCount = ids.filter((id) => PACKAGE_A_IDS.has(id)).length;
    const b3Count = ids.filter((id) => B3_IDS.has(id)).length;
    const open06 = state.history.find((entry) => entry.cardId === 'OPEN_06');
    if (open06?.side === 'left') {
      directAgents += 1;
      packageCounts.push(packageCount);
      nonLegacyCounts.push(packageCount + b3Count);
      if (packageCount === 0) zeroPackageA += 1;
      Object.keys(legacyRate).forEach((id) => { if (ids.includes(id)) legacyRate[id] += 1; });
    }
    [[IDS.momSeed, IDS.momCallback], [IDS.comaSeed, null], [IDS.payrollSeed, IDS.payrollCallback], [IDS.devSeed, IDS.devCallback]].forEach(([seedId, callbackId]) => {
      if (!ids.includes(seedId)) return;
      const expected = callbackId ? ids.includes(callbackId) : ids.includes(IDS.comaAuthorized) || ids.includes(IDS.comaBlocked);
      const reachedReader = ids.includes(seedId === IDS.payrollSeed || seedId === IDS.devSeed ? 'AGENT_04_LEAD' : 'OPEN_06');
      if (reachedReader && !expected) callbackLoss += 1;
    });
    NEW_PAIRS.forEach(([seedId, delaySide, callbackId]) => {
      const seedIndex = ids.indexOf(seedId);
      if (seedIndex < 0) return;
      const stat = pairStats[seedId];
      // A seed drawn past the protected spine can never pay off: only the ending
      // remains, and finishOutcome clears state.delayed.
      const leadIndex = ids.indexOf('AGENT_04_LEAD');
      if (leadIndex >= 0 && seedIndex > leadIndex) stat.late += 1;
      if (state.history[seedIndex].side !== delaySide) return;
      stat.scheduled += 1;
      if (ids.includes(callbackId)) return;
      // advanceStoryDelays only ticks on story beats, and a due payoff can only be
      // delivered on a later decision. So the payoff had a slot iff three story
      // beats passed AND the run resolved at least one more card after that.
      let beats = 0;
      let dueIndex = -1;
      for (let i = seedIndex + 1; i < ids.length; i += 1) {
        if (engine.cardById(deck, ids[i]).kind === 'story') beats += 1;
        if (beats >= 3) { dueIndex = i; break; }
      }
      if (dueIndex >= 0 && ids.length > dueIndex + 1) stat.leaked += 1;
      else stat.preempted += 1;
    });
    const lead = ids.indexOf('AGENT_04_LEAD');
    const protectedSpine = ['AGENT_04_LEAD', 'AGENT_05_ORDER', 'AGENT_06_LEGAL'];
    const observedSpine = lead >= 0 ? ids.slice(lead, lead + protectedSpine.length) : [];
    if (lead >= 0 && observedSpine.some((id, index) => id !== protectedSpine[index])) protectedPairViolations += 1;
    const padel = ids.indexOf('PADEL_01');
    const acceptedPadel = state.history.find((entry) => entry.cardId === 'PADEL_01')?.side === 'left'
      && !ids.includes('AGENT_01');
    if (acceptedPadel && padel >= 0 && ids.slice(padel + 1).some((id) => {
      const current = engine.cardById(deck, id);
      return current && ['pressure', 'sideStory'].includes(current.kind);
    })) postPadelInsertions += 1;
    if ((ids.includes(IDS.momSeed) && ids.includes(IDS.comaSeed))
      || (ids.includes(IDS.flyers) && (ids.includes(IDS.momSeed) || ids.includes(IDS.comaSeed)))) mutexViolations += 1;
  }
  assert.ok(directAgents > 0);
  // Phase 3 Batch 1 payoffs, asserted per pair. No percentage bound: a loose
  // threshold would license a future engine leak, and terminal preemption is a
  // separate, legitimate outcome rather than an allowance to spend.
  NEW_PAIRS.forEach(([seedId]) => {
    const stat = pairStats[seedId];
    assert.ok(stat.scheduled > 0, `${seedId} never scheduled its payoff — the pair is unreachable`);
    assert.equal(stat.late, 0, `${seedId} was drawn past AGENT_04_LEAD, where its payoff can never be delivered`);
    assert.equal(stat.leaked, 0, `${seedId} lost a payoff in a run that kept playing — that is an engine leak, not an ending`);
  });
  // New pool-weighted model: calmer than the old guaranteed boundary insertion,
  // but every direct-Agents run still gets at least one side story (measured
  // zero-rate 0), median 2.
  assert.equal(zeroPackageA, 0, 'every direct-Agents run should still get at least one Package A side story');
  assert.ok(median(nonLegacyCounts) >= 2, `side-story richness dropped below the calmer floor: ${median(nonLegacyCounts)}`);
  assert.equal(callbackLoss, 0);
  assert.equal(protectedPairViolations, 0);
  assert.equal(postPadelInsertions, 0);
  assert.equal(mutexViolations, 0);
  Object.entries(frequency).forEach(([id, count]) => assert.ok(count > 0, `${id} never appeared`));
  // ACCEPTED REGRESSION, not the baseline. Over direct-Agents runs the pre-Batch-1
  // rates were payroll 38.71%, dev 38.07%, b3 19.33%; Batch 1 leaves them at roughly
  // 32.2/32.7/16.7, i.e. ~13-17% relative dilution. That is arithmetic, not a bug:
  // a run offers ~5.8 ambient slots and Batch 1 grew the pool competing for them from
  // ~13 cards to ~22. The author accepted it (16 Jul 2026) because the Phase 4 pivot
  // shrinks the story rail and frees slots, which is the real fix; squeezing the new
  // cards back to invisibility would only trade one loss for another.
  // These floors therefore hold the line against FURTHER dilution — they do not
  // encode the baseline. Restore them toward the numbers above in Phase 4.
  const legacyFloor = { [IDS.payrollSeed]: 0.31, [IDS.devSeed]: 0.31, B3_SALES_PRESSURE_SEED: 0.16 };
  Object.entries(legacyFloor).forEach(([id, floor]) => {
    const rate = legacyRate[id] / directAgents;
    assert.ok(rate >= floor, `${id} was diluted out of the ambient pool: ${(100 * rate).toFixed(1)}% < ${100 * floor}%`);
  });
  if (process.env.PACKAGE_A_PRODUCTION_REPORT === '1') {
    process.stdout.write(`${JSON.stringify({ runs: 10000, directAgents, zeroPackageARate: zeroPackageA / directAgents, medians: { packageA: median(packageCounts), nonLegacy: median(nonLegacyCounts) }, frequency })}\n`);
  }
});
