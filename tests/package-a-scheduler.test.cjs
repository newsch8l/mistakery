const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../game.js');
const {
  createFixtureDeck, openingTraces, agentPoolForTrace, runSeededSimulation, drive,
} = require('./fixtures/package-a-scheduler.fixture.cjs');

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

test('fixture plays all 32 actual canonical OPEN_01–OPEN_05 routes', () => {
  const traces = openingTraces(engine);
  assert.equal(traces.length, 32);
  const paths = new Set(traces.map((trace) => trace.id));
  assert.equal(paths.size, 32);
  traces.forEach((trace) => {
    assert.deepEqual(trace.openingCards.slice(0, 2), ['OPEN_01', 'OPEN_02']);
    assert.ok(['OPEN_03_AUDIT', 'OPEN_03_INVOICES'].includes(trace.openingCards[2]));
    assert.deepEqual(trace.openingCards.slice(3), ['OPEN_04', 'OPEN_05']);
  });
});

test('actual opening traces produce the approved Package A eligibility and overlap matrix', () => {
  const traces = openingTraces(engine);
  const pools = traces.map((trace) => agentPoolForTrace(engine, trace).cardIds);
  const eligible = (id) => pools.filter((pool) => pool.includes(id));
  const payroll = eligible('PAYROLL_SEED');
  const dev = eligible('DEV_SEED');
  const b3 = eligible('B3_SEED');
  const health = traces.filter((trace) => trace.events.some((event) => event.boundaryId === 'opening_shared_seed' && event.cardIds.includes('MVI_SEED')));
  assert.equal(health.length, 16);
  assert.equal(payroll.length, 16);
  assert.equal(dev.length, 16);
  assert.equal(b3.length, 8);
  assert.equal(pools.filter((pool) => pool.some((id) => ['PAYROLL_SEED', 'DEV_SEED', 'B3_SEED'].includes(id))).length, 20);
  assert.equal(pools.filter((pool) => pool.includes('PAYROLL_SEED') && pool.includes('B3_SEED')).length, 4);
  assert.equal(pools.filter((pool) => !pool.includes('PAYROLL_SEED') && pool.includes('B3_SEED')).length, 4);
});

test('callback-only Hype → Lead inserts only a due callback and resumes the protected Lead → Order → Legal spine', () => {
  const deck = createFixtureDeck();
  const result = drive(engine, deck, {
    bits: ['left', 'left', 'left', 'right', 'right'],
    rng: () => 0,
    open06Side: 'left',
    fixtureSide: 'left',
  });
  const history = result.history;
  const callback = history.indexOf('PAYROLL_CALLBACK');
  assert.ok(callback >= 0);
  assert.deepEqual(history.slice(callback, callback + 4), ['PAYROLL_CALLBACK', 'AGENT_04_LEAD', 'AGENT_05_ORDER', 'AGENT_06_LEGAL']);
  assert.ok(!history.includes('MOM_FLYERS') || !history.includes('MVI_CALLBACK'));
});

test('accepted Padel locks variable content; refusal switches to Agents before its entry boundary', () => {
  const deck = createFixtureDeck();
  const accepted = drive(engine, deck, {
    bits: ['left', 'left', 'left', 'left', 'left'], rng: () => 0, open06Side: 'right', padelSide: 'left', fixtureSide: 'left',
  });
  const acceptedPadel = accepted.history.indexOf('PADEL_01');
  assert.ok(acceptedPadel >= 0);
  assert.ok(!accepted.history.slice(acceptedPadel + 1).some((id) => /^(PAYROLL|DEV|B3)_/.test(id)));

  const refused = drive(engine, deck, {
    bits: ['left', 'left', 'left', 'left', 'right'], rng: () => 0, open06Side: 'right', padelSide: 'right', fixtureSide: 'left',
  });
  assert.ok(refused.history.includes('PADEL_01'));
  assert.ok(refused.history.some((id) => ['PAYROLL_SEED', 'DEV_SEED', 'B3_SEED'].includes(id)));
});

test('10,000 seeded runs measure natural scheduler selection and satisfy checkpoint gates', () => {
  const report = runSeededSimulation(engine, { runs: 10000, seed: 0x12345678 });
  assert.ok(report.directAgents > 0);
  assert.ok(report.zeroPackageA / report.directAgents <= 0.1);
  assert.ok(median(report.nonLegacy) >= 3);
  assert.ok(report.selection.momInvestor > report.selection.coma);
  const withinStatisticalTolerance = (actual, expected, sampleSize) => {
    const fourSigma = 4 * Math.sqrt(expected * (1 - expected) / sampleSize);
    return Math.abs(actual - expected) <= Math.max(0.02, fourSigma);
  };
  const payrollDev = report.poolComposition.payrollDev;
  const payrollDevB3 = report.poolComposition.payrollDevB3;
  assert.ok(withinStatisticalTolerance(payrollDev.selection.payroll / payrollDev.windows, 3 / 5, payrollDev.windows));
  assert.ok(withinStatisticalTolerance(payrollDev.selection.dev / payrollDev.windows, 2 / 5, payrollDev.windows));
  assert.ok(withinStatisticalTolerance(payrollDevB3.selection.payroll / payrollDevB3.windows, 3 / 6, payrollDevB3.windows));
  assert.ok(withinStatisticalTolerance(payrollDevB3.selection.dev / payrollDevB3.windows, 2 / 6, payrollDevB3.windows));
  assert.ok(withinStatisticalTolerance(payrollDevB3.selection.b3 / payrollDevB3.windows, 1 / 6, payrollDevB3.windows));
  assert.equal(report.poolComposition.b3Only.selection.b3, report.poolComposition.b3Only.windows);
  assert.equal(report.callbackLoss, 0);
  assert.equal(report.protectedPairViolations, 0);
  assert.equal(report.postPadelInsertions, 0);
  assert.equal(report.mutexViolations, 0);
  if (process.env.PACKAGE_A_REPORT === '1') process.stdout.write(`${JSON.stringify({
    realOpeningTraces: 32,
    directAgents: report.directAgents,
    zeroPackageARate: report.zeroPackageA / report.directAgents,
    eligibility: report.eligible,
    selection: report.selection,
    callbackExpected: report.callbackExpected,
    callbacks: report.callbacks,
    poolComposition: report.poolComposition,
    medians: { packageA: median(report.packageA), b3: median(report.b3), legacy: median(report.legacy), nonLegacy: median(report.nonLegacy), total: median(report.total) },
    gates: { callbackLoss: report.callbackLoss, protectedPairViolations: report.protectedPairViolations, postPadelInsertions: report.postPadelInsertions, mutexViolations: report.mutexViolations },
    combinations: report.combinations,
  })}\n`);
});
