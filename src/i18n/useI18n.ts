import { useSettingsStore } from '../stores/settingsStore'
import { type TranslationKey, translate } from './config'

export const useI18n = () => {
  const locale = useSettingsStore((state) => state.locale)

  return {
    locale,
    t: (key: TranslationKey, values?: Record<string, number | string>) =>
      translate(locale, key, values),
  }
}
