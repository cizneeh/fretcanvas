import { useEffect, useState } from 'react'
import { type AppLocale, LOCALE_STORAGE_KEY, persistLocalePreference } from '../../i18n/config'
import { useSettingsStore } from '../../stores/settingsStore'
import { m3SegmentedButtonClass, m3SegmentedContainerClass } from '../ui/materialClasses'

type LanguageSwitchProps = {
  initialLocale: AppLocale
  pageKind: 'app' | 'about'
  aboutPath: string
}

const getStoredLocale = (): AppLocale | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return storedLocale === 'ja' || storedLocale === 'en' ? storedLocale : undefined
}

export function LanguageSwitch({ initialLocale, pageKind, aboutPath }: LanguageSwitchProps) {
  const appLocale = useSettingsStore((state) => state.locale)
  const setAppLocale = useSettingsStore((state) => state.setLocale)
  const [aboutLocale, setAboutLocale] = useState<AppLocale>(initialLocale)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeLocale = pageKind === 'app' ? (isMounted ? appLocale : initialLocale) : aboutLocale

  useEffect(() => {
    if (pageKind !== 'app') {
      return
    }

    const nextLocale = getStoredLocale() ?? appLocale
    const aboutLink = document.getElementById('shell-about-link')
    if (aboutLink instanceof HTMLAnchorElement) {
      aboutLink.href = nextLocale === 'ja' ? '/ja/about' : aboutPath
    }
  }, [appLocale, aboutPath, pageKind])

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (pageKind === 'app') {
      setAppLocale(nextLocale)
      document.documentElement.lang = nextLocale

      const aboutLink = document.getElementById('shell-about-link')
      if (aboutLink instanceof HTMLAnchorElement) {
        aboutLink.href = nextLocale === 'ja' ? '/ja/about' : aboutPath
      }
      return
    }

    if (nextLocale === aboutLocale) {
      return
    }

    persistLocalePreference(nextLocale)
    setAboutLocale(nextLocale)
    document.documentElement.lang = nextLocale
    window.location.href = nextLocale === 'ja' ? '/ja/about' : '/en/about'
  }

  return (
    <fieldset className={m3SegmentedContainerClass}>
      <legend className="sr-only">Language</legend>
      <button
        type="button"
        aria-pressed={activeLocale === 'en'}
        className={m3SegmentedButtonClass(activeLocale === 'en')}
        aria-label="Switch language to English"
        onClick={() => {
          handleLocaleChange('en')
        }}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={activeLocale === 'ja'}
        className={m3SegmentedButtonClass(activeLocale === 'ja')}
        aria-label="Switch language to Japanese"
        onClick={() => {
          handleLocaleChange('ja')
        }}
      >
        JA
      </button>
    </fieldset>
  )
}
