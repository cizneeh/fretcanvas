import type { NoteVisualRole } from '../libs/musicCore'
import type { DisplayedNoteLabel } from '../libs/noteDisplay'
import { getNotePalette } from '../libs/notePalette'

type NoteChipProps = {
  isHighlighted: boolean
  visualRole: NoteVisualRole
  isDimmed: boolean
  isEmphasized: boolean
  isSelected: boolean
  disablePreview: boolean
  label: DisplayedNoteLabel
}

export const NoteChip = ({
  isHighlighted,
  visualRole,
  isDimmed,
  isEmphasized,
  isSelected,
  disablePreview,
  label,
}: NoteChipProps) => {
  const palette = getNotePalette(visualRole)
  const isCombinedLabel = label.secondary !== undefined
  const chipSizeClass = isCombinedLabel ? 'h-9 w-9' : 'h-8 w-8'
  const content = !isCombinedLabel ? (
    <span>{label.primary}</span>
  ) : (
    <span className="flex flex-col items-center leading-none">
      <span className="text-[14px] font-semibold">{label.primary}</span>
      <span className="mt-[1px] text-[11px] font-medium opacity-85">{label.secondary}</span>
    </span>
  )

  if (!isHighlighted) {
    return (
      <span
        className={`pointer-events-none absolute z-10 flex ${chipSizeClass} translate-y-px items-center justify-center rounded-full border border-dashed text-[13px] font-semibold leading-none opacity-0 transition-opacity duration-150 ${
          disablePreview ? '' : 'group-hover:opacity-[0.38]'
        } ${palette.web.previewToneClass}`}
        style={{
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
        }}
      >
        {content}
      </span>
    )
  }

  return (
    <span
      className={`relative z-10 flex ${chipSizeClass} translate-y-px items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-110`}
      style={{
        boxShadow: isSelected ? '0 0 0 2px rgba(248, 250, 252, 0.98)' : undefined,
        transform: isEmphasized ? 'translateY(1px) scale(1.08)' : undefined,
      }}
    >
      {isEmphasized ? (
        <span
          className="pointer-events-none absolute inset-[-3px] rounded-full border-2 border-slate-50/90 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_4px_12px_rgba(15,23,42,0.28)]"
          aria-hidden="true"
        />
      ) : undefined}
      <span
        className={`flex h-full w-full items-center justify-center rounded-full border text-[13px] font-semibold leading-none ${palette.web.highlightedToneClass}`}
        style={{
          opacity: isDimmed ? 0.42 : 1,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
        }}
      >
        {content}
      </span>
    </span>
  )
}
