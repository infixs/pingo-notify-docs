#!/usr/bin/env node
/**
 * Builds the OpenAPI documents Scalar renders.
 *
 *   openapi/<locale>/<version>.json   → source, replace this to update the API
 *   public/openapi/<locale>/<version>.json → generated, served to Scalar
 *
 * The transform applies the taxonomy in `app/config/api-sections.ts`:
 *
 *  - v2 operations are re-tagged by path (the Postman export filed almost
 *    everything under `Connections` and left three operations untagged);
 *  - every tag gets an `x-displayName` so the sidebar reads in the page's
 *    language and drops the redundant `Helpdesk · ` prefix;
 *  - `x-tagGroups` turns the flat tag list into the sections the docs sidebar
 *    also links to.
 *
 * The run fails if the document contains a tag no section claims — and if a
 * section claims a tag the document does not declare — so a new API tag can
 * never silently disappear from the reference's navigation, and a renamed one
 * can never leave a dead row behind.
 *
 * Run with `node scripts/build-openapi.ts` (Node strips the types natively).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  API_SECTIONS,
  GROUPED,
  TAG_DISPLAY_NAMES,
  V2_OPERATION_TAGS,
  V2_TAG_DESCRIPTIONS,
} from '../app/config/api-sections.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES = ['en', 'pt-BR'] as const
const VERSIONS = ['v3', 'v2'] as const

const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

type Json = Record<string, any>

let failures = 0

/** Re-file every v2 operation onto the tag its path belongs to. */
function retagV2(document: Json): Map<string, number> {
  const counts = new Map<string, number>()

  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item as Json)) {
      if (!HTTP_METHODS.has(method)) continue
      const rule = V2_OPERATION_TAGS.find((candidate) => candidate.match.test(path))
      if (!rule) {
        console.error(`  error no tag rule matches ${method.toUpperCase()} ${path}`)
        failures++
        continue
      }
      ;(operation as Json).tags = [rule.tag]
      counts.set(rule.tag, (counts.get(rule.tag) ?? 0) + 1)
    }
  }

  return counts
}

/** Tags actually referenced by at least one operation. */
function usedTags(document: Json): Set<string> {
  const used = new Set<string>()
  for (const item of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item as Json)) {
      if (!HTTP_METHODS.has(method)) continue
      for (const tag of (operation as Json).tags ?? []) used.add(tag)
    }
  }
  return used
}

function build(locale: (typeof LOCALES)[number], version: (typeof VERSIONS)[number]) {
  const source = join(ROOT, 'openapi', locale, `${version}.json`)
  const target = join(ROOT, 'public', 'openapi', locale, `${version}.json`)
  const document: Json = JSON.parse(readFileSync(source, 'utf8'))
  const sections = API_SECTIONS[version]

  if (version === 'v2') {
    const counts = retagV2(document)
    document.tags = sections
      .flatMap((section) => section.tags)
      .filter((tag) => counts.has(tag))
      .map((tag) => ({
        name: tag,
        description: V2_TAG_DESCRIPTIONS[locale][tag],
      }))
  }

  const declared: Json[] = document.tags ?? []
  const declaredNames = new Set(declared.map((tag) => tag.name))
  const referenced = usedTags(document)

  // A tag on an operation but missing from `tags` renders without a description.
  for (const tag of referenced) {
    if (!declaredNames.has(tag)) {
      console.error(`  error ${locale}/${version}: operations use tag "${tag}" but it is not declared`)
      failures++
    }
  }

  // A tag no section claims would vanish from the grouped sidebar.
  const claimed = new Set(sections.flatMap((section) => section.tags))
  for (const tag of declaredNames) {
    if (!claimed.has(tag)) {
      console.error(
        `  error ${locale}/${version}: tag "${tag}" belongs to no section — add it to app/config/api-sections.ts`,
      )
      failures++
    }
  }

  // The reverse: a tag a section lists but the document never declares is
  // filtered out of `x-tagGroups` below, while `navigation.ts` still deep-links
  // to it — a dead sidebar row with the build green. Claiming a tag twice puts
  // the same operations under two sections.
  const seen = new Set<string>()
  for (const section of sections) {
    for (const tag of section.tags) {
      if (seen.has(tag)) {
        console.error(`  error ${locale}/${version}: tag "${tag}" is claimed by more than one section`)
        failures++
      }
      seen.add(tag)
      if (!declaredNames.has(tag)) {
        console.error(
          `  error ${locale}/${version}: section "${section.id}" lists tag "${tag}", which the document does not declare`,
        )
        failures++
      }
    }
  }

  // Localised / shortened labels.
  const displayNames = TAG_DISPLAY_NAMES[locale]
  for (const tag of declared) {
    const label = displayNames[tag.name]
    if (label && label !== tag.name) tag['x-displayName'] = label
    else delete tag['x-displayName']
  }

  // Sections, skipping any that ended up empty for this document. Small
  // documents stay flat: a group holding a single identically named tag would
  // just be an extra row to click through.
  if (GROUPED[version]) {
    document['x-tagGroups'] = sections
      .map((section) => ({
        name: section.label[locale],
        tags: section.tags.filter((tag) => declaredNames.has(tag)),
      }))
      .filter((group) => group.tags.length > 0)
  } else {
    delete document['x-tagGroups']
  }

  // Keep `tags` in section order so the ungrouped views agree with the sidebar.
  const order = sections.flatMap((section) => section.tags)
  document.tags = [...declared].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))

  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`)

  const groups = (document['x-tagGroups'] ?? []) as Array<{ name: string; tags: string[] }>
  console.log(
    groups.length
      ? `  ${locale}/${version}: ${referenced.size} tags → ${groups.length} sections ` +
          `(${groups.map((group) => `${group.name}:${group.tags.length}`).join(', ')})`
      : `  ${locale}/${version}: ${referenced.size} tags, ungrouped`,
  )
}

console.log('Building OpenAPI documents')
for (const locale of LOCALES) {
  for (const version of VERSIONS) build(locale, version)
}

if (failures) {
  console.error(`\n${failures} problem(s) — see above`)
  process.exit(1)
}
console.log('\nOpenAPI documents written to public/openapi')
