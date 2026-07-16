# Librapp

Jogo educativo sobre **LIBRAS** (Língua Brasileira de Sinais), parte do ecossistema [deivi.tech](https://deivi.tech/).

> 🌐 **Site**: [deivi.tech/libras](https://deivi.tech/libras)

## O que é o Librapp?

Um jogo de cartas para aprender e praticar LIBRAS de forma divertida e acessível. Inspirado no jogo "Mímica", mas adaptado para a comunidade surda e pessoas que querem aprender sinais.

### Conceito

- **Dois grupos** jogam competindo para assinar/mimar palavras
- Cada carta traz uma palavra com **imagem**, **sinal em LIBRAS**, **datilologia** e **Braille**
- **3 fases** de revelação progressiva:
  1. **Fase 1 - Sinal**: Apenas a imagem → tente assinar
  2. **Fase 2 - Pistas**: Dicas faladas sem usar a palavra (mímica com atributos)
  3. **Fase 3 - Datilologia**: Palavra revelada letra por letra + Braille

### Estrutura de cada Carta

| Elemento | Descrição |
|----------|-----------|
| **Categoria** | Tema da carta (ex: Objetos de Sala de Aula) |
| **Palavra** | Termo em português |
| **Imagem** | Representação visual do objeto |
| **Sinal LIBRAS** | Descrição/audiodescrição do sinal |
| **QR Code (Vídeo)** | Link para vídeo de pessoa fazendo o sinal |
| **QR Code (Áudio)** | Link para audiodescrição |
| **Datilologia** | Letra por letra com imagem e descrição LIBRAS |
| **Braille** | Representação em Braille da palavra |

## Funcionalidades

- 🎮 **Jogo Interativo**: 3 fases de gameplay no navegador
- ✏️ **Editor de Cartas**: Crie novos temas e palavras
- 🖨️ **Impressão**: Cards prontos para imprimir
- ♿ **Acessibilidade**: Audiodescrição, Braille, LIBRAS como língua central

## Estrutura do Projeto

```
Librapp/
├── index.html              # Landing page principal
├── game/
│   ├── index.html          # Interface do jogo
│   ├── game.js             # Lógica do jogo
│   └── game.css            # Estilos do jogo
├── cards/
│   ├── editor.html         # Editor de cartas
│   ├── editor.js           # Lógica do editor
│   └── editor.css          # Estilos do editor
├── data/
│   └── cards.json          # Database de cartas
└── assets/
    ├── style.css           # Design system global
    ├── images/             # Imagens dos objetos
    ├── signs/              # Imagens dos sinais LIBRAS
    └── braille/            # Recursos Braille
```

## Como Usar

### Jogar
1. Acesse [deivi.tech/libras/game](https://deivi.tech/libras/game/)
2. Escolha uma categoria
3. Tente assinar os sinais nas 3 fases

### Criar Cartas
1. Acesse [deivi.tech/libras/editor](https://deivi.tech/libras/editor/)
2. Crie uma nova categoria ou edite existente
3. Adicione palavras com imagens e descrições
4. Exporte o JSON ou imprima

### Gerar Áudios (Audiodescrição)

Os áudios das audiodescrições são gerados com **Edge TTS** (voz PT-BR natural, sem necessidade de API key):

```bash
pip install edge-tts
python3 scripts/generate_audio.py
```

Isso lê `data/cards.json` e cria um `.mp3` para cada card em `assets/audio/`.
Cada card no JSON tem um campo `audio_file` apontando para o arquivo.

No jogo, clique no botão **🔊 Ouvir** para reproduzir a audiodescrição (Fase 1 e Fase 3).

## Acessibilidade

- **Audiodescrição em áudio**: Botão de play em cada card (voz PT-BR natural)
- **Audiodescrição em texto**: Descrição do sinal visível nas fases 1 e 3
- **Braille**: Cada palavra em Braille nos cards
- **LIBRAS como língua central**: Toda a interface pensada para surdos
- **Contraste**: Cores com alto contraste para baixa visão
- **Teclado**: Navegação completa por teclado

## Temas (Categorias)

- 📚 **Objetos de Sala de Aula**: Tesoura, Lápis, Borracha, Caderno, Régua
- 🍎 **Alimentos**: Maçã, Banana (+ mais)
- 🐾 **Animais**: Cachorro, Gato (+ mais)

## Stack

- HTML/CSS/JS puro (sem framework)
- Design system customizado
- Print-friendly CSS
- JSON para dados
- Docker + Caddy para deploy

## Deploy

O `deivi.tech` usa Docker + Caddy. O sub-site `/libras` é um container que serve este repositório:

```dockerfile
# docker-compose.yml
services:
  librapp:
    image: nginx:alpine
    volumes:
      - ./:/usr/share/nginx/html:ro
    ports:
      - "8080:80"
```

```caddy
# Caddyfile
redir /libras /libras/
handle_path /libras/* {
    reverse_proxy librapp:80
}
```

## Próximos Passos

- [ ] Adicionar imagens reais para os sinais LIBRAS
- [ ] Integrar vídeos de sinais (QR Codes funcionais)
- [ ] Adicionar mais categorias de cartas
- [ ] Modo multiplayer local
- [ ] App mobile (React Native / Expo)
- [ ] Reconhecimento de sinais por câmera (ML)
- [ ] Sistema de pontuação e ranking

## Acessibilidade

- **LIBRAS como língua central**: Toda a interface pensada para surdos
- **Audiodescrição**: Descrições detalhadas dos sinais para cegos
- **Braille**: Cada palavra em Braille nos cards
- **Contraste**: Cores com alto contraste para baixa visão
- **Teclado**: Navegação completa por teclado

---

Parte do ecossistema pessoal de IA da DeiviTech.
