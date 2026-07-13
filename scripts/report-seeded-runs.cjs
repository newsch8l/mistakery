const fs = require('node:fs');
const path = require('node:path');
const deck = require('../cards.json');
const engine = require('../game.js');

const runCount = Number(process.argv[2] || 10000);

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const totals = {
  decisions: 0,
  maxDecisions: 0,
  wins: 0,
  seedShown: 0,
  callbackShown: 0,
  followupsAuthorized: 0,
  callbacksLost: 0,
  stoppedAtSeed: 0,
  paidToDisappear: 0,
  b3EligibleRuns: 0,
};
const endings = {};
const lostCallbackEndings = {};
const routeCohorts = { agentsEver: 0, padelEver: 0, agentsOnly: 0, padelOnly: 0, switchedPadelToAgents: 0 };

for (let seed = 1; seed <= runCount; seed += 1) {
  const rng = seeded(seed);
  let state = engine.startRun(deck, { seed });
  let safety = 0;
  let b3Eligible = false;
  while (!state.gameOver && safety < 60) {
    if (state.activeCrisisId) {
      state = engine.resolveCrisis(deck, state, 'rescue', { rng }).state;
    } else {
      const currentId = state.currentCardId;
      const hadDelayedCallback = state.delayed.length > 0;
      state = engine.resolveChoice(deck, state, rng() < 0.5 ? 'left' : 'right', { rng }).state;
      if (currentId === 'AGENT_03_HYPE' && !hadDelayedCallback && !state.activeCrisisId && !state.gameOver) b3Eligible = true;
    }
    safety += 1;
  }
  if (!state.gameOver || safety >= 60) throw new Error(`Seed ${seed} did not terminate`);
  const ids = state.history.map((entry) => entry.cardId);
  const seedEntry = state.history.find((entry) => entry.cardId === 'B3_SALES_PRESSURE_SEED');
  const seedShown = Boolean(seedEntry);
  const callbackShown = ids.includes('B3_PAID_OPTOUT_CALLBACK');
  const authorized = seedEntry?.side === 'left';
  totals.decisions += state.history.length;
  totals.maxDecisions = Math.max(totals.maxDecisions, state.history.length);
  totals.wins += Number(state.win);
  totals.seedShown += Number(seedShown);
  totals.callbackShown += Number(callbackShown);
  totals.followupsAuthorized += Number(authorized);
  totals.stoppedAtSeed += Number(seedEntry?.side === 'right');
  totals.paidToDisappear += Number(state.endingId === 'paid_to_disappear');
  totals.b3EligibleRuns += Number(b3Eligible);
  endings[state.endingId] = (endings[state.endingId] || 0) + 1;
  if (authorized && !callbackShown) {
    totals.callbacksLost += 1;
    lostCallbackEndings[state.endingId] = (lostCallbackEndings[state.endingId] || 0) + 1;
  }
  const agents = ids.includes('AGENT_01');
  const padel = ids.includes('PADEL_01');
  routeCohorts.agentsEver += Number(agents);
  routeCohorts.padelEver += Number(padel);
  routeCohorts.agentsOnly += Number(agents && !padel);
  routeCohorts.padelOnly += Number(padel && !agents);
  routeCohorts.switchedPadelToAgents += Number(agents && padel);
}

const percent = (count, denominator = runCount) => Number((count * 100 / denominator).toFixed(2));
const root = path.resolve(__dirname, '..');
const generated = [
  fs.readFileSync(path.join(root, 'cards.bundle.js'), 'utf8'),
  fs.readFileSync(path.join(root, 'MISTAKERY_CARDS_EN_RU.md'), 'utf8'),
].join('\n');
const rejectedIds = [
  'G2_TRAINING_CHOICE', 'AGENT_03_HYPE_TEAM', 'AGENT_03_HYPE_NEUTRAL',
  'AGENT_06_LEGAL_TEAM', 'AGENT_06_LEGAL_NEUTRAL',
];

console.log(JSON.stringify({
  runs: runCount,
  b3: {
    seedShown: totals.seedShown,
    seedFrequencyPct: percent(totals.seedShown),
    eligibleAgentsSafeSlotRuns: totals.b3EligibleRuns,
    seedFrequencyPctOfEligibleAgentsRuns: totals.b3EligibleRuns ? percent(totals.seedShown, totals.b3EligibleRuns) : 0,
    stoppedAtSeed: totals.stoppedAtSeed,
    followupsAuthorized: totals.followupsAuthorized,
    callbackShown: totals.callbackShown,
    callbackFrequencyPct: percent(totals.callbackShown),
    callbackResolutionPctOfAuthorized: totals.followupsAuthorized ? percent(totals.callbackShown, totals.followupsAuthorized) : 0,
    callbacksLost: totals.callbacksLost,
    lostCallbackEndings,
    paidToDisappear: totals.paidToDisappear,
  },
  runLength: {
    averageDecisions: Number((totals.decisions / runCount).toFixed(3)),
    maxDecisions: totals.maxDecisions,
  },
  wins: {
    count: totals.wins,
    ratePct: percent(totals.wins),
  },
  routeCohorts,
  endingDistribution: Object.fromEntries(Object.entries(endings).sort(([a], [b]) => a.localeCompare(b))),
  rejectedG2IdsInCanonicalDeck: rejectedIds.filter((id) => deck.cards.some((card) => card.id === id)),
  rejectedG2IdsInGeneratedArtifacts: rejectedIds.filter((id) => generated.includes(id)),
}, null, 2));
