const { afterTurn } = require('./turn-resources.fixture.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const url = `${pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href}?story=live-agent`;

test('corporate success is a DM containing two forwarded bot messages and the customer comment', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 650 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url);
      await page.waitForFunction(() => window.MistakeryApp?.view === 'playing');
      await page.evaluate(() => {
        const a = window.MistakeryApp;
        a.state.currentCardId = 'LIVE_AGENT_OUTCOME_3';
        a.render();
      });
      assert.equal(await page.locator('[data-sender]').innerText(), '@head_of_innovations');
      assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'personal');
      assert.equal(await page.locator('[data-outcome-label]').innerText(), 'SUCCESS');
      assert.equal(await page.locator('.team-row, .member-avatar').count(), 0);
      assert.equal(await page.locator('[data-message-avatar]').count(), 1);
      assert.equal(await page.locator('[data-chat] .message').count(), 3);
      assert.deepEqual(await page.locator('.forwarded-label').allTextContents(), ['Forwarded from @b2buddy_120', 'Forwarded from @b2buddy_389']);
      assert.deepEqual(await page.locator('[data-forwarded-from]').evaluateAll(nodes => nodes.map(n => n.dataset.forwardedFrom)), ['@b2buddy_120', '@b2buddy_389']);
      const bodies = await page.locator('[data-chat] .message').evaluateAll(nodes => nodes.map(n => Array.from(n.querySelectorAll('p')).map(p => p.innerText).join(' ').replace(/\s+/g, ' ')));
      assert.deepEqual(bodies, [
        'Good morning, colleagues! Remember: it is not overtime, it is brand passion! 😊💼',
        'Agreed! We do not create problems, we create growth opportunities! 📈✨',
        "THAT'S IT! They're so dumb. The perfect corporate culture!",
      ]);
      assert.equal(await page.locator('[data-chat] .message').last().locator('.forwarded-label').count(), 0);
      assert.ok(await page.locator('[data-chat]').evaluate(n => n.scrollWidth <= n.clientWidth + 1));
      assert.ok(await page.locator('[data-choices]').evaluate(n => n.getBoundingClientRect().bottom <= innerHeight + 1));
      await page.screenshot({ path: `/tmp/mistakery-forwarded-${viewport.width}.png`, animations: 'disabled' });
      const resources = await page.evaluate(() => ({ ...window.MistakeryApp.state.resources }));
      await page.locator('[data-choice="left"]').click();
      assert.equal(await page.locator('[data-scene]').getAttribute('data-active-card'), 'OPEN_INVESTOR');
      assert.equal(await page.locator('.forwarded-label').count(), 0);
      assert.deepEqual(await page.evaluate(() => window.MistakeryApp.state.resources), afterTurn(resources));
      await page.locator('[data-test-back]').click();
      assert.equal(await page.locator('[data-sender]').innerText(), '@head_of_innovations');
      assert.equal(await page.locator('.forwarded-label').count(), 2);
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
});
