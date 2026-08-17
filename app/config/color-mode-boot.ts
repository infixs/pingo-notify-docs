/**
 * The pre-paint color mode script, as a string for `app.head.script`.
 *
 * It lives here — and is registered statically in `nuxt.config.ts` — rather
 * than in `app.vue`'s `useHead()`, because `routeRules` marks both reference
 * prefixes `ssr: false`: `app.vue` never runs on the server for those shells,
 * nor for `200.html` / `404.html`, so a `useHead()` script is simply absent
 * from their `<head>` and every dark-mode visit to the API reference starts on
 * a white page. Static `app.head` entries do reach them.
 *
 * It also seeds Scalar's own `colorMode` key with the *resolved* literal,
 * because Scalar's boot script fires later (at body close) and would otherwise
 * fall back to its configured default on the reference pages.
 *
 * Runs in `<head>`, so `document.body` is still null — only
 * `document.documentElement` may be touched. Nothing is written back to
 * `pingo-docs-color-mode`: that key stays empty until the user actually picks a
 * mode, so an unset preference keeps following the OS.
 */
export const COLOR_MODE_BOOT = `
(function () {
  try {
    var stored = localStorage.getItem('pingo-docs-color-mode');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = dark ? 'dark' : 'light';
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('colorMode', mode);
  } catch (e) {}
})();
`
