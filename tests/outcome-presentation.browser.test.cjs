const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const url = `${pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href}?story=live-agent`;

async function seed(page, id) {
  await page.evaluate(id => {
    const a = window.MistakeryApp;
    a.state = window.MistakeryEngine.startRun(a.deck);
    a.state.currentCardId = id;
    a.locked = false;
    a.view = 'playing';
    a.render();
  }, id);
}

test('Influencer outcomes replace the pin with status; Padel outcomes keep location and court', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 650 }]) {
      const page = await browser.newPage({ viewport });
      await page.goto(url);
      await page.waitForFunction(() => window.MistakeryApp?.view === 'playing');
      await seed(page, 'IRL_PADEL_01');
      const courtBackground = await page.locator('[data-scene]').evaluate(node => getComputedStyle(node, '::after').backgroundImage);
      for (const [family, numbers, successes] of [
        ['INFLUENCER', [1, 2, 3, 4, 5, 6, 7], [2, 4, 6]],
        ['PADEL', [0, 1, 2, 3, 4, 5, 6, 7], [2, 4, 5]],
      ]) {
        for (const number of numbers) {
          const id = `${family}_OUTCOME_${number}`;
          await seed(page, id);
          const tone = successes.includes(number) ? 'success' : 'failure';
          assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), tone, id);
          const banner = family === 'INFLUENCER';
          assert.equal(await page.locator('[data-outcome-banner]').isVisible(), banner, id);
          assert.equal(await page.locator('[data-pinned]').isVisible(), !banner, id);
          if (banner) assert.equal(await page.locator('[data-outcome-label]').innerText(), tone === 'success' ? 'SUCCESS' : 'FAILURE');
          const irl = family === 'PADEL' && number > 0;
          const styles = await page.locator('[data-scene]').evaluate((node, irl) => ({
            pulse: getComputedStyle(node, irl ? '::before' : '::after').animationName,
            background: getComputedStyle(node, '::after').backgroundImage,
            opacity: getComputedStyle(node, '::after').opacity,
          }), irl);
          assert.equal(styles.pulse, 'outcomePulse', id);
          if (tone === 'success') {
            const win = await page.locator('[data-scene]').evaluate(node => ({
              scene: getComputedStyle(node).animationName,
              glow: getComputedStyle(node.querySelector('.outcome-glow')).animationName,
              count: getComputedStyle(node.querySelector('.outcome-glow')).animationIterationCount,
            }));
            assert.deepEqual(win, { scene: 'outcomeSuccess', glow: 'outcomeSuccessGlow', count: '1' });
          }
          if (irl) {
            assert.equal(styles.background, courtBackground, 'outcome colors must not tint the court photo');
            assert.deepEqual(await page.locator('.outcome-glow').evaluate(node => {
              const css = getComputedStyle(node);
              return [css.backgroundImage, css.backgroundColor, css.boxShadow];
            }), ['none', 'rgba(0, 0, 0, 0)', 'none']);
            assert.equal(styles.opacity, '1');
            const score = await page.evaluate(id => window.MistakeryApp.deck.cards.find(card => card.id === id).score, id);
            assert.equal(await page.locator('[data-pinned-title]').innerText(), score);
          }
          assert.equal(await page.locator('[data-choice]:disabled').count(), 0);
          assert.ok(await page.locator('[data-choices]').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight + 1));
          if ([2, 3].includes(number)) await page.screenshot({ path: `/tmp/mistakery-${family.toLowerCase()}-outcome-${number}-${viewport.width}.png`, animations: 'disabled' });
          await page.evaluate(() => window.MistakeryApp.render());
          assert.equal(await page.locator('[data-game]').evaluate(node => node.classList.contains('is-outcome-entering')), false);
        }
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const id of ['INFLUENCER_OUTCOME_2', 'PADEL_OUTCOME_2', 'PADEL_OUTCOME_3']) {
        await seed(page, id);
        assert.deepEqual(await page.locator('[data-scene]').evaluate(node => [getComputedStyle(node).animationName,
          getComputedStyle(node, '::before').animationName, getComputedStyle(node, '::after').animationName]), ['none', 'none', 'none']);
        assert.equal(await page.locator('.outcome-glow').evaluate(node => getComputedStyle(node).animationName), 'none');
      }
      await page.locator('[data-choice="left"]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), null);
      await page.locator('[data-test-back]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), 'failure');
      assert.equal(await page.locator('[data-game]').evaluate(node => node.classList.contains('is-outcome-entering')), false);
      await page.close();
    }
  } finally { await browser.close(); }
});

test('outcome labels, color and one-shot motion preserve chat geometry, routes and Back', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 650 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url);
      await page.waitForFunction(() => window.MistakeryApp?.view === 'playing');
      const pinnedHeight = await page.locator('[data-pinned]').evaluate(n => n.getBoundingClientRect().height);
      for (const [number, tone] of [[0, 'failure'], [1, 'success'], [2, 'catastrophic'], [3, 'success'], [4, 'failure']]) {
        await seed(page, `LIVE_AGENT_OUTCOME_${number}`);
        assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), tone);
        assert.equal(await page.locator('[data-outcome-label]').innerText(), tone === 'success' ? 'SUCCESS' : 'FAILURE');
        assert.equal(await page.locator('[data-pinned]').isVisible(), false);
        assert.equal(await page.locator('[data-choice]:disabled').count(), 0);
        assert.equal(await page.locator('[data-game]').evaluate(n => n.classList.contains('is-outcome-entering')), true);
        const motion = await page.locator('[data-scene]').evaluate(n => ({ pulse: getComputedStyle(n, '::after').animationName, count: getComputedStyle(n, '::after').animationIterationCount }));
        assert.equal(motion.pulse, 'outcomePulse');
        assert.equal(motion.count, '1');
        await page.locator('[data-game]').evaluate(async n => { await Promise.all(n.getAnimations({ subtree: true }).map(a => a.finished)); });
        const geometry = await page.evaluate(() => ({
          banner: document.querySelector('[data-outcome-banner]').getBoundingClientRect().height,
          overflow: document.documentElement.scrollWidth - innerWidth,
          chatOverflow: document.querySelector('[data-chat]').scrollWidth - document.querySelector('[data-chat]').clientWidth,
          choicesBottom: document.querySelector('[data-choices]').getBoundingClientRect().bottom,
          bubbleColor: getComputedStyle(document.querySelector('.message:not(.media-placeholder), .team-bubble')).backgroundColor,
        }));
        assert.equal(geometry.banner, pinnedHeight);
        assert.ok(geometry.overflow <= 1 && geometry.chatOverflow <= 1 && geometry.choicesBottom <= viewport.height + 1, JSON.stringify(geometry));
        assert.equal(geometry.bubbleColor, 'rgb(255, 255, 255)');
        if ([1, 2, 4].includes(number)) await page.screenshot({ path: `/tmp/mistakery-outcome-${number}-${viewport.width}.png` });
        const before = await page.evaluate(() => structuredClone(window.MistakeryApp.state));
        await page.evaluate(() => window.MistakeryApp.render());
        assert.equal(await page.locator('[data-game]').evaluate(n => n.classList.contains('is-outcome-entering')), false);
        assert.deepEqual(await page.evaluate(() => window.MistakeryApp.state), before);
      }
      // Real transition to an outcome, then leave and restore it through Back.
      await page.locator('[data-test-restart]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), null);
      await page.locator('[data-choice="right"]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), 'failure');
      assert.equal(await page.locator('[data-game]').evaluate(n => n.classList.contains('is-outcome-entering')), true);
      await page.waitForFunction(() => !window.MistakeryApp.locked);
      await page.locator('[data-choice="left"]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), null);
      assert.equal(await page.locator('[data-outcome-banner]').isVisible(), false);
      assert.equal(await page.locator('[data-pinned]').isVisible(), true);
      await page.locator('[data-test-back]').click();
      assert.equal(await page.locator('[data-game]').getAttribute('data-outcome'), 'failure');
      assert.equal(await page.locator('[data-game]').evaluate(n => n.classList.contains('is-outcome-entering')), false);
      await page.evaluate(() => window.MistakeryApp.render());
      assert.equal(await page.locator('[data-game]').evaluate(n => n.classList.contains('is-outcome-entering')), false);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await seed(page, 'LIVE_AGENT_OUTCOME_2');
      const reduced = await page.locator('[data-scene]').evaluate(n => ({ scene: getComputedStyle(n).animationName, pulse: getComputedStyle(n, '::after').animationName, image: getComputedStyle(n.querySelector('img')).animationName }));
      assert.deepEqual(reduced, { scene: 'none', pulse: 'none', image: 'none' });
      assert.equal(await page.locator('[data-outcome-label]').innerText(), 'FAILURE');
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
});
