import type { NoteLabelMode, NoteVisualRole } from '../libs/model'
import { getNotePalette } from '../libs/notePalette'
import { useFretboardStore } from '../stores/fretboardStore'
import { m3FieldLabelClass } from './ui/materialClasses'

const legendItemsByMode: Record<
  NoteLabelMode,
  {
    role: NoteVisualRole
    label: string
  }[]
> = {
  scale: [
    { role: 'root', label: 'Root' },
    { role: 'default', label: 'Scale Tone' },
    { role: 'outOfKey', label: 'Outside' },
  ],
  chord: [
    { role: 'root', label: 'Root' },
    { role: 'default', label: 'Chord Tone' },
    { role: 'tension', label: 'Tension' },
    { role: 'outOfKey', label: 'Outside' },
  ],
}

export const NoteLegend = () => {
  const noteLabelMode = useFretboardStore((state) => state.noteLabelMode)
  const legendItems = legendItemsByMode[noteLabelMode]

  return (
    <div className="rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--md-sys-color-on-surface)]">
        <span className={m3FieldLabelClass}>Legend</span>
        {legendItems.map(({ role, label }) => {
          const palette = getNotePalette(role)

          return (
            <span key={role} className="inline-flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden="true"
                className={`h-3 w-3 shrink-0 rounded-full border ${palette.web.highlightedToneClass}`}
              />
              <span>{label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
