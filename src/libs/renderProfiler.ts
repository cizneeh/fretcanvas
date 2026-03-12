import type { ProfilerOnRenderCallback } from 'react'

const RENDER_PROFILER_STORAGE_KEY = 'fretmap:render-profiler'
const CELL_RENDER_LOG_STORAGE_KEY = 'fretmap:render-profiler-cells'

const isStorageFlagEnabled = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.localStorage.getItem(key) === '1'
}

export const isRenderProfilerEnabled = (): boolean =>
  import.meta.env.DEV && isStorageFlagEnabled(RENDER_PROFILER_STORAGE_KEY)

export const isCellRenderLogEnabled = (): boolean =>
  import.meta.env.DEV && isStorageFlagEnabled(CELL_RENDER_LOG_STORAGE_KEY)

export const handleReactProfilerRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (!isRenderProfilerEnabled()) {
    return
  }

  console.info('[RenderProfiler]', {
    id,
    phase,
    actualDuration: Number(actualDuration.toFixed(2)),
    baseDuration: Number(baseDuration.toFixed(2)),
    startTime: Number(startTime.toFixed(2)),
    commitTime: Number(commitTime.toFixed(2)),
  })
}
