const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const deck = require('../cards.json');
const engine = require('../game.js');

const root = path.resolve(__dirname, '..');
const G2_IDS = [
  'G2_TRAINING_CHOICE',
  'AGENT_03_HYPE_TEAM',
  'AGENT_03_HYPE_NEUTRAL',
  'AGENT_06_LEGAL_TEAM',
  'AGENT_06_LEGAL_NEUTRAL',
];
const G2_FLAGS = [
  'controlled_demo_completed',
  'g2_team_training',
  'empathy_patch_ready',
  'agents_operational',
  'agents_carry_team_traits',
  'g2_neutral_training',
  'agents_have_empathy_limits',
  'team_side_by_side_public',
  'team_source_cropped',
  'neutral_clean_takes_public',
  'neutral_stress_test_public',
];

function card(id) {
  const result = engine.cardById(deck, id);
  assert.ok(result, `Missing card ${id}`);
  return result;
}

function stateAt(id, activeArc = 'agents') {
  const state = engine.startRun(deck);
  state.currentCardId = id;
  state.activeArc = activeArc;
  return state;
}

function choose(state, side, random = 0) {
  return engine.resolveChoice(deck, state, side, { rng: () => random }).state;
}

function b3EntryState(id = 'OPEN_06') {
  const state = stateAt(id);
  state.flags = ['sales_outreach_started'];
  state.resources = { cash: 15, team: 50, customers: 15, founder: 65 };
  state.schedulerResources = { ...state.resources };
  return state;
}


test('production deck contains no rejected G2 cards, flags or conditional data', () => {
  const ids = new Set(deck.cards.map((item) => item.id));
  G2_IDS.forEach((id) => assert.equal(ids.has(id), false, `Rejected production card ${id}`));
  const serialized = JSON.stringify(deck);
  G2_FLAGS.forEach((flag) => assert.equal(serialized.includes(flag), false, `Rejected production flag ${flag}`));
  deck.cards.forEach((item) => Object.values(item.choices).forEach((choice) => {
    assert.equal('conditional' in choice, false, `Conditional choice data remains on ${item.id}`);
  }));
});

test('G2-only engine and card-specific typography support are removed', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  assert.equal(game.includes('resolveConditionalChoice'), false);
  assert.equal(game.includes('choice.conditional'), false);
  assert.equal(app.includes('data-current-card'), false);
  assert.equal(app.includes('dataset.currentCard'), false);
  assert.equal(css.includes('data-current-card'), false);
  assert.equal(css.includes('G2_TRAINING_CHOICE'), false);
  assert.equal(css.includes('AGENT_06_LEGAL_NEUTRAL'), false);
});

test('approved checkpoint marks G2 rejected while keeping B3 approved', () => {
  const checkpoint = fs.readFileSync(path.join(root, 'MISTAKERY_CHECKPOINT_5_3_APPROVED_COPY.md'), 'utf8');
  assert.match(checkpoint, /G2 rejected after manual playtest/i);
  assert.match(checkpoint, /B3 remains approved/i);
});

test('generated artifacts contain B3 and no rejected G2 IDs', () => {
  const bundle = fs.readFileSync(path.join(root, 'cards.bundle.js'), 'utf8');
  const catalog = fs.readFileSync(path.join(root, 'MISTAKERY_CARDS_EN_RU.md'), 'utf8');
  for (const source of [bundle, catalog]) {
    assert.match(source, /B3_SALES_PRESSURE_SEED/);
    assert.match(source, /B3_PAID_OPTOUT_CALLBACK/);
    G2_IDS.forEach((id) => assert.equal(source.includes(id), false, `Generated artifact contains ${id}`));
  }
});

test('B3 cards keep the exact approved copy and once-per-run behavior', () => {
  const seed = card('B3_SALES_PRESSURE_SEED');
  const callback = card('B3_PAID_OPTOUT_CALLBACK');
  assert.equal(seed.text, 'Boss, your pitch deserved a reply.\nThey ignored four emails.\nLet me send three more.');
  assert.equal(seed.choices.left.label, 'Send three more');
  assert.equal(seed.choices.right.label, 'Leave them alone');
  assert.equal(callback.text, 'We closed their hatred 🎉\nThey’ll pay to never hear from us again.\nSay yes and this beautiful first invoice hits my commission.');
  assert.equal(callback.choices.left.label, 'Send invoice');
  assert.equal(callback.choices.right.label, 'Waive the fee');
  assert.equal(seed.oncePerRun, true);
  assert.equal(callback.oncePerRun, true);
});

test('B3 seed lives in the general pool, windowed before the virus; padel stays sealed structurally', () => {
  const seed = card('B3_SALES_PRESSURE_SEED');
  assert.equal(seed.activeArcs, undefined, 'no longer tied to the retired agents arc');
  assert.ok([seed.excludes].flat().includes('sadbot_hyped'), 'windowed to the pre-virus phase');
  const entry = b3EntryState();
  assert.equal(engine.buildEligiblePool(deck, entry, { ids: [seed.id], modes: ['sideStory'] }).length, 1);
  const late = b3EntryState();
  late.flags.push('sadbot_hyped');
  assert.equal(engine.buildEligiblePool(deck, late, { ids: [seed.id], modes: ['sideStory'] }).length, 0);
  // Mutual exclusion with padel is structural: every padel card continues by a
  // forced arrow (or ends the run), so no pool transition ever opens inside it.
  deck.cards.filter((c) => c.arc === 'padel').forEach((c) => {
    const forced = c.continuation === 'forced';
    const terminal = ['left', 'right'].every((side) => c.choices[side].ending || c.choices[side].next);
    assert.ok(forced || terminal, `${c.id} would open a pool transition inside padel`);
  });
});

test('B3 stop branch schedules no callback and leaves no pending flag', () => {
  const seed = card('B3_SALES_PRESSURE_SEED');
  assert.equal(seed.choices.right.delay, undefined, 'Leave them alone schedules nothing');
  assert.equal(seed.choices.right.reserveCallback, undefined);
  assert.ok(![seed.choices.right.setFlags].flat().includes('b3_followups_authorized'),
    'stop branch does not set the scheduling flag');
  assert.ok([seed.choices.right.setFlags].flat().includes('b3_contact_stopped'));
});

test('B3 authorized follow-up schedules the typed callback three story decisions out', () => {
  const seed = card('B3_SALES_PRESSURE_SEED');
  assert.equal(seed.choices.left.delay.card, 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(seed.choices.left.delay.storyDecisions, 3);
  // resolving the follow-up branch (with a queued story to resume to) schedules the delayed callback
  const state = stateAt(seed.id, null);
  state.flags = ['sales_outreach_started', 'sadbot_on'];
  state.queuedCardId = 'SADBOT_02_EVIDENCE';
  state.queuedCardIds = ['SADBOT_02_EVIDENCE'];
  state.queuedPool = true;
  state.queuedPoolMode = 'storylet';
  const result = choose(state, 'left');
  const pending = result.delayed.find((entry) => entry.card === 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(pending.remainingStoryDecisions, 3);
  assert.ok(result.flags.includes('b3_followups_authorized'));
});

test('B3 free opt-out restores the exact queued story without Cash or Customers', () => {
  const callback = card('B3_PAID_OPTOUT_CALLBACK');
  assert.equal(callback.choices.right.effects.cash, undefined);
  assert.equal(callback.choices.right.effects.customers, undefined);
  const state = stateAt(callback.id, null);
  state.flags = ['b3_seed_seen', 'b3_followups_authorized'];
  state.queuedCardId = 'SADBOT_06_LEGAL';
  state.queuedCardIds = ['SADBOT_06_LEGAL'];
  const customers = state.resources.customers;
  const result = choose(state, 'right');
  assert.equal(result.currentCardId, 'SADBOT_06_LEGAL');
  assert.equal(result.resources.customers, customers);
});

test('B3 paid opt-out is immediate payment without core validation', () => {
  const callback = card('B3_PAID_OPTOUT_CALLBACK');
  assert.equal(callback.choices.left.paid, true);
  assert.equal(callback.choices.left.validationProof, false);
  const state = stateAt(callback.id);
  state.resources.founder = 94;
  const cash = state.resources.cash;
  const result = choose(state, 'left');
  assert.equal(result.gameOver, true);
  assert.equal(result.win, false);
  assert.equal(result.endingId, 'paid_to_disappear');
  assert.ok(result.resources.cash > cash);
  assert.equal(result.activeCrisisId, null);
});

function playDeterministic(startId, activeArc, picks) {
  let state = stateAt(startId, activeArc);
  let safety = 0;
  while (!state.gameOver && safety < 40) {
    if (state.activeCrisisId) state = engine.resolveCrisis(deck, state, 'rescue', { rng: () => 0 }).state;
    else state = choose(state, picks[state.currentCardId] || 'right');
    safety += 1;
  }
  assert.ok(safety < 40, `${startId} trace did not terminate`);
  return state;
}

const SADBOT_BEAT_ORDER = [
  'SADBOT_01_SEED', 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL', 'SADBOT_INVESTOR_CLAIM',
  'SADBOT_04_LEAD', 'SADBOT_05_ORDER_CALL', 'SADBOT_05B_THEATER', 'SADBOT_06_LEGAL', 'SADBOT_07_INVOICE',
];

test('deterministic trace: SADBOT blackmail route reaches validation through the beats', () => {
  const state = playDeterministic('AGENT_01', null, {
    AGENT_01: 'left', SADBOT_01_SEED: 'left', SADBOT_02_EVIDENCE: 'left', SADBOT_03_VIRAL: 'left',
    SADBOT_INVESTOR_CLAIM: 'right', SADBOT_04_LEAD: 'left', SADBOT_05_ORDER_CALL: 'right',
    SADBOT_05B_THEATER: 'left', SADBOT_06_LEGAL: 'left', SADBOT_07_INVOICE: 'left',
  });
  const beats = state.history.map((entry) => entry.cardId).filter((id) => id.startsWith('SADBOT_'));
  assert.deepEqual(beats, SADBOT_BEAT_ORDER);
  assert.equal(state.endingId, 'validation_agents');
});

test('deterministic trace: the lie route pays through Friday and the full invoice', () => {
  const state = playDeterministic('AGENT_01', null, {
    AGENT_01: 'left', SADBOT_01_SEED: 'left', SADBOT_02_EVIDENCE: 'right', SADBOT_03_VIRAL: 'left',
    SADBOT_INVESTOR_CLAIM: 'right', SADBOT_04_LEAD: 'left', SADBOT_05_ORDER_CALL: 'left',
    SADBOT_FRIDAY: 'left', SADBOT_06_LEGAL: 'left', SADBOT_07_INVOICE: 'left',
  });
  const beats = state.history.map((entry) => entry.cardId).filter((id) => id.startsWith('SADBOT_'));
  assert.deepEqual(beats, [
    'SADBOT_01_SEED', 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL', 'SADBOT_INVESTOR_CLAIM',
    'SADBOT_04_LEAD', 'SADBOT_05_ORDER_CALL', 'SADBOT_FRIDAY', 'SADBOT_06_LEGAL', 'SADBOT_07_INVOICE',
  ]);
  assert.equal(state.endingId, 'validation_agents');
});

test('deterministic trace: a begged delay routes to the reduced invoice twin', () => {
  const state = playDeterministic('AGENT_01', null, {
    AGENT_01: 'left', SADBOT_01_SEED: 'left', SADBOT_02_EVIDENCE: 'right', SADBOT_03_VIRAL: 'left',
    SADBOT_INVESTOR_CLAIM: 'right', SADBOT_04_LEAD: 'left', SADBOT_05_ORDER_CALL: 'left',
    SADBOT_FRIDAY: 'right', SADBOT_06_LEGAL: 'left', SADBOT_07_INVOICE_CUT: 'left',
  });
  const ids = state.history.map((entry) => entry.cardId);
  assert.ok(ids.includes('SADBOT_07_INVOICE_CUT'), 'reduced invoice twin must be the target');
  assert.ok(!ids.includes('SADBOT_07_INVOICE'), 'full invoice must be ineligible after the slip');
  assert.equal(state.endingId, 'validation_agents');
});

test('deterministic trace: full Padel route', () => {
  const state = playDeterministic('PADEL_01', 'padel', {
    PADEL_01: 'left', PADEL_02: 'left', PADEL_03_TEAM: 'left',
    PADEL_04_CHOICE: 'right', PADEL_05_WIN: 'left', PADEL_06_PILOT: 'left',
  });
  assert.deepEqual(state.history.map((entry) => entry.cardId), [
    'PADEL_01', 'PADEL_02', 'PADEL_03_TEAM', 'PADEL_04_CHOICE', 'PADEL_05_WIN', 'PADEL_06_PILOT',
  ]);
  assert.equal(state.endingId, 'validation_padel');
});
