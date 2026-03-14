import type { NoteVisualRole } from '../libs/model'

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
  const highlightedToneClass =
    visualRole === 'root'
      ? 'border-rose-200/80 bg-rose-700/80 text-white'
      : visualRole === 'outOfKey'
        ? 'border-orange-200/75 bg-orange-500/80 text-white'
        : visualRole === 'tension'
          ? 'border-emerald-200/75 bg-emerald-600/80 text-white'
          : 'border-cyan-100/70 bg-cyan-600/80 text-white'
  const previewToneClass =
    visualRole === 'root'
      ? 'border-rose-200/65 bg-rose-500/35 text-rose-50'
      : visualRole === 'outOfKey'
        ? 'border-orange-200/65 bg-orange-400/35 text-orange-50'
        : visualRole === 'tension'
          ? 'border-emerald-200/65 bg-emerald-500/35 text-emerald-50'
          : 'border-cyan-100/65 bg-cyan-500/35 text-cyan-50'

  if (!isHighlighted) {
    return (
      <span
        className={`pointer-events-none absolute z-10 flex h-8 w-8 translate-y-px items-center justify-center rounded-full border border-dashed text-[13px] font-semibold leading-none opacity-0 transition-opacity duration-150 ${
          disablePreview ? '' : 'group-hover:opacity-[0.38]'
        } ${previewToneClass}`}
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
        className={`flex h-full w-full items-center justify-center rounded-full border text-[13px] font-semibold leading-none ${highlightedToneClass}`}
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
