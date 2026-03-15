import { useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { ExportSettingsSection } from './components/ExportSettingsSection'
import { FretboardView } from './components/FretboardView'
import { m3SegmentedButtonClass, m3SegmentedContainerClass } from './components/ui/materialClasses'
import { useI18n } from './i18n/useI18n'
import { isEditableTarget, isRedoShortcutPressed, isUndoShortcutPressed } from './libs/shortcut'
import { initializeHistoryBindings } from './stores/historyBindings'
import { useHistoryStore } from './stores/historyStore'
import { useSettingsStore } from './stores/settingsStore'

const WEBSITE_URL = 'https://echizen.me'

function App() {
  const { locale, t } = useI18n()
  const setLocale = useSettingsStore((state) => state.setLocale)

  useEffect(() => {
    initializeHistoryBindings()
  }, [])

  const undo = useHistoryStore((state) => state.undo)
  const redo = useHistoryStore((state) => state.redo)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (isUndoShortcutPressed(event.key, event.metaKey, event.ctrlKey, event.shiftKey)) {
        event.preventDefault()
        undo()
        return
      }

      if (isRedoShortcutPressed(event.key, event.metaKey, event.ctrlKey, event.shiftKey)) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [undo, redo])

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-8 text-zinc-100 md:px-8">
      <header className="fixed inset-x-0 top-0 z-30 bg-[color:var(--md-sys-color-surface-container-low)]/42 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[106rem] items-center justify-between gap-4 px-4 py-2 md:px-8">
          <h1 className="text-xl font-medium tracking-tight text-zinc-100/92">Fret Canvas</h1>

          <fieldset className={m3SegmentedContainerClass}>
            <legend className="sr-only">{t('app.language')}</legend>
            <button
              type="button"
              aria-pressed={locale === 'en'}
              className={m3SegmentedButtonClass(locale === 'en')}
              aria-label={t('app.switchToEnglish')}
              onClick={() => {
                setLocale('en')
              }}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={locale === 'ja'}
              className={m3SegmentedButtonClass(locale === 'ja')}
              aria-label={t('app.switchToJapanese')}
              onClick={() => {
                setLocale('ja')
              }}
            >
              JA
            </button>
          </fieldset>
        </div>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-[106rem] flex-1 flex-col gap-6 pt-10">
        <ControlPanel />

        <FretboardView />

        <ExportSettingsSection />
      </div>

      <footer
        className="mx-auto mt-10 flex w-full max-w-[106rem] items-center gap-3 border-t px-1 pt-4 text-sm text-[color:var(--md-sys-color-on-surface-variant)]"
        style={{
          borderTopColor:
            'color-mix(in srgb, var(--md-sys-color-outline-variant) 90%, transparent)',
        }}
      >
        <p>
          Made by{' '}
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            className="m3-focus-ring underline decoration-[color:var(--md-sys-color-outline)] underline-offset-4 transition-colors duration-150 hover:text-[color:var(--md-sys-color-on-surface)] hover:decoration-[color:var(--md-sys-color-on-surface)]"
          >
            Shinjiro Echizen
          </a>
        </p>
      </footer>
    </main>
  )
}

export default App
