/* ============================================
   Librapp - Card Editor v3 (Didático)
   ============================================ */

class CardEditor {
  constructor() {
    this.currentCard = null;
    this.allCards = [];
    this.currentCategory = null;
    this.currentIndex = -1;
    this.activePhase = 1;
    this.fsImageCache = {}; // cache de imagens das letras
    this.init();
  }

  /* ── lifecycle ── */
  init() {
    this.loadCards();
    this.renderCategories();
  }

  getEmptyCard() {
    return {
      word: '',
      image: '',           // imagem ilustrativa da palavra
      sign_image: '',      // foto do sinal sendo feito (Fase 1)
      sign_description: '',
      libras_params: { cm: '', pa: '', mo: '', op: '', efc: '' },
      sign_video_qr: '',
      audio_description_qr: '',
      context_final_qr: '', // QR final da interpretação completa (Fase 2)
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

  STORAGE_KEY = 'librapp-cards-data';

  async loadCards() {
    // 1) tenta localStorage (dados salvos pelo editor)
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        this.allCards = data.categories || [];
        if (this.allCards.length) { this.renderCategories(); return; }
      } catch {}
    }
    // 2) fallback: carrega do arquivo original
    try {
      const resp = await fetch('../data/cards.json?v=7');
      const data = await resp.json();
      this.allCards = data.categories || [];
    } catch { this.allCards = []; }
    this.persist();
    this.renderCategories();
  }

  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ version: '3.0', categories: this.allCards }));
    } catch {}
  }

  /* ── sidebar ── */
  renderCategories() {
    const el = document.getElementById('categories-list');
    if (!el) return;
    el.innerHTML = this.allCards.map((c, i) => `
      <div class="category-item ${this.currentCategory?.id === c.id ? 'active' : ''}" data-i="${i}">
        <span class="category-icon">${c.icon}</span>
        <span class="category-name">${c.name}</span>
        <span class="category-count">${c.cards.length}</span>
      </div>
    `).join('');

    el.querySelectorAll('.category-item').forEach(item => {
      item.onclick = () => {
        const idx = +item.dataset.i;
        this.currentCategory = this.allCards[idx];
        this.currentIndex = -1;
        this.currentCard = null;
        this.renderCategories();
        this.renderCards();
        this.renderForm();
      };
    });
    this.renderCards();
  }

  renderCards() {
    const el = document.getElementById('cards-list');
    if (!el) return;
    if (!this.currentCategory) { el.innerHTML = '<div style="font-size:0.8rem;color:var(--muted);padding:8px;">Selecione uma categoria</div>'; return; }
    el.innerHTML = this.currentCategory.cards.map((c, i) => `
      <div class="card-item ${this.currentIndex === i ? 'active' : ''}" data-i="${i}">
        <span class="card-word">${c.word || '(sem nome)'}</span>
        <span class="card-braille">${c.braille || ''}</span>
      </div>
    `).join('');

    el.querySelectorAll('.card-item').forEach(item => {
      item.onclick = () => {
        this.currentIndex = +item.dataset.i;
        this.currentCard = this.currentCategory.cards[this.currentIndex];
        this.activePhase = 1;
        this.renderCards();
        this.renderForm();
      };
    });
  }

  /* ── form ── */
  renderForm() {
    const el = document.getElementById('card-form');
    if (!el) return;

    if (!this.currentCard) {
      el.innerHTML = `<div class="phase-section" style="text-align:center;padding:var(--space-2xl);color:var(--muted);">
        <div style="font-size:3rem;margin-bottom:var(--space-md);">🃏</div>
        <p style="font-weight:600;margin-bottom:4px;">Selecione uma carta para editar</p>
        <p style="font-size:0.85rem;">ou clique em "+ Nova Carta"</p>
      </div>`;
      return;
    }

    const c = this.currentCard;
    const p = c.libras_params || { cm:'', pa:'', mo:'', op:'', efc:'' };
    const words = (c.word || '').toUpperCase().replace(/[^A-ZÃÕÉÍÓÚ]/g, '');

    // Build fingerspelling auto from word if empty
    if (words && (!c.fingerspelling || c.fingerspelling.length === 0)) {
      c.fingerspelling = [...words].map(l => ({ letter: l, image: `assets/signs/letra-${l.toLowerCase()}.png`, libras: `Sinal da letra ${l}` }));
    }

    el.innerHTML = `
      <!-- Phase Tabs -->
      <div class="phase-tabs" id="phase-tabs">
        <div class="phase-tab ${this.activePhase===1?'active':''}" data-phase="1">
          <span class="tab-num">1</span> Sinal
        </div>
        <div class="phase-tab ${this.activePhase===2?'active':''}" data-phase="2">
          <span class="tab-num">2</span> Contexto
        </div>
        <div class="phase-tab ${this.activePhase===3?'active':''}" data-phase="3">
          <span class="tab-num">3</span> Datilologia + Braille
        </div>
      </div>

      <!-- PHASE 1: Sinal -->
      <div class="phase-section" id="phase-1" ${this.activePhase!==1?'style="display:none"':''}>
        <h3>🖐️ Fase 1 — Sinal <span class="phase-badge">PARÂMETROS</span></h3>

        <div class="field-row">
          <div class="field">
            <label>Palavra</label>
            <input type="text" id="f-word" value="${this.esc(c.word)}" placeholder="Ex: Tesoura, Maçã, Cachorro...">
            <span class="hint">Nome da palavra em português</span>
          </div>
          <div class="field">
            <label>Imagem da Palavra</label>
            <div class="file-upload" id="upload-image" onclick="this.querySelector('input').click()">
              <input type="file" accept="image/*" data-field="image" onchange="editor.handleFile(this)">
              <div class="upload-icon">🖼️</div>
              <div class="upload-text">${c.image ? '<div class="upload-filename">📎 ' + this.esc(this.shortPath(c.image)) + '</div>' : 'Clique ou arraste uma imagem'}</div>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Descrição do Sinal (Audiodescrição)</label>
          <textarea id="f-desc" placeholder="Ex: Mão em forma de tesoura — indicador e médio estendidos fazendo movimento de abrir e fechar.">${this.esc(c.sign_description)}</textarea>
          <span class="hint">Como executar o sinal — para quem não enxerga ou está aprendendo</span>
        </div>

        <div class="field-row">
          <div class="field">
            <label>📸 Foto do Sinal</label>
            <div class="file-upload" id="upload-sign-image" onclick="this.querySelector('input').click()">
              <input type="file" accept="image/*" data-field="sign_image" onchange="editor.handleFile(this)">
              <div class="upload-icon">🖐️</div>
              <div class="upload-text">${c.sign_image ? '<div class="upload-filename">📎 ' + this.esc(this.shortPath(c.sign_image)) + '</div>' : 'Foto do sinal sendo feito'}</div>
            </div>
            <span class="hint">Imagem mostrando como fazer o sinal em LIBRAS</span>
          </div>
        </div>

        <div style="font-weight:700;font-size:0.8rem;color:var(--muted);margin:var(--space-md) 0 var(--space-sm);text-transform:uppercase;letter-spacing:0.06em;">
          Parâmetros da LIBRAS
        </div>

        <div class="field-row">
          <div class="field param-cm">
            <label>CM — Configuração de Mão</label>
            <input type="text" id="f-cm" value="${this.esc(p.cm)}" placeholder="Ex: Pinça, Mão aberta, Punho...">
          </div>
          <div class="field param-pa">
            <label>PA — Ponto de Articulação</label>
            <input type="text" id="f-pa" value="${this.esc(p.pa)}" placeholder="Ex: Espaço neutro, boca, testa...">
          </div>
        </div>
        <div class="field-row">
          <div class="field param-mo">
            <label>MO — Movimento</label>
            <input type="text" id="f-mo" value="${this.esc(p.mo)}" placeholder="Ex: Circular, linear, repetido...">
          </div>
          <div class="field param-op">
            <label>OP — Orientação da Palma</label>
            <input type="text" id="f-op" value="${this.esc(p.op)}" placeholder="Ex: Palma para dentro, para baixo...">
          </div>
        </div>
        <div class="field-row full">
          <div class="field param-efc">
            <label>EFC — Expressão Facial e Corporal</label>
            <input type="text" id="f-efc" value="${this.esc(p.efc)}" placeholder="Ex: Sorriso leve, olhar focado, expressão de concentração...">
            <span class="hint">Fundamental na LIBRAS — expressão do rosto e corpo durante o sinal</span>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>🎥 QR Code — Vídeo do Sinal</label>
            <div class="file-upload" id="upload-video-qr" onclick="this.querySelector('input').click()">
              <input type="file" accept="image/*" data-field="sign_video_qr" onchange="editor.handleFile(this)">
              <div class="upload-icon">📱</div>
              <div class="upload-text">${c.sign_video_qr ? '<div class="upload-filename">📎 ' + this.esc(this.shortPath(c.sign_video_qr)) + '</div>' : 'Imagem do QR Code (vídeo)'}</div>
            </div>
          </div>
          <div class="field">
            <label>🔊 QR Code — Áudio-descrição</label>
            <div class="file-upload" id="upload-audio-qr" onclick="this.querySelector('input').click()">
              <input type="file" accept="image/*" data-field="audio_description_qr" onchange="editor.handleFile(this)">
              <div class="upload-icon">📱</div>
              <div class="upload-text">${c.audio_description_qr ? '<div class="upload-filename">📎 ' + this.esc(this.shortPath(c.audio_description_qr)) + '</div>' : 'Imagem do QR Code (áudio)'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PHASE 2: Contexto -->
      <div class="phase-section" id="phase-2" ${this.activePhase!==2?'style="display:none"':''}>
        <h3>💬 Fase 2 — Contexto <span class="phase-badge">FRASES</span></h3>
        <p style="color:var(--muted);font-size:0.85rem;margin-bottom:var(--space-md);">
          Escreva 3 frases com a palavra. Cada frase pode ter seu próprio QR Code de vídeo e áudio.
        </p>

        ${(c.context_sentences || []).map((s, i) => {
          const txt = typeof s === 'string' ? s : (s.text || '');
          const aqr = typeof s === 'object' ? (s.audio_qr || '') : '';
          const vqr = typeof s === 'object' ? (s.video_qr || '') : '';
          return `
          <div class="sentence-block">
            <div class="sentence-header">
              <div class="sentence-num">${i + 1}</div>
              <div class="sentence-label">Frase ${i + 1}</div>
            </div>
            <div class="field">
              <input type="text" id="f-ctx-${i}" value="${this.esc(txt)}" placeholder="Ex: Preciso cortar o papel pra atividade.">
            </div>
            <div class="field-row">
              <div class="field">
                <label style="font-size:0.7rem;">QR Vídeo desta frase</label>
                <div class="file-upload" style="padding:var(--space-sm)" onclick="this.querySelector('input').click()">
                  <input type="file" accept="image/*" data-field="ctx-vqr-${i}" onchange="editor.handleFile(this)">
                  <div class="upload-text" style="font-size:0.75rem;">${vqr ? '📎 ' + this.esc(this.shortPath(vqr)) : '📱 QR vídeo'}</div>
                </div>
              </div>
              <div class="field">
                <label style="font-size:0.7rem;">QR Áudio desta frase</label>
                <div class="file-upload" style="padding:var(--space-sm)" onclick="this.querySelector('input').click()">
                  <input type="file" accept="image/*" data-field="ctx-aqr-${i}" onchange="editor.handleFile(this)">
                  <div class="upload-text" style="font-size:0.75rem;">${aqr ? '📎 ' + this.esc(this.shortPath(aqr)) : '📱 QR áudio'}</div>
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}

        <div class="field-row full" style="margin-top:var(--space-md);">
          <div class="field">
            <label style="font-weight:700;color:var(--orange);">🎬 QR Code Final — Vídeo da Frase Completa (Interpretação)</label>
            <div class="file-upload" style="padding:var(--space-md)" onclick="this.querySelector('input').click()">
              <input type="file" accept="image/*" data-field="context_final_qr" onchange="editor.handleFile(this)">
              <div class="upload-icon">🎬</div>
              <div class="upload-text">${c.context_final_qr ? '<div class="upload-filename">📎 QR final carregado</div>' : 'QR Code com interpretação completa da frase'}</div>
            </div>
            <span class="hint">Vídeo com a frase completa sendo sinalizada em LIBRAS</span>
          </div>
        </div>
      </div>

      <!-- PHASE 3: Datilologia + Braille -->
      <div class="phase-section" id="phase-3" ${this.activePhase!==3?'style="display:none"':''}>
        <h3>🔤 Fase 3 — Datilologia + Braille <span class="phase-badge">LETRAS</span></h3>
        <p style="color:var(--muted);font-size:0.85rem;margin-bottom:var(--space-md);">
          Datilologia = cada letra em LIBRAS. As letras são geradas automaticamente da palavra.
          Você pode ajustar as imagens e descrições.
        </p>

        <div class="fs-chips" id="fs-chips">
          ${(c.fingerspelling || []).map((f, i) => `
            <div class="fs-chip" data-i="${i}">
              <span class="letter">${f.letter}</span>
              <input type="text" value="${this.esc(f.libras)}" placeholder="Desc." data-fi="${i}" onchange="editor.updateFS(this)">
              <div class="file-upload" style="padding:2px 4px;border-width:1px;border-radius:4px;" onclick="event.stopPropagation();this.querySelector('input').click()">
                <input type="file" accept="image/*" data-field="fs-${i}" onchange="editor.handleFile(this)" style="display:none">
                <div style="font-size:0.55rem;color:var(--muted);">${f.image && !f.image.startsWith('assets/') ? '📱' : 'QR'}</div>
              </div>
              <button class="remove-letter" onclick="editor.removeFS(${i})">✕</button>
            </div>
          `).join('')}
          <div class="fs-chip" style="border-style:dashed;cursor:pointer;" onclick="editor.addFS()">
            <span class="letter" style="font-size:1.5rem;color:var(--muted);">+</span>
          </div>
        </div>
        <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm);align-items:center;">
          <button class="btn btn-ghost btn-sm" onclick="editor.autoGenFS()">🔄 Auto-gerar da palavra</button>
          <span style="font-size:0.7rem;color:var(--muted);">Gera as letras a partir do nome da carta</span>
        </div>

        <div class="field-row full" style="margin-top:var(--space-lg);">
          <div class="field">
            <label>⠿ Braille da palavra</label>
            <div style="display:flex;gap:var(--space-sm);align-items:center;">
              <input type="text" id="f-braille" value="${this.esc(c.braille)}" placeholder="⠞⠑⠎⠕⠥⠗⠁" style="font-size:1.4rem;letter-spacing:0.2em;max-width:400px;">
              <button class="btn btn-ghost btn-sm" onclick="editor.autoGenBraille()">🔄 Auto-gerar</button>
            </div>
            <span class="hint">Use o botão para gerar automaticamente, ou cole o Braille manualmente</span>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="phase-section" id="card-preview">
        <h3>👁️ Preview da Carta</h3>
        <div id="preview-content"></div>
      </div>

      <!-- Actions -->
      <div class="editor-actions">
        <button class="btn btn-primary" onclick="editor.saveCard()">💾 Salvar Carta</button>
        <button class="btn btn-secondary" onclick="editor.duplicateCard()">📋 Duplicar</button>
        <button class="btn btn-danger" onclick="editor.deleteCard()">🗑️ Excluir</button>
        <button class="btn btn-ghost" onclick="editor.printCard()">🖨️ Imprimir</button>
      </div>
    `;

    // Bind phase tabs
    el.querySelectorAll('.phase-tab').forEach(tab => {
      tab.onclick = () => {
        this.activePhase = +tab.dataset.phase;
        this.renderForm();
        // Scroll to the phase section
        setTimeout(() => {
          const target = document.getElementById('phase-' + this.activePhase);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      };
    });

    this.renderPreview();
  }

  /* ── file upload ── */
  handleFile(input) {
    const file = input.files[0];
    if (!file) return;
    const field = input.dataset.field;

    // Embed image as dataURL so it works in print/preview/export
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      if (field.startsWith('ctx-')) {
        const [, type, idx] = field.split('-');
        const c = this.currentCard;
        if (!c.context_sentences[+idx]) c.context_sentences[+idx] = { text:'', audio_qr:'', video_qr:'' };
        if (type === 'vqr') c.context_sentences[+idx].video_qr = dataUrl;
        if (type === 'aqr') c.context_sentences[+idx].audio_qr = dataUrl;
      } else if (field.startsWith('fs-')) {
        const [, , idx] = field.split('-');
        if (this.currentCard.fingerspelling[+idx]) {
          this.currentCard.fingerspelling[+idx].image = dataUrl;
        }
      } else {
        this.currentCard[field] = dataUrl;
      }

      // Show uploaded preview on the upload area
      const upload = input.closest('.file-upload');
      if (upload) {
        upload.classList.add('has-file');
        const textEl = upload.querySelector('.upload-text');
        if (textEl) textEl.innerHTML = `<div class="upload-filename">📎 ${file.name}</div>`;
      }

      this.persist();
      this.renderPreview();
    };
    reader.readAsDataURL(file);
  }

  /* ── datilologia helpers ── */
  autoGenFS() {
    const word = (this.currentCard.word || '').toUpperCase().replace(/[^A-ZÃÕÉÍÓÚ]/g, '');
    if (!word) { alert('Preencha a palavra primeiro!'); return; }
    this.currentCard.fingerspelling = [...word].map(l => ({
      letter: l, image: `assets/signs/letra-${l.toLowerCase()}.png`, libras: `Sinal da letra ${l}`
    }));
    this.renderForm();
  }

  addFS() {
    this.currentCard.fingerspelling.push({ letter: '?', image: '', libras: '' });
    this.renderForm();
  }

  removeFS(idx) {
    this.currentCard.fingerspelling.splice(idx, 1);
    this.renderForm();
  }

  updateFS(input) {
    const idx = +input.dataset.fi;
    this.currentCard.fingerspelling[idx].libras = input.value;
  }

  /* ── braille ── */
  autoGenBraille() {
    const map = {
      'A':'⠁','B':'⠃','C':'⠉','D':'⠙','E':'⠑','F':'⠋','G':'⠛','H':'⠓',
      'I':'⠊','J':'⠚','K':'⠅','L':'⠇','M':'⠍','N':'⠝','O':'⠕','P':'⠏',
      'Q':'⠟','R':'⠗','S':'⠎','T':'⠞','U':'⠥','V':'⠧','W':'⠺','X':'⠭',
      'Y':'⠽','Z':'⠵','Ã':'⠩','Õ':'⠪','É':'⠮','Í':'⠊','Ó':'⠪','Ú':'⠥'
    };
    const word = (this.currentCard.word || '').toUpperCase().replace(/[^A-ZÃÕÉÍÓÚ]/g, '');
    if (!word) { alert('Preencha a palavra primeiro!'); return; }
    this.currentCard.braille = [...word].map(l => map[l] || l).join('');
    this.renderForm();
  }

  /* ── save/delete/duplicate ── */
  saveCard() {
    const c = this.currentCard;
    c.word = document.getElementById('f-word')?.value?.trim() || c.word;
    c.sign_description = document.getElementById('f-desc')?.value?.trim() || '';
    c.sign_image = c.sign_image || ''; // já preenchido pelo handleFile
    c.sign_video_qr = c.sign_video_qr || '';
    c.audio_description_qr = c.audio_description_qr || '';
    c.context_final_qr = c.context_final_qr || '';

    c.libras_params = {
      cm: document.getElementById('f-cm')?.value?.trim() || '',
      pa: document.getElementById('f-pa')?.value?.trim() || '',
      mo: document.getElementById('f-mo')?.value?.trim() || '',
      op: document.getElementById('f-op')?.value?.trim() || '',
      efc: document.getElementById('f-efc')?.value?.trim() || ''
    };
    c.braille = document.getElementById('f-braille')?.value?.trim() || '';

    // Salva QRs existentes ANTES de limpar (handleFile joga dados aqui)
    const existingSentences = (c.context_sentences || []).map(s => typeof s === 'object' ? s : {});

    // Collect sentences
    c.context_sentences = [];
    for (let i = 0; i < 3; i++) {
      const txt = document.getElementById(`f-ctx-${i}`)?.value?.trim() || '';
      if (txt) {
        const prev = existingSentences[i] || {};
        c.context_sentences.push({
          text: txt,
          audio_qr: prev.audio_qr || '',
          video_qr: prev.video_qr || ''
        });
      }
    }

    this.renderCards();
    this.renderPreview();
    this.persist();
    alert('✅ Carta salva!');
  }

  deleteCard() {
    if (!this.currentCategory || this.currentIndex < 0) return;
    if (!confirm(`Excluir "${this.currentCard.word}"?`)) return;
    this.currentCategory.cards.splice(this.currentIndex, 1);
    this.currentCard = null;
    this.currentIndex = -1;
    this.persist();
    this.renderCards();
    this.renderForm();
  }

  duplicateCard() {
    if (!this.currentCategory || !this.currentCard) return;
    const dup = JSON.parse(JSON.stringify(this.currentCard));
    dup.word = dup.word + ' (cópia)';
    this.currentCategory.cards.push(dup);
    this.currentIndex = this.currentCategory.cards.length - 1;
    this.currentCard = dup;
    this.persist();
    this.renderCards();
    this.renderForm();
  }

  addNewCard() {
    if (!this.currentCategory) { alert('Selecione uma categoria primeiro!'); return; }
    const card = this.getEmptyCard();
    this.currentCategory.cards.push(card);
    this.currentIndex = this.currentCategory.cards.length - 1;
    this.currentCard = card;
    this.activePhase = 1;
    this.persist();
    this.renderCards();
    this.renderForm();
  }

  createNewCategory() {
    const name = prompt('Nome da nova categoria:');
    if (!name) return;
    const icon = prompt('Ícone da categoria (emoji):', '📚') || '📚';
    this.allCards.push({ id: this.toSlug(name), name, icon, cards: [] });
    this.currentCategory = this.allCards[this.allCards.length - 1];
    this.persist();
    this.renderCategories();
  }

  /* ── export ── */
  saveToFile() {
    const data = { version: '3.0', categories: this.allCards };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cards.json'; a.click();
    URL.revokeObjectURL(url);
  }

  importFromFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.categories && Array.isArray(data.categories)) {
          this.allCards = data.categories;
        } else if (Array.isArray(data)) {
          this.allCards = data;
        } else {
          alert('Formato JSON inválido. Esperado: { categories: [...] }');
          return;
        }
        this.currentCard = null;
        this.currentIndex = -1;
        this.currentCategory = null;
        this.persist();
        this.renderCategories();
        alert(`✅ Importado! ${this.allCards.length} categorias carregadas.`);
      } catch (err) {
        alert('❌ Erro ao ler JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  clearAll() {
    if (!confirm('⚠️ Tem certeza? Isso vai apagar TODAS as cartas e categorias do editor.')) return;
    if (!confirm('Última chance! Confirma limpar tudo?')) return;
    this.allCards = [];
    this.currentCard = null;
    this.currentCategory = null;
    this.currentIndex = -1;
    this.persist();
    this.renderCategories();
    this.renderForm();
  }

  /* ── preview ── */
  renderPreview() {
    const el = document.getElementById('preview-content');
    if (!el || !this.currentCard) { if (el) el.innerHTML = ''; return; }
    const c = this.currentCard;
    const p = c.libras_params || {};

    el.innerHTML = `
      <div style="background:var(--bg-card);border:2px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-xl);font-family:var(--display);max-width:500px;">
        <div style="text-align:center;margin-bottom:var(--space-md);">
          <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.15em;">${this.currentCategory?.name || 'Categoria'}</div>
          <div style="font-size:1.8rem;font-weight:800;letter-spacing:-0.02em;">${this.esc(c.word || '(sem nome)')}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:var(--space-md);font-size:0.65rem;text-align:center;">
          <div style="background:rgba(0,119,182,0.08);padding:6px 4px;border-radius:8px;"><b style="color:var(--blue);">CM</b><br><span style="font-size:0.6rem;">${this.esc(p.cm||'—')}</span></div>
          <div style="background:rgba(0,200,83,0.08);padding:6px 4px;border-radius:8px;"><b style="color:var(--green);">PA</b><br><span style="font-size:0.6rem;">${this.esc(p.pa||'—')}</span></div>
          <div style="background:rgba(107,70,193,0.08);padding:6px 4px;border-radius:8px;"><b style="color:var(--purple);">MO</b><br><span style="font-size:0.6rem;">${this.esc(p.mo||'—')}</span></div>
          <div style="background:rgba(255,107,53,0.08);padding:6px 4px;border-radius:8px;"><b style="color:var(--orange);">OP</b><br><span style="font-size:0.6rem;">${this.esc(p.op||'—')}</span></div>
          <div style="background:rgba(233,30,99,0.08);padding:6px 4px;border-radius:8px;"><b style="color:#e91e63;">EFC</b><br><span style="font-size:0.6rem;">${this.esc(p.efc||'—')}</span></div>
        </div>

        ${c.sign_description ? `<div style="font-size:0.75rem;color:var(--muted);margin-bottom:var(--space-md);font-style:italic;">"${this.esc(c.sign_description)}"</div>` : ''}

        ${c.sign_image ? `<div style="text-align:center;margin-bottom:var(--space-md);"><img src="${c.sign_image.startsWith('data:') ? c.sign_image : '../' + c.sign_image}" style="max-width:200px;max-height:120px;border-radius:8px;border:1px solid var(--border);"></div>` : ''}

        ${(c.context_sentences||[]).filter(s => typeof s === 'string' ? s : s.text).length ? `
        <div style="margin-bottom:var(--space-md);">
          <div style="font-size:0.7rem;font-weight:700;color:var(--muted);margin-bottom:4px;">💬 CONTEXTOS</div>
          ${c.context_sentences.filter(s => typeof s === 'string' ? s : s.text).map(s => {
            const text = typeof s === 'string' ? s : s.text;
            return `<div style="font-size:0.8rem;margin-bottom:2px;">💬 ${this.esc(text)}</div>`;
          }).join('')}
          ${c.context_final_qr ? '<div style="font-size:0.65rem;color:var(--orange);margin-top:4px;">🎬 QR Final: interpretação completa</div>' : ''}
        </div>` : ''}

        ${(c.fingerspelling||[]).length ? `
        <div style="margin-bottom:var(--space-md);">
          <div style="font-size:0.7rem;font-weight:700;color:var(--muted);margin-bottom:4px;">🔤 DATILOLOGIA</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${c.fingerspelling.map(f => `<div style="border:1px solid var(--border);border-radius:8px;padding:4px 8px;text-align:center;"><b style="font-size:1rem;">${f.letter}</b><div style="font-size:0.6rem;color:var(--muted);">${this.esc(f.libras)}</div></div>`).join('<span style="align-self:center;color:var(--muted);">+</span>')}
          </div>
        </div>` : ''}

        ${c.braille ? `
        <div style="text-align:center;padding:var(--space-sm);background:var(--surface);border-radius:var(--radius-md);">
          <div style="font-size:0.65rem;font-weight:700;color:var(--muted);margin-bottom:2px;">⠿ BRAILLE</div>
          <div style="font-size:1.8rem;letter-spacing:0.3em;">${this.esc(c.braille)}</div>
        </div>` : ''}
      </div>
    `;
  }

  /* ── print ── */
  printCard() {
    this.renderPreview();
    const content = document.getElementById('preview-content')?.innerHTML || '';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Carta Librapp</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Space Grotesk',sans-serif; padding:2cm; color:#2d1b10; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  }

  /* ── utils ── */
  esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  toSlug(s) { return s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  shortPath(p) { return (p||'').split('/').pop(); }
}

const editor = new CardEditor();
