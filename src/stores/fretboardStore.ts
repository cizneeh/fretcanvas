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

type HistorySnapshot = {
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  bends: Record<BendId, BendArrow>
}

type AddScaleNotesOptions = {
  fretRange:
    | {
        start: number
        end: number
      }
    | undefined
}

type FretboardStore = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  bends: Record<BendId, BendArrow>
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  historyLimit: number
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
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void
}

const createHistorySnapshot = (
  state: Pick<FretboardStore, 'displayedNotes' | 'connections' | 'bends'>,
): HistorySnapshot => ({
  displayedNotes: { ...state.displayedNotes },
  connections: { ...state.connections },
  bends: { ...state.bends },
})

const notesEqual = (
  left: Record<PositionId, HighlightedNote>,
  right: Record<PositionId, HighlightedNote>,
): boolean => {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  for (const [positionId, leftNote] of leftEntries) {
    const rightNote = right[positionId]
    if (rightNote === undefined) {
      return false
    }

    if (
      leftNote.positionId !== rightNote.positionId ||
      leftNote.isDimmed !== rightNote.isDimmed ||
      leftNote.colorVariant !== rightNote.colorVariant
    ) {
      return false
    }
  }

  return true
}

const connectionsEqual = (
  left: Record<ConnectionId, Connection>,
  right: Record<ConnectionId, Connection>,
): boolean => {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  for (const [connectionId, leftConnection] of leftEntries) {
    const rightConnection = right[connectionId]
    if (rightConnection === undefined) {
      return false
    }

    if (
      leftConnection.id !== rightConnection.id ||
      leftConnection.from !== rightConnection.from ||
      leftConnection.to !== rightConnection.to
    ) {
      return false
    }
  }

  return true
}

const historySnapshotsEqual = (left: HistorySnapshot, right: HistorySnapshot): boolean => {
  const leftBendEntries = Object.entries(left.bends)
  const rightBendEntries = Object.entries(right.bends)
  if (leftBendEntries.length !== rightBendEntries.length) {
    return false
  }

  for (const [bendId, leftBend] of leftBendEntries) {
    const rightBend = right.bends[bendId]
    if (rightBend === undefined || rightBend.from !== leftBend.from) {
      return false
    }
  }

  return (
    notesEqual(left.displayedNotes, right.displayedNotes) &&
    connectionsEqual(left.connections, right.connections)
  )
}

export const useFretboardStore = create<FretboardStore>((set, get) => {
  const pushHistoryBeforeChange = () => {
    const current = get()
    const snapshot = createHistorySnapshot(current)

    set((state) => {
      const last = state.undoStack[state.undoStack.length - 1]
      const nextUndoStack =
        last !== undefined && historySnapshotsEqual(last, snapshot)
          ? state.undoStack
          : [...state.undoStack, snapshot]

      return {
        undoStack: nextUndoStack.slice(-state.historyLimit),
        redoStack: [],
      }
    })
  }

  return {
    keyPc: 0,
    selectedScale: 'major',
    displayedNotes: {},
    connections: {},
    bends: {},
    undoStack: [],
    redoStack: [],
    historyLimit: 100,

    setKeyPc: (nextKeyPc) => {
      set({ keyPc: nextKeyPc })
    },

    setSelectedScale: (nextScale) => {
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

    canUndo: () => get().undoStack.length > 0,

    canRedo: () => get().redoStack.length > 0,

    undo: () => {
      const current = get()
      if (current.undoStack.length === 0) {
        return
      }

      const previousSnapshot = current.undoStack[current.undoStack.length - 1]
      const currentSnapshot = createHistorySnapshot(current)

      set((state) => ({
        displayedNotes: { ...previousSnapshot.displayedNotes },
        connections: { ...previousSnapshot.connections },
        bends: { ...previousSnapshot.bends },
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, currentSnapshot].slice(-state.historyLimit),
      }))
    },

    redo: () => {
      const current = get()
      if (current.redoStack.length === 0) {
        return
      }

      const nextSnapshot = current.redoStack[current.redoStack.length - 1]
      const currentSnapshot = createHistorySnapshot(current)

      set((state) => ({
        displayedNotes: { ...nextSnapshot.displayedNotes },
        connections: { ...nextSnapshot.connections },
        bends: { ...nextSnapshot.bends },
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, currentSnapshot].slice(-state.historyLimit),
      }))
    },
  }
})
