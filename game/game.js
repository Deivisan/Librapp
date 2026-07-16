/* ============================================
   Librapp - Game Logic
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
    
    this.init();
  }

  async init() {
    try {
      const baseUrl = window.location.pathname.includes('/game/') ? '../' : '';
      const response = await fetch(baseUrl + 'data/cards.json');
      this.cardsData = await response.json();
      this.renderCategories();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  renderCategories() {
    const container = document.getElementById('categories');
    if (!container) return;

    container.innerHTML = this.cardsData.categories.map(cat => `
      <button class="category-btn" data-id="${cat.id}">
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
  }

  selectCategory(categoryId) {
    this.currentCategory = this.cardsData.categories.find(c => c.id === categoryId);
    this.currentCardIndex = 0;
    this.currentPhase = 1;
    this.score = 0;
    this.answeredCards = [];
    this.totalCards = this.currentCategory.cards.length;
    
    document.getElementById('categories-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    const catNameEl = document.getElementById('category-name');
    if (catNameEl) catNameEl.textContent = `${this.currentCategory.icon} ${this.currentCategory.name}`;
    
    this.renderGameCard();
    this.updateScore();
  }

  renderGameCard() {
    this.currentCard = this.currentCategory.cards[this.currentCardIndex];
    const container = document.getElementById('game-card-container');
    
    const showAnswer = this.currentPhase >= 3;
    
    container.innerHTML = `
      <div class="game-card" id="game-card">
        <div class="game-card-header">
          <span class="game-card-category">${this.currentCategory.icon} ${this.currentCategory.name}</span>
          <span class="game-card-phase">Fase ${this.currentPhase}/3</span>
        </div>
        
        <div class="game-card-image">
          <div class="placeholder">🖼️</div>
        </div>
        
        <div class="game-card-footer">
          <div>
            <div class="game-card-word" id="word-display">${this.getWordDisplay()}</div>
          </div>
          <div class="phase-dots">
            <span class="phase-dot ${this.currentPhase >= 1 ? 'active' : ''}"></span>
            <span class="phase-dot ${this.currentPhase >= 2 ? 'active' : ''}"></span>
            <span class="phase-dot ${this.currentPhase >= 3 ? 'active' : ''}"></span>
          </div>
        </div>
      </div>
      
      ${this.renderPhaseContent()}
      
      <div class="game-controls">
        ${this.currentPhase > 1 ? `
          <button class="btn btn-secondary" onclick="game.previousPhase()">
            ← Voltar Fase
          </button>
        ` : ''}
        
        ${this.currentPhase < 3 ? `
          <button class="btn btn-primary" onclick="game.nextPhase()">
            Próxima Dica →
          </button>
        ` : `
          <button class="btn btn-accent" onclick="game.markCorrect()">
            ✅ Acertamos!
          </button>
          <button class="btn btn-ghost" onclick="game.skipCard()">
            Pular ➜
          </button>
        `}
      </div>
    `;
    
    this.updatePhaseIndicator();
  }

  getWordDisplay() {
    switch(this.currentPhase) {
      case 1:
        return '❓';
      case 2:
        return '❓';
      case 3:
        return this.currentCard.word;
      default:
        return this.currentCard.word;
    }
  }

  renderPhaseContent() {
    switch(this.currentPhase) {
      case 1:
        return this.renderPhase1();
      case 2:
        return this.renderPhase2();
      case 3:
        return this.renderPhase3();
      default:
        return '';
    }
  }

  renderPhase1() {
    return `
      <div class="phase-panel phase-1">
        <h3>Fase 1 - Sinal</h3>
        <p class="text-muted">Tente fazer o sinal em LIBRAS para esta imagem!</p>
        <div class="audio-desc">
          <div class="audio-desc-icon">👁️</div>
          <div class="audio-desc-text">
            <strong>Audiodescrição do sinal:</strong><br>
            ${this.currentCard.sign_description}
          </div>
          <button class="btn btn-secondary btn-sm audio-play-btn" onclick="game.playAudio()" aria-label="Ouvir audiodescrição">
            🔊 Ouvir
          </button>
        </div>
      </div>
    `;
  }

  renderPhase2() {
    return `
      <div class="phase-panel phase-2">
        <h3>Fase 2 - Pistas</h3>
        <p class="text-muted">Ainda não acertou? Aqui vão algumas pistas!</p>
        
        <div class="hints-panel">
          ${this.currentCard.hints.map((hint, i) => `
            <div class="hint-item">
              <span class="hint-number">${i + 1}</span>
              <span class="hint-text">${hint}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="audio-desc mt-md">
          <div class="audio-desc-icon">🔊</div>
          <div class="audio-desc-text">
            <strong>Audio:</strong> Faça mímica dos movimentos sem usar a palavra!
          </div>
        </div>
      </div>
    `;
  }

  renderPhase3() {
    return `
      <div class="phase-panel phase-3">
        <h3>Fase 3 - Datilologia</h3>
        <p class="text-muted">Aqui está a palavra em LIBRAS letra por letra!</p>
        
        <div class="fingerspelling">
          ${this.currentCard.fingerspelling.map(letter => `
            <div class="letter-card">
              <div class="letter-image">${letter.letter}</div>
              <div class="letter-label">${letter.letter}</div>
              <div class="letter-desc">${letter.libras}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="braille-section mt-lg">
          <div class="braille-label">Braille</div>
          <div class="braille-text">${this.currentCard.braille}</div>
        </div>
        
        <div class="audio-desc mt-md">
          <div class="audio-desc-icon">📸</div>
          <div class="audio-desc-text">
            <strong>QR Code:</strong> Escaneie para ver vídeo do sinal<br>
            <strong>Audio QR:</strong> Escaneie para ouvir a audiodescrição
          </div>
          <button class="btn btn-secondary btn-sm audio-play-btn" onclick="game.playAudio()" aria-label="Ouvir audiodescrição">
            🔊 Ouvir Sinal
          </button>
        </div>
      </div>
    `;
  }

  updatePhaseIndicator() {
    document.querySelectorAll('.phase-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i + 1 === this.currentPhase) {
        dot.classList.add('active');
      } else if (i + 1 < this.currentPhase) {
        dot.classList.add('completed');
      }
    });
  }

  updateScore() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.textContent = `${this.score}/${this.totalCards}`;
    }
    
    const progressEl = document.getElementById('progress');
    if (progressEl) {
      progressEl.style.width = `${(this.answeredCards.length / this.totalCards) * 100}%`;
    }
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

  markCorrect() {
    this.nextCard();
  }

  nextCard() {
    this.answeredCards.push(this.currentCardIndex);
    this.score++;
    this.updateScore();
    
    if (this.currentCardIndex < this.totalCards - 1) {
      this.currentCardIndex++;
      this.currentPhase = 1;
      this.renderGameCard();
    } else {
      this.showResults();
    }
  }

  skipCard() {
    if (this.currentCardIndex < this.totalCards - 1) {
      this.currentCardIndex++;
      this.currentPhase = 1;
      this.renderGameCard();
    } else {
      this.showResults();
    }
  }

  showResults() {
    const container = document.getElementById('game-card-container');
    container.innerHTML = `
      <div class="results-card">
        <h2>🎉 Parabéns!</h2>
        <p class="text-muted">Você completou a categoria "${this.currentCategory.name}"</p>
        <div class="score-display">
          <span class="score-number">${this.score}</span>
          <span class="score-label">de ${this.totalCards} cartas</span>
        </div>
        <div class="results-actions">
          <button class="btn btn-primary" onclick="game.restartCategory()">
            Jogar Novamente
          </button>
          <button class="btn btn-secondary" onclick="game.backToCategories()">
            Escolher Outra Categoria
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
    this.renderGameCard();
    this.updateScore();
  }

  backToCategories() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('categories-screen').classList.remove('hidden');
  }

  // Reproduzir áudio da audiodescrição
  playAudio() {
    const audioFile = this.currentCard?.audio_file;
    if (!audioFile) {
      console.warn('Sem arquivo de áudio para este card');
      return;
    }

    // Determinar prefixo baseado na localização da página
    const path = window.location.pathname;
    const needsUp = path.includes('/game/') || path.includes('/cards/');
    const prefix = needsUp ? '../' : '';
    const url = prefix + audioFile;

    // Parar áudio anterior se existir
    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    this.currentAudio = new Audio(url);
    this.currentAudio.play().catch(err => {
      console.error('Erro ao reproduzir áudio:', err);
      alert('Não foi possível reproduzir o áudio. Verifique se o arquivo existe.');
    });
  }

  // Parar áudio atual
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

// Inicializar jogo
const game = new LibrappGame();
