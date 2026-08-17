---
title: 'Conventions'
description: 'Pagination, errors, ids and dates — the rules every v3 endpoint follows.'
icon: 'list-check'
---

## Pagination

Several page-based list endpoints take these query parameters and return the same envelope.

```bash
curl "https://api.pingonotify.com/v3/helpdesk/contacts?page=2&per_page=50&s=ana" \
  -H "apikey: sk_live_..."
```

| Parameter | Default | Notes |
|---|---|---|
| `page` | `1` | 1-based. |
| `per_page` | `10` | The allowed range is endpoint-specific. |
| `s` | — | Free-text search. What it searches depends on the resource. |

::warning
The wire names are **`per_page`** and **`s`** — snake_case and short. Sending `perPage` or `search` does not fail; it is silently ignored and you get the defaults back. This trips people up, so check the parameter names on the endpoint page.
::

When page pagination is used, the envelope has this shape:

```json
{
  "data": [ ... ],
  "total": 137,
  "totalPages": 3,
  "currentPage": 2,
  "perPage": 50
}
```

### The exception: messages

`GET /v3/helpdesk/conversations/{id}/messages` is **cursor**-paginated, because a conversation grows from the bottom while you read it and page numbers would shift under you.

It returns a **bare array**, not an envelope, ordered **oldest first**. To walk backwards through history, pass the id of the oldest message you already hold:

```bash
curl "https://api.pingonotify.com/v3/helpdesk/conversations/{id}/messages?limit=30&cursor={oldestMessageId}" \
  -H "apikey: sk_live_..."
```

You have reached the beginning of the conversation when you get back fewer messages than you asked for.

## Errors

There are two common error shapes, and which one you get depends on where the failure happened.

**Validation and permission failures** use the standard shape:

```json
{
  "statusCode": 400,
  "message": ["name must be a string"],
  "error": "Bad Request"
}
```

Note that `message` is an **array** for validation failures — one entry per broken rule — and a plain string otherwise.

Many business failures use a coded shape, with a machine-readable code and a localized message:

```json
{
  "message": "CONNECTION_NOT_FOUND",
  "hint": "Connection not found."
}
```

When `message` is a documented code, branch on it rather than on `hint` — the hint is written for humans and its wording may change. Some business failures use the standard shape instead, as documented by each endpoint.

### Status codes

| Code | What it means |
|---|---|
| `200` | Success. |
| `201` | Created. This is the default for `POST` unless noted otherwise. |
| `204` | Success, no body. Only assume it when the endpoint documents it. |
| `400` | Your request was malformed, or a business rule rejected it. |
| `401` | Your `apikey` is missing, wrong, or revoked. |
| `403` | Your role does not allow this, or your plan does not include it. |
| `404` | It does not exist — **or you cannot see it**. See below. |
| `409` | It collides with something that already exists. |
| `422` | The request is valid, but the current resource state cannot process it — for example, a closed WhatsApp window or AI that is not configured. |

### Why you get a 404 instead of a 403

When an Agent asks for a conversation in an inbox they do not belong to, the API answers **404**, not 403.

That is deliberate. A 403 would confirm the conversation exists, which leaks information to someone who should not know. The same rule applies to helpdesk resources protected by inbox visibility.

So a 404 means *"not visible to you"*, which is a slightly broader statement than *"not there"*.

## Ids

Pingo-generated resource ids are **UUIDs**. Most are UUID v7, so they sort chronologically — but do not depend on that; treat them as opaque strings. Provider and external ids, such as WhatsApp message ids, are opaque strings and may use other formats.

A conversation also has a **`displayId`**: a small integer, sequential per workspace, that exists so your agents can say "ticket 214" out loud. It is not accepted anywhere as a path parameter.

## Dates

Every timestamp in and out is **ISO 8601 in UTC**:

```
2026-07-14T12:34:56.000Z
```

Report ranges are inclusive on both ends. Where a report buckets by day, the buckets are UTC days.

The one place a timezone matters is an **inbox**: its `timezone` (an IANA name such as `America/Sao_Paulo`) is what working hours, out-of-office replies and business-hours SLAs are measured against.

## Rate limits and metering

There is no request-per-second rate limit on the API.

What *is* metered is **messages**. Every message you send consumes one credit from your plan, and campaigns reserve credits for the whole audience up front — if your plan cannot cover every recipient, the campaign is not created at all. Cancelling a campaign refunds the credits for recipients that were never sent.

Check your remaining headroom with `GET /v3/summary`.
