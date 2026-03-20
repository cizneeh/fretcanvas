import { defineMiddleware } from 'astro:middleware'
import { type AppLocale, LOCALE_COOKIE_KEY } from './i18n/config'

const getPathLocale = (pathname: string): AppLocale | undefined => {
  if (pathname === '/ja' || pathname.startsWith('/ja/')) {
    return 'ja'
  }

  if (pathname === '/' || pathname === '/about') {
    return 'en'
  }

  return undefined
}

const getJapaneseRedirectPath = (pathname: string): string | undefined => {
  if (pathname === '/') {
    return '/ja'
  }

  if (pathname === '/about') {
    return '/ja/about'
  }

  return undefined
}

const isPreferredJapanese = (acceptLanguageHeader: string | null): boolean => {
  if (acceptLanguageHeader === null) {
    return false
  }

  const preferredLanguage = acceptLanguageHeader
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .sort((left, right) => {
      const leftWeight = Number(left.split(';q=')[1] ?? '1')
      const rightWeight = Number(right.split(';q=')[1] ?? '1')
      return rightWeight - leftWeight
    })[0]

  return preferredLanguage?.startsWith('ja') ?? false
}

// middleware.tsからリクエストすれば勝手にastroが登録してくれるらしい。
// あんま好きじゃないなこれ
export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, url } = context
  const { pathname } = url

  const pathLocale = getPathLocale(pathname)
  const localeCookie = cookies.get(LOCALE_COOKIE_KEY)?.value

  // cookie が未設定のリクエストでだけ Accept-Language を見て日本語URLへリダイレクトする。
  // cookie は言語切替時のクライアント側処理でも、言語付きURLのレスポンス時にも更新される。
  // そのため一度でも言語が確定した後は、以後の判定は cookie と URL が基準になる。
  if (localeCookie === undefined) {
    const japaneseRedirectPath = getJapaneseRedirectPath(pathname)

    if (
      japaneseRedirectPath !== undefined &&
      isPreferredJapanese(request.headers.get('accept-language'))
    ) {
      cookies.set(LOCALE_COOKIE_KEY, 'ja', {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      })

      return context.redirect(japaneseRedirectPath, 302)
    }
  }

  const response = await next()

  if (pathLocale !== undefined) {
    cookies.set(LOCALE_COOKIE_KEY, pathLocale, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
})
