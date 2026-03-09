import { useFretboardStore } from './fretboardStore'
import {
  applyHistorySnapshotToActualStores,
  createHistorySnapshot,
  type HistorySnapshot,
} from './historySnapshot'
import { useHistoryStore } from './historyStore'
import { useSettingsStore } from './settingsStore'

const HISTORY_STORAGE_KEY = 'fretmap:history:v1'

type PersistedHistory = {
  current: HistorySnapshot
}

let isConfigured = false
let isHydrating = false

const captureCurrentSnapshot = (): HistorySnapshot =>
  createHistorySnapshot(useFretboardStore.getState(), useSettingsStore.getState())

const normalizePersistedHistory = (value: unknown): PersistedHistory | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const candidate = value as Partial<PersistedHistory>
  if (candidate.current === undefined) {
    return undefined
  }

  return {
    current: createHistorySnapshot(candidate.current.fretboard, candidate.current.settings),
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

  const current = captureCurrentSnapshot()
  const payload: PersistedHistory = {
    current: createHistorySnapshot(current.fretboard, current.settings),
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
      applyHistorySnapshotToActualStores({
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
    applyHistorySnapshotToActualStores({
      snapshot: persisted.current,
      setFretboardState: (nextFretboardState) => {
        useFretboardStore.setState(nextFretboardState)
      },
      setSettingsState: (nextSettingsState) => {
        useSettingsStore.setState(nextSettingsState)
      },
    })

    useHistoryStore.setState((state) => ({
      undoStack: [],
      redoStack: [],
      bufferedSnapshot: undefined,
      historyLimit: state.historyLimit,
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
