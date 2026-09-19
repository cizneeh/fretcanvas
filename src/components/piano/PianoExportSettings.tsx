import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { exportPiano, type PianoExportInput, renderPianoSvg } from '../../libs/export/piano'
import { getMidiLabel } from '../../libs/piano'
import { useFretboardStore } from '../../stores/fretboardStore'
import { usePianoStore } from '../../stores/pianoStore'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  m3CardClass,
  m3CheckboxClass,
  m3FilledButtonClass,
  m3InputClass,
  m3SegmentedButtonClass,
  m3SegmentedContainerClass,
} from '../ui/materialClasses'

export const PianoExportSettings = () => {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [failed, setFailed] = useState(false)
  const piano = usePianoStore()
  const music = useFretboardStore()
  const settings = useSettingsStore()
  const input: PianoExportInput = {
    keyPc: music.keyPc,
    noteTextMode: music.noteTextMode,
    noteLabelMode: music.noteLabelMode,
    selectedScale: music.selectedScale,
    appliedChordSymbol: music.appliedChordSymbol,
    notes: piano.notes,
    startMidi: piano.exportStartMidi,
    endMidi: piano.exportEndMidi,
    backgroundOpacityPercent: settings.backgroundOpacityPercent,
    showTitle: settings.showExportTitle,
    showOctaveLabels: piano.showOctaveLabels,
  }
  const pitches = Array.from(
    { length: piano.octaves * 12 + 1 },
    (_, index) => piano.startMidi + index,
  )
  return (
    <section className={`${m3CardClass} min-w-0 overflow-hidden`}>
      <button
        type="button"
        className="m3-state-surface w-full px-4 py-4 text-left text-sm"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {t('export.settings')}
      </button>
      {expanded ? (
        <div className="grid gap-6 border-t border-[color:var(--md-sys-color-outline-variant)] p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                {t('piano.exportStart')}
                <select
                  className={m3InputClass}
                  aria-label={t('piano.exportStart')}
                  value={piano.exportStartMidi}
                  onChange={(event) =>
                    piano.setExportRange(Number(event.target.value), piano.exportEndMidi)
                  }
                >
                  {pitches.map((midi) => (
                    <option key={midi} value={midi}>
                      {getMidiLabel(midi)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                {t('piano.exportEnd')}
                <select
                  className={m3InputClass}
                  aria-label={t('piano.exportEnd')}
                  value={piano.exportEndMidi}
                  onChange={(event) =>
                    piano.setExportRange(
                      Math.min(piano.exportStartMidi, Number(event.target.value)),
                      Number(event.target.value),
                    )
                  }
                >
                  {pitches.map((midi) => (
                    <option key={midi} value={midi}>
                      {getMidiLabel(midi)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className={m3CheckboxClass}
                checked={settings.showExportTitle}
                onChange={(event) => settings.setShowExportTitle(event.target.checked)}
              />
              {t('export.showTitle')}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className={m3CheckboxClass}
                checked={piano.showOctaveLabels}
                onChange={(event) => piano.setShowOctaveLabels(event.target.checked)}
              />
              {t('piano.showOctaveLabels')}
            </label>
            <label className="flex flex-col gap-2">
              {t('export.backgroundOpacity')}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={m3InputClass}
                  min={0}
                  max={100}
                  value={settings.backgroundOpacityPercent}
                  aria-label={t('export.opacityPercentageAria')}
                  onChange={(event) =>
                    settings.handleBackgroundOpacityPercentChange(Number(event.target.value))
                  }
                />
                <span>%</span>
              </div>
            </label>
            <div className={m3SegmentedContainerClass}>
              {(['png', 'svg'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  aria-pressed={piano.exportFormat === format}
                  className={`${m3SegmentedButtonClass(piano.exportFormat === format)} flex-1`}
                  onClick={() => piano.setExportFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={m3FilledButtonClass}
              disabled={exporting}
              aria-label={t('export.exportAria', { format: piano.exportFormat.toUpperCase() })}
              onClick={async () => {
                setExporting(true)
                setFailed(false)
                try {
                  await exportPiano(input, piano.exportFormat)
                } catch {
                  setFailed(true)
                } finally {
                  setExporting(false)
                }
              }}
            >
              {piano.exportFormat.toUpperCase()}
            </button>
            {failed ? (
              <p role="alert" className="text-rose-300">
                {t('piano.exportError')}
              </p>
            ) : undefined}
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-sm text-slate-300">{t('export.preview')}</p>
            <div className="overflow-auto rounded-lg border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] p-3">
              <img
                alt={t('export.previewAlt')}
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderPianoSvg(input))}`}
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      ) : undefined}
    </section>
  )
}
