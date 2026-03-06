import { ControlPanel } from './components/ControlPanel'
import { FretboardView } from './components/FretboardView'
import { useFretboardState } from './hooks/useFretboardState'

function App() {
  const {
    keyPc,
    selectedScale,
    highlightedPositions,
    setKeyPc,
    setSelectedScale,
    addScaleNotes,
    clearHighlightedNotes,
    togglePosition,
    exportFretStart,
    exportFretEnd,
    backgroundOpacityPercent,
    handleExportFretStartChange,
    handleExportFretEndChange,
    handleBackgroundOpacityPercentChange,
    exportTransparentPng,
  } = useFretboardState()

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Fretmap</h1>
          <p className="text-sm text-slate-300">
            Key基準の度数でノートを表示します。クリックで手動追加、スケールは一括追加です。
          </p>
        </header>

        <ControlPanel
          keyPc={keyPc}
          selectedScale={selectedScale}
          onKeyChange={setKeyPc}
          onScaleChange={setSelectedScale}
          onAddScaleNotes={addScaleNotes}
          onClearNotes={clearHighlightedNotes}
        />

        <FretboardView
          keyPc={keyPc}
          highlightedPositions={highlightedPositions}
          onTogglePosition={togglePosition}
          exportFretStart={exportFretStart}
          exportFretEnd={exportFretEnd}
          backgroundOpacityPercent={backgroundOpacityPercent}
          onExportFretStartChange={handleExportFretStartChange}
          onExportFretEndChange={handleExportFretEndChange}
          onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
          onExportTransparentPng={exportTransparentPng}
        />
      </div>
    </main>
  )
}

export default App
