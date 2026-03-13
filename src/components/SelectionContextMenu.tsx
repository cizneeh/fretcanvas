import { m3MenuContainerClass, m3MenuItemClass } from './ui/materialClasses'

type SelectionContextMenuProps = {
  x: number
  y: number
  onDelete: () => void
  onDim: () => void
  onUndim: () => void
}

export const SelectionContextMenu = ({
  x,
  y,
  onDelete,
  onDim,
  onUndim,
}: SelectionContextMenuProps) => {
  return (
    <div
      className={m3MenuContainerClass}
      style={{
        left: x,
        top: y,
      }}
    >
      <button type="button" className={m3MenuItemClass} onClick={onDim}>
        <span>Dim</span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onUndim}>
        <span>Undim</span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onDelete}>
        <span>Delete</span>
      </button>
    </div>
  )
}
