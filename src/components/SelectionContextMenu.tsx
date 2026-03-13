import { getDimShortcutLabel, getSelectionDeleteShortcutLabel } from '../libs/shortcut'
import { m3MenuContainerClass, m3MenuItemClass } from './ui/materialClasses'

type SelectionContextMenuProps = {
  x: number
  y: number
  onDelete: () => void
  onToggleDim: () => void
  isDimmed: boolean
}

export const SelectionContextMenu = ({
  x,
  y,
  onDelete,
  onToggleDim,
  isDimmed,
}: SelectionContextMenuProps) => {
  const dimLabel = isDimmed ? 'Undim' : 'Dim'

  return (
    <div
      className={m3MenuContainerClass}
      style={{
        left: x,
        top: y,
      }}
    >
      <button type="button" className={m3MenuItemClass} onClick={onToggleDim}>
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">{dimLabel}</span>
          <span className="ml-auto text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {getDimShortcutLabel()}
          </span>
        </span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onDelete}>
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">Delete</span>
          <span className="ml-auto text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
            {getSelectionDeleteShortcutLabel()}
          </span>
        </span>
      </button>
    </div>
  )
}
