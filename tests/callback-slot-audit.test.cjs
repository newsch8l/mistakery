const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { auditDeck } = require('../.agents/skills/mistakery-reigns-scheduler/scripts/audit-callback-slots.cjs');
const { createFixtureDeck, collectAuditEvidence } = require('./fixtures/package-a-scheduler.fixture.cjs');

const root = path.resolve(__dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, '.agents/skills/mistakery-reigns-scheduler/references/mistakery-slot-policy.json'), 'utf8'));

function findingCodes(report) {
  return report.findings.map((finding) => finding.code);
}

test('policy declares the intentional Hype → Lead callback-only boundary', () => {
  assert.deepEqual(policy.callbackOnlyBoundaries, [{
    before: 'AGENT_03_HYPE', after: 'AGENT_04_LEAD', id: 'agents_pre_serious_lead',
  }]);
});

test('Hype → Lead is callback-only, not a protected pair', () => {
  assert.ok(!policy.protectedPairs.some(([before, after]) => before === 'AGENT_03_HYPE' && after === 'AGENT_04_LEAD'));
});

test('clean fixture slot audit has no findings from real engine evidence', () => {
  const deck = createFixtureDeck();
  const report = auditDeck(deck, policy, { reachability: collectAuditEvidence(require('../game.js')) });
  assert.deepEqual(report.findings, []);
});

test('audit rejects a seed, reaction, legacy or ambient role in a callback-only boundary', () => {
  const deck = createFixtureDeck();
  const seed = deck.cards.find((card) => card.id === 'PAYROLL_SEED');
  seed.scheduler.slot = 'agents_pre_serious_lead';
  const report = auditDeck(deck, policy);
  assert.ok(findingCodes(report).includes('disallowed-role-at-boundary'));
});

test('intentionally broken fixtures each produce their own slot-audit finding', () => {
  const deck = createFixtureDeck();
  const broken = (change) => {
    const copy = structuredClone(deck);
    change(copy);
    return findingCodes(auditDeck(copy, policy, { reachability: collectAuditEvidence(require('../game.js'), copy) }));
  };
  assert.ok(broken((copy) => {
    copy.cards.find((card) => card.id === 'PAYROLL_SEED').choices.left.reserveCallback.callbackSlot = 'missing_boundary';
  }).includes('reservation-without-reachable-callback-slot'));
  assert.ok(broken((copy) => {
    copy.meta.scheduler.boundaries.push({ id: 'bad_callback', before: 'AGENT_04_LEAD', after: 'AGENT_05_ORDER', roles: ['callback'] });
    copy.cards.find((card) => card.id === 'PAYROLL_SEED').choices.left.reserveCallback.callbackSlot = 'bad_callback';
  }).includes('callback-inside-protected-pair'));
  assert.ok(broken((copy) => {
    copy.cards.find((card) => card.id === 'MOM_FLYERS').arc = 'padel';
  }).includes('variable-slot-after-lock'));
  assert.ok(broken((copy) => {
    copy.cards.find((card) => card.id === 'DEV_SEED').requires = ['fixture_flag_that_no_real_opening_sets'];
  }).includes('eligibility-without-reachable-route'));
});
