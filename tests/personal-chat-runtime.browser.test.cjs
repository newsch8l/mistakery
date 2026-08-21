const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const fileUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

async function clickCurrentChoice(page, side = 'left') {
  await page.locator(`[data-choices] [data-choice="${side}"], [data-choices] button`).first().click();
}

async function waitForMessageSettled(page) {
  await page.locator('[data-chat]').evaluate(async (node) => {
    await Promise.all(node.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
}

async function waitForOnboardingMessages(page, count) {
  await page.waitForFunction((expected) => (
    document.querySelectorAll('[data-message-stack] .message').length === expected
    && document.querySelectorAll('.typing-bubble').length === 0
  ), count);
}

async function replyGeometry(page) {
  return page.evaluate(() => {
    const message = document.querySelector('[data-chat] .message').getBoundingClientRect();
    const hint = document.querySelector('.reply-hint').getBoundingClientRect();
    const choices = document.querySelector('[data-choices]').getBoundingClientRect();
    return {
      messageToHint: hint.top - message.bottom,
      hintToChoices: choices.top - hint.bottom,
    };
  });
}

async function messengerChromeAnchors(page) {
  return page.evaluate(() => {
    const pinned = document.querySelector('[data-pinned]').getBoundingClientRect();
    const hint = document.querySelector('.reply-hint').getBoundingClientRect();
    const choices = document.querySelector('[data-choices]').getBoundingClientRect();
    return {
      pinnedTop: pinned.top,
      pinnedBottom: pinned.bottom,
      hintTop: hint.top,
      hintBottom: hint.bottom,
      choicesTop: choices.top,
    };
  });
}

async function pinnedShape(page) {
  return page.locator('[data-pinned]').evaluate((node) => {
    const style = getComputedStyle(node);
    const iconStyle = getComputedStyle(node.querySelector('.pin'));
    const rect = node.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
      margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft],
      radii: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius],
      backgroundColor: style.backgroundColor,
      boxShadow: style.boxShadow,
      gap: style.gap,
      alignItems: style.alignItems,
      iconFontSize: iconStyle.fontSize,
      iconLineHeight: iconStyle.lineHeight,
    };
  });
}

async function assertNoMessagesEndWithPeriod(page) {
  const terminalPeriods = await page.locator('[data-chat] .message, [data-chat] .self-message, [data-chat] .team-bubble, [data-chat] .irl-dialog').evaluateAll((messages) => (
    messages
      .map((message) => [...message.querySelectorAll('p')].map((paragraph) => paragraph.textContent).join('\n').trim())
      .filter((copy) => copy.endsWith('.'))
  ));
  assert.deepEqual(terminalPeriods, []);
}

async function assertNoExtraTeamLineSpacing(page) {
  const margins = await page.locator('.self-message p + p, .team-bubble p + p').evaluateAll((paragraphs) => (
    paragraphs.map((paragraph) => getComputedStyle(paragraph).marginTop)
  ));
  assert.deepEqual(margins, ['0px', '0px', '0px']);
}

async function assertIrlAvatar(page, expectedSrc) {
  const avatar = page.locator('[data-avatar]');
  const image = avatar.locator('img');
  assert.equal(await avatar.textContent(), '');
  assert.equal(await image.count(), 1);
  assert.equal(await image.getAttribute('src'), expectedSrc);
  assert.equal(await image.getAttribute('alt'), '');
  assert.equal(await image.evaluate((node) => node.complete && node.naturalWidth > 0), true);
  assert.deepEqual(await avatar.evaluate((node) => {
    const imageNode = node.querySelector('img');
    const avatarRect = node.getBoundingClientRect();
    const imageRect = imageNode.getBoundingClientRect();
    const avatarStyles = getComputedStyle(node);
    const imageStyles = getComputedStyle(imageNode);
    return {
      overflow: avatarStyles.overflow,
      radius: avatarStyles.borderRadius,
      imageWidthDelta: imageRect.width - avatarRect.width,
      imageHeightDelta: imageRect.height - avatarRect.height,
      imageLeftDelta: imageRect.left - avatarRect.left,
      imageTopDelta: imageRect.top - avatarRect.top,
      objectFit: imageStyles.objectFit,
      transform: imageStyles.transform,
    };
  }), {
    overflow: 'hidden',
    radius: '50%',
    imageWidthDelta: 0,
    imageHeightDelta: 0,
    imageLeftDelta: 0,
    imageTopDelta: 0,
    objectFit: 'cover',
    transform: 'none',
  });
}

async function assertIrlPadelScene(page) {
  assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'playing');
  assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'irl');
  assert.equal(await page.locator('[data-scene]').evaluate((node) => node.classList.contains('irl-scene')), true);
  assert.equal(await page.locator('[data-sender]').textContent(), 'Padel coach');
  assert.equal(await page.locator('[data-status]').textContent(), '');
  await assertIrlAvatar(page, 'assets/irl-padel-coach-avatar.png');
  assert.equal(await page.locator('[data-pinned]').evaluate((node) => node.classList.contains('irl-location')), true);
  assert.equal(await page.locator('[data-pinned] .pin').textContent(), '📍');
  assert.equal(await page.locator('[data-pinned] small').textContent(), 'IRL · PADEL CLUB');
  assert.equal(await page.locator('[data-pinned-title]').textContent(), 'Score: 0–0');
  assert.equal(await page.locator('[data-reply-hint]:visible').count(), 0);

  const dialogLines = page.locator('[data-chat] .irl-dialog p');
  assert.deepEqual((await dialogLines.allTextContents()).map((line) => line.replace(/\u00a0/g, ' ')), [
    'Bro, you do NOT pitch here.',
    "Start selling, and you're a nobody to him.",
    'Earn his respect on the court first',
  ]);
  assert.deepEqual(await page.locator('[data-chat] .irl-dialog p + p').evaluateAll((paragraphs) => (
    paragraphs.map((paragraph) => getComputedStyle(paragraph).marginTop)
  )), ['0px', '0px']);
  assert.equal(await dialogLines.first().evaluate((node) => getComputedStyle(node).fontSize), '14px');
  assert.equal(await dialogLines.first().evaluate((node) => getComputedStyle(node).fontWeight), '400');
  assert.deepEqual(await page.locator('[data-choices] button').allTextContents(), [
    'Mouth shut, game on',
    'Now or never, pitching',
  ]);
  await assertNoMessagesEndWithPeriod(page);

  const geometry = await page.evaluate(() => {
    const scene = document.querySelector('[data-scene]');
    const chat = document.querySelector('[data-chat]').getBoundingClientRect();
    const dialog = document.querySelector('.irl-dialog').getBoundingClientRect();
    const location = document.querySelector('.irl-location').getBoundingClientRect();
    const choices = document.querySelector('[data-choices]').getBoundingClientRect();
    return {
      dialogCenterDelta: (dialog.left + dialog.width / 2) - (chat.left + chat.width / 2),
      locationToDialog: dialog.top - location.bottom,
      dialogToChoices: choices.top - dialog.bottom,
      backgroundImage: getComputedStyle(scene, '::after').backgroundImage,
      backgroundFilter: getComputedStyle(scene, '::after').filter,
      backgroundPosition: getComputedStyle(scene, '::after').backgroundPosition,
      backgroundInset: getComputedStyle(scene, '::after').inset,
      backgroundRadius: getComputedStyle(scene, '::after').borderRadius,
      backgroundShadow: getComputedStyle(scene, '::after').boxShadow,
      backgroundClipPath: getComputedStyle(scene, '::after').clipPath,
      frameImage: getComputedStyle(scene, '::before').backgroundImage,
      frameColor: getComputedStyle(scene, '::before').backgroundColor,
      sceneOverflow: scene.scrollHeight - scene.clientHeight,
      pageX: document.documentElement.scrollWidth - innerWidth,
      pageY: document.documentElement.scrollHeight - innerHeight,
    };
  });
  assert.ok(Math.abs(geometry.dialogCenterDelta) < 0.75, JSON.stringify(geometry));
  assert.ok(geometry.locationToDialog >= 0, JSON.stringify(geometry));
  assert.ok(geometry.dialogToChoices >= 0, JSON.stringify(geometry));
  assert.match(geometry.backgroundImage, /irl-padel-court\.png/);
  assert.match(geometry.backgroundImage, /rgba\(7, 20, 32, 0\.12\)[\s\S]*rgba\(7, 20, 32, 0\.22\) 48%[\s\S]*rgba\(7, 20, 32, 0\.38\)/);
  assert.equal(geometry.backgroundFilter, 'blur(1.8px) saturate(0.88)');
  assert.match(geometry.backgroundPosition, /50% 54%/);
  assert.equal(geometry.backgroundInset, '1px');
  assert.equal(geometry.backgroundRadius, '25px');
  assert.equal(geometry.backgroundShadow, 'none');
  assert.equal(geometry.backgroundClipPath, 'inset(0px round 25px)');
  assert.equal(geometry.frameImage, 'none');
  assert.equal(geometry.frameColor, 'rgb(210, 219, 225)');
  assert.equal(geometry.sceneOverflow, 0);
  assert.equal(geometry.pageX, 0);
  assert.equal(geometry.pageY, 0);
}

async function chooseAndWaitForCard(page, side, id) {
  await page.waitForFunction(() => window.MistakeryApp.locked === false);
  await page.locator(`[data-choice="${side}"]`).click();
  await page.waitForFunction((expected) => document.querySelector('[data-card-id]')?.textContent === expected, id);
  await waitForMessageSettled(page);
}

async function assertIrlCardContent(page, expected) {
  assert.equal(await page.locator('[data-card-id]').textContent(), expected.id);
  assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'playing');
  assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'irl');
  assert.equal(await page.locator('[data-sender]').textContent(), expected.sender);
  await assertIrlAvatar(page, expected.avatarSrc);
  assert.equal(await page.locator('[data-pinned-title]').textContent(), expected.score);
  assert.deepEqual(
    (await page.locator('[data-chat] .irl-dialog p').allTextContents()).map((line) => line.replace(/\u00a0/g, ' ')),
    expected.lines,
  );
  assert.deepEqual(await page.locator('[data-choices] button').allTextContents(), expected.choices);
  assert.equal(await page.locator('[data-chat] .irl-dialog p').first().evaluate((node) => getComputedStyle(node).fontWeight), '400');
  assert.deepEqual(await page.evaluate(() => ({
    scene: document.querySelector('[data-scene]').scrollHeight - document.querySelector('[data-scene]').clientHeight,
    x: document.documentElement.scrollWidth - innerWidth,
    y: document.documentElement.scrollHeight - innerHeight,
  })), { scene: 0, x: 0, y: 0 });
}

async function setPadelRuntimeCard(page, id, ceoScore, randomValues = []) {
  await page.evaluate(({ cardId, score, values }) => {
    const app = window.MistakeryApp;
    window.clearTimeout(app.introTypingTimer);
    app.state = window.MistakeryEngine.startRun(app.deck);
    app.state.currentCardId = cardId;
    app.padelCeoScore = score;
    app.locked = false;
    app.view = 'playing';
    let randomIndex = 0;
    window.__padelRandomCalls = 0;
    Math.random = () => {
      window.__padelRandomCalls += 1;
      const value = values[randomIndex];
      randomIndex += 1;
      return value == null ? 0 : value;
    };
    app.render();
  }, { cardId: id, score: ceoScore, values: randomValues });
  await waitForMessageSettled(page);
}

async function currentRuntimeState(page) {
  return page.evaluate(() => ({
    cardId: document.querySelector('[data-card-id]')?.textContent,
    ceoScore: window.MistakeryApp.padelCeoScore,
    resources: { ...window.MistakeryApp.state.resources },
    randomCalls: window.__padelRandomCalls,
  }));
}

test('Feeling sick opens chat Outcome 0 without activating an IRL scene', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.MistakeryApp?.deck));
    await setPadelRuntimeCard(page, 'PADEL_INVITE', 0);
    const resources = (await currentRuntimeState(page)).resources;

    await chooseAndWaitForCard(page, 'right', 'PADEL_OUTCOME_0');
    assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'personal');
    assert.equal(await page.locator('[data-sender]').textContent(), '@padel_pro');
    assert.equal(await page.locator('[data-avatar]').textContent(), 'P');
    assert.equal(await page.locator('[data-avatar] img').count(), 0);
    assert.deepEqual(
      (await page.locator('[data-chat] .message p').allTextContents()).map((line) => line.replace(/\u00a0/g, ' ')),
      ['Man... for real?', 'I risked my own reputation to give you a golden ticket and you backed out.', 'You just clowned both of us'],
    );
    assert.deepEqual(await page.locator('[data-choices] button').allTextContents(), ['I have a fever!', '😔😔😔']);
    assert.deepEqual((await currentRuntimeState(page)).resources, resources);
    assert.equal(await page.locator('[data-ceo-score]').count(), 0);
    assert.doesNotMatch(await page.locator('body').textContent(), /CEO[- ]score/i);
  } finally {
    await browser.close();
  }
});

test('Card 6 outcome probabilities and final match statuses use the exact score-specific boundaries', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const cases = [
    { score: -2, side: 'left', random: [0.599999], outcome: 3, calls: 1 },
    { score: -2, side: 'left', random: [0.6], outcome: 4, calls: 1 },
    { score: 0, side: 'left', random: [0.499999], outcome: 3, calls: 1 },
    { score: 0, side: 'left', random: [0.5], outcome: 4, calls: 1 },
    { score: 2, side: 'left', random: [0.599999], outcome: 3, calls: 1 },
    { score: 2, side: 'left', random: [0.6], outcome: 4, calls: 1 },
    { score: -2, side: 'right', random: [0.499999, 0.599999], outcome: 1, calls: 2 },
    { score: -2, side: 'right', random: [0.499999, 0.6], outcome: 2, calls: 2 },
    { score: -2, side: 'right', random: [0.5, 0.399999], outcome: 5, calls: 2 },
    { score: -2, side: 'right', random: [0.5, 0.4], outcome: 6, calls: 2 },
    { score: 0, side: 'right', random: [0.499999, 0.499999], outcome: 1, calls: 2 },
    { score: 0, side: 'right', random: [0.499999, 0.5], outcome: 2, calls: 2 },
    { score: 0, side: 'right', random: [0.5, 0.499999], outcome: 5, calls: 2 },
    { score: 0, side: 'right', random: [0.5, 0.5], outcome: 6, calls: 2 },
    { score: 2, side: 'right', random: [0.499999, 0.599999], outcome: 1, calls: 2 },
    { score: 2, side: 'right', random: [0.499999, 0.6], outcome: 2, calls: 2 },
    { score: 2, side: 'right', random: [0.5, 0.399999], outcome: 5, calls: 2 },
    { score: 2, side: 'right', random: [0.5, 0.4], outcome: 6, calls: 2 },
  ];

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.MistakeryApp?.deck));
    for (const scenario of cases) {
      await setPadelRuntimeCard(page, 'IRL_PADEL_06', scenario.score, scenario.random);
      assert.equal(
        await page.locator('[data-pinned-title]').textContent(),
        'Score: 5–5 · 40–40 · DECIDING POINT',
        JSON.stringify(scenario),
      );
      const resources = (await currentRuntimeState(page)).resources;
      await chooseAndWaitForCard(page, scenario.side, `PADEL_OUTCOME_${scenario.outcome}`);
      const state = await currentRuntimeState(page);
      assert.equal(state.ceoScore, scenario.score, JSON.stringify(scenario));
      assert.equal(state.randomCalls, scenario.calls, JSON.stringify(scenario));
      assert.deepEqual(state.resources, resources, JSON.stringify(scenario));
      assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'irl');
      assert.equal(
        await page.locator('[data-pinned-title]').textContent(),
        scenario.outcome <= 2 ? 'YOU WON THE MATCH' : 'YOU LOST THE MATCH',
        JSON.stringify(scenario),
      );
    }
  } finally {
    await browser.close();
  }
});

test('both replies on every outcome clear Padel state and restart through Saved Messages', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => Boolean(window.MistakeryApp?.deck));
    for (let outcome = 0; outcome <= 7; outcome += 1) {
      for (const side of ['left', 'right']) {
        await setPadelRuntimeCard(page, `PADEL_OUTCOME_${outcome}`, 2);
        const resources = (await currentRuntimeState(page)).resources;
        await page.locator(`[data-choice="${side}"]`).click();
        await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_02_UPDATE');
        const state = await currentRuntimeState(page);
        assert.equal(state.ceoScore, null, `Outcome ${outcome} ${side}`);
        assert.deepEqual(state.resources, resources, `Outcome ${outcome} ${side}`);
      }
    }

    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'OPEN_01');
    assert.equal((await currentRuntimeState(page)).ceoScore, null);
    assert.equal(await page.evaluate(() => window.MistakeryApp.state.turn), 1);
  } finally {
    await browser.close();
  }
});

test('first onboarding typing reserves the final CTA geometry without a vertical jump', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForSelector('.typing-bubble');
    await page.locator('.typing-bubble').evaluate((node) => {
      node.getAnimations().find((animation) => animation.animationName === 'messagePop')?.finish();
    });
    const typingGeometry = await page.evaluate(() => {
      const bubble = document.querySelector('.typing-bubble').getBoundingClientRect();
      const choices = document.querySelector('[data-choices]');
      const choicesRect = choices.getBoundingClientRect();
      const reservedChoice = choices.querySelector('[data-choice]');
      const reservedRect = reservedChoice?.getBoundingClientRect();
      return {
        bubbleBottom: bubble.bottom,
        choicesHeight: choicesRect.height,
        reservedCount: choices.querySelectorAll('[data-choice]').length,
        reservedDisabled: reservedChoice?.disabled ?? false,
        reservedVisibility: reservedChoice ? getComputedStyle(reservedChoice).visibility : 'missing',
        typingToChoice: reservedRect ? reservedRect.top - bubble.bottom : null,
      };
    });

    await waitForOnboardingMessages(page, 1);
    await waitForMessageSettled(page);
    const messageGeometry = await page.evaluate(() => {
      const message = document.querySelector('[data-chat] .message').getBoundingClientRect();
      const choice = document.querySelector('[data-choices] [data-choice]').getBoundingClientRect();
      const choices = document.querySelector('[data-choices]').getBoundingClientRect();
      return {
        messageBottom: message.bottom,
        choicesHeight: choices.height,
        messageToChoice: choice.top - message.bottom,
      };
    });

    const checks = {
      hasOneReservedChoice: typingGeometry.reservedCount === 1,
      reservedChoiceIsDisabled: typingGeometry.reservedDisabled,
      reservedChoiceIsHidden: typingGeometry.reservedVisibility === 'hidden',
      CTAHeightIsReserved: Math.abs(typingGeometry.choicesHeight - messageGeometry.choicesHeight) < 0.75,
      typingIsAboveReservedCTA: typingGeometry.typingToChoice !== null
        && Math.abs(typingGeometry.typingToChoice - 16) < 0.75,
      typingAndMessageShareBottom: Math.abs(typingGeometry.bubbleBottom - messageGeometry.messageBottom) < 0.75,
      messageKeepsBaseGap: Math.abs(messageGeometry.messageToChoice - 16) < 0.75,
    };
    assert.deepEqual(checks, Object.fromEntries(Object.keys(checks).map((key) => [key, true])), JSON.stringify({
      typingGeometry,
      messageGeometry,
    }));
  } finally {
    await browser.close();
  }
});

test('approved onboarding and Saved Messages lead into the six-card opening', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => { Math.random = () => 0; });

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForSelector('[data-view="onboarding"]');

    assert.equal(await page.locator('.typing-bubble').count(), 1);
    assert.equal(await page.locator('.typing-bubble i').count(), 3);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 0);
    await waitForOnboardingMessages(page, 1);
    await assertNoMessagesEndWithPeriod(page);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 1);
    assert.equal(await page.locator('[data-message-stack] .message').first().locator('p').count(), 1);
    assert.equal(await page.locator('[data-message-stack] .message').first().locator('br').count(), 1);
    assert.equal(await page.locator('[data-game]').getAttribute('data-shell-stage'), 'intro');
    assert.equal(await page.locator('[data-pinned]:visible').count(), 0);
    assert.ok(await page.locator('[data-choices]').evaluate((node) => node.getBoundingClientRect().height < 90));
    await waitForMessageSettled(page);
    const onboardingGeometry = await page.evaluate(() => {
      const chat = document.querySelector('[data-chat]');
      const message = chat.querySelector('.message').getBoundingClientRect();
      const choice = document.querySelector('[data-choices] button').getBoundingClientRect();
      const style = getComputedStyle(chat);
      return {
        justifyContent: style.justifyContent,
        messageToChoice: choice.top - message.bottom,
      };
    });
    assert.equal(onboardingGeometry.justifyContent, 'flex-end');
    assert.ok(Math.abs(onboardingGeometry.messageToChoice - 16) < 0.75, JSON.stringify(onboardingGeometry));

    await clickCurrentChoice(page);
    assert.equal(await page.locator('.typing-bubble').count(), 1);
    assert.equal(await page.locator('.typing-bubble i').count(), 3);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 1);
    assert.equal(await page.locator('[data-choices] button:disabled').count(), 1);
    await waitForOnboardingMessages(page, 2);
    await assertNoMessagesEndWithPeriod(page);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 2);
    assert.equal(await page.locator('[data-message-stack] .message').nth(1).locator('p').count(), 1);
    assert.equal(await page.locator('[data-message-stack] .message').nth(1).locator('br').count(), 1);
    assert.equal(await page.locator('[data-game]').getAttribute('data-shell-stage'), 'optimistic');
    assert.deepEqual(await page.locator('[data-resource]').evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.fill))), [100, 100, 100, 100]);

    await clickCurrentChoice(page);
    assert.equal(await page.locator('.typing-bubble').count(), 1);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 2);
    await waitForOnboardingMessages(page, 3);
    await assertNoMessagesEndWithPeriod(page);
    assert.equal(await page.locator('[data-message-stack] .message').count(), 3);
    assert.equal(await page.locator('[data-message-stack] .message').nth(2).locator('p').count(), 2);
    assert.equal(await page.locator('[data-game]').getAttribute('data-shell-stage'), 'real');
    assert.deepEqual(await page.locator('[data-resource]').evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.fill))), [25, 60, 15, 65]);
    assert.equal(await page.locator('[data-restart-run]').isDisabled(), true);

    await clickCurrentChoice(page);
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_01_PLAN');
    assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'saved');
    assert.equal(await page.locator('[data-pinned]:visible').count(), 0);
    assert.match(await page.locator('[data-chat]').textContent(), /NEVER WORK AGAIN PLAN/);
    await assertNoMessagesEndWithPeriod(page);
    await waitForMessageSettled(page);
    const savedGeometry = await replyGeometry(page);
    assert.ok(Math.abs(savedGeometry.messageToHint - 16) < 0.75, JSON.stringify(savedGeometry));
    assert.ok(Math.abs(savedGeometry.hintToChoices - 8) < 0.75, JSON.stringify(savedGeometry));

    await clickCurrentChoice(page);
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_02_UPDATE');
    const founderUpdateMessages = page.locator('[data-chat] .note-message');
    assert.equal(await founderUpdateMessages.count(), 2);
    assert.equal(await page.locator('.typing-bubble').count(), 0);
    assert.match(await founderUpdateMessages.nth(0).textContent(), /5\s+MONTHS\s+AS\s+A\s+FOUNDER/);
    assert.doesNotMatch(await founderUpdateMessages.nth(0).textContent(), /IN\s+PROGRESS/);
    assert.match(await founderUpdateMessages.nth(1).textContent(), /IN\s+PROGRESS/);
    assert.match(await founderUpdateMessages.nth(1).textContent(), /9\.\s+Unicorn/);
    await assertNoMessagesEndWithPeriod(page);

    await clickCurrentChoice(page);
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'OPEN_01');
    await waitForMessageSettled(page);
    assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'playing');
    assert.equal(await page.locator('[data-pinned]:visible').count(), 1);
    assert.equal(await page.locator('[data-reply-hint]:visible').count(), 1);
    await assertNoMessagesEndWithPeriod(page);

    const geometry = await page.evaluate(() => {
      const message = document.querySelector('[data-chat] .message').getBoundingClientRect();
      const messageRow = document.querySelector('[data-chat] .message-row').getBoundingClientRect();
      const clearance = document.querySelector('.message-clearance').getBoundingClientRect();
      const hint = document.querySelector('.reply-hint').getBoundingClientRect();
      const hintDock = document.querySelector('[data-reply-hint]').getBoundingClientRect();
      const choices = document.querySelector('[data-choices]').getBoundingClientRect();
      const phone = document.querySelector('[data-game]').getBoundingClientRect();
      const chatNode = document.querySelector('[data-chat]');
      const chatRect = chatNode.getBoundingClientRect();
      const chat = getComputedStyle(chatNode);
      return {
        messageToHint: hint.top - message.bottom,
        hintToChoices: choices.top - hint.bottom,
        messageBottom: message.bottom,
        messageRowBottom: messageRow.bottom,
        clearanceTop: clearance.top,
        clearanceBottom: clearance.bottom,
        clearanceHeight: clearance.height,
        chatTop: chatRect.top,
        chatBottom: chatRect.bottom,
        hintDockTop: hintDock.top,
        hintTop: hint.top,
        phoneWidth: phone.width,
        phoneHeight: phone.height,
        chatOverflow: chat.overflow,
        pageX: document.documentElement.scrollWidth - window.innerWidth,
        pageY: document.documentElement.scrollHeight - window.innerHeight,
      };
    });
    assert.ok(Math.abs(geometry.messageToHint - 16) < 0.75, JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.hintToChoices - 8) < 0.75, JSON.stringify(geometry));
    assert.equal(geometry.chatOverflow, 'visible');
    assert.equal(geometry.phoneWidth, 340);
    assert.equal(geometry.phoneHeight, 700);
    assert.equal(geometry.pageX, 0);
    assert.equal(geometry.pageY, 0);

    const rendered = ['OPEN_01'];
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'OPEN_02a');
    rendered.push('OPEN_02a');
    await assertNoMessagesEndWithPeriod(page);
    let cardMessages = page.locator('[data-chat] .message');
    assert.equal(await cardMessages.count(), 2);
    assert.match(await cardMessages.nth(0).textContent(), /Competitor analysis complete/);
    assert.doesNotMatch(await cardMessages.nth(0).textContent(), /motivational quote/);
    assert.match(await cardMessages.nth(1).textContent(), /motivational quote/);

    while ((await page.locator('[data-card-id]').textContent()) !== 'OPEN_INVESTOR') {
      await page.locator('[data-choice="left"]').click();
      await waitForMessageSettled(page);
      const cardId = await page.locator('[data-card-id]').textContent();
      rendered.push(cardId);
      await assertNoMessagesEndWithPeriod(page);
      cardMessages = page.locator('[data-chat] .message');
      if (cardId === 'OPEN_DEV') {
        assert.equal(await cardMessages.count(), 2);
        assert.match((await cardMessages.nth(0).textContent()).trim(), /^payroll\s+is\s+friday$/);
        assert.match((await cardMessages.nth(1).textContent()).trim(), /^are\s+we\s+getting\s+money\s+or\s+another\s+speech\s+about\s+changing\s+b2b\s+saas\s+forever\?$/);
      }
      if (cardId === 'OPEN_INVESTOR') {
        assert.equal(await cardMessages.count(), 3);
        assert.match(await cardMessages.nth(0).textContent(), /I\s+DIDN’T\s+DUMP\s+MY\s+CASH\s+INTO\s+THIS\s+AI\s+CRAP\s+TO\s+GET\s+ZERO\s+CLIENTS$/);
        assert.match(await cardMessages.nth(1).textContent(), /WHERE\s+THE\s+HELL\s+ARE\s+THE\s+BUYERS\?\?\?/);
        assert.match(await cardMessages.nth(2).textContent(), /IF\s+I\s+WANTED\s+TO\s+WASTE\s+MONEY\s+I’D\s+BUY\s+A\s+YACHT\s+FOR\s+MY\s+EX-WIFE$/);
        assert.deepEqual(await cardMessages.evaluateAll((messages) => messages.map((message) => ({
          bottomLeft: getComputedStyle(message).borderBottomLeftRadius,
          animated: message.classList.contains('is-pop'),
        }))), [
          { bottomLeft: '9px', animated: true },
          { bottomLeft: '9px', animated: true },
          { bottomLeft: '6px', animated: true },
        ]);
      }
      assert.ok(rendered.length < 8, `opening did not reach Investor: ${rendered.join(' -> ')}`);
    }

    const allowed = new Set(['OPEN_01', 'OPEN_02a', 'OPEN_02b', 'OPEN_BOSS', 'OPEN_DEV', 'OPEN_INVESTOR', 'PADEL_INVITE', 'DREAM_TEAM', 'IRL_PADEL_01', 'IRL_PADEL_03B', 'IRL_PADEL_04', 'IRL_PADEL_05', 'IRL_PADEL_06']);
    for (const id of rendered) assert.ok(allowed.has(id), `disabled card rendered: ${id}`);

    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'PADEL_INVITE');
    rendered.push('PADEL_INVITE');
    await waitForMessageSettled(page);
    assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'playing');
    assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'personal');
    assert.equal(await page.locator('[data-sender]').textContent(), '@padel_pro');
    assert.equal(await page.locator('[data-status]').textContent(), 'Padel Coach · online');
    assert.equal(await page.locator('[data-avatar]').textContent(), 'P');
    assert.equal(await page.locator('[data-avatar] img').count(), 0);
    assert.equal(await page.locator('.typing-bubble').count(), 0);
    const padelMessages = page.locator('[data-chat] .message');
    assert.equal(await padelMessages.count(), 2);
    assert.match(await padelMessages.nth(0).textContent(), /Yo\s+champ,\s+anyone\s+in\s+the\s+club[\s\S]*Tomorrow\s+7\s+AM\s+vs\s+ClosedAI\s+CEO$/);
    assert.match(await padelMessages.nth(1).textContent(), /That’s\s+your\s+dream\s+client,\s+man\.\s+Remember\s+who\s+opened\s+this\s+door\s+for\s+you$/);
    assert.deepEqual(await page.locator('[data-choices] button').allTextContents(), ["I'm in", 'Feeling sick, pass']);
    assert.deepEqual(await padelMessages.evaluateAll((messages) => messages.map((message) => message.classList.contains('is-pop'))), [true, true]);
    await assertNoMessagesEndWithPeriod(page);
    const desktopPersonalAnchors = await messengerChromeAnchors(page);
    const desktopPinnedShape = await pinnedShape(page);

    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'DREAM_TEAM');
    rendered.push('DREAM_TEAM');
    await waitForMessageSettled(page);
    assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'team');
    assert.equal(await page.locator('[data-scene]').evaluate((node) => node.classList.contains('team-scene')), true);
    assert.equal(await page.locator('[data-sender]').textContent(), 'Dream Team');
    assert.equal(await page.locator('[data-status]').textContent(), '6 members · 3 online');
    assert.equal(await page.locator('[data-avatar]').textContent(), 'DT');
    assert.equal(await page.locator('[data-pinned]:visible').count(), 1);
    assert.equal(await page.locator('.typing-bubble').count(), 0);

    const founderMessage = page.locator('[data-chat] .self-message');
    const teamRows = page.locator('[data-chat] .team-row');
    assert.equal(await founderMessage.count(), 1);
    assert.equal(await teamRows.count(), 2);
    assert.match(await founderMessage.textContent(), /Guess\s+what\?\s+Playing\s+padel\s+with\s+ClosedAI's\s+CEO\s+tomorrow\.[\s\S]*Finally\s+landing\s+our\s+first\s+big\s+client!!\s+💸/);
    assert.deepEqual(await teamRows.evaluateAll((rows) => rows.map((row) => ({
      source: row.dataset.source,
      avatar: row.querySelector('.member-avatar')?.textContent,
      meta: row.querySelector('.team-meta')?.textContent,
      text: [...row.querySelectorAll('.team-bubble p')]
        .map((paragraph) => paragraph.textContent.replace(/\u00a0/g, ' ').trim())
        .join('\n'),
    }))), [
      {
        source: '@bigdeals',
        avatar: 'BD',
        meta: '@bigdeals',
        text: 'Insane pull, boss! 🎯\nNow let him win. Stroke his ego and we close this easily',
      },
      {
        source: '@hype_queen',
        avatar: 'HQ',
        meta: '@hype_queen',
        text: 'nah, smoke him. pure clout for us\nimagine the feed: no-name startup founder violates ClosedAI CEO in 4K 💀',
      },
    ]);
    assert.deepEqual(await page.locator('[data-choices] button').allTextContents(), ["I'll play nice 😇", 'We’ll see']);
    assert.equal(await page.locator('[data-chat] .is-pop').count(), 3);
    assert.equal(await founderMessage.locator('p').first().evaluate((node) => getComputedStyle(node).fontSize), '12.2px');
    assert.equal(await teamRows.first().locator('.team-bubble p').first().evaluate((node) => getComputedStyle(node).fontSize), '12.2px');
    await assertNoExtraTeamLineSpacing(page);
    await assertNoMessagesEndWithPeriod(page);

    const teamGeometry = await page.evaluate(() => {
      const messages = document.querySelectorAll('[data-chat] .self-message, [data-chat] .team-bubble');
      const lastMessage = messages[messages.length - 1].getBoundingClientRect();
      const hint = document.querySelector('.reply-hint').getBoundingClientRect();
      const choices = document.querySelector('[data-choices]').getBoundingClientRect();
      const scene = document.querySelector('[data-scene]');
      return {
        lastMessageToHint: hint.top - lastMessage.bottom,
        hintToChoices: choices.top - hint.bottom,
        sceneOverflow: scene.scrollHeight - scene.clientHeight,
        pageX: document.documentElement.scrollWidth - innerWidth,
        pageY: document.documentElement.scrollHeight - innerHeight,
      };
    });
    assert.ok(Math.abs(teamGeometry.lastMessageToHint - 16) < 0.75, JSON.stringify(teamGeometry));
    assert.ok(Math.abs(teamGeometry.hintToChoices - 8) < 0.75, JSON.stringify(teamGeometry));
    assert.equal(teamGeometry.sceneOverflow, 0);
    assert.equal(teamGeometry.pageX, 0);
    assert.equal(teamGeometry.pageY, 0);
    assert.deepEqual(await messengerChromeAnchors(page), desktopPersonalAnchors);

    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'IRL_PADEL_01');
    rendered.push('IRL_PADEL_01');
    await waitForMessageSettled(page);
    await assertIrlPadelScene(page);
    assert.deepEqual(await pinnedShape(page), desktopPinnedShape);
    await chooseAndWaitForCard(page, 'left', 'IRL_PADEL_04');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), 0);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_04',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'Score: 0–0',
      lines: ['We skip the side switching.', 'You won’t melt after a couple of sets in the sun, right?'],
      choices: ['Happy to take it', "Let's stick to rules"],
    });
    await chooseAndWaitForCard(page, 'left', 'IRL_PADEL_05');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), -1);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_05',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'Score: 4–4',
      lines: ['THAT BALL WAS OUT! Are you blind???', 'Don’t even try to cheat me. That’s my point'],
      choices: ['Definitely out, my bad', "No way, that's in"],
    });
    await chooseAndWaitForCard(page, 'left', 'IRL_PADEL_06');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), -2);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_06',
      sender: 'Padel coach',
      avatarSrc: 'assets/irl-padel-coach-avatar.png',
      score: 'Score: 5–5 · 40–40 · DECIDING POINT',
      lines: ['Match point, bro. Give him the win.', "The best shot right now is the one you don't take"],
      choices: ["I'll throw it, coach", 'Fighting till the end'],
    });
    await page.waitForFunction(() => window.MistakeryApp.locked === false);
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'PADEL_OUTCOME_3');
    await assertIrlCardContent(page, {
      id: 'PADEL_OUTCOME_3',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'YOU LOST THE MATCH',
      lines: ['Easiest win of my life.', 'It was almost cute watching you panic on match point.', 'Knew you were soft from the start. Get off my court'],
      choices: ['Just let you win!', 'So... about the deal?'],
    });
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), -2);
    await page.waitForFunction(() => window.MistakeryApp.locked === false);
    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_02_UPDATE');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), null);
    assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'saved');
    assert.match(await page.locator('[data-chat]').textContent(), /5\s+MONTHS\s+AS\s+A\s+FOUNDER/);
    assert.doesNotMatch(
      await page.locator('body').textContent(),
      /NEXT CONTENT DISABLED|(?:^|[^A-Z0-9_])(?:AGENT_01|PADEL_01|PADEL_02)(?:$|[^A-Z0-9_])/,
    );
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('compact viewport keeps the right opening branch inside the approved runtime', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 650 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => { Math.random = () => 0; });

  try {
    await page.goto(fileUrl, { waitUntil: 'load' });
    for (let step = 0; step < 3; step += 1) {
      await waitForOnboardingMessages(page, step + 1);
      await clickCurrentChoice(page);
    }
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_01_PLAN');
    assert.equal(await page.locator('[data-scene]').evaluate((node) => node.scrollHeight - node.clientHeight), 0);

    await page.locator('[data-choice="right"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_02_UPDATE');
    assert.equal(await page.locator('[data-chat] .note-message').count(), 2);
    await waitForMessageSettled(page);
    assert.equal(await page.locator('[data-scene]').evaluate((node) => node.scrollHeight - node.clientHeight), 0);
    const compactSavedGeometry = await page.evaluate(() => {
      const contact = document.querySelector('.contact').getBoundingClientRect();
      const chip = document.querySelector('.date-chip').getBoundingClientRect();
      const firstMessage = document.querySelector('[data-chat] .note-message').getBoundingClientRect();
      return {
        contactBottom: contact.bottom,
        chipTop: chip.top,
        chipBottom: chip.bottom,
        firstMessageTop: firstMessage.top,
      };
    });
    assert.ok(compactSavedGeometry.chipTop >= compactSavedGeometry.contactBottom, JSON.stringify(compactSavedGeometry));
    assert.ok(compactSavedGeometry.firstMessageTop >= compactSavedGeometry.chipBottom, JSON.stringify(compactSavedGeometry));
    await page.locator('[data-choice="right"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'OPEN_01');
    await assertNoMessagesEndWithPeriod(page);

    const route = ['OPEN_01'];
    while ((await page.locator('[data-card-id]').textContent()) !== 'OPEN_INVESTOR') {
      await page.locator('[data-choice="right"]').click();
      await waitForMessageSettled(page);
      route.push(await page.locator('[data-card-id]').textContent());
      await assertNoMessagesEndWithPeriod(page);
      assert.ok(route.length < 8, `opening did not reach Investor: ${route.join(' -> ')}`);
    }
    assert.deepEqual(route, ['OPEN_01', 'OPEN_02b', 'OPEN_BOSS', 'OPEN_DEV', 'OPEN_INVESTOR']);
    assert.equal(await page.locator('[data-chat] .message').count(), 3);
    const compactInvestorGeometry = await page.evaluate(() => {
      const pinned = document.querySelector('[data-pinned]').getBoundingClientRect();
      const messages = document.querySelectorAll('[data-chat] .message');
      const firstMessage = messages[0].getBoundingClientRect();
      const lastMessage = messages[messages.length - 1].getBoundingClientRect();
      const hint = document.querySelector('.reply-hint').getBoundingClientRect();
      const scene = document.querySelector('[data-scene]');
      return {
        pinnedBottom: pinned.bottom,
        firstMessageTop: firstMessage.top,
        lastMessageToHint: hint.top - lastMessage.bottom,
        sceneOverflow: scene.scrollHeight - scene.clientHeight,
      };
    });
    assert.ok(compactInvestorGeometry.firstMessageTop >= compactInvestorGeometry.pinnedBottom, JSON.stringify(compactInvestorGeometry));
    assert.ok(Math.abs(compactInvestorGeometry.lastMessageToHint - 16) < 0.75, JSON.stringify(compactInvestorGeometry));
    assert.equal(compactInvestorGeometry.sceneOverflow, 0);

    await page.locator('[data-choice="right"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'PADEL_INVITE');
    assert.equal(await page.locator('[data-chat] .message').count(), 2);
    await assertNoMessagesEndWithPeriod(page);
    const compactPersonalAnchors = await messengerChromeAnchors(page);
    const compactPinnedShape = await pinnedShape(page);
    await page.waitForFunction(() => window.MistakeryApp.locked === false);

    await page.locator('[data-choice="left"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'DREAM_TEAM');
    await waitForMessageSettled(page);
    assert.equal(await page.locator('[data-scene]').getAttribute('data-mode'), 'team');
    assert.equal(await page.locator('[data-chat] .self-message').count(), 1);
    assert.equal(await page.locator('[data-chat] .team-row').count(), 2);
    await assertNoExtraTeamLineSpacing(page);
    await assertNoMessagesEndWithPeriod(page);
    const compactTeamGeometry = await page.evaluate(() => {
      const pinned = document.querySelector('[data-pinned]').getBoundingClientRect();
      const firstMessage = document.querySelector('[data-chat] .self-message').getBoundingClientRect();
      const teamBubbles = document.querySelectorAll('[data-chat] .team-bubble');
      const lastMessage = teamBubbles[teamBubbles.length - 1].getBoundingClientRect();
      const hint = document.querySelector('.reply-hint').getBoundingClientRect();
      const choices = document.querySelector('[data-choices]').getBoundingClientRect();
      const scene = document.querySelector('[data-scene]');
      return {
        pinnedBottom: pinned.bottom,
        firstMessageTop: firstMessage.top,
        lastMessageToHint: hint.top - lastMessage.bottom,
        hintToChoices: choices.top - hint.bottom,
        sceneOverflow: scene.scrollHeight - scene.clientHeight,
      };
    });
    assert.ok(compactTeamGeometry.firstMessageTop >= compactTeamGeometry.pinnedBottom, JSON.stringify(compactTeamGeometry));
    assert.ok(Math.abs(compactTeamGeometry.lastMessageToHint - 16) < 0.75, JSON.stringify(compactTeamGeometry));
    assert.ok(Math.abs(compactTeamGeometry.hintToChoices - 8) < 0.75, JSON.stringify(compactTeamGeometry));
    assert.equal(compactTeamGeometry.sceneOverflow, 0);
    assert.deepEqual(await messengerChromeAnchors(page), compactPersonalAnchors);

    await page.locator('[data-choice="right"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'IRL_PADEL_01');
    await waitForMessageSettled(page);
    await assertIrlPadelScene(page);
    assert.deepEqual(await pinnedShape(page), compactPinnedShape);
    await chooseAndWaitForCard(page, 'right', 'IRL_PADEL_03B');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), 1);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_03B',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'Score: 0–0',
      lines: ['Who let a pop-up ad onto my court?', 'Go fetch the balls and grab my water before I replace your whole startup with one prompt'],
      choices: ['Getting your water', 'Business after the match'],
    });
    await chooseAndWaitForCard(page, 'right', 'IRL_PADEL_04');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), 2);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_04',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'Score: 0–0',
      lines: ['We skip the side switching.', 'You won’t melt after a couple of sets in the sun, right?'],
      choices: ['Happy to take it', "Let's stick to rules"],
    });
    await chooseAndWaitForCard(page, 'right', 'IRL_PADEL_05');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), 3);
    await assertIrlCardContent(page, {
      id: 'IRL_PADEL_05',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'Score: 4–4',
      lines: ['THAT BALL WAS OUT! Are you blind???', 'Don’t even try to cheat me. That’s my point'],
      choices: ['Definitely out, my bad', "No way, that's in"],
    });
    await chooseAndWaitForCard(page, 'right', 'PADEL_OUTCOME_7');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), 4);
    await assertIrlCardContent(page, {
      id: 'PADEL_OUTCOME_7',
      sender: 'ClosedAI CEO',
      avatarSrc: 'assets/irl-closedai-ceo-avatar.png',
      score: 'MATCH ABORTED',
      lines: ['MATCH OVER! I am SO done with this.', 'Bitching and crying over every single point.', 'Know your place, nobody. You’re blacklisted everywhere'],
      choices: ["Who's crying now?", "I'll do anything, please!"],
    });
    assert.equal(await page.evaluate(() => window.MistakeryApp.state.history.some((entry) => entry.cardId === 'IRL_PADEL_06')), false);
    await page.waitForFunction(() => window.MistakeryApp.locked === false);
    await page.locator('[data-choice="right"]').click();
    await page.waitForFunction(() => document.querySelector('[data-card-id]')?.textContent === 'SAVED_02_UPDATE');
    assert.equal(await page.evaluate(() => window.MistakeryApp.padelCeoScore), null);
    assert.equal(await page.locator('[data-game]').getAttribute('data-view'), 'saved');
    assert.match(await page.locator('[data-chat]').textContent(), /5\s+MONTHS\s+AS\s+A\s+FOUNDER/);
    assert.deepEqual(await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - innerWidth,
      y: document.documentElement.scrollHeight - innerHeight,
    })), { x: 0, y: 0 });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
