import { create } from 'zustand'
import { exportTransparentPng } from '../libs/exportTransparentPng'
import {
  FRET_COUNT,
  FRET_NUMBERS,
  getPositionId,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  SCALE_INTERVALS,
  type ScaleId,
} from '../libs/model'

type FretboardStore = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  highlightedPositions: Set<PositionId>
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  setKeyPc: (nextKeyPc: PitchClass) => void
  setSelectedScale: (nextScale: ScaleId | undefined) => void
  addScaleNotes: () => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  handleExportFretStartChange: (nextStart: number) => void
  handleExportFretEndChange: (nextEnd: number) => void
  handleBackgroundOpacityPercentChange: (nextOpacity: number) => void
  exportTransparentPng: () => void
}

export const useFretboardStore = create<FretboardStore>((set, get) => ({
  keyPc: 0,
  selectedScale: 'major',
  highlightedPositions: new Set(),
  exportFretStart: 0,
  exportFretEnd: FRET_COUNT,
  backgroundOpacityPercent: 0,

  setKeyPc: (nextKeyPc) => {
    set({ keyPc: nextKeyPc })
  },

  setSelectedScale: (nextScale) => {
    set({ selectedScale: nextScale })
  },

  addScaleNotes: () => {
    const { keyPc, selectedScale, highlightedPositions } = get()
    if (selectedScale === undefined) {
      return
    }

    const pcsToAdd = new Set(
      SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
    )

    const next = new Set(highlightedPositions)

    for (const stringInfo of OPEN_STRINGS) {
      for (const fret of FRET_NUMBERS) {
        const midi = stringInfo.midi + fret
        const pitchClass = normalizePc(midi)

        if (pcsToAdd.has(pitchClass)) {
          next.add(getPositionId(stringInfo.id, fret))
        }
      }
    }

    set({ highlightedPositions: next })
  },

  clearHighlightedNotes: () => {
    set({ highlightedPositions: new Set() })
  },

  togglePosition: (positionId) => {
    const next = new Set(get().highlightedPositions)

    if (next.has(positionId)) {
      next.delete(positionId)
    } else {
      next.add(positionId)
    }

    set({ highlightedPositions: next })
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

  exportTransparentPng: () => {
    const {
      keyPc,
      highlightedPositions,
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    } = get()

    exportTransparentPng({
      keyPc,
      highlightedPositions,
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    })
  },
}))
