import { useState } from 'react'
import { type AppLocale, persistLocalePreference } from '../../i18n/config'
import { m3SegmentedButtonClass, m3SegmentedContainerClass } from '../ui/materialClasses'

type LanguageSwitchProps = {
  currentPath: string
  initialLocale: AppLocale
  alternatePath: string
}

export function LanguageSwitch({ currentPath, initialLocale, alternatePath }: LanguageSwitchProps) {
  const [activeLocale, setActiveLocale] = useState<AppLocale>(initialLocale)

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (nextLocale === activeLocale) {
      return
    }

    persistLocalePreference(nextLocale)
    setActiveLocale(nextLocale)
    document.documentElement.lang = nextLocale
    window.location.href =
      currentPath.startsWith('/ja') && nextLocale === 'ja' ? currentPath : alternatePath
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
