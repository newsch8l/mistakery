#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const skillRoot = path.resolve(__dirname, "..");
const writer = fs.readFileSync(path.join(skillRoot, "references", "writer.md"), "utf8");
const editor = fs.readFileSync(path.join(skillRoot, "references", "editor.md"), "utf8");
const skill = [
  fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8"),
  writer,
  editor
].join("\n\n");
const readingMap = fs.readFileSync(path.join(skillRoot, "references", "project-reading-map.md"), "utf8");
const examplesPdf = path.resolve(skillRoot, "../../../docs/source/MISTAKERY_VALIDATION_CHARACTERS_WITH_EXAMPLES.pdf");

assert.ok(fs.existsSync(examplesPdf), "the example PDF must be present under docs/source");
for (const text of [skill, readingMap]) {
  assert.match(text, /MISTAKERY_VALIDATION_CHARACTERS_WITH_EXAMPLES\.pdf/, "new PDF with examples must remain a required Editor source");
  let previous = -1;
  for (const marker of ["state bible", "character bible", "voice engine", "current deck"]) {
    const index = text.toLowerCase().indexOf(marker);
    assert.ok(index > previous, "Writer source priority must be State → current character/TOV → voice engine → deck");
    previous = index;
  }
}

assert.match(writer, /character-voice-engines\.md/, "Writer must read the current sender's voice engine");
assert.doesNotMatch(writer, /read.*PDF|PDF.*before drafting/i, "Writer must not build candidates from the PDF");
assert.match(editor, /reads? the current sender's PDF section|PDF section/i, "Editor must read the current sender's PDF section after selection");
assert.match(skill, /not production copy|not approved production/i, "skill must forbid treating PDF examples as approved copy");
assert.match(skill, /copy.*phrases|copy.*syntax|copy.*construction/i, "skill must forbid copying PDF wording or construction");
assert.match(skill, /recognizable without.*handle/i, "skill must ask whether voice survives without the handle");
assert.match(skill, /characteristic action or pressure/i, "skill must require character-specific action or pressure");
assert.match(skill, /broad range of liveliness|broad authorial range/i, "Editor must compare survivors with the PDF's broad range");
assert.match(skill, /copywriter.*card game/i, "skill must reject sterile copywriter-like text");

console.log("authorial-calibration skill contract: pass");
