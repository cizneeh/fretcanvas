import { memo } from 'react'
import type { PositionId } from '../../libs/model'
import { isCellRenderLogEnabled } from '../../libs/renderProfiler'
import { useFretboardStore } from '../../stores/fretboardStore'
import { NoteChip } from '../NoteChip'

type FretCellProps = {
  positionId: PositionId
  isNut: boolean
  label: string
  isRoot: boolean
  isOutOfScale: boolean
  isSelected: boolean
  disablePreview: boolean
  isStartAtNutLine: boolean
  isStartFret: boolean
  isEndFret: boolean
  startMarkerColor: string
  endMarkerColor: string
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
    positionId,
    isNut,
    label,
    isRoot,
    isOutOfScale,
    isSelected,
    disablePreview,
    isStartAtNutLine,
    isStartFret,
    isEndFret,
    startMarkerColor,
    endMarkerColor,
    onNoteClick,
    onNotePointerDown,
    onNotePointerUp,
    onNoteContextMenu,
  }: FretCellProps) => {
    const displayedNote = useFretboardStore((state) => state.displayedNotes[positionId])
    const isHighlighted = displayedNote !== undefined
    const isDimmed = displayedNote?.isDimmed ?? false

    if (isCellRenderLogEnabled()) {
      console.debug('[CellRender]', positionId, {
        isHighlighted,
        isDimmed,
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
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-300/45" />
        {isStartAtNutLine ? (
          <span
            className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[2px] ${startMarkerColor}`}
          />
        ) : undefined}
        {isStartFret && !isStartAtNutLine ? (
          <span
            className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${startMarkerColor}`}
          />
        ) : undefined}
        {isEndFret ? (
          <span
            className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${endMarkerColor}`}
          />
        ) : undefined}
        <NoteChip
          isHighlighted={isHighlighted}
          isRoot={isRoot}
          isOutOfScale={isOutOfScale}
          isDimmed={isDimmed}
          isSelected={isSelected}
          disablePreview={disablePreview}
          label={label}
        />
      </button>
    )
  },
)
