#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const skillRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillRoot, "../../..");
const skillPath = path.join(skillRoot, "SKILL.md");
const enginesPath = path.join(skillRoot, "references", "character-voice-engines.md");
const auditionPath = path.join(repoRoot, "MISTAKERY_MESSENGER_WRITER_FULL_CHARACTER_AUDITION.md");
const deckPath = path.join(repoRoot, "cards.json");

for (const filePath of [enginesPath, auditionPath]) {
  assert.ok(fs.existsSync(filePath), `required full-cast artifact is missing: ${path.relative(repoRoot, filePath)}`);
}

const skill = fs.readFileSync(skillPath, "utf8");
const engines = fs.readFileSync(enginesPath, "utf8");
const audition = fs.readFileSync(auditionPath, "utf8");
const deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
const identities = Object.entries(deck.sources).map(([sourceKey, source]) => ({
  sourceKey,
  handle: source.name,
  identity: `${source.role} ${source.name}`
}));

assert.equal(identities.length, 15, "current cards.json cast must contain 15 sources");

function sections(markdown) {
  const matches = [...markdown.matchAll(/^##\s+\d+\.\s+(.+)$/gm)];
  return matches.map((match, index) => ({
    title: match[1].trim(),
    body: markdown.slice(match.index, matches[index + 1]?.index ?? markdown.length)
  }));
}

const engineSections = sections(engines);
const auditionSections = sections(audition);
assert.equal(engineSections.length, identities.length, "voice-engine reference must have one numbered section per current source");
assert.equal(auditionSections.length, identities.length, "audition must have one numbered section per current source");

for (const { sourceKey, handle, identity } of identities) {
  const engine = engineSections.find((section) => section.title.includes(handle));
  assert.ok(engine, `missing voice engine for ${identity} (source key ${sourceKey})`);
  for (const field of [
    "Wants from founder",
    "Relationship to founder and team",
    "Pressure range",
    "Emotional range",
    "Length and rhythm",
    "Language territory",
    "Surface permissions",
    "Recognizable without markers",
    "Nearest neighbor",
    "Anti-voice"
  ]) {
    assert.ok(engine.body.includes(`**${field}`), `${identity} engine is missing field: ${field}`);
  }
  const pressures = engine.body.match(/^- \*\*Pressure:\*\*/gm) || [];
  const emotions = engine.body.match(/^- \*\*State:\*\*/gm) || [];
  assert.ok(pressures.length >= 4 && pressures.length <= 6, `${identity} must define 4–6 pressure modes`);
  assert.ok(emotions.length >= 4 && emotions.length <= 6, `${identity} must define 4–6 emotional states`);

  const characterAudition = auditionSections.find((section) => section.title.includes(handle));
  assert.ok(characterAudition, `missing audition for ${identity} (source key ${sourceKey})`);
  assert.match(characterAudition.body, /\*\*Status:\*\* (PASS|WEAK|FAIL)/, `${identity} needs an explicit honest status`);
  assert.match(characterAudition.body, /\*\*Swap-test nearest:\*\*/, `${identity} needs the nearest swap character`);
  assert.match(characterAudition.body, /\*\*Why wrong under that handle:\*\*/, `${identity} needs a swap-test explanation`);

  const messages = [...characterAudition.body.matchAll(/^#### Message ([123])\n([\s\S]*?)(?=^#### Message [123]\n|^\*\*Swap-test nearest:\*\*)/gm)];
  assert.equal(messages.length, 3, `${identity} must have exactly three audition messages`);
  assert.deepEqual(messages.map((match) => Number(match[1])), [1, 2, 3], `${identity} messages must be numbered 1–3`);

  const states = [];
  const tactics = [];
  for (const [, , body] of messages) {
    const state = body.match(/^- \*\*Emotional state:\*\* (.+)$/m)?.[1]?.trim();
    const tactic = body.match(/^- \*\*Pressure tactic:\*\* (.+)$/m)?.[1]?.trim();
    const source = body.match(/^- \*\*Source situation:\*\* (.+)$/m)?.[1]?.trim();
    const quote = body.match(/^> (.+(?:\n> .+)*)$/m)?.[1]?.replace(/\n> /g, "\n");
    assert.ok(state, `${identity} message is missing emotional state`);
    assert.ok(tactic, `${identity} message is missing pressure tactic`);
    assert.ok(source, `${identity} message is missing canonical source situation`);
    assert.ok(quote, `${identity} message is missing its audition-only copy`);
    const words = quote.replace(/\n/g, " ").trim().split(/\s+/).filter(Boolean);
    assert.ok(words.length >= 3 && words.length <= 38, `${identity} message must stay within 3–38 words`);
    assert.ok(quote.split("\n").length <= 4, `${identity} message must fit at most four explicit lines`);
    states.push(state);
    tactics.push(tactic);
  }
  assert.equal(new Set(states).size, 3, `${identity} must use three different emotional states`);
  assert.equal(new Set(tactics).size, 3, `${identity} must use three different pressure tactics`);
}

assert.match(skill, /character-voice-engines\.md/, "Writer must read the character voice-engine reference");
const writer = skill.slice(skill.indexOf("## Writer"), skill.indexOf("## Editor"));
assert.match(writer, /read.*voice engine|voice engine.*before/i, "Writer must read the current sender's voice engine before drafting");
assert.match(writer, /choose.*emotional state/i, "Writer must choose an emotional state for the current situation");
assert.match(writer, /choose.*pressure/i, "Writer must choose a pressure mode for the current situation");
assert.match(writer, /different cards.*different combinations|vary.*combinations/i, "Writer must vary emotion/pressure combinations across cards");
assert.match(skill, /PDF.*Editor|Editor.*PDF/i, "PDF must be reserved for Editor range-checking rather than Writer construction");

console.log(`full character voice coverage: pass (${identities.length} characters, ${identities.length * 3} audition messages)`);
