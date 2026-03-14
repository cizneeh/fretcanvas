import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import type { ExportFormat } from '../stores/settingsStore'
import {
  m3CheckboxClass,
  m3FieldLabelClass,
  m3FilledButtonClass,
  m3InputClass,
  m3OutlinedButtonClass,
  m3SegmentedButtonClass,
  m3SegmentedContainerClass,
} from './ui/materialClasses'

type ExportPanelProps = {
  exportStart: number
  exportEnd: number
  exportFormat: ExportFormat
  backgroundOpacityPercent: number
  showExportTitle: boolean
  onExportFormatChange: (nextFormat: ExportFormat) => void
  onBackgroundOpacityPercentChange: (
    nextOpacity: number,
    options?: {
      skipHistory?: boolean
    },
  ) => void
  onShowExportTitleChange: (nextValue: boolean) => void
  onBackgroundOpacityEditStart: () => void
  onBackgroundOpacityEditEnd: () => void
  onExport: () => void
}

export const ExportPanel = ({
  exportStart,
  exportEnd,
  exportFormat,
  backgroundOpacityPercent,
  showExportTitle,
  onExportFormatChange,
  onBackgroundOpacityPercentChange,
  onShowExportTitleChange,
  onBackgroundOpacityEditStart,
  onBackgroundOpacityEditEnd,
  onExport,
}: ExportPanelProps) => {
  const { t } = useI18n()
  const [draftOpacity, setDraftOpacity] = useState(String(backgroundOpacityPercent))

  useEffect(() => {
    setDraftOpacity(String(backgroundOpacityPercent))
  }, [backgroundOpacityPercent])

  const clampOpacity = (value: number) => Math.max(0, Math.min(Math.round(value), 100))
  const exportRangeLabel =
    exportStart === exportEnd
      ? t('export.rangeSingle', { start: exportStart })
      : t('export.rangeMulti', { start: exportStart, end: exportEnd })
  const exportFormatLabel = exportFormat.toUpperCase()
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
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15px]">
          <span className="text-[color:var(--md-sys-color-on-surface-variant)]">
            {t('export.range')}
          </span>
          <span className="font-medium text-[color:var(--md-sys-color-on-surface)]">
            {exportRangeLabel}
          </span>
        </div>
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
        <input
          type="checkbox"
          className={m3CheckboxClass}
          checked={showExportTitle}
          onChange={(event) => {
            onShowExportTitleChange(event.target.checked)
          }}
        />
        {t('export.showTitle')}
      </label>

      <div className="mb-4">
        <div className={`mb-1 ${m3FieldLabelClass}`}>{t('export.backgroundOpacity')}</div>
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
            aria-label={t('export.decreaseOpacity')}
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
              aria-label={t('export.opacityPercentageAria')}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
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
            aria-label={t('export.increaseOpacity')}
          >
            +
          </button>
        </div>

        <div className="mb-2 grid grid-cols-5 gap-1.5">
          {stepValues.map((value) => (
            <button
              key={value}
              type="button"
              className={`h-8 rounded-[var(--md-shape-sm)] border px-2 py-1 text-xs font-medium transition-colors ${
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
          aria-label={t('export.backgroundOpacityAria')}
        />
      </div>

      <div className="mb-4">
        <div className={`mb-1 ${m3FieldLabelClass}`}>{t('export.format')}</div>
        <div className={`${m3SegmentedContainerClass} w-full`}>
          {(['png', 'svg'] as const).map((format) => (
            <button
              key={format}
              type="button"
              aria-pressed={exportFormat === format}
              className={`${m3SegmentedButtonClass(exportFormat === format)} flex-1 text-center`}
              onClick={() => {
                onExportFormatChange(format)
              }}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`w-full ${m3FilledButtonClass}`}
        onClick={onExport}
        aria-label={t('export.exportAria', { format: exportFormatLabel })}
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2.5V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path
              d="M5.5 7.5L8 10L10.5 7.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 12.5H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{exportFormatLabel}</span>
        </span>
      </button>
    </div>
  )
}
