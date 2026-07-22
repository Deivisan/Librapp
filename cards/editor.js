/* ============================================
   Librapp - Card Editor (v2 - Festa)
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
      libras_params: { cm: '', pa: '', mo: '', op: '', efc: '' },
      sign_video_qr: '',
      audio_description_qr: '',
      audio_file: '',
      fingerspelling: [],
      braille: '',
      context_sentences: [
        { text: '', audio_qr: '', video_qr: '' },
        { text: '', audio_qr: '', video_qr: '' },
        { text: '', audio_qr: '', video_qr: '' }
      ]
    };
  }

  async loadCards() {
    try {
      const response = await fetch('../data/cards.json?v=6');
      const data = await response.json();
      this.allCards = data.categories;
    } catch (error) {
      console.log('Nenhum dado encontrado, iniciando vazio');
      this.allCards = [];
    }
    this.renderCategories();
  }

  bindEvents() {
    // Events bound dynamically
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
    const params = card.libras_params || { cm: '', pa: '', mo: '', op: '', efc: '' };

    container.innerHTML = `
      <div class="editor-panel">
        <h3>✏️ Editar Carta</h3>

        <div class="editor-field">
          <label class="editor-label">Palavra</label>
          <input type="text" class="editor-input" id="card-word"
                 value="${this.escapeHtml(card.word)}" placeholder="Ex: Tesoura">
        </div>

        <div class="editor-field">
          <label class="editor-label">Caminho da Imagem</label>
          <input type="text" class="editor-input" id="card-image"
                 value="${this.escapeHtml(card.image)}" placeholder="assets/images/tesoura.jpg">
        </div>

        <div class="editor-field">
          <label class="editor-label">Descrição do Sinal (Audiodescrição)</label>
          <textarea class="editor-input editor-textarea" id="card-sign-desc"
                    placeholder="Descreva como fazer o sinal em LIBRAS...">${this.escapeHtml(card.sign_description)}</textarea>
        </div>

        <!-- Parâmetros LIBRAS -->
        <div class="editor-field">
          <label class="editor-label">🧏 Parâmetros de LIBRAS</label>
          <div class="params-grid">
            <div class="param-field">
              <label class="param-label-editor cm" for="param-cm">CM (Configuração de Mão)</label>
              <input type="text" class="editor-input" id="param-cm"
                     value="${this.escapeHtml(params.cm || '')}" placeholder="Mão em pinça...">
            </div>
            <div class="param-field">
              <label class="param-label-editor pa" for="param-pa">PA (Ponto de Articulação)</label>
              <input type="text" class="editor-input" id="param-pa"
                     value="${this.escapeHtml(params.pa || '')}" placeholder="Espaço neutro...">
            </div>
            <div class="param-field">
              <label class="param-label-editor mo" for="param-mo">MO (Movimento)</label>
              <input type="text" class="editor-input" id="param-mo"
                     value="${this.escapeHtml(params.mo || '')}" placeholder="Abrir e fechar...">
            </div>
            <div class="param-field">
              <label class="param-label-editor op" for="param-op">OP (Orientação da Palma)</label>
              <input type="text" class="editor-input" id="param-op"
                     value="${this.escapeHtml(params.op || '')}" placeholder="Palma para dentro...">
            </div>
            <div class="param-field" style="grid-column: 1 / -1;">
              <label class="param-label-editor efc" for="param-efc">EFC (Expressão Facial e Corporal)</label>
              <input type="text" class="editor-input" id="param-efc"
                     value="${this.escapeHtml(params.efc || '')}" placeholder="Sorriso leve, olhar focado...">
              <small class="editor-hint">Expressão do rosto e corpo durante o sinal — fundamental na LIBRAS</small>
            </div>
          </div>
        </div>

        <div class="editor-field">
          <label class="editor-label">QR Code — Vídeo LIBRAS (caminho)</label>
          <input type="text" class="editor-input" id="card-video-qr"
                 value="${this.escapeHtml(card.sign_video_qr)}" placeholder="assets/qr/tesoura-video.png">
        </div>

        <div class="editor-field">
          <label class="editor-label">QR Code — Audiodescrição (caminho)</label>
          <input type="text" class="editor-input" id="card-audio-qr"
                 value="${this.escapeHtml(card.audio_description_qr)}" placeholder="assets/qr/tesoura-audio.png">
        </div>

        <div class="editor-field">
          <label class="editor-label">Arquivo de Áudio (Audiodescrição)</label>
          <input type="text" class="editor-input" id="card-audio-file"
                 value="${this.escapeHtml(card.audio_file)}" placeholder="assets/audio/tesoura.mp3">
          <small class="editor-hint">Caminho do arquivo MP3 gerado pelo Edge TTS</small>
        </div>

        <div class="editor-field">
          <label class="editor-label">💬 Frases Contextualizadas (Fase 2)</label>
          <small class="editor-hint">Cada frase pode ter QR Code de áudio e vídeo separados</small>
          ${(card.context_sentences || []).map((s, i) => {
            const text = typeof s === 'string' ? s : (s.text || '');
            const aqr = typeof s === 'object' ? (s.audio_qr || '') : '';
            const vqr = typeof s === 'object' ? (s.video_qr || '') : '';
            return `
            <div class="sentence-block" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:var(--space-sm);margin-bottom:var(--space-sm);background:var(--surface);">
              <input type="text" class="editor-input mb-sm"
                     id="card-sentence-${i}" value="${this.escapeHtml(text)}"
                     placeholder="Frase contextualizada ${i + 1}">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xs);">
                <input type="text" class="editor-input" id="card-sentence-aqr-${i}"
                       value="${this.escapeHtml(aqr)}" placeholder="QR Áudio-frase ${i+1}"
                       style="font-size:0.75rem;">
                <input type="text" class="editor-input" id="card-sentence-vqr-${i}"
                       value="${this.escapeHtml(vqr)}" placeholder="QR Vídeo-frase ${i+1}"
                       style="font-size:0.75rem;">
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="editor-field">
          <label class="editor-label">Datilologia (Letras)</label>
          <div id="fingerspelling-editor">
            ${(card.fingerspelling || []).map((letter, i) => `
              <div class="fingerspelling-row">
                <input type="text" class="editor-input letter-input"
                       id="fs-letter-${i}" value="${this.escapeHtml(letter.letter)}"
                       placeholder="L" maxlength="2">
                <input type="text" class="editor-input"
                       id="fs-desc-${i}" value="${this.escapeHtml(letter.libras)}"
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
                 value="${this.escapeHtml(card.braille)}" placeholder="⠞⠑⠎⠳⠗⠁">
        </div>

        <div class="editor-actions">
          <button class="btn btn-primary" onclick="editor.saveCard()">
            💾 Salvar Carta
          </button>
          <button class="btn btn-secondary" onclick="editor.previewCard()">
            👁️ Visualizar
          </button>
          <button class="btn btn-ghost" onclick="editor.exportAll()">
            📦 Exportar JSON
          </button>
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  editCard(index) {
    this.currentCard = JSON.parse(JSON.stringify(this.currentCategory.cards[index]));
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
    this.currentCard.word = document.getElementById('card-word').value.trim();
    this.currentCard.image = document.getElementById('card-image').value.trim();
    this.currentCard.sign_description = document.getElementById('card-sign-desc').value.trim();
    this.currentCard.sign_video_qr = document.getElementById('card-video-qr').value.trim();
    this.currentCard.audio_description_qr = document.getElementById('card-audio-qr').value.trim();
    this.currentCard.audio_file = document.getElementById('card-audio-file').value.trim();
    this.currentCard.braille = document.getElementById('card-braille').value.trim();

    // LIBRAS params
    this.currentCard.libras_params = {
      cm: document.getElementById('param-cm')?.value?.trim() || '',
      pa: document.getElementById('param-pa')?.value?.trim() || '',
      mo: document.getElementById('param-mo')?.value?.trim() || '',
      op: document.getElementById('param-op')?.value?.trim() || '',
      efc: document.getElementById('param-efc')?.value?.trim() || ''
    };

    // Collect sentences
    this.currentCard.context_sentences = [];
    for (let i = 0; i < 3; i++) {
      const input = document.getElementById(`card-sentence-${i}`);
      if (input && input.value.trim()) {
        this.currentCard.context_sentences.push({
          text: input.value.trim(),
          audio_qr: document.getElementById(`card-sentence-aqr-${i}`)?.value?.trim() || '',
          video_qr: document.getElementById(`card-sentence-vqr-${i}`)?.value?.trim() || ''
        });
      }
    }

    // Collect fingerspelling
    this.currentCard.fingerspelling = [];
    const letterInputs = document.querySelectorAll('.letter-input');
    letterInputs.forEach((input, i) => {
      const letter = input.value.trim().toUpperCase();
      const desc = document.getElementById(`fs-desc-${i}`)?.value?.trim() || '';
      if (letter) {
        this.currentCard.fingerspelling.push({
          letter,
          image: `assets/signs/letra-${letter.toLowerCase()}.png`,
          libras: desc
        });
      }
    });

    this.renderCards();
    alert('✅ Carta salva! Não esqueça de exportar o JSON para aplicar.');
  }

  previewCard() {
    const win = window.open('', '_blank');
    const card = this.currentCard;
    const params = card.libras_params || {};

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview: ${this.escapeHtml(card.word)}</title>
        <style>
          body { font-family: 'Space Grotesk', sans-serif; background: #fff8f5; padding: 20px; color: #2d1b14; }
          .card { max-width: 440px; margin: 0 auto; background: #fff; border: 2px solid #ffe0d4; border-radius: 24px; overflow: hidden; box-shadow: 0 6px 24px rgba(255,107,53,0.12); }
          .bar { height: 6px; background: linear-gradient(135deg, #ff6b35, #ff3366); }
          .img-box { padding: 24px; text-align: center; background: #fef; border-bottom: 1px solid #ffe0d4; min-height: 180px; display: flex; align-items: center; justify-content: center; }
          .img-box img { max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 8px; }
          .word { text-align: center; padding: 16px; border-bottom: 1px solid #ffe0d4; }
          .word h2 { font-size: 2rem; margin: 0; font-weight: 800; letter-spacing: -0.02em; }
          .params { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 16px; background: rgba(255,107,53,0.04); border-bottom: 1px solid #ffe0d4; }
          .param { background: #fff; border: 1px solid #ffe0d4; border-radius: 8px; padding: 8px; text-align: center; }
          .param-label { font-weight: 700; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; }
          .param-label.cm { color: #0077b6; }
          .param-label.pa { color: #00c853; }
          .param-label.mo { color: #6b46c1; }
          .param-label.op { color: #ff6b35; }
          .param-label.efc { color: #e91e63; }
          .param-value { font-size: 0.7rem; color: #5c4036; display: block; margin-top: 2px; }
          .desc { padding: 16px; border-bottom: 1px solid #ffe0d4; font-size: 0.85rem; color: #5c4036; line-height: 1.5; }
          .desc strong { color: #2d1b14; display: block; margin-bottom: 4px; }
          .fs { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 16px; border-bottom: 1px solid #ffe0d4; }
          .fs-item { text-align: center; width: 60px; }
          .fs-box { width: 50px; height: 50px; border: 2px solid #ffe0d4; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; margin: 0 auto 4px; }
          .fs-label { font-size: 0.55rem; color: #9e7a6e; }
          .footer { padding: 16px; text-align: center; border-top: 1px solid #ffe0d4; }
          .braille { font-size: 1.5rem; letter-spacing: 0.2em; margin-bottom: 12px; }
          .hints { padding: 16px; border-top: 1px solid #ffe0d4; }
          .hint { padding: 6px 0; border-bottom: 1px solid #ffe0d4; font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="bar"></div>
          <div class="img-box">
            ${card.image ? '<img src="../' + card.image + '">' : '<span style="font-size:3rem">🖼️</span>'}
          </div>
          <div class="word"><h2>${this.escapeHtml(card.word) || '?'}</h2></div>
          <div class="params">
            <div class="param"><span class="param-label cm">CM</span><span class="param-value">${this.escapeHtml(params.cm || '—')}</span></div>
            <div class="param"><span class="param-label pa">PA</span><span class="param-value">${this.escapeHtml(params.pa || '—')}</span></div>
            <div class="param"><span class="param-label mo">MO</span><span class="param-value">${this.escapeHtml(params.mo || '—')}</span></div>
            <div class="param"><span class="param-label op">OP</span><span class="param-value">${this.escapeHtml(params.op || '—')}</span></div>
            <div class="param" style="grid-column: 1 / -1;"><span class="param-label efc">EFC</span><span class="param-value">${this.escapeHtml(params.efc || '—')}</span></div>
          </div>
          <div class="desc"><strong>🖐️ Sinal:</strong> ${this.escapeHtml(card.sign_description || '—')}</div>
          <div class="fs">
            ${(card.fingerspelling || []).map(l => '<div class="fs-item"><div class="fs-box">' + this.escapeHtml(l.letter) + '</div><div class="fs-label">' + this.escapeHtml(l.libras) + '</div></div>').join('')}
          </div>
          ${card.braille ? '<div class="footer"><div class="braille">' + this.escapeHtml(card.braille) + '</div></div>' : ''}
          ${(card.context_sentences || []).filter(s => typeof s === 'string' ? s : s.text).length ? '<div class="hints">' + card.context_sentences.filter(s => typeof s === 'string' ? s : s.text).map(s => {
            const text = typeof s === 'string' ? s : s.text;
            const hasQr = typeof s === 'object' && (s.audio_qr || s.video_qr);
            return '<div class="hint">💬 ' + this.escapeHtml(text) + (hasQr ? ' <span style="font-size:0.7rem;color:#9e7a6e;">[QRs]</span>' : '') + '</div>';
          }).join('') + '</div>' : ''}
        </div>
      </body>
      </html>
    `);
  }

  exportAll() {
    const data = {
      version: "3.0",
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
    if (!icon) return;

    const newCategory = {
      id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
      name: name,
      icon: icon,
      cards: []
    };

    this.allCards.push(newCategory);
    this.renderCategories();
    alert('✅ Categoria criada!');
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
    this.exportAll();
    alert('✅ Dados exportados! Substitua o arquivo data/cards.json no servidor.');
  }
}

// Init
window.editor = new CardEditor();
