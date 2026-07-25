const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { auditDeck } = require('../scripts/audit-callback-slots.cjs');

const root = path.resolve(__dirname, '../../../..');
const deck = require(path.join(root, 'cards.json'));
const policy = require('../references/mistakery-slot-policy.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('production callbacks and locks have no slot-policy findings', () => {
  const report = auditDeck(deck, policy);
  assert.deepEqual(report.findings, []);
});

test('reports a delayed callback that lands inside a protected Agents pair', () => {
  const broken = clone(deck);
  broken.cards.find((card) => card.id === 'AGENT_05_ORDER').opensPressureSlot = true;
  const report = auditDeck(broken, policy);
  const finding = report.findings.find((item) => item.code === 'callback-inside-protected-pair'
    && item.callbackId === 'PRESS_CAPITALISM');

  assert.ok(finding, JSON.stringify(report.findings, null, 2));
  assert.equal(finding.before, 'AGENT_05_ORDER');
  assert.equal(finding.after, 'AGENT_06_LEGAL');
  assert.equal(report.findings.filter((item) => item.code === 'callback-inside-protected-pair'
    && item.callbackId === 'PRESS_CAPITALISM').length, 1);
});

test('reports a variable slot after the Padel lock begins', () => {
  const broken = clone(deck);
  broken.cards.find((card) => card.id === 'PADEL_03_TEAM').opensPressureSlot = true;
  const report = auditDeck(broken, policy);
  const finding = report.findings.find((item) => item.code === 'variable-slot-after-lock'
    && item.cardId === 'PADEL_03_TEAM');

  assert.ok(finding, JSON.stringify(report.findings, null, 2));
  assert.equal(finding.lockCardId, 'PADEL_01');
});
