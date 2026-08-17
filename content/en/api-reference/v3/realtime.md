---
title: 'Realtime'
description: 'The websocket behind the shared inbox: live conversations, typing and presence.'
icon: 'tower-broadcast'
---

The helpdesk pushes every change over a websocket, so you never have to poll. It is a standard [Socket.IO](https://socket.io) connection.

| | |
|---|---|
| **Namespace** | `/helpdesk` |
| **Path** | `/ws` |

## Connecting

Authenticate with your API token in the `apikey` query parameter. The workspace comes from the token, so there is nothing else to send:

```js
import { io } from 'socket.io-client';

const socket = io('https://api.pingonotify.com/helpdesk', {
  path: '/ws',
  query: { apikey: 'sk_live_...' },
});

socket.on('connect', () => console.log('connected'));
socket.on('connect_error', (err) => console.error(err.message)); // "unauthorized"
```

A bad or revoked token does not close the socket — it fails the namespace with a `connect_error` carrying the message `unauthorized`.

## What you receive

You are subscribed automatically to your own user room, workspace presence, and every inbox you belong to. Managers and above join every inbox in the workspace. Events scoped only to a conversation require the explicit subscription described below.

**The event name is the event type, and the payload is the event object itself** — the same events the [helpdesk webhooks](/en/api-reference/v3/webhooks) deliver:

```js
socket.on('helpdesk.message.created', (event) => {
  // event.conversationId, event.inboxId, event.message, ...
  appendToTimeline(event.message);
});

socket.on('helpdesk.conversation.assignee_changed', (event) => {
  // event.fromAssigneeUserId, event.toAssigneeUserId, ...
});
```

The websocket supports the events listed under [helpdesk webhooks](/en/api-reference/v3/webhooks#the-helpdesk-events), with one exception: **`helpdesk.sla.missed` is not broadcast over the websocket.** Delivery still follows each event's destination: inbox events reach the relevant inbox rooms, personal events reach their user room, and conversation-only updates require `subscribe:conversation`. CSAT and mention events also go only to their relevant rooms.

The websocket also has one personal event that is not sent to helpdesk webhooks: **`helpdesk.notification.created`**. It is emitted only to the recipient user's room after an in-app notification is created. Its payload contains `accountId`, `userId`, `notificationId`, `notificationType`, the primary and optional secondary actor types and ids, `createdAt`, and may include a hydrated `message`.

Messages arrive fully hydrated — the same shape the REST API returns — so you can render an incoming message without a follow-up request.

## Following one conversation

Opening a conversation means joining its room. Do that explicitly, and leave when you close it:

```js
socket.emit('subscribe:conversation', { conversationId }, (ack) => {
  // { ok: true }
});

// later
socket.emit('unsubscribe:conversation', { conversationId });
```

Subscribing to a conversation you cannot see fails with `conversation not found` — the same answer as one that does not exist.

## Typing and read receipts

These are relayed between agents, so your team can see each other working. They are not sent to the contact.

```js
socket.emit('typing:start', { conversationId });
socket.emit('typing:stop',  { conversationId });

socket.emit('read:up_to', { conversationId, messageId });
```

And on the receiving side:

```js
socket.on('typing:start', ({ conversationId, userId }) => { /* ... */ });
socket.on('typing:stop',  ({ conversationId, userId }) => { /* ... */ });
socket.on('read:up_to',   ({ conversationId, userId, messageId }) => { /* ... */ });
```

You never receive your own typing events back.

## Presence

Presence is a heartbeat. Send one every **20 seconds** while the agent is active:

```js
setInterval(() => socket.emit('presence:online'), 20_000);
```

Stop sending it and the agent decays to offline on their own — a page reload or a brief disconnect does not flicker them offline, which is exactly what you want.

The workspace snapshot arrives on connect and again whenever anyone's status changes:

```js
socket.on('presence.update', ({ users }) => {
  // { "0195f3a0-...": "online", "0195f3b1-...": "busy", ... }
});
```

An agent is `online`, `busy` or `offline`. They set it themselves with `PATCH /v3/helpdesk/profile/availability`.

::note
Presence controls round-robin when there are two or more eligible agents: only agents who are `online` participate, while `busy` and `offline` agents are skipped. With exactly one eligible inbox member, that agent is assigned even while offline. With no inbox members and no team restriction, assignment falls back to the workspace Owner; a team-restricted conversation has no Owner fallback.
::

## A worked example

Keeping a conversation list live, end to end:

```js
const socket = io('https://api.pingonotify.com/helpdesk', {
  path: '/ws',
  query: { apikey: process.env.PINGO_TOKEN },
});

// A new conversation arrived in one of my inboxes.
socket.on('helpdesk.conversation.created', (e) => list.prepend(e.conversationId));

// Its preview line changed.
socket.on('helpdesk.message.created', (e) => list.updatePreview(e.conversationId, e.message));

// Someone resolved it, or it moved owner.
socket.on('helpdesk.conversation.status_changed',   (e) => list.setStatus(e.conversationId, e.toStatus));
socket.on('helpdesk.conversation.assignee_changed', (e) => list.setOwner(e.conversationId, e.toAssigneeUserId));

// A message I sent got delivered or failed.
socket.on('helpdesk.message.status_changed', (e) => {
  timeline.setStatus(e.messageId, e.toStatus, e.externalError);
});
```

Note the last one. When you send a message the REST call returns immediately with `status: PENDING` — delivery happens asynchronously. `helpdesk.message.status_changed` is how you learn it became `SENT`, `DELIVERED`, `READ`, or `FAILED` (in which case `externalError` tells you why).
