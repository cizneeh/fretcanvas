import { useI18n } from '../i18n/useI18n'
import type { NoteLabelMode, NoteVisualRole } from '../libs/musicCore'
import { getNotePalette } from '../libs/notePalette'
import { useFretboardStore } from '../stores/fretboardStore'

const legendItemsByMode: Record<
  NoteLabelMode,
  {
    role: NoteVisualRole
    labelKey:
      | 'legend.chordTone'
      | 'legend.nonChordTone'
      | 'legend.nonScaleTone'
      | 'legend.root'
      | 'legend.scaleTone'
      | 'legend.tension'
  }[]
> = {
  scale: [
    { role: 'root', labelKey: 'legend.root' },
    { role: 'default', labelKey: 'legend.scaleTone' },
    { role: 'outOfKey', labelKey: 'legend.nonScaleTone' },
  ],
  chord: [
    { role: 'root', labelKey: 'legend.root' },
    { role: 'default', labelKey: 'legend.chordTone' },
    { role: 'tension', labelKey: 'legend.tension' },
    { role: 'outOfKey', labelKey: 'legend.nonChordTone' },
  ],
}

export const NoteLegend = () => {
  const { t } = useI18n()
  const noteLabelMode = useFretboardStore((state) => state.noteLabelMode)
  const legendItems = legendItemsByMode[noteLabelMode]

  return (
    <div className="rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--md-sys-color-on-surface)]">
        {legendItems.map(({ role, labelKey }) => {
          const palette = getNotePalette(role)

          return (
            <span key={role} className="inline-flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden="true"
                className={`h-3 w-3 shrink-0 rounded-full border ${palette.web.highlightedToneClass}`}
              />
              <span>{t(labelKey)}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
