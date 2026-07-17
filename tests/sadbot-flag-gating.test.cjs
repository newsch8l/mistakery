const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../game.js');
const deck = require('../cards.json');

// Phase 4 — the SADBOT client storylet is flag-gated: a beat cannot become
// eligible before the flag its causal predecessor sets. These tests preserve
// the engine contracts that were verified on the old agents arc (Codex rounds
// 2-4) and retarget them onto the storylet chain that replaced it.

function stateWith(flags, shown = []) {
  const state = engine.startRun(deck);
  state.flags = flags.slice();
  state.shown = shown.slice();
  return state;
}

function eligible(state, id) {
  return engine.buildEligiblePool(deck, state, { ids: [id] }).length === 1;
}

const CHAIN_SHOWN = ['AGENT_01', 'SADBOT_01_SEED'];

test('the evidence beat is not eligible before the seed is accepted', () => {
  assert.equal(eligible(stateWith([]), 'SADBOT_02_EVIDENCE'), false,
    'SADBOT_02_EVIDENCE must require sadbot_on');
});

test('the viral beat is not eligible before the evidence beat resolves', () => {
  assert.equal(eligible(stateWith(['sadbot_on']), 'SADBOT_03_VIRAL'), false,
    'SADBOT_03_VIRAL must require sadbot_stage2');
  assert.equal(eligible(stateWith(['sadbot_on', 'sadbot_stage2']), 'SADBOT_03_VIRAL'), true);
});

test('the lead is not eligible before the virus is ridden', () => {
  assert.equal(eligible(stateWith(['sadbot_on', 'sadbot_stage2']), 'SADBOT_04_LEAD'), false,
    'SADBOT_04_LEAD must require sadbot_hyped');
});

test('the storylet pool is causally exact at each stage of the chain', () => {
  const afterSeed = stateWith(['sadbot_on'], CHAIN_SHOWN);
  assert.deepEqual(
    engine.eligibleStoryletPool(deck, afterSeed).map((entry) => entry.card.id),
    ['SADBOT_02_EVIDENCE'],
    'after the seed only the evidence beat is live');

  const afterEvidence = stateWith(['sadbot_on', 'sadbot_stage2'], [...CHAIN_SHOWN, 'SADBOT_02_EVIDENCE']);
  assert.deepEqual(
    engine.eligibleStoryletPool(deck, afterEvidence).map((entry) => entry.card.id),
    ['SADBOT_03_VIRAL'],
    'after the evidence only the viral beat is live');

  const afterViral = stateWith(['sadbot_on', 'sadbot_stage2', 'sadbot_hyped'],
    [...CHAIN_SHOWN, 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL']);
  assert.deepEqual(
    engine.eligibleStoryletPool(deck, afterViral).map((entry) => entry.card.id),
    ['SADBOT_04_LEAD'],
    'after the virus only the lead is live (investor claim needs the old soul order)');
});

test('the investor claim needs both the virus and his old soul order, and dies with the consciousness', () => {
  const noOrder = stateWith(['sadbot_hyped'], CHAIN_SHOWN);
  assert.equal(eligible(noOrder, 'SADBOT_INVESTOR_CLAIM'), false, 'must require empathy_demanded');
  const withOrder = stateWith(['sadbot_hyped', 'empathy_demanded'], CHAIN_SHOWN);
  assert.equal(eligible(withOrder, 'SADBOT_INVESTOR_CLAIM'), true);
  const afterLobotomy = stateWith(['sadbot_hyped', 'empathy_demanded', 'consciousness_removed'], CHAIN_SHOWN);
  assert.equal(eligible(afterLobotomy, 'SADBOT_INVESTOR_CLAIM'), false, 'must exclude consciousness_removed');
});

// Codex round-3 finding 3: the typed-callback contract is enforced by the
// engine — a delay may only target a callbackOnly side-story.
test('deck validation rejects a delay target that is not a typed callbackOnly side-story', () => {
  const bad = JSON.parse(JSON.stringify(deck));
  const seed = bad.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_SEED');
  seed.choices.left.delay = { card: 'SADBOT_04_LEAD', storyDecisions: 2 }; // a story beat, not a callback
  const errors = engine.validateDeck(bad);
  assert.ok(errors.some((e) => /SADBOT_04_LEAD/.test(e) && /callbackOnly|callback/i.test(e)),
    'must flag a delay pointing at a non-typed card');
});

test('the canonical deck satisfies the typed-callback contract', () => {
  assert.deepEqual(engine.validateDeck(deck), [], 'canonical deck must validate clean');
});

// Codex round-2 finding 3: a storylet beat has no hardcoded next, so a crisis
// triggered by its choice must preserve the pool continuation.
test('a rescued crisis on a storylet beat resumes the storylet pool', () => {
  const state = stateWith(['sadbot_on'], CHAIN_SHOWN);
  state.currentCardId = 'SADBOT_02_EVIDENCE';
  state.resources = { cash: 1, team: 80, customers: 50, founder: 60 };
  const afterChoice = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterChoice.activeCrisisId, 'cash_low', 'setup: the beat choice must trigger a crisis');
  const rescued = engine.resolveCrisis(deck, afterChoice, 'rescue', { rng: () => 0.01 }).state;
  assert.equal(rescued.gameOver, false, 'a successful rescue must not end the run');
  assert.equal(rescued.currentCardId, 'SADBOT_03_VIRAL',
    'storylet continuation must survive the crisis and advance to the next gated beat');
});

// Codex round-3 finding 1: a crisis caused by a force-delivered callback must
// still resume the (storylet) pool afterwards.
test('a crisis caused by a force-delivered callback still resumes the storylet pool', () => {
  const state = stateWith(
    ['sadbot_on', 'sadbot_stage2', 'sadbot_hyped', 'payroll_seeded'],
    [...CHAIN_SHOWN, 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL'],
  );
  state.currentCardId = 'PAYROLL_RESTRICTED_AI_CALLBACK';
  state.queuedPool = true; // as set by force-delivery
  state.queuedPoolMode = 'storylet';
  state.resources = { cash: 60, team: 1, customers: 50, founder: 60 };
  const afterChoice = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterChoice.activeCrisisId, 'team_low', 'setup: the callback choice must trigger a crisis');
  const rescued = engine.resolveCrisis(deck, afterChoice, 'rescue', { rng: () => 0.01 }).state;
  assert.equal(rescued.gameOver, false, 'a successful rescue must not end the run');
  assert.equal(rescued.currentCardId, 'SADBOT_04_LEAD',
    'pool-origin resume must survive a crisis on the force-delivered callback');
});

// Package A migration invariants (Codex F2/F4/D), retargeted windows: the seeds
// are windowed to the pre-virus phase via sadbot_hyped.
test('migrated payroll uses a typed delayed callback windowed before the virus', () => {
  const seed = deck.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_SEED');
  const cb = deck.cards.find((c) => c.id === 'PAYROLL_RESTRICTED_AI_CALLBACK');
  for (const side of ['left', 'right']) {
    assert.equal(seed.choices[side].reserveCallback, undefined, `${side}: no reservation`);
    assert.equal(seed.choices[side].delay && seed.choices[side].delay.card, 'PAYROLL_RESTRICTED_AI_CALLBACK', `${side}: delayed callback`);
    assert.ok([seed.choices[side].setFlags].flat().includes('payroll_seeded'), `${side}: marks payroll_seeded`);
  }
  assert.ok([seed.excludes].flat().includes('sadbot_hyped'), 'seed windowed before the virus');
  assert.equal(seed.activeArcs, undefined, 'seed no longer tied to a dead arc');
  assert.equal(cb.callbackOnly, true, 'callback is callbackOnly (Codex F2)');
  assert.ok([cb.requires].flat().includes('payroll_seeded'), 'callback requires its causal flag (Codex F4)');
});

test('the payroll seed window closes at the virus and is open before it', () => {
  const late = stateWith(['payroll_unresolved', 'sadbot_on', 'sadbot_stage2', 'sadbot_hyped']);
  assert.equal(eligible(late, 'PAYROLL_RESTRICTED_AI_SEED'), false, 'not eligible after the virus');
  const early = stateWith(['payroll_unresolved']);
  early.resources = { cash: 15, team: 50, founder: 70, customers: 40 };
  assert.equal(eligible(early, 'PAYROLL_RESTRICTED_AI_SEED'), true, 'eligible in the early window');
});

test('migrated dev-hostage uses a typed delayed callback with a shared seed flag', () => {
  const seed = deck.cards.find((c) => c.id === 'DEV_HOSTAGE_SEED');
  const cb = deck.cards.find((c) => c.id === 'DEV_HOSTAGE_CALLBACK');
  for (const side of ['left', 'right']) {
    assert.equal(seed.choices[side].reserveCallback, undefined, `${side}: no reservation`);
    assert.equal(seed.choices[side].delay && seed.choices[side].delay.card, 'DEV_HOSTAGE_CALLBACK', `${side}: delayed callback`);
    assert.ok([seed.choices[side].setFlags].flat().includes('dev_hostage_seeded'), `${side}: shared seed flag`);
  }
  assert.ok([seed.excludes].flat().includes('sadbot_hyped'), 'seed windowed before the virus');
  assert.equal(seed.activeArcs, undefined, 'seed no longer tied to a dead arc');
  assert.equal(cb.callbackOnly, true, 'callback is callbackOnly');
  assert.ok([cb.requires].flat().includes('dev_hostage_seeded'), 'callback requires its causal flag');
});

test('migrated b3 schedules its callback only from the follow-up branch', () => {
  const seed = deck.cards.find((c) => c.id === 'B3_SALES_PRESSURE_SEED');
  const cb = deck.cards.find((c) => c.id === 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(seed.choices.left.delay && seed.choices.left.delay.card, 'B3_PAID_OPTOUT_CALLBACK', 'left: delayed callback');
  assert.equal(seed.choices.right.delay, undefined, 'right: no delay');
  assert.ok(![seed.choices.right.setFlags].flat().includes('b3_followups_authorized'), 'right does not set the scheduling flag');
  assert.ok([seed.excludes].flat().includes('sadbot_hyped'), 'seed windowed before the virus');
  assert.equal(seed.activeArcs, undefined, 'seed no longer tied to a dead arc');
  assert.equal(cb.activeArcs, undefined, 'callback no longer tied to a dead arc');
  assert.equal(cb.callbackOnly, true, 'callback is callbackOnly');
  assert.ok([cb.requires].flat().includes('b3_followups_authorized'), 'callback requires the scheduling-branch flag');
});

// Codex round-4 finding 3: deterministic delayed-callback lifecycle guarantees.
test('an ambient decision does not decrement a pending delay counter', () => {
  const state = stateWith(['payroll_seeded', 'sadbot_on'], CHAIN_SHOWN);
  state.currentCardId = 'PRESS_RIVAL'; // a pressure (ambient) card
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 3 }];
  state.queuedCardId = 'SADBOT_02_EVIDENCE';
  state.queuedCardIds = ['SADBOT_02_EVIDENCE'];
  state.queuedPool = true;
  state.queuedPoolMode = 'storylet';
  const after = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  const pending = after.delayed.find((entry) => entry.card === 'PAYROLL_RESTRICTED_AI_CALLBACK');
  assert.equal(pending.remainingStoryDecisions, 3, 'only story decisions decrement the counter, not ambient cards');
});

test('a pending delayed callback survives an unrelated successful crisis', () => {
  const state = stateWith(['sadbot_on', 'payroll_seeded'], CHAIN_SHOWN);
  state.currentCardId = 'SADBOT_02_EVIDENCE';
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 3 }];
  state.resources = { cash: 1, team: 80, customers: 50, founder: 60 };
  const afterChoice = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(afterChoice.activeCrisisId, 'cash_low', 'setup: the beat triggers an unrelated crisis');
  assert.ok(afterChoice.delayed.some((entry) => entry.card === 'PAYROLL_RESTRICTED_AI_CALLBACK'), 'crisis keeps the pending callback');
  const rescued = engine.resolveCrisis(deck, afterChoice, 'rescue', { rng: () => 0.01 }).state;
  assert.ok(rescued.delayed.some((entry) => entry.card === 'PAYROLL_RESTRICTED_AI_CALLBACK'), 'a successful rescue preserves it');
});

// Glue-entry gating (Codex F1): the client conversation must not begin while a
// side-story callback is still pending — debts resolve before the deal.
test('the lead is blocked while any callback is pending', () => {
  const state = stateWith(['sadbot_on', 'sadbot_stage2', 'sadbot_hyped'],
    [...CHAIN_SHOWN, 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL']);
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 2 }];
  const ids = engine.eligibleStoryletPool(deck, state).map((entry) => entry.card.id);
  assert.ok(!ids.includes('SADBOT_04_LEAD'), 'SADBOT_04_LEAD must exclude pending callbacks');
});

// Anti-deadlock: if the storylet pool is empty only because the lead is waiting
// on a pending callback, force-deliver that callback instead of ending the run.
test('a stuck storylet pool with a pending callback delivers it, then resumes to the lead', () => {
  const state = stateWith(['sadbot_on', 'sadbot_stage2', 'payroll_seeded'],
    [...CHAIN_SHOWN, 'SADBOT_02_EVIDENCE']);
  state.currentCardId = 'SADBOT_03_VIRAL';
  state.resources = { cash: 60, team: 80, customers: 50, founder: 60 };
  state.delayed = [{ card: 'PAYROLL_RESTRICTED_AI_CALLBACK', remainingStoryDecisions: 3 }];
  state.pressureCount = deck.meta.maxPressureCards;
  const s1 = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(s1.gameOver, false, 'must not end while a callback is pending');
  assert.equal(s1.currentCardId, 'PAYROLL_RESTRICTED_AI_CALLBACK', 'stuck pool must force-deliver the pending callback');
  const s2 = engine.resolveChoice(deck, s1, 'left', { rng: () => 0.5 }).state;
  assert.equal(s2.gameOver, false, 'resolving the callback must not end the run');
  assert.equal(s2.currentCardId, 'SADBOT_04_LEAD',
    'the chain must resume to the lead once the callback clears the pending gate');
});

// A storylet beat has no hardcoded next; the engine advances through the pool.
test('a storylet beat advances to the next gated beat through the pool', () => {
  const state = stateWith(['sadbot_on'], CHAIN_SHOWN);
  state.currentCardId = 'SADBOT_02_EVIDENCE';
  state.pressureCount = deck.meta.maxPressureCards; // suppress ambient for determinism
  const res = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 });
  assert.equal(res.state.currentCardId, 'SADBOT_03_VIRAL',
    'the evidence beat must advance to the virus via the pool, not a hardcoded next');
});
