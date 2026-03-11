import { useEffect, useState } from 'react'

type ExportPanelProps = {
  exportStart: number
  exportEnd: number
  backgroundOpacityPercent: number
  onBackgroundOpacityPercentChange: (nextOpacity: number) => void
  onBackgroundOpacityEditStart: () => void
  onBackgroundOpacityEditEnd: () => void
  onExportTransparentPng: () => void
}

export const ExportPanel = ({
  exportStart,
  exportEnd,
  backgroundOpacityPercent,
  onBackgroundOpacityPercentChange,
  onBackgroundOpacityEditStart,
  onBackgroundOpacityEditEnd,
  onExportTransparentPng,
}: ExportPanelProps) => {
  const [draftOpacity, setDraftOpacity] = useState(String(backgroundOpacityPercent))

  useEffect(() => {
    setDraftOpacity(String(backgroundOpacityPercent))
  }, [backgroundOpacityPercent])

  const clampOpacity = (value: number) => Math.max(0, Math.min(Math.round(value), 100))
  const applyOpacity = (value: number) => {
    onBackgroundOpacityPercentChange(clampOpacity(value))
  }
  const stepValues = [0, 25, 50, 75, 100]

  return (
    <div className="w-full max-w-[22rem]">
      <div className="mb-3 flex items-center justify-between text-sm text-zinc-200">
        <span>Export Range</span>
        <span className="font-medium text-zinc-50">
          Frets {exportStart} - {exportEnd}
        </span>
      </div>

      <div className="mb-4 text-xs text-zinc-300">
        S / E マーカーをドラッグ、またはバーをクリックして範囲を設定
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
          <span>Background Opacity</span>
          <span>{backgroundOpacityPercent}%</span>
        </div>
        <div className="mb-2 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] gap-2">
          <button
            type="button"
            className="h-10 rounded-md border border-zinc-500 bg-zinc-700/90 px-2.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              onBackgroundOpacityEditStart()
              applyOpacity(backgroundOpacityPercent - 1)
              onBackgroundOpacityEditEnd()
            }}
            disabled={backgroundOpacityPercent <= 0}
            aria-label="Decrease opacity by 1"
          >
            -
          </button>

          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              className="h-10 w-full rounded-md border border-zinc-500 bg-zinc-700/90 px-2.5 pr-7 text-sm text-zinc-50 outline-none transition-colors hover:bg-zinc-600 focus:ring-2 focus:ring-cyan-500"
              value={draftOpacity}
              onFocus={onBackgroundOpacityEditStart}
              onBlur={() => {
                const parsed = Number(draftOpacity)
                if (Number.isFinite(parsed)) {
                  applyOpacity(parsed)
                } else {
                  setDraftOpacity(String(backgroundOpacityPercent))
                }
                onBackgroundOpacityEditEnd()
              }}
              onChange={(event) => {
                const nextValue = event.target.value
                setDraftOpacity(nextValue)
                if (nextValue === '') {
                  return
                }
                const parsed = Number(nextValue)
                if (Number.isFinite(parsed)) {
                  applyOpacity(parsed)
                }
              }}
              aria-label="Background opacity percentage"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-300">
              %
            </span>
          </div>

          <button
            type="button"
            className="h-10 rounded-md border border-zinc-500 bg-zinc-700/90 px-2.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              onBackgroundOpacityEditStart()
              applyOpacity(backgroundOpacityPercent + 1)
              onBackgroundOpacityEditEnd()
            }}
            disabled={backgroundOpacityPercent >= 100}
            aria-label="Increase opacity by 1"
          >
            +
          </button>
        </div>

        <div className="mb-2 grid grid-cols-5 gap-1.5">
          {stepValues.map((value) => (
            <button
              key={value}
              type="button"
              className={`h-8 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                backgroundOpacityPercent === value
                  ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-200'
                  : 'border-zinc-500 bg-zinc-700/80 text-zinc-200 hover:bg-zinc-600'
              }`}
              onClick={() => {
                onBackgroundOpacityEditStart()
                applyOpacity(value)
                onBackgroundOpacityEditEnd()
              }}
            >
              {value}%
            </button>
          ))}
        </div>

        <input
          className="range-thumb h-2 w-full appearance-none rounded-full bg-zinc-700"
          type="range"
          min={0}
          max={100}
          value={backgroundOpacityPercent}
          onPointerDown={onBackgroundOpacityEditStart}
          onPointerUp={onBackgroundOpacityEditEnd}
          onFocus={onBackgroundOpacityEditStart}
          onBlur={onBackgroundOpacityEditEnd}
          onChange={(event) => {
            applyOpacity(Number(event.target.value))
          }}
          aria-label="Export background opacity"
        />
      </div>

      <button
        type="button"
        className="w-full rounded-md border border-emerald-400/80 bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        onClick={onExportTransparentPng}
      >
        Export Transparent PNG
      </button>
    </div>
  )
}
