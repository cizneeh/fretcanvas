import { useShallow } from 'zustand/react/shallow'
import {
  getMajorDiatonicSeventhChordOptions,
  NOTE_LABELS,
  type NoteLabelMode,
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
  m3SelectClass,
} from './ui/materialClasses'

export const ControlPanel = () => {
  const {
    keyPc,
    noteLabelMode,
    selectedScale,
    selectedChordSymbol,
    setKeyPc,
    setNoteLabelMode,
    setSelectedScale,
    setSelectedChordSymbol,
    addScaleNotes,
    addSelectedChordNotes,
    clearHighlightedNotes,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      selectedScale: state.selectedScale,
      selectedChordSymbol: state.selectedChordSymbol,
      setKeyPc: state.setKeyPc,
      setNoteLabelMode: state.setNoteLabelMode,
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

  return (
    <section className={`${m3CardClass} p-4`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(12rem,14rem)_max-content_minmax(14rem,1fr)_minmax(16rem,17.5rem)]">
        <label className="flex flex-col gap-2">
          <span className={m3FieldLabelClass}>Key</span>
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
        </label>

        <div className="flex w-fit flex-col gap-2">
          <span className={m3FieldLabelClass}>Mode</span>
          <div className={m3SegmentedContainerClass}>
            {modeOptions.map((modeOption) => (
              <button
                key={modeOption.value}
                type="button"
                aria-pressed={noteLabelMode === modeOption.value}
                className={m3SegmentedButtonClass(noteLabelMode === modeOption.value)}
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
          <span className={m3FieldLabelClass}>{noteLabelMode === 'scale' ? 'Scale' : 'Chord'}</span>
          {noteLabelMode === 'scale' ? (
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
          ) : (
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
