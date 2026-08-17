---
title: 'Tempo real'
description: 'O websocket por trás da caixa compartilhada: conversas ao vivo, digitação e presença.'
icon: 'tower-broadcast'
---

O helpdesk empurra cada mudança por um websocket, então você nunca precisa fazer polling. É uma conexão [Socket.IO](https://socket.io) padrão.

| | |
|---|---|
| **Namespace** | `/helpdesk` |
| **Path** | `/ws` |

## Conectando

Autentique com o seu token de API no parâmetro de query `apikey`. O workspace vem do token, então não há mais nada a enviar:

```js
import { io } from 'socket.io-client';

const socket = io('https://api.pingonotify.com/helpdesk', {
  path: '/ws',
  query: { apikey: 'sk_live_...' },
});

socket.on('connect', () => console.log('conectado'));
socket.on('connect_error', (err) => console.error(err.message)); // "unauthorized"
```

Um token inválido ou revogado não fecha o socket — ele falha o namespace com um `connect_error` cuja mensagem é `unauthorized`.

## O que você recebe

Você entra automaticamente na sala do seu próprio usuário, na presença do workspace e em toda caixa de entrada da qual é membro. Managers e acima entram em todas as caixas do workspace. Eventos restritos a uma conversa exigem a inscrição explícita descrita abaixo.

**O nome do evento é o tipo do evento, e o payload é o próprio objeto do evento** — os mesmos eventos que os [webhooks do helpdesk](/pt-BR/api-reference/v3/webhooks) entregam:

```js
socket.on('helpdesk.message.created', (evento) => {
  // evento.conversationId, evento.inboxId, evento.message, ...
  adicionarNaLinhaDoTempo(evento.message);
});

socket.on('helpdesk.conversation.assignee_changed', (evento) => {
  // evento.fromAssigneeUserId, evento.toAssigneeUserId, ...
});
```

O websocket suporta os eventos listados nos [webhooks do helpdesk](/pt-BR/api-reference/v3/webhooks#os-eventos-do-helpdesk), com uma exceção: **`helpdesk.sla.missed` não é transmitido pelo websocket.** A entrega ainda segue o destino de cada evento: eventos de caixa chegam às salas correspondentes, eventos pessoais chegam à sala do usuário e atualizações restritas à conversa exigem `subscribe:conversation`. Eventos de CSAT e menção também chegam somente às salas relacionadas.

O websocket também tem um evento pessoal que não é enviado aos webhooks do helpdesk: **`helpdesk.notification.created`**. Ele é emitido apenas para a sala do usuário destinatário depois que uma notificação no app é criada. O payload contém `accountId`, `userId`, `notificationId`, `notificationType`, os tipos e ids dos atores primário e secundário opcional, `createdAt`, e pode incluir uma `message` completa.

As mensagens chegam completas — no mesmo formato que a API REST devolve — então você consegue renderizar uma mensagem recebida sem uma requisição adicional.

## Acompanhando uma conversa

Abrir uma conversa significa entrar na sala dela. Faça isso explicitamente, e saia ao fechar:

```js
socket.emit('subscribe:conversation', { conversationId }, (ack) => {
  // { ok: true }
});

// depois
socket.emit('unsubscribe:conversation', { conversationId });
```

Inscrever-se em uma conversa que você não pode ver falha com `conversation not found` — a mesma resposta de uma que não existe.

## Digitação e confirmação de leitura

Estes são retransmitidos entre agentes, para que a sua equipe se veja trabalhando. Eles não são enviados ao contato.

```js
socket.emit('typing:start', { conversationId });
socket.emit('typing:stop',  { conversationId });

socket.emit('read:up_to', { conversationId, messageId });
```

E do lado de quem recebe:

```js
socket.on('typing:start', ({ conversationId, userId }) => { /* ... */ });
socket.on('typing:stop',  ({ conversationId, userId }) => { /* ... */ });
socket.on('read:up_to',   ({ conversationId, userId, messageId }) => { /* ... */ });
```

Você nunca recebe de volta os seus próprios eventos de digitação.

## Presença

Presença é um heartbeat. Envie um a cada **20 segundos** enquanto o agente estiver ativo:

```js
setInterval(() => socket.emit('presence:online'), 20_000);
```

Pare de enviar e o agente decai para offline sozinho — um recarregamento de página ou uma queda breve não o fazem piscar para offline, que é exatamente o que você quer.

O retrato do workspace chega na conexão e de novo sempre que o status de alguém muda:

```js
socket.on('presence.update', ({ users }) => {
  // { "0195f3a0-...": "online", "0195f3b1-...": "busy", ... }
});
```

Um agente está `online`, `busy` ou `offline`. Ele mesmo define isso com `PATCH /v3/helpdesk/profile/availability`.

::note
A presença controla o rodízio quando há dois ou mais agentes elegíveis: apenas agentes `online` participam, enquanto agentes `busy` e `offline` são pulados. Com exatamente um membro elegível na caixa, ele é atribuído mesmo offline. Sem membros na caixa e sem restrição de equipe, a atribuição recai no Owner do workspace; uma conversa restrita a uma equipe não tem esse fallback.
::

## Um exemplo completo

Mantendo uma lista de conversas viva, de ponta a ponta:

```js
const socket = io('https://api.pingonotify.com/helpdesk', {
  path: '/ws',
  query: { apikey: process.env.PINGO_TOKEN },
});

// Chegou uma conversa nova em uma das minhas caixas.
socket.on('helpdesk.conversation.created', (e) => lista.inserirNoTopo(e.conversationId));

// A prévia dela mudou.
socket.on('helpdesk.message.created', (e) => lista.atualizarPrevia(e.conversationId, e.message));

// Alguém resolveu, ou ela mudou de dono.
socket.on('helpdesk.conversation.status_changed',   (e) => lista.definirStatus(e.conversationId, e.toStatus));
socket.on('helpdesk.conversation.assignee_changed', (e) => lista.definirDono(e.conversationId, e.toAssigneeUserId));

// Uma mensagem que enviei foi entregue ou falhou.
socket.on('helpdesk.message.status_changed', (e) => {
  linhaDoTempo.definirStatus(e.messageId, e.toStatus, e.externalError);
});
```

Repare no último. Quando você envia uma mensagem, a chamada REST retorna na hora com `status: PENDING` — a entrega acontece de forma assíncrona. `helpdesk.message.status_changed` é como você fica sabendo que ela virou `SENT`, `DELIVERED`, `READ` ou `FAILED` (e nesse caso `externalError` diz o porquê).
