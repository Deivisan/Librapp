/* ============================================
   Librapp - Card Editor
   ============================================ */

class CardEditor {
  constructor() {
    this.currentCard = this.getEmptyCard();
    this.allCards = [];
    this.currentCategory = null;
    this.init();
  }

  init() {
    this.loadCards();
    this.bindEvents();
    this.renderCategories();
  }

  getEmptyCard() {
    return {
      word: '',
      image: '',
      sign_description: '',
      sign_video_qr: '',
      audio_description_qr: '',
      audio_file: '',
      fingerspelling: [],
      braille: '',
      context_sentences: ['', '', '']
    };
  }

  async loadCards() {
    try {
      const response = await fetch('../data/cards.json?v=4');
      const data = await response.json();
      this.allCards = data.categories;
    } catch (error) {
      console.log('Nenhum dado encontrado, iniciando vazio');
      this.allCards = [];
    }
    this.renderCategories();
  }

  bindEvents() {
    // Eventos de input serão vinculados dinamicamente
  }

  renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    container.innerHTML = this.allCards.map((cat, i) => `
      <div class="category-item ${this.currentCategory?.id === cat.id ? 'active' : ''}" 
           data-index="${i}">
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${cat.cards.length} cartas</span>
      </div>
    `).join('');

    container.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.selectCategory(index);
      });
    });
  }

  selectCategory(index) {
    this.currentCategory = this.allCards[index];
    this.renderCategories();
    this.renderCards();
    this.renderCardForm();
  }

  renderCards() {
    const container = document.getElementById('cards-list');
    if (!container || !this.currentCategory) return;

    container.innerHTML = this.currentCategory.cards.map((card, i) => `
      <div class="card-item" data-index="${i}">
        <span class="card-word">${card.word}</span>
        <span class="card-braille">${card.braille}</span>
        <button class="btn btn-ghost btn-sm" onclick="editor.editCard(${i})">
          Editar
        </button>
      </div>
    `).join('');
  }

  renderCardForm() {
    const container = document.getElementById('card-form');
    if (!container) return;

    const card = this.currentCard;
    
    container.innerHTML = `
      <div class="editor-panel">
        <h3>Editar Carta</h3>
        
        <div class="editor-field">
          <label class="editor-label">Palavra</label>
          <input type="text" class="editor-input" id="card-word" 
                 value="${card.word}" placeholder="Ex: Tesoura">
        </div>

        <div class="editor-field">
          <label class="editor-label">Caminho da Imagem</label>
          <input type="text" class="editor-input" id="card-image" 
                 value="${card.image}" placeholder="assets/images/tesoura.png">
        </div>

        <div class="editor-field">
          <label class="editor-label">Descrição do Sinal (Audiodescrição)</label>
          <textarea class="editor-input editor-textarea" id="card-sign-desc" 
                    placeholder="Descreva como fazer o sinal em LIBRAS...">${card.sign_description}</textarea>
        </div>

        <div class="editor-field">
          <label class="editor-label">Arquivo de Áudio (Audiodescrição)</label>
          <input type="text" class="editor-input" id="card-audio-file" 
                 value="${card.audio_file}" placeholder="assets/audio/tesoura.mp3">
          <small class="editor-hint">Caminho do arquivo MP3 gerado pelo Edge TTS</small>
        </div>

        <div class="editor-field">
          <label class="editor-label">Frases Contextualizadas (Fase 2)</label>
          ${card.context_sentences.map((sentence, i) => `
            <input type="text" class="editor-input mb-sm" 
                   id="card-sentence-${i}" value="${sentence}" 
                   placeholder="Frase contextualizada ${i + 1}">
          `).join('')}
        </div>

        <div class="editor-field">
          <label class="editor-label">Datilologia (Letras)</label>
          <div id="fingerspelling-editor">
            ${card.fingerspelling.map((letter, i) => `
              <div class="fingerspelling-row">
                <input type="text" class="editor-input letter-input" 
                       id="fs-letter-${i}" value="${letter.letter}" 
                       placeholder="Letra" maxlength="2">
                <input type="text" class="editor-input" 
                       id="fs-desc-${i}" value="${letter.libras}" 
                       placeholder="Descrição do sinal">
                <button class="btn btn-ghost btn-sm" onclick="editor.removeLetter(${i})">✕</button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-sm mt-sm" onclick="editor.addLetter()">
            + Adicionar Letra
          </button>
        </div>

        <div class="editor-field">
          <label class="editor-label">Em Braille</label>
          <input type="text" class="editor-input" id="card-braille" 
                 value="${card.braille}" placeholder="⠞⠑⠎⠳⠗⠁">
        </div>

        <div class="editor-actions">
          <button class="btn btn-primary" onclick="editor.saveCard()">
            Salvar Carta
          </button>
          <button class="btn btn-secondary" onclick="editor.previewCard()">
            Visualizar
          </button>
          <button class="btn btn-ghost" onclick="editor.exportAll()">
            Exportar JSON
          </button>
        </div>
      </div>
    `;
  }

  editCard(index) {
    this.currentCard = { ...this.currentCategory.cards[index] };
    this.renderCardForm();
  }

  addLetter() {
    this.currentCard.fingerspelling.push({ letter: '', image: '', libras: '' });
    this.renderCardForm();
  }

  removeLetter(index) {
    this.currentCard.fingerspelling.splice(index, 1);
    this.renderCardForm();
  }

  saveCard() {
    // Coletar dados do formulário
    this.currentCard.word = document.getElementById('card-word').value;
    this.currentCard.image = document.getElementById('card-image').value;
    this.currentCard.sign_description = document.getElementById('card-sign-desc').value;
    this.currentCard.audio_file = document.getElementById('card-audio-file').value;
    this.currentCard.braille = document.getElementById('card-braille').value;

    // Coletar frases contextualizadas
    this.currentCard.context_sentences = [];
    for (let i = 0; i < 3; i++) {
      const sentenceInput = document.getElementById(`card-sentence-${i}`);
      if (sentenceInput && sentenceInput.value.trim()) {
        this.currentCard.context_sentences.push(sentenceInput.value.trim());
      }
    }

    // Coletar datilologia
    this.currentCard.fingerspelling = [];
    const letterInputs = document.querySelectorAll('.letter-input');
    letterInputs.forEach((input, i) => {
      const letter = input.value;
      const desc = document.getElementById(`fs-desc-${i}`)?.value || '';
      if (letter) {
        this.currentCard.fingerspelling.push({
          letter,
          image: `assets/signs/letra-${letter.toLowerCase()}.png`,
          libras: desc
        });
      }
    });

    this.renderCards();
    alert('Carta salva!');
  }

  previewCard() {
    // Abrir preview em nova janela
    const previewWindow = window.open('', '_blank');
    const card = this.currentCard;
    
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview: ${card.word}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .preview-card { max-width: 400px; margin: 0 auto; border: 2px solid #333; border-radius: 16px; overflow: hidden; }
          .preview-header { background: #f5f5f5; padding: 16px; border-bottom: 1px solid #ddd; }
          .preview-image { height: 200px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 4rem; }
          .preview-content { padding: 16px; }
          .preview-word { font-size: 1.5rem; font-weight: bold; margin-bottom: 8px; }
          .preview-desc { color: #666; margin-bottom: 16px; }
          .preview-fs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
          .preview-letter { text-align: center; }
          .preview-letter-box { width: 50px; height: 50px; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
          .preview-letter-desc { font-size: 0.6rem; color: #999; margin-top: 4px; }
          .preview-braille { text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; font-size: 1.5rem; }
          .preview-hints { margin-top: 16px; }
          .preview-hint { padding: 8px; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <h2>Preview da Carta</h2>
        <div class="preview-card">
          <div class="preview-header">${card.word || 'Sem palavra'}</div>
          <div class="preview-image">
            ${card.image ? `<img src="../${card.image}" style="width: 140px; height: 140px; object-fit: contain;">` : '🖼️'}
          </div>
          <div class="preview-content">
            <div class="preview-word">${card.word}</div>
            <div class="preview-desc">${card.sign_description}</div>
            <div class="preview-sign">
              <div style="font-size: 0.7rem; color: #999; margin-bottom: 4px;">QR CODE — VÍDEO LIBRAS</div>
              ${card.sign_video_qr ? `<img src="../${card.sign_video_qr}" style="width: 140px; height: 140px; object-fit: contain; border: 2px solid #8b5cf6; border-radius: 8px; padding: 4px; background: #fff;">` : '📱'}
            </div>
            <div class="preview-fs">
              ${card.fingerspelling.map(l => `
                <div class="preview-letter">
                  <div class="preview-letter-box">${l.letter}</div>
                  <div class="preview-letter-desc">${l.libras}</div>
                </div>
              `).join('')}
            </div>
            <div class="preview-braille">
              <div style="font-size: 0.7rem; color: #999; margin-bottom: 4px;">BRAILLE (texto)</div>
              ${card.braille}
            </div>
            ${card.audio_file ? `
              <div style="margin-top: 16px; text-align: center;">
                <button onclick="new Audio('../${card.audio_file}').play()" 
                        style="padding: 8px 16px; background: #06d6a0; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                  🔊 Ouvir Audiodescrição
                </button>
              </div>
            ` : ''}
            <div class="preview-hints">
              <div style="font-weight: bold; margin-bottom: 8px;">Frases Contextualizadas:</div>
              ${(card.context_sentences || []).map(s => `<div class="preview-hint">${s}</div>`).join('')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  exportAll() {
    const data = {
      version: "1.0",
      categories: this.allCards
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  createNewCategory() {
    const name = prompt('Nome da nova categoria:');
    if (!name) return;
    
    const icon = prompt('Ícone (emoji):', '📦');
    
    const newCategory = {
      id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
      name: name,
      icon: icon || '📦',
      cards: []
    };
    
    this.allCards.push(newCategory);
    this.renderCategories();
    alert('Categoria criada!');
  }

  addNewCard() {
    if (!this.currentCategory) {
      alert('Selecione uma categoria primeiro!');
      return;
    }
    
    this.currentCard = this.getEmptyCard();
    this.renderCardForm();
  }

  async saveToFile() {
    const data = {
      version: "1.0",
      categories: this.allCards
    };
    
    // Salvar via API ou download
    this.exportAll();
    alert('Dados exportados! Substitua o arquivo data/cards.json');
  }
}

// Inicializar editor
window.editor = new CardEditor();
