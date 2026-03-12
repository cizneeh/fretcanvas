import { useShallow } from 'zustand/react/shallow'
import {
  getMajorDiatonicSeventhChordOptions,
  NOTE_LABELS,
  type NoteLabelMode,
  type NoteTextMode,
  type PitchClass,
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
    selectedChordSymbol,
    setKeyPc,
    setNoteLabelMode,
    setNoteTextMode,
    setSelectedScale,
    setSelectedChordSymbol,
    addScaleNotes,
    addSelectedChordNotes,
    clearHighlightedNotes,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      noteTextMode: state.noteTextMode,
      selectedScale: state.selectedScale,
      selectedChordSymbol: state.selectedChordSymbol,
      setKeyPc: state.setKeyPc,
      setNoteLabelMode: state.setNoteLabelMode,
      setNoteTextMode: state.setNoteTextMode,
      setSelectedScale: state.setSelectedScale,
      setSelectedChordSymbol: state.setSelectedChordSymbol,
      addScaleNotes: state.addScaleNotes,
      addSelectedChordNotes: state.addSelectedChordNotes,
      clearHighlightedNotes: state.clearHighlightedNotes,
    })),
  )
  const {
    addScaleWithinExportRange,
    exportFretStart,
    exportFretEnd,
    setAddScaleWithinExportRange,
  } = useSettingsStore(
    useShallow((state) => ({
      addScaleWithinExportRange: state.addScaleWithinExportRange,
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      setAddScaleWithinExportRange: state.setAddScaleWithinExportRange,
    })),
  )
  const diatonicChordOptions = getMajorDiatonicSeventhChordOptions(keyPc)
  const canAddChordTones = selectedChordSymbol !== undefined
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
      <div className="grid gap-4 xl:grid-cols-[minmax(12rem,14rem)_minmax(10.5rem,11.5rem)_minmax(14rem,1fr)_minmax(16rem,17.5rem)]">
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

        <div className="flex w-full max-w-[11.5rem] flex-col gap-3">
          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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
        </div>

        <div className="flex flex-col gap-2">
          <span className={m3FieldLabelClass}>{noteLabelMode === 'scale' ? 'Scale' : 'Chord'}</span>
          {noteLabelMode === 'scale' ? (
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
          ) : (
            <div className="relative">
              <select
                className={m3SelectClass}
                value={selectedChordSymbol ?? ''}
                onChange={(event) => {
                  const nextSymbol = event.target.value
                  setSelectedChordSymbol(nextSymbol === '' ? undefined : nextSymbol)
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
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 self-end">
          <button
            type="button"
            className={m3FilledButtonClass}
            onClick={() => {
              if (noteLabelMode === 'scale') {
                addScaleNotes({ fretRange })
                return
              }

              if (canAddChordTones) {
                addSelectedChordNotes({ fretRange })
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

      <label className="mt-4 inline-flex items-center gap-2 border-t border-[color:var(--md-sys-color-outline-variant)] pt-4 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
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
    </section>
  )
}
