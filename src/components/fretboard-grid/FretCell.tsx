import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { NoteVisualRole, PositionId } from '../../libs/musicCore'
import type { DisplayedNoteLabel } from '../../libs/noteDisplay'
import { isCellRenderLogEnabled } from '../../libs/renderProfiler'
import { useFretboardStore } from '../../stores/fretboardStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { NoteChip } from '../NoteChip'

type FretCellProps = {
  fret: number
  positionId: PositionId
  isNut: boolean
  label: DisplayedNoteLabel
  visualRole: NoteVisualRole
  isSelected: boolean
  disablePreview: boolean
  isPreviewStartAtNutLine: boolean
  isPreviewStartFret: boolean
  isPreviewEndFret: boolean
  onNoteClick: (
    positionId: PositionId,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
  ) => void
  onNotePointerDown: (
    positionId: PositionId,
    isHighlighted: boolean,
    button: number,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onNotePointerUp: (positionId: PositionId) => void
  onNoteContextMenu: (
    positionId: PositionId,
    isHighlighted: boolean,
    clientX: number,
    clientY: number,
  ) => void
}

export const FretCell = memo(
  ({
    fret,
    positionId,
    isNut,
    label,
    visualRole,
    isSelected,
    disablePreview,
    isPreviewStartAtNutLine,
    isPreviewStartFret,
    isPreviewEndFret,
    onNoteClick,
    onNotePointerDown,
    onNotePointerUp,
    onNoteContextMenu,
  }: FretCellProps) => {
    const displayedNote = useFretboardStore((state) => state.displayedNotes[positionId])
    const isHighlighted = displayedNote !== undefined
    const isDimmed = displayedNote?.isDimmed ?? false
    const isEmphasized = displayedNote?.isEmphasized ?? false
    const { isStartAtNutLine, isStartFret, isEndFret, startMarkerColor, endMarkerColor } =
      useSettingsStore(
        useShallow((state) => {
          const showExportRangeHighlight = state.showExportRangeHighlight
          const startHighlightFret = showExportRangeHighlight
            ? Math.max(0, state.exportFretStart - 1)
            : -1
          const markerColor =
            state.exportFretStart === state.exportFretEnd ? 'bg-fuchsia-300' : undefined

          return {
            isStartAtNutLine: showExportRangeHighlight && state.exportFretStart === 0 && fret === 0,
            isStartFret: fret === startHighlightFret,
            isEndFret: showExportRangeHighlight && fret === state.exportFretEnd,
            startMarkerColor: markerColor ?? 'bg-cyan-300',
            endMarkerColor: markerColor ?? 'bg-emerald-300',
          }
        }),
      )

    if (isCellRenderLogEnabled()) {
      console.debug('[CellRender]', positionId, {
        isHighlighted,
        isDimmed,
        isEmphasized,
        label,
      })
    }

    return (
      <button
        type="button"
        data-fret-cell="true"
        className={`group relative flex h-12 items-center justify-center border-r focus-visible:outline-none ${
          isNut ? 'border-r-[3px] border-slate-200/85' : 'border-slate-400/55'
        }`}
        onClick={(event) => {
          onNoteClick(positionId, event.metaKey, event.ctrlKey, event.altKey)
        }}
        onPointerDown={(event) => {
          onNotePointerDown(
            positionId,
            isHighlighted,
            event.button,
            event.metaKey,
            event.ctrlKey,
            event.altKey,
            event.clientX,
            event.clientY,
          )
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          onNoteContextMenu(positionId, isHighlighted, event.clientX, event.clientY)
        }}
        onPointerUp={() => {
          onNotePointerUp(positionId)
        }}
      >
        <span
          className={`pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-slate-300/45 ${
            isNut ? 'left-1/2 right-0' : 'inset-x-0'
          }`}
        />
        {isStartAtNutLine ? (
          <span
            className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[2px] ${startMarkerColor}`}
          />
        ) : undefined}
        {isPreviewStartAtNutLine && !isStartAtNutLine ? (
          <span className="pointer-events-none absolute bottom-0 left-0 top-0 z-[9] w-[2px] bg-cyan-300/35" />
        ) : undefined}
        {isStartFret && !isStartAtNutLine ? (
          <span
            className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${startMarkerColor}`}
          />
        ) : undefined}
        {isPreviewStartFret && !isStartFret ? (
          <span className="pointer-events-none absolute bottom-0 right-[-1px] top-0 z-[9] w-[2px] bg-cyan-300/35" />
        ) : undefined}
        {isEndFret ? (
          <span
            className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${endMarkerColor}`}
          />
        ) : undefined}
        {isPreviewEndFret && !isEndFret ? (
          <span className="pointer-events-none absolute bottom-0 right-[-1px] top-0 z-[9] w-[2px] bg-emerald-300/35" />
        ) : undefined}
        <NoteChip
          isHighlighted={isHighlighted}
          visualRole={visualRole}
          isDimmed={isDimmed}
          isEmphasized={isEmphasized}
          isSelected={isSelected}
          disablePreview={disablePreview}
          label={label}
        />
      </button>
    )
  },
  (previousProps, nextProps) =>
    previousProps.fret === nextProps.fret &&
    previousProps.positionId === nextProps.positionId &&
    previousProps.isNut === nextProps.isNut &&
    previousProps.visualRole === nextProps.visualRole &&
    previousProps.isSelected === nextProps.isSelected &&
    previousProps.disablePreview === nextProps.disablePreview &&
    previousProps.isPreviewStartAtNutLine === nextProps.isPreviewStartAtNutLine &&
    previousProps.isPreviewStartFret === nextProps.isPreviewStartFret &&
    previousProps.isPreviewEndFret === nextProps.isPreviewEndFret &&
    previousProps.onNoteClick === nextProps.onNoteClick &&
    previousProps.onNotePointerDown === nextProps.onNotePointerDown &&
    previousProps.onNotePointerUp === nextProps.onNotePointerUp &&
    previousProps.onNoteContextMenu === nextProps.onNoteContextMenu &&
    previousProps.label.primary === nextProps.label.primary &&
    previousProps.label.secondary === nextProps.label.secondary,
)
