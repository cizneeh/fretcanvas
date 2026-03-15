import { useState } from 'react'
import { useFretboardInteractionState } from '../hooks/useFretboardInteractionState'
import { useI18n } from '../i18n/useI18n'
import { FRET_NUMBERS } from '../libs/musicCore'
import { RenderProfiler } from './dev/RenderProfiler'
import { ExportRangeTrack } from './ExportRangeTrack'
import { FretboardGrid } from './FretboardGrid'
import { FRET_CELL_WIDTH } from './fretboard-grid/constants'
import { NoteContextMenu } from './NoteContextMenu'
import { NoteLegend } from './NoteLegend'
import { SelectionContextMenu } from './SelectionContextMenu'
import { TuningMenu } from './TuningMenu'
import { m3CardClass, m3FieldLabelClass, m3OutlinedButtonClass } from './ui/materialClasses'

export const FretboardView = () => {
  const { t } = useI18n()
  const interaction = useFretboardInteractionState()
  const [tuningMenuAnchor, setTuningMenuAnchor] = useState<HTMLElement | null>(null)

  return (
    <section className="select-none">
      <TuningMenu
        anchorElement={tuningMenuAnchor}
        onClose={() => {
          setTuningMenuAnchor(null)
        }}
      />

      <div className="mb-1 flex items-center justify-between gap-3">
        <NoteLegend />
        <button
          type="button"
          className={`${m3OutlinedButtonClass} min-h-9 shrink-0 px-3 py-1.5 text-xs`}
          onClick={(event) => {
            setTuningMenuAnchor(event.currentTarget)
          }}
        >
          {t('tuning.title')}
        </button>
      </div>

      <div className="overflow-x-auto py-4">
        <div className="w-max min-w-full space-y-2">
          <div className="w-full rounded-md bg-black ring-1 ring-inset ring-zinc-700">
            <RenderProfiler id="FretboardGrid">
              <FretboardGrid
                previewConnection={interaction.previewConnection}
                onOpenTuningMenu={(anchorElement) => {
                  setTuningMenuAnchor(anchorElement)
                }}
                {...interaction.gridProps}
              />
            </RenderProfiler>
          </div>

          <div className={`${m3CardClass} w-full px-5 pb-2 pt-1`}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(${FRET_CELL_WIDTH}px, ${FRET_CELL_WIDTH}px))`,
              }}
            >
              <ExportRangeTrack {...interaction.rangeTrackProps} />
            </div>
            <div className={`mt-1 ${m3FieldLabelClass}`}>{t('export.range')}</div>
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
            onToggleEmphasize={interaction.handleToggleEmphasizeSelectedNotes}
            onToggleDim={interaction.handleToggleDimSelectedNotes}
            isEmphasized={interaction.areAllSelectedNotesEmphasized}
            isDimmed={interaction.areAllSelectedNotesDimmed}
          />
        </div>
      ) : undefined}
    </section>
  )
}
