const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

test('opens directly from index.html without a local server', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForSelector('[data-card-id]', { timeout: 2000 });
    assert.equal(await page.locator('[data-card-id]').textContent(), 'OPEN_01');
    assert.equal(await page.locator('[data-choice]').count(), 2);
    assert.equal(await page.locator('h1').textContent(), 'Mistakery');
    assert.equal((await page.locator('.topbar').textContent()).includes('Validation'), false);
    assert.equal(await page.locator('[data-message-avatar]').count(), 1);
    assert.equal(await page.locator('[data-message-avatar]').textContent(), 'B');
    const responseWeight = Number(await page.locator('[data-choice="left"]').evaluate((node) => getComputedStyle(node).fontWeight));
    assert.ok(responseWeight < 700, `Response font is still bold: ${responseWeight}`);
    const messageGeometry = await page.evaluate(() => {
      const avatar = document.querySelector('[data-message-avatar]').getBoundingClientRect();
      const bubble = document.querySelector('.bubble').getBoundingClientRect();
      return {
        avatarLeft: avatar.left,
        avatarTop: avatar.top,
        avatarBottom: avatar.bottom,
        bubbleLeft: bubble.left,
        bubbleBottom: bubble.bottom,
      };
    });
    assert.ok(messageGeometry.avatarLeft < messageGeometry.bubbleLeft);
    assert.ok(messageGeometry.avatarTop >= messageGeometry.bubbleBottom - 10, JSON.stringify(messageGeometry));
    assert.ok(messageGeometry.avatarBottom >= messageGeometry.bubbleBottom + 14, JSON.stringify(messageGeometry));
    const conversationGeometry = await page.evaluate(() => {
      const conversation = document.querySelector('.conversation').getBoundingClientRect();
      const date = document.querySelector('.date-chip').getBoundingClientRect();
      const bubble = document.querySelector('.bubble').getBoundingClientRect();
      const conversationCenter = (conversation.top + conversation.bottom) / 2;
      const contentCenter = (date.top + bubble.bottom) / 2;
      return { offsetAboveCenter: conversationCenter - contentCenter };
    });
    assert.ok(conversationGeometry.offsetAboveCenter >= 28, JSON.stringify(conversationGeometry));
    assert.ok(conversationGeometry.offsetAboveCenter <= 36, JSON.stringify(conversationGeometry));
    const topbarHeight = await page.locator('.topbar').evaluate((node) => node.getBoundingClientRect().height);
    assert.ok(topbarHeight >= 38, `Removing the label moved the chat upward: ${topbarHeight}`);
    const cardLayout = await page.evaluate(() => {
      const failures = [];
      const targets = new Set(['B3_SALES_PRESSURE_SEED', 'B3_PAID_OPTOUT_CALLBACK', 'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_06_LEGAL']);
      const verified = {};
      for (const card of window.MistakeryApp.deck.cards) {
        window.MistakeryApp.state.gameOver = false;
        window.MistakeryApp.state.activeCrisisId = null;
        window.MistakeryApp.state.currentCardId = card.id;
        window.MistakeryApp.render();
        const lineCounts = [...document.querySelectorAll('[data-message] > span')].map((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          return range.getClientRects().length;
        });
        const lines = lineCounts.reduce((sum, count) => sum + count, 0);
        if (lines > 5) failures.push(`${card.id}: ${lineCounts.join('+')} = ${lines} lines`);
        if (targets.has(card.id)) {
          const message = document.querySelector('[data-message]').getBoundingClientRect();
          const stamp = document.querySelector('.stamp').getBoundingClientRect();
          const choices = [...document.querySelectorAll('[data-choice]')].map((button) => button.getBoundingClientRect());
          verified[card.id] = {
            lines,
            lineCounts,
            fontSize: getComputedStyle(document.querySelector('[data-message]')).fontSize,
            messageOverlapsStamp: message.bottom > stamp.top,
            buttonsClipped: choices.some((rect) => rect.left < 0 || rect.right > innerWidth || rect.bottom > innerHeight),
          };
        }
      }
      return { failures, verified };
    });
    assert.deepEqual(cardLayout.failures, []);
    assert.deepEqual(Object.keys(cardLayout.verified).sort(), ['AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_06_LEGAL', 'B3_PAID_OPTOUT_CALLBACK', 'B3_SALES_PRESSURE_SEED'].sort());
    Object.entries(cardLayout.verified).forEach(([id, layout]) => {
      assert.ok(layout.lines <= 4, `${id} uses ${layout.lines} visual lines: ${layout.lineCounts.join('+')}`);
      assert.equal(layout.messageOverlapsStamp, false, `${id} overlaps timestamp`);
      assert.equal(layout.buttonsClipped, false, `${id} clips a reply button`);
    });
    assert.equal(new Set(Object.values(cardLayout.verified).map((layout) => layout.fontSize)).size, 1, JSON.stringify(cardLayout.verified));
    Object.entries(cardLayout.verified).forEach(([id, layout]) => {
      assert.equal(layout.fontSize, '15.6px', `${id} no longer uses the common 390px-viewport font size`);
    });
    if (process.env.MISTAKERY_PRINT_LAYOUT === '1') console.log(`MISTAKERY_LAYOUT ${JSON.stringify(cardLayout.verified)}`);
    assert.deepEqual(errors, []);

    const onboardingPath = [
      ['left', 'OPEN_02'],
      ['left', 'OPEN_03_AUDIT'],
      ['left', 'OPEN_04'],
      ['left', 'OPEN_05'],
      ['left', 'OPEN_06'],
    ];
    await page.evaluate(() => { window.MistakeryApp.state = window.MistakeryEngine.startRun(window.MistakeryApp.deck); window.MistakeryApp.render(); });
    for (const [side, nextId] of onboardingPath) {
      await page.locator(`[data-choice="${side}"]`).click();
      await page.waitForFunction((id) => document.querySelector('[data-card-id]').textContent === id, nextId);
      await page.waitForTimeout(300);
    }
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]').textContent === 'AGENT_01');
    assert.equal(await page.locator('[data-ending]').count(), 0);
    assert.match(await page.locator('[data-sender]').textContent(), /@unicorn_hunter/);

    const desktop = await browser.newPage({ viewport: { width: 1536, height: 838 } });
    await desktop.goto(fileUrl, { waitUntil: 'load' });
    await desktop.waitForSelector('[data-card-id]', { timeout: 2000 });
    const desktopFit = await desktop.evaluate(() => {
      const phone = document.querySelector('[data-game]').getBoundingClientRect();
      return {
        top: phone.top,
        bottom: phone.bottom,
        height: phone.height,
        viewportHeight: window.innerHeight,
        centerOffset: Math.abs((phone.top + phone.bottom) / 2 - window.innerHeight / 2),
      };
    });
    assert.ok(desktopFit.top >= 0, `Phone starts above viewport: ${JSON.stringify(desktopFit)}`);
    assert.ok(desktopFit.bottom <= desktopFit.viewportHeight, `Phone is clipped below viewport: ${JSON.stringify(desktopFit)}`);
    assert.ok(desktopFit.centerOffset <= 2, `Phone is vertically shifted: ${JSON.stringify(desktopFit)}`);
    assert.equal(desktopFit.height, 820, `Phone was shrunk instead of recentered: ${JSON.stringify(desktopFit)}`);
    await desktop.close();
  } finally {
    await browser.close();
  }
});

test('renders a readable two-button game with previews, crisis and ending states', async () => {
  const gameUrl = process.env.MISTAKERY_URL;
  assert.ok(gameUrl, 'MISTAKERY_URL must point to a running local server');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  try {
    await page.goto(gameUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-card-id]', { timeout: 2000 });
    assert.equal(await page.locator('[data-resource]').count(), 4);
    assert.equal(await page.locator('[data-choice]').count(), 2);
    assert.equal(await page.locator('[data-card-id]').textContent(), 'OPEN_01');
    assert.match(await page.locator('[data-message]').textContent(), /11,204 new B2B AI SaaS competitors/);
    await page.screenshot({ path: '/tmp/mistakery-vertical-slice-mobile.png', fullPage: true });

    await page.locator('[data-choice="left"]').hover();
    assert.equal(await page.locator('[data-resource].is-preview').count(), 2);
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]').textContent === 'OPEN_02');
    assert.equal(await page.locator('[data-resource="cash"] [data-value]').textContent(), '24%');
    assert.equal(await page.locator('[data-resource="team"] [data-value]').textContent(), '59%');
    assert.equal(await page.locator('[data-resource="customers"] [data-value]').textContent(), '15%');
    assert.equal(await page.locator('[data-resource="founder"] [data-value]').textContent(), '63%');
    assert.equal(await page.locator('.resource__delta').count(), 0);

    const clippedCards = await page.evaluate(() => {
      const failures = [];
      for (const card of window.MistakeryApp.deck.cards) {
        window.MistakeryApp.state.gameOver = false;
        window.MistakeryApp.state.activeCrisisId = null;
        window.MistakeryApp.state.currentCardId = card.id;
        window.MistakeryApp.render();
        const conversation = document.querySelector('[data-conversation]').getBoundingClientRect();
        const bubble = document.querySelector('.bubble').getBoundingClientRect();
        const dock = document.querySelector('[data-reply-dock]').getBoundingClientRect();
        if (bubble.top < conversation.top || bubble.bottom > conversation.bottom || dock.bottom > window.innerHeight) failures.push(card.id);
      }
      return failures;
    });
    assert.deepEqual(clippedCards, []);

    await page.evaluate(() => {
      window.MistakeryApp.state.resources.cash = 0;
      window.MistakeryApp.state.activeCrisisId = 'cash_low';
      window.MistakeryApp.render();
    });
    assert.equal(await page.locator('[data-crisis]').count(), 1);
    assert.equal(await page.locator('[data-crisis-choice]').count(), 2);

    await page.evaluate(() => {
      window.MistakeryApp.state.activeCrisisId = null;
      window.MistakeryApp.state.gameOver = true;
      window.MistakeryApp.state.win = true;
      window.MistakeryApp.state.endingId = 'validation';
      window.MistakeryApp.render();
    });
    assert.equal(await page.locator('[data-ending]').count(), 1);
    assert.match(await page.locator('[data-ending]').textContent(), /VALIDATED/);
    assert.match(await page.locator('[data-ending]').textContent(), /Survived 1 decision/);
    assert.equal(await page.locator('[data-restart]').count(), 1);

    const overflow = await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth > window.innerWidth,
      vertical: document.documentElement.scrollHeight > window.innerHeight,
    }));
    assert.deepEqual(overflow, { horizontal: false, vertical: false });
    assert.deepEqual(errors, []);

    const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await desktop.goto(gameUrl, { waitUntil: 'networkidle' });
    await desktop.waitForSelector('[data-card-id]', { timeout: 2000 });
    const desktopOverflow = await desktop.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth > window.innerWidth,
      vertical: document.documentElement.scrollHeight > window.innerHeight,
    }));
    assert.deepEqual(desktopOverflow, { horizontal: false, vertical: false });
    await desktop.close();
  } finally {
    await browser.close();
  }
});
