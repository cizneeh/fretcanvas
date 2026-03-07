import { create } from 'zustand'
import { FRET_COUNT } from '../libs/model'

type SettingsStore = {
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  addScaleWithinExportRange: boolean
  setAddScaleWithinExportRange: (nextValue: boolean) => void
  handleExportFretStartChange: (nextStart: number) => void
  handleExportFretEndChange: (nextEnd: number) => void
  handleBackgroundOpacityPercentChange: (nextOpacity: number) => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  exportFretStart: 0,
  exportFretEnd: FRET_COUNT,
  backgroundOpacityPercent: 0,
  addScaleWithinExportRange: true,

  setAddScaleWithinExportRange: (nextValue) => {
    set({ addScaleWithinExportRange: nextValue })
  },

  handleExportFretStartChange: (nextStart) => {
    const clampedStart = Math.max(0, Math.min(nextStart, FRET_COUNT))
    const currentEnd = get().exportFretEnd

    set({
      exportFretStart: clampedStart,
      exportFretEnd: clampedStart > currentEnd ? clampedStart : currentEnd,
    })
  },

  handleExportFretEndChange: (nextEnd) => {
    const clampedEnd = Math.max(0, Math.min(nextEnd, FRET_COUNT))
    const currentStart = get().exportFretStart

    set({
      exportFretEnd: clampedEnd,
      exportFretStart: clampedEnd < currentStart ? clampedEnd : currentStart,
    })
  },

  handleBackgroundOpacityPercentChange: (nextOpacity) => {
    set({
      backgroundOpacityPercent: Math.max(0, Math.min(nextOpacity, 100)),
    })
  },
}))
