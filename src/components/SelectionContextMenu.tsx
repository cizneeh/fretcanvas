import { useI18n } from '../i18n/useI18n'
import {
  getDimShortcutLabel,
  getEmphasisShortcutLabel,
  getSelectionDeleteShortcutLabel,
} from '../libs/shortcut'
import { m3MenuContainerClass, m3MenuItemClass } from './ui/materialClasses'

type SelectionContextMenuProps = {
  x: number
  y: number
  onDelete: () => void
  onToggleEmphasize: () => void
  onToggleDim: () => void
  isEmphasized: boolean
  isDimmed: boolean
}

export const SelectionContextMenu = ({
  x,
  y,
  onDelete,
  onToggleEmphasize,
  onToggleDim,
  isEmphasized,
  isDimmed,
}: SelectionContextMenuProps) => {
  const { locale, t } = useI18n()
  const emphasizeLabel = isEmphasized ? t('context.deemphasize') : t('context.emphasize')
  const dimLabel = isDimmed ? t('context.undim') : t('context.dim')

  return (
    <div
      className={m3MenuContainerClass}
      style={{
        left: x,
        top: y,
      }}
    >
      <button type="button" className={m3MenuItemClass} onClick={onToggleEmphasize}>
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">{emphasizeLabel}</span>
          <span className="ml-auto text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {getEmphasisShortcutLabel(locale)}
          </span>
        </span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onToggleDim}>
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">{dimLabel}</span>
          <span className="ml-auto text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
            {getDimShortcutLabel(locale)}
          </span>
        </span>
      </button>

      <button type="button" className={m3MenuItemClass} onClick={onDelete}>
        <span className="flex w-full items-center gap-3">
          <span className="min-w-0 flex-1 text-left">{t('context.delete')}</span>
          <span className="ml-auto text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
            {getSelectionDeleteShortcutLabel()}
          </span>
        </span>
      </button>
    </div>
  )
}
