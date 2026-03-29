import { useShallow } from 'zustand/react/shallow'
import { getChordInputErrorMessage, getScaleLabel } from '../i18n/config'
import { useI18n } from '../i18n/useI18n'
import {
  getChordPitchClasses,
  getChordToneLabel,
  getChordTonePitchClasses,
  getMajorDiatonicSeventhChordOptions,
  getScaleIntervalLabelFromRoot,
  getScalePitchClasses,
  parseChordInput,
} from '../libs/chordAnalysis'
import {
  NOTE_LABELS,
  type NoteLabelMode,
  type NoteTextMode,
  type PitchClass,
  type ScaleId,
} from '../libs/musicCore'
import { getAbsoluteNoteLabelByKey } from '../libs/noteDisplay'
import { getNotePalette } from '../libs/notePalette'
import { useFretboardStore } from '../stores/fretboardStore'
import { useSettingsStore } from '../stores/settingsStore'
import {
  m3CardClass,
  m3CheckboxClass,
  m3FieldLabelClass,
  m3FilledButtonClass,
  m3InputClass,
  m3OutlinedButtonClass,
  m3SegmentedButtonClass,
  m3SegmentedContainerClass,
  m3SelectChevronClass,
  m3SelectClass,
} from './ui/materialClasses'

export const ControlPanel = () => {
  const { locale, t } = useI18n()
  const {
    keyPc,
    noteLabelMode,
    noteTextMode,
    selectedScale,
    appliedChordSymbol,
    chordInput,
    setKeyPc,
    setNoteLabelMode,
    setNoteTextMode,
    setSelectedScale,
    setAppliedChordSymbol,
    setChordInput,
    applyChordInput,
    addScaleNotes,
    addAppliedChordNotes,
    clearHighlightedNotes,
    clearHighlightedNotesOutsideFretRange,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      noteTextMode: state.noteTextMode,
      selectedScale: state.selectedScale,
      appliedChordSymbol: state.appliedChordSymbol,
      chordInput: state.chordInput,
      setKeyPc: state.setKeyPc,
      setNoteLabelMode: state.setNoteLabelMode,
      setNoteTextMode: state.setNoteTextMode,
      setSelectedScale: state.setSelectedScale,
      setAppliedChordSymbol: state.setAppliedChordSymbol,
      setChordInput: state.setChordInput,
      applyChordInput: state.applyChordInput,
      addScaleNotes: state.addScaleNotes,
      addAppliedChordNotes: state.addAppliedChordNotes,
      clearHighlightedNotes: state.clearHighlightedNotes,
      clearHighlightedNotesOutsideFretRange: state.clearHighlightedNotesOutsideFretRange,
    })),
  )
  const {
    showExportRangeHighlight,
    exportFretStart,
    exportFretEnd,
    setShowExportRangeHighlight,
  } = useSettingsStore(
    useShallow((state) => ({
      showExportRangeHighlight: state.showExportRangeHighlight,
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      setShowExportRangeHighlight: state.setShowExportRangeHighlight,
    })),
  )
  const diatonicChordOptions = getMajorDiatonicSeventhChordOptions(keyPc)
  const diatonicSelectValue =
    appliedChordSymbol !== undefined &&
    diatonicChordOptions.some((option) => option.symbol === appliedChordSymbol)
      ? appliedChordSymbol
      : ''
  const trimmedChordInput = chordInput.trim()
  const parsedChordInput = trimmedChordInput === '' ? undefined : parseChordInput(trimmedChordInput)
  const chordInputError =
    parsedChordInput !== undefined && 'errorKey' in parsedChordInput
      ? getChordInputErrorMessage(locale, parsedChordInput.errorKey)
      : undefined
  const canApplyChordInput =
    parsedChordInput !== undefined && 'symbol' in parsedChordInput && chordInputError === undefined
  const canAddChordTones = appliedChordSymbol !== undefined
  const exportFretRange = {
    start: exportFretStart,
    end: exportFretEnd,
  }
  const modeOptions: { value: NoteLabelMode; label: string }[] = [
    { value: 'scale', label: t('control.scale') },
    { value: 'chord', label: t('control.chord') },
  ]
  const labelOptions: { value: NoteTextMode; label: string }[] = [
    { value: 'interval', label: t('control.interval') },
    { value: 'absolute', label: t('control.absolute') },
    { value: 'combined', label: t('control.combined') },
  ]
  const baseScaleOptions: ScaleId[] = [
    'major',
    'pentatonicMajor',
    'pentatonicMinor',
    'blues',
    'naturalMinor',
    'harmonicMinor',
    'melodicMinor',
  ]
  const modeScaleOptions: ScaleId[] = [
    'ionian',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
  ]
  const chordTonePitchClasses =
    appliedChordSymbol === undefined
      ? new Set<PitchClass>()
      : new Set(getChordTonePitchClasses(appliedChordSymbol))
  const appliedChordNotes =
    appliedChordSymbol === undefined
      ? []
      : Array.from(new Set(getChordPitchClasses(appliedChordSymbol))).map((pitchClass) => ({
          pitchClass,
          absoluteLabel: getAbsoluteNoteLabelByKey(pitchClass, keyPc),
          intervalLabel: getChordToneLabel(pitchClass, appliedChordSymbol),
          isChordTone: chordTonePitchClasses.has(pitchClass),
        }))
  const selectedScaleNotes =
    selectedScale === undefined
      ? []
      : getScalePitchClasses(keyPc, selectedScale).map((pitchClass) => ({
          pitchClass,
          absoluteLabel: getAbsoluteNoteLabelByKey(pitchClass, keyPc),
          intervalLabel: getScaleIntervalLabelFromRoot(pitchClass, keyPc, selectedScale),
          isRoot: pitchClass === keyPc,
        }))
  const rootTonePalette = getNotePalette('root')
  const defaultTonePalette = getNotePalette('default')
  const tensionTonePalette = getNotePalette('tension')
  const manualInputTooltip = t('control.manualInputTooltip')

  return (
    <section className={`${m3CardClass} w-full max-w-[88rem] p-4`}>
      <div className="grid gap-5 xl:grid-cols-[minmax(14rem,15rem)_minmax(0,52rem)_minmax(14rem,16rem)]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={m3FieldLabelClass}>{t('control.key')}</span>
            <div className="relative">
              <select
                className={m3SelectClass}
                value={keyPc}
                onChange={(event) => {
                  setKeyPc(Number(event.target.value) as PitchClass)
                }}
              >
                {NOTE_LABELS.map((note, pitchClass) => (
                  <option key={note} value={pitchClass}>
                    {note}
                  </option>
                ))}
              </select>
              <svg
                className={m3SelectChevronClass}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6.5L8 10L12 6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <span className={m3FieldLabelClass}>{t('control.noteLabels')}</span>
            <div className={`${m3SegmentedContainerClass} w-full`}>
              {labelOptions.map((labelOption) => (
                <button
                  key={labelOption.value}
                  type="button"
                  aria-pressed={noteTextMode === labelOption.value}
                  className={`${m3SegmentedButtonClass(noteTextMode === labelOption.value)} flex-1 text-center`}
                  onClick={() => {
                    setNoteTextMode(labelOption.value)
                  }}
                >
                  {labelOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={m3FieldLabelClass}>{t('control.mode')}</span>
            <div className={`${m3SegmentedContainerClass} w-full`}>
              {modeOptions.map((modeOption) => (
                <button
                  key={modeOption.value}
                  type="button"
                  aria-pressed={noteLabelMode === modeOption.value}
                  className={`${m3SegmentedButtonClass(noteLabelMode === modeOption.value)} flex-1 text-center`}
                  onClick={() => {
                    setNoteLabelMode(modeOption.value)
                  }}
                >
                  {modeOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] p-3">
            {noteLabelMode === 'scale' ? (
              <div className="flex flex-col gap-2">
                <span className={m3FieldLabelClass}>{t('control.scale')}</span>
                <div className="relative">
                  <select
                    className={m3SelectClass}
                    value={selectedScale ?? ''}
                    onChange={(event) => {
                      const value = event.target.value as ScaleId | ''
                      setSelectedScale(value === '' ? undefined : value)
                    }}
                  >
                    <option value="">{t('control.selectScale')}</option>
                    {baseScaleOptions.map((scaleId) => (
                      <option key={scaleId} value={scaleId}>
                        {getScaleLabel(locale, scaleId)}
                      </option>
                    ))}
                    <optgroup label={t('control.modesGroup')}>
                      {modeScaleOptions.map((scaleId) => (
                        <option key={scaleId} value={scaleId}>
                          {getScaleLabel(locale, scaleId)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <svg
                    className={m3SelectChevronClass}
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6.5L8 10L12 6.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {selectedScaleNotes.length > 0 ? (
                  <div className="rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2">
                    <div className={`mb-2 ${m3FieldLabelClass}`}>{t('control.scaleNotes')}</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedScaleNotes.map((note) => {
                        const palette = note.isRoot ? rootTonePalette : defaultTonePalette

                        return (
                          <span
                            key={`${note.pitchClass}-${note.intervalLabel}`}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${palette.web.previewToneClass}`}
                          >
                            <span>{note.absoluteLabel}</span>
                            <span className="text-[10px] opacity-80">{note.intervalLabel}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : undefined}
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start">
                <div className="flex flex-col gap-2">
                  <span className={m3FieldLabelClass}>{t('control.selectDiatonicChord')}</span>
                  <div className="relative">
                    <select
                      className={m3SelectClass}
                      value={diatonicSelectValue}
                      onChange={(event) => {
                        const nextSymbol = event.target.value
                        setAppliedChordSymbol(nextSymbol === '' ? undefined : nextSymbol)
                      }}
                    >
                      <option value="">{t('control.selectDiatonicChordPlaceholder')}</option>
                      {diatonicChordOptions.map((option) => (
                        <option key={option.symbol} value={option.symbol}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className={m3SelectChevronClass}
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6.5L8 10L12 6.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={m3FieldLabelClass}>{t('control.manualInput')}</span>
                    <div className="group relative inline-flex">
                      <button
                        type="button"
                        aria-label={t('control.examples')}
                        className="m3-focus-ring inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--md-sys-color-outline-variant)] text-[color:var(--md-sys-color-on-surface-variant)]/88 transition-colors hover:border-[color:var(--md-sys-color-outline)] hover:text-[color:var(--md-sys-color-on-surface)] focus-visible:border-[color:var(--md-sys-color-primary)] focus-visible:text-[color:var(--md-sys-color-on-surface)]"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                          <path
                            d="M8 6.4V11"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                          <circle cx="8" cy="4.4" r="0.8" fill="currentColor" />
                        </svg>
                      </button>
                      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-[18rem] rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-high)] px-3 py-2.5 text-xs leading-5 text-[color:var(--md-sys-color-on-surface-variant)] opacity-0 shadow-[var(--md-elevation-2)] transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                        <div className="whitespace-pre-line">{manualInputTooltip}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      className={m3InputClass}
                      value={chordInput}
                      placeholder={t('control.manualInputPlaceholder')}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && canApplyChordInput) {
                          event.preventDefault()
                          applyChordInput()
                        }
                      }}
                      onChange={(event) => {
                        setChordInput(event.target.value)
                      }}
                    />
                    <button
                      type="button"
                      className={`${m3OutlinedButtonClass} shrink-0 whitespace-nowrap sm:self-start`}
                      onClick={applyChordInput}
                      disabled={!canApplyChordInput}
                    >
                      {t('control.apply')}
                    </button>
                  </div>
                  {chordInputError !== undefined ? (
                    <div className="text-sm text-rose-300">{chordInputError}</div>
                  ) : undefined}
                  {/* 入力欄の文字列そのものではなく、Apply 済みの appliedChordSymbol を表示する。 */}
                  <div className="rounded-[var(--md-shape-md)] border border-transparent bg-[color:var(--md-sys-color-secondary-container)] px-3 py-2">
                    <div className="text-[12px] font-medium tracking-[0.01em] text-[color:var(--md-sys-color-on-secondary-container)]/72">
                      {t('control.appliedChord')}
                    </div>
                    <div
                      className={`mt-0.5 ${
                        appliedChordSymbol === undefined
                          ? 'text-sm font-medium text-[color:var(--md-sys-color-on-secondary-container)]/55'
                          : 'text-sm font-medium text-[color:var(--md-sys-color-on-secondary-container)]'
                      }`}
                    >
                      {appliedChordSymbol ?? t('control.noChordApplied')}
                    </div>
                  </div>
                  {appliedChordNotes.length > 0 ? (
                    <div className="rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2">
                      <div className={`mb-2 ${m3FieldLabelClass}`}>{t('control.chordNotes')}</div>
                      <div className="flex flex-wrap gap-2">
                        {appliedChordNotes.map((note) => {
                          const palette =
                            note.intervalLabel === 'R'
                              ? rootTonePalette
                              : note.isChordTone
                                ? defaultTonePalette
                                : tensionTonePalette

                          return (
                            <span
                              key={`${note.pitchClass}-${note.intervalLabel}`}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${palette.web.previewToneClass}`}
                            >
                              <span>{note.absoluteLabel}</span>
                              <span className="text-[10px] opacity-80">{note.intervalLabel}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ) : undefined}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:justify-between">
          <div className="flex flex-col gap-2">
            {noteLabelMode === 'scale' ? (
              <div className="flex flex-col items-stretch gap-2">
                <button
                  type="button"
                  className={`${m3FilledButtonClass} min-w-0`}
                  onClick={() => {
                    addScaleNotes()
                  }}
                  disabled={selectedScale === undefined}
                >
                  {t('control.addScaleNotes')}
                </button>
                <button
                  type="button"
                  className={`${m3OutlinedButtonClass} min-h-8 self-end px-3 py-1.5 text-xs`}
                  onClick={() => {
                    addScaleNotes({ fretRange: exportFretRange })
                  }}
                  disabled={selectedScale === undefined}
                >
                  {t('control.addInExportRange')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-2">
                <button
                  type="button"
                  className={`${m3FilledButtonClass} min-w-0`}
                  onClick={() => {
                    if (canAddChordTones) {
                      addAppliedChordNotes()
                    }
                  }}
                  disabled={!canAddChordTones}
                >
                  {t('control.addChordTones')}
                </button>
                <button
                  type="button"
                  className={`${m3OutlinedButtonClass} min-h-8 self-end px-3 py-1.5 text-xs`}
                  onClick={() => {
                    if (canAddChordTones) {
                      addAppliedChordNotes({ fretRange: exportFretRange })
                    }
                  }}
                  disabled={!canAddChordTones}
                >
                  {t('control.addInExportRange')}
                </button>
              </div>
            )}

            <button type="button" className={m3OutlinedButtonClass} onClick={clearHighlightedNotes}>
              {t('common.clear')}
            </button>
            <button
              type="button"
              className={`${m3OutlinedButtonClass} min-h-8 self-end px-3 py-1.5 text-xs`}
              onClick={() => {
                clearHighlightedNotesOutsideFretRange(exportFretRange)
              }}
            >
              {t('common.clearOutsideExportRange')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[color:var(--md-sys-color-outline-variant)] pt-4">
        <label className="flex items-center gap-2 text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
          <input
            type="checkbox"
            className={m3CheckboxClass}
            checked={showExportRangeHighlight}
            onChange={(event) => {
              setShowExportRangeHighlight(event.target.checked)
            }}
          />
          {t('control.showExportRangeHighlights')}
        </label>
      </div>
    </section>
  )
}
