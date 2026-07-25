#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const asArray = (value) => value == null ? [] : (Array.isArray(value) ? value : [value]);

function persistentSignature(choice = {}) {
  return JSON.stringify({
    effects: choice.effects || {},
    setFlags: asArray(choice.setFlags).sort(),
    clearFlags: asArray(choice.clearFlags).sort(),
    delay: choice.delay || null,
    crisis: choice.crisis || null,
    ending: choice.ending || null,
    paid: Boolean(choice.paid),
    validationProof: Boolean(choice.validationProof),
    startArc: choice.startArc || null,
    switchArc: choice.switchArc || null,
  });
}

function schedulerStateSignature(choice = {}) {
  return JSON.stringify({
    setFlags: asArray(choice.setFlags).sort(),
    clearFlags: asArray(choice.clearFlags).sort(),
    delay: choice.delay || null,
    crisis: choice.crisis || null,
    ending: choice.ending || null,
    paid: Boolean(choice.paid),
    validationProof: Boolean(choice.validationProof),
    startArc: choice.startArc || null,
    switchArc: choice.switchArc || null,
  });
}

function auditDeck(deck) {
  const findings = [];
  const add = (severity, code, cardId, message) => findings.push({ severity, code, cardId, message });
  const cards = Array.isArray(deck?.cards) ? deck.cards : [];
  const sources = deck?.sources || {};
  const ids = new Map();
  const readFlags = new Set();
  const setFlags = new Set();

  for (const card of cards) {
    if (!card?.id) {
      add('error', 'missing-card-id', null, 'A card has no id.');
      continue;
    }
    if (ids.has(card.id)) add('error', 'duplicate-card-id', card.id, `Card id ${card.id} is duplicated.`);
    else ids.set(card.id, card);
    if (!card.source || !sources[card.source]) add('error', 'unknown-source', card.id, `Card source ${card.source || '(missing)'} is not declared.`);
    asArray(card.requires).forEach((flag) => readFlags.add(flag));
    asArray(card.excludes).forEach((flag) => readFlags.add(flag));
    const trigger = card.trigger || {};
    ['all', 'any', 'none'].forEach((key) => asArray(trigger[key]).forEach((flag) => readFlags.add(flag)));
    asArray(card.stateEffects).forEach((effect) => {
      asArray(effect.requires).forEach((flag) => readFlags.add(flag));
      asArray(effect.excludes).forEach((flag) => readFlags.add(flag));
    });
  }

  for (const card of cards) {
    if (!card?.choices?.left || !card?.choices?.right) {
      add('error', 'missing-two-choices', card?.id || null, 'Every decision card needs left and right choices.');
      continue;
    }
    const { left, right } = card.choices;
    for (const [side, choice] of Object.entries({ left, right })) {
      asArray(choice.next).forEach((target) => {
        if (!ids.has(target)) add('error', 'missing-next-target', card.id, `${side} points to missing card ${target}.`);
        else if (card.kind === 'pressure' && ids.get(target).kind === 'pressure') add('warning', 'pressure-after-pressure', card.id, `${side} can move directly from one pressure card to another.`);
      });
      asArray(choice.setFlags).forEach((flag) => setFlags.add(flag));
      asArray(choice.conditional).forEach((condition) => {
        asArray(condition.when).forEach((flag) => readFlags.add(flag));
      });
    }
    const sameNext = JSON.stringify(asArray(left.next)) === JSON.stringify(asArray(right.next));
    const hasSharedNext = sameNext && asArray(left.next).length > 0;
    if (hasSharedNext && persistentSignature(left) === persistentSignature(right)) {
      add('warning', 'same-next-without-persistent-difference', card.id, 'Both answers share the same next card and persistent state.');
    }
    if (hasSharedNext && schedulerStateSignature(left) === schedulerStateSignature(right)) {
      add('warning', 'same-next-without-future-state', card.id, 'Both answers converge without a flag, callback, arc change, crisis or ending for later cards to read.');
    }
  }

  Object.values(deck?.endings || {}).forEach((ending) => {
    asArray(ending.readsFlags).forEach((flag) => readFlags.add(flag));
  });

  for (const flag of setFlags) {
    if (!readFlags.has(flag)) add('warning', 'unused-flag', null, `Flag ${flag} is set but never read by eligibility, a conditional consequence or an ending.`);
  }

  const summary = findings.reduce((all, finding) => {
    all[finding.severity] += 1;
    return all;
  }, { error: 0, warning: 0 });
  return { summary, findings };
}

function formatReport(report) {
  const lines = [`${report.summary.error} error(s), ${report.summary.warning} warning(s)`];
  report.findings.forEach((finding) => lines.push(`${finding.severity.toUpperCase()} ${finding.code}${finding.cardId ? ` [${finding.cardId}]` : ''}: ${finding.message}`));
  return lines.join('\n');
}

if (require.main === module) {
  const input = process.argv[2];
  const json = process.argv.includes('--json');
  if (!input) {
    console.error('Usage: node audit-deck.cjs <cards.json> [--json]');
    process.exit(2);
  }
  const deck = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
  const report = auditDeck(deck);
  console.log(json ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(report.summary.error ? 1 : 0);
}

module.exports = { auditDeck, formatReport };
