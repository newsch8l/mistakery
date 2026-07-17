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

test('bilingual catalog contains Russian copy for every SADBOT card', () => {
  const catalog = fs.readFileSync(catalogPath, 'utf8');
  const ids = [
    'SADBOT_01_SEED', 'SADBOT_02_EVIDENCE', 'SADBOT_03_VIRAL',
    'SADBOT_INVESTOR_CLAIM', 'SADBOT_04_LEAD', 'SADBOT_05_ORDER_CALL',
    'SADBOT_05_ORDER_REPLY', 'SADBOT_05B_THEATER', 'SADBOT_FRIDAY',
    'SADBOT_06_LEGAL', 'SADBOT_07_INVOICE', 'SADBOT_07_INVOICE_CUT',
    'SADBOT_07_LOGO',
  ];
  for (const id of ids) {
    const start = catalog.indexOf(`## ${id} `);
    assert.notEqual(start, -1, `missing catalog entry ${id}`);
    const next = catalog.indexOf('\n## ', start + 1);
    const entry = catalog.slice(start, next === -1 ? catalog.length : next);
    assert.match(entry, /\*\*RU\*\*/);
    assert.doesNotMatch(entry, /перевод не утверждён/);
    const russian = entry.slice(entry.indexOf('**RU**'));
    assert.match(russian, /[А-Яа-яЁё]/, `${id} has no Russian copy`);
  }
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
