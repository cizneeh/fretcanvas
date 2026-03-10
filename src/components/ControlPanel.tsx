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

export const ControlPanel = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const noteLabelMode = useFretboardStore((state) => state.noteLabelMode)
  const selectedScale = useFretboardStore((state) => state.selectedScale)
  const selectedChord = useFretboardStore((state) => state.selectedChord)
  const setKeyPc = useFretboardStore((state) => state.setKeyPc)
  const setNoteLabelMode = useFretboardStore((state) => state.setNoteLabelMode)
  const setSelectedScale = useFretboardStore((state) => state.setSelectedScale)
  const setSelectedChord = useFretboardStore((state) => state.setSelectedChord)
  const addScaleNotes = useFretboardStore((state) => state.addScaleNotes)
  const addSelectedChordNotes = useFretboardStore((state) => state.addSelectedChordNotes)
  const clearHighlightedNotes = useFretboardStore((state) => state.clearHighlightedNotes)
  const addScaleWithinExportRange = useSettingsStore((state) => state.addScaleWithinExportRange)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const setAddScaleWithinExportRange = useSettingsStore(
    (state) => state.setAddScaleWithinExportRange,
  )
  const diatonicChordOptions = getMajorDiatonicSeventhChordOptions(keyPc)
  const selectedChordOptionId =
    selectedChord === undefined
      ? ''
      : (diatonicChordOptions.find((option) => {
          return (
            option.chord.rootPc === selectedChord.rootPc &&
            option.chord.quality === selectedChord.quality
          )
        })?.id ?? '')
  const canAddChordTones = selectedChordOptionId !== ''
  const fretRange = addScaleWithinExportRange
    ? {
        start: exportFretStart,
        end: exportFretEnd,
      }
    : undefined

  return (
    <section className="rounded-lg border border-slate-700 bg-black p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-300">Key</span>
          <select
            className="rounded-md border border-slate-700 bg-black px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
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

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-300">Mode</span>
          <select
            className="rounded-md border border-slate-700 bg-black px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
            value={noteLabelMode}
            onChange={(event) => {
              setNoteLabelMode(event.target.value as NoteLabelMode)
            }}
          >
            <option value="scale">Scale</option>
            <option value="chord">Chord</option>
          </select>
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-slate-300">{noteLabelMode === 'scale' ? 'Scale' : 'Chord'}</span>
          {noteLabelMode === 'scale' ? (
            <select
              className="rounded-md border border-slate-700 bg-black px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
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
              className="rounded-md border border-slate-700 bg-black px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
              value={selectedChordOptionId}
              onChange={(event) => {
                const nextId = event.target.value
                const nextOption = diatonicChordOptions.find((option) => option.id === nextId)
                setSelectedChord(nextOption?.chord)
              }}
            >
              <option value="">Select major diatonic 7th</option>
              {diatonicChordOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-cyan-600 bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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

        <button
          type="button"
          className="rounded-md border border-slate-600 bg-black px-4 py-2 text-sm font-medium transition hover:bg-slate-900"
          onClick={clearHighlightedNotes}
        >
          Clear
        </button>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-slate-600 bg-black accent-cyan-500"
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
