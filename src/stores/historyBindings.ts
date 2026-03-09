import { useFretboardStore } from './fretboardStore'
import {
  applyHistorySnapshot,
  captureHistorySnapshot,
  createHistorySnapshot,
  type HistorySnapshot,
} from './historySnapshot'
import { useHistoryStore } from './historyStore'
import { useSettingsStore } from './settingsStore'

const HISTORY_STORAGE_KEY = 'fretmap:history:v1'

type PersistedHistory = {
  current: HistorySnapshot
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
}

let isConfigured = false
let isHydrating = false

const captureCurrentSnapshot = (): HistorySnapshot =>
  captureHistorySnapshot({
    fretboardState: useFretboardStore.getState(),
    settingsState: useSettingsStore.getState(),
  })

const cloneStack = (stack: HistorySnapshot[]): HistorySnapshot[] =>
  stack.map((snapshot) => createHistorySnapshot(snapshot.fretboard, snapshot.settings))

const normalizePersistedHistory = (value: unknown): PersistedHistory | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const candidate = value as Partial<PersistedHistory>
  if (
    candidate.current === undefined ||
    !Array.isArray(candidate.undoStack) ||
    !Array.isArray(candidate.redoStack)
  ) {
    return undefined
  }

  return {
    current: createHistorySnapshot(candidate.current.fretboard, candidate.current.settings),
    undoStack: cloneStack(candidate.undoStack),
    redoStack: cloneStack(candidate.redoStack),
  }
}

const loadPersistedHistory = (): PersistedHistory | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
  if (raw === null) {
    return undefined
  }

  try {
    return normalizePersistedHistory(JSON.parse(raw))
  } catch {
    return undefined
  }
}

const persistHistoryToLocalStorage = () => {
  if (typeof window === 'undefined' || isHydrating) {
    return
  }

  const historyState = useHistoryStore.getState()
  const current = captureCurrentSnapshot()
  const payload: PersistedHistory = {
    current: createHistorySnapshot(current.fretboard, current.settings),
    undoStack: cloneStack(historyState.undoStack).slice(-historyState.historyLimit),
    redoStack: cloneStack(historyState.redoStack).slice(-historyState.historyLimit),
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload))
}

export const initializeHistoryBindings = () => {
  if (isConfigured) {
    return
  }

  useHistoryStore.getState().configureBindings({
    capture: captureCurrentSnapshot,
    apply: (snapshot) => {
      applyHistorySnapshot({
        snapshot,
        setFretboardState: (nextFretboardState) => {
          useFretboardStore.setState(nextFretboardState)
        },
        setSettingsState: (nextSettingsState) => {
          useSettingsStore.setState(nextSettingsState)
        },
      })
    },
  })

  isHydrating = true
  const persisted = loadPersistedHistory()
  if (persisted !== undefined) {
    applyHistorySnapshot({
      snapshot: persisted.current,
      setFretboardState: (nextFretboardState) => {
        useFretboardStore.setState(nextFretboardState)
      },
      setSettingsState: (nextSettingsState) => {
        useSettingsStore.setState(nextSettingsState)
      },
    })

    useHistoryStore.setState((state) => ({
      undoStack: persisted.undoStack.slice(-state.historyLimit),
      redoStack: persisted.redoStack.slice(-state.historyLimit),
      bufferedSnapshot: undefined,
    }))
  }
  isHydrating = false

  useFretboardStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })
  useSettingsStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })
  useHistoryStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })

  persistHistoryToLocalStorage()

  isConfigured = true
}
