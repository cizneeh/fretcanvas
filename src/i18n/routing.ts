import { getRelativeLocaleUrl } from 'astro:i18n'
import type { AppLocale } from './config'

export const getRouteLocale = (locale: string | undefined): AppLocale =>
  locale === 'ja' ? 'ja' : 'en'

export const getAlternateLocale = (locale: AppLocale): AppLocale => (locale === 'ja' ? 'en' : 'ja')

const normalizeRoutePath = (pathname: string): string => {
  if (pathname === '/ja') {
    return '/'
  }

  if (pathname.startsWith('/ja/')) {
    return pathname.slice(3) || '/'
  }

  return pathname || '/'
}

const toLocalizedPathArg = (pathname: string): string | undefined => {
  const normalizedPath = normalizeRoutePath(pathname)
  if (normalizedPath === '/') {
    return undefined
  }

  return normalizedPath.slice(1)
}

const trimTrailingSlash = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

const getLocalizedPath = (locale: AppLocale, path?: string): string =>
  trimTrailingSlash(getRelativeLocaleUrl(locale, path))

export const getAppPath = (locale: AppLocale): string => getLocalizedPath(locale)

export const getAboutPath = (locale: AppLocale): string => getLocalizedPath(locale, 'about')

export const getAlternatePath = (locale: AppLocale, pathname: string): string =>
  getLocalizedPath(getAlternateLocale(locale), toLocalizedPathArg(pathname))
