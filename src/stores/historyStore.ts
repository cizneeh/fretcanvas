import { create } from 'zustand'
import {
  createHistorySnapshot,
  type HistorySnapshot,
  historySnapshotsEqual,
} from './historySnapshot'

type HistoryBindings = {
  capture: () => HistorySnapshot
  apply: (snapshot: HistorySnapshot) => void
}

/**
 * 編集のhistoryを持つstore
 * undo/redoのstackと、その更新ロジックを持つ
 * state変更時、その変更前の状態がsnapshotとしてundostackに入る
 */
type HistoryStore = {
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  historyLimit: number
  /**
   * ドラッグみたいな連続での変更を 1回の履歴にまとめるための一時バッファ
   * 変更開始時にコミットだと、実際には変更が無かった場合に困るのでバッファが必要
   * あるいは、変更操作をキャンセルするような場合にもこれが使えるはず
   */
  bufferedSnapshot: HistorySnapshot | undefined
  bindings: HistoryBindings | undefined
  configureBindings: (bindings: HistoryBindings) => void
  captureSnapshot: () => HistorySnapshot | undefined
  pushBeforeChange: () => void
  beginBufferedEdit: (snapshot: HistorySnapshot) => void
  commitBufferedEdit: (snapshot: HistorySnapshot) => void
  cancelBufferedEdit: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => void
  redo: () => void
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  historyLimit: 100,
  bufferedSnapshot: undefined,
  bindings: undefined,

  configureBindings: (bindings) => {
    set({ bindings })
  },

  captureSnapshot: () => {
    const bindings = get().bindings
    if (bindings === undefined) {
      return undefined
    }

    return bindings.capture()
  },

  pushBeforeChange: () => {
    const snapshot = get().captureSnapshot()
    if (snapshot === undefined) {
      return
    }

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

  undo: () => {
    const current = get()
    if (current.undoStack.length === 0 || current.bindings === undefined) {
      return
    }

    const previousSnapshot = current.undoStack[current.undoStack.length - 1]
    const currentSnapshot = current.bindings.capture()

    current.bindings.apply(previousSnapshot)

    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [
        ...state.redoStack,
        createHistorySnapshot(currentSnapshot.fretboard, currentSnapshot.settings),
      ].slice(-state.historyLimit),
      bufferedSnapshot: undefined,
    }))
  },

  redo: () => {
    const current = get()
    if (current.redoStack.length === 0 || current.bindings === undefined) {
      return
    }

    const nextSnapshot = current.redoStack[current.redoStack.length - 1]
    const currentSnapshot = current.bindings.capture()

    current.bindings.apply(nextSnapshot)

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
