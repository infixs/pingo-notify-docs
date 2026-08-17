---
title: 'Webhooks'
description: 'Receive WhatsApp and helpdesk events on your own server, and prove they came from us.'
icon: 'webhook'
---

Pingo has two independent webhook systems. They solve different problems, and you can use either or both.

- **Connection webhooks** deliver WhatsApp events — a message arrived, went out, was edited, deleted or changed delivery status, or a contact changed presence. This is what you want to drive your own logic on top of WhatsApp.
- **Helpdesk webhooks** deliver events from the shared inbox — a conversation was assigned, a label was added, an SLA was missed. This is what you want to sync the helpdesk into another system.

## Connection webhooks

Register a URL and pick the events you care about:

```bash
curl -X POST https://api.pingonotify.com/v3/webhooks \
  -H "apikey: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/hooks/pingo",
    "events": ["messages.upsert", "messages.update"],
    "connections": ["0195f3a0-1234-7890-abcd-ef0123456789"],
    "hmacEnabled": true
  }'
```

List every connection whose events this webhook should receive. If `connections` is omitted, the webhook is created without connection bindings and receives no events until connections are added with `PATCH /v3/webhooks/{id}`.

### The events

These are the seven values `events` accepts:

| Event | Fires when |
|---|---|
| `messages.upsert` | A message **arrived** from a contact. |
| `send.message` | On an **unofficial** connection, a message **went out** — through the API, or typed on the phone. |
| `messages.update` | A delivery status changed — sent, delivered, read. |
| `messages.edited` | A message was edited. |
| `messages.delete` | A message was deleted for everyone. |
| `presence.update` | A contact came online or started typing. |
| `connection.update` | The connection changed state. |

::warning
**`connection.update` is accepted as a subscription, but delivers nothing today.** The HTTP dispatch for that event is switched off on the server — it updates the connection state internally and feeds the live dashboard, but no `POST` ever reaches your URL. Do not build anything that depends on it; to learn that a connection dropped, poll `GET /v3/connections`.
::

### The envelope

Every event arrives in the same envelope. What changes is `data`:

```json
{
  "event": "messages.upsert",
  "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
  "remoteJid": "5511999998888@s.whatsapp.net",
  "sender": "5511888887777@s.whatsapp.net",
  "data": { }
}
```

| Field | What it is |
|---|---|
| `event` | The event name — the same one you subscribed to. |
| `connectionId` | The Pingo connection the event came from. |
| `remoteJid` | The **other side** of the conversation: the contact, or the group. |
| `sender` | **Your own** connection's number, as the provider reports it. |
| `data` | The event body. |

::note
On `messages.upsert` and `send.message` the `data` is assembled by us and has a closed shape — exactly the keys below, nothing more. On every other event `data` is passed through **as the provider sent it**, so extra fields may show up over time; treat the documented ones as the contract and ignore the rest.
::

### Payloads by event

::::tabs
  :::tab{title="messages.upsert"}
  An **incoming** message. This is the event you will use most.

  `data` always carries these eight keys, and `messageType` tells you which node to expect inside `message`:

  ```json
  {
    "key": {
      "remoteJid": "5511999998888@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D097E9ECB4A5"
    },
    "pushName": "Ana",
    "status": "DELIVERY_ACK",
    "messageType": "conversation",
    "message": { "conversation": "Hi! Has my order shipped?" },
    "contextInfo": null,
    "source": "android",
    "isAiMessage": false
  }
  ```

  | Field | What it is |
  |---|---|
  | `key.id` | The **wamid** — WhatsApp's own message id. Deduplicate on this. |
  | `key.fromMe` | `false` on an incoming message. |
  | `pushName` | The display name the contact chose. |
  | `status` | The provider ACK. Here it is always `DELIVERY_ACK`. |
  | `messageType` | Which node arrives inside `message`. |
  | `contextInfo` | Populated on a reply or when there are mentions; `null` in the ordinary case. |
  | `source` | Where the contact sent from: `android`, `ios`, `web`, `unknown`. |
  | `isAiMessage` | `true` when WhatsApp Business's native AI answered on its own — in that case `aiMessageSource: "WHATSAPP_BUSINESS"` rides along. |

  The `message` payloads, per type, are right below in [Message types](#message-types).
  :::

  :::tab{title="send.message"}
  A message **sent from an unofficial connection** — via the API, or typed on the phone. Official connections do not produce this event. `data` has exactly the same shape as `messages.upsert`, with two differences that matter:

  - `key.fromMe` is **`true`**.
  - `status` is the send ACK (`PENDING`, `SERVER_ACK`…), not `DELIVERY_ACK`.

  ```json
  {
    "event": "send.message",
    "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
    "remoteJid": "5511999998888@s.whatsapp.net",
    "sender": "5511888887777@s.whatsapp.net",
    "data": {
      "key": {
        "remoteJid": "5511999998888@s.whatsapp.net",
        "fromMe": true,
        "id": "3EB0F1A2B3C4D5E6F708"
      },
      "pushName": "Example Store",
      "status": "PENDING",
      "messageType": "conversation",
      "message": { "conversation": "It went out for delivery this morning!" },
      "contextInfo": null,
      "source": "unknown",
      "isAiMessage": false
    }
  }
  ```

  ::note
  Subscribe to `send.message` if you need to record what your own team sent. If you only want to react to customers, subscribe to `messages.upsert` alone — subscribing to both and forgetting to check `fromMe` is the classic way to build an infinite reply loop.
  ::
  :::

  :::tab{title="messages.update"}
  A message's delivery status changed. This is how you learn that your message landed, or was read.

  ```json
  {
    "event": "messages.update",
    "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
    "remoteJid": "5511999998888@s.whatsapp.net",
    "sender": "5511888887777@s.whatsapp.net",
    "data": {
      "keyId": "3EB0F1A2B3C4D5E6F708",
      "remoteJid": "5511999998888@s.whatsapp.net",
      "fromMe": true,
      "status": "READ"
    }
  }
  ```

  `keyId` is the **wamid** of the affected message — the key that ties this event back to the message you already hold. Statuses climb the ladder `PENDING` → `SENT` → `DELIVERED` → `READ`, arriving as separate events as the contact receives and opens the chat.
  :::

  :::tab{title="messages.edited"}
  The contact edited a message they had already sent.

  ```json
  {
    "event": "messages.edited",
    "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
    "remoteJid": "5511999998888@s.whatsapp.net",
    "sender": "5511888887777@s.whatsapp.net",
    "data": {
      "key": {
        "remoteJid": "5511999998888@s.whatsapp.net",
        "fromMe": false,
        "id": "3EB0C767D097E9ECB4A5"
      }
    }
  }
  ```

  `key.id` identifies the original message. This is one of the events passed through raw from the provider, so the edited content may ride along — re-read the message from history if you need the final text with certainty.
  :::

  :::tab{title="messages.delete"}
  A message was deleted for everyone.

  ```json
  {
    "event": "messages.delete",
    "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
    "remoteJid": "5511999998888@s.whatsapp.net",
    "sender": "5511888887777@s.whatsapp.net",
    "data": {
      "id": "3EB0C767D097E9ECB4A5",
      "remoteJid": "5511999998888@s.whatsapp.net",
      "fromMe": false
    }
  }
  ```

  Here the wamid arrives in `data.id` — not `data.keyId` as in `messages.update`, and not `data.key.id` as in `messages.edited`. The three events name the same field three different ways; it is inherited from the provider.
  :::

  :::tab{title="presence.update"}
  The contact came online or started typing.

  ```json
  {
    "event": "presence.update",
    "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
    "remoteJid": "5511999998888@s.whatsapp.net",
    "sender": "5511888887777@s.whatsapp.net",
    "data": {
      "id": "5511999998888@s.whatsapp.net",
      "presences": {
        "5511999998888@s.whatsapp.net": { "lastKnownPresence": "composing" }
      }
    }
  }
  ```

  `lastKnownPresence` is `composing` (typing) or `available` (online). The `presences` map is keyed by JID because in a group it carries several participants at once.
  :::
::::

### Message types

Inside `messages.upsert` and `send.message`, `messageType` tells you which node arrives in `message`. Each tab below shows `message` **exactly as it lands**.

::::tabs
  :::tab{title="Text"}
  `messageType: "conversation"` — plain text, nothing around it.

  ```json
  {
    "conversation": "Hi! Has my order shipped?"
  }
  ```
  :::

  :::tab{title="Text with a link"}
  `messageType: "extendedTextMessage"` — when the text carries a link, WhatsApp attaches the page preview and the node changes from `conversation` to `extendedTextMessage`.

  ```json
  {
    "extendedTextMessage": {
      "text": "Found this one: https://example.com/product/42",
      "matchedText": "https://example.com/product/42",
      "title": "Ergonomic Chair — Example",
      "description": "Adjustable lumbar support, free shipping."
    }
  }
  ```

  ::note
  If you just want the message text, read `message.conversation ?? message.extendedTextMessage?.text`. **A text message can arrive in either node** — it depends on whether it has a link, a quote, or a mention.
  ::
  :::

  :::tab{title="Reply (quote)"}
  When the contact replies to a message, the text arrives in `extendedTextMessage` and `contextInfo` — **at the root of `data`**, not inside the node — points at the quoted message.

  ```json
  {
    "messageType": "extendedTextMessage",
    "message": {
      "extendedTextMessage": { "text": "Yes, please send it!" }
    },
    "contextInfo": {
      "stanzaId": "3EB0F1A2B3C4D5E6F708",
      "participant": "5511888887777@s.whatsapp.net",
      "quotedMessage": {
        "conversation": "Can I ship today to the old address?"
      }
    }
  }
  ```

  `stanzaId` is the **wamid of the quoted message** — that is how you tie the answer back to the question.
  :::

  :::tab{title="Image"}
  `messageType: "imageMessage"`. The caption, when there is one, arrives in `caption`.

  ```json
  {
    "imageMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7118-24/...",
      "mimetype": "image/jpeg",
      "caption": "Here is the receipt",
      "fileLength": 187432,
      "height": 1280,
      "width": 960,
      "directPath": "/v/t62.7118-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```

  Use `downloadMediaUrl` — not `url`. `url` is WhatsApp's encrypted blob and you could not decrypt it on your own.
  :::

  :::tab{title="Video"}
  `messageType: "videoMessage"`. `seconds` is the duration.

  ```json
  {
    "videoMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7161-24/...",
      "mimetype": "video/mp4",
      "caption": "Listen to the noise it is making",
      "fileLength": 2847193,
      "seconds": 14,
      "height": 848,
      "width": 480,
      "directPath": "/v/t62.7161-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```
  :::

  :::tab{title="Voice note"}
  `messageType: "audioMessage"` with **`ptt: true`**. The one recorded by holding the microphone.

  ```json
  {
    "audioMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7117-24/...",
      "mimetype": "audio/ogg; codecs=opus",
      "fileLength": 8432,
      "seconds": 7,
      "ptt": true,
      "directPath": "/v/t62.7117-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```

  **`ptt` is what separates a voice note from a music file.** Both arrive as `audioMessage`; only the flag tells them apart. If you transcribe audio, this is where you decide what is worth sending to the model.
  :::

  :::tab{title="Audio file"}
  `messageType: "audioMessage"` with **`ptt: false`** — the contact attached an audio file instead of recording one.

  ```json
  {
    "audioMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7114-24/...",
      "mimetype": "audio/mpeg",
      "fileLength": 3214567,
      "seconds": 201,
      "ptt": false,
      "directPath": "/v/t62.7114-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```
  :::

  :::tab{title="Document"}
  `messageType: "documentMessage"`. `fileName` is the original file name, and `pageCount` shows up on PDFs.

  ```json
  {
    "documentMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7119-24/...",
      "mimetype": "application/pdf",
      "fileName": "invoice-4821.pdf",
      "caption": "My invoice",
      "fileLength": 94213,
      "pageCount": 2,
      "directPath": "/v/t62.7119-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```
  :::

  :::tab{title="Sticker"}
  `messageType: "stickerMessage"`. Always WebP.

  ```json
  {
    "stickerMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7161-24/...",
      "mimetype": "image/webp",
      "fileLength": 12874,
      "height": 512,
      "width": 512,
      "isAnimated": false,
      "isAvatar": false,
      "isAiSticker": false,
      "isLottie": false,
      "stickerSentTs": 1773494400123,
      "directPath": "/v/t62.7161-24/...",
      "mediaKeyTimestamp": 1773494400,
      "downloadMediaUrl": "https://api.pingonotify.com/v3/connections/media/eyJjIjoiMDE5NWYzYTAt.../download?token=1789012345.9f3a1c7e"
    }
  }
  ```
  :::

  :::tab{title="Reaction"}
  `messageType: "reactionMessage"` — the contact reacted to an existing message with an emoji.

  ```json
  {
    "reactionMessage": {
      "text": "👍",
      "key": { "id": "3EB0F1A2B3C4D5E6F708" }
    }
  }
  ```

  `key.id` is the wamid of the **message that received the reaction**, not of the reaction itself. A removed reaction arrives with an empty `text`.
  :::
::::

::warning
**Not every message type has a payload today.** `message` is filtered through a fixed list of known nodes, and anything outside it is dropped — the event still arrives, `messageType` still names the right type, but `message` comes through as an **empty `{}`**.

This affects: **button replies** (`buttonsResponseMessage`), **list choices** (`listResponseMessage`), **location** (`locationMessage`), **contact cards** (`contactMessage`) and **polls** (`pollCreationMessage`).

In practice: if you send buttons with `POST /chats/messages/send-button`, **the webhook will not tell you which button the contact tapped**. Until that changes, handle these types by reading `messageType` and fetch the content from the conversation history.
::

### Getting the media

You never have to talk to WhatsApp to fetch an attachment. Any media message carries a ready-to-use **`downloadMediaUrl`** — a signed link, valid for **7 days**, that streams the raw bytes from Pingo:

```bash
curl -L "<downloadMediaUrl>" -o receipt.jpg
```

The signature is inside the URL, so this needs no `apikey` — which is what lets your webhook consumer fetch it directly, without holding a Pingo credential.

::note
`downloadMediaUrl` is only attached when the media is referenceable. On an **official** connection that depends on Meta having returned a `media_id`; without one the field simply is not there. Always test for it before using it.
::

### Batching

Set `messageGroupDelay` (1–300 seconds) and Pingo will hold a contact's messages for that long and deliver them as **one array** instead of one request each. Useful when people send five messages in a row and you would rather reason about all of them at once.

The envelope is the same — what changes is that `data` becomes a **list** of the very objects you would otherwise have received one by one:

```json
{
  "event": "messages.upsert",
  "connectionId": "0195f3a0-1234-7890-abcd-ef0123456789",
  "remoteJid": "5511999998888@s.whatsapp.net",
  "sender": "5511888887777@s.whatsapp.net",
  "data": [
    {
      "key": { "remoteJid": "5511999998888@s.whatsapp.net", "fromMe": false, "id": "3EB0AAA" },
      "pushName": "Ana",
      "status": "DELIVERY_ACK",
      "messageType": "conversation",
      "message": { "conversation": "Hi!" },
      "contextInfo": null,
      "source": "android",
      "isAiMessage": false
    },
    {
      "key": { "remoteJid": "5511999998888@s.whatsapp.net", "fromMe": false, "id": "3EB0BBB" },
      "pushName": "Ana",
      "status": "DELIVERY_ACK",
      "messageType": "conversation",
      "message": { "conversation": "forgot to say: after 6pm works better" },
      "contextInfo": null,
      "source": "android",
      "isAiMessage": false
    }
  ]
}
```

::warning
With `messageGroupDelay` on, **`data` is an array** — not an object. A handler written for the simple case breaks silently the moment batching is enabled. Handle both with `const messages = Array.isArray(body.data) ? body.data : [body.data]`.
::

Turn on `enableSimulateTyping` too and Pingo shows "typing…" to the contact while the batching window runs — the wait starts reading as deliberate rather than slow.

### Verifying the signature

Set `hmacEnabled: true` and every delivery is signed. Read the secret back once, and store it:

```bash
curl https://api.pingonotify.com/v3/webhooks/{id}/secret \
  -H "apikey: sk_live_..."
```

Each request then carries two headers:

| Header | Value |
|---|---|
| `X-Pingo-Signature-256` | `sha256=` followed by the hex HMAC-SHA256 |
| `X-Pingo-Timestamp` | Unix seconds |

The signature is computed over the timestamp and the **raw body**, joined by a dot — the timestamp is inside the signed material precisely so an old, valid delivery cannot be replayed at you later.

```
signature = "sha256=" + HMAC_SHA256(`${timestamp}.${rawBody}`, signingSecret).hex()
```

::warning
Verify against the **raw request body**, exactly as it arrived. If your framework parses the JSON and you re-serialize it to check, key order or whitespace can differ and the signature will not match.
::

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(rawBody, headers, secret) {
  const timestamp = headers['x-pingo-timestamp'];
  const received  = headers['x-pingo-signature-256'];

  // Reject anything older than five minutes.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = 'sha256=' + createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(received ?? '');
  return a.length === b.length && timingSafeEqual(a, b);
}
```

Rotate the secret at any time with `POST /v3/webhooks/{id}/secret/rotate`. The old secret stops verifying immediately.

### Retries

Answer with any status **below 400** and the delivery is done. Answer **4xx** or **5xx**, or time out, and Pingo retries — **3 attempts total**, backing off exponentially from 5 seconds. The request times out after 10 seconds.

Make your handler **idempotent**: a retry can deliver a message you already processed. Deduplicate on the message id (`data.key.id`).

## Helpdesk webhooks

These carry events from the shared inbox rather than from WhatsApp.

```bash
curl -X POST https://api.pingonotify.com/v3/helpdesk/webhooks \
  -H "apikey: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/hooks/helpdesk",
    "subscriptions": ["helpdesk.conversation.created", "helpdesk.message.created"],
    "signingSecret": "a-secret-you-choose"
  }'
```

Scope a webhook to a single inbox with `inboxId`, or omit it to receive events from the whole workspace.

::warning
Pingo generates a `signingSecret` if you omit one — but **never returns it**. If you want to verify signatures, supply your own secret at create time.
::

### The helpdesk events

There are 21, and all of them are signable:

| | |
|---|---|
| **Conversations** | `helpdesk.conversation.created` · `helpdesk.conversation.updated` · `helpdesk.conversation.status_changed` · `helpdesk.conversation.assignee_changed` · `helpdesk.conversation.priority_changed` · `helpdesk.conversation.labels_changed` · `helpdesk.conversation.deleted` · `helpdesk.conversation.read` · `helpdesk.conversation.ai_agent_changed` |
| **Messages** | `helpdesk.message.created` · `helpdesk.message.updated` · `helpdesk.message.deleted` · `helpdesk.message.status_changed` · `helpdesk.mention.created` |
| **Labels** | `helpdesk.label.created` · `helpdesk.label.updated` · `helpdesk.label.deleted` |
| **Other** | `helpdesk.csat.response_received` · `helpdesk.sla.missed` · `helpdesk.contact_sync.updated` · `helpdesk.conversation_sync.updated` |

### The envelope

Every helpdesk event arrives like this — and `data` is the event object itself, which always repeats its own `type` inside:

```json
{
  "event": "helpdesk.message.created",
  "data": { "type": "helpdesk.message.created", "accountId": "0195f3a0-...", "...": "..." },
  "deliveredAt": "2026-07-14T12:34:56.000Z"
}
```

Each tab below shows the full `data` for every event in that group.

::::tabs
  :::tab{title="Conversations"}
  **`helpdesk.conversation.created`** — a new conversation landed.

  ```json
  {
    "type": "helpdesk.conversation.created",
    "accountId": "0195f3a0-1c2d-7e3f-8a9b-1c2d3e4f5a6b",
    "conversationId": "0195f3b1-2c3d-7e4f-8a9b-0c1d2e3f4a5b",
    "inboxId": "0195f3c2-3d4e-7f5a-8b9c-1d2e3f4a5b6c",
    "contactId": "0195f3d3-4e5f-7a6b-9c8d-2e3f4a5b6c7d",
    "status": "OPEN",
    "priority": null,
    "assigneeUserId": null,
    "teamId": null
  }
  ```

  **`helpdesk.conversation.status_changed`** — someone resolved, reopened or snoozed it.

  ```json
  {
    "type": "helpdesk.conversation.status_changed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "fromStatus": "OPEN",
    "toStatus": "RESOLVED",
    "actorUserId": "0195f3e4-5f6a-7b8c-9d0e-3f4a5b6c7d8e"
  }
  ```

  The statuses are `OPEN`, `PENDING`, `SNOOZED` and `RESOLVED`. A `silent: true` shows up when the change was automatic (a snooze expiring, say) and left no activity message in the timeline.

  **`helpdesk.conversation.assignee_changed`** — the conversation changed hands.

  ```json
  {
    "type": "helpdesk.conversation.assignee_changed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "fromAssigneeUserId": null,
    "toAssigneeUserId": "0195f3e4-...",
    "fromTeamId": null,
    "toTeamId": "0195f3f5-...",
    "actorUserId": "0195f3e4-..."
  }
  ```

  When an AI bot takes the conversation or hands it back, `fromAgentBotId` and `toAgentBotId` ride along — the bot lives in its own column, separate from the human assignee.

  **`helpdesk.conversation.priority_changed`**

  ```json
  {
    "type": "helpdesk.conversation.priority_changed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "fromPriority": null,
    "toPriority": "URGENT",
    "actorUserId": "0195f3e4-..."
  }
  ```

  **`helpdesk.conversation.labels_changed`** — note that it delivers the **delta**, not the final list.

  ```json
  {
    "type": "helpdesk.conversation.labels_changed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "addedLabelIds": ["0195f406-..."],
    "removedLabelIds": [],
    "actorUserId": "0195f3e4-..."
  }
  ```

  **`helpdesk.conversation.updated`** — a field changed that has no event of its own. `changedFields` names them.

  ```json
  {
    "type": "helpdesk.conversation.updated",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "changedFields": ["customAttributes", "snoozedUntil"]
  }
  ```

  **`helpdesk.conversation.read`** · **`helpdesk.conversation.deleted`**

  ```json
  {
    "type": "helpdesk.conversation.read",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "userId": "0195f3e4-...",
    "assigneeLastSeenAt": "2026-07-14T12:34:56.000Z"
  }
  ```

  **`helpdesk.conversation.ai_agent_changed`** — WhatsApp Business's native AI took the chat (or gave it back). While `aiAgentEnabled` is `true`, **nothing you send goes out** on that conversation.

  ```json
  {
    "type": "helpdesk.conversation.ai_agent_changed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "aiAgentEnabled": true
  }
  ```
  :::

  :::tab{title="Messages"}
  **`helpdesk.message.created`** — the main one. The message arrives **hydrated** in `message`, in the same shape the REST API returns, so you can render it without a second request.

  ```json
  {
    "type": "helpdesk.message.created",
    "accountId": "0195f3a0-...",
    "messageId": "0195f417-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "channelType": "WHATSAPP",
    "messageType": "INCOMING",
    "status": "DELIVERED",
    "isPrivate": false,
    "senderUserId": null,
    "senderContactId": "0195f3d3-...",
    "message": {
      "id": "0195f417-...",
      "conversationId": "0195f3b1-...",
      "content": "Hi! Has my order shipped?",
      "contentType": "TEXT",
      "messageType": "INCOMING",
      "status": "DELIVERED",
      "private": false,
      "sender": { "id": "0195f3d3-...", "name": "Ana" },
      "attachments": [],
      "createdAt": "2026-07-14T12:34:56.000Z"
    }
  }
  ```

  `messageType` is `INCOMING`, `OUTGOING`, `ACTIVITY` or `TEMPLATE`. A **private note** is not a type of its own: it is an `OUTGOING` with `isPrivate: true`.

  **`helpdesk.message.status_changed`** — the delivery lifecycle. This is how you learn that the message you sent actually landed.

  ```json
  {
    "type": "helpdesk.message.status_changed",
    "accountId": "0195f3a0-...",
    "messageId": "0195f417-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "fromStatus": "PENDING",
    "toStatus": "FAILED",
    "externalError": "131030: Recipient not in allowed list"
  }
  ```

  Statuses go `PENDING` → `SENT` → `DELIVERED` → `READ`, with `FAILED` as the off-ramp. **`externalError` only appears when `toStatus` is `FAILED`** — it is the provider's raw reason, ideal for a tooltip without waiting for a reload.

  **`helpdesk.message.updated`** · **`helpdesk.message.deleted`**

  ```json
  {
    "type": "helpdesk.message.deleted",
    "accountId": "0195f3a0-...",
    "messageId": "0195f417-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "actorUserId": "0195f3e4-...",
    "deletedAt": "2026-07-14T12:40:00.000Z"
  }
  ```

  **`helpdesk.mention.created`** — someone was @mentioned in a private note.

  ```json
  {
    "type": "helpdesk.mention.created",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "messageId": "0195f417-...",
    "mentionedUserId": "0195f428-...",
    "mentionerUserId": "0195f3e4-..."
  }
  ```
  :::

  :::tab{title="Labels"}
  **`helpdesk.label.created`** and **`helpdesk.label.updated`** carry the complete state, so you can upsert without a refetch.

  ```json
  {
    "type": "helpdesk.label.created",
    "accountId": "0195f3a0-...",
    "labelId": "0195f406-...",
    "name": "Urgent",
    "description": "Needs an answer today",
    "color": "#DC2626",
    "showOnSidebar": true
  }
  ```

  **`helpdesk.label.deleted`**

  ```json
  {
    "type": "helpdesk.label.deleted",
    "accountId": "0195f3a0-...",
    "labelId": "0195f406-...",
    "actorUserId": "0195f3e4-..."
  }
  ```
  :::

  :::tab{title="CSAT and SLA"}
  **`helpdesk.csat.response_received`** — the contact answered the satisfaction survey.

  ```json
  {
    "type": "helpdesk.csat.response_received",
    "accountId": "0195f3a0-...",
    "csatSurveyResponseId": "0195f439-...",
    "conversationId": "0195f3b1-...",
    "messageId": "0195f417-...",
    "rating": 5,
    "contactId": "0195f3d3-...",
    "assignedAgentUserId": "0195f3e4-..."
  }
  ```

  **`helpdesk.sla.missed`** — a deadline blew. `eventType` says which: first response, next response, or resolution.

  ```json
  {
    "type": "helpdesk.sla.missed",
    "accountId": "0195f3a0-...",
    "conversationId": "0195f3b1-...",
    "inboxId": "0195f3c2-...",
    "appliedSlaId": "0195f44a-...",
    "slaPolicyId": "0195f45b-...",
    "assigneeUserId": "0195f3e4-...",
    "eventType": "FIRST_RESPONSE"
  }
  ```

  ::note
  **`helpdesk.sla.missed` is the only event that is never broadcast over the websocket.** It reaches your webhook and raises an in-app notification — but no socket event fires for it. If you depend on SLA in real time, the webhook is the only path.
  ::
  :::

  :::tab{title="Sync"}
  These two are **progress snapshots**: the same event fires repeatedly during a run, with the counters climbing. Upsert on `runId` and react to `status`.

  **`helpdesk.contact_sync.updated`**

  ```json
  {
    "type": "helpdesk.contact_sync.updated",
    "accountId": "0195f3a0-...",
    "runId": "0195f46c-...",
    "connectionId": "0195f3a0-...",
    "status": "running",
    "totalCount": 1240,
    "processedCount": 380,
    "createdCount": 350,
    "updatedCount": 28,
    "skippedCount": 2,
    "failedCount": 0,
    "errorMessage": null
  }
  ```

  **`helpdesk.conversation_sync.updated`** — the history backfill. Here the counters count **messages** (`skippedCount` are the ones deduplicated by wamid), and `conversationsCount` counts the conversations touched.

  ```json
  {
    "type": "helpdesk.conversation_sync.updated",
    "accountId": "0195f3a0-...",
    "runId": "0195f47d-...",
    "inboxId": "0195f3c2-...",
    "connectionId": "0195f3a0-...",
    "status": "completed",
    "totalCount": 8400,
    "processedCount": 8400,
    "createdCount": 8112,
    "updatedCount": 0,
    "skippedCount": 288,
    "failedCount": 0,
    "conversationsCount": 214,
    "errorMessage": null
  }
  ```
  :::
::::

Headers:

| Header | Value |
|---|---|
| `X-Helpdesk-Event` | The event name |
| `X-Helpdesk-Signature` | The hex HMAC-SHA256 of the body |

Here the signature covers the **body alone** — there is no timestamp in the signed material:

```
signature = HMAC_SHA256(rawBody, signingSecret).hex()
```

Retries follow the same policy as connection webhooks: 3 attempts, exponential backoff from 5 seconds, 10-second timeout.

Before going live, fire a test delivery at your endpoint — it runs immediately and reports back what your server answered:

```bash
curl -X POST https://api.pingonotify.com/v3/helpdesk/webhooks/{id}/test \
  -H "apikey: sk_live_..."
```

```json
{ "status": 200, "durationMs": 143 }
```

## Sending messages *into* Pingo

The webhooks above are outbound. The **API channel** is the inbound direction: an inbox that is not a WhatsApp number at all, that your own application pushes messages into.

Create an inbox with `channelType: "API"`. The create response returns the credential as `inboundWebhookSecret`; later reads of the API inbox return that same credential as `channelConfig.hmacToken`.

```bash
curl -X POST https://api.pingonotify.com/v3/helpdesk/inboxes \
  -H "apikey: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "Web widget", "channelType": "API" }'
```

Then push a customer message in:

```bash
curl -X POST https://api.pingonotify.com/webhooks/helpdesk/{inboxId} \
  -H "x-helpdesk-token: <inboundWebhookSecret>" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "your-message-id-123",
    "content": "Is my order shipped?",
    "sender": { "name": "Ana", "email": "ana@example.com" }
  }'
```

Set `channelConfig.hmacMandatory: true` on the inbox to require either `x-helpdesk-token` or `x-helpdesk-signature`. When it is `false` or omitted, a request with neither credential is accepted; a credential that is present but invalid is always rejected.

The contact is resolved or created automatically, a conversation opens, and your agents answer it in the shared inbox like any other.

To receive their replies, set `channelConfig.webhookUrl` on the inbox. Pingo will `POST` each outgoing message there, signed with the same secret:

```json
{
  "event": "message.created",
  "data": {
    "sourceId": "0195f3d3-...",
    "recipientIdentifier": "ana@example.com",
    "content": "Yes, it shipped this morning.",
    "attachments": []
  },
  "deliveredAt": "2026-07-14T12:35:10.000Z"
}
```

Answer with `{ "sourceId": "your-own-id" }` and Pingo will remember your id for that message — which is what lets you report delivery back later:

```bash
curl -X POST https://api.pingonotify.com/webhooks/helpdesk/{inboxId} \
  -H "x-helpdesk-token: <inboundWebhookSecret>" \
  -H "Content-Type: application/json" \
  -d '{ "event": "status_update", "sourceId": "your-own-id", "status": "READ" }'
```
