#!/usr/bin/env python3
"""
Gera imagens reais (Wikimedia Commons) e QR Codes para vídeos LIBRAS.
- Objetos: fotos reais do Commons
- QR Codes: apontam para busca de vídeo LIBRAS no YouTube (qualquer palavra tem vídeo)
- 'cachorro' usa vídeo real do Commons (Libras-cachorro.ogv)
"""

import json
import os
import time
import urllib.parse
import urllib.request
from qrcode import QRCode

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(BASE, 'assets', 'images')
QR_DIR = os.path.join(BASE, 'assets', 'qrcodes')

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(QR_DIR, exist_ok=True)

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

# Mapeamento objeto -> termo de busca no Commons
OBJECTS = {
    'tesoura': 'scissors',
    'lapis': 'pencil',
    'borracha': 'eraser',
    'caderno': 'notebook',
    'regua': 'ruler',
    'maca': 'apple fruit',
    'banana': 'banana',
    'cachorro': 'dog',
    'gato': 'cat',
}

def commons_search(query, limit=8):
    """Busca arquivos de imagem no Commons."""
    q = urllib.parse.quote(f'{query} filetype:bitmap')
    url = (f'https://commons.wikimedia.org/w/api.php?action=query'
           f'&list=search&srsearch={q}&srnamespace=6&srlimit={limit}&format=json')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        d = json.load(r)
    # Filtrar apenas imagens (não PDF, não SVG, não OGV)
    titles = []
    for res in d.get('query', {}).get('search', []):
        t = res['title'].lower()
        if t.endswith(('.jpg', '.jpeg', '.png')) and 'pdf' not in t:
            titles.append(res['title'])
    return titles

def get_image_url(title):
    """Pega URL direta da imagem via Special:FilePath (alta resolução)."""
    fname = title.replace('File:', '').replace(' ', '_')
    url = f'https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(fname)}?width=800'
    return url

def download(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
    with open(dest, 'wb') as f:
        f.write(data)
    return len(data)

def make_qr(data, dest, color='#8b5cf6'):
    qr = QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=color, back_color='white')
    img.save(dest)

def main():
    with open(os.path.join(BASE, 'data', 'cards.json'), 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Baixar fotos reais dos objetos
    print('=== Baixando fotos reais dos objetos ===')
    for key, en in OBJECTS.items():
        dest = os.path.join(IMAGES_DIR, f'{key}.jpg')
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f'  ✓ {key}.jpg (já existe)')
            continue
        try:
            titles = commons_search(en, limit=8)
            if not titles:
                print(f'  ✗ {key}: nenhuma imagem encontrada')
                continue
            url = get_image_url(titles[0])
            size = download(url, dest)
            print(f'  📷 {key}.jpg ({size} bytes) <- {titles[0]}')
            time.sleep(3)  # Evitar rate limit
        except Exception as e:
            print(f'  ✗ {key}: {e}')
            time.sleep(5)

    # 2. Gerar QR Codes para vídeos LIBRAS
    print('\n=== Gerando QR Codes para vídeos LIBRAS ===')
    for cat in data['categories']:
        for card in cat['cards']:
            word = card['word']
            key = word.lower().replace('á', 'a').replace('é', 'e').replace('ã', 'a').replace('ç', 'c').replace('õ', 'o')
            qr_dest = os.path.join(QR_DIR, f'{key}.png')

            # URL do vídeo LIBRAS
            if key == 'cachorro':
                # Vídeo real do Commons
                video_url = 'https://commons.wikimedia.org/wiki/File:Libras-cachorro.ogv'
            else:
                # Busca no YouTube por vídeo LIBRAS
                video_url = f'https://www.youtube.com/results?search_query={urllib.parse.quote("LIBRAS " + word)}'

            make_qr(video_url, qr_dest)
            card['sign_video_qr'] = f'assets/qrcodes/{key}.png'
            print(f'  📱 {key}.png -> {video_url}')

    # 3. Atualizar image para JPG real
    for cat in data['categories']:
        for card in cat['cards']:
            word = card['word'].lower().replace('á', 'a').replace('é', 'e').replace('ã', 'a').replace('ç', 'c').replace('õ', 'o')
            jpg = os.path.join(IMAGES_DIR, f'{word}.jpg')
            if os.path.exists(jpg):
                card['image'] = f'assets/images/{word}.jpg'

    with open(os.path.join(BASE, 'data', 'cards.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print('\n✅ Imagens e QR Codes gerados!')

if __name__ == '__main__':
    main()
