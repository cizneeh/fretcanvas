import { create } from 'zustand'
import { exportTransparentPng } from '../libs/exportTransparentPng'
import {
  type Connection,
  type ConnectionId,
  FRET_COUNT,
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
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
}

type FretboardStore = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  addScaleWithinExportRange: boolean
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  historyLimit: number
  bufferedEditSnapshot: HistorySnapshot | undefined
  setKeyPc: (nextKeyPc: PitchClass) => void
  setSelectedScale: (nextScale: ScaleId | undefined) => void
  setAddScaleWithinExportRange: (nextValue: boolean) => void
  addScaleNotes: () => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  toggleNoteDimmed: (positionId: PositionId) => void
  connectPositions: (from: PositionId, to: PositionId) => void
  removeConnection: (connectionId: ConnectionId) => void
  removeConnectionsByPosition: (positionId: PositionId) => void
  handleExportFretStartChange: (nextStart: number) => void
  handleExportFretEndChange: (nextEnd: number) => void
  handleBackgroundOpacityPercentChange: (nextOpacity: number) => void
  beginBufferedEdit: () => void
  commitBufferedEdit: () => void
  cancelBufferedEdit: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void
  exportTransparentPng: () => void
}

const cloneDisplayedNotes = (
  displayedNotes: Record<PositionId, HighlightedNote>,
): Record<PositionId, HighlightedNote> => ({ ...displayedNotes })

const cloneConnections = (
  connections: Record<ConnectionId, Connection>,
): Record<ConnectionId, Connection> => ({ ...connections })

const createHistorySnapshot = (
  state: Pick<
    FretboardStore,
    | 'displayedNotes'
    | 'connections'
    | 'exportFretStart'
    | 'exportFretEnd'
    | 'backgroundOpacityPercent'
  >,
): HistorySnapshot => ({
  displayedNotes: cloneDisplayedNotes(state.displayedNotes),
  connections: cloneConnections(state.connections),
  exportFretStart: state.exportFretStart,
  exportFretEnd: state.exportFretEnd,
  backgroundOpacityPercent: state.backgroundOpacityPercent,
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
  return (
    left.exportFretStart === right.exportFretStart &&
    left.exportFretEnd === right.exportFretEnd &&
    left.backgroundOpacityPercent === right.backgroundOpacityPercent &&
    notesEqual(left.displayedNotes, right.displayedNotes) &&
    connectionsEqual(left.connections, right.connections)
  )
}

export const useFretboardStore = create<FretboardStore>((set, get) => ({
  keyPc: 0,
  selectedScale: 'major',
  addScaleWithinExportRange: true,
  displayedNotes: {},
  connections: {},
  exportFretStart: 0,
  exportFretEnd: FRET_COUNT,
  backgroundOpacityPercent: 0,
  undoStack: [],
  redoStack: [],
  historyLimit: 100,
  bufferedEditSnapshot: undefined,

  setKeyPc: (nextKeyPc) => {
    set({ keyPc: nextKeyPc })
  },

  setSelectedScale: (nextScale) => {
    set({ selectedScale: nextScale })
  },

  setAddScaleWithinExportRange: (nextValue) => {
    set({ addScaleWithinExportRange: nextValue })
  },

  beginBufferedEdit: () => {
    const current = get()
    if (current.bufferedEditSnapshot !== undefined) {
      return
    }

    set({
      bufferedEditSnapshot: createHistorySnapshot(current),
    })
  },

  commitBufferedEdit: () => {
    const current = get()
    const bufferedEditSnapshot = current.bufferedEditSnapshot
    if (bufferedEditSnapshot === undefined) {
      return
    }

    const afterSnapshot = createHistorySnapshot(current)
    if (historySnapshotsEqual(bufferedEditSnapshot, afterSnapshot)) {
      set({ bufferedEditSnapshot: undefined })
      return
    }

    set((state) => {
      const lastUndoSnapshot = state.undoStack[state.undoStack.length - 1]
      const nextUndoStack =
        lastUndoSnapshot !== undefined &&
        historySnapshotsEqual(lastUndoSnapshot, bufferedEditSnapshot)
          ? state.undoStack
          : [...state.undoStack, bufferedEditSnapshot]

      return {
        undoStack: nextUndoStack.slice(-state.historyLimit),
        redoStack: [],
        bufferedEditSnapshot: undefined,
      }
    })
  },

  cancelBufferedEdit: () => {
    if (get().bufferedEditSnapshot === undefined) {
      return
    }
    set({ bufferedEditSnapshot: undefined })
  },

  canUndo: () => get().undoStack.length > 0,

  canRedo: () => get().redoStack.length > 0,

  undo: () => {
    const current = get()
    const undoStackLength = current.undoStack.length
    if (undoStackLength === 0) {
      return
    }

    const previousSnapshot = current.undoStack[undoStackLength - 1]
    const currentSnapshot = createHistorySnapshot(current)

    set((state) => ({
      displayedNotes: cloneDisplayedNotes(previousSnapshot.displayedNotes),
      connections: cloneConnections(previousSnapshot.connections),
      exportFretStart: previousSnapshot.exportFretStart,
      exportFretEnd: previousSnapshot.exportFretEnd,
      backgroundOpacityPercent: previousSnapshot.backgroundOpacityPercent,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot].slice(-state.historyLimit),
      bufferedEditSnapshot: undefined,
    }))
  },

  redo: () => {
    const current = get()
    const redoStackLength = current.redoStack.length
    if (redoStackLength === 0) {
      return
    }

    const nextSnapshot = current.redoStack[redoStackLength - 1]
    const currentSnapshot = createHistorySnapshot(current)

    set((state) => ({
      displayedNotes: cloneDisplayedNotes(nextSnapshot.displayedNotes),
      connections: cloneConnections(nextSnapshot.connections),
      exportFretStart: nextSnapshot.exportFretStart,
      exportFretEnd: nextSnapshot.exportFretEnd,
      backgroundOpacityPercent: nextSnapshot.backgroundOpacityPercent,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentSnapshot].slice(-state.historyLimit),
      bufferedEditSnapshot: undefined,
    }))
  },

  addScaleNotes: () => {
    const {
      keyPc,
      selectedScale,
      displayedNotes,
      exportFretStart,
      exportFretEnd,
      addScaleWithinExportRange,
    } = get()
    if (selectedScale === undefined) {
      return
    }

    const pcsToAdd = new Set(
      SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
    )

    const next: Record<PositionId, HighlightedNote> = { ...displayedNotes }
    let didChange = false
    const minFret = addScaleWithinExportRange ? Math.min(exportFretStart, exportFretEnd) : 0
    const maxFret = addScaleWithinExportRange
      ? Math.max(exportFretStart, exportFretEnd)
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

    const current = get()
    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ displayedNotes: next })
  },

  clearHighlightedNotes: () => {
    const current = get()
    if (
      Object.keys(current.displayedNotes).length === 0 &&
      Object.keys(current.connections).length === 0
    ) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ displayedNotes: {}, connections: {} })
  },

  togglePosition: (positionId) => {
    const current = get()
    const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
    let nextConnections = current.connections

    if (next[positionId] !== undefined) {
      delete next[positionId]
      const filteredEntries = Object.entries(current.connections).filter(([, connection]) => {
        return connection.from !== positionId && connection.to !== positionId
      })
      nextConnections = Object.fromEntries(filteredEntries) as Record<ConnectionId, Connection>
    } else {
      next[positionId] = {
        positionId,
        isDimmed: false,
        colorVariant: 'default',
      }
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ displayedNotes: next, connections: nextConnections })
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

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ displayedNotes: next })
  },

  connectPositions: (from, to) => {
    if (from === to) {
      return
    }

    const current = get()
    const connectionId = getConnectionId(from, to)
    const currentConnections = current.connections
    if (currentConnections[connectionId] !== undefined) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
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
    const current = get()
    const currentConnections = current.connections
    if (currentConnections[connectionId] === undefined) {
      return
    }

    const nextConnections = { ...currentConnections }
    delete nextConnections[connectionId]

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ connections: nextConnections })
  },

  removeConnectionsByPosition: (positionId) => {
    const current = get()
    const currentConnections = current.connections
    const nextEntries = Object.entries(currentConnections).filter(([, connection]) => {
      return connection.from !== positionId && connection.to !== positionId
    })
    const nextConnections = Object.fromEntries(nextEntries) as Record<ConnectionId, Connection>

    if (Object.keys(nextConnections).length === Object.keys(currentConnections).length) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({ connections: nextConnections })
  },

  handleExportFretStartChange: (nextStart) => {
    const current = get()
    const clampedStart = Math.max(0, Math.min(nextStart, FRET_COUNT))
    const currentEnd = current.exportFretEnd
    const resolvedEnd = clampedStart > currentEnd ? clampedStart : currentEnd

    if (clampedStart === current.exportFretStart && resolvedEnd === currentEnd) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({
      exportFretStart: clampedStart,
      exportFretEnd: resolvedEnd,
    })
  },

  handleExportFretEndChange: (nextEnd) => {
    const current = get()
    const clampedEnd = Math.max(0, Math.min(nextEnd, FRET_COUNT))
    const currentStart = current.exportFretStart
    const resolvedStart = clampedEnd < currentStart ? clampedEnd : currentStart

    if (clampedEnd === current.exportFretEnd && resolvedStart === currentStart) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({
      exportFretEnd: clampedEnd,
      exportFretStart: resolvedStart,
    })
  },

  handleBackgroundOpacityPercentChange: (nextOpacity) => {
    const current = get()
    const clampedOpacity = Math.max(0, Math.min(nextOpacity, 100))
    if (clampedOpacity === current.backgroundOpacityPercent) {
      return
    }

    if (current.bufferedEditSnapshot === undefined) {
      const snapshot = createHistorySnapshot(current)
      set((state) => ({
        undoStack: [...state.undoStack, snapshot].slice(-state.historyLimit),
        redoStack: [],
      }))
    }

    set({
      backgroundOpacityPercent: clampedOpacity,
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
