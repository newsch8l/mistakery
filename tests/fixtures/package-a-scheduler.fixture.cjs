const canonicalDeck = require('../../cards.json');

const RESOURCE_KEYS = ['cash', 'team', 'customers', 'founder'];

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function effects(extra = {}) {
  return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, Number(extra[key] || 0)]));
}

function choice(label, next, extra = {}) {
  return {
    label,
    effects: effects(extra.effects),
    effect_reason: Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 'Fixture effect.'])),
    ...(next ? { next } : {}),
    ...extra,
  };
}

function card(id, kind, next, extra = {}) {
  const fixtureEffects = kind === 'sideStory' ? { cash: 1 } : {};
  return {
    id,
    kind,
    source: '@fixture',
    text: id,
    actor_action: 'Fixture scheduler action.',
    player_decision: 'Fixture scheduler decision.',
    choices: {
      left: choice('Left', next, { effects: fixtureEffects, ...(extra.left || {}) }),
      right: choice('Right', next, { effects: fixtureEffects, ...(extra.right || {}) }),
    },
    ...extra.card,
  };
}

function canonicalOpeningCards() {
  const ids = new Set(['OPEN_01', 'OPEN_02', 'OPEN_03_AUDIT', 'OPEN_03_INVOICES', 'OPEN_04', 'OPEN_05', 'OPEN_06']);
  const cards = canonicalDeck.cards.filter((item) => ids.has(item.id)).map(clone);
  const byId = new Map(cards.map((item) => [item.id, item]));
  // Fixture-only flags: they are consequences of the actual canonical choices,
  // not labels assigned from a trace index. Production cards remain untouched.
  ['left', 'right'].forEach((side) => {
    byId.get('OPEN_04').choices[side].setFlags = ['opening_overload_exposed'];
  });
  byId.get('OPEN_01').choices.right.setFlags = ['b3_fixture_founder_segment'];
  byId.get('OPEN_02').choices.right.setFlags = ['sales_outreach_started'];
  byId.get('OPEN_05').choices.right.setFlags = ['payroll_unresolved', 'dev_payroll_risk_visible'];
  byId.get('OPEN_05').schedulerSpineStep = true;
  return cards;
}

function createFixtureDeck() {
  return {
    meta: {
      startCard: 'OPEN_01', maxTurns: 40, baseCashBurn: -1,
      scheduler: {
        boundaries: [
          { id: 'opening_shared_seed', before: 'OPEN_04', after: 'OPEN_05', roles: ['seed'] },
          { id: 'opening_health_resolution', before: 'OPEN_05', after: 'OPEN_06', roles: ['callback', 'reaction'] },
          { id: 'agents_entry_seed', before: 'OPEN_06', after: 'AGENT_01', roles: ['seed'] },
          { id: 'agents_entry_seed', before: 'PADEL_01', after: 'AGENT_01', roles: ['seed'] },
          { id: 'agents_pre_serious_lead', before: 'AGENT_03_HYPE', after: 'AGENT_04_LEAD', roles: ['callback'] },
        ],
        protectedPairs: [
          ['AGENT_04_LEAD', 'AGENT_05_ORDER'],
          ['AGENT_05_ORDER', 'AGENT_06_LEGAL'],
        ],
        locks: [{ lockCardId: 'PADEL_01', arc: 'padel', forbidVariableSlots: true }],
      },
    },
    resources: {
      // Keeps canonical OPEN_01–OPEN_05 effects intact while producing the
      // approved fixture ranges at their real scheduler boundaries.
      cash: { label: 'Cash', initial: 21, min: 0, max: 100 },
      team: { label: 'Team', initial: 61, min: 0, max: 100 },
      customers: { label: 'Customers', initial: 15, min: 0, max: 100 },
      founder: { label: 'Founder', initial: 65, min: 0, max: 100 },
    },
    sources: { ...clone(canonicalDeck.sources), '@fixture': { name: '@fixture', role: 'Fixture' } },
    cards: [
      ...canonicalOpeningCards(),
      card('AGENT_01', 'story', 'AGENT_02_DEV', { card: { arc: 'agents' } }),
      card('AGENT_02_DEV', 'story', 'AGENT_03_HYPE', { card: { arc: 'agents' } }),
      card('AGENT_03_HYPE', 'story', 'AGENT_04_LEAD', { card: { arc: 'agents' } }),
      card('AGENT_04_LEAD', 'story', 'AGENT_05_ORDER', { card: { arc: 'agents' } }),
      card('AGENT_05_ORDER', 'story', 'AGENT_06_LEGAL', { card: { arc: 'agents' } }),
      card('AGENT_06_LEGAL', 'story', 'AGENT_07_END', { card: { arc: 'agents' } }),
      card('AGENT_07_END', 'story', null, { left: { ending: 'fixture_end' }, right: { ending: 'fixture_end' }, card: { arc: 'agents' } }),
      card('PADEL_01', 'story', 'PADEL_02', { card: { arc: 'padel' }, right: { switchArc: 'agents', next: 'AGENT_01' } }),
      card('PADEL_02', 'story', 'PADEL_03_TEAM', { card: { arc: 'padel' } }),
      card('PADEL_03_TEAM', 'story', null, { left: { ending: 'fixture_padel' }, right: { ending: 'fixture_padel' }, card: { arc: 'padel' } }),

      card('MVI_SEED', 'sideStory', null, {
        card: { scheduler: { role: 'seed', slot: 'opening_shared_seed', moduleId: 'mom_investor' }, weight: 2, oncePerRun: true, requires: ['opening_overload_exposed'], excludes: ['health_control_story'], resourceRange: { founder: { min: 58, max: 65 } } },
        left: { setFlags: ['health_control_story', 'control_seed_mom'], reserveCallback: { callbackId: 'MVI_CALLBACK', callbackSlot: 'opening_health_resolution', spineSteps: 1 } },
        right: { setFlags: ['health_control_story', 'control_seed_investor'], reserveCallback: { callbackId: 'MVI_CALLBACK', callbackSlot: 'opening_health_resolution', spineSteps: 1 } },
      }),
      card('MVI_CALLBACK', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'opening_health_resolution', moduleId: 'mom_investor' }, oncePerRun: true },
        left: { setFlags: ['route_control_mom'] }, right: { setFlags: ['route_control_investor'] },
      }),
      card('COMA_SEED', 'sideStory', null, {
        card: { scheduler: { role: 'seed', slot: 'opening_shared_seed', moduleId: 'coma' }, weight: 1, oncePerRun: true, requires: ['opening_overload_exposed'], excludes: ['health_control_story'], resourceRange: { founder: { min: 58, max: 65 } } },
        left: { setFlags: ['health_control_story', 'coma_authorized'], reserveCallback: { callbackId: 'COMA_CALLBACK_AUTHORIZED', callbackSlot: 'opening_health_resolution', spineSteps: 1 } },
        right: { setFlags: ['health_control_story', 'coma_blocked'], reserveCallback: { callbackId: 'COMA_CALLBACK_BLOCKED', callbackSlot: 'opening_health_resolution', spineSteps: 1 } },
      }),
      card('COMA_CALLBACK_AUTHORIZED', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'opening_health_resolution', moduleId: 'coma' }, oncePerRun: true, requires: ['coma_authorized'] },
        left: { setFlags: ['coma_public'] }, right: { setFlags: ['coma_retracted'] },
      }),
      card('COMA_CALLBACK_BLOCKED', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'opening_health_resolution', moduleId: 'coma' }, oncePerRun: true, requires: ['coma_blocked'] },
        left: { setFlags: ['coma_rest'] }, right: { setFlags: ['coma_denied'] },
      }),
      card('MOM_FLYERS', 'sideStory', null, {
        card: { scheduler: { role: 'reaction', slot: 'opening_health_resolution', moduleId: 'flyers' }, oncePerRun: true, excludes: ['health_control_story'], resourceRange: { founder: { min: 66, max: 78 } } },
        left: { setFlags: ['mom_flyers_removed'] }, right: { setFlags: ['mom_flyers_public'] },
      }),
      card('PAYROLL_SEED', 'sideStory', null, {
        card: { scheduler: { role: 'seed', slot: 'agents_entry_seed', moduleId: 'payroll' }, weight: 3, oncePerRun: true, activeArcs: 'agents', requires: ['payroll_unresolved'], resourceRange: { cash: { min: 12, max: 19 }, team: { min: 47, max: 53 }, founder: { min: 59, max: 83 } } },
        left: { setFlags: ['payroll_offer_compute'], reserveCallback: { callbackId: 'PAYROLL_CALLBACK', callbackSlot: 'agents_pre_serious_lead', spineSteps: 3 } },
        right: { setFlags: ['payroll_offer_ordinary'], reserveCallback: { callbackId: 'PAYROLL_CALLBACK', callbackSlot: 'agents_pre_serious_lead', spineSteps: 3 } },
      }),
      card('PAYROLL_CALLBACK', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'agents_pre_serious_lead', moduleId: 'payroll' }, oncePerRun: true },
        left: { setFlags: ['payroll_machines'] }, right: { setFlags: ['payroll_people'] },
      }),
      card('DEV_SEED', 'sideStory', null, {
        card: { scheduler: { role: 'seed', slot: 'agents_entry_seed', moduleId: 'dev' }, weight: 2, oncePerRun: true, activeArcs: 'agents', requires: ['payroll_unresolved', 'dev_payroll_risk_visible'], resourceRange: { cash: { min: 12, max: 19 }, team: { min: 47, max: 53 }, founder: { min: 59, max: 83 } } },
        left: { setFlags: ['dev_public'], reserveCallback: { callbackId: 'DEV_CALLBACK', callbackSlot: 'agents_pre_serious_lead', spineSteps: 3 } },
        right: { setFlags: ['dev_bypassed'], reserveCallback: { callbackId: 'DEV_CALLBACK', callbackSlot: 'agents_pre_serious_lead', spineSteps: 3 } },
      }),
      card('DEV_CALLBACK', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'agents_pre_serious_lead', moduleId: 'dev' }, oncePerRun: true },
        left: { setFlags: ['dev_protected'] }, right: { setFlags: ['dev_contested'] },
      }),
      card('B3_SEED', 'sideStory', null, {
        card: { scheduler: { role: 'seed', slot: 'agents_entry_seed', moduleId: 'b3' }, weight: 1, oncePerRun: true, activeArcs: 'agents', requires: ['sales_outreach_started', 'b3_fixture_founder_segment'], resourceRange: { cash: { min: 12, max: 19 }, team: { min: 47, max: 61 }, founder: { min: 56, max: 83 } } },
        left: { setFlags: ['b3_authorized'], reserveCallback: { callbackId: 'B3_CALLBACK', callbackSlot: 'agents_pre_serious_lead', spineSteps: 3 } },
        right: { setFlags: ['b3_free'] },
      }),
      card('B3_CALLBACK', 'sideStory', null, {
        card: { scheduler: { role: 'callback', slot: 'agents_pre_serious_lead', moduleId: 'b3' }, oncePerRun: true, requires: ['b3_authorized'] },
        left: { setFlags: ['b3_paid'] }, right: { setFlags: ['b3_free_optout_granted'] },
      }),
    ],
    crises: {},
    endings: { fixture_end: { title: 'Fixture end.' }, fixture_padel: { title: 'Fixture padel end.' } },
  };
}

function bitsFor(index) {
  return index.toString(2).padStart(5, '0').split('').map((bit) => bit === '1' ? 'right' : 'left');
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function drive(engine, deck, options = {}) {
  const rng = options.rng || makeRng(options.seed || 1);
  const bits = options.bits || bitsFor(0);
  const stopAtOpen06 = Boolean(options.stopAtOpen06);
  let openingStep = 0;
  let state = engine.startRun(deck);
  const events = [];
  for (let safety = 0; !state.gameOver && safety < 80; safety += 1) {
    if (stopAtOpen06 && state.currentCardId === 'OPEN_06') break;
    const current = state.currentCardId;
    let side = 'left';
    if (['OPEN_01', 'OPEN_02', 'OPEN_03_AUDIT', 'OPEN_03_INVOICES', 'OPEN_04', 'OPEN_05'].includes(current)) {
      side = bits[openingStep] || 'left';
      openingStep += 1;
    } else if (current === 'OPEN_06') side = options.open06Side || 'left';
    else if (current === 'PADEL_01') side = options.padelSide || (rng() < 0.8 ? 'left' : 'right');
    else side = options.fixtureSide || (rng() < 0.5 ? 'left' : 'right');
    state = engine.resolveChoice(deck, state, side, {
      rng,
      onSchedulerBoundary: (event) => events.push({ boundaryId: event.boundary.id, cardIds: event.pool.map((entry) => entry.cardId) }),
    }).state;
  }
  if (!state.gameOver && !stopAtOpen06) throw new Error(`Fixture run did not terminate at ${state.currentCardId}`);
  return { state, events, openingChoices: bits, history: state.history.map((entry) => entry.cardId) };
}

function openingTraces(engine = require('../../game.js'), deck = createFixtureDeck()) {
  return Array.from({ length: 32 }, (_, index) => {
    const run = drive(engine, deck, { bits: bitsFor(index), seed: index + 1, stopAtOpen06: true });
    const openingHistory = run.history;
    return {
      id: `OPEN_${bitsFor(index).map((side) => side === 'left' ? 'L' : 'R').join('')}`,
      bits: bitsFor(index),
      openingHistory,
      openingCards: openingHistory.filter((id) => id.startsWith('OPEN_')),
      events: run.events,
      state: run.state,
    };
  });
}

function agentPoolForTrace(engine, trace, deck = createFixtureDeck(), seed = 1) {
  const run = drive(engine, deck, { bits: trace.bits, seed, stopAtOpen06: true });
  const events = [...run.events];
  const state = engine.resolveChoice(deck, run.state, 'left', {
    rng: makeRng(seed), onSchedulerBoundary: (event) => events.push({ boundaryId: event.boundary.id, cardIds: event.pool.map((entry) => entry.cardId) }),
  }).state;
  return { state, cardIds: events.filter((event) => event.boundaryId === 'agents_entry_seed').flatMap((event) => event.cardIds) };
}

function collectAuditEvidence(engine = require('../../game.js'), deck = createFixtureDeck()) {
  const boundaries = [];
  const fixedRngs = [() => 0.05, () => 0.6, () => 0.95];
  Array.from({ length: 32 }, (_, index) => bitsFor(index)).forEach((bits) => {
    fixedRngs.forEach((rng) => ['left', 'right'].forEach((fixtureSide) => {
      const run = drive(engine, deck, { bits, rng, open06Side: 'left', padelSide: 'left', fixtureSide });
      boundaries.push(...run.events);
    }));
  });
  return { realOpeningTraces: 32, boundaries };
}

function runSeededSimulation(engine = require('../../game.js'), { runs = 10000, seed = 0x12345678 } = {}) {
  const deck = createFixtureDeck();
  const rng = makeRng(seed);
  const totals = {
    runs, directAgents: 0, zeroPackageA: 0, callbackLoss: 0, protectedPairViolations: 0, postPadelInsertions: 0, mutexViolations: 0,
    eligible: { payroll: 0, dev: 0, b3: 0 }, selection: { momInvestor: 0, coma: 0, flyers: 0, payroll: 0, dev: 0, b3: 0 },
    callbackExpected: { momInvestor: 0, coma: 0, payroll: 0, dev: 0, b3: 0 }, callbacks: { momInvestor: 0, coma: 0, payroll: 0, dev: 0, b3: 0 },
    poolComposition: {
      payrollDev: { windows: 0, selection: { payroll: 0, dev: 0, b3: 0, none: 0 } },
      payrollDevB3: { windows: 0, selection: { payroll: 0, dev: 0, b3: 0, none: 0 } },
      b3Only: { windows: 0, selection: { payroll: 0, dev: 0, b3: 0, none: 0 } },
    },
    packageA: [], b3: [], legacy: [], total: [], nonLegacy: [], combinations: {},
  };
  const packageAIds = new Set(['MVI_SEED', 'MVI_CALLBACK', 'COMA_SEED', 'COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED', 'MOM_FLYERS', 'PAYROLL_SEED', 'PAYROLL_CALLBACK', 'DEV_SEED', 'DEV_CALLBACK']);
  const b3Ids = new Set(['B3_SEED', 'B3_CALLBACK']);
  for (let index = 0; index < runs; index += 1) {
    const traceIndex = Math.floor(rng() * 32);
    const open06Side = rng() < 0.8 ? 'left' : 'right';
    const run = drive(engine, deck, { bits: bitsFor(traceIndex), rng, open06Side });
    const ids = run.history;
    const agentPool = run.events.find((event) => event.boundaryId === 'agents_entry_seed')?.cardIds || [];
    ['PAYROLL_SEED', 'DEV_SEED', 'B3_SEED'].forEach((id) => {
      const key = id === 'PAYROLL_SEED' ? 'payroll' : id === 'DEV_SEED' ? 'dev' : 'b3';
      if (agentPool.includes(id)) totals.eligible[key] += 1;
    });
    const selected = [
      ['MVI_SEED', 'momInvestor'], ['COMA_SEED', 'coma'], ['MOM_FLYERS', 'flyers'],
      ['PAYROLL_SEED', 'payroll'], ['DEV_SEED', 'dev'], ['B3_SEED', 'b3'],
    ];
    selected.forEach(([id, key]) => { if (ids.includes(id)) totals.selection[key] += 1; });
    const poolHas = (id) => agentPool.includes(id);
    const composition = poolHas('PAYROLL_SEED') && poolHas('DEV_SEED') && poolHas('B3_SEED')
      ? totals.poolComposition.payrollDevB3
      : poolHas('PAYROLL_SEED') && poolHas('DEV_SEED')
        ? totals.poolComposition.payrollDev
        : poolHas('B3_SEED')
          ? totals.poolComposition.b3Only
          : null;
    if (composition) {
      composition.windows += 1;
      const selectedAgent = ids.includes('PAYROLL_SEED') ? 'payroll'
        : ids.includes('DEV_SEED') ? 'dev'
          : ids.includes('B3_SEED') ? 'b3' : 'none';
      composition.selection[selectedAgent] += 1;
    }
    const expected = [
      ['MVI_SEED', 'momInvestor'], ['COMA_SEED', 'coma'], ['PAYROLL_SEED', 'payroll'], ['DEV_SEED', 'dev'],
    ];
    expected.forEach(([id, key]) => { if (ids.includes(id)) totals.callbackExpected[key] += 1; });
    const b3Entry = run.state.history.find((entry) => entry.cardId === 'B3_SEED');
    if (b3Entry?.side === 'left') totals.callbackExpected.b3 += 1;
    const callbacks = [
      [['MVI_CALLBACK'], 'momInvestor'], [['COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED'], 'coma'],
      [['PAYROLL_CALLBACK'], 'payroll'], [['DEV_CALLBACK'], 'dev'], [['B3_CALLBACK'], 'b3'],
    ];
    callbacks.forEach(([callbackIds, key]) => { if (ids.some((id) => callbackIds.includes(id))) totals.callbacks[key] += 1; });
    const lead = ids.indexOf('AGENT_04_LEAD');
    if (lead >= 0 && ids.slice(lead, lead + 3).join('|') !== 'AGENT_04_LEAD|AGENT_05_ORDER|AGENT_06_LEGAL') totals.protectedPairViolations += 1;
    const padelEntry = run.state.history.find((entry) => entry.cardId === 'PADEL_01');
    const padel = ids.indexOf('PADEL_01');
    if (padelEntry?.side === 'left' && padel >= 0 && ids.slice(padel + 1).some((id) => packageAIds.has(id) || b3Ids.has(id))) totals.postPadelInsertions += 1;
    if (ids.includes('MOM_FLYERS') && ids.some((id) => id === 'MVI_CALLBACK' || id.startsWith('COMA_CALLBACK'))) totals.mutexViolations += 1;
    const packageA = ids.filter((id) => packageAIds.has(id)).length;
    const b3 = ids.filter((id) => b3Ids.has(id)).length;
    const directAgents = ids.includes('OPEN_06') && run.state.history.find((entry) => entry.cardId === 'OPEN_06')?.side === 'left';
    if (directAgents) {
      totals.directAgents += 1;
      if (packageA === 0) totals.zeroPackageA += 1;
      totals.packageA.push(packageA); totals.b3.push(b3); totals.legacy.push(0); totals.nonLegacy.push(packageA + b3); totals.total.push(packageA + b3);
    }
    const health = ids.includes('MVI_SEED') ? 'mvi' : ids.includes('COMA_SEED') ? 'coma' : ids.includes('MOM_FLYERS') ? 'flyers' : 'none';
    const agent = ids.includes('PAYROLL_SEED') ? 'payroll' : ids.includes('DEV_SEED') ? 'dev' : ids.includes('B3_SEED') ? 'b3' : ids.includes('PADEL_01') ? 'padel' : 'none';
    const key = `${health}+${agent}`;
    totals.combinations[key] = (totals.combinations[key] || 0) + 1;
  }
  totals.callbackLoss = Object.keys(totals.callbackExpected).reduce((sum, key) => sum + totals.callbackExpected[key] - totals.callbacks[key], 0);
  return totals;
}

module.exports = { createFixtureDeck, openingTraces, agentPoolForTrace, collectAuditEvidence, runSeededSimulation, drive, makeRng };
