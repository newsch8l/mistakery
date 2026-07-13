const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const deck = JSON.parse(fs.readFileSync(path.join(root, 'cards.json'), 'utf8'));
const source = `(function(root, factory) {\n  const deck = factory();\n  if (typeof module === 'object' && module.exports) module.exports = deck;\n  root.MISTAKERY_DECK = deck;\n})(typeof globalThis !== 'undefined' ? globalThis : window, function() {\n  return ${JSON.stringify(deck)};\n});\n`;

fs.writeFileSync(path.join(root, 'cards.bundle.js'), source);

