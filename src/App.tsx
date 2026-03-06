import { ControlPanel } from './components/ControlPanel'
import { FretboardView } from './components/FretboardView'

function App() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Fretmap</h1>
          <p className="text-sm text-slate-300">
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
