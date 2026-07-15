const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const engine = require('../game.js');
const deck = require('../cards.json');

// Variant B — Agents arc beats are flag-gated: a beat cannot become eligible
// before the flag its causal predecessor sets. These tests lock the ordering
// invariants independent of how the next card is selected.

function agentsState(flags) {
  const state = engine.startRun(deck);
  state.activeArc = 'agents';
  state.flags = flags.slice();
  return state;
}

function eligible(state, id) {
  return engine.buildEligiblePool(deck, state, { ids: [id] }).length === 1;
}

test('hype beat is not eligible before the patch exists', () => {
  const afterEmpathyDemand = agentsState(['empathy_demanded']);
  assert.equal(eligible(afterEmpathyDemand, 'AGENT_03_HYPE'), false,
    'AGENT_03_HYPE must require patch_built');
});

test('hype beat becomes eligible once the patch is built', () => {
  const afterPatch = agentsState(['empathy_demanded', 'patch_built']);
  assert.equal(eligible(afterPatch, 'AGENT_03_HYPE'), true,
    'AGENT_03_HYPE must be eligible after patch_built');
});

test('patch beat is not eligible before empathy is demanded', () => {
  const fresh = agentsState([]);
  assert.equal(eligible(fresh, 'AGENT_02_DEV'), false,
    'AGENT_02_DEV must require empathy_demanded');
});

// The arc-beat pool is the set of Agents story beats that the scheduler may
// pick from directly (free beats). Glued-chain targets (order/legal/invoice)
// are reached only by forced next and must never be in the pool.

test('arc-beat pool is causally exact: empathy demanded => only the patch beat', () => {
  // No reliance on presentation history (shown): the completed beat must be
  // excluded by its own flag, so the pool is patch-only on causal state alone.
  const state = agentsState(['empathy_demanded']);
  const ids = engine.eligibleArcBeatPool(deck, state).map((entry) => entry.card.id);
  assert.deepEqual(ids, ['AGENT_02_DEV'],
    'empathy-demand beat must exclude its own flag; hype is gated on patch_built');
});

test('arc-beat pool only contains cards of the active arc', () => {
  const state = agentsState(['empathy_demanded']);
  const nonAgents = engine.eligibleArcBeatPool(deck, state)
    .filter((entry) => entry.card.arc !== 'agents');
  assert.equal(nonAgents.length, 0, 'pool must be scoped to the active arc');
});

// A free (pool) beat has no hardcoded next; the engine advances to the next
// eligible arc beat through the pool. Ambient is suppressed here for a
// deterministic assertion by exhausting the pressure budget.
test('a free beat advances to the next gated beat through the pool', () => {
  const state = engine.startRun(deck);
  state.currentCardId = 'AGENT_02_DEV';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded'];
  state.shown = ['AGENT_01'];
  state.pressureCount = deck.meta.maxPressureCards;
  const res = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 });
  assert.equal(res.state.currentCardId, 'AGENT_03_HYPE',
    'patch beat must advance to hype via the pool, not a hardcoded next');
});
