#!/usr/bin/env python3
"""
Gerador de imagens SVG para o Librapp.
Gera:
  1. Objetos (assets/images/{palavra}.svg) - icones vetoriais
  2. Sinais LIBRAS (assets/signs/{palavra}-sinal.svg) - mao sinalizando
  3. Letras (assets/signs/letra-{x}.svg) - ja referenciadas no datilologia
"""

import json
import os
import unicodedata

def normalize(word):
    """Remove acentos e baixa caixa."""
    nfkd = unicodedata.normalize('NFKD', word)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE, 'assets', 'images')
SIGNS_DIR = os.path.join(BASE, 'assets', 'signs')

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(SIGNS_DIR, exist_ok=True)

# Cores do tema Librapp
ROXO = '#8b5cf6'
ROXO_CLARO = '#a78bfa'
VERDE = '#06d6a0'
AZUL = '#3b82f6'
LARANJA = '#f59e0b'
ROSA = '#ec4899'
CINZA = '#64748b'
BRANCO = '#ffffff'

SVG_HEADER = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
'''

def svg_close():
    return '</svg>\n'

# ---------------------------------------------------------------------------
# 1. OBJETOS - icones vetoriais estilizados
# ---------------------------------------------------------------------------

def obj_tesoura():
    return SVG_HEADER.format(c1=ROXO, c2=ROXO_CLARO) + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <!-- Lâminas -->
  <g stroke="#334155" stroke-width="6" fill="none" stroke-linecap="round">
    <line x1="60" y1="60" x2="120" y2="120"/>
    <line x1="60" y1="140" x2="120" y2="80"/>
  </g>
  <!-- Pivô -->
  <circle cx="90" cy="100" r="5" fill="#334155"/>
  <!-- Cabos -->
  <g fill="{c1}">
    <circle cx="55" cy="55" r="14"/>
    <circle cx="55" cy="145" r="14"/>
    <circle cx="145" cy="55" r="14"/>
    <circle cx="145" cy="145" r="14"/>
  </g>
'''.format(c1=ROXO) + svg_close()

def obj_lapis():
    return SVG_HEADER.format(c1=ROXO, c2=ROXO_CLARO) + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <!-- Corpo -->
  <rect x="85" y="40" width="30" height="110" rx="4" fill="{c1}"/>
  <!-- Ponta -->
  <polygon points="85,150 115,150 100,175" fill="#fbbf24"/>
  <!-- Borracha -->
  <rect x="85" y="30" width="30" height="15" rx="3" fill="#f472b6"/>
  <!-- Listras -->
  <rect x="85" y="70" width="30" height="8" fill="#fff" opacity="0.5"/>
  <rect x="85" y="95" width="30" height="8" fill="#fff" opacity="0.5"/>
'''.format(c1=ROXO) + svg_close()

def obj_borracha():
    return SVG_HEADER.format(c1=ROSA, c2='#f9a8d4') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <rect x="55" y="70" width="90" height="60" rx="10" fill="{c1}"/>
  <rect x="55" y="70" width="90" height="20" rx="10" fill="#fff" opacity="0.4"/>
  <text x="100" y="110" font-size="16" fill="#fff" text-anchor="middle" font-family="sans-serif">APAGAR</text>
'''.format(c1=ROSA) + svg_close()

def obj_caderno():
    return SVG_HEADER.format(c1=AZUL, c2='#60a5fa') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <rect x="55" y="50" width="90" height="100" rx="8" fill="{c1}"/>
  <rect x="65" y="60" width="70" height="80" rx="4" fill="#fff"/>
  <line x1="65" y1="80" x2="135" y2="80" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="65" y1="100" x2="135" y2="100" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="65" y1="120" x2="135" y2="120" stroke="#cbd5e1" stroke-width="3"/>
'''.format(c1=AZUL) + svg_close()

def obj_regua():
    return SVG_HEADER.format(c1=LARANJA, c2='#fbbf24') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <rect x="45" y="85" width="110" height="30" rx="4" fill="{c1}"/>
  <g stroke="#fff" stroke-width="2">
    <line x1="55" y1="95" x2="55" y2="105"/>
    <line x1="70" y1="95" x2="70" y2="108"/>
    <line x1="85" y1="95" x2="85" y2="105"/>
    <line x1="100" y1="95" x2="100" y2="108"/>
    <line x1="115" y1="95" x2="115" y2="105"/>
    <line x1="130" y1="95" x2="130" y2="108"/>
    <line x1="145" y1="95" x2="145" y2="105"/>
  </g>
'''.format(c1=LARANJA) + svg_close()

def obj_maca():
    return SVG_HEADER.format(c1=ROSA, c2='#f9a8d4') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <circle cx="100" cy="110" r="55" fill="{c1}"/>
  <!-- Talo -->
  <rect x="96" y="45" width="8" height="20" rx="3" fill="#16a34a"/>
  <path d="M104 50 Q125 45 120 65 Q110 60 104 55" fill="#22c55e"/>
'''.format(c1=ROSA) + svg_close()

def obj_banana():
    return SVG_HEADER.format(c1=LARANJA, c2='#fbbf24') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <path d="M50 70 Q60 150 140 140 Q120 130 110 120 Q70 125 60 80 Z" fill="{c1}"/>
  <path d="M50 70 Q55 90 65 100" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>
'''.format(c1=LARANJA) + svg_close()

def obj_cachorro():
    return SVG_HEADER.format(c1=ROXO, c2=ROXO_CLARO) + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <!-- Cabeca -->
  <circle cx="100" cy="105" r="50" fill="{c1}"/>
  <!-- Orelhas -->
  <ellipse cx="65" cy="70" rx="18" ry="30" fill="{c1}" transform="rotate(-20 65 70)"/>
  <ellipse cx="135" cy="70" rx="18" ry="30" fill="{c1}" transform="rotate(20 135 70)"/>
  <!-- Olhos -->
  <circle cx="82" cy="95" r="8" fill="#fff"/>
  <circle cx="118" cy="95" r="8" fill="#fff"/>
  <circle cx="82" cy="95" r="4" fill="#1e293b"/>
  <circle cx="118" cy="95" r="4" fill="#1e293b"/>
  <!-- Focinho -->
  <ellipse cx="100" cy="120" rx="20" ry="15" fill="#1e293b"/>
  <circle cx="100" cy="115" r="5" fill="#f472b6"/>
'''.format(c1=ROXO) + svg_close()

def obj_gato():
    return SVG_HEADER.format(c1=CINZA, c2='#94a3b8') + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <!-- Cabeca -->
  <circle cx="100" cy="110" r="48" fill="{c1}"/>
  <!-- Orelhas triangulares -->
  <polygon points="60,75 75,45 90,75" fill="{c1}"/>
  <polygon points="140,75 125,45 110,75" fill="{c1}"/>
  <!-- Olhos -->
  <ellipse cx="82" cy="105" rx="9" ry="12" fill="#22c55e"/>
  <ellipse cx="118" cy="105" rx="9" ry="12" fill="#22c55e"/>
  <circle cx="82" cy="105" r="3" fill="#1e293b"/>
  <circle cx="118" cy="105" r="3" fill="#1e293b"/>
  <!-- Bigodes -->
  <g stroke="#1e293b" stroke-width="2">
    <line x1="100" y1="125" x2="70" y2="120"/>
    <line x1="100" y1="125" x2="70" y2="130"/>
    <line x1="100" y1="125" x2="130" y2="120"/>
    <line x1="100" y1="125" x2="130" y2="130"/>
  </g>
'''.format(c1=CINZA) + svg_close()

OBJECTS = {
    'tesoura': obj_tesoura,
    'lapis': obj_lapis,
    'borracha': obj_borracha,
    'caderno': obj_caderno,
    'regua': obj_regua,
    'maca': obj_maca,
    'banana': obj_banana,
    'cachorro': obj_cachorro,
    'gato': obj_gato,
}

# ---------------------------------------------------------------------------
# 2. SINAIS LIBRAS - mao sinalizando
# ---------------------------------------------------------------------------

def hand_base(color):
    """Mao base estilizada."""
    return '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <!-- Palma -->
  <ellipse cx="100" cy="115" rx="45" ry="55" fill="{skin}"/>
  <!-- Dedos (5) -->
  <g fill="{skin}">
    <rect x="60" y="50" width="14" height="45" rx="7"/>
    <rect x="80" y="40" width="14" height="55" rx="7"/>
    <rect x="100" y="38" width="14" height="57" rx="7"/>
    <rect x="120" y="42" width="14" height="53" rx="7"/>
  </g>
  <!-- Polegar -->
  <ellipse cx="55" cy="95" rx="12" ry="22" fill="{skin}" transform="rotate(-30 55 95)"/>
'''.format(skin=color)

def sign_generic(word, color, label):
    """Sinal generico com mao + label da letra/frase."""
    return SVG_HEADER.format(c1=color, c2=ROXO_CLARO) + hand_base(color) + '''
  <circle cx="100" cy="170" r="22" fill="#1e293b" opacity="0.8"/>
  <text x="100" y="177" font-size="16" fill="#fff" text-anchor="middle" font-family="sans-serif">{label}</text>
'''.format(label=label) + svg_close()

SIGNS = {
    'tesoura': ('#f59e0b', '✌'),
    'lapis': ('#8b5cf6', '✏'),
    'borracha': ('#ec4899', '▱'),
    'caderno': ('#3b82f6', '▤'),
    'regua': ('#f59e0b', '▬'),
    'maca': ('#ec4899', '●'),
    'banana': ('#f59e0b', '☺'),
    'cachorro': ('#8b5cf6', '🐾'),
    'gato': ('#64748b', '🐱'),
}

# ---------------------------------------------------------------------------
# 3. LETRAS - para datilologia
# ---------------------------------------------------------------------------

def letter_svg(letter, color=ROXO):
    return SVG_HEADER.format(c1=color, c2=ROXO_CLARO) + '''
  <circle cx="100" cy="100" r="90" fill="url(#grad)" opacity="0.15"/>
  <text x="100" y="140" font-size="110" fill="{c1}" text-anchor="middle" font-family="sans-serif" font-weight="bold">{letter}</text>
'''.format(c1=color, letter=letter) + svg_close()

# ---------------------------------------------------------------------------

def main():
    # Carregar cards.json para pegar palavras
    with open(os.path.join(BASE, 'data', 'cards.json'), 'r', encoding='utf-8') as f:
        data = json.load(f)

    generated = 0

    # 1. Objetos
    for cat in data['categories']:
        for card in cat['cards']:
            word = normalize(card['word'])
            if word in OBJECTS:
                path = os.path.join(IMAGES_DIR, f'{word}.svg')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(OBJECTS[word]())
                generated += 1
                print(f'  🖼️  Objeto: {word}.svg')

    # 2. Sinais LIBRAS
    for cat in data['categories']:
        for card in cat['cards']:
            word = normalize(card['word'])
            if word in SIGNS:
                color, label = SIGNS[word]
                path = os.path.join(SIGNS_DIR, f'{word}-sinal.svg')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(sign_generic(word, color, label))
                generated += 1
                print(f'  ✋ Sinal: {word}-sinal.svg')

    # 3. Letras (do datilologia)
    letters_seen = set()
    for cat in data['categories']:
        for card in cat['cards']:
            for letter_data in card.get('fingerspelling', []):
                letter = letter_data['letter'].lower()
                if letter not in letters_seen:
                    letters_seen.add(letter)
                    path = os.path.join(SIGNS_DIR, f'letra-{letter}.svg')
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(letter_svg(letter))
                    generated += 1
                    print(f'  🔤 Letra: letra-{letter}.svg')

    print(f'\n✅ {generated} imagens SVG geradas')

if __name__ == '__main__':
    main()
