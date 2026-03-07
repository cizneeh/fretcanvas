import { create } from 'zustand'
import { FRET_COUNT } from '../libs/model'
import { useHistoryStore } from './historyStore'

type SettingsUpdateOptions = {
  skipHistory?: boolean
}

export type SettingsStoreState = {
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  addScaleWithinExportRange: boolean
}

export type SettingsStoreActions = {
  setAddScaleWithinExportRange: (nextValue: boolean, options?: SettingsUpdateOptions) => void
  handleExportFretStartChange: (nextStart: number, options?: SettingsUpdateOptions) => void
  handleExportFretEndChange: (nextEnd: number, options?: SettingsUpdateOptions) => void
  handleBackgroundOpacityPercentChange: (
    nextOpacity: number,
    options?: SettingsUpdateOptions,
  ) => void
}

export type SettingsStore = SettingsStoreState & SettingsStoreActions

export const useSettingsStore = create<SettingsStore>((set, get) => {
  const pushHistoryBeforeChange = () => {
    useHistoryStore.getState().pushBeforeChange()
  }

  return {
    exportFretStart: 0,
    exportFretEnd: FRET_COUNT,
    backgroundOpacityPercent: 0,
    addScaleWithinExportRange: true,

    setAddScaleWithinExportRange: (nextValue, options) => {
      if (get().addScaleWithinExportRange === nextValue) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({ addScaleWithinExportRange: nextValue })
    },

    handleExportFretStartChange: (nextStart, options) => {
      const clampedStart = Math.max(0, Math.min(nextStart, FRET_COUNT))
      const current = get()
      const nextEnd = clampedStart > current.exportFretEnd ? clampedStart : current.exportFretEnd

      if (clampedStart === current.exportFretStart && nextEnd === current.exportFretEnd) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({
        exportFretStart: clampedStart,
        exportFretEnd: nextEnd,
      })
    },

    handleExportFretEndChange: (nextEnd, options) => {
      const clampedEnd = Math.max(0, Math.min(nextEnd, FRET_COUNT))
      const current = get()
      const nextStart = clampedEnd < current.exportFretStart ? clampedEnd : current.exportFretStart

      if (clampedEnd === current.exportFretEnd && nextStart === current.exportFretStart) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({
        exportFretEnd: clampedEnd,
        exportFretStart: nextStart,
      })
    },

    handleBackgroundOpacityPercentChange: (nextOpacity, options) => {
      const clampedOpacity = Math.max(0, Math.min(nextOpacity, 100))
      if (get().backgroundOpacityPercent === clampedOpacity) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({
        backgroundOpacityPercent: clampedOpacity,
      })
    },
  }
})
