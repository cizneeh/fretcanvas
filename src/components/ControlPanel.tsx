import { useShallow } from 'zustand/react/shallow'
import {
  getMajorDiatonicSeventhChordOptions,
  NOTE_LABELS,
  type NoteLabelMode,
  type NoteTextMode,
  type PitchClass,
  parseChordInput,
  SCALE_LABELS,
  type ScaleId,
} from '../libs/model'
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
  const {
    keyPc,
    noteLabelMode,
    noteTextMode,
    selectedScale,
    activeChordSymbol,
    chordInput,
    setKeyPc,
    setNoteLabelMode,
    setNoteTextMode,
    setSelectedScale,
    setActiveChordSymbol,
    setChordInput,
    applyChordInput,
    addScaleNotes,
    addActiveChordNotes,
    clearHighlightedNotes,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      noteTextMode: state.noteTextMode,
      selectedScale: state.selectedScale,
      activeChordSymbol: state.activeChordSymbol,
      chordInput: state.chordInput,
      setKeyPc: state.setKeyPc,
      setNoteLabelMode: state.setNoteLabelMode,
      setNoteTextMode: state.setNoteTextMode,
      setSelectedScale: state.setSelectedScale,
      setActiveChordSymbol: state.setActiveChordSymbol,
      setChordInput: state.setChordInput,
      applyChordInput: state.applyChordInput,
      addScaleNotes: state.addScaleNotes,
      addActiveChordNotes: state.addActiveChordNotes,
      clearHighlightedNotes: state.clearHighlightedNotes,
    })),
  )
  const {
    addScaleWithinExportRange,
    showExportRangeHighlight,
    exportFretStart,
    exportFretEnd,
    setAddScaleWithinExportRange,
    setShowExportRangeHighlight,
  } = useSettingsStore(
    useShallow((state) => ({
      addScaleWithinExportRange: state.addScaleWithinExportRange,
      showExportRangeHighlight: state.showExportRangeHighlight,
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      setAddScaleWithinExportRange: state.setAddScaleWithinExportRange,
      setShowExportRangeHighlight: state.setShowExportRangeHighlight,
    })),
  )
  const diatonicChordOptions = getMajorDiatonicSeventhChordOptions(keyPc)
  const diatonicSelectValue =
    activeChordSymbol !== undefined &&
    diatonicChordOptions.some((option) => option.symbol === activeChordSymbol)
      ? activeChordSymbol
      : ''
  const trimmedChordInput = chordInput.trim()
  const parsedChordInput = trimmedChordInput === '' ? undefined : parseChordInput(trimmedChordInput)
  const chordInputError =
    parsedChordInput !== undefined && 'error' in parsedChordInput
      ? parsedChordInput.error
      : undefined
  const canApplyChordInput =
    parsedChordInput !== undefined && 'symbol' in parsedChordInput && chordInputError === undefined
  const canAddChordTones = activeChordSymbol !== undefined
  const fretRange = addScaleWithinExportRange
    ? {
        start: exportFretStart,
        end: exportFretEnd,
      }
    : undefined
  const modeOptions: { value: NoteLabelMode; label: string }[] = [
    { value: 'scale', label: 'Scale' },
    { value: 'chord', label: 'Chord' },
  ]
  const labelOptions: { value: NoteTextMode; label: string }[] = [
    { value: 'interval', label: 'Interval' },
    { value: 'absolute', label: 'Absolute' },
  ]

  return (
    <section className={`${m3CardClass} p-4`}>
      <div className="grid gap-5 xl:grid-cols-[minmax(14rem,15rem)_minmax(0,1fr)_minmax(13rem,14rem)]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={m3FieldLabelClass}>Key</span>
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

          <div className="flex max-w-[11.5rem] flex-col gap-2">
            <span className={m3FieldLabelClass}>Note Labels</span>
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

          <div className="flex max-w-[12rem] flex-col gap-2">
            <span className={m3FieldLabelClass}>Mode</span>
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
                <span className={m3FieldLabelClass}>Scale</span>
                <div className="relative">
                  <select
                    className={m3SelectClass}
                    value={selectedScale ?? ''}
                    onChange={(event) => {
                      const value = event.target.value as ScaleId | ''
                      setSelectedScale(value === '' ? undefined : value)
                    }}
                  >
                    <option value="">Select scale</option>
                    {Object.entries(SCALE_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
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
            ) : (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start">
                <div className="flex flex-col gap-2">
                  <span className={m3FieldLabelClass}>Select Diatonic Chord</span>
                  <div className="relative">
                    <select
                      className={m3SelectClass}
                      value={diatonicSelectValue}
                      onChange={(event) => {
                        const nextSymbol = event.target.value
                        setActiveChordSymbol(nextSymbol === '' ? undefined : nextSymbol)
                      }}
                    >
                      <option value="">Select major diatonic 7th</option>
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
                  <span className={m3FieldLabelClass}>Custom Input</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      className={m3InputClass}
                      value={chordInput}
                      placeholder="Cmaj7, Dm7b5, G7#11..."
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
                      Apply
                    </button>
                  </div>
                  {chordInputError !== undefined ? (
                    <div className="text-xs text-rose-300">{chordInputError}</div>
                  ) : undefined}
                  {/* 入力欄の文字列そのものではなく、Apply 済みの activeChordSymbol を表示する。 */}
                  <div className="rounded-[var(--md-shape-md)] border border-transparent bg-[color:var(--md-sys-color-secondary-container)] px-3 py-2">
                    <div className="text-[11px] font-medium tracking-[0.01em] text-[color:var(--md-sys-color-on-secondary-container)]/72">
                      Applied Chord
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-[color:var(--md-sys-color-on-secondary-container)]">
                      {activeChordSymbol ?? 'No chord applied'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:justify-between">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={m3FilledButtonClass}
              onClick={() => {
                if (noteLabelMode === 'scale') {
                  addScaleNotes({ fretRange })
                  return
                }

                if (canAddChordTones) {
                  addActiveChordNotes({ fretRange })
                }
              }}
              disabled={noteLabelMode === 'scale' ? selectedScale === undefined : !canAddChordTones}
            >
              {noteLabelMode === 'scale' ? 'Add Scale Notes' : 'Add Chord Tones'}
            </button>

            <button type="button" className={m3OutlinedButtonClass} onClick={clearHighlightedNotes}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[color:var(--md-sys-color-outline-variant)] pt-4">
        <label className="flex items-center gap-2 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
          <input
            type="checkbox"
            className={m3CheckboxClass}
            checked={addScaleWithinExportRange}
            onChange={(event) => {
              setAddScaleWithinExportRange(event.target.checked)
            }}
          />
          Add notes within export range only
        </label>

        <label className="flex items-center gap-2 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
          <input
            type="checkbox"
            className={m3CheckboxClass}
            checked={showExportRangeHighlight}
            onChange={(event) => {
              setShowExportRangeHighlight(event.target.checked)
            }}
          />
          Show export range highlights
        </label>
      </div>
    </section>
  )
}
