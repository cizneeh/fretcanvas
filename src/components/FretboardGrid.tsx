import { Fragment, type ReactNode } from 'react'
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

type FretboardGridProps = {
  keyPc: PitchClass
  highlightedPositions: Set<PositionId>
  exportFretStart: number
  exportFretEnd: number
  startHighlightFret: number
  onTogglePosition: (positionId: PositionId) => void
  onSelectClosestHandleToFret: (fret: number) => void
  rangeTrack: ReactNode
}

export const FretboardGrid = ({
  keyPc,
  highlightedPositions,
  exportFretStart,
  exportFretEnd,
  startHighlightFret,
  onTogglePosition,
  onSelectClosestHandleToFret,
  rangeTrack,
}: FretboardGridProps) => {
  const startMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-cyan-300'
  const endMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-emerald-300'

  return (
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
            const isStartFret = fret === startHighlightFret
            const isEndFret = fret === exportFretEnd
            const isStartAtNutLine = exportFretStart === 0 && fret === 0

            return (
              <button
                key={`${stringInfo.id}-${fret}`}
                type="button"
                className="group relative flex h-12 items-center justify-center border-r border-slate-700 focus-visible:outline-none"
                onClick={() => {
                  onTogglePosition(positionId)
                }}
              >
                <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-500/70" />
                {isStartAtNutLine ? (
                  <span
                    className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[2px] ${startMarkerColor}`}
                  />
                ) : undefined}
                {isStartFret && !isStartAtNutLine ? (
                  <span
                    className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${startMarkerColor}`}
                  />
                ) : undefined}
                {isEndFret ? (
                  <span
                    className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${endMarkerColor}`}
                  />
                ) : undefined}
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
          <button
            key={`marker-${fret}`}
            type="button"
            className="relative flex h-6 items-center justify-center pt-2 focus-visible:outline-none"
            data-testid={`fret-selector-${fret}`}
            onClick={() => {
              onSelectClosestHandleToFret(fret)
            }}
          >
            {showMarker ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                {isDoubleDot ? <span className="h-2 w-2 rounded-full bg-slate-500" /> : undefined}
              </span>
            ) : undefined}
          </button>
        )
      })}

      {rangeTrack}
    </div>
  )
}
