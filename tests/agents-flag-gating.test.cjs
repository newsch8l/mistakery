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

// Codex round-2 finding 3: a pool beat has no hardcoded next, so a crisis
// triggered by its choice must still preserve the pool continuation — a rescued
// crisis must resume arc selection, not strand the run on the resolved beat.
test('a rescued crisis on a pool beat resumes the arc pool', () => {
  const state = engine.startRun(deck);
  state.currentCardId = 'AGENT_02_DEV';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded'];
  state.shown = ['AGENT_01'];
  state.resources = { cash: 1, team: 80, customers: 50, founder: 60 };
  const afterChoice = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterChoice.activeCrisisId, 'cash_low', 'setup: the pool choice must trigger a crisis');
  const rescued = engine.resolveCrisis(deck, afterChoice, 'rescue', { rng: () => 0.01 }).state;
  assert.equal(rescued.gameOver, false, 'a successful rescue must not end the run');
  assert.equal(rescued.currentCardId, 'AGENT_03_HYPE',
    'pool continuation must survive the crisis and advance to the next gated beat');
});

// Glue-entry gating (Codex F1 scheme): the customer-conversation glue must not
// begin while any callback is still pending — so callbacks always resolve during
// the free-beat phase and the 4->7 chain stays uninterrupted.
test('glue-entry beat is blocked while any callback is pending', () => {
  const state = agentsState(['empathy_demanded', 'patch_built', 'hyped']);
  state.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE'];
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 2 }];
  const ids = engine.eligibleArcBeatPool(deck, state).map((entry) => entry.card.id);
  assert.ok(!ids.includes('AGENT_04_LEAD'),
    'AGENT_04 (glue entry) must exclude pending callbacks');
});

// Anti-deadlock (Codex empty-pool scheme): if the arc pool is empty only because
// the glue entry is waiting on a pending callback, force-deliver that callback
// instead of ending the run with no_proof.
test('a stuck arc pool with a pending callback delivers it, not no_proof', () => {
  const state = engine.startRun(deck);
  state.currentCardId = 'AGENT_03_HYPE';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded', 'patch_built'];
  state.shown = ['AGENT_01', 'AGENT_02_DEV'];
  state.resources = { cash: 60, team: 80, customers: 50, founder: 60 };
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 3 }];
  state.pressureCount = deck.meta.maxPressureCards;
  const res = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 });
  assert.equal(res.state.gameOver, false, 'must not end while a callback is pending');
  assert.equal(res.state.currentCardId, 'PAYROLL_RESTRICTED_AI_CALLBACK',
    'stuck pool must force-deliver the pending callback');
});

// Codex round-2 finding 1: after a force-delivered callback is resolved, the arc
// must resume through the pool (rebuilt), not dead-end in no_proof.
test('a force-delivered callback resumes the arc pool afterwards', () => {
  const state = engine.startRun(deck);
  state.currentCardId = 'AGENT_03_HYPE';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded', 'patch_built'];
  state.shown = ['AGENT_01', 'AGENT_02_DEV'];
  state.resources = { cash: 60, team: 80, customers: 50, founder: 60 };
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 3 }];
  state.pressureCount = deck.meta.maxPressureCards;
  const s1 = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(s1.currentCardId, 'PAYROLL_RESTRICTED_AI_CALLBACK', 'setup: callback force-delivered');
  const s2 = engine.resolveChoice(deck, s1, 'left', { rng: () => 0.5 }).state;
  assert.equal(s2.gameOver, false, 'resolving the callback must not end the run');
  assert.equal(s2.currentCardId, 'AGENT_04_LEAD',
    'arc must resume to the glue entry once the callback clears the pending gate');
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
