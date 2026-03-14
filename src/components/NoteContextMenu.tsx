import { useI18n } from '../i18n/useI18n'
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
  const { locale, t } = useI18n()
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const bends = useFretboardStore((state) => state.bends)
  const toggleNoteDimmed = useFretboardStore((state) => state.toggleNoteDimmed)
  const toggleNoteEmphasized = useFretboardStore((state) => state.toggleNoteEmphasized)
  const shortcutLabel = getDimShortcutLabel(locale)
  const bendShortcutLabel = getBendShortcutLabel(locale)
  const hasBend = bends[getBendId(positionId)] !== undefined
  const isDimmed = displayedNotes[positionId]?.isDimmed === true
  const isEmphasized = displayedNotes[positionId]?.isEmphasized === true

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
          toggleNoteEmphasized(positionId)
          onClose()
        }}
      >
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">
            {isEmphasized ? t('context.deemphasize') : t('context.emphasize')}
          </span>
        </span>
      </button>

      <button
        type="button"
        className={m3MenuItemClass}
        onClick={() => {
          toggleNoteDimmed(positionId)
          onClose()
        }}
      >
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">
            {isDimmed ? t('context.undim') : t('context.dim')}
          </span>
          <span className="ml-auto text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {shortcutLabel}
          </span>
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
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">
            {hasBend ? t('context.removeBend') : t('context.addBend')}
          </span>
          <span className="ml-auto text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {bendShortcutLabel}
          </span>
        </span>
      </button>
    </div>
  )
}
