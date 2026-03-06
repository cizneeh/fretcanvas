import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
import { FRET_NUMBERS } from '../libs/model'
import { useFretboardStore } from '../stores/fretboardStore'
import { ExportPanel } from './ExportPanel'
import { ExportRangeTrack } from './ExportRangeTrack'
import { FretboardGrid } from './FretboardGrid'

export const FretboardView = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const highlightedPositions = useFretboardStore((state) => state.highlightedPositions)
  const togglePosition = useFretboardStore((state) => state.togglePosition)
  const exportFretStart = useFretboardStore((state) => state.exportFretStart)
  const exportFretEnd = useFretboardStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useFretboardStore((state) => state.backgroundOpacityPercent)
  const handleExportFretStartChange = useFretboardStore((state) => state.handleExportFretStartChange)
  const handleExportFretEndChange = useFretboardStore((state) => state.handleExportFretEndChange)
  const handleBackgroundOpacityPercentChange = useFretboardStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const exportTransparentPng = useFretboardStore((state) => state.exportTransparentPng)

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
      handleExportFretStartChange(nextFret)
      return
    }

    handleExportFretEndChange(nextFret)
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

  const handleTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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
      handleExportFretStartChange(fret)
      return
    }
    handleExportFretEndChange(fret)
  }

  const exportStart = Math.min(exportFretStart, exportFretEnd)
  const exportEnd = Math.max(exportFretStart, exportFretEnd)
  const startHighlightFret = Math.max(0, exportFretStart - 1)

  return (
    <section className="bg-black">
      <div className="overflow-x-auto p-4">
        <div className="min-w-max rounded-md border border-slate-700 bg-black p-3">
          <FretboardGrid
            keyPc={keyPc}
            highlightedPositions={highlightedPositions}
            exportFretStart={exportFretStart}
            exportFretEnd={exportFretEnd}
            startHighlightFret={startHighlightFret}
            onTogglePosition={togglePosition}
            onSelectClosestHandleToFret={setClosestHandleToFret}
            rangeTrack={
              <ExportRangeTrack
                fretColumnSpan={FRET_NUMBERS.length}
                startRangePercent={toPercentFromFretCenter(exportStart)}
                rangeWidthPercent={((exportEnd - exportStart) / fretCellCount) * 100}
                startHandlePercent={toPercentFromFretCenter(exportFretStart)}
                endHandlePercent={toPercentFromFretCenter(exportFretEnd)}
                hoverPreview={
                  hoverPreview === undefined
                    ? undefined
                    : {
                        handle: hoverPreview.handle,
                        percent: toPercentFromFretCenter(hoverPreview.fret),
                      }
                }
                onTrackRefChange={(node) => {
                  trackRef.current = node
                }}
                onTrackPointerDown={handleTrackClickMove}
                onTrackPointerMove={handleTrackPointerMove}
                onTrackPointerUp={handleTrackPointerUp}
                onTrackPointerCancel={handleTrackPointerUp}
                onTrackPointerLeave={handleTrackPointerLeave}
                onStartPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDraggingHandle('start')
                  updateHandleFromClientX(event.clientX, 'start')
                }}
                onStartPointerMove={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (draggingHandle !== 'start') {
                    return
                  }
                  updateHandleFromClientX(event.clientX, 'start')
                }}
                onStartPointerUp={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }
                  setDraggingHandle(undefined)
                }}
                onEndPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDraggingHandle('end')
                  updateHandleFromClientX(event.clientX, 'end')
                }}
                onEndPointerMove={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (draggingHandle !== 'end') {
                    return
                  }
                  updateHandleFromClientX(event.clientX, 'end')
                }}
                onEndPointerUp={(event: ReactPointerEvent<HTMLButtonElement>) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }
                  setDraggingHandle(undefined)
                }}
              />
            }
          />
        </div>
      </div>

      <ExportPanel
        exportStart={exportStart}
        exportEnd={exportEnd}
        backgroundOpacityPercent={backgroundOpacityPercent}
        onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
        onExportTransparentPng={exportTransparentPng}
      />
    </section>
  )
}
