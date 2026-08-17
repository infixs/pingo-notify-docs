---
title: "Official WhatsApp API"
description: "Step-by-step guide to request access to the Official WhatsApp Business API and connect it to Pingo Notify."
icon: "badge-check"
---

The **Official WhatsApp Business API** is the route approved by Meta for companies that need scale, a verified profile, and message templates ready for high-volume sending.

Unlike a QR Code connection, the official API runs on **Meta's own infrastructure** — so the setup happens inside the **Meta for Developers** panel and is then linked to Pingo Notify.

::info
This guide follows Meta's official [WhatsApp Business Platform — Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started) documentation, adapted for the Pingo Notify workflow.
::

::note
The official API is **optional**. If you only need to send and receive messages from a single device, a regular [Connection](/en/connections) via QR Code is enough.
::

---

## Before you start

::info
**What you'll need**
- A personal **Facebook account** to access [Meta for Developers](https://developers.facebook.com/)
- A **Meta Business Portfolio** in [Meta Business Suite](https://business.facebook.com/) (Business Manager) for your company
- A **phone number** that is **not** currently active on the regular WhatsApp or WhatsApp Business app
- An active **[Pingo Notify](https://pingonotify.com/dashboard)** account
::

The number used for the official API can no longer be used in the regular WhatsApp app, so choose a dedicated line for your business.

---

## The journey at a glance

::info
Big picture:  
**Meta Developer account → Meta App → WhatsApp product → Verified number → Webhook → Pingo Notify**
::

The steps below take you from zero to an approved number that sends and receives messages through Pingo Notify.

---

## Step by step

:::steps
  ::step{title="Create a Meta for Developers account"}
  Open the [Meta for Developers](https://developers.facebook.com/) portal and register using your Facebook account.  
  Confirm your email and, if prompted, enable two-factor authentication — Meta requires it for accounts that manage apps.
  ::

  ::step{title="Create a Meta App"}
  In the [App Dashboard](https://developers.facebook.com/apps/), click **Create App** and choose the **Business** type.  
  Give the app a name, enter a contact email, and link it to your **Business Portfolio**.  
  This app is the container that will hold the WhatsApp product. See Meta's [Create an App](https://developers.facebook.com/docs/development/create-an-app) reference for details.
  ::

  ::step{title="Add the WhatsApp product"}
  On the app page, find **WhatsApp** in the product list and click **Set up**.  
  Meta automatically creates a **WhatsApp Business Account (WABA)** and provides a **free test number** so you can experiment before going live. Reference: [Cloud API — Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started).
  ::

  ::step{title="Send a test message"}
  Open the **API Setup** panel. There you'll find the test number, a **temporary access token** (valid for 24 hours), and a field to add recipients.  
  Add your own number as a recipient and send the sample **`hello_world`** template to confirm everything is working.
  ::

  ::step{title="Add your business number"}
  Still in the panel, choose **Add phone number** and register the line your customers will see.  
  Set the **display name**, confirm ownership with the code Meta sends by **SMS or call**, and define a **two-step verification PIN**. Reference: [Add a phone number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-a-phone-number).
  ::

  ::step{title="Verify your business"}
  To remove the sending limits and leave the test stage, complete **Business Verification** in your Business Portfolio settings.  
  Meta will ask for documents proving your company is legitimate; approval can take a few days. References: [Business Verification](https://developers.facebook.com/docs/development/release/business-verification) and the [Business Help Center](https://www.facebook.com/business/help/2058515294227817).
  ::

  ::step{title="Collect your credentials"}
  Note down the **Phone Number ID** and the **WhatsApp Business Account (WABA) ID**.  
  For production, generate a **permanent access token**: create a [System User](https://business.facebook.com/settings/system-users) in your Business settings and grant it the `whatsapp_business_messaging` and `whatsapp_business_management` permissions. Reference: [Business Management API — Get Started](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started).
  ::
:::

::warning{icon="triangle-exclamation"}
Never share your access token publicly. Treat it like a password — anyone who has it can send messages on your behalf.
::

---

## Connect the webhook to Pingo Notify

Meta delivers every incoming message and status update through a **webhook**. Instead of building and hosting your own receiver, you point Meta directly at **Pingo Notify**, which handles the validation and forwards each event for you. For the underlying mechanism, see Meta's [Set Up Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks) guide.

:::columns{cols=2}
  ::card{title="1. Create an official connection" icon="plus" to="https://pingonotify.com/dashboard/connections"}
  In Pingo Notify, create a new connection of the **Official WhatsApp API** type.
  Pingo Notify generates the **Webhook URL** and the **Verify Token** you'll need.
  ::

  ::card{title="2. Set the Callback URL in Meta" icon="link"}
  In the Meta App, open **WhatsApp → Configuration → Webhooks** and click **Edit**.
  Paste the **Callback URL** and **Verify Token** provided by Pingo Notify, then confirm.
  ::

  ::card{title="3. Subscribe to events" icon="list-check"}
  On the same screen, subscribe to the **messages** field so Meta forwards incoming messages and status updates to Pingo Notify.
  ::

  ::card{title="4. Finish the connection" icon="plug" to="https://pingonotify.com/dashboard/connections"}
  Back in Pingo Notify, enter your **Phone Number ID**, **WABA ID**, and **access token**.
  Save to validate the credentials and activate the connection.
  ::
:::

::info
Event flow with the official API:  
**WhatsApp → Meta → Webhook → Pingo Notify → Your application**
::

Once the connection is active, it behaves like any other connection in Pingo Notify — you can link it to [Webhooks](/en/webhooks), [Integrations](/en/integrations), and the messaging API.

---

## Good to know

::callout{icon="circle-info"}
- The test number only sends to recipients you add manually — use it for validation, not production  
- The official number cannot be used in the regular WhatsApp app at the same time  
- Higher messaging limits depend on Business Verification and your quality rating  
- Marketing and notification [message templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates) must be approved by Meta before they can be sent  
::

---

## References

Official Meta documentation used in this guide:

- [WhatsApp Business Platform — Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
- [Cloud API — Get Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Create an App](https://developers.facebook.com/docs/development/create-an-app) · [App Dashboard](https://developers.facebook.com/apps/)
- [Add a phone number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-a-phone-number)
- [Set Up Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)
- [Business Verification](https://developers.facebook.com/docs/development/release/business-verification)
- [Business Management API — Get Started](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started) · [Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Meta Business Suite](https://business.facebook.com/) · [System Users](https://business.facebook.com/settings/system-users)

Pingo Notify:

- [Pingo Notify Dashboard](https://pingonotify.com/dashboard) · [Connections](https://pingonotify.com/dashboard/connections)
- [Connections](/en/connections) · [Webhooks](/en/webhooks) · [Integrations](/en/integrations) docs

---

## Summary

::info
- The Official WhatsApp API runs on Meta's infrastructure and is set up in Meta for Developers  
- You create a Meta App, add the WhatsApp product, and verify a dedicated number  
- The webhook points to Pingo Notify, which receives and delivers every event  
- Once connected, the official number works like any other Pingo Notify connection  
::

With the connection active, you're ready to send templates and receive messages at scale through the official channel.
