import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { useFretboardStore } from '../stores/fretboardStore'
import { ExportPanel } from './ExportPanel'
import { FretboardStage } from './FretboardStage'
import { NoteContextMenu } from './NoteContextMenu'

export const FretboardView = () => {
  const exportFretStart = useFretboardStore((state) => state.exportFretStart)
  const exportFretEnd = useFretboardStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useFretboardStore((state) => state.backgroundOpacityPercent)
  const handleBackgroundOpacityPercentChange = useFretboardStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const beginBufferedEdit = useFretboardStore((state) => state.beginBufferedEdit)
  const commitBufferedEdit = useFretboardStore((state) => state.commitBufferedEdit)
  const exportTransparentPng = useFretboardStore((state) => state.exportTransparentPng)
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
        onOpacityInteractionStart={beginBufferedEdit}
        onOpacityInteractionEnd={commitBufferedEdit}
        onExportTransparentPng={exportTransparentPng}
      />
    </section>
  )
}
