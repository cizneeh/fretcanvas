import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { FRET_NUMBERS } from '../libs/model'
import { ExportRangeTrack } from './ExportRangeTrack'
import { FretboardGrid } from './FretboardGrid'
import { NoteContextMenu } from './NoteContextMenu'

export const FretboardView = () => {
  const interaction = useFretboardInteractionState()

  return (
    <section>
      <div className="overflow-x-auto py-4">
        <div className="min-w-max space-y-3">
          <div className="rounded-md border border-zinc-700 bg-black p-3">
            <FretboardGrid
              previewConnection={interaction.previewConnection}
              {...interaction.gridProps}
            />
          </div>

          <div className="rounded-md border border-zinc-600 bg-zinc-800/80 p-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-300">
              Export Range
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
              }}
            >
              <ExportRangeTrack {...interaction.rangeTrackProps} />
            </div>
          </div>
        </div>
      </div>

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
            onToggleBend={interaction.handleToggleBendFromContextMenu}
            onClose={() => {
              interaction.setNoteContextMenu(undefined)
            }}
          />
        </div>
      ) : undefined}
    </section>
  )
}
