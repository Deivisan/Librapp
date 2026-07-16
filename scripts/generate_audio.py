#!/usr/bin/env python3
"""
Gera arquivos de áudio (Edge TTS) para as audiodescrições dos sinais LIBRAS.
Lê data/cards.json e cria um .mp3 para cada card em assets/audio/
"""

import json
import asyncio
import edge_tts
import os
import sys

# Configuração
VOICE = "pt-BR-FranciscaNeural"  # Voz feminina PT-BR natural
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "cards.json")
AUDIO_DIR = os.path.join(BASE_DIR, "assets", "audio")

def slugify(text: str) -> str:
    """Gera um slug seguro para nome de arquivo."""
    import unicodedata
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower().strip()
    text = ''.join(c if c.isalnum() else '-' for c in text)
    return text

async def generate_audio(text: str, output_path: str):
    """Gera um arquivo de áudio com Edge TTS."""
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_path)

async def main():
    # Carregar dados
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    total = 0
    generated = 0
    skipped = 0

    for category in data.get('categories', []):
        for card in category.get('cards', []):
            total += 1
            word = card.get('word', '')
            description = card.get('sign_description', '')

            if not description:
                print(f"  ⚠️  Sem descrição: {word}")
                skipped += 1
                continue

            filename = slugify(word) + ".mp3"
            output_path = os.path.join(AUDIO_DIR, filename)

            # Pular se já existe
            if os.path.exists(output_path):
                print(f"  ✓ Já existe: {filename}")
                skipped += 1
                continue

            # Texto do áudio: APENAS a descrição do sinal (NÃO revelar a palavra!)
            # O áudio é a audiodescrição para quem vai fazer o sinal,
            # mas não deve dar a resposta (senão quebra o jogo de adivinhação)
            audio_text = description

            try:
                await generate_audio(audio_text, output_path)
                print(f"  🔊 Gerado: {filename}")
                generated += 1
            except Exception as e:
                print(f"  ❌ Erro em {word}: {e}")

    print(f"\n✅ Concluído! {generated} gerados, {skipped} pulados, {total} total")

if __name__ == "__main__":
    asyncio.run(main())
