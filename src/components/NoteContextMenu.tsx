import { getBendId, type PositionId } from '../libs/model'
import { getBendShortcutLabel, getDimShortcutLabel } from '../libs/shortcut'
import { useFretboardStore } from '../stores/fretboardStore'

type NoteContextMenuProps = {
  positionId: PositionId
  x: number
  y: number
  onClose: () => void
  onToggleBend: (positionId: PositionId) => void
}

export const NoteContextMenu = ({
  positionId,
  x,
  y,
  onClose,
  onToggleBend,
}: NoteContextMenuProps) => {
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const bends = useFretboardStore((state) => state.bends)
  const toggleNoteDimmed = useFretboardStore((state) => state.toggleNoteDimmed)
  const shortcutLabel = getDimShortcutLabel()
  const bendShortcutLabel = getBendShortcutLabel()
  const hasBend = bends[getBendId(positionId)] !== undefined

  return (
    <div
      className="fixed z-50 min-w-[170px] rounded-md border border-zinc-600 bg-zinc-800/95 p-1 shadow-2xl"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700"
        onClick={() => {
          toggleNoteDimmed(positionId)
          onClose()
        }}
      >
        <span className="flex items-center gap-2 pr-3">
          <span>Dim</span>
          <span className="text-[11px] text-zinc-300">{shortcutLabel}</span>
        </span>
        <span className="ml-2 w-4 shrink-0 text-center text-sm text-zinc-300">
          {displayedNotes[positionId]?.isDimmed === true ? '✓' : ''}
        </span>
      </button>

      <button
        type="button"
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-700"
        onClick={() => {
          onToggleBend(positionId)
          onClose()
        }}
      >
        <span className="flex items-center gap-2 pr-3">
          <span>{hasBend ? 'Remove Bend' : 'Add Bend'}</span>
          <span className="text-[11px] text-zinc-300">{bendShortcutLabel}</span>
        </span>
        <span className="ml-2 w-4 shrink-0 text-center text-sm text-zinc-300">
          {hasBend ? '✓' : ''}
        </span>
      </button>
    </div>
  )
}
