const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../game.js');

function reason(effects) {
  return Object.fromEntries(Object.keys(effects || {}).map((key) => [key, `Reason for ${key}.`]));
}

function choice(label, effects = {}, extra = {}) {
  return { label, effects, effect_reason: reason(effects), ...extra };
}

function fixtureDeck() {
  return {
    meta: {
      startCard: 'start',
      maxTurns: 24,
      baseCashBurn: -1,
      maxPressureCards: 4,
      pressureAfterArcSteps: [1, 3, 5],
    },
    resources: {
      cash: { label: 'Cash', initial: 25, min: 0, max: 100 },
      team: { label: 'Team', initial: 60, min: 0, max: 100 },
      customers: { label: 'Customers', initial: 15, min: 0, max: 100 },
      founder: { label: 'Founder', initial: 65, min: 0, max: 100 },
    },
    sources: { '@bot': { name: '@bot', role: 'AI Assistant' } },
    cards: [
      {
        id: 'start', kind: 'opening', source: '@bot', text: 'Start.', opensPressureSlot: true,
        actor_action: 'Starts the run.', player_decision: 'Choose an arc.',
        choices: {
          left: choice('Agents', { cash: -4, founder: 5 }, { startArc: 'agents', next: 'agent_1' }),
          right: choice('Padel', { team: -5 }, { startArc: 'padel', next: 'padel_1' }),
        },
      },
      {
        id: 'agent_1', kind: 'story', arc: 'agents', arcStep: 1, source: '@bot', text: 'Agent one.',
        actor_action: 'Continues agents.', player_decision: 'Continue.',
        choices: {
          left: choice('Continue', { team: 5 }, { next: 'agent_2' }),
          right: choice('Switch', { founder: -5 }, { switchArc: 'padel', next: 'padel_1' }),
        },
      },
      {
        id: 'agent_2', kind: 'story', arc: 'agents', arcStep: 2, source: '@bot', text: 'Agent two.',
        actor_action: 'Offers payment.', player_decision: 'Take payment.',
        choices: {
          left: choice('Pay', { customers: 5 }, { paid: true, validationProof: true, ending: 'validation' }),
          right: choice('End', { founder: -5 }, { ending: 'no_proof' }),
        },
      },
      {
        id: 'padel_1', kind: 'story', arc: 'padel', arcStep: 1, source: '@bot', text: 'Padel one.',
        actor_action: 'Offers padel.', player_decision: 'Accept or leave.',
        choices: {
          left: choice('Play', { customers: 5 }, { next: 'agent_2' }),
          right: choice('Leave', { founder: -5 }, { switchArc: 'agents', next: 'agent_1' }),
        },
      },
      {
        id: 'pressure_a', kind: 'pressure', source: '@bot', text: 'Pressure A.', weight: 1,
        actor_action: 'Creates pressure.', player_decision: 'Respond.',
        choices: {
          left: choice('Left', { team: 2 }),
          right: choice('Right', { founder: -2 }),
        },
      },
      {
        id: 'pressure_b', kind: 'pressure', source: '@bot', text: 'Pressure B.', weight: 1,
        actor_action: 'Creates more pressure.', player_decision: 'Respond.',
        choices: {
          left: choice('Left', { team: -2 }),
          right: choice('Right', { founder: 2 }),
        },
      },
      {
        id: 'callback', kind: 'pressure', callbackOnly: true, source: '@bot', text: 'Callback.',
        actor_action: 'Returns a consequence.', player_decision: 'Respond.',
        choices: {
          left: choice('Fine', { customers: -5 }),
          right: choice('Worse', { team: -5 }),
        },
      },
    ],
    crises: {
      cash_low: { resource: 'cash', edge: 'low', source: '@bot', text: 'No cash.', rescueLabel: 'Rescue', giveupLabel: 'Quit', rebound: 15, damage: { team: -10, founder: -10 } },
      founder_high: { resource: 'founder', edge: 'high', source: '@bot', text: 'Messiah.', rescueLabel: 'Rescue', giveupLabel: 'Quit', rebound: 85, damage: { cash: -10, team: -10 } },
      freedom_sale: { resource: 'team', source: '@bot', text: 'Freedom sale scandal.', rescueLabel: 'Reframe it', giveupLabel: 'Own it', rebound: 15, damage: { cash: -8, founder: -10 } },
    },
    endings: {
      validation: { title: 'Paid.' }, no_proof: { title: 'No proof.' },
      cash_low: { title: 'Bankrupt.' }, founder_high: { title: 'Messiah.' },
      freedom_sale: { title: 'Slave trader.' },
    },
  };
}

test('starts with the four configured resources and no hidden ending timers', () => {
  const state = engine.startRun(fixtureDeck());
  assert.deepEqual(state.resources, { cash: 25, team: 60, customers: 15, founder: 65 });
  assert.equal(state.currentCardId, 'start');
  assert.equal(state.activeArc, null);
  assert.equal(state.queuedCardId, null);
  assert.equal(state.pressureCount, 0);
  assert.equal('pendingValidation' in state, false);
  assert.equal('pendingEnding' in state, false);
});

test('opens a pressure slot, queues the required story and resumes it after one pressure card', () => {
  const deck = fixtureDeck();
  let state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0 }).state;
  assert.equal(state.activeArc, 'agents');
  assert.equal(state.currentCardId, 'pressure_a');
  assert.equal(state.queuedCardId, 'agent_1');
  assert.equal(state.pressureCount, 1);

  state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'agent_1');
  assert.equal(state.queuedCardId, null);
});

test('never repeats a pressure card and never places two pressure cards consecutively', () => {
  const deck = fixtureDeck();
  let state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'pressure_a');
  state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'agent_1');
  state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'pressure_b');
  assert.deepEqual(state.shown.filter((id) => id.startsWith('pressure_')), ['pressure_a']);
});

test('a real refusal switches the active arc before the queued continuation is chosen', () => {
  const deck = fixtureDeck();
  const state = engine.startRun(deck);
  state.currentCardId = 'padel_1';
  state.activeArc = 'padel';
  const result = engine.resolveChoice(deck, state, 'right', { rng: () => 0.99 }).state;
  assert.equal(result.activeArc, 'agents');
  assert.equal(result.queuedCardId, 'agent_1');
  assert.match(result.currentCardId, /^pressure_/);
});

test('paid validation and narrative endings resolve immediately inside the resource corridor', () => {
  const deck = fixtureDeck();
  const paidState = engine.startRun(deck);
  paidState.currentCardId = 'agent_2';
  let result = engine.resolveChoice(deck, paidState, 'left', { rng: () => 0.5 }).state;
  assert.equal(result.gameOver, true);
  assert.equal(result.win, true);
  assert.equal(result.endingId, 'validation');

  const lossState = engine.startRun(deck);
  lossState.currentCardId = 'agent_2';
  result = engine.resolveChoice(deck, lossState, 'right', { rng: () => 0.5 }).state;
  assert.equal(result.gameOver, true);
  assert.equal(result.win, false);
  assert.equal(result.endingId, 'no_proof');
});

test('a resource crisis takes priority over a paid ending', () => {
  const deck = fixtureDeck();
  const state = engine.startRun(deck);
  state.currentCardId = 'agent_2';
  state.resources.cash = 1;
  const result = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(result.gameOver, false);
  assert.equal(result.activeCrisisId, 'cash_low');
  assert.deepEqual(result.postCrisisOutcome, { endingId: 'validation', win: true });
});

test('a choice can force a story crisis before its paid ending', () => {
  const deck = fixtureDeck();
  deck.cards.find((card) => card.id === 'agent_2').choices.left.crisis = 'freedom_sale';
  const state = engine.startRun(deck);
  state.currentCardId = 'agent_2';
  let result = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(result.gameOver, false);
  assert.equal(result.activeCrisisId, 'freedom_sale');
  assert.deepEqual(result.postCrisisOutcome, { endingId: 'validation', win: true });

  result = engine.resolveCrisis(deck, result, 'rescue', { rng: () => 0.34 }).state;
  assert.equal(result.gameOver, true);
  assert.equal(result.win, true);
  assert.equal(result.endingId, 'validation');
});

test('the first successful Last Chance resolves the interrupted ending', () => {
  const deck = fixtureDeck();
  const state = engine.startRun(deck);
  state.currentCardId = 'agent_2';
  state.resources.cash = 1;
  let result = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  result = engine.resolveCrisis(deck, result, 'rescue', { rng: () => 0.34 }).state;
  assert.equal(result.gameOver, true);
  assert.equal(result.win, true);
  assert.equal(result.endingId, 'validation');
});

test('keeps passive burn internal while reporting real resource deltas to the renderer', () => {
  const deck = fixtureDeck();
  deck.cards[0].opensPressureSlot = false;
  const result = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.5 });
  assert.deepEqual(result.deltas, { cash: -5, team: 0, customers: 0, founder: 5 });
  assert.deepEqual(engine.getAffectedResources(deck.cards[0].choices.left), ['cash', 'founder']);
});

test('ends without proof after the configured turn cap', () => {
  const deck = fixtureDeck();
  const state = engine.startRun(deck);
  state.turn = 24;
  state.currentCardId = 'pressure_a';
  const result = engine.resolveChoice(deck, state, 'left', { rng: () => 0.5 }).state;
  assert.equal(result.gameOver, true);
  assert.equal(result.endingId, 'no_proof');
});

test('forced continuation cannot be interrupted by an ambient pressure card', () => {
  const deck = fixtureDeck();
  deck.cards.find((card) => card.id === 'start').continuation = 'forced';
  deck.cards.filter((card) => card.kind === 'pressure').forEach((card) => {
    card.continuation = 'ambient';
    card.oncePerRun = true;
  });

  const state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'agent_1');
  assert.equal(state.queuedCardId, null);
  assert.equal(state.pressureCount, 0);
});

test('weighted continuation builds an eligible pool from story candidates and ambient cards', () => {
  assert.equal(typeof engine.buildEligiblePool, 'function');
  const deck = fixtureDeck();
  deck.cards.find((card) => card.id === 'agent_1').continuation = 'weighted';
  deck.cards.find((card) => card.id === 'pressure_a').continuation = 'ambient';
  const state = engine.startRun(deck);

  const pool = engine.buildEligiblePool(deck, state, {
    ids: ['agent_1', 'pressure_a'],
    modes: ['weighted', 'ambient'],
  });
  assert.deepEqual(pool.map((entry) => entry.card.id), ['agent_1', 'pressure_a']);
});

test('activeArc increases the effective weight of cards from its arc', () => {
  assert.equal(typeof engine.buildEligiblePool, 'function');
  const deck = fixtureDeck();
  const agent = deck.cards.find((card) => card.id === 'agent_1');
  const padel = deck.cards.find((card) => card.id === 'padel_1');
  agent.continuation = 'weighted';
  padel.continuation = 'weighted';
  agent.weight = 2;
  padel.weight = 2;
  const state = engine.startRun(deck);
  state.activeArc = 'agents';

  const pool = engine.buildEligiblePool(deck, state, {
    ids: ['agent_1', 'padel_1'],
    modes: ['weighted'],
  });
  const weights = Object.fromEntries(pool.map((entry) => [entry.card.id, entry.weight]));
  assert.ok(weights.agent_1 > weights.padel_1, `${JSON.stringify(weights)}`);
});

test('requires and excludes remove cards that contradict the current flags', () => {
  assert.equal(typeof engine.buildEligiblePool, 'function');
  const deck = fixtureDeck();
  const required = deck.cards.find((card) => card.id === 'pressure_a');
  const excluded = deck.cards.find((card) => card.id === 'pressure_b');
  required.continuation = 'ambient';
  required.requires = ['agents_public'];
  excluded.continuation = 'ambient';
  excluded.excludes = ['agents_public'];
  const state = engine.startRun(deck);
  state.flags = ['agents_public'];

  const pool = engine.buildEligiblePool(deck, state, {
    ids: ['pressure_a', 'pressure_b'],
    modes: ['ambient'],
  });
  assert.deepEqual(pool.map((entry) => entry.card.id), ['pressure_a']);
});

test('a shown once-per-run card is removed from the eligible pool', () => {
  assert.equal(typeof engine.buildEligiblePool, 'function');
  const deck = fixtureDeck();
  const ambient = deck.cards.find((card) => card.id === 'pressure_a');
  ambient.continuation = 'ambient';
  ambient.oncePerRun = true;
  const state = engine.startRun(deck);
  state.shown = ['pressure_a'];

  const pool = engine.buildEligiblePool(deck, state, {
    ids: ['pressure_a'],
    modes: ['ambient'],
  });
  assert.deepEqual(pool, []);
});

test('ambient cards cannot appear twice in a row', () => {
  assert.equal(typeof engine.buildEligiblePool, 'function');
  const deck = fixtureDeck();
  deck.cards.filter((card) => card.kind === 'pressure').forEach((card) => {
    card.continuation = 'ambient';
  });
  const state = engine.startRun(deck);
  state.currentCardId = 'pressure_a';
  state.history = [{ turn: 1, cardId: 'pressure_a', side: 'left', deltas: {} }];

  const pool = engine.buildEligiblePool(deck, state, {
    ids: ['pressure_b'],
    modes: ['ambient'],
  });
  assert.deepEqual(pool, []);
});

test('an empty weighted pool uses an eligible safe fallback instead of creating a dead end', () => {
  const deck = fixtureDeck();
  deck.meta.fallbackCard = 'padel_1';
  const start = deck.cards.find((card) => card.id === 'start');
  const target = deck.cards.find((card) => card.id === 'agent_1');
  start.continuation = 'weighted';
  start.opensPressureSlot = false;
  target.continuation = 'weighted';
  target.requires = ['missing_flag'];
  deck.cards.filter((card) => card.kind === 'pressure').forEach((card) => {
    card.continuation = 'ambient';
    card.requires = ['missing_flag'];
  });

  const state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0 }).state;
  assert.equal(state.gameOver, false);
  assert.equal(state.currentCardId, 'padel_1');
});

test('weighted ambient selection never queues an ineligible story target', () => {
  const deck = fixtureDeck();
  deck.meta.fallbackCard = 'padel_1';
  const start = deck.cards.find((card) => card.id === 'start');
  const target = deck.cards.find((card) => card.id === 'agent_1');
  const ambient = deck.cards.find((card) => card.id === 'pressure_a');
  start.continuation = 'weighted';
  start.opensPressureSlot = false;
  target.requires = ['missing_flag'];
  ambient.continuation = 'ambient';
  ambient.oncePerRun = true;
  deck.cards.find((card) => card.id === 'pressure_b').requires = ['missing_flag'];

  let state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.9 }).state;
  assert.equal(state.currentCardId, 'pressure_a');
  assert.equal(state.queuedCardId, 'padel_1');

  state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'padel_1');
});

test('a rescued crisis resumes a due callback before the weighted story continuation', () => {
  const deck = fixtureDeck();
  const weighted = deck.cards.find((card) => card.id === 'agent_1');
  weighted.continuation = 'weighted';
  const state = engine.startRun(deck);
  state.currentCardId = 'agent_1';
  state.resources.cash = 1;
  state.delayed = [{ card: 'callback', dueAfter: 0 }];

  let result = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(result.activeCrisisId, 'cash_low');

  result = engine.resolveCrisis(deck, result, 'rescue', { rng: () => 0 }).state;
  assert.equal(result.currentCardId, 'callback');
  assert.equal(result.queuedCardId, 'agent_2');
  assert.deepEqual(result.delayed, []);
});

test('weighted continuation evaluates every next candidate before using fallback', () => {
  const deck = fixtureDeck();
  const start = deck.cards.find((card) => card.id === 'start');
  start.continuation = 'weighted';
  start.opensPressureSlot = false;
  start.choices.left.next = ['agent_1', 'padel_1'];
  deck.cards.find((card) => card.id === 'agent_1').requires = ['missing_flag'];
  deck.cards.filter((card) => card.kind === 'pressure').forEach((card) => {
    card.requires = ['missing_flag'];
  });

  const state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0 }).state;
  assert.equal(state.gameOver, false);
  assert.equal(state.currentCardId, 'padel_1');
});

test('ambient flag changes revalidate a queued story before it resumes', () => {
  const deck = fixtureDeck();
  deck.meta.fallbackCard = 'padel_1';
  const start = deck.cards.find((card) => card.id === 'start');
  const story = deck.cards.find((card) => card.id === 'agent_1');
  const ambient = deck.cards.find((card) => card.id === 'pressure_a');
  start.continuation = 'weighted';
  start.opensPressureSlot = false;
  story.excludes = ['story_blocked'];
  ambient.continuation = 'ambient';
  ambient.choices.left.setFlags = ['story_blocked'];
  deck.cards.find((card) => card.id === 'pressure_b').requires = ['missing_flag'];

  let state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.9 }).state;
  assert.equal(state.currentCardId, 'pressure_a');
  assert.equal(state.queuedCardId, 'agent_1');

  state = engine.resolveChoice(deck, state, 'left', { rng: () => 0 }).state;
  assert.equal(state.currentCardId, 'padel_1');
});

test('resourceRange excludes cards below min or above max', () => {
  const deck = fixtureDeck();
  const ambient = deck.cards.find((card) => card.id === 'pressure_a');
  ambient.continuation = 'ambient';
  ambient.resourceRange = { cash: { min: 20, max: 40 } };
  const state = engine.startRun(deck);

  state.resources.cash = 19;
  assert.deepEqual(engine.buildEligiblePool(deck, state, { ids: ['pressure_a'] }), []);

  state.resources.cash = 41;
  assert.deepEqual(engine.buildEligiblePool(deck, state, { ids: ['pressure_a'] }), []);
});

test('resourceRange requires every configured resource condition to match', () => {
  const deck = fixtureDeck();
  const ambient = deck.cards.find((card) => card.id === 'pressure_a');
  ambient.continuation = 'ambient';
  ambient.resourceRange = {
    cash: { min: 20, max: 40 },
    founder: { min: 60 },
  };
  const state = engine.startRun(deck);
  state.resources.cash = 20;
  state.resources.founder = 59;

  const pool = engine.buildEligiblePool(deck, state, { ids: ['pressure_a'] });
  assert.deepEqual(pool, []);
});
