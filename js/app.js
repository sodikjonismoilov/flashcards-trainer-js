/* Flashcards Trainer: vanilla JS, no drama */

(() => {
  // -------
  // DOM refs
  // -------
  const $ = (id) => document.getElementById(id);

  const cardEl     = $('card');
  const frontEl    = $('front');
  const backEl     = $('back');

  const newBtn     = $('newBtn');
  const prevBtn    = $('prevBtn');
  const nextBtn    = $('nextBtn');
  const flipBtn    = $('flipBtn');
  const deleteBtn  = $('deleteBtn');

  const newModal   = $('newModal');
  const newForm    = $('newForm');
  const frontInput = $('frontInput');
  const backInput  = $('backInput');
  const cancelNew  = $('cancelNew');

  // -------
  // State
  // -------
  const STORAGE_KEY = 'flashcards_v1';

  /** @type {{id:string, front:string, back:string}[]} */
  let cards = [];
  let current = 0;
  let flipped = false;

  const seedCards = [
    { id: String(Date.now()),     front: 'What is JavaScript?',     back: 'A language for the web. Also chaos with curly braces.' },
    { id: String(Date.now() + 1), front: 'localStorage?',           back: 'Browser key-value storage for strings.' },
    { id: String(Date.now() + 2), front: 'What is DOM?',            back: 'Document Object Model: your HTML as objects you can manipulate.' }
  ];

  // -------------
  // Persistence
  // -------------
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cards = raw ? JSON.parse(raw) : seedCards.slice();
    } catch {
      cards = seedCards.slice();
    }
  }

  // -----------
  // Utilities
  // -----------
  const wrap = (i, len) => (len === 0 ? 0 : (i + len) % len);

  function setFlipped(next) {
    flipped = !!next;
    cardEl.classList.toggle('is-flipped', flipped);
  }

  // -------------
  // Rendering
  // -------------
  function showEmptyState() {
    frontEl.textContent = 'No cards yet';
    backEl.textContent  = 'Create one to start studying';
    setFlipped(false);
  }

  function renderCard(i) {
    if (cards.length === 0) {
      showEmptyState();
      return;
    }
    const idx = Math.max(0, Math.min(i, cards.length - 1));
    const c = cards[idx];
    frontEl.textContent = c.front;
    backEl.textContent  = c.back;
  }

  // -------------
  // Actions
  // -------------
  function nextCard() {
    if (cards.length === 0) return;
    current = wrap(current + 1, cards.length);
    setFlipped(false);
    renderCard(current);
  }

  function prevCard() {
    if (cards.length === 0) return;
    current = wrap(current - 1, cards.length);
    setFlipped(false);
    renderCard(current);
  }

  function createCard(front, back) {
    const trimmedFront = String(front || '').trim();
    const trimmedBack  = String(back  || '').trim();
    if (!trimmedFront || !trimmedBack) return;

    cards.push({ id: String(Date.now()), front: trimmedFront, back: trimmedBack });
    persist();
    current = cards.length - 1;
    setFlipped(false);
    renderCard(current);
  }

  function deleteCurrentCard() {
    if (cards.length === 0) return;

    cards.splice(current, 1);
    if (cards.length === 0) {
      persist();
      renderCard(0);
      return;
    }
    current = wrap(current, cards.length);
    setFlipped(false);
    persist();
    renderCard(current);
  }

  // -------------
  // Keyboard
  // -------------
  function isTyping() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA';
  }

  function handleKeydown(e) {
    if (isTyping()) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        setFlipped(!flipped);
        break;
      case 'ArrowRight':
        nextCard();
        break;
      case 'ArrowLeft':
        prevCard();
        break;
      case 'KeyN':
        // Open modal to make a new card
        if (typeof newModal.showModal === 'function') {
          newModal.showModal();
          setTimeout(() => frontInput.focus(), 0);
        }
        break;
      case 'Delete':
        deleteCurrentCard();
        break;
    }
  }

  // -------------
  // Wiring
  // -------------
  function bindEvents() {
    // Flip interactions
    cardEl.addEventListener('click', () => setFlipped(!flipped));
    flipBtn.addEventListener('click', () => setFlipped(!flipped));

    // Navigation
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    // Create
    newBtn.addEventListener('click', () => {
      if (typeof newModal.showModal === 'function') {
        newModal.showModal();
        setTimeout(() => frontInput.focus(), 0);
      }
    });

    cancelNew.addEventListener('click', () => {
      newModal.close();
      newBtn.focus();
    });

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createCard(frontInput.value, backInput.value);
      frontInput.value = '';
      backInput.value = '';
      newModal.close();
      newBtn.focus();
    });

    // Delete
    deleteBtn.addEventListener('click', deleteCurrentCard);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // -------------
  // Init
  // -------------
  function init() {
    hydrate();
    renderCard(current);
    setFlipped(false);
    bindEvents();
  }

  // Kick it off
  init();
})();
