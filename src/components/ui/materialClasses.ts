export const m3CardClass =
  'rounded-[var(--md-shape-lg)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container)] shadow-[var(--md-elevation-1)]'

export const m3CardElevatedClass =
  'rounded-[var(--md-shape-lg)] border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-high)] shadow-[var(--md-elevation-2)]'

export const m3FieldLabelClass =
  'text-[13px] font-medium tracking-[0.01em] text-[color:var(--md-sys-color-on-surface-variant)]'

export const m3SelectClass =
  'm3-state-surface m3-focus-ring w-full appearance-none rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2 pr-10 text-sm text-[color:var(--md-sys-color-on-surface)] outline-none'

export const m3SelectChevronClass =
  'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400/85'

export const m3InputClass =
  'm3-state-surface m3-focus-ring w-full rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2 text-sm text-[color:var(--md-sys-color-on-surface)] outline-none'

export const m3ButtonBaseClass =
  'm3-focus-ring min-h-10 rounded-[var(--md-shape-md)] border px-3 py-2 text-sm font-medium transition-colors duration-150'

export const m3FilledButtonClass = `${m3ButtonBaseClass} m3-state-primary border-transparent bg-[color:var(--md-sys-color-primary)] text-[color:var(--md-sys-color-on-primary)] disabled:cursor-not-allowed disabled:opacity-50`

export const m3TonalButtonClass = `${m3ButtonBaseClass} m3-state-tonal border-transparent bg-[color:var(--md-sys-color-secondary-container)] text-[color:var(--md-sys-color-on-secondary-container)] disabled:cursor-not-allowed disabled:opacity-50`

export const m3OutlinedButtonClass = `${m3ButtonBaseClass} m3-state-surface border-[color:var(--md-sys-color-outline)] bg-transparent text-[color:var(--md-sys-color-on-surface)] disabled:cursor-not-allowed disabled:opacity-50`

export const m3SegmentedContainerClass =
  'inline-flex rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] p-1'

export const m3SegmentedButtonClass = (isActive: boolean) =>
  `rounded-[calc(var(--md-shape-md)-4px)] px-3 py-1.5 text-[13px] font-medium transition-colors ${
    isActive
      ? 'bg-[color:var(--md-sys-color-secondary-container)] text-[color:var(--md-sys-color-on-secondary-container)]'
      : 'm3-state-surface text-[color:var(--md-sys-color-on-surface-variant)]'
  }`

export const m3CheckboxClass =
  'h-4 w-4 rounded-[var(--md-shape-sm)] border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] accent-[color:var(--md-sys-color-primary)]'

export const m3MenuContainerClass =
  'fixed z-50 min-w-[196px] rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-high)] p-1 shadow-[var(--md-elevation-3)]'

export const m3MenuItemClass =
  'm3-state-surface flex min-h-10 w-full items-center justify-between rounded-[var(--md-shape-sm)] px-3 py-2 text-left text-sm text-[color:var(--md-sys-color-on-surface)]'
