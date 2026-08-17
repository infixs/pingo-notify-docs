import type { DocLocale } from './scalar'

/**
 * UI chrome strings. Page content itself is translated in `content/<locale>`;
 * this only covers the shell (navigation, search, footer).
 */
export interface UiStrings {
  skipToContent: string
  search: string
  searchPlaceholder: string
  searchEmpty: string
  searchHint: string
  onThisPage: string
  previous: string
  next: string
  language: string
  apiVersion: string
  toggleTheme: string
  lightMode: string
  darkMode: string
  openMenu: string
  closeMenu: string
  navigation: string
  backToDocs: string
  openReference: string
  copy: string
  copied: string
  notFoundTitle: string
  notFoundBody: string
  backHome: string
  footerRights: string
  footerBuiltWith: string
  poweredByScalar: string
}

export const UI: Record<DocLocale, UiStrings> = {
  en: {
    skipToContent: 'Skip to content',
    search: 'Search',
    searchPlaceholder: 'Search the documentation…',
    searchEmpty: 'No results found.',
    searchHint: 'Type to search across every page.',
    onThisPage: 'On this page',
    previous: 'Previous',
    next: 'Next',
    language: 'Language',
    apiVersion: 'API version',
    toggleTheme: 'Toggle theme',
    lightMode: 'Light',
    darkMode: 'Dark',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    navigation: 'Navigation',
    backToDocs: 'Back to the docs',
    openReference: 'Open the API reference',
    copy: 'Copy',
    copied: 'Copied',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The page you are looking for does not exist or has moved.',
    backHome: 'Back to the documentation',
    footerRights: 'All rights reserved.',
    footerBuiltWith: 'Built with Nuxt and Scalar',
    poweredByScalar: 'API reference powered by Scalar',
  },
  'pt-BR': {
    skipToContent: 'Pular para o conteúdo',
    search: 'Buscar',
    searchPlaceholder: 'Buscar na documentação…',
    searchEmpty: 'Nenhum resultado encontrado.',
    searchHint: 'Digite para buscar em todas as páginas.',
    onThisPage: 'Nesta página',
    previous: 'Anterior',
    next: 'Próximo',
    language: 'Idioma',
    apiVersion: 'Versão da API',
    toggleTheme: 'Alternar tema',
    lightMode: 'Claro',
    darkMode: 'Escuro',
    openMenu: 'Abrir navegação',
    closeMenu: 'Fechar navegação',
    navigation: 'Navegação',
    backToDocs: 'Voltar para a documentação',
    openReference: 'Abrir a referência da API',
    copy: 'Copiar',
    copied: 'Copiado',
    notFoundTitle: 'Página não encontrada',
    notFoundBody: 'A página que você procura não existe ou foi movida.',
    backHome: 'Voltar para a documentação',
    footerRights: 'Todos os direitos reservados.',
    footerBuiltWith: 'Feito com Nuxt e Scalar',
    poweredByScalar: 'Referência da API com tecnologia Scalar',
  },
}
