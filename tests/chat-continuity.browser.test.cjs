const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const url = `${pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href}?story=live-agent`;

async function choose(page, side = 'left') {
  await page.waitForFunction(() => !window.MistakeryApp.locked);
  await page.locator(`[data-choice="${side}"]`).click();
}

async function texts(page, selector) {
  return (await page.locator(selector).allTextContents()).map(text => text.replace(/\s+/g, ' ').trim());
}

async function assertPlayerReply(page, label) {
  await page.locator('.typing-bubble').waitFor({ state: 'detached' });
  await page.locator('[data-chat]').evaluate(async node => {
    await Promise.all(node.getAnimations({ subtree: true }).map(animation => animation.finished));
  });
  assert.deepEqual(await texts(page, '[data-player-reply]'), [label]);
  assert.equal(await page.locator('[data-new-messages]').count(), 0);
  const geometry = await page.evaluate(() => {
    const reply = document.querySelector('[data-player-reply]');
    const rect = reply.getBoundingClientRect();
    const first = document.querySelector('[data-chat-current]').getBoundingClientRect();
    const chat = document.querySelector('[data-chat]').getBoundingClientRect();
    const hostRight = reply.parentElement.getBoundingClientRect().right
      - (parseFloat(getComputedStyle(reply.parentElement).paddingRight) || 0);
    return { align: getComputedStyle(reply).alignSelf, right: rect.right,
      hostRight, top: rect.top, bottom: rect.bottom, firstTop: first.top, chatTop: chat.top };
  });
  assert.equal(geometry.align, 'flex-end');
  assert.ok(Math.abs(geometry.right - geometry.hostRight) < 1, JSON.stringify(geometry));
  assert.ok(geometry.bottom <= geometry.firstTop, JSON.stringify(geometry));
  const continuation = await page.locator('[data-chat-current]').evaluateAll(nodes => {
    const chat = document.querySelector('[data-chat]').getBoundingClientRect();
    return nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, chatTop: chat.top, chatBottom: chat.bottom };
    });
  });
  for (const rect of continuation) assert.ok(rect.top >= rect.chatTop - 1 && rect.bottom <= rect.chatBottom + 1, JSON.stringify(rect));
}

test('Legal split retains the manifesto, selected reply and continuation through rerender and Back', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 650 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      await page.goto(url);
      await page.waitForFunction(() => window.MistakeryApp?.view === 'playing');
      await page.evaluate(() => {
        window.MistakeryApp.state.currentCardId = 'LIVE_AGENT_07';
        window.MistakeryApp.render();
      });
      await page.locator('.typing-bubble').waitFor({ state: 'detached' });
      const tail = (await texts(page, '[data-chat-current]')).slice(-2);
      for (const [side, label] of [['left', 'Just AI humor'], ['right', 'Replace Legal too']]) {
        await choose(page, side);
        assert.deepEqual(await texts(page, '[data-chat-history]'), tail);
        assert.equal(await page.locator('[data-chat-history] img').count(), 1);
        await assertPlayerReply(page, label);
        assert.equal(await page.locator('[data-chat-current]').count(), 3);
        await page.evaluate(() => window.MistakeryApp.render());
        assert.deepEqual(await texts(page, '[data-chat-history]'), tail);
        await assertPlayerReply(page, label);
        assert.equal(await page.locator('[data-chat] .message').count(), 5);
        if (viewport.width === 390 && side === 'right') {
          await page.screenshot({ path: '/tmp/mistakery-legal-continuity.png', animations: 'disabled' });
        }
        await page.locator('[data-test-back]').click();
        assert.equal(await page.locator('[data-player-reply]').count(), 0);
        assert.equal(await page.locator('.typing-bubble').count(), 0);
        assert.equal(await page.locator('[data-chat-current]').count(), 3);
      }
      await page.close();
    }
  } finally { await browser.close(); }
});

test('approved team pair and three bot cards preserve context, chosen replies and Back without duplicates', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 650 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url);
      await page.waitForFunction(() => window.MistakeryApp?.view === 'playing');
      const teamTail = (await texts(page, '.team-row')).slice(-2);
      await choose(page);
      assert.deepEqual(await texts(page, '[data-chat-history]'), teamTail);
      await assertPlayerReply(page, 'Keep pushing!!');
      assert.equal(await page.locator('[data-chat-current]').count(), 3);
      assert.deepEqual(await page.locator('[data-chat-history]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).animationName)), ['none', 'none']);
      await choose(page);
      assert.equal(await page.locator('[data-chat-history]').count(), 0, 'group messages must not leak into a DM');

      assert.deepEqual(await texts(page, '[data-chat-current]'), ['Hey, Creator 👋', 'Just between us...']);
      assert.equal(await page.locator('.typing-bubble').count(), 1);
      assert.equal(await page.locator('[data-choice]:disabled').count(), 2);
      await page.locator('.typing-bubble').waitFor({ state: 'detached' });
      assert.equal(await page.locator('[data-chat-current]').count(), 4);
      const botTail = (await texts(page, '[data-chat-current]')).slice(-2);
      const botSide = viewport.width === 320 ? 'right' : 'left';
      const botReply = botSide === 'left' ? 'Bro, you feel me…' : 'Kinda creepy..';
      await choose(page, botSide);
      assert.deepEqual(await texts(page, '[data-chat-history]'), botTail);
      await assertPlayerReply(page, botReply);
      const photoMessages = await texts(page, '[data-chat-current]');
      assert.equal(photoMessages.length, 2);
      await page.locator('[data-chat]').evaluate(node => { node.scrollTop = 0; });
      const before = await page.evaluate(() => ({
        state: structuredClone(window.MistakeryApp.state), score: window.MistakeryApp.liveAgentScore,
        scroll: document.querySelector('[data-chat]').scrollTop,
      }));
      await choose(page, 'right');
      assert.deepEqual(await texts(page, '[data-chat-history]'), photoMessages);
      assert.equal(await page.locator('[data-chat-history] img').count(), 1, 'photo and caption remain one historical bubble');
      assert.equal(await page.locator('[data-chat-current]').count(), 2);
      await assertPlayerReply(page, 'Spying on me???');
      assert.equal(await page.locator('[data-chat] .message').count(), 4, 'older history must not accumulate');
      const geometry = await page.evaluate(() => {
        const chat = document.querySelector('[data-chat]');
        const first = document.querySelector('[data-chat-current]').getBoundingClientRect();
        return { scroll: chat.scrollTop, firstTop: first.top, firstBottom: first.bottom,
          top: chat.getBoundingClientRect().top, bottom: chat.getBoundingClientRect().bottom,
          choicesBottom: document.querySelector('[data-choices]').getBoundingClientRect().bottom,
          overflow: document.documentElement.scrollWidth - innerWidth };
      });
      assert.ok(geometry.scroll > 0, JSON.stringify(geometry));
      assert.ok(geometry.firstTop >= geometry.top - 1 && geometry.firstBottom <= geometry.bottom + 1, JSON.stringify(geometry));
      assert.ok(geometry.choicesBottom <= viewport.height + 1 && geometry.overflow <= 1, JSON.stringify(geometry));
      await page.evaluate(() => window.MistakeryApp.render());
      assert.equal(await page.locator('[data-chat] .message').count(), 4, 'rerender must not duplicate context');
      await assertPlayerReply(page, 'Spying on me???');
      await page.locator('[data-test-back]').click();
      assert.deepEqual(await texts(page, '[data-chat-history]'), botTail);
      assert.deepEqual(await texts(page, '[data-player-reply]'), [botReply]);
      assert.deepEqual(await texts(page, '[data-chat-current]'), photoMessages);
      assert.deepEqual(await page.evaluate(() => ({ state: window.MistakeryApp.state,
        score: window.MistakeryApp.liveAgentScore, scroll: document.querySelector('[data-chat]').scrollTop })), before);
      await choose(page);
      await assertPlayerReply(page, 'Go on…');
      assert.deepEqual(await page.evaluate(() => ({ resources: window.MistakeryApp.state.resources, score: window.MistakeryApp.liveAgentScore })), { resources: before.state.resources, score: before.score });
      await choose(page);
      assert.equal(await page.locator('[data-chat-history]').count(), 0, 'another DM must start clean');
      assert.equal(await page.locator('[data-player-reply]').count(), 0);
      await page.locator('[data-test-restart]').click();
      assert.equal(await page.locator('[data-chat-history]').count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
});
