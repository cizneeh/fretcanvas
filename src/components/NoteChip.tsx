type NoteChipProps = {
  isHighlighted: boolean
  isRoot: boolean
  label: string
}

export const NoteChip = ({ isHighlighted, isRoot, label }: NoteChipProps) => {
  if (!isHighlighted) {
    return (
      <span className="pointer-events-none absolute z-10 h-9 w-9 rounded-full border border-slate-300/25 bg-slate-300/15 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
    )
  }

  return (
    <span
      className={`relative z-10 flex h-8 w-8 translate-y-px items-center justify-center rounded-full border text-[13px] font-semibold leading-none transition-transform duration-150 group-hover:scale-110 ${
        isRoot
          ? 'border-rose-200/80 bg-rose-500/75 text-white'
          : 'border-cyan-100/70 bg-cyan-400/70 text-slate-950'
      }`}
    >
      {label}
    </span>
  )
}
