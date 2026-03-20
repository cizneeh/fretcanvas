import { useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { ExportSettingsSection } from './components/ExportSettingsSection'
import { FretboardView } from './components/FretboardView'
import type { AppLocale } from './i18n/config'
import { LocaleOverrideContext, useI18n } from './i18n/useI18n'
import { isEditableTarget, isRedoShortcutPressed, isUndoShortcutPressed } from './libs/shortcut'
import { initializeHistoryBindings } from './stores/historyBindings'
import { useHistoryStore } from './stores/historyStore'

// SSR時点で、/は日本語、/jaは日本語のHTMLを打sう必要がある
// そのため、サーバーサイドで言語情報を渡す必要があるため、propsになっている
type AppProps = {
  initialLocale: AppLocale
}

function App({ initialLocale }: AppProps) {
  return (
    <LocaleOverrideContext.Provider value={initialLocale}>
      <AppBody />
    </LocaleOverrideContext.Provider>
  )
}

function AppBody() {
  const { locale } = useI18n()

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
    <div className="mx-auto flex w-full min-w-0 max-w-[106rem] flex-1 flex-col gap-6 pt-10">
      <ControlPanel />

      <FretboardView />

      <ExportSettingsSection />
    </div>
  )
}

export default App
