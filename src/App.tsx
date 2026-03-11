import { useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { FretboardView } from './components/FretboardView'
import { isEditableTarget, isRedoShortcutPressed, isUndoShortcutPressed } from './libs/shortcut'
import { initializeHistoryBindings } from './stores/historyBindings'
import { useHistoryStore } from './stores/historyStore'

function App() {
  useEffect(() => {
    initializeHistoryBindings()
  }, [])

  const undo = useHistoryStore((state) => state.undo)
  const redo = useHistoryStore((state) => state.redo)

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
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Fretmap</h1>
          <p className="text-sm text-zinc-300">
            Key基準の度数でノートを表示します。クリックで手動追加、スケールは一括追加です。
          </p>
        </header>

        <ControlPanel />

        <FretboardView />
      </div>
    </main>
  )
}

export default App
