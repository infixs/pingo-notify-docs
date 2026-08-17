---
title: "Webhooks"
description: "In this section, you’ll learn how to integrate and use webhooks and messaging events to connect your application to your projects."
icon: "webhook"
---

::info
**Prerequisites**
- Have an active **Pingo Notify** account.
- Provide an HTTP endpoint to receive requests — any webhook service can be used.
::

## Create a connection

:::columns{cols=2}
  ::card{title="1. Access Connections" icon="qrcode" to="https://pingonotify.com/dashboard/connections"}
  Go to the **Connections** tab in the dashboard to view all created integrations.
  ::

  ::card{title="2. Create a new connection" icon="plus"}
  Click **Create**, choose a name, and adjust the settings according to your needs.
  ::

  ::card{title="3. Link to WhatsApp" icon="expand"}
  After creating the connection, click the **QR Code** icon and scan it using WhatsApp’s QR Code reader.
  This is the same process used by WhatsApp Web.
  ::

  ::card{title="4. Connection activated" icon="wifi"}
  After scanning the QR Code, the status will update automatically and the connection will become active.
  ::
:::

::warning{icon="triangle-exclamation"}
Keep WhatsApp active on the linked device.
::

## Configure Webhooks

After creating your connection, you can configure webhooks to receive real-time events directly on your HTTPS endpoint.

:::columns{cols=2}
  ::card{title="1. Define the Webhook URL" icon="link" to="https://pingonotify.com/dashboard/webhooks"}
  Provide the HTTPS URL of your endpoint.  
  This is the route where Pingo Notify will send all selected events.
  ::

  ::card{title="2. Select webhook events" icon="list"}
  Choose which events you want to listen to.  
  The list includes actions such as messages sent, received, edited, and more.
  ::

  ::card{title="3. Enable or disable the Webhook" icon="toggle-on"}
  Use the **“Webhook status”** switch to enable or pause event delivery without deleting the configuration.
  ::

  ::card{title="4. Message grouping" icon="layer-group"}
  The **“Enable message grouping”** option reduces the number of requests by grouping events over a time interval.
  ::

  ::card{title="5. Typing simulation" icon="keyboard"}
  The **“Enable typing simulation”** option sends “typing…” signals to WhatsApp, mimicking human behavior.
  ::

  ::card{title="6. Grouping interval" icon="timer"}
  If grouping is enabled, set the time (in seconds) to collect multiple events before sending them in a single payload.
  ::
:::

---

## Available Events

The events listed represent everything the system can send to your webhook.  
Below is an explanation of each one:

:::steps
  ::step{title="Message sent"}
  Triggered when **your integration sends a message** via WhatsApp.  
  Includes data such as message ID, content, recipient, and timestamp.
  ::

  ::step{title="Message received"}
  Triggered when **a message arrives on the connected WhatsApp**.  
  Includes text, media, sender, and origin metadata.
  ::

  ::step{title="Message updated"}
  Occurs when a message changes — for example, when WhatsApp updates its internal status.
  ::

  ::step{title="Message deleted"}
  Sent when a message is deleted (either by you or by the sender).  
  Useful for UI synchronization.
  ::

  ::step{title="Message edited"}
  Triggered when an existing message is edited on WhatsApp, a recent platform feature.
  ::

  ::step{title="Presence updated"}
  Indicates changes in the contact’s presence state (typing, recording audio, online, etc.).
  ::
:::

::callout{icon="circle-info"}
All events are sent via JSON POST requests, enabling fast processing and integration with any backend.
::
