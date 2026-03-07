import type { PositionId } from '../libs/model'
import { useFretboardStore } from '../stores/fretboardStore'

type NoteContextMenuProps = {
  positionId: PositionId
  x: number
  y: number
  onToggleDimDone: () => void
}

export const NoteContextMenu = ({ positionId, x, y, onToggleDimDone }: NoteContextMenuProps) => {
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const toggleNoteDimmed = useFretboardStore((state) => state.toggleNoteDimmed)

  return (
    <div
      className="fixed z-50 min-w-[170px] rounded-md border border-slate-700 bg-slate-900/95 p-1 shadow-2xl"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-800"
        onClick={() => {
          toggleNoteDimmed(positionId)
          onToggleDimDone()
        }}
      >
        <span>Dim</span>
        <span className="w-4 text-center text-sm text-slate-300">
          {displayedNotes[positionId]?.isDimmed === true ? '✓' : ''}
        </span>
      </button>
    </div>
  )
}
