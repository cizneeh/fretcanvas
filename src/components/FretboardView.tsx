import { Fragment } from 'react'
import {
  DEGREE_LABELS,
  FRET_NUMBERS,
  getPositionId,
  MARKER_FRETS,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
} from '../libs/model'
import { NoteChip } from './NoteChip'

type FretboardViewProps = {
  keyPc: PitchClass
  highlightedPositions: Set<PositionId>
  onTogglePosition: (positionId: PositionId) => void
}

export const FretboardView = ({
  keyPc,
  highlightedPositions,
  onTogglePosition,
}: FretboardViewProps) => {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="mb-3 text-sm text-slate-300">
        Highlighted Notes: {highlightedPositions.size === 0 ? 'None' : highlightedPositions.size}
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-max rounded-md border border-slate-800 bg-slate-950 p-3">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
            }}
          >
            <div />
            {FRET_NUMBERS.map((fret) => (
              <div key={`fret-header-${fret}`} className="pb-3 text-center text-sm text-slate-300">
                {fret}
              </div>
            ))}

            {OPEN_STRINGS.map((stringInfo) => (
              <Fragment key={stringInfo.id}>
                <div className="flex h-12 items-center justify-center pr-2 text-base text-slate-300">
                  {stringInfo.name}
                </div>

                {FRET_NUMBERS.map((fret) => {
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
                        onTogglePosition(positionId)
                      }}
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-500/70" />
                      <NoteChip
                        isHighlighted={isHighlighted}
                        isRoot={isRoot}
                        label={DEGREE_LABELS[intervalFromKey]}
                      />
                    </button>
                  )
                })}
              </Fragment>
            ))}

            <div />
            {FRET_NUMBERS.map((fret) => {
              const isDoubleDot = fret === 12 || fret === 24
              const showMarker = MARKER_FRETS.includes(fret)

              return (
                <div key={`marker-${fret}`} className="flex h-6 items-center justify-center pt-2">
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
  )
}
