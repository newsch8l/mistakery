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

function startAuthorizedB3(queuedCardId = 'AGENT_01') {
  const state = stateAt('B3_SALES_PRESSURE_SEED');
  state.flags = ['sales_outreach_started'];
  state.queuedCardId = queuedCardId;
  state.queuedCardIds = [queuedCardId];
  state.queuedBoundary = { id: 'agents_entry_seed', before: 'OPEN_06', after: queuedCardId };
  return choose(state, 'left');
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

test('Publish one demo restores the direct shared Agents route', () => {
  const dev = card('AGENT_02_DEV');
  assert.equal(dev.choices.right.next, 'AGENT_03_HYPE');
  assert.deepEqual([dev.choices.right.setFlags].flat(), ['agents_public', 'patch_built']);
  assert.equal(dev.choices.right.effects.cash, undefined);

  let state = stateAt(dev.id);
  const visited = [];
  ['right', 'left', 'left', 'right'].forEach((side) => {
    visited.push(state.currentCardId);
    state = choose(state, side);
  });
  assert.deepEqual(visited, ['AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_04_LEAD', 'AGENT_05_ORDER']);
  assert.equal(state.currentCardId, 'AGENT_06_LEGAL');
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

test('B3 remains Agents-only, including after a Padel refusal switches to Agents', () => {
  const seed = card('B3_SALES_PRESSURE_SEED');
  assert.ok(engine.buildBoundaryPool(deck, b3EntryState(), 'agents_entry_seed').some((entry) => entry.card.id === seed.id));
  const padel = b3EntryState('PADEL_01');
  padel.activeArc = 'padel';
  assert.deepEqual(engine.buildBoundaryPool(deck, padel, 'agents_entry_seed'), []);
  const refused = choose(padel, 'right');
  assert.equal(refused.activeArc, 'agents');
  assert.equal(refused.currentCardId, seed.id);

  const acceptedThenRefused = b3EntryState('PADEL_01');
  acceptedThenRefused.activeArc = 'padel';
  const accepted = choose(acceptedThenRefused, 'left');
  const lateRefusal = choose(accepted, 'right');
  assert.equal(lateRefusal.activeArc, 'agents');
  assert.equal(lateRefusal.currentCardId, 'AGENT_01');
});

test('the named Agents entry boundary can insert B3 and preserve its exact story', () => {
  const result = engine.resolveChoice(deck, b3EntryState(), 'left', { rng: () => 0.999 }).state;
  assert.equal(result.currentCardId, 'B3_SALES_PRESSURE_SEED');
  assert.equal(result.queuedCardId, 'AGENT_01');
  assert.deepEqual(result.queuedCardIds, ['AGENT_01']);
});

test('B3 seed is withheld while another named callback is reserved', () => {
  const state = b3EntryState();
  state.reservations = [{ callbackId: 'DEV_HOSTAGE_CALLBACK', callbackSlot: 'agents_pre_serious_lead', remainingSpineSteps: 2 }];
  assert.deepEqual(engine.buildBoundaryPool(deck, state, 'agents_entry_seed'), []);
});

test('B3 cannot interrupt forced causal pairs or an earlier due callback', () => {
  let state = choose(stateAt('PADEL_01', 'padel'), 'left');
  assert.equal(state.currentCardId, 'PADEL_02');
  state = choose(stateAt('AGENT_02_DEV'), 'right');
  assert.equal(state.currentCardId, 'AGENT_03_HYPE');
  state = stateAt('AGENT_03_HYPE');
  state.flags = ['empathy_deployed', 'agents_public'];
  state.delayed = [{ card: 'PRESS_CAPITALISM', dueAfter: 0 }];
  state = choose(state, 'left');
  assert.equal(state.currentCardId, 'AGENT_04_LEAD');
  state = choose(state, 'left');
  assert.equal(state.currentCardId, 'AGENT_05_ORDER');
  state = choose(state, 'right');
  assert.equal(state.currentCardId, 'AGENT_06_LEGAL');
  state = choose(state, 'left');
  assert.equal(state.currentCardId, 'PRESS_CAPITALISM');
  assert.equal(state.queuedCardId, 'AGENT_07_INVOICE');
});

test('B3 stop excludes callback', () => {
  const state = stateAt('B3_SALES_PRESSURE_SEED');
  state.queuedCardId = 'AGENT_04_LEAD';
  state.queuedCardIds = ['AGENT_04_LEAD'];
  const result = choose(state, 'right');
  assert.equal(result.currentCardId, 'AGENT_04_LEAD');
  assert.ok(result.flags.includes('b3_contact_stopped'));
  assert.equal(result.delayed.some((entry) => entry.card === 'B3_PAID_OPTOUT_CALLBACK'), false);
});

test('B3 callback counts story decisions and ignores ambient cards', () => {
  let state = startAuthorizedB3();
  let reservation = state.reservations.find((entry) => entry.callbackId === 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(reservation.remainingSpineSteps, 3);
  state.currentCardId = 'PRESS_RIVAL';
  state.queuedCardId = 'AGENT_01';
  state.queuedCardIds = ['AGENT_01'];
  state = choose(state, 'right');
  reservation = state.reservations.find((entry) => entry.callbackId === 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(reservation.remainingSpineSteps, 3);
  state.pressureCount = deck.meta.maxPressureCards;
  state = choose(state, 'left');
  assert.equal(state.currentCardId, 'AGENT_02_DEV');
  state = choose(state, 'right');
  assert.equal(state.currentCardId, 'AGENT_03_HYPE');
  state = choose(state, 'left');
  assert.equal(state.currentCardId, 'B3_PAID_OPTOUT_CALLBACK');
  assert.equal(state.queuedCardId, 'AGENT_04_LEAD');
});

test('B3 free opt-out restores the exact queued story without Cash or Customers', () => {
  const callback = card('B3_PAID_OPTOUT_CALLBACK');
  assert.equal(callback.choices.right.effects.cash, undefined);
  assert.equal(callback.choices.right.effects.customers, undefined);
  const state = stateAt(callback.id);
  state.flags = ['b3_seed_seen', 'b3_followups_authorized', 'empathy_deployed'];
  state.queuedCardId = 'AGENT_06_LEGAL';
  state.queuedCardIds = ['AGENT_06_LEGAL'];
  const customers = state.resources.customers;
  const result = choose(state, 'right');
  assert.equal(result.currentCardId, 'AGENT_06_LEGAL');
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

test('crisis rescue preserves the pending B3 callback', () => {
  let state = startAuthorizedB3();
  state.resources.cash = 1;
  state = choose(state, 'left');
  assert.equal(state.activeCrisisId, 'cash_low');
  assert.ok(state.reservations.some((entry) => entry.callbackId === 'B3_PAID_OPTOUT_CALLBACK'));
  state = engine.resolveCrisis(deck, state, 'rescue', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'AGENT_02_DEV');
  assert.ok(state.reservations.some((entry) => entry.callbackId === 'B3_PAID_OPTOUT_CALLBACK'));
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

test('deterministic trace: Agents Deploy route', () => {
  const state = playDeterministic('AGENT_02_DEV', 'agents', {
    AGENT_02_DEV: 'left', AGENT_03_HYPE: 'left', AGENT_04_LEAD: 'left',
    AGENT_05_ORDER: 'right', PRESS_CAPITALISM: 'right',
    AGENT_06_LEGAL: 'left', AGENT_07_INVOICE: 'left',
  });
  const ids = state.history.map((entry) => entry.cardId);
  assert.ok(ids.includes('PRESS_CAPITALISM'));
  assert.equal(state.endingId, 'validation_agents');
});

test('deterministic trace: Agents Demo route', () => {
  const state = playDeterministic('AGENT_02_DEV', 'agents', {
    AGENT_02_DEV: 'right', AGENT_03_HYPE: 'left', AGENT_04_LEAD: 'left',
    AGENT_05_ORDER: 'right', AGENT_06_LEGAL: 'left', AGENT_07_INVOICE: 'left',
  });
  assert.deepEqual(state.history.slice(0, 4).map((entry) => entry.cardId), [
    'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_04_LEAD', 'AGENT_05_ORDER',
  ]);
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
