# Librapp

Jogo educativo sobre **LIBRAS** (Língua Brasileira de Sinais), parte do ecossistema [deivi.tech](https://deivi.tech/).

> Site no ar: **https://deivi.tech/libras**

## Estado atual

Este repositório é um **placeholder**. A estrutura visual e o conteúdo base já existem
(`index.html`), mas o jogo em si será construído em iteracoes com os agentes de IA
(DevSan AGI, OpenCode, KiloCode, etc.) — ainda nao definimos a stack final.

## O que este app devera ter (a integrar em deivi.tech/libras)

- **Jogo de LIBRAS**: desafios onde o jogador associa sinais a significados (imagem,
  vídeo ou descricao) e recebe feedback.
- **Modo prática**: treino livre de sinais com repetição e pontuacao.
- **Progresso do jogador**: nível, sequência de acertos, historico.
- **Ranking**: comparacao entre jogadores (pode ser local ou via API do hub).
- **Acessibilidade em foco**: UI pensada para inclusão, com LIBRAS como lingua central.
- **Vinculo com o hub deivi.tech**: servido em `/libras`, reaproveitando a identidade
  visual (paleta, logo) e os canais de contato do Deivi.

## Como roda (vinculado ao hub)

O `deivi.tech` usa Docker + Caddy. O sub-site `/libras` é um container que serve este
repositório (bind mount), declarado em `docker-compose.yml` e roteado no `Caddyfile`:

```
redir /libras /libras/
handle_path /libras/* {
    reverse_proxy librapp:80
}
```

## Próximos passos (a definir com os agentes)

- [ ] Definir stack (HTML/JS puro? framework? reconhecimento de sinais?)
- [ ] Modelo de dados dos sinais (base de sinais + mídia)
- [ ] Mecânica de jogo (níveis, pontos, vidas)
- [ ] Interface acessível e responsiva
- [ ] Integração de progresso/ranking com a API do hub

---

Parte do ecossistema pessoal de IA da DeiviTech.
