---
title: Connections
description: Connections represent WhatsApp sessions linked to Pingo Notify, used for sending, receiving, and integrations.
icon: qrcode
---

## What is a connection?

A **connection** is an **active WhatsApp session** linked to Pingo Notify, similar to WhatsApp Web.

::info
It is a session scanned via QR Code,  
but **named**, **manageable**, and with **advanced controls**.
::

Each connection corresponds to one connected WhatsApp account.

---

## What are they used for?

Connections are the foundation of everything in Pingo Notify.  
They allow you to:

- Send and receive messages  
- Process events  
- Use plugins, webhooks, and APIs  
- Control session behavior  

Without an active connection, no integration works.

---

## What can I do with a connection?

- Link a WhatsApp account via QR Code  
- Name the session  
- Use the same connection across multiple integrations  
- Configure webhooks  
- Adjust rules for reading, presence, and calls  

Each connection is independent.

---

## Edit connection

The **Edit connection** screen defines **how the WhatsApp session behaves**.

::info
Changes affect only the selected connection.
::

### Connection name

Internal name for identification.

- Organizational only  
- Does not change the WhatsApp account  

**Examples:** `Support`, `Sales`, `Finance`

---

## Connection settings

These options control the behavior of the connected session.

:::columns{cols=2}
  ::card{title="Read received messages" icon="check-double"}
  Automatically marks messages as read.

  - Active: immediate reading
  - Inactive: manual reading
  ::

  ::card{title="Always online" icon="circle-dot"}
  Keeps the session active and showing as online.

  - Recommended for bots
  - Avoid for human support
  ::

  ::card{title="Ignore group messages" icon="users-slash"}
  Does not process messages coming from groups.

  - Events ignored
  - Webhooks do not receive them
  ::

  ::card{title="Sync full history" icon="clock-rotate-left"}
  Imports old conversations when connecting.

  - Enable if you need history
  - Disable to start fresh
  ::

  ::card{title="Reject calls" icon="phone-slash"}
  Automatically rejects calls.

  - Message-focused channel
  ::

  ::card{title="Read status updates" icon="eye-slash"}
  Marks status updates as viewed.

  - Avoids status buildup
  - Optional for privacy
  ::
:::

---

## Important to know

::callout{icon="circle-info"}
- Connection = WhatsApp session  
- Each connection has its own rules  
- Integrations always use an active connection  
::

---

## Summary

::info
- Works like a managed WhatsApp Web  
- It is the foundation for messaging and integrations  
- Reviewing settings helps avoid issues  
::

Before using plugins, webhooks, or APIs, configure your connection properly.
