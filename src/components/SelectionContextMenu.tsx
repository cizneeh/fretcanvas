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
        <span className="min-w-0 flex-1 text-left">Dim</span>
        <span className="shrink-0 text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
          {getDimShortcutLabel()}
        </span>
        <span className="ml-3 w-4 shrink-0 text-center text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
          {isDimmed ? '✓' : ''}
        </span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onDelete}>
        <span className="min-w-0 flex-1 text-left">Delete</span>
        <span className="shrink-0 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
          {getSelectionDeleteShortcutLabel()}
        </span>
      </button>
    </div>
  )
}
