# Pingo Notify Docs — Nuxt + Scalar

The Pingo Notify documentation, migrated off Mintlify onto a self-hosted stack:

| Part                | Built with                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Guides              | [Nuxt Content](https://content.nuxt.com) — Markdown with MDC components                              |
| API reference       | [Scalar](https://scalar.com/products/api-references/integrations/nuxt) via `@scalar/nuxt`             |
| Styling             | Tailwind CSS v4 + `@tailwindcss/typography`, on the product's own design tokens                        |
| Icons               | `@nuxt/icon` with the `fa6-solid`, `fa6-brands` and `lucide` collections bundled locally              |
| Output              | Fully static (`nuxt generate`) — no server required                                                   |

Two languages (`en`, `pt-BR`) and two API versions (`v3`, `v2`), exactly as the
Mintlify `docs.json` had them.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script                 | Does                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Dev server with hot reload                                     |
| `npm run generate`     | Static build into `.output/public`                             |
| `npm run preview`      | Serve the built site locally                                   |
| `npm run openapi`      | Rebuild `public/openapi/` from `openapi/` (runs before builds) |
| `npm run check:content`| Lint the Markdown (front matter, MDC blocks, links, anchors, images, icon names) |
| `npm run typecheck`    | `vue-tsc` over the whole project                               |

## URL map

| URL                                     | Serves                                              |
| --------------------------------------- | --------------------------------------------------- |
| `/`                                     | Language redirect (`/en` or `/pt-BR`)               |
| `/en`, `/pt-BR`                         | Documentation home                                  |
| `/en/connections`, `/en/webhooks`, …    | Guides, from `content/en/*.md`                      |
| `/en/api-reference/v3/authentication`   | API prose pages, from `content/en/api-reference/…`  |
| `/en/reference/v3`                      | **Scalar** — the interactive v3 reference           |
| `/en/reference/v3/tag/connections`      | A section of the reference, linked from the sidebar |
| `/en/reference/v2`                      | **Scalar** — the interactive v2 reference           |
| `/sitemap.xml`, `/robots.txt`           | Generated from `app/config/navigation.ts`           |

The `pt-BR` equivalents follow the same shape.

## Layout

```
app/
├── components/          shell (header, sidebar, TOC, search)
│   └── content/         MDC components used inside the Markdown
├── composables/         locale/version context, colour mode, page metadata
├── assets/css/main.css  the Pingo Notify design tokens (see “Theme”)
├── config/
│   ├── api-sections.ts  how the API tags are grouped, labelled and iconified
│   ├── icons.ts         Font Awesome → Iconify name map + the bundled icon list
│   ├── navigation.ts    sidebar structure (the old docs.json navigation block)
│   ├── scalar.ts        one Scalar configuration per language × API version
│   └── ui.ts            UI chrome strings (en / pt-BR)
├── layouts/
│   ├── default.vue      guides: header + sidebar + content + TOC
│   └── reference.vue    Scalar: header + full-height reference
└── pages/
    ├── index.vue        language redirect
    ├── en/[...slug].vue
    └── pt-BR/[...slug].vue
content/
├── en/**.md
└── pt-BR/**.md
openapi/                                 SOURCE OpenAPI documents (edit these)
└── {en,pt-BR}/{v2,v3}.json
scripts/
├── build-openapi.ts                     openapi/ → public/openapi/, applies the taxonomy
└── check-content.mjs                    Markdown linter, runs before every build
public/
├── openapi/{en,pt-BR}/{v2,v3}.json      GENERATED, git-ignored
├── images/  logo/  favicon.svg
└── _redirects                           SPA fallback for the Scalar deep links
```

## Editing the docs

See [AUTHORING.md](./AUTHORING.md) for the MDC component reference and the rules
for adding a page.

## API reference

There are no hand-written endpoint pages: Scalar renders every operation
straight from the OpenAPI document.

**To update it, replace the JSON in `openapi/<locale>/<version>.json`.** The
next build runs `scripts/build-openapi.ts`, which writes the served copy into
`public/openapi/` after applying the taxonomy in `app/config/api-sections.ts`:

- v2 operations are re-tagged by path — the Postman export filed nearly
  everything under `Connections` and left three operations untagged;
- every tag gets an `x-displayName`, so the Portuguese reference reads in
  Portuguese and the English one drops the redundant `Helpdesk · ` prefix;
- `x-tagGroups` folds v3's 33 tags into seven sections (WhatsApp, Workspace,
  Helpdesk, Helpdesk setup, Helpdesk automation, Reports, Platform), which is
  what you see in Scalar's sidebar and under **Endpoints** in the docs sidebar.

WhatsApp leads because it is what most integrators arrive for. Helpdesk is split
in two — the runtime surface (conversations, messages, contacts) apart from the
configuration one (inboxes, teams, labels, filters) — because together they are
91 of the 210 operations, too much for a single sidebar row.

The build **fails** in both directions: if the document declares a tag no section
claims, if a section claims a tag the document does not declare, or if two
sections claim the same tag. So neither a newly added API tag nor a renamed one
can silently vanish from the navigation — fix `app/config/api-sections.ts`
(giving the tag an icon) and the build passes again.

## Theme

`app/assets/css/main.css` carries the product's own design tokens, read from
pingonotify.com: the same OKLCH ramp, the violet `--primary`
(`oklch(60.6% 0.25 292.717)`), the same `0.65rem` radius and the same system
font stack. They are declared once as `--pn-*` custom properties, flip on
`.dark`, and are exposed to Tailwind through `@theme inline` — so components use
`bg-surface`, `text-fg-muted`, `border-line` and never a `dark:` variant.

The same variables are mapped onto Scalar's `--scalar-*` theme in
`app/config/scalar.ts`, which is why the API reference and the guides share one
palette and one theme switch. That mapping includes Scalar's six-colour palette
(`--scalar-color-blue`, `-green`, `-red`, `-yellow`, `-orange`, `-purple`) —
Scalar paints every HTTP method badge and every syntax-highlighting token from
those, so leaving them stock is what makes an otherwise themed reference still
look foreign.

The theme is applied before first paint by the script in
`app/config/color-mode-boot.ts`, registered in `nuxt.config.ts` under
`app.head.script`. It has to be registered statically there rather than through
`useHead()`: the reference routes are `ssr: false`, so a component-level head
entry never reaches their prerendered shell and dark mode starts with a white
flash.

## Deploying

`npm run generate` writes a static site to `.output/public`. Upload it anywhere.

Because the Scalar reference is a client-rendered SPA, its deep links
(`/en/reference/v3/tag/messages`) need a rewrite to the reference's
`index.html`. That is already configured for:

- **Netlify / Cloudflare Pages** — `public/_redirects`
- **Vercel** — `vercel.json`

On any other host, add the equivalent rewrite for the four
`/<locale>/reference/<version>/*` prefixes.

Set `NUXT_PUBLIC_SITE_URL` at build time if the site is not served from
`https://docs.pingonotify.com` — it is used for the sitemap and canonical URLs.
