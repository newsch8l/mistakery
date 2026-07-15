#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const inputPath = option("--input", path.resolve(__dirname, "../../../../cards.json"));
const format = option("--format", "text");
const lineWidth = Number(option("--line-width", "42"));
const brands = ["google", "microsoft", "apple", "amazon", "meta", "openai", "slack", "discord", "linkedin", "tiktok", "instagram", "youtube", "spotify", "uber", "netflix", "notion", "figma", "github"];
const technicalWords = ["api", "sdk", "endpoint", "webhook", "kubernetes", "docker", "deploy", "deployment", "database", "backend", "frontend", "repository", "credentials", "authentication", "infrastructure", "serverless", "latency", "migration"];

function fail(message) {
  process.stderr.write(`checker error: ${message}\n`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${filePath}: ${error.message}`);
  }
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9@]+/g, " ").trim();
}

function tokens(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function countVisualLines(text) {
  return String(text || "").split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(Math.max(line.length, 1) / lineWidth)), 0);
}

function uppercaseRatio(text) {
  const letters = String(text || "").match(/[a-z]/gi) || [];
  if (!letters.length) return 0;
  return letters.filter((letter) => letter === letter.toUpperCase()).length / letters.length;
}

function cardFingerprint(card) {
  const text = String(card.text || "");
  const left = card.choices?.left?.label || "";
  const right = card.choices?.right?.label || "";
  return [
    countVisualLines(text),
    (text.match(/[.!?]/g) || []).join(""),
    (text.match(/\?/g) || []).length,
    (text.match(/\bor\b/gi) || []).length,
    tokens(left).length,
    tokens(right).length
  ].join("|");
}

function sentenceCount(text) {
  return (String(text || "").match(/[.!?]+/g) || []).length;
}

function buttonVerbPair(card) {
  const left = tokens(card.choices?.left?.label)[0] || "";
  const right = tokens(card.choices?.right?.label)[0] || "";
  return left && right ? `${left}|${right}` : "";
}

function finalCommandVerb(card) {
  const line = String(card.text || "").split("\n").map((value) => value.trim()).filter(Boolean).at(-1) || "";
  const verb = tokens(line)[0] || "";
  return new Set(["accept", "back", "buy", "call", "choose", "demand", "do", "keep", "post", "restore", "send", "show", "stop", "take", "tell", "use"]).has(verb) ? verb : "";
}

function startsLowercase(value) {
  const firstLetter = String(value || "").match(/[A-Za-z]/)?.[0] || "";
  return firstLetter >= "a" && firstLetter <= "z";
}

function containsDeclaredObject(value, object) {
  const textTokens = tokens(value);
  const objectTokens = tokens(object);
  if (!objectTokens.length) return true;
  return objectTokens.every((token) => textTokens.includes(token));
}

const input = readJson(inputPath);
const candidateCards = Array.isArray(input) ? input : input.cards;
if (!Array.isArray(candidateCards)) fail("input must be a JSON array or an object with a cards array");

const deckPath = path.resolve(__dirname, "../../../../cards.json");
const deck = fs.existsSync(deckPath) ? readJson(deckPath) : { cards: [], sources: {} };
const deckCards = Array.isArray(deck.cards) ? deck.cards : [];
const allowedHandles = new Set(Object.keys(deck.sources || {}));
const sourceCards = path.resolve(inputPath) === deckPath ? candidateCards : [...deckCards, ...candidateCards];
const fingerprints = readJson(path.resolve(__dirname, "../references/corpus-fingerprints.json"));
const findings = [];
const add = (code, card, detail, severity = "warning") => findings.push({ code, severity, cardId: card?.id || null, source: card?.source || null, detail });

const openingOwners = new Map();
const ngramOwners = new Map();
for (const card of sourceCards) {
  const words = tokens(card.text);
  const opening = words.slice(0, 3).join(" ");
  if (opening) {
    const previous = openingOwners.get(opening) || [];
    previous.push(card.id);
    openingOwners.set(opening, previous);
  }
  for (let index = 0; index <= words.length - 4; index += 1) {
    const ngram = words.slice(index, index + 4).join(" ");
    const previous = ngramOwners.get(ngram) || [];
    previous.push(card.id);
    ngramOwners.set(ngram, previous);
  }
}

for (const card of candidateCards) {
  const text = String(card.text || "");
  const normalized = normalize(text);
  const words = tokens(text);
  const visualLines = countVisualLines(text);
  if (visualLines > 4) add("too-many-visual-lines", card, `${visualLines} estimated visual lines (limit 4)`);

  const opening = words.slice(0, 3).join(" ");
  if (opening && (openingOwners.get(opening) || []).filter((id) => id !== card.id).length) add("repeat-opening", card, `opening repeats: “${opening}”`);

  const repeatedNgram = [...ngramOwners.entries()].find(([ngram, ids]) => ids.includes(card.id) && ids.filter((id) => id !== card.id).length);
  if (repeatedNgram) add("repeated-ngram", card, `repeated four-word run: “${repeatedNgram[0]}”`);

  const ors = (text.match(/\bor\b/gi) || []).length;
  const colons = (text.match(/:/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  if (ors >= 2) add("overused-or", card, `${ors} uses of “or”`);
  if (colons >= 2) add("overused-colon", card, `${colons} colons`);
  if (questions >= 2) add("overused-question", card, `${questions} question marks`);

  const source = card.source;
  const uppercase = uppercaseRatio(text);
  const technicalHits = tokens(text).filter((word) => technicalWords.includes(word));
  if (source === "@error404" && uppercase > 0.35) add("voice-marker", card, "Dev is mostly uppercase; check that surface style is not replacing his dry, concrete pressure");
  if (source === "@unicorn_hunter" && uppercase < 0.15) add("voice-marker", card, "Investor lacks his usual authoritative caps pressure");
  if (source === "@i_love_cats72" && technicalHits.length) add("voice-marker", card, "Mom uses technical vocabulary that risks erasing her domestic voice");
  if (source === "@pixel_perfect" && uppercase > 0.25) add("voice-marker", card, "Designer is unusually shouty; check against his composed snobbery");
  if (source === "@pixel_perfect") {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => /[A-Za-z]/.test(line));
    const lowercaseLines = lines.filter(startsLowercase);
    if (lines.length && lowercaseLines.length / lines.length >= 0.67) add("designer-lowercase", card, "Designer is predominantly lowercase; use composed sentence case rather than Dev formatting");
  }

  const choiceObjects = card.audition?.choiceObjects;
  if (choiceObjects && typeof choiceObjects === "object") {
    for (const [side, object] of Object.entries(choiceObjects)) {
      if (!object || !["left", "right"].includes(side)) continue;
      const label = card.choices?.[side]?.label || "";
      if (!containsDeclaredObject(text, object)) add("choice-object-mismatch", card, `declared object “${object}” is missing from the message`);
      if (!containsDeclaredObject(label, object)) add("choice-object-mismatch", card, `declared object “${object}” is missing from the ${side} button`);
    }
  }

  const brandHits = brands.filter((brand) => new RegExp(`\\b${brand}\\b`, "i").test(text));
  for (const brand of brandHits) add("real-brand", card, `real brand/platform: ${brand}`);
  const handles = text.match(/@[a-z0-9_\[\]-]+/gi) || [];
  for (const handle of handles) if (!allowedHandles.has(handle)) add("new-handle", card, `unknown handle: ${handle}`);
  const namedEntities = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g) || [];
  for (const entity of namedEntities) {
    if (!/^(The|Our|Your)\b/.test(entity)) add("new-entity", card, `possible new named entity: ${entity}`);
  }

  const technicalLimit = source === "@error404" ? 3 : 2;
  if (technicalHits.length > technicalLimit) add("technical-density", card, `${technicalHits.length} technical terms: ${technicalHits.join(", ")}`);
  for (const phrase of fingerprints.phrases || []) if (normalized.includes(normalize(phrase))) add("corpus-copy", card, "matches a protected public-corpus fingerprint");
}

for (let index = 1; index < candidateCards.length; index += 1) {
  if (cardFingerprint(candidateCards[index]) === cardFingerprint(candidateCards[index - 1])) add("neighbor-structure", candidateCards[index], `same structure as previous card ${candidateCards[index - 1].id}`);
}

const questionCards = candidateCards.filter((card) => /\?/.test(String(card.text || "")));
const orCards = candidateCards.filter((card) => /\bor\b/i.test(String(card.text || "")));
const shareThreshold = 0.5;
if (candidateCards.length && questionCards.length / candidateCards.length >= shareThreshold) add("set-question-share", null, `${questionCards.length}/${candidateCards.length} cards use a question; vary the set-level rhythm`);
if (candidateCards.length && orCards.length / candidateCards.length >= shareThreshold) add("set-or-share", null, `${orCards.length}/${candidateCards.length} cards use “or”; do not turn the deck into menus`);

const structureOwners = new Map();
const buttonOwners = new Map();
const commandOwners = new Map();
const rhythmOwners = new Map();
const punchlineRhythmOwners = new Map();
for (const card of candidateCards) {
  const structure = `${countVisualLines(card.text)} lines / ${sentenceCount(card.text)} sentences`;
  const structureIds = structureOwners.get(structure) || [];
  structureIds.push(card.id);
  structureOwners.set(structure, structureIds);

  const buttonPair = buttonVerbPair(card);
  if (buttonPair) {
    const ids = buttonOwners.get(buttonPair) || [];
    ids.push(card.id);
    buttonOwners.set(buttonPair, ids);
  }

  const command = finalCommandVerb(card);
  if (command) {
    const ids = commandOwners.get(command) || [];
    ids.push(card.id);
    commandOwners.set(command, ids);
  }

  const rhythm = cardFingerprint(card);
  const sources = rhythmOwners.get(rhythm) || new Set();
  if (card.source) sources.add(card.source);
  rhythmOwners.set(rhythm, sources);

  const finalType = String(card.audition?.finalType || "").toLowerCase();
  if (finalType === "punchline") {
    const key = `${finalType} / ${countVisualLines(card.text)} lines`;
    const owner = punchlineRhythmOwners.get(key) || { ids: [], sources: new Set() };
    owner.ids.push(card.id);
    if (card.source) owner.sources.add(card.source);
    punchlineRhythmOwners.set(key, owner);
  }
}
for (const [structure, ids] of structureOwners) if (ids.length >= 3) add("set-structure-repeat", null, `${ids.length} cards repeat ${structure}: ${ids.join(", ")}`);
for (const [pair, ids] of buttonOwners) if (ids.length >= 3) add("repeat-button-verbs", null, `${ids.length} cards repeat button verbs “${pair}”: ${ids.join(", ")}`);
for (const [verb, ids] of commandOwners) if (ids.length >= 3) add("repeat-final-command", null, `${ids.length} cards end on the command verb “${verb}”: ${ids.join(", ")}`);
for (const [rhythm, sources] of rhythmOwners) if (sources.size >= 3) add("cross-voice-rhythm", null, `${sources.size} senders share one message fingerprint (${rhythm}); check that voice is not only formatting`);
for (const [rhythm, owner] of punchlineRhythmOwners) if (owner.sources.size >= 3) add("repeat-punchline-rhythm", null, `${owner.sources.size} senders declare the same ${rhythm} (${owner.ids.join(", ")}); include a non-punchline ending`);

const report = {
  summary: {
    cardsChecked: candidateCards.length,
    findings: findings.length,
    questionShare: candidateCards.length ? questionCards.length / candidateCards.length : 0,
    orShare: candidateCards.length ? orCards.length / candidateCards.length : 0
  },
  findings
};
if (format === "json") {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(`Checked ${report.summary.cardsChecked} cards; ${report.summary.findings} advisory findings.\n`);
  for (const finding of findings) process.stdout.write(`[${finding.code}] ${finding.cardId || "deck"}: ${finding.detail}\n`);
}
