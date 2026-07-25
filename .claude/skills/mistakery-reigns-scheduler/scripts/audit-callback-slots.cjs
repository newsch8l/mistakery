#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

function asArray(value) { return value == null ? [] : (Array.isArray(value) ? value : [value]); }
function isVariableSlot(card) { return card?.continuation === 'weighted' || card?.opensPressureSlot === true; }
function schedulerRole(card) { return card?.scheduler?.role || null; }
function schedulerBoundaries(deck, policy) {
  const boundaries = new Map();
  (deck.meta?.scheduler?.boundaries || []).forEach((boundary) => boundaries.set(boundary.id, boundary));
  (policy.callbackOnlyBoundaries || []).forEach((boundary) => boundaries.set(boundary.id, { ...boundary, roles: ['callback'] }));
  (policy.reactionOnlyBoundaries || []).forEach((boundary) => boundaries.set(boundary.id, { ...boundary, roles: ['reaction'] }));
  return boundaries;
}
function policyPairs(deck, policy) {
  return new Set([...(policy.protectedPairs || []), ...(deck.meta?.scheduler?.protectedPairs || [])]
    .map(([before, after]) => `${before}:${after}`));
}
function policyLocks(deck, policy) {
  return [...(policy.locks || []), ...(deck.meta?.scheduler?.locks || [])];
}
function continuationIds(card, choice) {
  const direct = asArray(choice?.next);
  return direct.length ? direct : asArray(card?.insertionBefore);
}
function callbackLandings(deck, source, choice) {
  const byId = new Map(deck.cards.map((card) => [card.id, card]));
  const queue = continuationIds(source, choice).map((id) => ({ id, remaining: Number(choice.delay.storyDecisions || 0), depth: 0 }));
  const landings = [];
  const exhausted = [];
  const visited = new Set();
  while (queue.length) {
    const current = queue.shift();
    const key = `${current.id}:${current.remaining}:${current.depth}`;
    if (visited.has(key) || current.depth > 24) continue;
    visited.add(key);
    const card = byId.get(current.id);
    if (!card) continue;
    const remaining = card.kind === 'story' && current.remaining > 0 ? current.remaining - 1 : current.remaining;
    const nextIds = Object.values(card.choices || {}).flatMap((nextChoice) => asArray(nextChoice.next));
    if (remaining <= 0 && isVariableSlot(card)) {
      nextIds.forEach((after) => landings.push({ before: card.id, after }));
      continue;
    }
    if (!nextIds.length) exhausted.push({ at: card.id, remaining });
    else nextIds.forEach((id) => queue.push({ id, remaining, depth: current.depth + 1 }));
  }
  return { landings, exhausted };
}
function auditDeck(deck, policy = {}, options = {}) {
  const findings = [];
  const callbacks = [];
  const protectedPairs = policyPairs(deck, policy);
  const boundaries = schedulerBoundaries(deck, policy);
  deck.cards.forEach((source) => Object.entries(source.choices || {}).forEach(([side, choice]) => {
    if (!choice.delay?.card || choice.delay.storyDecisions == null) return;
    const trace = callbackLandings(deck, source, choice);
    callbacks.push({ sourceId: source.id, side, callbackId: choice.delay.card, storyDecisions: Number(choice.delay.storyDecisions), ...trace });
    if (!trace.landings.length) findings.push({ code: 'callback-without-selection-slot', callbackId: choice.delay.card, sourceId: source.id, side, exhausted: trace.exhausted });
    trace.landings.forEach((landing) => {
      if (protectedPairs.has(`${landing.before}:${landing.after}`)) findings.push({ code: 'callback-inside-protected-pair', callbackId: choice.delay.card, sourceId: source.id, side, ...landing });
    });
  }));
  deck.cards.forEach((card) => {
    const role = schedulerRole(card);
    if (!role) return;
    const boundary = boundaries.get(card.scheduler.slot);
    if (!boundary || !(boundary.roles || []).includes(role)) {
      findings.push({ code: 'disallowed-role-at-boundary', cardId: card.id, role, boundaryId: card.scheduler.slot });
    }
    if (options.reachability) {
      const reachableWindows = (options.reachability.boundaries || []).filter((window) => window.boundaryId === card.scheduler.slot);
      const isReachable = reachableWindows.some((window) => (window.cardIds || []).includes(card.id));
      if (!isReachable) {
        findings.push({
          code: role === 'callback' ? 'callback-window-unreachable' : 'eligibility-without-reachable-route',
          cardId: card.id,
          boundaryId: card.scheduler.slot,
          realOpeningTraces: options.reachability.realOpeningTraces || 0,
        });
      }
    }
    if (boundary && role === 'callback' && protectedPairs.has(`${boundary.before}:${boundary.after}`)) {
      findings.push({ code: 'callback-inside-protected-pair', callbackId: card.id, before: boundary.before, after: boundary.after });
    }
    Object.values(card.choices || {}).forEach((choice) => {
      if (!choice.reserveCallback) return;
      const reservation = choice.reserveCallback;
      const callback = deck.cards.find((candidate) => candidate.id === reservation.callbackId);
      const callbackBoundary = boundaries.get(reservation.callbackSlot);
      if (!callback || !callbackBoundary || schedulerRole(callback) !== 'callback') {
        findings.push({ code: 'reservation-without-reachable-callback-slot', sourceId: card.id, callbackId: reservation.callbackId, callbackSlot: reservation.callbackSlot });
      } else if (protectedPairs.has(`${callbackBoundary.before}:${callbackBoundary.after}`)) {
        findings.push({ code: 'callback-inside-protected-pair', callbackId: reservation.callbackId, sourceId: card.id, before: callbackBoundary.before, after: callbackBoundary.after });
      }
    });
  });
  policyLocks(deck, policy).forEach((lock) => {
    if (!lock.forbidVariableSlots) return;
    deck.cards.filter((card) => card.arc === lock.arc && (isVariableSlot(card) || schedulerRole(card))).forEach((card) => findings.push({ code: 'variable-slot-after-lock', cardId: card.id, lockCardId: lock.lockCardId, arc: lock.arc }));
  });
  const uniqueFindings = [...new Map(findings.map((finding) => [JSON.stringify(finding), finding])).values()];
  return { slots: deck.cards.filter(isVariableSlot).map((card) => card.id), callbacks, findings: uniqueFindings };
}
function main() {
  const [deckPath, ...args] = process.argv.slice(2);
  if (!deckPath) throw new Error('Usage: audit-callback-slots.cjs <cards.json> [--policy path] [--json]');
  const policyIndex = args.indexOf('--policy');
  const policyPath = policyIndex >= 0 ? args[policyIndex + 1] : path.join(__dirname, '../references/mistakery-slot-policy.json');
  const report = auditDeck(JSON.parse(fs.readFileSync(deckPath, 'utf8')), JSON.parse(fs.readFileSync(policyPath, 'utf8')));
  if (args.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    report.findings.forEach((finding) => process.stdout.write(`${finding.code}: ${JSON.stringify(finding)}\n`));
    process.stdout.write(`slots=${report.slots.length} callbacks=${report.callbacks.length} findings=${report.findings.length}\n`);
  }
}
if (require.main === module) main();
module.exports = { auditDeck };
