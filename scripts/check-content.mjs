#!/usr/bin/env node
/**
 * Content linter — runs before the build to catch the mistakes that Markdown
 * silently swallows.
 *
 *   node scripts/check-content.mjs
 *
 * Checks: front matter, MDC block balance, leftover JSX/HTML from the Mintlify
 * era, unknown code-fence languages, unknown components, missing images,
 * unknown icon names, internal links (dead paths, dead `#fragment`s, links that
 * throw the reader into the other language), and navigation entries that point
 * at nothing (or pages nothing points at).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')
const PUBLIC = join(ROOT, 'public')

const ALLOWED_LANGS = new Set([
  'bash', 'css', 'diff', 'handlebars', 'html', 'http', 'ini', 'js', 'json',
  'jsonc', 'markdown', 'php', 'python', 'sql', 'ts', 'vue', 'xml', 'yaml',
])

const ALLOWED_COMPONENTS = new Set([
  'note', 'info', 'tip', 'check', 'warning', 'danger', 'callout',
  'card', 'card-group', 'columns', 'steps', 'step', 'tabs', 'tab',
  'accordion', 'accordion-group', 'image-frame',
])

const FORBIDDEN = [
  ['className=', 'JSX class attribute'],
  ['style={{', 'JSX inline style'],
  ['<div', 'raw <div>'],
  ['<p>', 'raw <p>'],
  ['<ul>', 'raw <ul>'],
  ['<li>', 'raw <li>'],
  ['<img', 'raw <img>'],
  ['<h1>', 'raw heading tag'],
  ['<h2>', 'raw heading tag'],
  ['<h3>', 'raw heading tag'],
  ['<h4>', 'raw heading tag'],
  ['<Card', 'Mintlify component'],
  ['<CardGroup', 'Mintlify component'],
  ['<Columns', 'Mintlify component'],
  ['<Info', 'Mintlify component'],
  ['<Note', 'Mintlify component'],
  ['<Warning', 'Mintlify component'],
  ['<Callout', 'Mintlify component'],
  ['<Steps', 'Mintlify component'],
  ['<Step', 'Mintlify component'],
  ['<Tabs', 'Mintlify component'],
  ['<Tab ', 'Mintlify component'],
  ['<Accordion', 'Mintlify component'],
]

/** Scalar owns these routes; no Markdown file produces them. */
const SCALAR_ROUTE = /^\/(en|pt-BR)\/reference\/(v2|v3)(\/|$)/

const errors = []
const warnings = []

/**
 * github-slugger's rules, inlined. Nuxt Content ids every heading with it, so
 * this is what a `#fragment` link has to match — not worth a dependency.
 */
function slugify(text, counts) {
  const slug = text
    .replace(/\[([^\]]*)\]\([^)\s]*\)/g, '$1') // a link in a heading slugs as its text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N} _-]/gu, '')
    .replace(/ /g, '-')
  const seen = counts.get(slug) ?? 0
  counts.set(slug, seen + 1)
  return seen ? `${slug}-${seen}` : slug
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

/** `content/en/api-reference/v3/index.md` -> `/en/api-reference/v3` */
function routeOf(file) {
  const rel = relative(CONTENT, file).replace(/\\/g, '/')
  const withoutExt = rel.replace(/\.md$/, '')
  const path = withoutExt.replace(/\/index$/, '')
  return `/${path}`
}

const files = existsSync(CONTENT) ? walk(CONTENT) : []
if (!files.length) errors.push('content/: no Markdown files found')

const routes = new Set()
/** route -> heading slugs, for the `#fragment` pass. */
const headings = new Map()
const icons = []
const links = []

for (const file of files) {
  const rel = relative(ROOT, file)
  const raw = readFileSync(file, 'utf8')
  const route = routeOf(file)
  const locale = route.split('/')[1]
  routes.add(route)

  // ---- front matter -------------------------------------------------------
  if (!raw.startsWith('---\n')) {
    errors.push(`${rel}: missing front matter`)
    continue
  }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) {
    errors.push(`${rel}: unterminated front matter`)
    continue
  }
  const frontMatter = raw.slice(4, end)
  const body = raw.slice(end + 4)

  if (!/^title:\s*\S/m.test(frontMatter)) errors.push(`${rel}: front matter has no title`)
  if (/^openapi:/m.test(frontMatter)) {
    errors.push(`${rel}: leftover \`openapi:\` key — Scalar renders endpoints now`)
  }

  const frontIcon = frontMatter.match(/^icon:\s*(.+)$/m)
  if (frontIcon) {
    icons.push({ where: rel, name: frontIcon[1].replace(/\s+#.*$/, '').trim().replace(/^['"]|['"]$/g, '') })
  }

  const lines = body.split('\n')

  // ---- fenced code blocks -------------------------------------------------
  const inFence = new Array(lines.length).fill(false)
  let fence = null
  lines.forEach((line, i) => {
    const open = line.match(/^\s*(`{3,}|~{3,})\s*([A-Za-z0-9+#-]*)/)
    if (fence) {
      inFence[i] = true
      if (open && open[1].startsWith(fence.marker[0]) && open[1].length >= fence.marker.length && !open[2]) {
        fence = null
      }
      return
    }
    if (open) {
      fence = { marker: open[1] }
      inFence[i] = true
      const lang = open[2]
      if (lang && !ALLOWED_LANGS.has(lang)) {
        errors.push(`${rel}:${i + 1}: code fence language "${lang}" is not compiled — add it to nuxt.config.ts`)
      }
    }
  })
  if (fence) errors.push(`${rel}: unterminated code fence`)

  // ---- MDC blocks ---------------------------------------------------------
  const stack = []
  lines.forEach((line, i) => {
    if (inFence[i]) return
    const match = line.match(/^(\s*)(:{2,})(.*)$/)
    if (!match) return
    const [, , colons, rest] = match
    const name = rest.match(/^([a-z][a-z0-9-]*)/)?.[1]

    if (!name) {
      // A bare `::`/`:::` line closes the innermost block of that width.
      if (rest.trim() !== '') return
      const openIndex = [...stack].reverse().findIndex((b) => b.colons === colons.length)
      if (openIndex === -1) {
        errors.push(`${rel}:${i + 1}: "${colons}" closes a block that was never opened`)
      } else {
        stack.splice(stack.length - 1 - openIndex)
      }
      return
    }

    if (!ALLOWED_COMPONENTS.has(name)) {
      errors.push(`${rel}:${i + 1}: unknown component "::${name}" (see AUTHORING.md)`)
    }
    const parent = stack[stack.length - 1]
    if (parent && colons.length >= parent.colons) {
      errors.push(
        `${rel}:${i + 1}: "::${name}" uses ${colons.length} colons inside "::${parent.name}" which uses ${parent.colons} — the outer block needs more`,
      )
    }
    stack.push({ name, colons: colons.length, line: i + 1 })
  })
  for (const block of stack) {
    errors.push(`${rel}:${block.line}: "::${block.name}" is never closed`)
  }

  // ---- leftovers ----------------------------------------------------------
  lines.forEach((line, i) => {
    if (inFence[i]) return
    for (const [needle, label] of FORBIDDEN) {
      if (line.includes(needle)) errors.push(`${rel}:${i + 1}: ${label} — "${needle}"`)
    }
  })

  // ---- headings -----------------------------------------------------------
  const slugs = new Set()
  const slugCounts = new Map()
  lines.forEach((line, i) => {
    if (inFence[i]) return
    if (/^#\s/.test(line)) {
      errors.push(`${rel}:${i + 1}: body starts a new H1 — the page shell already renders the title`)
    }
    const heading = line.match(/^#{2,6}\s+(.*)$/)
    if (heading) slugs.add(slugify(heading[1].trim(), slugCounts))
  })
  headings.set(route, slugs)

  // ---- images -------------------------------------------------------------
  for (const match of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const src = match[1]
    if (src.startsWith('/') && !existsSync(join(PUBLIC, src))) {
      errors.push(`${rel}: image not found in public/ — "${src}"`)
    }
  }

  // ---- icons and links, resolved after the whole tree is known ------------
  lines.forEach((line, i) => {
    if (inFence[i]) return
    for (const match of line.matchAll(/\bicon="([^"]*)"/g)) {
      icons.push({ where: `${rel}:${i + 1}`, name: match[1] })
    }
    for (const match of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      links.push({ rel, line: i + 1, locale, target: match[1] })
    }
    for (const match of line.matchAll(/\b(?:to|href)="([^"]+)"/g)) {
      links.push({ rel, line: i + 1, locale, target: match[1] })
    }
  })
}

// ---- navigation ↔ content -------------------------------------------------
const navPaths = new Set()
try {
  const navSource = readFileSync(join(ROOT, 'app/config/navigation.ts'), 'utf8')
  const slugs = [...navSource.matchAll(/p\('([^']*)'\)/g)].map((m) => m[1])
  for (const locale of ['en', 'pt-BR']) {
    for (const slug of slugs) navPaths.add(slug ? `/${locale}/${slug}` : `/${locale}`)
    for (const version of ['v3', 'v2']) {
      const base = `/${locale}/api-reference/${version}`
      navPaths.add(base)
      navPaths.add(`${base}/authentication`)
      navPaths.add(`${base}/webhooks`)
      if (version === 'v3') {
        navPaths.add(`${base}/conventions`)
        navPaths.add(`${base}/realtime`)
      }
    }
  }
} catch {
  warnings.push('app/config/navigation.ts could not be read — skipped the navigation cross-check')
}

for (const path of navPaths) {
  if (!routes.has(path)) errors.push(`navigation points at "${path}" but no Markdown file produces it`)
}
for (const route of routes) {
  if (!navPaths.has(route)) warnings.push(`"${route}" exists but is not in the sidebar navigation`)
}

// ---- icons ↔ config -------------------------------------------------------
// `resolveIcon()` is total: an unknown name falls through to `fa6-solid:<raw>`,
// renders as an empty box and is missing from the client bundle.
try {
  const iconSource = readFileSync(join(ROOT, 'app/config/icons.ts'), 'utf8')
  const aliases = iconSource.match(/ICON_ALIASES[^=]*=\s*\{([\s\S]*?)\n\}/)
  const faSolid = iconSource.match(/ICON_FA_SOLID[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (!aliases || !faSolid) throw new Error('ICON_ALIASES / ICON_FA_SOLID not found')

  const known = new Set([
    ...[...aliases[1].matchAll(/^\s*'([^']+)'\s*:/gm)].map((m) => m[1]),
    ...[...faSolid[1].matchAll(/'([^']+)'/g)].map((m) => m[1]),
  ])
  for (const icon of icons) {
    if (icon.name.includes(':')) continue // already an Iconify identifier
    if (!known.has(icon.name)) {
      errors.push(
        `${icon.where}: unknown icon "${icon.name}" — add it to ICON_FA_SOLID or ICON_ALIASES in app/config/icons.ts`,
      )
    }
  }
} catch {
  warnings.push('app/config/icons.ts could not be read — skipped the icon-name check')
}

// ---- links ----------------------------------------------------------------
for (const { rel, line, locale, target } of links) {
  // Only in-site links are ours to check; the product app is matched too,
  // because its locale prefix is the same reader-facing mistake.
  const site = target.match(/^https?:\/\/pingonotify\.com(\/[^?#]*)?/)
  const path = site ? (site[1] ?? '') : target
  if (!path.startsWith('/')) continue // other hosts, mailto:, tel:, same-page #fragment

  // Screenshots are filed one level deeper: `/images/<locale>/…`.
  const parts = path.split('/')
  const segment = parts[1] === 'images' ? parts[2] : parts[1]
  if ((segment === 'en' || segment === 'pt-BR') && segment !== locale) {
    const message = `${rel}:${line}: a ${locale} page points at ${segment} — "${target}"`
    // A screenshot may sit on the English capture until a localised one is
    // taken; a link cannot, it drops the reader out of their language.
    if (path.startsWith('/images/')) warnings.push(message)
    else errors.push(message)
    continue
  }
  if (site || path.startsWith('/images/')) continue // the app's routes / the image pass owns these

  // Split the fragment off first, or every valid anchor link reads as dead.
  const hash = path.indexOf('#')
  const route = hash === -1 ? path : path.slice(0, hash)
  const fragment = hash === -1 ? '' : path.slice(hash + 1)

  if (!routes.has(route) && !SCALAR_ROUTE.test(route)) {
    errors.push(`${rel}:${line}: link points at "${route}" but no Markdown file produces it`)
    continue
  }
  if (fragment && routes.has(route) && !headings.get(route).has(fragment)) {
    errors.push(`${rel}:${line}: link points at "#${fragment}" but "${route}" has no such heading`)
  }
}

// ---- report ---------------------------------------------------------------
for (const warning of warnings) console.warn(`  warn  ${warning}`)
for (const error of errors) console.error(`  error ${error}`)

console.log(
  `\n${files.length} pages checked — ${errors.length} error(s), ${warnings.length} warning(s)`,
)
process.exit(errors.length ? 1 : 0)
