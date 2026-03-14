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
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-8 text-zinc-100 md:px-8">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Fretmap</h1>

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
        </header>

        <ControlPanel />

        <FretboardView />

        <ExportSettingsSection />
      </div>
    </main>
  )
}

export default App
