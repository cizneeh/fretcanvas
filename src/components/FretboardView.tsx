import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { FRET_NUMBERS } from '../libs/model'
import { RenderProfiler } from './dev/RenderProfiler'
import { ExportRangeTrack } from './ExportRangeTrack'
import { FretboardGrid } from './FretboardGrid'
import { NoteContextMenu } from './NoteContextMenu'
import { NoteLegend } from './NoteLegend'
import { SelectionContextMenu } from './SelectionContextMenu'
import { m3CardClass, m3FieldLabelClass } from './ui/materialClasses'

export const FretboardView = () => {
  const interaction = useFretboardInteractionState()

  return (
    <section className="select-none">
      <div className="mb-1">
        <NoteLegend />
      </div>

      <div className="overflow-x-auto py-4">
        <div className="w-max min-w-full space-y-3">
          <div className="w-full rounded-md bg-black ring-1 ring-inset ring-zinc-700">
            <RenderProfiler id="FretboardGrid">
              <FretboardGrid
                previewConnection={interaction.previewConnection}
                {...interaction.gridProps}
              />
            </RenderProfiler>
          </div>

          <div className={`${m3CardClass} w-full p-3`}>
            <div className={`mb-2 ${m3FieldLabelClass}`}>Export Range</div>
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
      ) : interaction.selectionContextMenu !== undefined ? (
        <div
          ref={(node) => {
            interaction.contextMenuRef.current = node ?? undefined
          }}
        >
          <SelectionContextMenu
            x={interaction.selectionContextMenu.x}
            y={interaction.selectionContextMenu.y}
            onDelete={interaction.handleDeleteSelectedNotes}
            onToggleDim={interaction.handleToggleDimSelectedNotes}
            isDimmed={interaction.areAllSelectedNotesDimmed}
          />
        </div>
      ) : undefined}
    </section>
  )
}
