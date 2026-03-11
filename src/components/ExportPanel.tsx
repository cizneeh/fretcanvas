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
  return (
    <div className="px-4 pb-4">
      <div className="w-fit max-w-full rounded-md border border-zinc-600 bg-zinc-800/80 p-3">
        <div className="mb-3 flex items-center justify-between text-sm text-zinc-300">
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
          <input
            className="range-thumb h-2 w-40 appearance-none rounded-full bg-zinc-700"
            type="range"
            min={0}
            max={100}
            value={backgroundOpacityPercent}
            onPointerDown={onBackgroundOpacityEditStart}
            onPointerUp={onBackgroundOpacityEditEnd}
            onFocus={onBackgroundOpacityEditStart}
            onBlur={onBackgroundOpacityEditEnd}
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
  )
}
