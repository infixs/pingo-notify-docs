---
title: "Introdução"
description: "A API v2: conexões, conversas, mensagens e templates."
icon: "sparkles"
---

A API v2 é a API original do Pingo Notify: uma chave de API, os seus próprios números de WhatsApp e os endpoints para enviar e ler mensagens neles. Ela tem menos peças que a v3 e continua totalmente suportada.

**URL base**

```
https://api.pingonotify.com
```

Toda requisição leva a sua chave em um header — não há nada além disso para assinar ou trocar:

```
apikey: SUA_API_KEY_AQUI
```

## O que ela cobre

- **Conexões.** Crie um número, pareie por QR Code, atualize, desconecte, exclua.
- **Conversas.** Liste as conversas de uma conexão e envie sinal de presença ("digitando...") em uma delas.
- **Mensagens.** Texto e mídia (imagem, vídeo, áudio, documento) em uma única chamada, além de figurinhas, mensagens de lista e de botões, mensagens de template, histórico de mensagens e download de mídia.
- **Templates.** Liste e crie os templates de uma conexão.
- **Verificações.** Confira se um número está no WhatsApp, por uma conexão ou de forma avulsa.

Uma coisa para saber antes de ler os endpoints: na v2 o destinatário faz parte da URL. Você envia para `/v2/connections/{id}/chats/{remoteJid}/messages`, em que `{id}` é a conexão e `{remoteJid}`, o número para quem você está escrevendo.

## Sua primeira requisição

Liste as conexões que a sua chave alcança:

```bash
curl https://api.pingonotify.com/v2/connections \
  -H "apikey: SUA_API_KEY_AQUI"
```

## v2 ou v3?

Fique na v2 se você já roda nela, ou se tudo o que você precisa é enviar e ler mensagens dos seus próprios números.

Vá para a [v3](/pt-BR/api-reference/v3) quando precisar do que a v2 não tem: um **workspace** compartilhado por várias pessoas, **campanhas** que enviam uma mensagem para muitos destinatários e o **helpdesk** — uma caixa de entrada compartilhada com conversas, atribuição, bots, SLAs e relatórios.

::note
A v2 não está descontinuada e continua funcionando. A mesma chave de API autentica as duas versões, então você pode migrar um endpoint por vez.
::

## Por onde seguir

:::card-group{cols=3}
  ::card{title="Autenticação" icon="key" to="/pt-BR/api-reference/v2/authentication"}
  Crie sua chave de API e envie-a em todas as requisições.
  ::

  ::card{title="Webhooks" icon="webhook" to="/pt-BR/api-reference/v2/webhooks"}
  Receba mensagens e eventos no seu próprio endpoint.
  ::

  ::card{title="Referência da API" icon="code" to="/pt-BR/reference/v2"}
  Todos os endpoints da v2, com parâmetros e exemplos.
  ::
:::
