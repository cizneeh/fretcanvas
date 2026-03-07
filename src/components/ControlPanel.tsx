import { NOTE_LABELS, type PitchClass, SCALE_LABELS, type ScaleId } from '../libs/model'
import { useFretboardStore } from '../stores/fretboardStore'

export const ControlPanel = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const selectedScale = useFretboardStore((state) => state.selectedScale)
  const addScaleWithinExportRange = useFretboardStore((state) => state.addScaleWithinExportRange)
  const setKeyPc = useFretboardStore((state) => state.setKeyPc)
  const setSelectedScale = useFretboardStore((state) => state.setSelectedScale)
  const setAddScaleWithinExportRange = useFretboardStore(
    (state) => state.setAddScaleWithinExportRange,
  )
  const addScaleNotes = useFretboardStore((state) => state.addScaleNotes)
  const clearHighlightedNotes = useFretboardStore((state) => state.clearHighlightedNotes)

  return (
    <section className="rounded-lg border border-slate-700 bg-black p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
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
          <span className="text-slate-300">Scale</span>
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
        </label>

        <button
          type="button"
          className="rounded-md border border-cyan-600 bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={addScaleNotes}
          disabled={selectedScale === undefined}
        >
          Add Scale Notes
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
        Add scale notes within export range only
      </label>
    </section>
  )
}
