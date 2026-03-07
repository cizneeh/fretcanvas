import { create } from 'zustand'
import { createHistorySnapshot, type HistorySnapshot, historySnapshotsEqual } from './historyTypes'

type HistoryStore = {
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  historyLimit: number
  bufferedSnapshot: HistorySnapshot | undefined
  pushBeforeChange: (snapshot: HistorySnapshot) => void
  beginBufferedEdit: (snapshot: HistorySnapshot) => void
  commitBufferedEdit: (snapshot: HistorySnapshot) => void
  cancelBufferedEdit: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  undo: (
    getCurrentSnapshot: () => HistorySnapshot,
    applySnapshot: (snapshot: HistorySnapshot) => void,
  ) => void
  redo: (
    getCurrentSnapshot: () => HistorySnapshot,
    applySnapshot: (snapshot: HistorySnapshot) => void,
  ) => void
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  historyLimit: 100,
  bufferedSnapshot: undefined,

  pushBeforeChange: (snapshot) => {
    set((state) => {
      const last = state.undoStack[state.undoStack.length - 1]
      const nextUndoStack =
        last !== undefined && historySnapshotsEqual(last, snapshot)
          ? state.undoStack
          : [...state.undoStack, createHistorySnapshot(snapshot.fretboard, snapshot.settings)]

      return {
        undoStack: nextUndoStack.slice(-state.historyLimit),
        redoStack: [],
      }
    })
  },

  beginBufferedEdit: (snapshot) => {
    set((state) => {
      if (state.bufferedSnapshot !== undefined) {
        return state
      }

      return {
        bufferedSnapshot: createHistorySnapshot(snapshot.fretboard, snapshot.settings),
      }
    })
  },

  commitBufferedEdit: (snapshot) => {
    const current = get()
    if (current.bufferedSnapshot === undefined) {
      return
    }

    set((state) => {
      const buffered = state.bufferedSnapshot
      if (buffered === undefined) {
        return state
      }

      if (historySnapshotsEqual(buffered, snapshot)) {
        return {
          bufferedSnapshot: undefined,
        }
      }

      const last = state.undoStack[state.undoStack.length - 1]
      const nextUndoStack =
        last !== undefined && historySnapshotsEqual(last, buffered)
          ? state.undoStack
          : [...state.undoStack, createHistorySnapshot(buffered.fretboard, buffered.settings)]

      return {
        undoStack: nextUndoStack.slice(-state.historyLimit),
        redoStack: [],
        bufferedSnapshot: undefined,
      }
    })
  },

  cancelBufferedEdit: () => {
    set({ bufferedSnapshot: undefined })
  },

  canUndo: () => get().undoStack.length > 0,

  canRedo: () => get().redoStack.length > 0,

  undo: (getCurrentSnapshot, applySnapshot) => {
    const current = get()
    if (current.undoStack.length === 0) {
      return
    }

    const previousSnapshot = current.undoStack[current.undoStack.length - 1]
    const currentSnapshot = getCurrentSnapshot()

    applySnapshot(previousSnapshot)

    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [
        ...state.redoStack,
        createHistorySnapshot(currentSnapshot.fretboard, currentSnapshot.settings),
      ].slice(-state.historyLimit),
      bufferedSnapshot: undefined,
    }))
  },

  redo: (getCurrentSnapshot, applySnapshot) => {
    const current = get()
    if (current.redoStack.length === 0) {
      return
    }

    const nextSnapshot = current.redoStack[current.redoStack.length - 1]
    const currentSnapshot = getCurrentSnapshot()

    applySnapshot(nextSnapshot)

    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [
        ...state.undoStack,
        createHistorySnapshot(currentSnapshot.fretboard, currentSnapshot.settings),
      ].slice(-state.historyLimit),
      bufferedSnapshot: undefined,
    }))
  },
}))
