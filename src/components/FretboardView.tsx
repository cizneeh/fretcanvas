import { Fragment, type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
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
  const trackRef = useRef<HTMLDivElement | undefined>(undefined)
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | undefined>(undefined)
  const [hoverPreview, setHoverPreview] = useState<
    { handle: 'start' | 'end'; fret: number } | undefined
  >(undefined)

  const maxFret = FRET_NUMBERS.length - 1
  const fretCellCount = FRET_NUMBERS.length
  const clampFret = (value: number) => Math.max(0, Math.min(value, maxFret))
  const toPercentFromFretCenter = (fret: number) => ((fret + 0.5) / fretCellCount) * 100

  const toFretFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (track === undefined) {
      return undefined
    }

    const rect = track.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const ratio = rect.width > 0 ? relativeX / rect.width : 0
    return clampFret(Math.round(ratio * fretCellCount - 0.5))
  }

  const updateHandleFromClientX = (clientX: number, handle: 'start' | 'end') => {
    const nextFret = toFretFromClientX(clientX)
    if (nextFret === undefined) {
      return
    }

    if (handle === 'start') {
      onExportFretStartChange(nextFret)
      return
    }

    onExportFretEndChange(nextFret)
  }

  const getNearestHandle = (fret: number): 'start' | 'end' => {
    const startDistance = Math.abs(fret - exportFretStart)
    const endDistance = Math.abs(fret - exportFretEnd)
    return startDistance <= endDistance ? 'start' : 'end'
  }

  const moveNearestHandleToClientX = (clientX: number) => {
    const nextFret = toFretFromClientX(clientX)
    if (nextFret === undefined) {
      return
    }
    updateHandleFromClientX(clientX, getNearestHandle(nextFret))
  }

  const handleTrackClickMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof HTMLElement && target.closest('[data-export-handle="true"]') !== null) {
      return
    }
    moveNearestHandleToClientX(event.clientX)
  }

  const handleTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingHandle === undefined) {
      const nextFret = toFretFromClientX(event.clientX)
      if (nextFret === undefined) {
        setHoverPreview(undefined)
        return
      }
      setHoverPreview({
        fret: nextFret,
        handle: getNearestHandle(nextFret),
      })
      return
    }

    updateHandleFromClientX(event.clientX, draggingHandle)
  }

  const handleTrackPointerUp = () => {
    setDraggingHandle(undefined)
  }

  const handleTrackPointerLeave = () => {
    if (draggingHandle === undefined) {
      setHoverPreview(undefined)
    }
    setDraggingHandle(undefined)
  }

  const setClosestHandleToFret = (fret: number) => {
    const startDistance = Math.abs(fret - exportFretStart)
    const endDistance = Math.abs(fret - exportFretEnd)
    if (startDistance <= endDistance) {
      onExportFretStartChange(fret)
      return
    }
    onExportFretEndChange(fret)
  }

  const exportStart = Math.min(exportFretStart, exportFretEnd)
  const exportEnd = Math.max(exportFretStart, exportFretEnd)
  const startHighlightFret = Math.max(0, exportFretStart - 1)

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
                  const isStartFret = fret === startHighlightFret
                  const isEndFret = fret === exportFretEnd
                  const isStartAtNutLine = exportFretStart === 0 && fret === 0
                  const startMarkerColor =
                    exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-cyan-300'
                  const endMarkerColor =
                    exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-emerald-300'

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
                    setClosestHandleToFret(fret)
                  }}
                >
                  {showMarker ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-500" />
                      {isDoubleDot ? (
                        <span className="h-2 w-2 rounded-full bg-slate-500" />
                      ) : undefined}
                    </span>
                  ) : undefined}
                </button>
              )
            })}

            <div />
            <div
              className="relative mt-2 h-8"
              style={{ gridColumn: `2 / span ${FRET_NUMBERS.length}` }}
              onPointerDown={handleTrackClickMove}
              onPointerMove={handleTrackPointerMove}
              onPointerUp={handleTrackPointerUp}
              onPointerCancel={handleTrackPointerUp}
              onPointerLeave={handleTrackPointerLeave}
            >
              <div
                ref={(node) => {
                  trackRef.current = node ?? undefined
                }}
                data-testid="export-range-track"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-slate-700"
              />
              <div
                className="pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-cyan-400/80"
                style={{
                  left: `${toPercentFromFretCenter(exportStart)}%`,
                  width: `${((exportEnd - exportStart) / fretCellCount) * 100}%`,
                }}
              />
              {hoverPreview !== undefined ? (
                <span
                  className={`pointer-events-none absolute top-1/2 z-20 flex h-7 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border text-[11px] font-semibold text-slate-950/70 ${
                    hoverPreview.handle === 'start'
                      ? 'border-cyan-200/70 bg-cyan-400/40'
                      : 'border-emerald-200/70 bg-emerald-400/40'
                  }`}
                  style={{ left: `${toPercentFromFretCenter(hoverPreview.fret)}%` }}
                >
                  {hoverPreview.handle === 'start' ? 'S' : 'E'}
                </span>
              ) : undefined}
              <button
                type="button"
                className="absolute top-1/2 flex h-7 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-cyan-200 bg-cyan-400/90 text-[11px] font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(2,6,23,0.8)] transition hover:scale-105"
                style={{ left: `${toPercentFromFretCenter(exportFretStart)}%` }}
                data-testid="export-start-handle"
                data-export-handle="true"
                onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDraggingHandle('start')
                  updateHandleFromClientX(event.clientX, 'start')
                }}
                onPointerMove={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (draggingHandle !== 'start') {
                    return
                  }
                  updateHandleFromClientX(event.clientX, 'start')
                }}
                onPointerUp={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }
                  setDraggingHandle(undefined)
                }}
                aria-label="Drag start fret"
              >
                S
              </button>
              <button
                type="button"
                className="absolute top-1/2 flex h-7 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-400/90 text-[11px] font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(2,6,23,0.8)] transition hover:scale-105"
                style={{ left: `${toPercentFromFretCenter(exportFretEnd)}%` }}
                data-testid="export-end-handle"
                data-export-handle="true"
                onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDraggingHandle('end')
                  updateHandleFromClientX(event.clientX, 'end')
                }}
                onPointerMove={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (draggingHandle !== 'end') {
                    return
                  }
                  updateHandleFromClientX(event.clientX, 'end')
                }}
                onPointerUp={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }
                  setDraggingHandle(undefined)
                }}
                aria-label="Drag end fret"
              >
                E
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="w-fit max-w-full rounded-md border border-slate-700 bg-black/80 p-3">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
            <span>Export Range</span>
            <span className="font-medium text-slate-100">
              Frets {exportStart} - {exportEnd}
            </span>
          </div>

          <div className="mb-4 text-xs text-slate-400">
            S / E マーカーをドラッグ、またはバーをクリックして範囲を設定
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
    </section>
  )
}
