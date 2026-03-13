import { getBendId, type PositionId } from '../libs/model'
import { getBendShortcutLabel, getDimShortcutLabel } from '../libs/shortcut'
import { useFretboardStore } from '../stores/fretboardStore'
import { m3MenuContainerClass, m3MenuItemClass } from './ui/materialClasses'

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
      className={m3MenuContainerClass}
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        type="button"
        className={m3MenuItemClass}
        onClick={() => {
          toggleNoteDimmed(positionId)
          onClose()
        }}
      >
        <span className="min-w-0 flex-1 text-left">Dim</span>
        <span className="shrink-0 text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
          {shortcutLabel}
        </span>
        <span className="ml-3 w-4 shrink-0 text-center text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
          {displayedNotes[positionId]?.isDimmed === true ? '✓' : ''}
        </span>
      </button>

      <button
        type="button"
        className={m3MenuItemClass}
        onClick={() => {
          onToggleBend(positionId)
          onClose()
        }}
      >
        <span className="min-w-0 flex-1 text-left">{hasBend ? 'Remove Bend' : 'Add Bend'}</span>
        <span className="shrink-0 text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
          {bendShortcutLabel}
        </span>
        <span className="ml-3 w-4 shrink-0 text-center text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
          {hasBend ? '✓' : ''}
        </span>
      </button>
    </div>
  )
}
