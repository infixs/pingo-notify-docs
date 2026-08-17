# Authoring guide

Pages live in `content/<locale>/…` as Markdown with [MDC](https://content.nuxt.com/docs/files/markdown)
syntax. The file path becomes the route: `content/en/connections.md` → `/en/connections`,
`content/pt-BR/api-reference/v3/index.md` → `/pt-BR/api-reference/v3`.

Every page needs front matter:

```yaml
---
title: Connections
description: One sentence, shown under the title and as the meta description.
icon: qrcode # Font Awesome / Lucide name, see `app/config/icons.ts`
---
```

`title` and `description` are rendered by the page shell, so the body must **not**
repeat them as an `# H1` or a lead paragraph. Body headings start at `##`.

`icon` is nominally optional, but every page has one — it is what the sidebar
row and the `<h1>` render, and a page without it reads as broken next to its
siblings. The name must be registered in `app/config/icons.ts`, either in
`ICON_ALIASES` or in `ICON_FA_SOLID`; `npm run check:content` fails on one that
is not. An unregistered name is worse than a wrong one, because it renders fine
in the prerendered HTML and then disappears the moment the reader navigates
client-side.

## MDC in one minute

A component is a fenced block introduced by `::`:

```md
::info
Body of the callout, parsed as Markdown.
::
```

Props go in braces on the opening line:

```md
::card{title="Getting started" icon="rocket" to="/en/connections" horizontal}
Card body.
::
```

**Nesting requires more colons on the outer block.** A `::card` inside a
`:::columns` needs three colons on the wrapper:

```md
:::columns{cols=2}
  ::card{title="First" icon="plus"}
  Body.
  ::

  ::card{title="Second" icon="link"}
  Body.
  ::
:::
```

Boolean props are written bare (`horizontal`), numbers unquoted (`cols=2`),
strings quoted (`title="…"`).

## Components

These are ports of the Mintlify components the docs were originally written
with, so the same names and props keep working.

| Component                  | Props                                             | Notes                                            |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `::note` `::info` `::tip`  | `icon`, `title`                                   | Admonitions                                       |
| `::check` `::warning`      | `icon`, `title`                                   | Admonitions                                       |
| `::danger`                 | `icon`, `title`                                   | Admonition                                        |
| `::callout`                | `icon`, `title`, `type`                           | Neutral admonition; `type` picks a colour         |
| `::card`                   | `title`, `icon`, `to` / `href`, `horizontal`, `color`, `cta` | Links out when `to`/`href` is set      |
| `:::card-group`            | `cols` (1–4, default 2)                           | Grid of cards                                     |
| `:::columns`               | `cols` (1–4, default 2)                           | Generic responsive grid                           |
| `:::steps` + `::step`      | `step`: `title`, `icon`                           | Numbered walkthrough (CSS counter)                |
| `:::tabs` + `::tab`        | `tab`: `title`                                    | Tab strip; the first tab is open                  |
| `:::accordion-group` + `::accordion` | `accordion`: `title`, `icon`, `default-open` | Collapsible sections                    |
| `::image-frame`            | `caption`, `center`                               | Wraps a screenshot with a caption                 |

Component names are kebab-case in MDC: `::card-group`, `::accordion-group`.

> A component may not be named after an obsolete HTML element. `::frame`, for
> instance, is silently deleted before it ever reaches Vue, because the HTML
> parser strips `<frame>`. That is why the image wrapper is `::image-frame`.

## Images

Screenshots live in `public/images/…` and are referenced with an absolute path:

```md
![Template editor](/images/en/pingo-notify-wordpress-plugin-notification-base-example.png)
```

## Code blocks

Fenced blocks are highlighted by Shiki. Only the languages listed in
`nuxt.config.ts` (`content.build.markdown.highlight.langs`) are available —
add a language there before using it, otherwise the build fails.

## Colours

Never write a raw palette class (`text-slate-600`, `bg-white`, `bg-black/40`) or
a `dark:` variant in a component. The theme is token-driven: use `bg-bg`,
`bg-surface`, `bg-elevated`, `bg-muted`, `bg-accent`, `bg-overlay`, `text-fg`,
`text-fg-muted`, `text-fg-subtle`, `border-line`, and `bg-brand` /
`text-brand-text` / `bg-brand-soft` for the accent. Each of those flips with the
mode on its own. The tokens are defined in `app/assets/css/main.css` and come
from the product itself.

Two of them are easy to reach for wrongly:

- **`bg-brand` is a fill, not a text background.** Anything that puts a label on
  the flat brand — a button, the CTA, the skip link — uses **`bg-brand-solid`**,
  which is the same violet darkened far enough for its label to pass AA.
- **`bg-overlay` bakes its own alpha in.** Write `bg-overlay`, never
  `bg-overlay/40`; the value already differs between light and dark.

## Navigation

The sidebar is **not** generated from the file tree: it is declared in
`app/config/navigation.ts`, mirroring the structure the docs had under
Mintlify. Adding a page means adding its path to the right group there. Titles
and icons are still read from the page's own front matter.

## API reference

The OpenAPI documents in `openapi/<locale>/<version>.json` are rendered by
[Scalar](https://scalar.com/products/api-references/integrations/nuxt) at
`/<locale>/reference/<version>`. They are the source of truth for endpoints —
there are no hand-written endpoint pages. To update the reference, replace the
JSON file and rebuild.

How the endpoints are grouped, labelled and iconified lives in
`app/config/api-sections.ts`. Adding a tag to the API means adding it to a
section there, with an icon; otherwise the build stops and tells you, rather
than letting the tag disappear from the sidebar.
