// Phase 4 — the general storylet pool.
//
// Until now the engine could only continue a story three ways: follow an
// explicit `next` arrow, take a beat of the ACTIVE ARC (`pool`), or drop an
// ambient card. There was no way to say "pick any storylet from the deck".
// That gap is why the game is a rail: the arc is the only thing that can
// carry a story, and the arc is entered by one hard-coded arrow from OPEN_06.
//
// `continuation: 'storylet'` adds the missing mode. It reuses the pool branch
// wholesale (ambient interleaving, callbacks, queueing) and changes exactly
// one thing: the story pool is every eligible card marked
// `storyletEntry: true`, deck-wide, regardless of `state.activeArc`.

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../game.js');

function reason(effects) {
  return Object.fromEntries(Object.keys(effects || {}).map((key) => [key, `Reason for ${key}.`]));
}

function choice(label, effects = {}, extra = {}) {
  return { label, effects, effect_reason: reason(effects), ...extra };
}

function leaf(id, extra = {}) {
  return {
    id,
    kind: 'story',
    source: '@bot',
    text: `${id} text.`,
    actor_action: 'Acts.',
    player_decision: 'Decide.',
    choices: { left: choice('Left', { team: 1 }), right: choice('Right', { team: -1 }) },
    ...extra,
  };
}

// start --(storylet)--> { soul_entry | padel_entry | gated_entry }
// hidden_beat is a story card with no storyletEntry marker: it belongs to a
// storylet's interior and must never be picked from the general pool.
function storyletDeck() {
  return {
    meta: {
      startCard: 'start',
      maxTurns: 24,
      baseCashBurn: -1,
      maxPressureCards: 4,
      pressureAfterArcSteps: [],
    },
    resources: {
      cash: { label: 'Cash', initial: 25, min: 0, max: 100 },
      team: { label: 'Team', initial: 60, min: 0, max: 100 },
      customers: { label: 'Customers', initial: 15, min: 0, max: 100 },
      founder: { label: 'Founder', initial: 65, min: 0, max: 100 },
    },
    sources: { '@bot': { name: '@bot', role: 'AI Assistant' } },
    crises: {},
    endings: { no_proof: { type: 'loss', title: 'NO PROOF', text: 'No proof.' } },
    cards: [
      {
        id: 'start',
        kind: 'opening',
        source: '@bot',
        text: 'Start.',
        continuation: 'storylet',
        actor_action: 'Starts the run.',
        player_decision: 'Continue.',
        choices: { left: choice('Left', { team: 1 }), right: choice('Right', { team: -1 }) },
      },
      leaf('soul_entry', { arc: 'agents', storyletEntry: true, continuation: 'storylet' }),
      leaf('padel_entry', { arc: 'padel', storyletEntry: true, continuation: 'storylet' }),
      leaf('gated_entry', { storyletEntry: true, continuation: 'storylet', requires: ['invited'] }),
      leaf('hidden_beat', { arc: 'agents' }),
    ],
  };
}

function pickedAfterStart(deck, rng) {
  return engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng }).state.currentCardId;
}

// Sweep the whole rng range so the assertion covers every branch of the
// weighted pick rather than whichever one a single seed happens to hit.
function reachableFromStart(deck) {
  const seen = new Set();
  for (let i = 0; i < 100; i += 1) {
    seen.add(pickedAfterStart(deck, () => i / 100));
  }
  return seen;
}

test('storylet mode picks entries deck-wide, across arcs, with no active arc', () => {
  const deck = storyletDeck();
  const reachable = reachableFromStart(deck);

  // The whole point: activeArc is null, yet storylets of BOTH arcs are live.
  // The old `pool` mode would have returned an empty pool here and ended the run.
  assert.ok(reachable.has('soul_entry'), `agents storylet unreachable: ${[...reachable]}`);
  assert.ok(reachable.has('padel_entry'), `padel storylet unreachable: ${[...reachable]}`);
  assert.ok(!reachable.has(undefined), 'run ended instead of picking a storylet');
});

test('storylet mode never picks a card that is not a storylet entry', () => {
  const deck = storyletDeck();
  const reachable = reachableFromStart(deck);
  assert.ok(!reachable.has('hidden_beat'), 'interior beat leaked into the general pool');
});

test('storylet mode respects eligibility of an entry', () => {
  const deck = storyletDeck();
  assert.ok(!reachableFromStart(deck).has('gated_entry'), 'gated entry picked without its flag');

  const state = engine.startRun(deck);
  state.flags.push('invited');
  const seen = new Set();
  for (let i = 0; i < 100; i += 1) {
    seen.add(engine.resolveChoice(deck, state, 'left', { rng: () => i / 100 }).state.currentCardId);
  }
  assert.ok(seen.has('gated_entry'), `gated entry still unreachable with its flag: ${[...seen]}`);
});

test('storylet mode ends the run honestly when no entry is eligible', () => {
  const deck = storyletDeck();
  // Strip every entry marker: the general pool is now empty by construction.
  deck.cards.forEach((card) => { delete card.storyletEntry; });
  const state = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.5 }).state;
  assert.equal(state.gameOver, true);
  assert.equal(state.endingId, 'no_proof');
});

test('an ambient card interrupts a storylet pick and the run resumes into a re-picked entry', () => {
  const deck = storyletDeck();
  deck.cards.push({
    id: 'ambient_a',
    kind: 'pressure',
    source: '@bot',
    text: 'Ambient.',
    continuation: 'ambient',
    weight: 500, // dominate the pick so the interruption is deterministic
    actor_action: 'Interrupts.',
    player_decision: 'Respond.',
    choices: { left: choice('Left', { team: 1 }), right: choice('Right', { team: -1 }) },
  });

  const afterStart = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.5 }).state;
  assert.equal(afterStart.currentCardId, 'ambient_a', 'ambient did not win the weighted pick');
  assert.ok(afterStart.queuedCardId, 'no storylet was queued behind the ambient card');

  const afterAmbient = engine.resolveChoice(deck, afterStart, 'left', { rng: () => 0.5 }).state;
  assert.ok(
    ['soul_entry', 'padel_entry'].includes(afterAmbient.currentCardId),
    `run did not resume into a storylet: ${afterAmbient.currentCardId}`,
  );
});

test('resume after an ambient card re-reads current state instead of a stale snapshot', () => {
  const deck = storyletDeck();
  // soul_entry is the only ordinary entry; gated_entry unlocks mid-flight.
  deck.cards = deck.cards.filter((card) => card.id !== 'padel_entry');
  deck.cards.push({
    id: 'ambient_unlock',
    kind: 'pressure',
    source: '@bot',
    text: 'Ambient unlock.',
    continuation: 'ambient',
    weight: 500,
    actor_action: 'Interrupts and unlocks.',
    player_decision: 'Respond.',
    choices: {
      left: choice('Unlock', { team: 1 }, { setFlags: ['invited'] }),
      right: choice('Right', { team: -1 }),
    },
  });
  // Remove soul_entry's eligibility once the ambient card fires, so the only
  // way to continue is an entry that did not exist in the snapshot.
  deck.cards.find((card) => card.id === 'soul_entry').excludes = ['invited'];

  const afterStart = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.5 }).state;
  assert.equal(afterStart.currentCardId, 'ambient_unlock');
  assert.equal(afterStart.queuedCardId, 'soul_entry', 'expected the stale snapshot to hold soul_entry');

  const afterAmbient = engine.resolveChoice(deck, afterStart, 'left', { rng: () => 0.5 }).state;
  assert.equal(
    afterAmbient.currentCardId,
    'gated_entry',
    'resume replayed the stale snapshot instead of rebuilding the pool from current flags',
  );
});

test('the arc-scoped pool mode stays arc-scoped (storylet mode did not leak into it)', () => {
  const deck = storyletDeck();
  deck.cards.find((card) => card.id === 'start').continuation = 'forced';
  deck.cards.find((card) => card.id === 'start').choices.left.next = 'soul_entry';
  const soul = deck.cards.find((card) => card.id === 'soul_entry');
  soul.continuation = 'pool';
  soul.arcBeat = true;
  deck.cards.find((card) => card.id === 'padel_entry').arcBeat = true;
  deck.cards.find((card) => card.id === 'gated_entry').arcBeat = true;

  // No startArc anywhere, so activeArc stays null and the ARC pool must be
  // empty — proving `pool` still filters on state.activeArc.
  const atSoul = engine.resolveChoice(deck, engine.startRun(deck), 'left', { rng: () => 0.5 }).state;
  assert.equal(atSoul.currentCardId, 'soul_entry');
  const after = engine.resolveChoice(deck, atSoul, 'left', { rng: () => 0.5 }).state;
  assert.equal(after.endingId, 'no_proof', 'arc pool picked a card despite no active arc');
});
