import { useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { ExportSettingsSection } from './components/ExportSettingsSection'
import { FretboardView } from './components/FretboardView'
import { useI18n } from './i18n/useI18n'
import { isEditableTarget, isRedoShortcutPressed, isUndoShortcutPressed } from './libs/shortcut'
import { initializeHistoryBindings } from './stores/historyBindings'
import { useHistoryStore } from './stores/historyStore'

function App() {
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
    <main className="mx-auto flex w-full max-w-[106rem] flex-1 flex-col gap-6 px-4 pb-8 pt-14 md:px-8">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
        <ControlPanel />

        <FretboardView />

        <ExportSettingsSection />
      </div>
    </main>
  )
}

export default App
