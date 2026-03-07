import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { exportTransparentPng } from '../libs/exportTransparentPng'
import { useFretboardStore } from '../stores/fretboardStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ExportPanel } from './ExportPanel'
import { FretboardStage } from './FretboardStage'
import { NoteContextMenu } from './NoteContextMenu'

export const FretboardView = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const connectionsById = useFretboardStore((state) => state.connections)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useSettingsStore((state) => state.backgroundOpacityPercent)
  const handleBackgroundOpacityPercentChange = useSettingsStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const interaction = useFretboardInteractionState()

  return (
    <section className="bg-black">
      <FretboardStage
        previewConnection={interaction.previewConnection}
        gridProps={interaction.gridProps}
        rangeTrackProps={interaction.rangeTrackProps}
      />

      {interaction.noteContextMenu !== undefined ? (
        <div
          ref={(node) => {
            interaction.contextMenuRef.current = node ?? undefined
          }}
        >
          <NoteContextMenu
            positionId={interaction.noteContextMenu.positionId}
            x={interaction.noteContextMenu.x}
            y={interaction.noteContextMenu.y}
            onToggleDimDone={() => {
              interaction.setNoteContextMenu(undefined)
            }}
          />
        </div>
      ) : undefined}

      <ExportPanel
        exportStart={Math.min(exportFretStart, exportFretEnd)}
        exportEnd={Math.max(exportFretStart, exportFretEnd)}
        backgroundOpacityPercent={backgroundOpacityPercent}
        onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
        onExportTransparentPng={() => {
          exportTransparentPng({
            keyPc,
            displayedNotes,
            connections: Object.values(connectionsById),
            exportFretStart,
            exportFretEnd,
            backgroundOpacityPercent,
          })
        }}
      />
    </section>
  )
}
