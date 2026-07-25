#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const skillRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillRoot, "../../..");
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

const audition = read("MISTAKERY_STAGE_2B_PACKAGE_A_COPY_AUDITION.md");
const blueprint = read("docs/archive/MISTAKERY_STAGE_2B_ADAPTIVE_POOL_BLUEPRINT.md");
const implementationPlan = read("docs/archive/MISTAKERY_STAGE_2B_PACKAGE_A_IMPLEMENTATION_PLAN.md");
const skill = [
  fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8"),
  fs.readFileSync(path.join(skillRoot, "references", "writer.md"), "utf8"),
  fs.readFileSync(path.join(skillRoot, "references", "editor.md"), "utf8")
].join("\n\n");
const taste = fs.readFileSync(path.join(skillRoot, "references", "taste-memory.md"), "utf8");

const approved = [
  {
    title: "Restricted AI Payroll — seed",
    sender: "Investor @unicorn_hunter",
    message: "I BOUGHT CLOUD CREDITS.\nSERVERS GET PAID. YOUR PEOPLE DON'T.\nBRING ME REVENUE BEFORE YOU ASK FOR CASH.",
    buttons: ["Accept credits", "Demand payroll"],
  },
  {
    title: "Restricted AI Payroll — callback",
    sender: "Dev @error404",
    message: "the ai is fully funded\npayroll isn't\ni can cut its hours before the team walks",
    buttons: ["Keep AI running", "Cut AI hours"],
  },
  {
    title: "Dev Hostage — seed",
    sender: "Dev @error404",
    message: "investor says i'm replaceable\ncool. the product stays online\nupdates stop until you tell everyone he was wrong",
    buttons: ["Defend Dev", "Bypass Dev"],
  },
  {
    title: "Dev Hostage — callback",
    sender: "Dev @error404",
    message: "updates work again\nwrite down who gets access this time\nthe shortcut still ends with you calling me at 3am",
    buttons: ["Write rules", "Use shortcut"],
  },
  {
    title: "Mom vs Investor — seed",
    sender: "Mom @i_love_cats72",
    message: "That man keeps calling about money.You aren't eating.\nYou aren't sleeping.Give me his number",
    buttons: ["Let Mom call", "Take his call"],
  },
  {
    title: "Mom vs Investor — callback",
    sender: "Investor @unicorn_hunter",
    message: "YOUR MOTHER CALLED ME ABOUT SLEEP.\nI DIDN'T FUND A BEDTIME.\nGET BACK TO WORK.",
    buttons: ["Take Mom's break", "Keep working"],
  },
  {
    title: "Fake Founder Coma — seed",
    sender: "Marketer @hype_queen",
    message: "okay hear me out\nwe say you worked yourself into a coma\ntragic founder lore. people will eat this up 😭",
    buttons: ["Approve post", "Kill story"],
  },
  {
    title: "Fake Founder Coma — authorized callback",
    sender: "Marketer @hype_queen",
    message: "oh my god they believed the coma 😭\npeople are asking what we built\ndo not wake up online yet",
    buttons: ["Keep post", "Delete post"],
  },
  {
    title: "Fake Founder Coma — blocked callback",
    sender: "Marketer @hype_queen",
    message: "fine. no coma post\nyou still look like shit though\ngo home. this one isn't content",
    buttons: ["Go home", "Keep working"],
  },
  {
    title: "Mom Flyers",
    sender: "Mom @i_love_cats72",
    message: "I put up flyers.\nB2BuyerSpyer and your phone number are on them\nThey say you need help.Don't be mad",
    buttons: ["Take them down", "Leave them up"],
  },
];

assert.match(audition, /author-approved copy, awaiting production integration/i,
  "Package A must be marked author-approved but not production-integrated");
assert.doesNotMatch(audition, /Финалист|Рекомендация для авторского выбора|неутвержд[её]нн/i,
  "old alternatives and selection recommendations must be removed");

const headingMatches = [...audition.matchAll(/^## (\d+)\. (.+)$/gm)];
assert.equal(headingMatches.length, 10, "Package A must contain exactly 10 approved card sections");

for (let index = 0; index < approved.length; index += 1) {
  const expected = approved[index];
  const start = headingMatches[index].index;
  const end = headingMatches[index + 1]?.index ?? audition.length;
  const section = audition.slice(start, end);
  assert.equal(headingMatches[index][2], expected.title, `card ${index + 1} title must match`);
  assert.ok(section.includes(`**Sender:** ${expected.sender}.`), `${expected.title} sender must match`);
  const quotes = [...section.matchAll(/^> (.+(?:\n> .+)*)$/gm)]
    .map((match) => match[1].replace(/ {2}$/gm, "").replace(/\n> /g, "\n"));
  assert.deepEqual(quotes, [expected.message], `${expected.title} must have one exact approved message`);
  const buttons = section.match(/^\*\*Buttons:\*\* `([^`]+)` \/ `([^`]+)`$/m);
  assert.ok(buttons, `${expected.title} must have one button pair`);
  assert.deepEqual(buttons.slice(1), expected.buttons, `${expected.title} buttons must match exactly`);
  assert.ok(!expected.message.includes(";"), `${expected.title} must not contain a semicolon`);
}

const investorMessages = approved.filter(({ sender }) => sender.startsWith("Investor "))
  .map(({ message }) => message).join("\n");
assert.doesNotMatch(investorMessages, /\b(?:fuck|fucking|shit|bullshit|asshole|bastard)\b/i,
  "Investor approved copy must not use coarse profanity");

const sectionBetween = (text, startPattern, endPattern) => {
  const start = text.search(startPattern);
  assert.ok(start >= 0, `missing section ${startPattern}`);
  const tail = text.slice(start);
  const relativeEnd = tail.slice(1).search(endPattern);
  return relativeEnd >= 0 ? tail.slice(0, relativeEnd + 1) : tail;
};
const devSections = [
  sectionBetween(blueprint, /^### M2\. Dev Hostage/m, /^### M3\./m),
  sectionBetween(implementationPlan, /^### Dev Hostage — 2 cards/m, /^### Mom vs Investor/m),
  sectionBetween(audition, /^## 3\. Dev Hostage — seed/m, /^## 5\./m),
];
for (const section of devSections) {
  assert.match(section, /product (?:stays online|continues to work)|продукт продолжает работать/i,
    "Dev Hostage must say the product continues working");
  assert.match(section, /updates? (?:stop|work again)|останавливает выпуск новых обновлений|обновления снова работают/i,
    "Dev Hostage must be explained through stopped and restored updates");
  assert.doesNotMatch(section, /critical operational access|critical access|operational path|неназванн\S* critical access/i,
    "Dev Hostage must not rely on unnamed critical access");
}

assert.match(skill, /stop the copy pass|остановить copy pass/i,
  "Writer must stop when a situation only works through abstract technical or authorial language");
assert.match(skill, /return .*situation.*simplif|вернуть .*ситуац.*упрощ/i,
  "Writer must return an abstract situation for simplification");
assert.match(skill, /Editor[\s\S]{0,240}(?:must not|не должен)[\s\S]{0,160}(?:smooth English|гладк\S* английск)/i,
  "Editor must not hide a weak situation with smooth English");
assert.match(skill, /Package A[\s\S]{0,300}(?:liveliness|живост)[\s\S]{0,200}(?:not|never|не)[\s\S]{0,120}(?:phrases|фраз|syntax|синтаксис)/i,
  "Package A may calibrate liveliness and clarity but must not donate phrases or syntax");

assert.match(taste, /explicit author approval|явн\S* авторск\S* одобр/i,
  "taste memory must record explicit author approval of Package A");
for (const { title } of approved) {
  assert.ok(taste.includes(title), `taste memory must name approved card: ${title}`);
}
assert.match(taste, /concrete human action|конкретн\S* человеческ\S* действ/i,
  "taste memory must prefer concrete human action to abstraction");
assert.match(taste, /critical access[\s\S]{0,160}operational path[\s\S]{0,160}choose whose order/i,
  "taste memory must retain the rejected abstraction examples");

const productionBaseline = {
  "cards.json": "318cd63eec42f25f97c68737c4de3a54135f6ca6",
  "game.js": "cbf077a600714392352d31be4db8ed7f36a89c65",
  "cards.bundle.js": "38aa8b185e1cc6e7601194b601bb54cf8c29011f",
};
for (const [relativePath, expectedHash] of Object.entries(productionBaseline)) {
  const actualHash = crypto.createHash("sha1").update(fs.readFileSync(path.join(repoRoot, relativePath))).digest("hex");
  assert.equal(actualHash, expectedHash, `${relativePath} changed after the Package A copy checkpoint began`);
}

console.log("Package A approved-copy contract: pass");
