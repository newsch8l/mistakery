(function startBrowserGame() {
  const engine = window.MistakeryEngine;
  const ACTIVE_CARD_IDS = Object.freeze([
    'OPEN_01',
    'OPEN_02a',
    'OPEN_02b',
    'OPEN_BOSS',
    'OPEN_DEV',
    'OPEN_INVESTOR',
    'PADEL_INVITE',
    'DREAM_TEAM',
    'IRL_PADEL_01',
    'IRL_PADEL_03B',
    'IRL_PADEL_04',
    'IRL_PADEL_05',
    'IRL_PADEL_06',
    'PADEL_OUTCOME_0',
    'PADEL_OUTCOME_1',
    'PADEL_OUTCOME_2',
    'PADEL_OUTCOME_3',
    'PADEL_OUTCOME_4',
    'PADEL_OUTCOME_5',
    'PADEL_OUTCOME_6',
    'PADEL_OUTCOME_7',
  ]);

  const app = {
    deck: null,
    state: null,
    view: 'loading',
    onboardingIndex: 0,
    noteIndex: 0,
    locked: false,
    introTypingTimer: null,
    padelCeoScore: null,
    activeCardIds: ACTIVE_CARD_IDS,
    render,
  };
  window.MistakeryApp = app;

  const $ = (selector) => document.querySelector(selector);
  const INITIAL_RESOURCES = Object.freeze({ cash: 25, team: 60, customers: 15, founder: 65 });
  const OPTIMISTIC_RESOURCES = Object.freeze({ cash: 100, team: 100, customers: 100, founder: 100 });
  const INTRO_TYPING_MS = 620;
  const RESOURCE_ICONS = Object.freeze({
    cash: 'M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,132Z',
    team: 'M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z',
    customers: 'M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l55.07-55.08,26.42-13.21a16,16,0,0,0,7.15-21.46Zm-54.89,33.37L165,113.72a8,8,0,0,0-10.68.61C136.51,132.27,116.66,130,104,122L147.24,80h31.81l27.21,54.41ZM41.53,64,62,74.22,36.43,125.27,16,115.06Zm116,119.13L99.42,168.61l-49.2-35.14,28-56L128,64.28l9.8,2.59-45,43.68-.08.09a16,16,0,0,0,2.72,24.81c20.56,13.13,45.37,11,64.91-5L188,152.66Zm62-57.87-25.52-51L214.47,64,240,115.06Zm-87.75,92.67a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24L80.41,213.33a7.89,7.89,0,0,1-2.71-1.25L51.35,193.26a8,8,0,0,1,9.3-13l25.11,17.94L126,208.24A8,8,0,0,1,131.82,217.94Z',
    founder: 'M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z',
  });
  const BOOKMARK_SVG = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5.2L5 21V4a1 1 0 0 1 1-1z"/></svg>';

  const INTRO_STEPS = Object.freeze([
    {
      shellStage: 'intro',
      text: 'Congratulations! 🎉\nYou successfully escaped the corporate grind to build your own empire. No more working for the man. From now on, you are THE MAN.',
      button: 'So long, corporate jail!',
    },
    {
      shellStage: 'optimistic',
      text: 'Fast forward 5 months:\nyou have your own AI startup, a dream team of 5 people, and a bag of investor cash. Or what’s left of it.',
      button: 'Trust the process',
    },
    {
      shellStage: 'real',
      text: 'Does the world actually need your product? It’s AI. Of course they do.\n\nAre there any paying customers? Hey, one step at a time. We’ll figure that out on the fly.',
      button: 'Open the Masterplan',
    },
  ]);

  const NOTE_SCREENS = Object.freeze([
    {
      id: 'SAVED_01_PLAN',
      chip: '5 months ago',
      messages: ['<strong>NEVER WORK AGAIN PLAN 🚀</strong>\n<b>1.</b> Quit 9-5 rat race\n<b>2.</b> Get bro on board\n<b>3.</b> Pick up a fancy sport (Golf?? Padel??)\n<b>4.</b> Brainstorm smth big (AI??)\n<b>5.</b> Killer naming!! + domain\n<b>6.</b> A team of legends\n<b>7.</b> Raise 💰💰 from investors (pitch deck?)\n<b>8.</b> Become a unicorn 🦄\n<b>9.</b> Buy mom a house (finally be the favorite son)\n<b>10.</b> Hire ex-boss to fire him'],
      buttons: ['Right on track', 'Slightly behind'],
    },
    {
      id: 'SAVED_02_UPDATE',
      chip: 'Today',
      messages: [
        '<strong>5 MONTHS AS A FOUNDER 🚀</strong>\n<b>1.</b> Never return to the office ✅\n<b>2.</b> Bro as a cofounder ✅\n<b>3.</b> Padel (CEO networking) ✅\n<b>4.</b> Built AI B2B SaaS. B2B sales - easy money ✅\n<b>5.</b> Brand: B2BuyerSpyer ✅\n<b>6.</b> Slogan: We find the buyer. You light the fire 🔥✅\n<b>7.</b> Team grinding 24/7. LEGENDS!! ✅\n<b>8.</b> Landed a HUGE investor ✅',
        '<strong>IN PROGRESS:</strong>\n<b>9.</b> Unicorn 🦄🎯 (waiting for the market to wake up)',
      ],
      buttons: ['WE’RE SO BACK', 'it’s so over'],
    },
  ]);

  const NBSP = '\u00A0';
  const MAX_HANGING = 2;

  function glueShortWords(text) {
    const words = text.split(' ');
    if (words.length < 2) return text;
    let out = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const previous = words[index - 1].replace(/[^0-9A-Za-z’']/g, '');
      out += (previous && previous.length <= MAX_HANGING ? NBSP : ' ') + words[index];
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

  function setView(view, shellStage = 'real') {
    app.view = view;
    const phone = $('[data-game]');
    phone.dataset.view = view;
    phone.dataset.shellStage = shellStage;
    $('[data-top]').hidden = shellStage === 'intro';
    $('[data-resources]').hidden = shellStage === 'intro';
    $('[data-restart-run]').disabled = view === 'onboarding';
    $('[data-scene]').classList.toggle('is-onboarding', view === 'onboarding');
  }

  function setSceneMode(mode) {
    const resolvedMode = mode === 'team' || mode === 'irl' ? mode : 'personal';
    const team = resolvedMode === 'team';
    const irl = resolvedMode === 'irl';
    const scene = $('[data-scene]');
    scene.dataset.mode = resolvedMode;
    scene.classList.toggle('team-scene', team);
    scene.classList.toggle('irl-scene', irl);
    scene.classList.toggle('personal-scene', resolvedMode === 'personal');
    scene.querySelector('.contact').classList.toggle('team-contact', team);
    scene.querySelector('.contact').classList.toggle('irl-contact', irl);
    $('[data-chat]').classList.toggle('team-chat', team);
    $('[data-chat]').classList.toggle('irl-chat', irl);
  }

  function renderResources(values) {
    const host = $('[data-resources]');
    host.innerHTML = engine.RESOURCE_KEYS.map((key) => {
      const value = Number(values[key]);
      const low = value <= 25 ? ' low' : '';
      return `<div class="resource${low}" data-resource="${key}" data-fill="${value}">
        <span class="resource-label"><i class="resource-glyph resource-glyph--${key}" aria-hidden="true"><svg viewBox="0 0 256 256"><path d="${RESOURCE_ICONS[key]}"></path></svg></i>${app.deck.resources[key].label}</span>
        <div class="bar" aria-hidden="true"><i style="width:${value}%"></i></div>
        <span class="sr-only" data-value>${value}%</span>
      </div>`;
    }).join('');
  }

  function setContact({ name, role = '', avatar = '' }) {
    $('[data-sender]').textContent = name;
    $('[data-status]').textContent = role;
    const avatarNode = $('[data-avatar]');
    avatarNode.innerHTML = avatar || name.replace('@', '').slice(0, 1).toUpperCase();
    const messageAvatar = $('[data-message-avatar]');
    if (messageAvatar) messageAvatar.innerHTML = avatar || name.replace('@', '').slice(0, 1).toUpperCase();
  }

  function sourceFor(sourceId) {
    return app.deck.sources[sourceId];
  }

  function setThread(sourceId, status) {
    const source = sourceFor(sourceId);
    setContact({
      name: source.name,
      role: status === 'typing...' ? `${source.role} · online` : status,
      avatar: source.name.replace('@', '').slice(0, 1).toUpperCase(),
    });
  }

  function setCardId(id) {
    $('[data-card-id]').textContent = id;
  }

  function hidePinned() {
    const pinned = $('[data-pinned]');
    pinned.classList.remove('irl-location');
    pinned.querySelector('.pin').textContent = '📌';
    pinned.querySelector('small').textContent = 'PINNED';
    pinned.hidden = true;
    $('[data-pin-sheet]').hidden = true;
  }

  function showPinned() {
    const pinned = $('[data-pinned]');
    pinned.classList.remove('irl-location');
    pinned.querySelector('.pin').textContent = '📌';
    pinned.querySelector('small').textContent = 'PINNED';
    $('[data-pinned-title]').textContent = '5 MONTHS AS A FOUNDER 🚀';
    $('[data-pin-text]').innerHTML = NOTE_SCREENS[1].messages
      .join('\n')
      .split('\n')
      .map((line) => `<span>${line ? typography(line) : '&nbsp;'}</span>`)
      .join('');
    pinned.hidden = false;
  }

  function showIrlLocation(card) {
    const pinned = $('[data-pinned]');
    pinned.classList.add('irl-location');
    pinned.querySelector('.pin').textContent = '📍';
    pinned.querySelector('small').textContent = card.location;
    $('[data-pinned-title]').textContent = card.score;
    $('[data-pin-sheet]').hidden = true;
    pinned.hidden = false;
  }

  function setReplyHint(visible) {
    $('[data-reply-hint]').hidden = !visible;
  }

  function choiceMarkup(label, side, disabled = false) {
    return `<button class="choice choice--${side}" type="button" data-choice="${side}"${disabled ? ' disabled' : ''}>${label}</button>`;
  }

  function setChoices(items, onChoose, options = {}) {
    const disabled = options.disabled === true;
    const choices = $('[data-choices]');
    choices.toggleAttribute('data-reserved', options.reserved === true);
    choices.innerHTML = items
      .map((label, index) => choiceMarkup(label, index === 0 ? 'left' : 'right', disabled))
      .join('');
    if (disabled) return;
    document.querySelectorAll('[data-choice]').forEach((button) => {
      button.addEventListener('click', () => onChoose(button.dataset.choice));
    });
  }

  function withoutTerminalPeriod(text) {
    return String(text).replace(/(^|[^.])\.$/, '$1');
  }

  function messageParagraphs(text) {
    return withoutTerminalPeriod(text).split('\n\n').map((paragraph) => (
      `<p>${paragraph.split('\n').map((line) => typography(line)).join('<br>')}</p>`
    )).join('');
  }

  function messageLines(text) {
    return withoutTerminalPeriod(text).split('\n').map((line) => `<p>${typography(line)}</p>`).join('');
  }

  function cardMessageMarkup(text) {
    return text.split('\n\n').map((message) => (
      `<div class="message is-pop">${messageLines(message)}</div>`
    )).join('');
  }

  function popMessage() {
    const message = $('[data-chat] .message-stack .message:last-child');
    if (!message) return;
    message.classList.remove('is-pop');
    void message.offsetWidth;
    message.classList.add('is-pop');
  }

  function renderOnboarding(options = {}) {
    const typing = options.typing === true;
    const step = INTRO_STEPS[app.onboardingIndex];
    const delivered = app.onboardingIndex + (typing ? 0 : 1);
    setView('onboarding', step.shellStage);
    setSceneMode('personal');
    hidePinned();
    setReplyHint(false);
    setCardId(`ONBOARDING_${delivered}`);
    setContact({ name: 'Mistakery', role: 'online', avatar: 'M' });

    if (step.shellStage === 'optimistic') renderResources(OPTIMISTIC_RESOURCES);
    if (step.shellStage === 'real') renderResources(INITIAL_RESOURCES);

    const messages = Array.from({ length: delivered }, (_, index) => (
      `<div class="message">${messageParagraphs(INTRO_STEPS[index].text)}</div>`
    )).join('');
    const typingBubble = typing
      ? '<div class="typing-bubble" aria-label="Mistakery is typing"><i></i><i></i><i></i></div>'
      : '';
    $('[data-chat]').innerHTML = `<span class="sr-only" data-card-id>ONBOARDING_${app.onboardingIndex + 1}</span>
      <div class="message-row">
        <div class="mini-avatar message-avatar" data-message-avatar aria-hidden="true">M</div>
        <div class="message-stack" data-message-stack>${messages}${typingBubble}</div>
      </div>`;
    if (typing) {
      const choices = $('[data-choices]');
      if (choices.children.length === 0) {
        setChoices([step.button], () => {}, { disabled: true, reserved: true });
      } else {
        choices.querySelectorAll('[data-choice]').forEach((button) => { button.disabled = true; });
      }
      return;
    }
    setChoices([step.button], advanceOnboarding);
    popMessage();
  }

  function deliverOnboardingMessage() {
    app.locked = true;
    renderOnboarding({ typing: true });
    window.clearTimeout(app.introTypingTimer);
    app.introTypingTimer = window.setTimeout(() => {
      renderOnboarding();
      app.locked = false;
    }, INTRO_TYPING_MS);
  }

  function advanceOnboarding() {
    if (app.locked) return;
    if (app.onboardingIndex < INTRO_STEPS.length - 1) {
      app.onboardingIndex += 1;
      deliverOnboardingMessage();
      return;
    }
    startSaved(0);
  }

  function noteLineMarkup(text) {
    return withoutTerminalPeriod(text).split('\n').map((line) => `<span>${line ? typography(line) : '&nbsp;'}</span>`).join('');
  }

  function startSaved(index) {
    app.noteIndex = index;
    renderSaved();
  }

  function renderSaved() {
    const note = NOTE_SCREENS[app.noteIndex];
    const messages = note.messages.map((message) => (
      `<div class="message note-message is-pop"><p>${noteLineMarkup(message)}</p><span class="stamp">15:54</span></div>`
    )).join('');
    setView('saved', 'real');
    setSceneMode('personal');
    renderResources(app.state.resources);
    hidePinned();
    setReplyHint(true);
    setCardId(note.id);
    setContact({ name: 'Saved Messages', role: '', avatar: BOOKMARK_SVG });
    $('[data-chat]').innerHTML = `<span class="sr-only" data-card-id>${note.id}</span>
      <div class="date-chip">${note.chip}</div>
      <div class="message-row note-row">
        <div class="message-stack" data-message-stack>${messages}</div>
      </div>
      <div class="message-clearance" aria-hidden="true"></div>`;
    setChoices(note.buttons, () => {
      if (app.noteIndex === 0) startSaved(1);
      else beginRun();
    });
  }

  function beginRun() {
    app.state = engine.startRun(app.deck);
    app.padelCeoScore = null;
    app.locked = false;
    app.view = 'playing';
    renderCard();
  }

  function clearPreview() {
    document.querySelectorAll('[data-resource].is-preview').forEach((node) => node.classList.remove('is-preview'));
  }

  function previewChoice(choice) {
    clearPreview();
    engine.getAffectedResources(choice).forEach((resource) => {
      document.querySelector(`[data-resource="${resource}"]`)?.classList.add('is-preview');
    });
  }

  function bindCardChoices(card, disabled) {
    document.querySelectorAll('[data-choice]').forEach((button) => {
      const side = button.dataset.choice;
      const choice = card.choices[side];
      if (disabled) return;
      button.addEventListener('mouseenter', () => previewChoice(choice));
      button.addEventListener('focus', () => previewChoice(choice));
      button.addEventListener('mouseleave', clearPreview);
      button.addEventListener('blur', clearPreview);
      button.addEventListener('click', () => choose(side));
    });
  }

  function renderPersonalCard(card) {
    setThread(card.source, 'typing...');
    const messages = cardMessageMarkup(card.text);
    const avatar = sourceFor(card.source).name.replace('@', '').slice(0, 1).toUpperCase();
    $('[data-chat]').innerHTML = `<span class="sr-only" data-card-id>${card.id}</span>
      <div class="message-row">
        <div class="mini-avatar message-avatar" data-message-avatar aria-hidden="true">${avatar}</div>
        <div class="message-stack" data-message-stack>${messages}</div>
      </div>
      <div class="message-clearance" aria-hidden="true"></div>`;
  }

  function renderTeamCard(card) {
    const thread = sourceFor(card.source);
    setContact({ name: thread.name, role: thread.role, avatar: thread.avatar || 'DT' });
    const messages = card.messages.map((message) => {
      const body = messageLines(message.text);
      if (message.direction === 'outgoing') {
        return `<div class="self-message is-pop">${body}</div>`;
      }
      const member = sourceFor(message.source);
      return `<div class="team-row is-pop" data-source="${message.source}">
        <div class="member-avatar" aria-hidden="true">${message.avatar}</div>
        <div class="team-bubble">
          <span class="team-meta">${member.name}</span>
          ${body}
        </div>
      </div>`;
    }).join('');
    $('[data-chat]').innerHTML = `<span class="sr-only" data-card-id>${card.id}</span>
      ${messages}
      <div class="message-clearance" aria-hidden="true"></div>`;
  }

  function renderIrlCard(card) {
    const source = sourceFor(card.source);
    const name = source.irlName || source.name;
    const avatar = source.irlAvatar
      ? `<img class="irl-avatar-photo" src="${source.irlAvatar}" alt="">`
      : name.slice(0, 1).toUpperCase();
    setContact({ name, role: '', avatar });
    $('[data-chat]').innerHTML = `<span class="sr-only" data-card-id>${card.id}</span>
      <div class="irl-dialog is-pop">${messageLines(card.text)}</div>`;
  }

  function renderCard() {
    const card = engine.cardById(app.deck, app.state.currentCardId);
    if (!card || !ACTIVE_CARD_IDS.includes(card.id)) {
      throw new Error(`Disabled card cannot enter the Personal Chat runtime: ${app.state.currentCardId}`);
    }
    const complete = app.view === 'irl-complete';
    setView(complete ? 'irl-complete' : 'playing', 'real');
    renderResources(app.state.resources);
    setSceneMode(card.mode);
    if (card.mode === 'irl') showIrlLocation(card);
    else showPinned();
    setReplyHint(card.mode !== 'irl');
    setCardId(card.id);
    if (card.mode === 'irl') renderIrlCard(card);
    else if (card.mode === 'team') renderTeamCard(card);
    else renderPersonalCard(card);

    const left = engine.getChoiceLabel(card.choices.left, app.state.resources.founder);
    const right = engine.getChoiceLabel(card.choices.right, app.state.resources.founder);
    setChoices([left, right], () => {}, { disabled: complete });
    bindCardChoices(card, complete);
  }

  function continueFromInvestor(side) {
    app.locked = true;
    clearPreview();
    const result = engine.resolveChoice(app.deck, app.state, side, { rng: () => 0 });
    app.state = result.state;
    app.padelCeoScore = 0;
    app.state.currentCardId = 'PADEL_INVITE';
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function continueFromDreamTeam(side) {
    app.locked = true;
    clearPreview();
    const result = resolvePadelChoice(side);
    app.state = result.state;
    app.state.currentCardId = 'IRL_PADEL_01';
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function resolvePadelChoice(side) {
    const deckWithoutBurn = {
      ...app.deck,
      meta: { ...app.deck.meta, baseCashBurn: 0 },
    };
    return engine.resolveChoice(deckWithoutBurn, app.state, side, { rng: () => 0 });
  }

  function continueFromPadelInvite(side) {
    app.locked = true;
    clearPreview();
    const result = resolvePadelChoice(side);
    app.state = result.state;
    if (side === 'right') {
      app.padelCeoScore = null;
      app.state.currentCardId = 'PADEL_OUTCOME_0';
    }
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function continueFromPadelScoreCard(card, side) {
    app.locked = true;
    clearPreview();
    const result = resolvePadelChoice(side);
    app.state = result.state;
    app.padelCeoScore += Number(card.choices[side].ceoScore || 0);
    if (card.id === 'IRL_PADEL_05' && app.padelCeoScore === 4) {
      app.state.currentCardId = 'PADEL_OUTCOME_7';
    }
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function selectPadelOutcome(side, ceoScore, rng = Math.random) {
    if (![-2, 0, 2].includes(ceoScore)) {
      throw new Error(`Invalid Padel CEO score at match point: ${ceoScore}`);
    }
    const edgeThreshold = ceoScore === 0 ? 0.5 : 0.6;
    if (side === 'left') return rng() < edgeThreshold ? 'PADEL_OUTCOME_3' : 'PADEL_OUTCOME_4';

    const wonMatch = rng() < 0.5;
    const outcomeRoll = rng();
    if (wonMatch) return outcomeRoll < edgeThreshold ? 'PADEL_OUTCOME_1' : 'PADEL_OUTCOME_2';
    const loseDealThreshold = ceoScore === 0 ? 0.5 : 0.4;
    return outcomeRoll < loseDealThreshold ? 'PADEL_OUTCOME_5' : 'PADEL_OUTCOME_6';
  }

  function continueFromPadelMatchPoint(side) {
    app.locked = true;
    clearPreview();
    const outcomeId = selectPadelOutcome(side, app.padelCeoScore);
    const result = resolvePadelChoice(side);
    app.state = result.state;
    app.state.currentCardId = outcomeId;
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function finishPadelOutcome(side) {
    app.locked = true;
    clearPreview();
    const result = resolvePadelChoice(side);
    app.state = result.state;
    app.padelCeoScore = null;
    startSaved(1);
    app.locked = false;
  }

  function choose(side) {
    if (app.locked || app.view !== 'playing') return;
    const card = engine.cardById(app.deck, app.state.currentCardId);
    if (card.id === 'OPEN_INVESTOR') return continueFromInvestor(side);
    if (card.id === 'PADEL_INVITE') return continueFromPadelInvite(side);
    if (card.id === 'DREAM_TEAM') return continueFromDreamTeam(side);
    if (card.id === 'IRL_PADEL_06') return continueFromPadelMatchPoint(side);
    if (card.id.startsWith('PADEL_OUTCOME_')) return finishPadelOutcome(side);
    if (Object.hasOwn(card.choices[side], 'ceoScore')) return continueFromPadelScoreCard(card, side);

    app.locked = true;
    clearPreview();
    const result = engine.resolveChoice(app.deck, app.state, side);
    app.state = result.state;
    renderCard();
    window.setTimeout(() => { app.locked = false; }, 280);
  }

  function render() {
    if (!app.deck || !app.state) return;
    if (app.view === 'onboarding') renderOnboarding();
    else if (app.view === 'saved') renderSaved();
    else renderCard();
  }

  $('[data-pinned]').addEventListener('click', () => {
    if ($('[data-pinned]').classList.contains('irl-location')) return;
    $('[data-pin-sheet]').hidden = false;
  });
  $('[data-pin-close]').addEventListener('click', () => { $('[data-pin-sheet]').hidden = true; });
  $('[data-pin-sheet]').addEventListener('click', (event) => {
    if (event.target === $('[data-pin-sheet]')) $('[data-pin-sheet]').hidden = true;
  });
  $('[data-restart-run]').addEventListener('click', () => {
    if (app.view === 'onboarding') return;
    app.state = engine.startRun(app.deck);
    app.padelCeoScore = null;
    app.locked = false;
    startSaved(0);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $('[data-pin-sheet]').hidden = true;
    if (app.view !== 'playing') return;
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
      app.state = engine.startRun(deck);
      app.onboardingIndex = 0;
      deliverOnboardingMessage();
    })
    .catch((error) => {
      $('[data-message]').textContent = `Could not start Mistakery: ${error.message}`;
      console.error(error);
    });
})();
