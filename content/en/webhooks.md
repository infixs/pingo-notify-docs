---
title: Webhooks
description: Receive WhatsApp events in real time by linking webhooks to one or more connections in Pingo Notify.
icon: webhook
---

## What are Webhooks?

Webhooks allow **Pingo Notify to notify your application** whenever something happens on WhatsApp.

::info
Think of webhooks as automatic alerts sent to your system.
::

Whenever an event occurs, Pingo Notify sends this information to a URL configured by you.

---

## Connections and Webhooks

::info
The relationship between connections and webhooks is flexible.
::

- A connection can be linked to multiple webhooks  
- A webhook can receive events from multiple connections  

This allows different integration combinations, depending on your system’s needs.

---

## When should you use Webhooks?

Use webhooks when you want to:

- Receive notifications about sent or received messages  
- Automate processes based on WhatsApp  
- Update systems in real time  
- Integrate WhatsApp with other applications  

If you only send messages, using webhooks is optional.

---

## How it works

::info
Basic flow:  
**WhatsApp → Connection → Pingo Notify → Webhook → Your application**
::

Whenever something happens on any linked connection, the event is sent to the webhook.

---

## Configure a Webhook

:::columns{cols=2}
  ::card{title="Webhook URL" icon="link"}
  Enter the HTTPS address that will receive the events.
  ::

  ::card{title="Select events" icon="list"}
  Choose which types of events your application should receive.
  ::

  ::card{title="Webhook status" icon="toggle-on"}
  Enable or pause event delivery when needed.
  ::

  ::card{title="Link connections" icon="layer-group"}
  Select one or more connections that will trigger events for this webhook.
  ::
:::

---

## Available events

The main events that can be sent are:

:::steps
  ::step{title="Message sent"}
  When an unofficial connection sends a message via WhatsApp.
  ::

  ::step{title="Message received"}
  When a message arrives at the connected WhatsApp.
  ::

  ::step{title="Message edited or deleted"}
  When a message is changed or removed.
  ::

  ::step{title="Presence updated"}
  When there is a change in the contact’s presence state.
  ::
:::

---

## What Webhooks do and do not do

::callout{icon="circle-info"}
- Receive events in real time  
- Can be linked to multiple connections  
- Do not send messages  
- Do not create connections  
::

---

## Summary

::info
- Webhooks receive WhatsApp events  
- A webhook can listen to multiple connections  
- A connection can trigger events to multiple webhooks  
::

Use webhooks when your application needs to automatically react to what happens on one or more connections.
