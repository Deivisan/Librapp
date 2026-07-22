# Prompt para Gemini Notebook — Librapp
# Copie TODO este conteúdo e cole no Gemini Notebook (NotebookLM) para gerar apresentações editáveis/imprimíveis.

---

## INSTRUÇÃO PRINCIPAL

Crie uma apresentação Google Slides (ou Google Docs) editável e imprimível para o projeto **Librapp** — um jogo educativo de LIBRAS (Língua Brasileira de Sinais) para uso em salas de aula.

Cada slide deve conter **UMA ÚNICA CARTA** formatada como card de aprendizado. O objetivo é que professores e intérpretes imprimam esses cards e usem em atividades presenciais com alunos surdos e ouvintes.

---

## ESTRUTURA DE CADA CARD (SLIDE)

Cada card deve seguir EXATAMENTE esta estrutura:

### CABEÇALHO
- **Categoria** (ex: "Sala de Aula", "Alimentos", "Animais")
- **Palavra** em destaque (fonte grande, bold)
- **Ícone/Imagem** da palavra

### SEÇÃO 1 — PARÂMETROS DA LIBRAS
Exibir em grade/colorido:

| Sigla | Nome | Descrição |
|-------|------|-----------|
| **CM** | Configuração de Mão | [descrição] |
| **PA** | Ponto de Articulação | [descrição] |
| **MO** | Movimento | [descrição] |
| **OP** | Orientação da Palma | [descrição] |
| **EFC** | Expressão Facial e Corporal | [descrição] |

### SEÇÃO 2 — SINAL (Fase 1)
- Espaço para **imagem/foto do sinal**
- **Descrição do sinal** (audiodescrição)
- **QR Code 1** → Vídeo do sinal sendo realizado
- **QR Code 2** → Áudio-descrição do sinal

### SEÇÃO 3 — CONTEXTO (Fase 2)
- **3 frases contextualizadas** com a palavra
- Para CADA frase:
  - Texto da frase
  - **QR Code** → Vídeo da frase sinalizada
  - **QR Code** → Áudio-descrição da frase
- **QR Code Final** → Vídeo com interpretação completa da frase principal

### SEÇÃO 4 — DATILOLOGIA + BRAILLE (Fase 3)
- **Palavra** soletrada letra por letra
- Para CADA letra:
  - Imagem/foto do sinal da letra
  - **QR Code** → Vídeo da letra
- **Braille** da palavra inteira
- **QR Code** → Áudio-descrição da datilologia completa

---

## EXEMPLO PREENCHIDO — "TESOURA" (Categoria: Sala de Aula)

### Parâmetros
- **CM:** Pinça (indicador e médio estendidos)
- **PA:** Espaço neutro à frente do tronco
- **MO:** Abrir e fechar os dedos (movimento de corte)
- **OP:** Palmas para dentro, uma de frente pra outra
- **EFC:** Sorriso leve, olhar focado nos dedos, expressão de concentração ao "cortar"

### Sinal
Descrição: "Mão em forma de tesoura — indicador e médio estendidos fazendo movimento de abrir e fechar."

### Frases Contextualizadas
1. "Preciso cortar o papel pra atividade."
2. "Ela está sem ponta, melhor usar outra."
3. "Na aula de artes usamos pra recortar figuras."

### Datilologia
T → E → S → O → U → R → A

### Braille
⠞⠑⠎⠕⠥⠗⠁

---

## EXEMPLO PREENCHIDO — "MAÇÃ" (Categoria: Alimentos)

### Parâmetros
- **CM:** Mão em pinça (polegar e indicador)
- **PA:** Lateral da boca
- **MO:** Levar à boca e fazer movimento de morder
- **OP:** Palma voltada para a boca
- **EFC:** Sorriso ao "morder", expressão de sabor, olhar para o objeto imaginário

### Sinal
Descrição: "Mão em pinça levada à boca, simulando morder uma maçã."

### Frases Contextualizadas
1. "Eu como uma maçã todo dia."
2. "A maçã está madura e doce."
3. "Vamos fazer suco de maçã?"

### Datilologia
M → A → Ç → Ã

### Braille
⠍⠁⠉⠁

---

## EXEMPLO PREENCHIDO — "CACHORRO" (Categoria: Animais)

### Parâmetros
- **CM:** Mão aberta, dedos levemente curvados (unhas)
- **PA:** Coxa ou altura da cintura
- **MO:** Bater a mão na coxa repetidamente
- **OP:** Palma para baixo
- **EFC:** Sorriso aberto, expressão de carinho, olhar brincalhão

### Sinal
Descrição: "Mão aberta com dedos curvados batendo na coxa, como quem chama um cachorro."

### Frases Contextualizadas
1. "O cachorro está latejando lá fora."
2. "Eu levo meu cachorro para passear todo dia."
3. "O cachorro é o melhor amigo do homem."

### Datilologia
C → A → C → H → O → R → R → O

### Braille
⠉⠁⠉⠓⠕⠗⠗⠕

---

## LISTA DE PALAVRAS PARA GERAR

Gere cards para TODAS estas palavras, seguindo a mesma estrutura:

### Sala de Aula (15 cards)
Tesoura, Lápis, Borracha, Caderno, Régua, Mesa, Cadeira, Quadro, Livro, Mochila, Apagador, Caneta, Estojo, Compasso, Cartaz

### Alimentos (15 cards)
Maçã, Banana, Arroz, Feijão, Batata, Tomate, Cenoura, Brócolis, Alface, Laranja, Uva, Pão, Leite, Ovo, Queijo

### Animais (15 cards)
Cachorro, Gato, Pássaro, Peixe, Coelho, Vaca, Cavalo, Porco, Galinha, Pato, Tartaruga, Macaco, Leão, Tigre, Elefante

---

## REGRAS DE FORMATAÇÃO

1. **Uma carta por slide** — para facilitar impressão (1 slide = 1 página A4)
2. **Fontes grandes e claras** — título da palavra: mínimo 36pt
3. **Cores por parâmetro** — CM=azul, PA=verde, MO=roxo, OP=laranja, EFC=rosa
4. **Espaços para QR Codes** — usar caixas tracejadas com texto "QR Code aqui" (serão gerados depois)
5. **Braille em destaque** — fonte especial ou tamanho grande
6. **Rodapé** com "Librapp — deivi.tech/libras"
7. **Versão editável** — todos os campos devem ser editáveis no Google Slides/Docs
8. **Estilo acessível** — alto contraste, fundo claro, sem texturas complexas

---

## PROMPT PARA GERAÇÃO DE QR CODES (separado)

Para cada QR Code, use este formato de URL (substitua [PALAVRA]):
- **Vídeo do sinal:** `https://www.youtube.com/results?search_query=libras+[PALAVRA]+sinal`
- **Áudio-descrição:** `https://deivi.tech/libras/audio/[PALAVRA].mp3`
- **Vídeo da frase:** `https://www.youtube.com/results?search_query=libras+[FRASE]`

---

## ESTILO VISUAL SUGERIDO

- Fundo branco ou branco-queimado (#fff8f5)
- Borda decorativa com gradiente laranja→rosa
- Ícones de categoria no cabeçalho
- Grid de parâmetros com cores diferenciadas
- QR Codes em caixas com borda tracejada
- Braille em destaque com fundo suave
- Rodapé discreto com marca do projeto

---

## NOTA FINAL

O objetivo é criar um material que:
1. Professores possam **imprimir** e usar em sala de aula
2. Seja **editável** para personalizar com vídeos reais e QR Codes próprios
3. Seja **acessível** para todos os alunos (surdos, ouvintes, cegos)
4. Siga a estrutura pedagógica: Sinal → Contexto → Datilologia + Braille

Gere a apresentação completa com TODAS as 45 palavras.
