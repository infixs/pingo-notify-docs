---
title: API Keys
description: Understand what API Keys are and why they are required to use Pingo Notify securely.
icon: key
---

## What are API Keys?

**API Keys** are **access keys** that identify and authorize applications to use Pingo Notify.

::info
Think of API Keys as a **special password for systems**,  
not for people.
::

They ensure that only authorized applications can access your account and send messages on your behalf.

---

## What are API Keys used for?

API Keys allow an application to:

- Access your Pingo Notify account  
- Use messaging resources  
- Query permitted information  
- Perform actions securely  

Without a valid key, access is blocked.

---

## Important to understand

::callout{icon="circle-info"}
- The key identifies your account  
- Anyone with the key can use your account  
- It must be protected like a password  
::

---

## How it works in practice

::info
Simple flow:  
**Application → API Key → Pingo Notify**
::

Whenever an application tries to communicate with Pingo Notify, the API Key is used to validate access.

---

## Creating API Keys

API Keys are created directly in the Pingo Notify dashboard, or through the API itself with `POST /v3/api-tokens`.

Important points:

- The key is displayed **only once**  
- It cannot be viewed again  
- If lost, a new one must be generated  

---

## Using your key

A key always begins with `sk_live_`:

```
sk_live_a1b2c3d4e5f6...
```

Send it in the **`apikey`** header on every request:

```bash
curl https://api.pingonotify.com/v3/connections \
  --header 'apikey: sk_live_a1b2c3d4e5f6...'
```

::warning
It is the **`apikey`** header — not `Authorization: Bearer`. The same key works across every version of the API.
::

---

## Rotating and revoking

If a key leaks, you do not have to delete it and rebuild your integration. **Rotate** it — the old secret dies the instant the new one is issued, and the replacement comes back in the response:

```bash
curl -X PATCH https://api.pingonotify.com/v3/api-tokens/{id} \
  --header 'apikey: sk_live_...' \
  --header 'Content-Type: application/json' \
  --data '{ "refreshToken": true }'
```

To revoke a key outright, delete it with `DELETE /v3/api-tokens/{id}`. It stops working immediately.

::info
A key carries the permissions of the person who created it. A key created by an **Owner** can do everything an Owner can — including billing. Create each key under an account whose role matches what the integration actually needs.
::

---

## Security best practices

- Do not share your API Key  
- Do not publish the key in public places  
- Store it securely  
- Remove keys that are no longer in use  

---

## Quick summary

::info
- API Keys control access to your account  
- They are used by applications, not people  
- They must be kept secure  
::

Whenever an application needs to access Pingo Notify, it will require a valid API Key.
