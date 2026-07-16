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
    this.accessibleMode = false;
    
    this.init();
  }

  async init() {
    try {
      const baseUrl = window.location.pathname.includes('/game/') ? '../' : '';
      const response = await fetch(baseUrl + 'data/cards.json?v=3');
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

  getPrefix() {
    const path = window.location.pathname;
    return (path.includes('/game/') || path.includes('/cards/')) ? '../' : '';
  }

  renderGameCard() {
    this.currentCard = this.currentCategory.cards[this.currentCardIndex];
    const container = document.getElementById('game-card-container');
    
    const prefix = this.getPrefix();
    
    const showAnswer = this.currentPhase >= 3;
    
    container.innerHTML = `
      <div class="game-card" id="game-card">
        <div class="game-card-header">
          <span class="game-card-category">${this.currentCategory.icon} ${this.currentCategory.name}</span>
          <span class="game-card-phase">Fase ${this.currentPhase}/3</span>
        </div>
        
        <div class="game-card-image">
          <img src="${prefix}${this.currentCard.image}" alt="${this.currentCard.word}" class="card-object-img" onerror="this.style.display='none';this.outerHTML='<div class=\\'placeholder\\'>🖼️</div>'">
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
    const sentence = (this.currentCard.context_sentences || [])[0] || '';
    return `
      <div class="phase-panel phase-1">
        <h3>Fase 1 - Sinal</h3>
        <p class="context-sentence">"${sentence}"</p>
        <div class="sign-image-wrap">
          <img src="${this.getPrefix()}${this.currentCard.sign_image}" alt="Sinal em LIBRAS" class="sign-img" onerror="this.style.display='none'">
          <p class="text-muted">Imagem da interpretação em LIBRAS</p>
        </div>
        <div class="audio-desc mt-md">
          <div class="audio-desc-icon">👁️</div>
          <div class="audio-desc-text">
            <strong>Audiodescrição:</strong> ${this.currentCard.sign_description}
          </div>
        </div>
        ${this.renderAccessibleButton()}
      </div>
    `;
  }

  renderPhase2() {
    const sentences = this.currentCard.context_sentences || [];
    return `
      <div class="phase-panel phase-2">
        <h3>Fase 2 - Frases Contextualizadas</h3>
        <p class="text-muted">Ainda não acertou? Leia estas frases para entender o contexto!</p>
        
        <div class="hints-panel">
          ${sentences.map((sentence, i) => `
            <div class="hint-item">
              <span class="hint-number">${i + 1}</span>
              <span class="hint-text">${sentence}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="audio-desc mt-md">
          <div class="audio-desc-icon">🔊</div>
          <div class="audio-desc-text">
            <strong>Dica:</strong> Use mímica e o sinal em LIBRAS — não fale a palavra!
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
              <img src="${this.getPrefix()}${letter.image}" alt="${letter.letter}" class="letter-image" onerror="this.outerHTML='<div class=\\'letter-image\\'>${letter.letter}</div>'">
              <div class="letter-label">${letter.letter}</div>
              <div class="letter-desc">${letter.libras}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="braille-section mt-lg">
          <div class="braille-label">Braille (texto para leitura na tela)</div>
          <div class="braille-text">${this.currentCard.braille}</div>
          <p class="text-muted small">⚠️ App sem relevo físico — Braille apenas como referência visual.</p>
        </div>
        
        <div class="audio-desc mt-md">
          <div class="audio-desc-icon">📸</div>
          <div class="audio-desc-text">
            <strong>QR Code:</strong> Escaneie para ver vídeo do sinal<br>
            <strong>Audio QR:</strong> Escaneie para ouvir a audiodescrição
          </div>
        </div>
        ${this.renderAccessibleButton()}
      </div>
    `;
  }

  renderAccessibleButton() {
    if (this.accessibleMode) {
      return `
        <div class="accessible-bar">
          <span class="accessible-warning">🎧 Use fones — áudio só para quem faz o sinal</span>
          <button class="btn btn-secondary btn-sm audio-play-btn" onclick="game.playAudio()" aria-label="Ouvir audiodescrição">
            🔊 Ouvir Sinal (com fone)
          </button>
        </div>
      `;
    }
    return `
      <div class="accessible-toggle">
        <button class="btn btn-ghost btn-sm" onclick="game.toggleAccessible()" aria-label="Ativar modo acessível">
          ♿ Acessível
        </button>
      </div>
    `;
  }

  toggleAccessible() {
    this.accessibleMode = !this.accessibleMode;
    this.renderGameCard();
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

    // Parar áudio anterior silenciosamente (sem disparar erro)
    if (this.currentAudio) {
      this.currentAudio.onerror = null;
      this.currentAudio.onabort = null;
      try {
        this.currentAudio.pause();
      } catch (e) {
        // ignora
      }
      this.currentAudio = null;
    }

    const audio = new Audio(url);
    this.currentAudio = audio;

    // Tratar erros específicos sem falsos alertas
    audio.play().catch(err => {
      // AbortError: áudio anterior foi interrompido — não é erro real
      // NotAllowedError: política de autoplay — mas geralmente toca após clique
      if (err && err.name === 'AbortError') {
        console.log('Áudio anterior interrompido (esperado)');
        return;
      }
      // Outros erros: verificar se o arquivo existe
      console.error('Erro ao reproduzir áudio:', err);
      fetch(url, { method: 'HEAD' })
        .then(resp => {
          if (!resp.ok) {
            alert('Arquivo de áudio não encontrado. Verifique o caminho: ' + url);
          }
          // Se resp.ok, o erro foi de autoplay e o áudio pode tocar após interação
        })
        .catch(() => {
          alert('Não foi possível carregar o áudio. Verifique sua conexão.');
        });
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
window.game = new LibrappGame();
