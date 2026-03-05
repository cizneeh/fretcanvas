import { NOTE_LABELS, type PitchClass, SCALE_LABELS, type ScaleId } from '../libs/model'

type ControlPanelProps = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  onKeyChange: (pitchClass: PitchClass) => void
  onScaleChange: (scaleId: ScaleId | undefined) => void
  onAddScaleNotes: () => void
  onClearNotes: () => void
}

export const ControlPanel = ({
  keyPc,
  selectedScale,
  onKeyChange,
  onScaleChange,
  onAddScaleNotes,
  onClearNotes,
}: ControlPanelProps) => {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-slate-300">Key</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
            value={keyPc}
            onChange={(event) => {
              onKeyChange(Number(event.target.value))
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
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
            value={selectedScale ?? ''}
            onChange={(event) => {
              const value = event.target.value as ScaleId | ''
              onScaleChange(value === '' ? undefined : value)
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
          onClick={onAddScaleNotes}
          disabled={selectedScale === undefined}
        >
          Add Scale Notes
        </button>

        <button
          type="button"
          className="rounded-md border border-slate-600 bg-slate-950 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          onClick={onClearNotes}
        >
          Clear
        </button>
      </div>
    </section>
  )
}
