const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

test('Padel images are compact, loaded before the court and reused across scenes', async () => {
  const assets = ['irl-padel-court.webp', 'irl-padel-coach-avatar.webp', 'irl-closedai-ceo-avatar.webp'];
  const requests = [];
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    requests.push(pathname);
    const filename = path.join(root, pathname === '/' ? 'index.html' : pathname);
    try {
      const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp' }[path.extname(filename)] || 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600' });
      response.end(fs.readFileSync(filename));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => Boolean(window.MistakeryApp?.deck));
    assert.equal(requests.some(url => /irl-.*\.(png|webp)/.test(url)), false, 'unrelated onboarding does not fetch Padel images');
    await page.evaluate(() => {
      const a = window.MistakeryApp;
      clearTimeout(a.introTypingTimer);
      a.introTypingTimer = null;
      a.state = window.MistakeryEngine.startRun(a.deck);
      a.state.currentCardId = 'OPEN_INVESTOR';
      a.view = 'playing';
      a.render();
    });
    await page.waitForLoadState('networkidle');
    for (const asset of assets) {
      assert.equal(requests.filter(url => url === `/assets/${asset}`).length, 1, `${asset} must load before entering Padel`);
    }
    assert.ok(assets.reduce((sum, asset) => sum + fs.statSync(path.join(root, 'assets', asset)).size, 0) < 400000, 'all Padel images fit within 400 KB');
    for (const id of ['PADEL_INVITE', 'DREAM_TEAM', 'IRL_PADEL_01', 'IRL_PADEL_03B', 'PADEL_OUTCOME_2', 'PADEL_OUTCOME_4']) {
      await page.evaluate(id => { const a = window.MistakeryApp; a.state.currentCardId = id; a.render(); }, id);
      const avatar = page.locator('.irl-avatar-photo');
      assert.equal(await page.locator('[data-card-id]').textContent(), id);
      if (id.startsWith('IRL_') || id.startsWith('PADEL_OUTCOME_')) {
        assert.equal(await avatar.count(), 1);
        await avatar.evaluate(img => img.decode());
        assert.deepEqual(await avatar.evaluate(img => [img.naturalWidth, img.naturalHeight]), [256, 256]);
        assert.match(await page.locator('[data-scene]').evaluate(n => getComputedStyle(n, '::after').backgroundImage), /irl-padel-court\.webp/);
      }
    }
    await page.waitForLoadState('networkidle');
    for (const asset of assets) assert.equal(requests.filter(url => url === `/assets/${asset}`).length, 1, `${asset} should reuse the preload`);
    assert.equal(requests.some(url => /irl-.*\.png/.test(url)), false, 'the game never downloads full-size PNG originals');
    await page.screenshot({ path: '/tmp/mistakery-padel-optimized.png', animations: 'disabled' });
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
