import type { ApiVersion, DocLocale } from './scalar'

/**
 * The taxonomy of the API reference.
 *
 * The raw OpenAPI documents in `openapi/` are flat: v3 has 33 tags (18 of them
 * prefixed `Helpdesk · `), and v2 dumps almost every operation into a single
 * `Connections` tag. This file is the single source of truth for turning that
 * into a browsable hierarchy, and it is consumed twice:
 *
 *  - `scripts/build-openapi.ts` writes `x-tagGroups` and `x-displayName` into
 *    the documents Scalar renders, which drives the reference's own sidebar;
 *  - `app/config/navigation.ts` lists the same sections, with icons, under
 *    "Endpoints" in the docs sidebar.
 *
 * Both read the array in order, so the order below *is* the sidebar order —
 * in Scalar and in the docs shell alike. Same for the tags inside a section.
 *
 * Tag **names** are never rewritten — operations reference them, and Scalar
 * derives its anchors from them (`/tag/{slugified name}`). Only the displayed
 * label changes, through `x-displayName`.
 */

export interface ApiSection {
  /** Stable id, also used for the icon lookup. */
  id: string
  /** Mintlify/Iconify icon name, resolved through `app/config/icons.ts`. */
  icon: string
  label: Record<DocLocale, string>
  /** Tag names, in the order they should appear. */
  tags: string[]
}

/**
 * Anchor slug Scalar generates for a tag name. Mirrors `@scalar/helpers`
 * `slugify()` on its defaults, which normalise to NFC and **keep** accents. A
 * localised tag name must not be transliterated here, or the deep link in
 * `navigation.ts` points at an anchor Scalar never rendered.
 */
export function tagSlug(tagName: string): string {
  return tagName
    .slice(0, 255)
    .trim()
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const V3_SECTIONS: ApiSection[] = [
  // WhatsApp leads: it is what an integrator arrives for, and it mirrors the
  // guides, where Connections is the first feature page.
  {
    id: 'whatsapp',
    icon: 'whatsapp',
    label: { en: 'WhatsApp', 'pt-BR': 'WhatsApp' },
    tags: ['Connections', 'Sync session', 'Chats', 'Messages', 'Templates', 'Campaigns'],
  },
  {
    id: 'workspace',
    icon: 'layer-group',
    label: { en: 'Workspace', 'pt-BR': 'Workspace' },
    tags: ['Accounts', 'Members', 'Invitations', 'API tokens', 'OAuth apps'],
  },
  // The helpdesk is 91 of the 210 operations, so it is split in two: what you
  // call while handling a conversation, and what you set up once. A section is
  // one sidebar row deep-linking to its first tag only, and twelve tags behind
  // `Conversations` hid the other eleven.
  {
    id: 'helpdesk',
    icon: 'life-buoy',
    label: { en: 'Helpdesk', 'pt-BR': 'Helpdesk' },
    tags: [
      'Helpdesk · Conversations',
      'Helpdesk · Messages',
      'Helpdesk · Contacts',
      'Helpdesk · Notifications',
      'Helpdesk · Sync',
    ],
  },
  {
    id: 'helpdesk-setup',
    icon: 'gear',
    label: { en: 'Helpdesk setup', 'pt-BR': 'Configuração do Helpdesk' },
    tags: [
      'Helpdesk · Inboxes',
      'Helpdesk · Teams',
      'Helpdesk · Agents',
      'Helpdesk · Labels',
      'Helpdesk · Canned responses',
      'Helpdesk · Custom attributes',
      'Helpdesk · Custom filters',
    ],
  },
  {
    id: 'helpdesk-automation',
    icon: 'robot',
    label: { en: 'Helpdesk automation', 'pt-BR': 'Automação do Helpdesk' },
    tags: ['Helpdesk · Agent bots', 'Helpdesk · SLA', 'Helpdesk · Webhooks', 'Helpdesk · AI'],
  },
  {
    id: 'reports',
    icon: 'chart',
    label: { en: 'Reports', 'pt-BR': 'Relatórios' },
    tags: ['Helpdesk · Reports', 'Helpdesk · CSAT', 'Stats'],
  },
  {
    id: 'platform',
    icon: 'plug',
    label: { en: 'Platform', 'pt-BR': 'Plataforma' },
    tags: ['Webhooks', 'Integrations', 'Billing'],
  },
]

/**
 * v2 is small enough that a second level of nesting would only add clicks:
 * these sections map one-to-one onto its tags, and `GROUPED` keeps
 * `x-tagGroups` out of the document so Scalar lists them flat.
 */
const V2_SECTIONS: ApiSection[] = [
  {
    id: 'connections',
    icon: 'qrcode',
    label: { en: 'Connections', 'pt-BR': 'Conexões' },
    tags: ['Connections'],
  },
  {
    id: 'chats',
    icon: 'comments',
    label: { en: 'Chats', 'pt-BR': 'Conversas' },
    tags: ['Chats'],
  },
  {
    id: 'messages',
    icon: 'paper-plane',
    label: { en: 'Messages', 'pt-BR': 'Mensagens' },
    tags: ['Messages'],
  },
  {
    id: 'templates',
    icon: 'square-envelope',
    label: { en: 'Templates', 'pt-BR': 'Templates' },
    tags: ['Templates'],
  },
  {
    id: 'verifications',
    icon: 'list-check',
    label: { en: 'Verifications', 'pt-BR': 'Verificações' },
    tags: ['Verifications'],
  },
]

/** Whether the document gets `x-tagGroups`. Only worth it once tags pile up. */
export const GROUPED: Record<ApiVersion, boolean> = {
  v3: true,
  v2: false,
}

export const API_SECTIONS: Record<ApiVersion, ApiSection[]> = {
  v3: V3_SECTIONS,
  v2: V2_SECTIONS,
}

/**
 * Per-tag icons for Scalar's own sidebar. Keyed by the raw tag name, so it is
 * language-independent. A tag with no entry falls back to its section's icon.
 */
export const TAG_ICONS: Record<string, string> = {
  // WhatsApp
  'Connections': 'qrcode',
  'Sync session': 'arrows-rotate',
  'Chats': 'comments',
  'Messages': 'paper-plane',
  'Templates': 'square-envelope',
  'Campaigns': 'bullhorn',

  // Workspace
  'Accounts': 'building',
  'Members': 'users',
  'Invitations': 'envelope-open',
  'API tokens': 'key',
  'OAuth apps': 'shield',

  // Helpdesk
  'Helpdesk · Conversations': 'comments',
  'Helpdesk · Messages': 'paper-plane',
  'Helpdesk · Contacts': 'address-book',
  'Helpdesk · Notifications': 'bell',
  'Helpdesk · Sync': 'arrows-rotate',

  // Helpdesk setup
  'Helpdesk · Inboxes': 'inbox',
  'Helpdesk · Teams': 'users',
  'Helpdesk · Agents': 'headset',
  'Helpdesk · Labels': 'tag',
  'Helpdesk · Canned responses': 'bolt',
  'Helpdesk · Custom attributes': 'sliders',
  'Helpdesk · Custom filters': 'filter',

  // Helpdesk automation
  'Helpdesk · Agent bots': 'robot',
  'Helpdesk · SLA': 'timer',
  'Helpdesk · Webhooks': 'webhook',
  'Helpdesk · AI': 'sparkles',

  // Reports
  'Helpdesk · Reports': 'chart',
  'Helpdesk · CSAT': 'star',
  'Stats': 'chart-line',

  // Platform
  'Webhooks': 'webhook',
  'Integrations': 'puzzle',
  'Billing': 'credit-card',

  // v2 only
  'Verifications': 'list-check',
}

/**
 * Labels shown in place of the raw tag name. English mostly drops the
 * `Helpdesk · ` prefix (the group already says it); Portuguese translates,
 * matching the tag descriptions which are already localised.
 */
export const TAG_DISPLAY_NAMES: Record<DocLocale, Record<string, string>> = {
  en: {
    'Accounts': 'Workspaces',
    'Helpdesk · Conversations': 'Conversations',
    'Helpdesk · Messages': 'Messages',
    'Helpdesk · Contacts': 'Contacts',
    'Helpdesk · Inboxes': 'Inboxes',
    'Helpdesk · Teams': 'Teams',
    'Helpdesk · Agents': 'Agents',
    'Helpdesk · Labels': 'Labels',
    'Helpdesk · Canned responses': 'Canned responses',
    'Helpdesk · Custom attributes': 'Custom attributes',
    'Helpdesk · Custom filters': 'Saved filters',
    'Helpdesk · Agent bots': 'Agent bots',
    'Helpdesk · AI': 'AI',
    'Helpdesk · SLA': 'SLA',
    'Helpdesk · Reports': 'Reports',
    'Helpdesk · CSAT': 'CSAT',
    'Helpdesk · Notifications': 'Notifications',
    'Helpdesk · Webhooks': 'Webhooks',
    'Helpdesk · Sync': 'Sync',
    'Stats': 'Usage',
  },
  'pt-BR': {
    'Accounts': 'Workspaces',
    'Members': 'Membros',
    'Invitations': 'Convites',
    'API tokens': 'Tokens de API',
    'OAuth apps': 'Apps OAuth',
    'Connections': 'Conexões',
    'Sync session': 'Sessão de sincronização',
    'Chats': 'Conversas',
    'Messages': 'Mensagens',
    'Templates': 'Templates',
    'Campaigns': 'Campanhas',
    'Webhooks': 'Webhooks',
    'Integrations': 'Integrações',
    'Billing': 'Cobrança',
    'Stats': 'Uso',
    'Verifications': 'Verificações',
    'Helpdesk · Conversations': 'Conversas',
    'Helpdesk · Messages': 'Mensagens',
    'Helpdesk · Contacts': 'Contatos',
    'Helpdesk · Inboxes': 'Caixas de entrada',
    'Helpdesk · Teams': 'Times',
    'Helpdesk · Agents': 'Agentes',
    'Helpdesk · Labels': 'Etiquetas',
    'Helpdesk · Canned responses': 'Respostas rápidas',
    'Helpdesk · Custom attributes': 'Atributos personalizados',
    'Helpdesk · Custom filters': 'Filtros salvos',
    'Helpdesk · Agent bots': 'Bots de atendimento',
    'Helpdesk · AI': 'IA',
    'Helpdesk · SLA': 'SLA',
    'Helpdesk · Reports': 'Relatórios',
    'Helpdesk · CSAT': 'CSAT',
    'Helpdesk · Notifications': 'Notificações',
    'Helpdesk · Webhooks': 'Webhooks',
    'Helpdesk · Sync': 'Sincronização',
  },
}

/**
 * v2 was converted from a Postman collection: it has no `tags` array, three
 * operations carry no tag at all, and everything else was filed under
 * `Connections`. This re-files each operation by path, restoring the grouping
 * the Mintlify sidebar used to show by hand.
 */
export const V2_OPERATION_TAGS: Array<{ match: RegExp; tag: string }> = [
  { match: /^\/v2\/connections\/chats\/messages\/\{wamid\}\/download$/, tag: 'Messages' },
  { match: /^\/v2\/connections\/\{id\}\/chats\/\{remoteJid\}\/messages/, tag: 'Messages' },
  { match: /^\/v2\/connections\/\{id\}\/chats\/\{remoteJid\}\/presence$/, tag: 'Chats' },
  { match: /^\/v2\/connections\/\{id\}\/chats$/, tag: 'Chats' },
  { match: /^\/v2\/connections\/\{id\}\/templates/, tag: 'Templates' },
  { match: /check\/whatsapp$/, tag: 'Verifications' },
  { match: /^\/v2\/connections/, tag: 'Connections' },
]

export const V2_TAG_DESCRIPTIONS: Record<DocLocale, Record<string, string>> = {
  en: {
    Connections: 'WhatsApp sessions — create, pair with a QR code, update and log out.',
    Chats: 'Reading chats on a connection, and sending presence.',
    Messages: 'Sending and reading messages, and downloading their media.',
    Templates: 'The message templates available on a connection.',
    Verifications: 'Checking whether a number is reachable on WhatsApp.',
  },
  'pt-BR': {
    Connections: 'Sessões de WhatsApp — criar, parear por QR Code, atualizar e desconectar.',
    Chats: 'Ler conversas em uma conexão e enviar presença.',
    Messages: 'Enviar e ler mensagens, e baixar suas mídias.',
    Templates: 'Os templates de mensagem disponíveis em uma conexão.',
    Verifications: 'Checar se um número está disponível no WhatsApp.',
  },
}
