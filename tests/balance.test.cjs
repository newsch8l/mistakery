const test = require('node:test');
const assert = require('node:assert/strict');
const deck = require('../cards.json');
const engine = require('../game.js');

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function simulate(seed) {
  const rng = seeded(seed);
  let state = engine.startRun(deck, { seed });
  let safety = 0;
  while (!state.gameOver && safety < 60) {
    if (state.activeCrisisId) state = engine.resolveCrisis(deck, state, 'rescue', { rng }).state;
    else state = engine.resolveChoice(deck, state, rng() < 0.5 ? 'left' : 'right', { rng }).state;
    safety += 1;
  }
  assert.ok(safety < 60, `Simulation ${seed} did not terminate`);
  return state;
}

test('ten thousand seeded full runs terminate after entering one of the two routes', () => {
  const runs = Array.from({ length: 10000 }, (_, index) => simulate(index + 1));
  const endings = runs.reduce((counts, state) => {
    counts[state.endingId] = (counts[state.endingId] || 0) + 1;
    return counts;
  }, {});

  runs.forEach((state) => {
    const ids = state.history.map((entry) => entry.cardId);
    assert.ok(state.history.length > 6);
    assert.equal(state.gameOver, true);
    assert.equal(['onboarding_enterprise', 'onboarding_whale'].includes(state.endingId), false);
    assert.ok(ids.includes('AGENT_01') || ids.includes('PADEL_01'));
  });
  assert.equal(endings.onboarding_enterprise, undefined);
  assert.equal(endings.onboarding_whale, undefined);
});

function playScript(picks) {
  let state = engine.startRun(deck);
  let safety = 0;
  while (!state.gameOver && safety < 40) {
    if (state.activeCrisisId) state = engine.resolveCrisis(deck, state, 'rescue', { rng: () => 0 }).state;
    else state = engine.resolveChoice(deck, state, picks[state.currentCardId] || 'right', { rng: () => 0 }).state;
    safety += 1;
  }
  return state;
}

test('both final onboarding choices enter and complete their selected arc', () => {
  const enterprise = playScript({
    OPEN_06: 'left', AGENT_01: 'right', AGENT_02_DEV: 'right',
    AGENT_03_HYPE: 'left', AGENT_04_LEAD: 'left', AGENT_05_ORDER: 'right',
    AGENT_06_LEGAL: 'left', AGENT_07_INVOICE: 'left',
  });
  const whale = playScript({
    OPEN_06: 'right', PADEL_01: 'left', PADEL_02: 'left',
    PADEL_03_TEAM: 'left', PADEL_04_CHOICE: 'right',
    PADEL_05_WIN: 'left', PADEL_06_PILOT: 'left',
  });
  assert.equal(enterprise.endingId, 'validation_agents');
  assert.equal(enterprise.win, true);
  assert.equal(enterprise.activeArc, 'agents');
  assert.ok(enterprise.history.some((entry) => entry.cardId === 'AGENT_01'));
  assert.equal(whale.endingId, 'validation_padel');
  assert.equal(whale.win, true);
  assert.equal(whale.activeArc, 'padel');
  assert.ok(whale.history.some((entry) => entry.cardId === 'PADEL_01'));
});

function playStory(startId, activeArc, picks) {
  let state = engine.startRun(deck);
  state.currentCardId = startId;
  state.activeArc = activeArc;
  let safety = 0;
  while (!state.gameOver && safety < 40) {
    if (state.activeCrisisId) state = engine.resolveCrisis(deck, state, 'rescue', { rng: () => 0 }).state;
    else state = engine.resolveChoice(deck, state, picks[state.currentCardId] || 'right', { rng: () => 0 }).state;
    safety += 1;
  }
  return state;
}

test('padel never inserts background cards inside its immediate causal pairs', () => {
  const state = playStory('PADEL_01', 'padel', {
    PADEL_01: 'left', PADEL_02: 'left', PADEL_03_TEAM: 'left',
    PADEL_04_CHOICE: 'right', PADEL_05_WIN: 'left', PADEL_06_PILOT: 'left',
  });
  const ids = state.history.map((entry) => entry.cardId);
  const adjacent = (first, second) => ids.indexOf(second) === ids.indexOf(first) + 1;
  assert.equal(adjacent('PADEL_01', 'PADEL_02'), true);
  assert.equal(adjacent('PADEL_04_CHOICE', 'PADEL_05_WIN'), true);
  assert.equal(adjacent('PADEL_05_WIN', 'PADEL_06_PILOT'), true);
});

test('accepting Padel suppresses later variable callbacks even after leaving for agents', () => {
  const state = playStory('PADEL_01', 'padel', {
    PADEL_01: 'left', PADEL_02: 'right', AGENT_01: 'right',
    AGENT_02_DEV: 'left', AGENT_03_HYPE: 'left', AGENT_04_LEAD: 'left',
    AGENT_05_ORDER: 'right', AGENT_06_LEGAL: 'left', AGENT_07_INVOICE: 'right',
  });
  assert.equal(state.history.some((entry) => entry.cardId === 'PRESS_CAPITALISM'), false);
  assert.ok(state.pressureCount <= deck.meta.maxPressureCards);
});

test('production runs never repeat or stack pressure cards', () => {
  for (let seed = 1; seed <= 1000; seed += 1) {
    const state = simulate(seed);
    const pressureIds = state.history
      .filter((entry) => engine.cardById(deck, entry.cardId)?.kind === 'pressure')
      .map((entry) => entry.cardId);
    assert.equal(new Set(pressureIds).size, pressureIds.length, `Repeated pressure in seed ${seed}`);
    for (let index = 1; index < state.history.length; index += 1) {
      const before = engine.cardById(deck, state.history[index - 1].cardId);
      const current = engine.cardById(deck, state.history[index].cardId);
      assert.equal(before.kind === 'pressure' && current.kind === 'pressure', false, `Consecutive pressure in seed ${seed}`);
    }
  }
});
