import { createContext, useContext } from 'react'
import { type AppLocale, type TranslationKey, translate } from './config'

export const LocaleOverrideContext = createContext<AppLocale | undefined>(undefined)

export const useI18n = () => {
  const locale = useContext(LocaleOverrideContext) ?? 'en'

  return {
    locale,
    t: (key: TranslationKey, values?: Record<string, number | string>) =>
      translate(locale, key, values),
  }
}
