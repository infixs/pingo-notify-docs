---
title: 'Autenticação'
description: 'Como uma requisição v3 prova quem é, e em qual workspace ela atua.'
icon: 'key'
---

Toda requisição v3 carrega duas coisas: **quem você é** (um token de API) e **em qual workspace você está atuando** (um header, ou o workspace padrão do seu token).

## Seu token de API

Envie o token no header **`apikey`**, na íntegra, incluindo o prefixo `sk_live_`.

```bash
curl https://api.pingonotify.com/v3/connections \
  -H "apikey: sk_live_a1b2c3d4e5f6..."
```

::warning
Nos endpoints protegidos por token de API, use o header **`apikey`** — não `Authorization: Bearer`. Um header bearer é ignorado nesses endpoints, e a requisição falha com `401`.
::

### Criando um token

Crie tokens pelo painel, ou pela própria API:

```bash
curl -X POST https://api.pingonotify.com/v3/api-tokens \
  -H "apikey: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "Servidor de produção" }'
```

```json
{
  "id": "0195f3a0-...",
  "name": "Servidor de produção",
  "token": "sk_live_xF3k9...",
  "prefix": "sk_live",
  "tokenLast4": "9f2a"
}
```

::warning
**O campo `token` aparece exatamente uma vez — nesta resposta.** O Pingo guarda apenas um hash dele, então ele nunca mais pode ser exibido. Salve agora.
::

Se você perder um token, rotacione-o (`PATCH /v3/api-tokens/{id}` com `refreshToken: true`) — o segredo antigo para de funcionar no instante em que o novo é emitido. Excluir um token (`DELETE /v3/api-tokens/{id}`) o revoga imediatamente.

Apenas um **Owner** ou **Admin** pode criar, rotacionar ou excluir tokens.

### O que um token pode fazer

Um token não tem escopos próprios. Ele herda as permissões do usuário que o criou, no workspace ao qual pertence. Um token criado por um Owner pode fazer tudo que um Owner pode — inclusive mexer na cobrança e excluir o workspace.

Trate um token como a credencial de uma pessoa, não de uma integração. Crie-o sob uma conta cujo papel corresponda ao que a integração realmente precisa.

## Escolhendo o workspace

Seu token pertence a um workspace, e é contra ele que a requisição roda quando você não diz nada.

Para atuar em um workspace **diferente** do qual você participa, envie o id dele no header `X-Account-Id`:

```bash
curl https://api.pingonotify.com/v3/helpdesk/conversations \
  -H "apikey: sk_live_..." \
  -H "X-Account-Id: 0195f3a0-1234-7890-abcd-ef0123456789"
```

Liste os workspaces disponíveis para você com `GET /v3/accounts`. Apontar o `X-Account-Id` para um workspace do qual você não é membro retorna **403**.

## Papéis e permissões

Todo membro de um workspace tem um ou mais papéis, e o papel decide o que a API permite. Uma ação negada retorna **403 `Insufficient account permissions`**.

| | Owner | Admin | Manager | Agent |
|---|:---:|:---:|:---:|:---:|
| Ler o workspace | ✅ | ✅ | ✅ | ✅ |
| Atualizar o workspace | ✅ | — | — | — |
| Excluir ou transferir o workspace | ✅ | — | — | — |
| Membros | ✅ | ✅ | ✅ | leitura |
| Conexões, integrações, webhooks | ✅ | ✅ | ✅ | — |
| Enviar mensagens e campanhas | ✅ | ✅ | ✅ | — |
| Ler mensagens em uma conexão | ✅ | ✅ | — | — |
| Tokens de API e apps OAuth | ✅ | ✅ | — | — |
| Cobrança | ✅ | — | — | — |
| Helpdesk — configurar | ✅ | ✅ | ✅ | — |
| Helpdesk — responder, atribuir, etiquetar | ✅ | ✅ | ✅ | ✅ |
| Helpdesk — relatórios | ✅ | ✅ | ✅ | — |
| Helpdesk — configuração de IA | ✅ | ✅ | leitura | leitura |

Duas regras valem conhecer antes de desenhar uma integração em cima de um papel:

- **Você nunca pode conceder um papel igual ou acima do seu.** Um Manager pode convidar um Agent, mas não outro Manager.
- **Um Agent só enxerga as caixas de entrada das quais é membro.** Uma conversa em uma caixa da qual ele não participa não é proibida para ele — ela simplesmente não existe do ponto de vista da API, e retorna **404**. Isso é proposital: um 403 confirmaria que a conversa existe.

## Exigências de plano

Alguns endpoints precisam de mais do que um papel.

**O helpdesk é um recurso PRO para escrita.** Qualquer membro de qualquer plano pode *ler* o helpdesk, mas criar, responder, atribuir ou configurar exige o plano PRO. Sem ele, esses endpoints retornam:

```json
{
  "message": "HELPDESK_PLAN_REQUIRED",
  "hint": "O helpdesk está disponível no plano PRO."
}
```

**Conexões oficiais do WhatsApp e campanhas oficiais exigem um plano pago**, e tanto conexões quanto mensagens são medidas contra os limites do seu plano. Quando um limite é atingido você recebe um **403** com um código como `USER_PLAN_EXCEEDED_CONNECTIONS` ou `USER_PLAN_EXCEEDED_MESSAGES`. Consulte sua folga a qualquer momento com `GET /v3/summary`.

## Endpoints sem `apikey`

Um punhado de rotas não leva `apikey`. Cada uma documenta a sua própria credencial:

| Endpoint | Quem chama | Como é autenticado |
|---|---|---|
| `POST /v3/connections/sync-session/complete` | O fluxo de sincronização da conexão | Um token de sincronização assinado em `Authorization: Bearer` |
| `POST /v3/connections/sync-session/reconnect-complete` | O fluxo de sincronização da reconexão | Um token de sincronização assinado em `Authorization: Bearer` |
| `GET /v3/connections/media/{mediaId}/download` | O consumidor do seu webhook | Um `token` assinado, válido por 7 dias |
| `GET /v3/helpdesk/messages/attachments/{id}/public/download` | O consumidor do seu webhook, o WhatsApp | Um `token` assinado |
| `GET`/`POST /v3/webhooks/whatsapp/{connectionId}` | A Meta | `GET`: verify token. `POST`: `x-hub-signature-256` quando há app secret configurado; sem ele, HMAC não é exigido e `metadata.phone_number_id` só é conferido quando presente |
| `POST /webhooks/helpdesk/{inboxId}` | Seu próprio app | `x-helpdesk-token` ou `x-helpdesk-signature`; opcionais somente quando a caixa tem `hmacMandatory: false` |
| `GET`/`POST /public/helpdesk/csat/{conversationId}` | Seu cliente | O próprio id da conversa |

::note
O link da pesquisa de CSAT não tem token nem validade — o id da conversa na URL é a única coisa que o protege. Quem tiver esse link pode ver e responder a pesquisa uma vez.
::
