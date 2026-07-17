const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bundlePath = path.join(root, 'cards.bundle.js');
const catalogPath = path.join(root, 'MISTAKERY_CARDS_EN_RU.md');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('includes a browser-ready deck before the application script', () => {
  assert.ok(fs.existsSync(bundlePath), 'cards.bundle.js must exist for double-click launch');
  const deckPosition = index.indexOf('cards.bundle.js');
  const appPosition = index.indexOf('app.js');
  assert.ok(deckPosition >= 0 && deckPosition < appPosition);
});

test('offline bundle contains exactly the canonical JSON deck', () => {
  const canonical = JSON.parse(fs.readFileSync(path.join(root, 'cards.json'), 'utf8'));
  const bundled = require(bundlePath);
  assert.deepEqual(bundled, canonical);
});

test('bilingual catalog contains every canonical card and its current English copy', () => {
  const canonical = JSON.parse(fs.readFileSync(path.join(root, 'cards.json'), 'utf8'));
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  canonical.cards.forEach((card) => {
    assert.match(catalog, new RegExp(`## ${card.id}\\b`), `Missing catalog entry ${card.id}`);
    card.text.split('\n').forEach((line) => assert.ok(catalog.includes(line), `Catalog has stale copy for ${card.id}: ${line}`));
  });
});

test('bilingual catalog keeps the approved AGENT_01 Russian copy', () => {
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  assert.ok(catalog.includes('ВСТАВЬ ДУШУ В B2BUYERSPYER ИЛИ ПРОСИ ДЕНЬГИ У МАМЫ.'));
});

test('bilingual catalog marks unapproved SADBOT translations as exact English', () => {
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  assert.match(catalog, /## SADBOT_01_SEED\b/);
  const entry = catalog.slice(catalog.indexOf('## SADBOT_01_SEED'));
  assert.ok(entry.includes('перевод не утверждён'), 'SADBOT entries must not present unapproved Russian as approved');
});

test('uses a neutral typing status instead of the obsolete aggressive status', () => {
  assert.ok(appSource.includes("setThread(card.source, 'typing...')"));
  assert.ok(indexSource.includes('typing...'));
  assert.equal(`${appSource}\n${indexSource}`.includes('aggressively typing'), false);
});

test('uses the Mistakery brand without the Validation label and includes a message avatar', () => {
  assert.match(indexSource, /<title>Mistakery<\/title>/);
  assert.match(indexSource, /<h1>Mistakery<\/h1>/);
  assert.doesNotMatch(indexSource, />Validation</);
  assert.match(indexSource, /data-message-avatar/);
});
