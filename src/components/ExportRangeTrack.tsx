import type { PointerEvent as ReactPointerEvent } from 'react'
import { useI18n } from '../i18n/useI18n'

type HoverPreview = { handle: 'start' | 'end'; percent: number } | undefined

type ExportRangeTrackProps = {
  fretColumnSpan: number
  startRangePercent: number
  rangeWidthPercent: number
  startHandlePercent: number
  endHandlePercent: number
  hoverPreview: HoverPreview
  onTrackRefChange: (node: HTMLDivElement | undefined) => void
  onTrackPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onTrackPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onTrackPointerUp: () => void
  onTrackPointerCancel: () => void
  onTrackPointerLeave: () => void
  onStartPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onStartPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onStartPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onEndPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onEndPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onEndPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
}

export const ExportRangeTrack = ({
  fretColumnSpan,
  startRangePercent,
  rangeWidthPercent,
  startHandlePercent,
  endHandlePercent,
  hoverPreview,
  onTrackRefChange,
  onTrackPointerDown,
  onTrackPointerMove,
  onTrackPointerUp,
  onTrackPointerCancel,
  onTrackPointerLeave,
  onStartPointerDown,
  onStartPointerMove,
  onStartPointerUp,
  onEndPointerDown,
  onEndPointerMove,
  onEndPointerUp,
}: ExportRangeTrackProps) => {
  const { t } = useI18n()

  return (
    <>
      <div />
      <div
        className="relative mt-0.5 h-8"
        style={{ gridColumn: `2 / span ${fretColumnSpan}` }}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={onTrackPointerCancel}
        onPointerLeave={onTrackPointerLeave}
      >
        <div
          ref={(node) => {
            onTrackRefChange(node ?? undefined)
          }}
          data-testid="export-range-track"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-slate-700"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-cyan-400/80"
          style={{
            left: `${startRangePercent}%`,
            width: `${rangeWidthPercent}%`,
          }}
        />
        {hoverPreview !== undefined ? (
          <span
            className={`pointer-events-none absolute top-1/2 z-20 flex h-6 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-dashed text-[11px] font-semibold text-white ${
              hoverPreview.handle === 'start'
                ? 'border-cyan-200/45 bg-cyan-400/15'
                : 'border-emerald-200/45 bg-emerald-400/15'
            }`}
            style={{ left: `${hoverPreview.percent}%` }}
          >
            {hoverPreview.handle === 'start' ? 'S' : 'E'}
          </span>
        ) : undefined}
        <button
          type="button"
          className="absolute top-1/2 flex h-7 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-cyan-200 bg-cyan-700/90 text-[11px] font-semibold text-white shadow-[0_0_0_1px_rgba(2,6,23,0.8)] transition hover:scale-105"
          style={{ left: `${startHandlePercent}%` }}
          data-testid="export-start-handle"
          data-export-handle="true"
          onPointerDown={onStartPointerDown}
          onPointerMove={onStartPointerMove}
          onPointerUp={onStartPointerUp}
          aria-label={t('export.startHandle')}
        >
          S
        </button>
        <button
          type="button"
          className="absolute top-1/2 flex h-7 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-emerald-200 bg-emerald-700/90 text-[11px] font-semibold text-white shadow-[0_0_0_1px_rgba(2,6,23,0.8)] transition hover:scale-105"
          style={{ left: `${endHandlePercent}%` }}
          data-testid="export-end-handle"
          data-export-handle="true"
          onPointerDown={onEndPointerDown}
          onPointerMove={onEndPointerMove}
          onPointerUp={onEndPointerUp}
          aria-label={t('export.endHandle')}
        >
          E
        </button>
      </div>
    </>
  )
}
