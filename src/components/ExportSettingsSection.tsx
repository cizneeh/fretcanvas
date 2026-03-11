import { exportTransparentPng } from '../libs/exportTransparentPng'
import { useFretboardStore } from '../stores/fretboardStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ExportPanel } from './ExportPanel'

export const ExportSettingsSection = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const noteLabelMode = useFretboardStore((state) => state.noteLabelMode)
  const selectedScale = useFretboardStore((state) => state.selectedScale)
  const selectedChord = useFretboardStore((state) => state.selectedChord)
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const connectionsById = useFretboardStore((state) => state.connections)
  const bendsById = useFretboardStore((state) => state.bends)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useSettingsStore((state) => state.backgroundOpacityPercent)
  const handleBackgroundOpacityPercentChange = useSettingsStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const beginBufferedEdit = useHistoryStore((state) => state.beginBufferedEdit)
  const commitBufferedEdit = useHistoryStore((state) => state.commitBufferedEdit)
  const cancelBufferedEdit = useHistoryStore((state) => state.cancelBufferedEdit)
  const captureSnapshot = useHistoryStore((state) => state.captureSnapshot)

  return (
    <section className="rounded-lg border border-zinc-600 bg-zinc-800/80 p-4">
      <ExportPanel
        exportStart={Math.min(exportFretStart, exportFretEnd)}
        exportEnd={Math.max(exportFretStart, exportFretEnd)}
        backgroundOpacityPercent={backgroundOpacityPercent}
        onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
        onBackgroundOpacityEditStart={() => {
          const snapshot = captureSnapshot()
          if (snapshot !== undefined) {
            beginBufferedEdit(snapshot)
          }
        }}
        onBackgroundOpacityEditEnd={() => {
          const snapshot = captureSnapshot()
          if (snapshot !== undefined) {
            commitBufferedEdit(snapshot)
          } else {
            cancelBufferedEdit()
          }
        }}
        onExportTransparentPng={() => {
          exportTransparentPng({
            keyPc,
            noteLabelMode,
            selectedScale,
            selectedChord,
            displayedNotes,
            connections: Object.values(connectionsById),
            bends: Object.values(bendsById),
            exportFretStart,
            exportFretEnd,
            backgroundOpacityPercent,
          })
        }}
      />
    </section>
  )
}
