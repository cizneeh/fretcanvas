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
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  onExportFretStartChange: (nextStart: number) => void
  onExportFretEndChange: (nextEnd: number) => void
  onBackgroundOpacityPercentChange: (nextOpacity: number) => void
  onExportTransparentPng: () => void
}

export const FretboardView = ({
  keyPc,
  highlightedPositions,
  onTogglePosition,
  exportFretStart,
  exportFretEnd,
  backgroundOpacityPercent,
  onExportFretStartChange,
  onExportFretEndChange,
  onBackgroundOpacityPercentChange,
  onExportTransparentPng,
}: FretboardViewProps) => {
  const exportStart = Math.min(exportFretStart, exportFretEnd)
  const exportEnd = Math.max(exportFretStart, exportFretEnd)

  return (
    <section className="bg-black">
      <div className="overflow-x-auto p-4">
        <div className="min-w-max rounded-md border border-slate-700 bg-black p-3">
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
                      className="group relative flex h-12 items-center justify-center border-r border-slate-700 focus-visible:outline-none"
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

          <div className="mt-5 rounded-md border border-slate-700 bg-black/80 p-3">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span>Export Range</span>
              <span className="font-medium text-slate-100">
                Frets {exportStart} - {exportEnd}
              </span>
            </div>

            <div className="mb-2">
              <div className="mb-1 text-xs text-slate-400">Start Fret</div>
              <input
                className="range-thumb mb-3 h-2 w-full appearance-none rounded-full bg-slate-700"
                type="range"
                min={0}
                max={FRET_NUMBERS.length - 1}
                value={exportFretStart}
                onChange={(event) => {
                  onExportFretStartChange(Number(event.target.value))
                }}
                aria-label="Export start fret"
              />
            </div>
            <div className="mb-4">
              <div className="mb-1 text-xs text-slate-400">End Fret</div>
              <input
                className="range-thumb h-2 w-full appearance-none rounded-full bg-slate-700"
                type="range"
                min={0}
                max={FRET_NUMBERS.length - 1}
                value={exportFretEnd}
                onChange={(event) => {
                  onExportFretEndChange(Number(event.target.value))
                }}
                aria-label="Export end fret"
              />
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>Background Opacity</span>
                <span>{backgroundOpacityPercent}%</span>
              </div>
              <input
                className="range-thumb h-2 w-40 appearance-none rounded-full bg-slate-700"
                type="range"
                min={0}
                max={100}
                value={backgroundOpacityPercent}
                onChange={(event) => {
                  onBackgroundOpacityPercentChange(Number(event.target.value))
                }}
                aria-label="Export background opacity"
              />
            </div>

            <button
              type="button"
              className="rounded-md border border-emerald-400/80 bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              onClick={onExportTransparentPng}
            >
              Export Transparent PNG
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
