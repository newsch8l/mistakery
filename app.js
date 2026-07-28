(function startBrowserGame() {
  const engine = window.MistakeryEngine;
  const app = {
    deck: null,
    state: null,
    locked: false,
    render,
  };
  window.MistakeryApp = app;

  const $ = (selector) => document.querySelector(selector);

  function metaProgress() {
    try {
      return JSON.parse(localStorage.getItem('mistakery_meta') || '{}');
    } catch (_) {
      return {};
    }
  }

  function saveEnding() {
    if (!app.state.gameOver) return;
    const meta = metaProgress();
    const endings = new Set(meta.endings || []);
    endings.add(app.state.endingId);
    localStorage.setItem('mistakery_meta', JSON.stringify({
      runs: Number(meta.runs || 0),
      endings: [...endings],
      bestTurn: Math.max(Number(meta.bestTurn || 0), app.state.turn),
    }));
  }

  // Typography: nothing shorter than three letters may hang at the end of a line.
  // A short word is glued to the next one automatically; `~` glues any two words by hand.
  const NBSP = '\u00A0';
  const MAX_HANGING = 2;

  function glueShortWords(text) {
    const words = text.split(' ');
    if (words.length < 2) return text;
    let out = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const previous = words[i - 1].replace(/[^0-9A-Za-z’']/g, '');
      out += (previous && previous.length <= MAX_HANGING ? NBSP : ' ') + words[i];
    }
    return out;
  }

  function typography(text) {
    return String(text)
      .replace(/~/g, NBSP)
      .split(/(<[^>]*>)/)
      .map((part) => (part.startsWith('<') ? part : glueShortWords(part)))
      .join('');
  }

  const INTRO_TEXTS = [
    'Congratulations! You successfully escaped the corporate grind to build your own empire. No more working for "the man" — from now on, you are the man.',
    'Fast forward 5 months: you have your own AI startup, a dream team of 5 people, and a bag of investor cash. Or what’s left of it.',
    'Does the world actually need your product? Duh. It’s AI. Of course they do.\n\nAre there any paying customers? Hey, one step at a time. We’ll figure that out on the fly.',
  ];
  const INTRO_BUTTONS = [
    'So long, corporate jail!',
    'Trust the process',
    'Open the Masterplan',
  ];
  const INTRO_TYPING_MS = 620;

  const BOOKMARK_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5.2L5 21V4a1 1 0 0 1 1-1z"/></svg>';

  // Notes the founder wrote to himself. Screens, not cards: no turn, no cash burn.
  const NOTE_SCREENS = [
    {
      chip: '5 months ago',
      text: '<strong>NEVER WORK AGAIN PLAN \uD83D\uDE80</strong>\n<b style="font-weight:600">1.</b> Quit 9-5 rat race\n<b style="font-weight:600">2.</b> Get bro on board\n<b style="font-weight:600">3.</b> Brainstorm smth big (AI??)\n<b style="font-weight:600">4.</b> Killer naming!! + domain\n<b style="font-weight:600">5.</b> A team of legends\n<b style="font-weight:600">6.</b> Raise \uD83D\uDCB0\uD83D\uDCB0 from investors (pitch deck?)\n<b style="font-weight:600">7.</b> Become a unicorn \uD83E\uDD84\n<b style="font-weight:600">8.</b> Buy mom a house\n<b style="font-weight:600">9.</b> Hire ex-boss to fire him',
      buttons: ['Right on track', 'Slightly behind'],
    },
    {
      chip: 'Today',
      text: '<strong>5 MONTHS AS A FOUNDER \uD83D\uDE80</strong>\n<b style="font-weight:600">1.</b> Never return to the office \u2705\n<b style="font-weight:600">2.</b> Bro as cofounder \u2705\n<b style="font-weight:600">3.</b> Built AI B2B SaaS. Easy money \u2705\n<b style="font-weight:600">4.</b> Brand: B2BuyerSpyer \u2705\n<b style="font-weight:600">5.</b> Slogan: We find the buyer. You light the fire \uD83D\uDD25\u2705\n<b style="font-weight:600">6.</b> Team grinding 24/7. LEGENDS!! \u2705\n<b style="font-weight:600">7.</b> Landed a HUGE investor \u2705\n\u00A0\n<strong>IN PROGRESS:</strong>\n<b style="font-weight:600">8.</b> Unicorn \uD83E\uDD84\uD83C\uDFAF\n(waiting for the market to wake up)',
      buttons: ["WE'RE SO BACK", "it's so over"],
    },
  ];

  // The founder's update stays pinned for the rest of the run: the goal never leaves the screen.
  const PINNED_NOTE = 1;

  function stripTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  function showPinned() {
    const note = NOTE_SCREENS[PINNED_NOTE];
    const lines = note.text.split('\n');
    $('[data-pinned-title]').textContent = `${stripTags(lines[0])} …`;
    $('[data-pin-text]').innerHTML = lines.map((line) => `<span>${line ? typography(line) : '&nbsp;'}</span>`).join('');
    $('[data-pinned]').hidden = false;
  }

  function hidePinned() {
    $('[data-pinned]').hidden = true;
    $('[data-pin-sheet]').hidden = true;
  }

  function bubbleHtml(text, stamp) {
    const lines = text.split('\n').map((line) => `<span>${line ? typography(line) : '&nbsp;'}</span>`).join('');
    const time = stamp ? '<span class="stamp">15:54</span>' : '';
    return `<div class="message-row"><div class="bubble"><p>${lines}</p>${time}</div></div>`;
  }

  function startOnboarding(options = {}) {
    const skipIntro = options.skipIntro === true;
    const phone = document.querySelector('.phone');
    const screen = $('[data-intro]');
    const messenger = $('[data-intro-messenger]');
    const conversation = $('[data-intro-conversation]');
    const choices = $('[data-intro-choices]');
    let delivered = skipIntro ? INTRO_TEXTS.length : 0;
    let note = -1;
    let busy = false;

    phone.classList.add('is-onboarding', 'is-intro');
    screen.hidden = false;
    hidePinned();

    const singleButton = (label) => {
      choices.innerHTML = `<button class="choice choice--restart" type="button" data-intro-next>${label}</button>`;
      $('[data-intro-next]').addEventListener('click', advance);
    };

    const pairButtons = (labels) => {
      choices.innerHTML = `<button class="choice choice--left" type="button" data-intro-next>${labels[0]}</button>`
        + `<button class="choice choice--right" type="button" data-intro-next>${labels[1]}</button>`;
      document.querySelectorAll('[data-intro-next]').forEach((node) => node.addEventListener('click', advance));
    };

    const setTyping = (on) => {
      $('[data-intro-status]').textContent = on ? 'typing...' : '';
      const dots = conversation.querySelector('.intro-typing');
      if (on && !dots) conversation.insertAdjacentHTML('beforeend', '<div class="intro-typing" aria-hidden="true"><i></i><i></i><i></i></div>');
      if (!on && dots) dots.remove();
    };

    const deliverMessage = () => {
      busy = true;
      choices.querySelectorAll('button').forEach((node) => { node.disabled = true; });
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        conversation.insertAdjacentHTML('beforeend', bubbleHtml(INTRO_TEXTS[delivered]));
        conversation.scrollTop = conversation.scrollHeight;
        delivered += 1;
        singleButton(INTRO_BUTTONS[delivered - 1]);
        busy = false;
      }, INTRO_TYPING_MS);
    };

    const showNote = () => {
      const page = NOTE_SCREENS[note];
      // The notes are already the game: same header, same bars, same turn counter.
      // Only the choice is free — neither button moves anything yet.
      phone.classList.remove('is-intro');
      if (!app.state) app.state = engine.startRun(app.deck);
      renderResources();
      messenger.classList.add('messenger--self');
      conversation.classList.add('is-note');
      $('[data-intro-name]').textContent = 'Saved Messages';
      $('[data-intro-avatar]').innerHTML = BOOKMARK_SVG;
      $('[data-intro-status]').textContent = '';
      conversation.innerHTML = `<div class="date-chip">${page.chip}</div>` + bubbleHtml(page.text, true);
      pairButtons(page.buttons);
    };

    function advance() {
      if (busy) return;
      if (delivered < INTRO_TEXTS.length) return deliverMessage();
      note += 1;
      if (note < NOTE_SCREENS.length) return showNote();
      screen.hidden = true;
      phone.classList.remove('is-onboarding', 'is-intro');
      showPinned();
      beginRun();
    }

    if (skipIntro) advance();
    else deliverMessage();
  }

  function beginRun() {
    const meta = metaProgress();
    localStorage.setItem('mistakery_meta', JSON.stringify({
      ...meta,
      runs: Number(meta.runs || 0) + 1,
    }));
    app.state = engine.startRun(app.deck);
    app.locked = false;
    render();
  }

  function sourceFor(sourceId) {
    return app.deck.sources[sourceId];
  }

  function setThread(sourceId, status) {
    const source = sourceFor(sourceId);
    $('[data-sender]').textContent = source.role ? `${source.role} ${source.name}` : source.name;
    const avatarText = source.name.replace('@', '').slice(0, 1).toUpperCase();
    document.querySelectorAll('[data-avatar], [data-message-avatar]').forEach((node) => {
      node.textContent = avatarText;
    });
    $('[data-status]').textContent = status;
  }

  function renderResources() {
    const host = $('[data-resources]');
    host.innerHTML = engine.RESOURCE_KEYS.map((key) => {
      const value = app.state.resources[key];
      const risk = value <= 20 || value >= 80 ? ' is-risky' : '';
      return `<div class="resource resource--${key}${risk}" data-resource="${key}">
        <div class="resource__head"><span>${app.deck.resources[key].label}</span><strong data-value>${value}%</strong></div>
        <div class="meter" aria-hidden="true"><span style="width:${value}%"></span></div>
      </div>`;
    }).join('');
  }

  function clearPreview() {
    document.querySelectorAll('[data-resource].is-preview').forEach((node) => node.classList.remove('is-preview'));
  }

  function previewChoice(choice) {
    clearPreview();
    engine.getAffectedResources(choice).forEach((resource) => {
      const node = document.querySelector(`[data-resource="${resource}"]`);
      if (node) node.classList.add('is-preview');
    });
  }

  function choiceButton(side, choice) {
    const label = engine.getChoiceLabel(choice, app.state.resources.founder);
    return `<button class="choice choice--${side}" type="button" data-choice="${side}">${label}</button>`;
  }

  function bindChoiceButtons(card) {
    document.querySelectorAll('[data-choice]').forEach((button) => {
      const side = button.dataset.choice;
      const choice = card.choices[side];
      button.addEventListener('mouseenter', () => previewChoice(choice));
      button.addEventListener('focus', () => previewChoice(choice));
      button.addEventListener('mouseleave', clearPreview);
      button.addEventListener('blur', clearPreview);
      button.addEventListener('click', () => choose(side));
    });
  }

  // The game reuses one message row, so the arrival animation has to be re-armed by hand.
  function popMessage() {
    const row = document.querySelector('[data-conversation] .message-row');
    if (!row) return;
    row.classList.remove('is-pop');
    void row.offsetWidth;
    row.classList.add('is-pop');
  }

  function renderCard() {
    const card = engine.cardById(app.deck, app.state.currentCardId);
    setThread(card.source, 'typing...');
    $('[data-message]').innerHTML = card.text.split('\n').map((line) => `<span>${typography(line)}</span>`).join('');
    $('[data-conversation]').removeAttribute('data-crisis');
    $('[data-conversation]').removeAttribute('data-ending');
    $('[data-choices]').innerHTML = choiceButton('left', card.choices.left) + choiceButton('right', card.choices.right);
    bindChoiceButtons(card);
    popMessage();
  }

  function renderCrisis() {
    const crisis = app.deck.crises[app.state.activeCrisisId];
    setThread(crisis.source, 'startup emergency');
    $('[data-conversation]').setAttribute('data-crisis', '');
    $('[data-conversation]').removeAttribute('data-ending');
    $('[data-message]').innerHTML = `<strong class="system-label">LAST CHANCE</strong>${crisis.text.split('\n').map((line) => `<span>${typography(line)}</span>`).join('')}`;
    $('[data-choices]').innerHTML = `
      <button class="choice choice--left" type="button" data-crisis-choice="giveup">${crisis.giveupLabel}</button>
      <button class="choice choice--right" type="button" data-crisis-choice="rescue">${crisis.rescueLabel}</button>`;
    document.querySelectorAll('[data-crisis-choice]').forEach((button) => {
      button.addEventListener('click', () => handleCrisis(button.dataset.crisisChoice));
    });
    popMessage();
  }

  function renderEnding() {
    const ending = app.deck.endings[app.state.endingId] || app.deck.endings.no_proof;
    const sourceId = ending.source || (app.state.win ? '@b2buddy_bot' : '@business1');
    const decisions = app.state.history.length;
    const decisionLabel = decisions === 1 ? 'decision' : 'decisions';
    setThread(sourceId, ending.status || (app.state.win ? 'invoice received' : 'last seen recently'));
    $('[data-conversation]').removeAttribute('data-crisis');
    $('[data-conversation]').setAttribute('data-ending', '');
    $('[data-message]').innerHTML = `<strong class="ending-title">${ending.title}</strong><span>${typography(ending.text)}</span><small>Survived ${decisions} ${decisionLabel} · ${app.state.rescueAttempts} rescues used</small>`;
    $('[data-choices]').innerHTML = `<button class="choice choice--restart" type="button" data-restart>Try again</button>`;
    $('[data-restart]').addEventListener('click', beginRun);
    saveEnding();
    popMessage();
  }

  function render() {
    if (!app.deck || !app.state) return;
    renderResources();
    if (app.state.gameOver) renderEnding();
    else if (app.state.activeCrisisId) renderCrisis();
    else renderCard();
  }

  function choose(side) {
    if (app.locked || app.state.gameOver || app.state.activeCrisisId) return;
    app.locked = true;
    clearPreview();
    const result = engine.resolveChoice(app.deck, app.state, side);
    app.state = result.state;
    render();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function handleCrisis(action) {
    if (app.locked) return;
    app.locked = true;
    const result = engine.resolveCrisis(app.deck, app.state, action);
    app.state = result.state;
    render();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  $('[data-pinned]').addEventListener('click', () => { $('[data-pin-sheet]').hidden = false; });
  $('[data-pin-close]').addEventListener('click', () => { $('[data-pin-sheet]').hidden = true; });
  $('[data-pin-sheet]').addEventListener('click', (event) => {
    if (event.target === $('[data-pin-sheet]')) $('[data-pin-sheet]').hidden = true;
  });

  $('[data-restart-run]').addEventListener('click', () => {
    app.state = engine.startRun(app.deck);
    app.locked = false;
    startOnboarding({ skipIntro: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $('[data-pin-sheet]').hidden = true;
    if (event.key === 'ArrowLeft') $('[data-choice="left"]')?.click();
    if (event.key === 'ArrowRight') $('[data-choice="right"]')?.click();
  });

  const deckRequest = window.MISTAKERY_DECK
    ? Promise.resolve(window.MISTAKERY_DECK)
    : fetch('cards.json', { cache: 'no-store' }).then((response) => {
        if (!response.ok) throw new Error(`Deck request failed: ${response.status}`);
        return response.json();
      });

  deckRequest
    .then((deck) => {
      const errors = engine.validateDeck(deck);
      if (errors.length) throw new Error(errors.join('\n'));
      app.deck = deck;
      startOnboarding();
    })
    .catch((error) => {
      $('[data-message]').textContent = `Could not start Mistakery: ${error.message}`;
      console.error(error);
    });
})();
