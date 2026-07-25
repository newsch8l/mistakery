const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { auditDeck } = require('../scripts/audit-deck.cjs');

const brokenDeck = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'broken-deck.json'), 'utf8'));
const productionDeck = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../cards.json'), 'utf8'));

test('reports structural failures and choice warnings from a malformed deck', () => {
  const report = auditDeck(brokenDeck);
  const codes = report.findings.map((finding) => finding.code);

  assert.ok(codes.includes('duplicate-card-id'));
  assert.ok(codes.includes('unknown-source'));
  assert.ok(codes.includes('missing-next-target'));
  assert.ok(codes.includes('same-next-without-persistent-difference'));
  assert.ok(codes.includes('unused-flag'));
  assert.ok(codes.includes('pressure-after-pressure'));
});

test('does not mutate the supplied deck', () => {
  const before = JSON.stringify(brokenDeck);
  auditDeck(brokenDeck);
  assert.equal(JSON.stringify(brokenDeck), before);
});

test('flags converging choices that create no future state for the scheduler to read', () => {
  const report = auditDeck(productionDeck);
  assert.ok(report.findings.some((finding) => finding.cardId === 'OPEN_04' && finding.code === 'same-next-without-future-state'));
});

test('treats card-level state effects as real readers of retained flags', () => {
  const report = auditDeck(productionDeck);
  const unused = report.findings
    .filter((finding) => finding.code === 'unused-flag')
    .map((finding) => finding.message);
  ['payroll_offer_compute_only', 'dev_updates_restored', 'mom_investor_clash_resolved', 'coma_callback_public', 'mom_flyers_public']
    .forEach((flag) => assert.equal(unused.some((message) => message.includes(flag)), false, flag));
});
