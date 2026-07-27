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

  function startIntro() {
    let shown = 0;
    let busy = false;
    const phone = document.querySelector('.phone');
    const screen = $('[data-intro]');
    const conversation = $('[data-intro-conversation]');
    const button = $('[data-intro-next]');

    phone.classList.add('is-intro');
    screen.hidden = false;

    const setTyping = (on) => {
      $('[data-intro-status]').textContent = on ? 'typing...' : '';
      const dots = conversation.querySelector('.intro-typing');
      if (on && !dots) conversation.insertAdjacentHTML('beforeend', '<div class="intro-typing" aria-hidden="true"><i></i><i></i><i></i></div>');
      if (!on && dots) dots.remove();
    };

    const addBubble = () => {
      const lines = INTRO_TEXTS[shown].split('\n').map((line) => `<span>${line ? typography(line) : '&nbsp;'}</span>`).join('');
      conversation.insertAdjacentHTML('beforeend', `<div class="message-row"><div class="bubble"><p>${lines}</p></div></div>`);
      conversation.scrollTop = conversation.scrollHeight;
      shown += 1;
      button.textContent = INTRO_BUTTONS[shown - 1];
    };

    const deliver = () => {
      busy = true;
      button.disabled = true;
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        addBubble();
        button.disabled = false;
        busy = false;
      }, INTRO_TYPING_MS);
    };

    button.addEventListener('click', () => {
      if (busy) return;
      if (shown < INTRO_TEXTS.length) return deliver();
      screen.hidden = true;
      phone.classList.remove('is-intro');
      beginRun();
    });

    deliver();
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

  function setDateChip(text) {
    $('[data-date-chip]').textContent = text || 'Today';
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

  function renderCard() {
    const card = engine.cardById(app.deck, app.state.currentCardId);
    const isSelf = card.source === 'saved_messages';
    document.querySelector('[data-messenger]').classList.toggle('messenger--self', isSelf);
    setThread(card.source, isSelf ? '' : 'typing...');
    setDateChip(card.dateChip);
    if (isSelf) {
      $('[data-avatar]').innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5.2L5 21V4a1 1 0 0 1 1-1z"/></svg>';
    }
    $('[data-message]').innerHTML = card.text.split('\n').map((line) => `<span>${typography(line)}</span>`).join('');
    $('[data-conversation]').removeAttribute('data-crisis');
    $('[data-conversation]').removeAttribute('data-ending');
    $('[data-choices]').innerHTML = choiceButton('left', card.choices.left) + choiceButton('right', card.choices.right);
    bindChoiceButtons(card);
  }

  function renderCrisis() {
    const crisis = app.deck.crises[app.state.activeCrisisId];
    document.querySelector('[data-messenger]').classList.remove('messenger--self');
    setThread(crisis.source, 'startup emergency');
    setDateChip();
    $('[data-conversation]').setAttribute('data-crisis', '');
    $('[data-conversation]').removeAttribute('data-ending');
    $('[data-message]').innerHTML = `<strong class="system-label">LAST CHANCE</strong>${crisis.text.split('\n').map((line) => `<span>${typography(line)}</span>`).join('')}`;
    $('[data-choices]').innerHTML = `
      <button class="choice choice--left" type="button" data-crisis-choice="giveup">${crisis.giveupLabel}</button>
      <button class="choice choice--right" type="button" data-crisis-choice="rescue">${crisis.rescueLabel}</button>`;
    document.querySelectorAll('[data-crisis-choice]').forEach((button) => {
      button.addEventListener('click', () => handleCrisis(button.dataset.crisisChoice));
    });
  }

  function renderEnding() {
    document.querySelector('[data-messenger]').classList.remove('messenger--self');
    const ending = app.deck.endings[app.state.endingId] || app.deck.endings.no_proof;
    const sourceId = ending.source || (app.state.win ? '@b2buddy_bot' : '@business1');
    const decisions = app.state.history.length;
    const decisionLabel = decisions === 1 ? 'decision' : 'decisions';
    setThread(sourceId, ending.status || (app.state.win ? 'invoice received' : 'last seen recently'));
    setDateChip();
    $('[data-conversation]').removeAttribute('data-crisis');
    $('[data-conversation]').setAttribute('data-ending', '');
    $('[data-message]').innerHTML = `<strong class="ending-title">${ending.title}</strong><span>${typography(ending.text)}</span><small>Survived ${decisions} ${decisionLabel} · ${app.state.rescueAttempts} rescues used</small>`;
    $('[data-choices]').innerHTML = `<button class="choice choice--restart" type="button" data-restart>Try again</button>`;
    $('[data-restart]').addEventListener('click', beginRun);
    saveEnding();
  }

  function render() {
    if (!app.deck || !app.state) return;
    $('[data-turn]').textContent = String(Math.min(app.state.turn, app.deck.meta.maxTurns));
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

  document.addEventListener('keydown', (event) => {
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
      startIntro();
    })
    .catch((error) => {
      $('[data-message]').textContent = `Could not start Mistakery: ${error.message}`;
      console.error(error);
    });
})();
