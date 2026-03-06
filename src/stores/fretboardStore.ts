import { create } from 'zustand'
import { exportTransparentPng } from '../libs/exportTransparentPng'
import {
  type Connection,
  type ConnectionId,
  FRET_COUNT,
  FRET_NUMBERS,
  getConnectionId,
  type HighlightedNote,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  SCALE_INTERVALS,
  type ScaleId,
  toPositionId,
} from '../libs/model'

type FretboardStore = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  setKeyPc: (nextKeyPc: PitchClass) => void
  setSelectedScale: (nextScale: ScaleId | undefined) => void
  addScaleNotes: () => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  connectPositions: (from: PositionId, to: PositionId) => void
  removeConnection: (connectionId: ConnectionId) => void
  removeConnectionsByPosition: (positionId: PositionId) => void
  handleExportFretStartChange: (nextStart: number) => void
  handleExportFretEndChange: (nextEnd: number) => void
  handleBackgroundOpacityPercentChange: (nextOpacity: number) => void
  exportTransparentPng: () => void
}

export const useFretboardStore = create<FretboardStore>((set, get) => ({
  keyPc: 0,
  selectedScale: 'major',
  displayedNotes: {},
  connections: {},
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
    const { keyPc, selectedScale, displayedNotes } = get()
    if (selectedScale === undefined) {
      return
    }

    const pcsToAdd = new Set(
      SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
    )

    const next: Record<PositionId, HighlightedNote> = { ...displayedNotes }

    for (const [stringIndex, stringInfo] of OPEN_STRINGS.entries()) {
      for (const fret of FRET_NUMBERS) {
        const midi = stringInfo.midi + fret
        const pitchClass = normalizePc(midi)

        if (pcsToAdd.has(pitchClass)) {
          const positionId = toPositionId({
            stringIndex,
            fret,
          })
          if (next[positionId] === undefined) {
            next[positionId] = {
              positionId,
              isDimmed: false,
              colorVariant: 'default',
            }
          }
        }
      }
    }

    set({ displayedNotes: next })
  },

  clearHighlightedNotes: () => {
    set({ displayedNotes: {}, connections: {} })
  },

  togglePosition: (positionId) => {
    const next: Record<PositionId, HighlightedNote> = { ...get().displayedNotes }
    const { removeConnectionsByPosition } = get()

    if (next[positionId] !== undefined) {
      delete next[positionId]
      removeConnectionsByPosition(positionId)
    } else {
      next[positionId] = {
        positionId,
        isDimmed: false,
        colorVariant: 'default',
      }
    }

    set({ displayedNotes: next })
  },

  connectPositions: (from, to) => {
    if (from === to) {
      return
    }

    const connectionId = getConnectionId(from, to)
    const currentConnections = get().connections
    if (currentConnections[connectionId] !== undefined) {
      return
    }

    set({
      connections: {
        ...currentConnections,
        [connectionId]: {
          id: connectionId,
          from,
          to,
        },
      },
    })
  },

  removeConnection: (connectionId) => {
    const currentConnections = get().connections
    if (currentConnections[connectionId] === undefined) {
      return
    }

    const nextConnections = { ...currentConnections }
    delete nextConnections[connectionId]
    set({ connections: nextConnections })
  },

  removeConnectionsByPosition: (positionId) => {
    const currentConnections = get().connections
    const nextEntries = Object.entries(currentConnections).filter(([, connection]) => {
      return connection.from !== positionId && connection.to !== positionId
    })
    const nextConnections = Object.fromEntries(nextEntries) as Record<ConnectionId, Connection>
    set({ connections: nextConnections })
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
      displayedNotes,
      connections,
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    } = get()

    exportTransparentPng({
      keyPc,
      displayedNotes,
      connections: Object.values(connections),
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    })
  },
}))
