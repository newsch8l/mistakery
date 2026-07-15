#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const skillRoot = path.resolve(__dirname, "..");
const checker = path.join(__dirname, "check-messenger-copy.cjs");
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "mistakery-messenger-check-"));
const fixturePath = path.join(fixtureDir, "candidates.json");

fs.writeFileSync(fixturePath, JSON.stringify({
  cards: [
    {
      id: "TOO_LONG",
      source: "@hype_queen",
      text: "one\ntwo\nthree\nfour\nfive",
      choices: { left: { label: "Keep posting" }, right: { label: "Stop posting" } }
    },
    {
      id: "REPEATED_A",
      source: "@bigdeals",
      text: "Google API or Slack API: @new_vendor?\nGoogle API or Slack API: @new_vendor?",
      choices: { left: { label: "Sell it" }, right: { label: "Hide it" } }
    },
    {
      id: "REPEATED_B",
      source: "@bigdeals",
      text: "Google API or Slack API: @new_vendor?\nGoogle API or Slack API: @new_vendor?",
      choices: { left: { label: "Sell it" }, right: { label: "Hide it" } }
    },
    {
      id: "DEV_JARGON",
      source: "@error404",
      text: "WE SHOULD DEPLOY KUBERNETES API WEBHOOKS NOW\nfollow-up starts before the call ends",
      choices: { left: { label: "Deploy it" }, right: { label: "Hold deploy" } }
    },
    {
      id: "NEW_ENTITY",
      source: "@bigdeals",
      text: "Velvet Orchard Holdings says the meeting is urgent.",
      choices: { left: { label: "Take meeting" }, right: { label: "Decline meeting" } }
    },
    {
      id: "SET_Q_1",
      source: "@bigdeals",
      text: "Can we take it or leave it?",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "SET_Q_2",
      source: "@hype_queen",
      text: "Should we post it or hide it?",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "SET_Q_3",
      source: "@i_love_cats72",
      text: "Do we call him or ignore him?",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "SET_COMMAND_1",
      source: "@unicorn_hunter",
      text: "Should we take it or leave it?\nTake it now.",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "SET_COMMAND_2",
      source: "@error404",
      text: "Should we take it or leave it?\nTake it now.",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "SET_COMMAND_3",
      source: "@pixel_perfect",
      text: "Should we take it or leave it?\nTake it now.",
      choices: { left: { label: "Take offer" }, right: { label: "Leave offer" } }
    },
    {
      id: "RED_B3_INVENTED_FACT",
      source: "@bigdeals",
      text: "Chief, they opened the fourth email.\nNo reply.\nThat is a pulse in this market.",
      choices: { left: { label: "Send follow-up" }, right: { label: "Close account" } },
      audition: { finalType: "punchline" }
    },
    {
      id: "RED_HYPE_INVENTED_FACT",
      source: "@hype_queen",
      text: "the demo froze on camera\nnow it is a story\nwe have an angle.",
      choices: { left: { label: "Boost clip" }, right: { label: "Correct post" } },
      audition: { finalType: "punchline" }
    },
    {
      id: "RED_DESIGNER_LOWERCASE",
      source: "@pixel_perfect",
      text: "arial is an apology.\nthis font costs $4,500.\nsalaries will understand.",
      choices: { left: { label: "Buy font" }, right: { label: "Keep Arial" } },
      audition: { finalType: "punchline" }
    },
    {
      id: "RED_BOT_OBJECT_MISMATCH",
      source: "@b2buddy_bot",
      text: "I found team snacks.\nThey recurred.\nI resolved them.",
      choices: { left: { label: "Restore lunch" }, right: { label: "Keep snacks" } },
      audition: { choiceObjects: { left: "snacks", right: "snacks" }, finalType: "punchline" }
    }
  ]
}, null, 2));

let output;
try {
  output = execFileSync(process.execPath, [checker, "--input", fixturePath, "--format", "json"], { encoding: "utf8" });
} finally {
  // The second fixture below shares this temporary directory.
}

const report = JSON.parse(output);
const codes = new Set(report.findings.map((finding) => finding.code));
for (const code of [
  "too-many-visual-lines",
  "repeat-opening",
  "repeated-ngram",
  "overused-or",
  "overused-colon",
  "overused-question",
  "voice-marker",
  "real-brand",
  "new-handle",
  "new-entity",
  "technical-density",
  "corpus-copy",
  "neighbor-structure",
  "set-question-share",
  "set-or-share",
  "set-structure-repeat",
  "repeat-final-command",
  "repeat-button-verbs",
  "cross-voice-rhythm",
  "designer-lowercase",
  "choice-object-mismatch",
  "repeat-punchline-rhythm"
]) {
  assert.ok(codes.has(code), `expected finding: ${code}`);
}

assert.equal(report.summary.cardsChecked, 15);

const naturalFixturePath = path.join(fixtureDir, "natural-devices.json");
fs.writeFileSync(naturalFixturePath, JSON.stringify({
  cards: [
    {
      id: "NATURAL_HYPE",
      source: "@hype_queen",
      text: "the demo is trending.\nShould we boost it or add a disclaimer?",
      choices: { left: { label: "Boost post" }, right: { label: "Add disclaimer" } }
    },
    {
      id: "NATURAL_DESIGNER",
      source: "@pixel_perfect",
      text: "The font costs $4,500.\nIt is still better than Arial.",
      choices: { left: { label: "Buy font" }, right: { label: "Use Arial" } }
    },
    {
      id: "NATURAL_SALES",
      source: "@bigdeals",
      text: "They have not replied.\nI can leave them alone.",
      choices: { left: { label: "Send three" }, right: { label: "Leave alone" } }
    },
    {
      id: "NATURAL_BOT",
      source: "@b2buddy_bot",
      text: "Food delivery is canceled 😊\nCarrots remain available.",
      choices: { left: { label: "Break lock" }, right: { label: "Eat carrots" } }
    }
  ]
}, null, 2));

try {
  const naturalReport = JSON.parse(execFileSync(process.execPath, [checker, "--input", naturalFixturePath, "--format", "json"], { encoding: "utf8" }));
  const naturalCodes = new Set(naturalReport.findings.map((finding) => finding.code));
  assert.ok(!naturalCodes.has("set-question-share"), "one natural question must not be treated as a repeated template");
  assert.ok(!naturalCodes.has("set-or-share"), "one natural “or” must not be treated as a repeated template");
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}
console.log("messenger checker tests: pass");
