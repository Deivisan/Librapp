# Librapp — Imagens e QR Codes

Documentação das imagens e QR Codes usados no jogo.

## Imagens dos Objetos

Fotos reais baixadas do **Wikimedia Commons** (domínio público / CC).

| Palavra | Arquivo | Fonte (Commons) | Resolução |
|---------|---------|-----------------|-----------|
| Tesoura | `assets/images/tesoura.jpg` | [Pair of scissors with black handle](https://commons.wikimedia.org/wiki/File:Pair_of_scissors_with_black_handle,_2015-06-07.jpg) | 960×800 |
| Lápis | `assets/images/lapis.jpg` | [Colouring pencils](https://commons.wikimedia.org/wiki/File:Colouring_pencils.jpg) | 960×640 |
| Borracha | `assets/images/borracha.jpg` | [Pink Pearl eraser](https://commons.wikimedia.org/wiki/File:Pink_Pearl_eraser.jpg) | 960×720 |
| Caderno | `assets/images/caderno.jpg` | [Spiralbinderücken](https://commons.wikimedia.org/wiki/File:Spiralbinderücken_--_2022_--_9739_(bw).jpg) | 960×720 |
| Régua | `assets/images/regua.jpg` | [Standardgraph 2522](https://commons.wikimedia.org/wiki/File:Standardgraph_2522_2.5–7_mm_lettering_guides.jpg) | 960×660 |
| Maçã | `assets/images/maca.jpg` | [Red Apple](https://commons.wikimedia.org/wiki/File:Red_Apple.jpg) | 960×870 |
| Banana | `assets/images/banana.jpg` | [Cavendish banana](https://commons.wikimedia.org/wiki/File:Cavendish_banana_from_Maracaibo.jpg) | 960×670 |
| Cachorro | `assets/images/cachorro.jpg` | [Human–canine friendship](https://commons.wikimedia.org/wiki/File:Human–canine_friendship_-_girl_hugging_her_dog_tightly_at_golden_hour_in_Laos.jpg) | 960×1440 |
| Gato | `assets/images/gato.jpg` | [Felis catus on snow](https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg) | 960×640 |

Baixadas via `scripts/fetch_real_assets.py` (API do Commons + `Special:FilePath?width=800`).

## QR Codes — Vídeos em LIBRAS

Gerados com a biblioteca `qrcode` Python. Cada QR Code aponta para um vídeo
da palavra em LIBRAS:

- **Cachorro**: vídeo real do Commons → [Libras-cachorro.ogv](https://commons.wikimedia.org/wiki/File:Libras-cachorro.ogv)
- **Demais palavras**: busca no YouTube → `https://www.youtube.com/results?search_query=LIBRAS+{palavra}`

| Palavra | Arquivo QR | Destino |
|---------|------------|---------|
| Tesoura | `assets/qrcodes/tesoura.png` | YouTube: LIBRAS Tesoura |
| Lápis | `assets/qrcodes/lapis.png` | YouTube: LIBRAS Lápis |
| Borracha | `assets/qrcodes/borracha.png` | YouTube: LIBRAS Borracha |
| Caderno | `assets/qrcodes/caderno.png` | YouTube: LIBRAS Caderno |
| Régua | `assets/qrcodes/regua.png` | YouTube: LIBRAS Régua |
| Maçã | `assets/qrcodes/maca.png` | YouTube: LIBRAS Maçã |
| Banana | `assets/qrcodes/banana.png` | YouTube: LIBRAS Banana |
| Cachorro | `assets/qrcodes/cachorro.png` | Commons: Libras-cachorro.ogv |
| Gato | `assets/qrcodes/gato.png` | YouTube: LIBRAS Gato |

## Como regerar

```bash
# Instalar dependências
pip install "qrcode[pil]"

# Baixar imagens + gerar QR Codes
python3 scripts/fetch_real_assets.py
```

## Notas

- Imagens em JPG (alta resolução, 960px de largura)
- QR Codes em PNG (preto/roxo Librapp `#8b5cf6`)
- `cards.json` usa `?v=2` para bypassar cache do Cloudflare
- Sinais LIBRAS: vídeos via QR Code (Commons/YouTube) — não há foto de
  cada sinal específico no Commons além de "cachorro"
