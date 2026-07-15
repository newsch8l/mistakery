const test = require('node:test');
const assert = require('node:assert/strict');
const deck = require('../cards.json');
const engine = require('../game.js');

function choose(state, side) {
  return engine.resolveChoice(deck, state, side, { rng: () => 0 }).state;
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

function traceAgents(seedId, seedSide, callbackId, callbackSide, flags) {
  let state = stateAt(seedId, {
    activeArc: 'agents', flags,
    resources: { cash: 15, team: 50, founder: 65 },
  });
  state.queuedCardId = 'AGENT_01';
  state.queuedCardIds = ['AGENT_01'];
  state.queuedBoundary = { id: 'agents_entry_seed', before: 'OPEN_06', after: 'AGENT_01' };
  state = choose(state, seedSide);
  assert.equal(state.reservations[0].callbackId, callbackId);
  state.pressureCount = deck.meta.maxPressureCards;
  state = choose(state, 'left');
  state = choose(state, 'right');
  state = choose(state, 'left');
  assert.equal(state.currentCardId, callbackId);
  state = choose(state, callbackSide);
  assert.equal(state.currentCardId, 'AGENT_04_LEAD');
  state = choose(state, 'left');
  assert.deepEqual(state.history.map((entry) => entry.cardId), [
    seedId, 'AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE', callbackId, 'AGENT_04_LEAD',
  ]);
  assert.deepEqual(state.reservations, []);
}

function traceHealth(seedId, seedSide, callbackId, callbackSide) {
  let state = stateAt(seedId, {
    flags: ['opening_overload_exposed'], resources: { founder: 62 },
  });
  state.queuedCardId = 'OPEN_05';
  state.queuedCardIds = ['OPEN_05'];
  state.queuedBoundary = { id: 'opening_shared_seed', before: 'OPEN_04', after: 'OPEN_05' };
  state = choose(state, seedSide);
  assert.equal(state.reservations[0].callbackId, callbackId);
  state = choose(state, 'left');
  assert.equal(state.currentCardId, callbackId);
  state = choose(state, callbackSide);
  assert.equal(state.currentCardId, 'OPEN_06');
  state = choose(state, 'left');
  assert.deepEqual(state.history.map((entry) => entry.cardId), [seedId, 'OPEN_05', callbackId, 'OPEN_06']);
  assert.deepEqual(state.reservations, []);
}

test('deterministic traces cover all four Restricted AI Payroll outcomes', () => {
  ['left', 'right'].forEach((seedSide) => ['left', 'right'].forEach((callbackSide) => {
    traceAgents('PAYROLL_RESTRICTED_AI_SEED', seedSide, 'PAYROLL_RESTRICTED_AI_CALLBACK', callbackSide, ['payroll_unresolved']);
  }));
});

test('deterministic traces cover all four Dev Hostage outcomes', () => {
  ['left', 'right'].forEach((seedSide) => ['left', 'right'].forEach((callbackSide) => {
    traceAgents('DEV_HOSTAGE_SEED', seedSide, 'DEV_HOSTAGE_CALLBACK', callbackSide, ['payroll_unresolved', 'dev_payroll_risk_visible']);
  }));
});

test('deterministic traces cover all four Mom vs Investor outcomes', () => {
  ['left', 'right'].forEach((seedSide) => ['left', 'right'].forEach((callbackSide) => {
    traceHealth('MOM_INVESTOR_SEED', seedSide, 'MOM_INVESTOR_CALLBACK', callbackSide);
  }));
});

test('deterministic traces cover both branches and all four Fake Founder Coma outcomes', () => {
  ['left', 'right'].forEach((callbackSide) => {
    traceHealth('COMA_SEED', 'left', 'COMA_CALLBACK_AUTHORIZED', callbackSide);
    traceHealth('COMA_SEED', 'right', 'COMA_CALLBACK_BLOCKED', callbackSide);
  });
});

test('deterministic traces cover both Mom Flyers outcomes', () => {
  ['left', 'right'].forEach((side) => {
    let state = stateAt('MOM_FLYERS', { resources: { founder: 70 } });
    state.queuedCardId = 'OPEN_06';
    state.queuedCardIds = ['OPEN_06'];
    state.queuedBoundary = { id: 'opening_health_resolution', before: 'OPEN_05', after: 'OPEN_06' };
    state = choose(state, side);
    assert.equal(state.currentCardId, 'OPEN_06');
    state = choose(state, 'left');
    assert.deepEqual(state.history.map((entry) => entry.cardId), ['MOM_FLYERS', 'OPEN_06']);
  });
});

test('a terminal outcome clears a pending Package A callback and cannot show it afterward', () => {
  let state = stateAt('AGENT_07_INVOICE', { activeArc: 'agents' });
  state.reservations = [{
    callbackId: 'PAYROLL_RESTRICTED_AI_CALLBACK', callbackSlot: 'agents_pre_serious_lead',
    remainingSpineSteps: 0, moduleId: 'payroll',
  }];
  state = choose(state, 'left');
  assert.equal(state.gameOver, true);
  assert.deepEqual(state.reservations, []);
  const historyLength = state.history.length;
  state = choose(state, 'right');
  assert.equal(state.history.length, historyLength);
  assert.equal(state.history.some((entry) => entry.cardId === 'PAYROLL_RESTRICTED_AI_CALLBACK'), false);
});
