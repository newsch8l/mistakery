#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const skill = fs.readFileSync(path.resolve(__dirname, "../SKILL.md"), "utf8");
const writerAt = skill.indexOf("## Writer");
const editorAt = skill.indexOf("## Editor");

assert.ok(writerAt >= 0, "skill must define a Writer mode");
assert.ok(editorAt > writerAt, "Editor must run after Writer");
const writer = skill.slice(writerAt, editorAt);
const editor = skill.slice(editorAt);

assert.match(writer, /full character name and handle/i, "Writer must see the full canonical name and handle");
assert.match(writer, /emotional state/i, "Writer must receive current emotional state");
assert.match(writer, /what .* wants|what .* want/i, "Writer must receive the character's want");
assert.match(writer, /pressure tactic|way .* press/i, "Writer must receive the current pressure tactic");
assert.match(writer, /do not optimize.*checker|not optimize.*checker/i, "Writer must not optimize for checker findings");
assert.match(writer, /not .*`or`|not .*questions|not .*line count/i, "Writer must not optimize structural statistics");

assert.match(editor, /only after.*creative selection|after.*creative selection/i, "Editor must start only after creative selection");
assert.match(editor, /does not rewrite/i, "Editor must not rewrite candidates");
assert.match(editor, /does not choose.*final/i, "Editor must not choose finalists");
assert.match(editor, /new facts/i, "Editor must check facts");
assert.match(editor, /both buttons/i, "Editor must check both buttons");
assert.match(editor, /brands/i, "Editor must check brands");
assert.match(editor, /direct copying/i, "Editor must check direct copying");

for (const identity of ["Marketer @hype_queen", "Sales @bigdeals", "Designer @pixel_perfect", "AI Assistant @b2buddy_bot"]) {
  assert.ok(skill.includes(identity), `skill must use canonical identity: ${identity}`);
}
assert.doesNotMatch(skill, /\*\*Hype:\*\*/, "skill must not use the invented role shorthand Hype");

console.log("writer-editor separation contract: pass");
