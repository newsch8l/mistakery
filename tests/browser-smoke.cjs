const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

// The onboarding runs before the deck, and the card id is no longer printed on screen.
const enterGame = async (page) => {
  await page.waitForFunction(() => window.MistakeryApp && window.MistakeryApp.deck, null, { timeout: 4000 });
  for (let safety = 0; safety < 40; safety += 1) {
    const onboarding = await page.evaluate(() => {
      const screen = document.querySelector('[data-intro]');
      return Boolean(screen) && !screen.hidden;
    });
    if (!onboarding) break;
    const button = page.locator('[data-intro-next]').first();
    if (await button.count() && await button.isEnabled()) await button.click();
    await page.waitForTimeout(250);
  }
  await page.waitForFunction(() => Boolean(window.MistakeryApp.state), null, { timeout: 4000 });
};

const currentCardId = (page) => page.evaluate(() => window.MistakeryApp.state.currentCardId);

const PACKAGE_A_IDS = [
  'PAYROLL_RESTRICTED_AI_SEED', 'PAYROLL_RESTRICTED_AI_CALLBACK',
  'DEV_HOSTAGE_SEED', 'DEV_HOSTAGE_CALLBACK',
  'MOM_INVESTOR_SEED', 'MOM_INVESTOR_CALLBACK',
  'COMA_SEED', 'COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED', 'MOM_FLYERS',
];

test('opens directly from index.html without a local server', async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
    await page.goto(fileUrl, { waitUntil: 'load' });
    await enterGame(page);
    assert.equal(await currentCardId(page), 'OPEN_01');
    assert.equal(await page.locator('[data-choice]').count(), 2);
    assert.equal(await page.locator('h1').textContent(), 'Mistakery');
    assert.equal((await page.locator('.topbar').textContent()).includes('Validation'), false);
    assert.equal(await page.locator('[data-message-avatar]').count(), 1);
    assert.equal(await page.locator('[data-message-avatar]').textContent(), 'B');
    const responseWeight = Number(await page.locator('[data-choice="left"]').evaluate((node) => getComputedStyle(node).fontWeight));
    assert.ok(responseWeight < 700, `Response font is still bold: ${responseWeight}`);
    const messageGeometry = await page.evaluate(() => {
      const avatar = document.querySelector('[data-message-avatar]').getBoundingClientRect();
      const bubble = document.querySelector('[data-messenger] .bubble').getBoundingClientRect();
      return {
        avatarLeft: avatar.left,
        avatarTop: avatar.top,
        avatarBottom: avatar.bottom,
        bubbleLeft: bubble.left,
        bubbleBottom: bubble.bottom,
      };
    });
    assert.ok(messageGeometry.avatarLeft < messageGeometry.bubbleLeft);
    assert.ok(messageGeometry.avatarTop >= messageGeometry.bubbleBottom - 12, JSON.stringify(messageGeometry));
    assert.ok(messageGeometry.avatarBottom >= messageGeometry.bubbleBottom + 14, JSON.stringify(messageGeometry));
    const conversationGeometry = await page.evaluate(() => {
      const conversation = document.querySelector('[data-conversation]').getBoundingClientRect();
      const bubble = document.querySelector('[data-messenger] .bubble').getBoundingClientRect();
      const conversationCenter = (conversation.top + conversation.bottom) / 2;
      const contentCenter = (bubble.top + bubble.bottom) / 2;
      return { offsetAboveCenter: conversationCenter - contentCenter };
    });
    assert.ok(conversationGeometry.offsetAboveCenter >= -2, JSON.stringify(conversationGeometry));
    assert.ok(conversationGeometry.offsetAboveCenter <= 12, JSON.stringify(conversationGeometry));
    const topbarHeight = await page.locator('.topbar').evaluate((node) => node.getBoundingClientRect().height);
    assert.ok(topbarHeight >= 38, `Removing the label moved the chat upward: ${topbarHeight}`);
    const cardLayout = await page.evaluate(() => {
      const failures = [];
      const targets = new Set([
        'B3_SALES_PRESSURE_SEED', 'B3_PAID_OPTOUT_CALLBACK', 'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_06_LEGAL',
        'PAYROLL_RESTRICTED_AI_SEED', 'PAYROLL_RESTRICTED_AI_CALLBACK', 'DEV_HOSTAGE_SEED', 'DEV_HOSTAGE_CALLBACK',
        'MOM_INVESTOR_SEED', 'MOM_INVESTOR_CALLBACK', 'COMA_SEED',
        'COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED', 'MOM_FLYERS',
      ]);
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
    assert.deepEqual(Object.keys(cardLayout.verified).sort(), [...new Set([
      'AGENT_02_DEV', 'AGENT_03_HYPE', 'AGENT_06_LEGAL', 'B3_PAID_OPTOUT_CALLBACK', 'B3_SALES_PRESSURE_SEED',
      'PAYROLL_RESTRICTED_AI_SEED', 'PAYROLL_RESTRICTED_AI_CALLBACK', 'DEV_HOSTAGE_SEED', 'DEV_HOSTAGE_CALLBACK',
      'MOM_INVESTOR_SEED', 'MOM_INVESTOR_CALLBACK', 'COMA_SEED',
      'COMA_CALLBACK_AUTHORIZED', 'COMA_CALLBACK_BLOCKED', 'MOM_FLYERS',
    ])].sort());
    Object.entries(cardLayout.verified).forEach(([id, layout]) => {
      const maxLines = id === 'MOM_INVESTOR_CALLBACK' ? 5 : 4;
      assert.ok(layout.lines <= maxLines, `${id} uses ${layout.lines} visual lines: ${layout.lineCounts.join('+')}`);
      assert.equal(layout.messageOverlapsStamp, false, `${id} overlaps timestamp`);
      assert.equal(layout.buttonsClipped, false, `${id} clips a reply button`);
    });
    assert.equal(new Set(Object.values(cardLayout.verified).map((layout) => layout.fontSize)).size, 1, JSON.stringify(cardLayout.verified));
    Object.entries(cardLayout.verified).forEach(([id, layout]) => {
      assert.equal(layout.fontSize, '14.6px', `${id} no longer uses the common bubble font size`);
    });
    if (process.env.MISTAKERY_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.MISTAKERY_SCREENSHOT_DIR, { recursive: true });
      for (const id of PACKAGE_A_IDS) {
        const shotBrowser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
        const shot = await shotBrowser.newPage({ viewport: { width: 390, height: 844 } });
        try {
          await shot.goto(fileUrl, { waitUntil: 'load' });
          await enterGame(shot);
          await shot.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
          await shot.evaluate((cardId) => {
            window.MistakeryApp.state.gameOver = false;
            window.MistakeryApp.state.activeCrisisId = null;
            window.MistakeryApp.state.currentCardId = cardId;
            window.MistakeryApp.render();
          }, id);
          await shot.waitForTimeout(500);
          await shot.screenshot();
          await shot.waitForTimeout(100);
          await shot.screenshot();
          await shot.waitForTimeout(100);
          await shot.screenshot({
            path: path.join(process.env.MISTAKERY_SCREENSHOT_DIR, `${id}.png`),
          });
        } finally {
          await shot.close();
          await shotBrowser.close();
        }
      }
    }
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
    const continueThroughPackageA = async (nextId) => {
      for (let safety = 0; safety < 4; safety += 1) {
        const currentId = await currentCardId(page);
        if (currentId === nextId) return;
        assert.ok(PACKAGE_A_IDS.includes(currentId), `Unexpected card ${currentId} before ${nextId}`);
        await page.locator('[data-choice="left"]').click();
        await page.waitForTimeout(300);
      }
      assert.fail(`Did not reach ${nextId}`);
    };
    for (const [side, nextId] of onboardingPath) {
      await page.locator(`[data-choice="${side}"]`).click();
      await page.waitForTimeout(300);
      await continueThroughPackageA(nextId);
    }
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => window.MistakeryApp.state.currentCardId === 'AGENT_01');
    assert.equal(await page.locator('[data-ending]').count(), 0);
    assert.match(await page.locator('[data-sender]').textContent(), /@unicorn_hunter/);

    const desktop = await browser.newPage({ viewport: { width: 1536, height: 838 } });
    await desktop.goto(fileUrl, { waitUntil: 'load' });
    await enterGame(desktop);
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
    await enterGame(page);
    assert.equal(await page.locator('[data-resource]').count(), 4);
    assert.equal(await page.locator('[data-choice]').count(), 2);
    assert.equal(await currentCardId(page), 'OPEN_01');
    // short words are glued with a non-breaking space at render time
    const openingMessage = (await page.locator('[data-message]').textContent()).replace(/\u00A0/g, ' ');
    assert.match(openingMessage, /11,204 new B2B AI SaaS competitors/);
    await page.screenshot({ path: '/tmp/mistakery-vertical-slice-mobile.png', fullPage: true });

    await page.locator('[data-choice="left"]').hover();
    assert.equal(await page.locator('[data-resource].is-preview').count(), 2);
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => window.MistakeryApp.state.currentCardId === 'OPEN_02');
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
        const bubble = document.querySelector('[data-messenger] .bubble').getBoundingClientRect();
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
    await enterGame(desktop);
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

test('completes controlled Agents and Padel browser walkthroughs', async () => {
  const browser = await chromium.launch({ headless: true });
  const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
  const play = async (picks, expectedEnding) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await enterGame(page);
    await page.evaluate(() => {
      Math.random = () => 0;
      window.MistakeryApp.state = window.MistakeryEngine.startRun(window.MistakeryApp.deck);
      window.MistakeryApp.render();
    });
    for (let safety = 0; safety < 50; safety += 1) {
      const snapshot = await page.evaluate(() => ({
        gameOver: window.MistakeryApp.state.gameOver,
        endingId: window.MistakeryApp.state.endingId,
        crisis: window.MistakeryApp.state.activeCrisisId,
        currentCardId: window.MistakeryApp.state.currentCardId,
      }));
      if (snapshot.gameOver) {
        assert.equal(snapshot.endingId, expectedEnding);
        const history = await page.evaluate(() => window.MistakeryApp.state.history.map((entry) => entry.cardId));
        await page.close();
        return history;
      }
      const selector = snapshot.crisis ? '[data-crisis-choice="rescue"]' : `[data-choice="${picks[snapshot.currentCardId] || 'left'}"]`;
      await page.locator(selector).click();
      await page.waitForTimeout(320);
    }
    assert.fail(`Browser walkthrough did not reach ${expectedEnding}`);
  };

  try {
    const opening = {
      OPEN_01: 'left', OPEN_02: 'left', OPEN_03_AUDIT: 'right', OPEN_04: 'left',
      MOM_INVESTOR_SEED: 'left', OPEN_05: 'left', MOM_INVESTOR_CALLBACK: 'left',
    };
    const agents = await play({
      ...opening, OPEN_06: 'left', AGENT_01: 'left', AGENT_02_DEV: 'right', AGENT_03_HYPE: 'left',
      AGENT_04_LEAD: 'left', AGENT_05_ORDER: 'right', AGENT_06_LEGAL: 'left', AGENT_07_INVOICE: 'left',
    }, 'validation_agents');
    assert.ok(agents.includes('AGENT_01'));
    assert.ok(agents.includes('AGENT_07_INVOICE'));

    const padel = await play({
      ...opening, OPEN_06: 'right', PADEL_01: 'left', PADEL_02: 'left', PADEL_03_TEAM: 'left',
      PADEL_04_CHOICE: 'right', PADEL_05_WIN: 'left', PADEL_06_PILOT: 'left',
    }, 'validation_padel');
    const accepted = padel.indexOf('PADEL_01');
    assert.ok(accepted >= 0);
    assert.equal(padel.slice(accepted + 1).some((id) => PACKAGE_A_IDS.includes(id)
      || id.startsWith('B3_') || id.startsWith('PRESS_')), false);
  } finally {
    await browser.close();
  }
});
