import { Fragment, useMemo, useState } from 'react'

type PitchClass = number
type ScaleId = 'major' | 'naturalMinor' | 'pentatonicMajor' | 'pentatonicMinor'
type PositionId = string

const FRET_COUNT = 24
const DEGREE_LABELS = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7']
const NOTE_LABELS = ['C', 'C#/Db', 'D', 'Eb', 'E', 'F', 'F#/Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const OPEN_STRINGS = [
  { id: '1', name: 'E', midi: 64 },
  { id: '2', name: 'B', midi: 59 },
  { id: '3', name: 'G', midi: 55 },
  { id: '4', name: 'D', midi: 50 },
  { id: '5', name: 'A', midi: 45 },
  { id: '6', name: 'E', midi: 40 },
]

const SCALE_INTERVALS: Record<ScaleId, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
}

const SCALE_LABELS: Record<ScaleId, string> = {
  major: 'Major',
  naturalMinor: 'Natural Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
}

const normalizePc = (value: number): PitchClass => ((value % 12) + 12) % 12
const POSITION_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
const getPositionId = (stringId: string, fret: number): PositionId => `${stringId}:${fret}`

function App() {
  const [keyPc, setKeyPc] = useState<PitchClass>(0)
  const [selectedScale, setSelectedScale] = useState<ScaleId | undefined>('major')
  const [highlightedPositions, setHighlightedPositions] = useState<Set<PositionId>>(() => new Set())

  const fretNumbers = useMemo(() => Array.from({ length: FRET_COUNT + 1 }, (_, index) => index), [])
  const markerFrets = useMemo(() => POSITION_MARKERS.filter((fret) => fret <= FRET_COUNT), [])

  const addScaleNotes = () => {
    if (selectedScale === undefined) {
      return
    }

    const pcsToAdd = new Set(
      SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
    )

    setHighlightedPositions((current) => {
      const next = new Set(current)

      for (const stringInfo of OPEN_STRINGS) {
        for (const fret of fretNumbers) {
          const midi = stringInfo.midi + fret
          const pitchClass = normalizePc(midi)

          if (pcsToAdd.has(pitchClass)) {
            next.add(getPositionId(stringInfo.id, fret))
          }
        }
      }

      return next
    })
  }

  const clearHighlightedNotes = () => {
    setHighlightedPositions(new Set())
  }

  const togglePosition = (positionId: PositionId) => {
    setHighlightedPositions((current) => {
      const next = new Set(current)
      if (next.has(positionId)) {
        next.delete(positionId)
      } else {
        next.add(positionId)
      }
      return next
    })
  }

  return (
    <main className="min-h-screen bg-[#0b0f17] px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Fretmap</h1>
          <p className="text-sm text-slate-300">
            Key基準の度数でノートを表示します。クリックで手動追加、スケールは一括追加です。
          </p>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-slate-300">Key</span>
              <select
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-500 focus:ring-2"
                value={keyPc}
                onChange={(event) => {
                  setKeyPc(Number(event.target.value))
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
              className="rounded-md border border-slate-600 bg-slate-950 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
              onClick={clearHighlightedNotes}
            >
              Clear
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="mb-3 text-sm text-slate-300">
            Highlighted Notes:{' '}
            {highlightedPositions.size === 0 ? 'None' : highlightedPositions.size}
          </p>

          <div className="overflow-x-auto">
            <div className="min-w-max rounded-md border border-slate-800 bg-slate-950 p-3">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `2rem repeat(${FRET_COUNT + 1}, minmax(3.5rem, 3.5rem))`,
                }}
              >
                <div />
                {fretNumbers.map((fret) => (
                  <div
                    key={`fret-header-${fret}`}
                    className="pb-3 text-center text-sm text-slate-300"
                  >
                    {fret}
                  </div>
                ))}

                {OPEN_STRINGS.map((stringInfo) => (
                  <Fragment key={stringInfo.id}>
                    <div className="flex h-12 items-center justify-center pr-2 text-base text-slate-300">
                      {stringInfo.name}
                    </div>

                    {fretNumbers.map((fret) => {
                      const positionId = getPositionId(stringInfo.id, fret)
                      const pitchClass = normalizePc(stringInfo.midi + fret)
                      const isHighlighted = highlightedPositions.has(positionId)
                      const intervalFromKey = normalizePc(pitchClass - keyPc)
                      const isRoot = intervalFromKey === 0

                      return (
                        <button
                          key={`${stringInfo.id}-${fret}`}
                          type="button"
                          className="group relative flex h-12 items-center justify-center border-r border-slate-700 transition hover:bg-slate-800/60"
                          onClick={() => {
                            togglePosition(positionId)
                          }}
                        >
                          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-500/70" />

                          {isHighlighted ? (
                            <span
                              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold transition-transform duration-150 group-hover:scale-110 ${
                                isRoot
                                  ? 'border-rose-200/80 bg-rose-500/75 text-white'
                                  : 'border-cyan-100/70 bg-cyan-400/70 text-slate-950'
                              }`}
                            >
                              {DEGREE_LABELS[intervalFromKey]}
                            </span>
                          ) : (
                            <span className="pointer-events-none absolute z-10 h-9 w-9 rounded-full border border-slate-300/25 bg-slate-300/15 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                          )}
                        </button>
                      )
                    })}
                  </Fragment>
                ))}

                <div />
                {fretNumbers.map((fret) => {
                  const isDoubleDot = fret === 12 || fret === 24
                  const showMarker = markerFrets.includes(fret)

                  return (
                    <div
                      key={`marker-${fret}`}
                      className="flex h-6 items-center justify-center pt-2"
                    >
                      {showMarker ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          {isDoubleDot ? (
                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                          ) : undefined}
                        </span>
                      ) : undefined}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
