/* ============================================
   Librapp - Game Logic (Festa Redesign)
   ============================================ */

class LibrappGame {
  constructor() {
    this.cardsData = null;
    this.currentCategory = null;
    this.currentCard = null;
    this.currentPhase = 1;
    this.currentCardIndex = 0;
    this.score = 0;
    this.totalCards = 0;
    this.answeredCards = [];
    this.accessibleMode = false;
    this.currentAudio = null;
    this.players = 2;
    this.turn = 1;

    this.init();
  }

  async init() {
    try {
      const response = await fetch(this.resolveUrl('data/cards.json?v=7'));
      this.cardsData = await response.json();
      this.renderCategories();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  getPrefix() {
    const path = window.location.pathname;
    return (path.includes('/game/') || path.includes('/cards/')) ? '../' : '';
  }

  resolveUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return this.getPrefix() + url;
  }

  /* ============================================
     Categories / Landing Screen
     ============================================ */

  renderCategories() {
    const container = document.getElementById('categories');
    if (!container) return;

    const totalCards = this.cardsData.categories.reduce((acc, cat) => acc + cat.cards.length, 0);

    container.innerHTML = this.cardsData.categories.map((cat, i) => `
      <button class="category-btn slide-up" style="animation-delay: ${0.1 + i * 0.1}s" data-id="${cat.id}">
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${cat.cards.length} cartas</span>
      </button>
    `).join('');

    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.id;
        this.selectCategory(catId);
      });
    });

    // Update stats
    const statEl = document.getElementById('total-cards-stat');
    if (statEl) statEl.textContent = totalCards;
    const catCountEl = document.getElementById('total-categories-stat');
    if (catCountEl) catCountEl.textContent = this.cardsData.categories.length;
  }

  selectCategory(categoryId) {
    this.currentCategory = this.cardsData.categories.find(c => c.id === categoryId);
    this.currentCardIndex = 0;
    this.currentPhase = 1;
    this.score = 0;
    this.answeredCards = [];
    this.totalCards = this.currentCategory.cards.length;
    this.turn = 1;

    document.getElementById('categories-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const catTag = document.getElementById('game-category-tag');
    const catIcon = document.getElementById('game-category-icon');
    if (catTag) catTag.textContent = this.currentCategory.name;
    if (catIcon) catIcon.textContent = this.currentCategory.icon;

    this.renderGameCard();
    this.updateScore();
  }

  backToCategories() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('categories-screen').classList.remove('hidden');
    this.stopAudio();
  }

  /* ============================================
     Deck / Theme Filter
     ============================================ */

  selectDeck(level) {
    const btns = document.querySelectorAll('.deck-btn');
    btns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.deck-btn[data-level="${level}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    // Future: filter cards by deck level
  }

  /* ============================================
     Player Counter
     ============================================ */

  changePlayers(delta) {
    this.players = Math.max(2, Math.min(10, this.players + delta));
    const display = document.getElementById('player-count');
    if (display) display.textContent = this.players;
  }

  /* ============================================
     Card Rendering
     ============================================ */

  renderGameCard() {
    this.currentCard = this.currentCategory.cards[this.currentCardIndex];
    const container = document.getElementById('game-card-container');

    const showWord = this.currentPhase >= 3;

    container.innerHTML = `
      <!-- The Big Card -->
      <div class="game-card fade-in">
        <!-- Accent Bar -->
        <div class="game-card-accent"></div>

        <!-- Image -->
        <div class="game-card-image">
          <img src="${this.resolveUrl(this.currentCard.image)}" alt="${this.currentCard.word}" class="card-object-img"
               onerror="this.style.display='none';this.outerHTML='<div class=\\'placeholder\\'>🖼️</div>'">
        </div>

        <!-- Word -->
        <div class="game-card-word-section">
          <div class="game-card-word ${!showWord ? 'hidden-word' : ''}" id="word-display">
            ${showWord ? this.currentCard.word : '❓'}
          </div>
          <div class="game-card-word-label">
            ${showWord ? 'Palavra revelada!' : `Fase ${this.currentPhase}/3 — faça o sinal!`}
          </div>
        </div>

        <!-- LIBRAS Params -->
        ${this.renderLibrasParams()}

        <!-- Phase Tabs -->
        <div class="phase-tabs">
          ${[1, 2, 3].map(p => `
            <button class="phase-tab ${p === this.currentPhase ? 'active' : ''} ${p < this.currentPhase ? 'completed' : ''}"
                    onclick="game.goToPhase(${p})">
              <span class="tab-number">${p}</span>
              ${['Sinal', 'Contexto', 'Palavra'][p - 1]}
            </button>
          `).join('')}
        </div>

        <!-- Phase Content -->
        ${this.renderPhaseContent()}

        <!-- Footer: Braille + QR Codes -->
        <div class="game-card-footer">
          ${showWord ? `
            <div class="braille-section">
              <div class="braille-label">⠿ Braille (texto de referência na tela)</div>
              <div class="braille-text">${this.currentCard.braille || ''}</div>
            </div>
          ` : ''}

          <div class="qr-row">
            ${this.currentCard.sign_video_qr ? `
              <div class="qr-item">
                <img src="${this.resolveUrl(this.currentCard.sign_video_qr)}" alt="QR Code vídeo LIBRAS" class="qr-img"
                     onerror="this.style.display='none'">
                <div class="qr-label">📹 Vídeo LIBRAS</div>
              </div>
            ` : ''}
            ${this.currentCard.audio_description_qr ? `
              <div class="qr-item">
                <img src="${this.resolveUrl(this.currentCard.audio_description_qr)}" alt="QR Code audiodescrição" class="qr-img"
                     onerror="this.style.display='none'">
                <div class="qr-label">🔊 Audiodescrição</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="game-controls">
        ${this.currentPhase < 3 ? `
          <button class="btn btn-primary btn-lg" onclick="game.nextPhase()">
            Próxima Fase ➜
          </button>
          <button class="btn btn-secondary" onclick="game.markCorrect()">
            ✅ Acertamos!
          </button>
        ` : `
          <button class="btn btn-accent btn-lg" onclick="game.markCorrect()">
            ✅ Próxima Carta
          </button>
        `}
        ${this.currentPhase > 1 ? `
          <button class="btn btn-ghost" onclick="game.previousPhase()">
            ← Voltar
          </button>
        ` : ''}
        <button class="btn btn-ghost" onclick="game.skipCard()">
          Pular ⏭
        </button>
      </div>

      <!-- Accessible -->
      ${this.renderAccessibleSection()}
    `;

    this.updateScore();
  }

  /* ============================================
     LIBRAS Parameters
     ============================================ */

  renderLibrasParams() {
    const params = this.currentCard.libras_params;
    if (!params) return '';

    const items = [
      { key: 'cm', label: 'CM', color: 'cm', title: 'Configuração de Mão' },
      { key: 'pa', label: 'PA', color: 'pa', title: 'Ponto de Articulação' },
      { key: 'mo', label: 'MO', color: 'mo', title: 'Movimento' },
      { key: 'op', label: 'OP', color: 'op', title: 'Orientação da Palma' }
    ];

    return `
      <div class="libras-params">
        <div class="libras-params-title">🧏 Parâmetros de LIBRAS</div>
        <div class="libras-params-grid">
          ${items.filter(item => params[item.key]).map(item => `
            <div class="param-item" title="${item.title}">
              <span class="param-label ${item.color}">${item.label}</span>
              <span class="param-value">${params[item.key]}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ============================================
     Phase Content
     ============================================ */

  renderPhaseContent() {
    switch (this.currentPhase) {
      case 1: return this.renderPhase1();
      case 2: return this.renderPhase2();
      case 3: return this.renderPhase3();
      default: return '';
    }
  }

  renderPhase1() {
    const desc = this.currentCard.sign_description || '';
    return `
      <div class="phase-panel phase-1">
        <h3>👋 Fase 1 — Sinal em LIBRAS</h3>
        <p class="phase-subtitle">Faça o sinal para seu time adivinhar! Veja a imagem e a descrição abaixo.</p>

        <div class="sign-desc-box">
          <div class="sign-desc-icon">🖐️</div>
          <div class="sign-desc-text">
            <strong>Como fazer o sinal:</strong><br>
            ${desc}
          </div>
        </div>
      </div>
    `;
  }

  renderPhase2() {
    const sentences = this.currentCard.context_sentences || [];
    return `
      <div class="phase-panel phase-2">
        <h3>💬 Fase 2 — Contexto</h3>
        <p class="phase-subtitle">Ainda não acertaram? Leia estas frases sem revelar a palavra!</p>

        <div class="hints-panel">
          ${sentences.map((s, i) => `
            <div class="hint-item">
              <span class="hint-number">${i + 1}</span>
              <span class="hint-text">${s}</span>
            </div>
          `).join('')}
        </div>

        <div class="hint-dica">
          <span class="hint-dica-icon">💡</span>
          <span class="hint-dica-text">
            Dica: Use mímica e sinais relacionados — não fale a palavra!
          </span>
        </div>
      </div>
    `;
  }

  renderPhase3() {
    return `
      <div class="phase-panel phase-3">
        <h3>🔤 Fase 3 — Datilologia</h3>
        <p class="phase-subtitle">A palavra revelada! Veja letra por letra em LIBRAS.</p>

        <div class="fingerspelling">
          ${(this.currentCard.fingerspelling || []).map(letter => `
            <div class="letter-card">
              <img src="${this.resolveUrl(letter.image)}" alt="${letter.letter}" class="letter-image"
                   onerror="this.outerHTML='<div class=\\'letter-image\\'>${letter.letter}</div>'">
              <div class="letter-label">${letter.letter}</div>
              <div class="letter-desc">${letter.libras || ''}</div>
            </div>
          `).join('')}
        </div>

        <div class="hint-dica" style="margin-top: var(--space-md)">
          <span class="hint-dica-icon">🎯</span>
          <span class="hint-dica-text">
            ⚠️ Braille e QR Codes abaixo são para consulta — vire o card para o time que está explicando!
          </span>
        </div>
      </div>
    `;
  }

  /* ============================================
     Phase Navigation
     ============================================ */

  goToPhase(phase) {
    // Only allow going to unlocked phases (current or previous)
    if (phase > this.currentPhase && phase > 1) {
      // User hasn't unlocked this phase yet
      return;
    }
    this.currentPhase = phase;
    this.renderGameCard();
  }

  nextPhase() {
    if (this.currentPhase < 3) {
      this.currentPhase++;
      this.renderGameCard();
    } else {
      this.nextCard();
    }
  }

  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.renderGameCard();
    }
  }

  /* ============================================
     Score & Game Flow
     ============================================ */

  markCorrect() {
    if (this.currentPhase < 3) {
      // Go to next phase to reveal more
      this.nextPhase();
    } else {
      this.nextCard();
    }
  }

  nextCard() {
    if (!this.answeredCards.includes(this.currentCardIndex)) {
      this.answeredCards.push(this.currentCardIndex);
      this.score++;
    }

    this.updateScore();

    if (this.currentCardIndex < this.totalCards - 1) {
      this.currentCardIndex++;
      this.currentPhase = 1;
      this.turn++;
      this.renderGameCard();
    } else {
      this.showResults();
    }
  }

  skipCard() {
    if (!this.answeredCards.includes(this.currentCardIndex)) {
      this.answeredCards.push(this.currentCardIndex);
    }

    this.updateScore();

    if (this.currentCardIndex < this.totalCards - 1) {
      this.currentCardIndex++;
      this.currentPhase = 1;
      this.turn++;
      this.renderGameCard();
    } else {
      this.showResults();
    }
  }

  updateScore() {
    const scoreEl = document.getElementById('score-value');
    if (scoreEl) scoreEl.textContent = `${this.score}/${this.totalCards}`;

    const progressEl = document.getElementById('progress-bar');
    if (progressEl) {
      const pct = this.totalCards > 0 ? (this.answeredCards.length / this.totalCards) * 100 : 0;
      progressEl.style.width = `${Math.min(pct, 100)}%`;
    }
  }

  /* ============================================
     Results
     ============================================ */

  showResults() {
    const container = document.getElementById('game-card-container');
    const pct = this.totalCards > 0 ? Math.round((this.score / this.totalCards) * 100) : 0;
    const message = pct >= 80 ? '🎉 Incrível!' : pct >= 50 ? '👏 Muito bom!' : '💪 Continue praticando!';

    container.innerHTML = `
      <div class="results-card">
        <h2>${message}</h2>
        <p class="result-category">Você completou "${this.currentCategory.icon} ${this.currentCategory.name}"</p>

        <div class="score-display">
          <span class="score-number">${this.score}</span>
          <span class="score-label">de ${this.totalCards} cartas — ${pct}% de acerto</span>
        </div>

        <div class="results-actions">
          <button class="btn btn-primary btn-lg" onclick="game.restartCategory()">
            🔄 Jogar Novamente
          </button>
          <button class="btn btn-secondary" onclick="game.backToCategories()">
            📚 Escolher Outra Categoria
          </button>
        </div>
      </div>
    `;
  }

  restartCategory() {
    this.currentCardIndex = 0;
    this.currentPhase = 1;
    this.score = 0;
    this.answeredCards = [];
    this.turn = 1;
    this.renderGameCard();
    this.updateScore();
  }

  /* ============================================
     Accessibility
     ============================================ */

  renderAccessibleSection() {
    if (this.accessibleMode) {
      return `
        <div class="accessible-section">
          <div class="accessible-bar">
            <span class="accessible-warning">🎧 Use fones! Áudio revela o sinal.</span>
            <button class="btn btn-secondary btn-sm audio-play-btn" onclick="game.playAudio()">
              🔊 Ouvir Sinal
            </button>
            <button class="btn btn-ghost btn-sm" onclick="game.toggleAccessible()">
              ♿ Desativar
            </button>
          </div>
        </div>
      `;
    }
    return `
      <div class="accessible-section accessible-toggle">
        <button class="btn btn-ghost btn-sm" onclick="game.toggleAccessible()">
          ♿ Modo Acessível (audiodescrição com fones)
        </button>
      </div>
    `;
  }

  toggleAccessible() {
    this.accessibleMode = !this.accessibleMode;
    this.renderGameCard();
  }

  playAudio() {
    const audioFile = this.currentCard?.audio_file;
    if (!audioFile) {
      console.warn('Sem arquivo de áudio');
      return;
    }

    const url = this.resolveUrl(audioFile);

    this.stopAudio();

    const audio = new Audio(url);
    this.currentAudio = audio;

    audio.play().catch(err => {
      if (err && err.name === 'AbortError') return;
      console.error('Erro ao reproduzir áudio:', err);
      fetch(url, { method: 'HEAD' })
        .then(resp => {
          if (!resp.ok) alert('Arquivo de áudio não encontrado.');
        })
        .catch(() => alert('Não foi possível carregar o áudio.'));
    });
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.onerror = null;
      this.currentAudio.onabort = null;
      try { this.currentAudio.pause(); } catch (e) { /* ignore */ }
      this.currentAudio = null;
    }
  }
}

/* ============================================
   Theme Toggle
   ============================================ */

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('librapp-theme', next);

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = next === 'dark' ? '🌙' : '☀️';
}

function loadTheme() {
  const saved = localStorage.getItem('librapp-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
}

/* ============================================
   Init
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  window.game = new LibrappGame();
});
