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
  return (
    <div
      className={m3MenuContainerClass}
      style={{
        left: x,
        top: y,
      }}
    >
      <button type="button" className={m3MenuItemClass} onClick={onToggleDim}>
        <span className="flex items-center gap-2 pr-3">
          <span>Dim</span>
          <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {getDimShortcutLabel()}
          </span>
        </span>
        <span className="ml-2 w-4 shrink-0 text-center text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
          {isDimmed ? '✓' : ''}
        </span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onDelete}>
        <span>Delete</span>
        <span className="pl-4 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
          {getSelectionDeleteShortcutLabel()}
        </span>
      </button>
    </div>
  )
}
