import { DOC_LOCALES, SCALAR_PRERENDER_ROUTES } from '../../app/config/scalar'
import { allContentPaths, LOCALES, translatePath } from '../../app/config/navigation'

/**
 * Built from the navigation config rather than from the content database, so it
 * stays correct for the Scalar reference routes too (those have no Markdown
 * file behind them).
 */
export default defineEventHandler((event) => {
  const siteUrl = (useRuntimeConfig(event).public.siteUrl as string).replace(/\/$/, '')

  const paths = [
    ...DOC_LOCALES.flatMap((locale) => allContentPaths(locale)),
    ...SCALAR_PRERENDER_ROUTES,
  ]

  const urls = paths
    .map((path) => {
      const alternates = LOCALES.map(
        (entry) =>
          `    <xhtml:link rel="alternate" hreflang="${entry.htmlLang}" href="${siteUrl}${translatePath(path, entry.locale)}"/>`,
      ).join('\n')

      return [
        '  <url>',
        `    <loc>${siteUrl}${path}</loc>`,
        alternates,
        '    <changefreq>weekly</changefreq>',
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
})
