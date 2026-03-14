import type { NoteVisualRole } from '../libs/model'
import { getNotePalette } from '../libs/notePalette'

type NoteChipProps = {
  isHighlighted: boolean
  visualRole: NoteVisualRole
  isDimmed: boolean
  isSelected: boolean
  disablePreview: boolean
  label: string
}

export const NoteChip = ({
  isHighlighted,
  visualRole,
  isDimmed,
  isSelected,
  disablePreview,
  label,
}: NoteChipProps) => {
  const palette = getNotePalette(visualRole)

  if (!isHighlighted) {
    return (
      <span
        className={`pointer-events-none absolute z-10 flex h-8 w-8 translate-y-px items-center justify-center rounded-full border border-dashed text-[13px] font-semibold leading-none opacity-0 transition-opacity duration-150 ${
          disablePreview ? '' : 'group-hover:opacity-[0.38]'
        } ${palette.web.previewToneClass}`}
        style={{
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className="relative z-10 flex h-8 w-8 translate-y-px items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-110"
      style={{
        boxShadow: isSelected ? '0 0 0 2px rgba(248, 250, 252, 0.98)' : undefined,
      }}
    >
      <span
        className={`flex h-full w-full items-center justify-center rounded-full border text-[13px] font-semibold leading-none ${palette.web.highlightedToneClass}`}
        style={{
          opacity: isDimmed ? 0.42 : 1,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
        }}
      >
        {label}
      </span>
    </span>
  )
}
