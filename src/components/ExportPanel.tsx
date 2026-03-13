import { useEffect, useState } from 'react'
import {
  m3CheckboxClass,
  m3FieldLabelClass,
  m3FilledButtonClass,
  m3InputClass,
  m3OutlinedButtonClass,
} from './ui/materialClasses'

type ExportPanelProps = {
  exportStart: number
  exportEnd: number
  backgroundOpacityPercent: number
  showExportTitle: boolean
  onBackgroundOpacityPercentChange: (
    nextOpacity: number,
    options?: {
      skipHistory?: boolean
    },
  ) => void
  onShowExportTitleChange: (nextValue: boolean) => void
  onBackgroundOpacityEditStart: () => void
  onBackgroundOpacityEditEnd: () => void
  onExportTransparentPng: () => void
}

export const ExportPanel = ({
  exportStart,
  exportEnd,
  backgroundOpacityPercent,
  showExportTitle,
  onBackgroundOpacityPercentChange,
  onShowExportTitleChange,
  onBackgroundOpacityEditStart,
  onBackgroundOpacityEditEnd,
  onExportTransparentPng,
}: ExportPanelProps) => {
  const [draftOpacity, setDraftOpacity] = useState(String(backgroundOpacityPercent))

  useEffect(() => {
    setDraftOpacity(String(backgroundOpacityPercent))
  }, [backgroundOpacityPercent])

  const clampOpacity = (value: number) => Math.max(0, Math.min(Math.round(value), 100))
  const applyOpacity = (
    value: number,
    options?: {
      skipHistory?: boolean
    },
  ) => {
    onBackgroundOpacityPercentChange(clampOpacity(value), options)
  }
  const stepValues = [0, 25, 50, 75, 100]

  return (
    <div className="w-full max-w-[22rem]">
      <div className="mb-3 flex items-center justify-between text-sm text-[color:var(--md-sys-color-on-surface)]">
        <span>Export Range</span>
        <span className="font-medium text-[color:var(--md-sys-color-on-surface)]">
          Frets {exportStart} - {exportEnd}
        </span>
      </div>

      <div className="mb-4 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
        S / E マーカーをドラッグ、またはバーをクリックして範囲を設定
      </div>

      <label className="mb-4 flex items-center gap-2 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
        <input
          type="checkbox"
          className={m3CheckboxClass}
          checked={showExportTitle}
          onChange={(event) => {
            onShowExportTitleChange(event.target.checked)
          }}
        />
        Show scale/chord name in export image
      </label>

      <div className="mb-4">
        <div className={`mb-1 ${m3FieldLabelClass}`}>Background Opacity</div>
        <div className="mb-2 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] gap-2">
          <button
            type="button"
            className={`${m3OutlinedButtonClass} h-10 px-2.5`}
            onClick={() => {
              onBackgroundOpacityEditStart()
              applyOpacity(backgroundOpacityPercent - 1, { skipHistory: true })
              onBackgroundOpacityEditEnd()
            }}
            disabled={backgroundOpacityPercent <= 0}
            aria-label="Decrease opacity by 1"
          >
            -
          </button>

          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              className={`${m3InputClass} h-10 pr-7`}
              value={draftOpacity}
              onFocus={onBackgroundOpacityEditStart}
              onBlur={() => {
                const parsed = Number(draftOpacity)
                if (Number.isFinite(parsed)) {
                  applyOpacity(parsed, { skipHistory: true })
                } else {
                  setDraftOpacity(String(backgroundOpacityPercent))
                }
                onBackgroundOpacityEditEnd()
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setDraftOpacity(nextValue)
                if (nextValue === '') {
                  return
                }
                const parsed = Number(nextValue)
                if (Number.isFinite(parsed)) {
                  applyOpacity(parsed, { skipHistory: true })
                }
              }}
              aria-label="Background opacity percentage"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
              %
            </span>
          </div>

          <button
            type="button"
            className={`${m3OutlinedButtonClass} h-10 px-2.5`}
            onClick={() => {
              onBackgroundOpacityEditStart()
              applyOpacity(backgroundOpacityPercent + 1, { skipHistory: true })
              onBackgroundOpacityEditEnd()
            }}
            disabled={backgroundOpacityPercent >= 100}
            aria-label="Increase opacity by 1"
          >
            +
          </button>
        </div>

        <div className="mb-2 grid grid-cols-5 gap-1.5">
          {stepValues.map((value) => (
            <button
              key={value}
              type="button"
              className={`h-8 rounded-[var(--md-shape-sm)] border px-2 py-1 text-[11px] font-medium transition-colors ${
                backgroundOpacityPercent === value
                  ? 'm3-state-tonal border-transparent bg-[color:var(--md-sys-color-secondary-container)] text-[color:var(--md-sys-color-on-secondary-container)]'
                  : 'm3-state-surface border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] text-[color:var(--md-sys-color-on-surface-variant)]'
              }`}
              onClick={() => {
                onBackgroundOpacityEditStart()
                applyOpacity(value, { skipHistory: true })
                onBackgroundOpacityEditEnd()
              }}
            >
              {value}%
            </button>
          ))}
        </div>

        <input
          className="range-thumb h-2 w-full appearance-none rounded-full bg-[color:var(--md-sys-color-outline-variant)]"
          type="range"
          min={0}
          max={100}
          value={backgroundOpacityPercent}
          onPointerDown={onBackgroundOpacityEditStart}
          onPointerUp={onBackgroundOpacityEditEnd}
          onFocus={onBackgroundOpacityEditStart}
          onBlur={onBackgroundOpacityEditEnd}
          onChange={(event) => {
            applyOpacity(Number(event.target.value), { skipHistory: true })
          }}
          aria-label="Export background opacity"
        />
      </div>

      <button
        type="button"
        className={`w-full ${m3FilledButtonClass}`}
        onClick={onExportTransparentPng}
      >
        Export Transparent PNG
      </button>
    </div>
  )
}
