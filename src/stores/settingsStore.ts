import { create } from 'zustand'
import { type AppLocale, getDefaultLocale } from '../i18n/config'
import { FRET_COUNT } from '../libs/model'
import { useHistoryStore } from './historyStore'

type SettingsUpdateOptions = {
  skipHistory?: boolean
}

export type ExportFormat = 'png' | 'svg'

export type SettingsStoreState = {
  locale: AppLocale
  exportFretStart: number
  exportFretEnd: number
  exportFormat: ExportFormat
  backgroundOpacityPercent: number
  addScaleWithinExportRange: boolean
  showExportRangeHighlight: boolean
  showExportTitle: boolean
}

export type SettingsStoreActions = {
  setLocale: (nextLocale: AppLocale) => void
  setAddScaleWithinExportRange: (nextValue: boolean, options?: SettingsUpdateOptions) => void
  setExportFormat: (nextFormat: ExportFormat, options?: SettingsUpdateOptions) => void
  setShowExportRangeHighlight: (nextValue: boolean, options?: SettingsUpdateOptions) => void
  setShowExportTitle: (nextValue: boolean, options?: SettingsUpdateOptions) => void
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
    locale: getDefaultLocale(),
    exportFretStart: 0,
    exportFretEnd: FRET_COUNT,
    exportFormat: 'png',
    backgroundOpacityPercent: 0,
    addScaleWithinExportRange: true,
    showExportRangeHighlight: true,
    showExportTitle: false,

    setLocale: (nextLocale) => {
      if (get().locale === nextLocale) {
        return
      }

      set({ locale: nextLocale })
    },

    setAddScaleWithinExportRange: (nextValue, options) => {
      if (get().addScaleWithinExportRange === nextValue) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({ addScaleWithinExportRange: nextValue })
    },

    setExportFormat: (nextFormat, options) => {
      if (get().exportFormat === nextFormat) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({ exportFormat: nextFormat })
    },

    setShowExportRangeHighlight: (nextValue, options) => {
      if (get().showExportRangeHighlight === nextValue) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({ showExportRangeHighlight: nextValue })
    },

    setShowExportTitle: (nextValue, options) => {
      if (get().showExportTitle === nextValue) {
        return
      }

      if (!options?.skipHistory) {
        pushHistoryBeforeChange()
      }

      set({ showExportTitle: nextValue })
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
