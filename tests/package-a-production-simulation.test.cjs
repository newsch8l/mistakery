const test = require('node:test');
const assert = require('node:assert/strict');
const deck = require('../cards.json');
const engine = require('../game.js');

const PACKAGE_A_IDS = new Set([
  'PAYROLL_RESTRICTED_AI_SEED', 'PAYROLL_RESTRICTED_AI_CALLBACK', 'DEV_HOSTAGE_SEED', 'DEV_HOSTAGE_CALLBACK',
  'MOM_INVESTOR_SEED', 'MOM_INVESTOR_CALLBACK', 'COMA_SEED',
  'COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED', 'MOM_FLYERS',
]);
const B3_IDS = new Set(['B3_SALES_PRESSURE_SEED', 'B3_PAID_OPTOUT_CALLBACK']);

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function simulate(runs = 10000) {
  const report = {
    runs, directAgents: 0, zeroPackageA: 0, callbackLoss: 0, protectedPairViolations: 0,
    postAcceptedPadelInsertions: 0, healthMutexViolations: 0,
    packageA: [], b3: [], nonLegacy: [], total: [],
    shown: Object.fromEntries([...PACKAGE_A_IDS].map((id) => [id, 0])),
    endings: {},
  };
  for (let seed = 1; seed <= runs; seed += 1) {
    const rng = seeded(seed ^ 0x5f3759df);
    let state = engine.startRun(deck, { seed });
    let safety = 0;
    while (!state.gameOver && safety < 100) {
      if (state.activeCrisisId) {
        state = engine.resolveCrisis(deck, state, 'rescue', { rng }).state;
      } else {
        state = engine.resolveChoice(deck, state, rng() < 0.5 ? 'left' : 'right', { rng }).state;
      }
      safety += 1;
    }
    assert.ok(state.gameOver, `Seed ${seed} did not terminate at ${state.currentCardId}`);
    const ids = state.history.map((entry) => entry.cardId);
    const entries = new Map(state.history.map((entry) => [entry.cardId, entry]));
    PACKAGE_A_IDS.forEach((id) => { if (ids.includes(id)) report.shown[id] += 1; });
    const packageCount = ids.filter((id) => PACKAGE_A_IDS.has(id)).length;
    const b3Count = ids.filter((id) => B3_IDS.has(id)).length;
    const open06 = entries.get('OPEN_06');
    if (open06?.side === 'left') {
      report.directAgents += 1;
      report.zeroPackageA += Number(packageCount === 0);
      report.packageA.push(packageCount);
      report.b3.push(b3Count);
      report.nonLegacy.push(packageCount + b3Count);
      report.total.push(packageCount + b3Count + ids.filter((id) => id.startsWith('PRESS_')).length);
    }
    const callbackPairs = [
      ['PAYROLL_RESTRICTED_AI_SEED', ['PAYROLL_RESTRICTED_AI_CALLBACK'], 'AGENT_04_LEAD'],
      ['DEV_HOSTAGE_SEED', ['DEV_HOSTAGE_CALLBACK'], 'AGENT_04_LEAD'],
      ['MOM_INVESTOR_SEED', ['MOM_INVESTOR_CALLBACK'], 'OPEN_06'],
      ['COMA_SEED', ['COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED'], 'OPEN_06'],
    ];
    callbackPairs.forEach(([seedId, callbacks, horizon]) => {
      if (ids.includes(seedId) && ids.includes(horizon) && !callbacks.some((id) => ids.includes(id))) report.callbackLoss += 1;
    });
    const b3 = entries.get('B3_SALES_PRESSURE_SEED');
    if (b3?.side === 'left' && ids.includes('AGENT_04_LEAD') && !ids.includes('B3_PAID_OPTOUT_CALLBACK')) report.callbackLoss += 1;
    const lead = ids.indexOf('AGENT_04_LEAD');
    const protectedSpine = ['AGENT_04_LEAD', 'AGENT_05_ORDER', 'AGENT_06_LEGAL'];
    const observedSpine = lead >= 0 ? ids.slice(lead, lead + protectedSpine.length) : [];
    if (lead >= 0 && observedSpine.some((id, index) => id !== protectedSpine[index])) report.protectedPairViolations += 1;
    const padel = entries.get('PADEL_01');
    const stayedPadel = padel?.side === 'left' && !ids.includes('AGENT_01');
    const padelIndex = ids.indexOf('PADEL_01');
    if (stayedPadel && ids.slice(padelIndex + 1).some((id) => PACKAGE_A_IDS.has(id) || B3_IDS.has(id) || id.startsWith('PRESS_'))) {
      report.postAcceptedPadelInsertions += 1;
    }
    const healthSeeds = Number(ids.includes('MOM_INVESTOR_SEED')) + Number(ids.includes('COMA_SEED'));
    if (healthSeeds > 1 || (ids.includes('MOM_FLYERS') && healthSeeds > 0)) report.healthMutexViolations += 1;
    report.endings[state.endingId] = (report.endings[state.endingId] || 0) + 1;
  }
  return report;
}

test('10,000 production seeded runs keep Package A callbacks, locks and variable-card gates intact', () => {
  const report = simulate(10000);
  assert.ok(report.directAgents > 0);
  // Calmer pool-weighted model: never empty (measured zero-rate 0), median 2.
  assert.equal(report.zeroPackageA, 0, 'every direct-Agents run should still get at least one Package A side story');
  assert.ok(median(report.nonLegacy) >= 2, `side-story richness dropped below the calmer floor: ${median(report.nonLegacy)}`);
  assert.equal(report.callbackLoss, 0);
  assert.equal(report.protectedPairViolations, 0);
  assert.equal(report.postAcceptedPadelInsertions, 0);
  assert.equal(report.healthMutexViolations, 0);
  Object.entries(report.shown).forEach(([id, count]) => assert.ok(count > 0, `${id} never appeared`));
  if (process.env.PACKAGE_A_PRODUCTION_REPORT === '1') {
    process.stdout.write(`${JSON.stringify({
      runs: report.runs,
      directAgents: report.directAgents,
      directAgentsZeroPackageAPct: Number((report.zeroPackageA * 100 / report.directAgents).toFixed(2)),
      medians: {
        packageA: median(report.packageA), b3: median(report.b3),
        nonLegacy: median(report.nonLegacy), total: median(report.total),
      },
      shown: report.shown,
      gates: {
        callbackLoss: report.callbackLoss, protectedPairViolations: report.protectedPairViolations,
        postAcceptedPadelInsertions: report.postAcceptedPadelInsertions,
        healthMutexViolations: report.healthMutexViolations,
      },
      endings: report.endings,
    }, null, 2)}\n`);
  }
});
