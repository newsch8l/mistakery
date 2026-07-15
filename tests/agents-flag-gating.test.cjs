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

// Codex round-3 finding 3: the typed-callback contract must be enforced by the
// engine, not just a data convention — a delay may only target a callbackOnly
// side-story, so a mistaken delay can never force-deliver a pressure/story card.
test('deck validation rejects a delay target that is not a typed callbackOnly side-story', () => {
  const bad = JSON.parse(JSON.stringify(deck));
  const seed = bad.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_SEED');
  seed.choices.left.delay = { card: 'AGENT_04_LEAD', storyDecisions: 2 }; // a story beat, not a callback
  const errors = engine.validateDeck(bad);
  assert.ok(errors.some((e) => /AGENT_04_LEAD/.test(e) && /callbackOnly|callback/i.test(e)),
    'must flag a delay pointing at a non-typed card');
});

test('the canonical deck satisfies the typed-callback contract', () => {
  assert.deepEqual(engine.validateDeck(deck), [], 'canonical deck must validate clean');
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

// Codex round-3 finding 1: a crisis caused by the force-delivered callback itself
// must still resume the arc pool (pool-origin resume, not just pool/weighted).
test('a crisis caused by a force-delivered callback still resumes the arc pool', () => {
  const state = engine.startRun(deck);
  state.currentCardId = 'PAYROLL_RESTRICTED_AI_CALLBACK';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded', 'patch_built', 'hyped', 'hype_consequence_seen', 'payroll_seeded', 'agents_positioned_ethical'];
  state.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_03B_WILD'];
  state.queuedPool = true; // as set by force-delivery
  state.resources = { cash: 60, team: 1, customers: 50, founder: 60 };
  const afterChoice = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterChoice.activeCrisisId, 'team_low', 'setup: the callback choice must trigger a crisis');
  const rescued = engine.resolveCrisis(deck, afterChoice, 'rescue', { rng: () => 0.01 }).state;
  assert.equal(rescued.gameOver, false, 'a successful rescue must not end the run');
  assert.equal(rescued.currentCardId, 'AGENT_04_LEAD',
    'pool-origin resume continuation must survive a crisis on the force-delivered callback');
});

// Step 2.2 migration (Codex F2/F4): side-story callbacks move off the boundary/
// reservation machinery onto a typed delayed callback — callbackOnly + a causal
// requires flag the seed sets, so the callback can never leak into the pool and
// can never be a stale pending entry that blocks the glue.
test('migrated payroll uses a typed delayed callback, not a boundary reservation', () => {
  const seed = deck.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_SEED');
  const cb = deck.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_CALLBACK');
  for (const side of ['left', 'right']) {
    assert.equal(seed.choices[side].reserveCallback, undefined, `${side}: no reservation`);
    assert.equal(seed.choices[side].delay && seed.choices[side].delay.card, 'PAYROLL_RESTRICTED_AI_CALLBACK', `${side}: delayed callback`);
    assert.ok([seed.choices[side].setFlags].flat().includes('payroll_seeded'), `${side}: marks payroll_seeded`);
  }
  assert.equal(seed.scheduler, undefined, 'seed drops scheduler metadata');
  assert.equal(cb.callbackOnly, true, 'callback is callbackOnly (Codex F2)');
  assert.ok([cb.requires].flat().includes('payroll_seeded'), 'callback requires its causal flag (Codex F4)');
  assert.equal(cb.scheduler, undefined, 'callback drops scheduler metadata');
});

// Codex round-3 finding 2: a seed appearing right before the glue would have its
// callback force-delivered with zero gap. Window the payroll seed to the early
// phase (before hype) so the delay keeps a real gap before AGENT_04.
test('the payroll seed is windowed to the early phase (before hype)', () => {
  const seed = deck.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_SEED');
  assert.ok([seed.excludes].flat().includes('hyped'),
    'seed must exclude hyped so it cannot appear right before the glue');
  // concretely: not eligible once hyped, eligible before it
  const late = agentsState(['payroll_unresolved', 'empathy_demanded', 'patch_built', 'hyped']);
  assert.equal(eligible(late, 'PAYROLL_RESTRICTED_AI_SEED'), false, 'not eligible after hype');
  const early = agentsState(['payroll_unresolved', 'empathy_demanded']);
  early.resources = { cash: 15, team: 50, founder: 70, customers: 40 };
  assert.equal(eligible(early, 'PAYROLL_RESTRICTED_AI_SEED'), true, 'eligible in the early window');
});

// Codex round-3 finding 4: a behavioral timing test for the reference module,
// required before copying the pattern to dev-hostage and b3.
test('payroll seed schedules exactly one callback, resumes the arc, decrements on story', () => {
  let s = engine.startRun(deck);
  s.currentCardId = 'PAYROLL_RESTRICTED_AI_SEED';
  s.activeArc = 'agents';
  s.flags = ['payroll_unresolved', 'empathy_demanded'];
  s.queuedCardId = 'AGENT_02_DEV';
  s.queuedCardIds = ['AGENT_02_DEV'];
  s.queuedPool = true;
  s.resources = { cash: 15, team: 50, founder: 70, customers: 40 };
  s.pressureCount = deck.meta.maxPressureCards; // suppress other ambient
  s = engine.resolveChoice(deck, s, 'left', { rng: () => 0.5 }).state;
  assert.equal(s.delayed.length, 1, 'exactly one callback scheduled');
  assert.equal(s.delayed[0].card, 'PAYROLL_RESTRICTED_AI_CALLBACK');
  assert.equal(s.delayed[0].remainingStoryDecisions, 3, 'target delay of three story decisions');
  assert.equal(s.currentCardId, 'AGENT_02_DEV', 'resumes to the queued story beat');
  const afterStory = engine.resolveChoice(deck, s, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterStory.delayed[0] && afterStory.delayed[0].remainingStoryDecisions, 2,
    'a story decision decrements the countdown by one');
});

// Step 2c: PRESS_CAPITALISM promoted to a spine beat AGENT_03B_WILD, sitting
// between hype and the lead. It reads `hyped`, sets `hype_consequence_seen`
// (+ a positioning flag), and AGENT_04 now unlocks on that consequence.
test('the wild consequence beat sits between hype and lead', () => {
  const afterHype = agentsState(['empathy_demanded', 'patch_built', 'hyped']);
  afterHype.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE'];
  assert.deepEqual(
    engine.eligibleArcBeatPool(deck, afterHype).map((entry) => entry.card.id),
    ['AGENT_03B_WILD'],
    'only the wild beat is eligible right after hype');

  const afterWild = agentsState(['empathy_demanded', 'patch_built', 'hyped', 'hype_consequence_seen', 'agents_positioned_ethical']);
  afterWild.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_03B_WILD'];
  assert.deepEqual(
    engine.eligibleArcBeatPool(deck, afterWild).map((entry) => entry.card.id),
    ['AGENT_04_LEAD'],
    'lead unlocks once the consequence is seen');
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
  state.currentCardId = 'AGENT_03B_WILD'; // resolving it leaves AGENT_04 as the only (gated) beat
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded', 'patch_built', 'hyped', 'payroll_seeded'];
  state.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE'];
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
  state.currentCardId = 'AGENT_03B_WILD';
  state.activeArc = 'agents';
  state.flags = ['empathy_demanded', 'patch_built', 'hyped', 'payroll_seeded'];
  state.shown = ['AGENT_01', 'AGENT_02_DEV', 'AGENT_03_HYPE'];
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
