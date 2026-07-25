#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const skillRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillRoot, "../../..");
const skill = [
  fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8"),
  fs.readFileSync(path.join(skillRoot, "references", "writer.md"), "utf8"),
  fs.readFileSync(path.join(skillRoot, "references", "editor.md"), "utf8")
].join("\n\n");
const taste = fs.readFileSync(path.join(skillRoot, "references", "taste-memory.md"), "utf8");
const engines = fs.readFileSync(path.join(skillRoot, "references", "character-voice-engines.md"), "utf8");
const auditionPath = path.join(repoRoot, "MISTAKERY_MESSENGER_WRITER_FULL_CHARACTER_AUDITION.md");
const audition = fs.readFileSync(auditionPath, "utf8");

assert.match(audition, /author-approved voice calibration/i, "audition must record author approval as a voice reference");
assert.match(skill, /MISTAKERY_MESSENGER_WRITER_FULL_CHARACTER_AUDITION\.md/, "Writer must read the approved live-copy calibration");
assert.match(skill, /do not copy.*(?:wording|phrases|syntax|structure)/i, "calibration must not become a phrase or syntax template");
assert.match(skill, /semicolon/i, "skill must explicitly reject semicolons in visible messenger copy");
assert.match(skill, /profanity.*rare|rare.*profanity/i, "skill must keep profanity rare rather than using it as a voice shortcut");
assert.match(skill, /Investor[\s\S]{0,240}(?:money|status)[\s\S]{0,240}(?:not|without)[\s\S]{0,80}(?:rude|coarse|profanity|swearing)/i,
  "Investor guidance must prefer money/status pressure over coarse language");

const quotes = [...audition.matchAll(/^> (.+(?:\n> .+)*)$/gm)]
  .map((match) => match[1].replace(/\n> /g, "\n"));
assert.equal(quotes.length, 45, "approved calibration must preserve all 45 audition messages");
assert.ok(quotes.every((quote) => !quote.includes(";")), "visible audition messages must not contain semicolons");

const profanity = quotes.join("\n").match(/\b(?:fuck|fucking|shit|bullshit|asshole)\b/gi) || [];
assert.ok(profanity.length <= 5, `profanity must remain rare across the set, found ${profanity.length}`);

const investor = audition.match(/^## 7\. Investor @unicorn_hunter[\s\S]*?(?=^## 8\.)/m)?.[0] || "";
assert.ok(investor, "Investor audition section must exist");
assert.doesNotMatch(investor, /\b(?:fuck|fucking|shit|bullshit|asshole|bastard)\b/i,
  "Investor calibration must not rely on coarse language");

const investorEngine = engines.match(/^## 7\. Investor @unicorn_hunter[\s\S]*?(?=^## 8\.)/m)?.[0] || "";
assert.match(investorEngine, /money|cheque|status/i, "Investor engine must retain money/status leverage");
assert.match(investorEngine, /no routine profanity|without profanity|not coarse/i,
  "Investor engine must encode the author correction against coarse speech");

for (const feedback of ["semicolon", "profanity", "Investor"]) {
  assert.match(taste, new RegExp(feedback, "i"), `taste memory must preserve explicit author feedback: ${feedback}`);
}

console.log("live-copy calibration contract: pass");
