---
title: "Introduction"
description: "The v2 API: connections, chats, messages and templates."
icon: "sparkles"
---

The v2 API is the original Pingo Notify API: one API key, your own WhatsApp numbers, and the endpoints to send and read messages on them. It has fewer moving parts than v3 and it is still fully supported.

**Base URL**

```
https://api.pingonotify.com
```

Every request carries your key in a header — there is nothing else to sign or exchange:

```
apikey: YOUR_API_KEY_HERE
```

## What it covers

- **Connections.** Create a number, pair it by QR code, update it, log it out, delete it.
- **Chats.** List the conversations on a connection, and send a presence signal ("typing…") into one.
- **Messages.** Text and media (image, video, audio, document) in a single call, plus stickers, list and button messages, template messages, message history and media download.
- **Templates.** List and create the templates of a connection.
- **Verifications.** Check whether a number is on WhatsApp, either through a connection or standalone.

One thing to know before you read the endpoints: in v2 the recipient is part of the URL. You send to `/v2/connections/{id}/chats/{remoteJid}/messages`, where `{id}` is the connection and `{remoteJid}` the number you are writing to.

## Your first request

List the connections your key can reach:

```bash
curl https://api.pingonotify.com/v2/connections \
  -H "apikey: YOUR_API_KEY_HERE"
```

## v2 or v3?

Stay on v2 if you already run on it, or if all you need is to send and read messages from your own numbers.

Move to [v3](/en/api-reference/v3) when you need what v2 has no concept of: a **workspace** several people share, **campaigns** that send one message to many recipients, and the **helpdesk** — a shared inbox with conversations, assignment, bots, SLAs and reports.

::note
v2 is not deprecated and keeps working. The same API key authenticates both versions, so you can move one endpoint at a time.
::

## Where to go next

:::card-group{cols=3}
  ::card{title="Authentication" icon="key" to="/en/api-reference/v2/authentication"}
  Create your API key and send it on every request.
  ::

  ::card{title="Webhooks" icon="webhook" to="/en/api-reference/v2/webhooks"}
  Receive messages and events on your own endpoint.
  ::

  ::card{title="API reference" icon="code" to="/en/reference/v2"}
  Every v2 endpoint, with its parameters and examples.
  ::
:::
