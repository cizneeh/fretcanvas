import { create } from 'zustand'
import {
  type BendArrow,
  type BendId,
  type Connection,
  type ConnectionId,
  FRET_COUNT,
  getBendId,
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
import { useHistoryStore } from './historyStore'
import { createHistorySnapshot } from './historyTypes'
import { useSettingsStore } from './settingsStore'

type AddScaleNotesOptions = {
  fretRange:
    | {
        start: number
        end: number
      }
    | undefined
}

export type FretboardStoreState = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  bends: Record<BendId, BendArrow>
}

export type FretboardStoreActions = {
  setKeyPc: (nextKeyPc: PitchClass) => void
  setSelectedScale: (nextScale: ScaleId | undefined) => void
  addScaleNotes: (options?: AddScaleNotesOptions) => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  toggleNoteDimmed: (positionId: PositionId) => void
  connectPositions: (from: PositionId, to: PositionId) => void
  removeConnection: (connectionId: ConnectionId) => void
  removeConnectionsByPosition: (positionId: PositionId) => void
  upsertBendFromPosition: (from: PositionId) => void
  removeBend: (bendId: BendId) => void
  removeBendByFromPosition: (from: PositionId) => void
}

export type FretboardStore = FretboardStoreState & FretboardStoreActions

export const useFretboardStore = create<FretboardStore>((set, get) => {
  const pushHistoryBeforeChange = () => {
    const fretboard = get()
    const settings = useSettingsStore.getState()

    useHistoryStore.getState().pushBeforeChange(
      createHistorySnapshot(
        {
          keyPc: fretboard.keyPc,
          selectedScale: fretboard.selectedScale,
          displayedNotes: fretboard.displayedNotes,
          connections: fretboard.connections,
          bends: fretboard.bends,
        },
        {
          exportFretStart: settings.exportFretStart,
          exportFretEnd: settings.exportFretEnd,
          backgroundOpacityPercent: settings.backgroundOpacityPercent,
          addScaleWithinExportRange: settings.addScaleWithinExportRange,
        },
      ),
    )
  }

  return {
    keyPc: 0,
    selectedScale: 'major',
    displayedNotes: {},
    connections: {},
    bends: {},

    setKeyPc: (nextKeyPc) => {
      const current = get()
      if (current.keyPc === nextKeyPc) {
        return
      }

      pushHistoryBeforeChange()
      set({ keyPc: nextKeyPc })
    },

    setSelectedScale: (nextScale) => {
      const current = get()
      if (current.selectedScale === nextScale) {
        return
      }

      pushHistoryBeforeChange()
      set({ selectedScale: nextScale })
    },

    addScaleNotes: (options) => {
      const { keyPc, selectedScale, displayedNotes } = get()
      if (selectedScale === undefined) {
        return
      }

      const pcsToAdd = new Set(
        SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
      )

      const next: Record<PositionId, HighlightedNote> = { ...displayedNotes }
      let didChange = false
      const minFret =
        options?.fretRange !== undefined
          ? Math.min(options.fretRange.start, options.fretRange.end)
          : 0
      const maxFret =
        options?.fretRange !== undefined
          ? Math.max(options.fretRange.start, options.fretRange.end)
          : FRET_COUNT

      for (const [stringIndex, stringInfo] of OPEN_STRINGS.entries()) {
        for (let fret = minFret; fret <= maxFret; fret += 1) {
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
              didChange = true
            }
          }
        }
      }

      if (!didChange) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    clearHighlightedNotes: () => {
      const current = get()
      if (
        Object.keys(current.displayedNotes).length === 0 &&
        Object.keys(current.connections).length === 0 &&
        Object.keys(current.bends).length === 0
      ) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: {}, connections: {}, bends: {} })
    },

    togglePosition: (positionId) => {
      const current = get()
      const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
      let nextConnections = current.connections
      let nextBends = current.bends

      if (next[positionId] !== undefined) {
        delete next[positionId]
        const filteredEntries = Object.entries(current.connections).filter(([, connection]) => {
          return connection.from !== positionId && connection.to !== positionId
        })
        nextConnections = Object.fromEntries(filteredEntries) as Record<ConnectionId, Connection>
        const bendId = getBendId(positionId)
        if (nextBends[bendId] !== undefined) {
          nextBends = { ...nextBends }
          delete nextBends[bendId]
        }
      } else {
        next[positionId] = {
          positionId,
          isDimmed: false,
          colorVariant: 'default',
        }
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next, connections: nextConnections, bends: nextBends })
    },

    toggleNoteDimmed: (positionId) => {
      const current = get()
      const currentNote = current.displayedNotes[positionId]
      if (currentNote === undefined) {
        return
      }

      const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
      next[positionId] = {
        ...currentNote,
        isDimmed: !currentNote.isDimmed,
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    connectPositions: (from, to) => {
      if (from === to) {
        return
      }

      const current = get()
      const connectionId = getConnectionId(from, to)
      if (current.connections[connectionId] !== undefined) {
        return
      }

      pushHistoryBeforeChange()
      set({
        connections: {
          ...current.connections,
          [connectionId]: {
            id: connectionId,
            from,
            to,
          },
        },
      })
    },

    removeConnection: (connectionId) => {
      const current = get()
      if (current.connections[connectionId] === undefined) {
        return
      }

      const nextConnections = { ...current.connections }
      delete nextConnections[connectionId]

      pushHistoryBeforeChange()
      set({ connections: nextConnections })
    },

    removeConnectionsByPosition: (positionId) => {
      const current = get()
      const nextEntries = Object.entries(current.connections).filter(([, connection]) => {
        return connection.from !== positionId && connection.to !== positionId
      })
      const nextConnections = Object.fromEntries(nextEntries) as Record<ConnectionId, Connection>

      if (Object.keys(nextConnections).length === Object.keys(current.connections).length) {
        return
      }

      pushHistoryBeforeChange()
      set({ connections: nextConnections })
    },

    upsertBendFromPosition: (from) => {
      const current = get()
      if (current.displayedNotes[from] === undefined) {
        return
      }

      const bendId = getBendId(from)
      const nextBends = {
        ...current.bends,
        [bendId]: {
          id: bendId,
          from,
        },
      }

      const currentBend = current.bends[bendId]
      if (currentBend !== undefined && currentBend.from === from) {
        return
      }

      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },

    removeBend: (bendId) => {
      const current = get()
      if (current.bends[bendId] === undefined) {
        return
      }

      const nextBends = { ...current.bends }
      delete nextBends[bendId]
      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },

    removeBendByFromPosition: (from) => {
      const current = get()
      const bendId = getBendId(from)
      if (current.bends[bendId] === undefined) {
        return
      }

      const nextBends = { ...current.bends }
      delete nextBends[bendId]
      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },
  }
})
