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
  const modeOptions: { value: NoteLabelMode; label: string }[] = [
    { value: 'scale', label: 'Scale' },
    { value: 'chord', label: 'Chord' },
  ]
  const interactiveSurfaceClass =
    'rounded-md border border-zinc-500 bg-zinc-700/90 text-zinc-50 transition-colors hover:bg-zinc-600'
  const interactiveSelectClass = `${interactiveSurfaceClass} w-full px-3 py-2 outline-none ring-cyan-500 focus:ring-2`
  const interactiveButtonClass = `${interactiveSurfaceClass} px-4 py-2 text-sm font-medium`
  const primaryButtonClass =
    'rounded-md border border-cyan-600 bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400'

  return (
    <section className="rounded-lg border border-zinc-600 bg-zinc-800/70 p-4 backdrop-blur-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-zinc-200">Key</span>
            <select
              className={interactiveSelectClass}
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

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-zinc-200">Mode</span>
            <div className="inline-flex w-fit rounded-md border border-zinc-500 bg-zinc-700/90 p-1">
              {modeOptions.map((modeOption) => (
                <button
                  key={modeOption.value}
                  type="button"
                  aria-pressed={noteLabelMode === modeOption.value}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                    noteLabelMode === modeOption.value
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-zinc-100 hover:bg-zinc-600'
                  }`}
                  onClick={() => {
                    setNoteLabelMode(modeOption.value)
                  }}
                >
                  {modeOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-zinc-200">{noteLabelMode === 'scale' ? 'Scale' : 'Chord'}</span>
            {noteLabelMode === 'scale' ? (
              <select
                className={interactiveSelectClass}
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
                className={interactiveSelectClass}
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
        </div>

        <div className="flex flex-col gap-2 lg:min-w-44 lg:justify-end">
          <button
            type="button"
            className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
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

          <button type="button" className={interactiveButtonClass} onClick={clearHighlightedNotes}>
            Clear
          </button>
        </div>
      </div>

      <label className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-200">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-zinc-400 bg-zinc-700 accent-cyan-500"
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
