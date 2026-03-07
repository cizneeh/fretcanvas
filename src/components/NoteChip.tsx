type NoteChipProps = {
  isHighlighted: boolean
  isRoot: boolean
  isDimmed: boolean
  label: string
}

export const NoteChip = ({ isHighlighted, isRoot, isDimmed, label }: NoteChipProps) => {
  if (!isHighlighted) {
    return (
      <span className="pointer-events-none absolute z-10 h-9 w-9 rounded-full border border-slate-300/25 bg-slate-300/15 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
    )
  }

  return (
    <span
      className={`relative z-10 flex h-8 w-8 translate-y-px items-center justify-center rounded-full border text-[13px] font-semibold leading-none transition-transform duration-150 group-hover:scale-110 ${
        isRoot
          ? 'border-rose-200/80 bg-rose-700/80 text-white'
          : 'border-cyan-100/70 bg-cyan-600/80 text-white'
      }`}
      style={{
        opacity: isDimmed ? 0.45 : 1,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.65)',
      }}
    >
      {label}
    </span>
  )
}
