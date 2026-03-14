import { useFretboardStore } from './fretboardStore'
import { loadPersistedHistory, savePersistedHistory } from './historyPersistence'
import {
  applyHistorySnapshotToActualStores,
  createHistorySnapshot,
  type HistorySnapshot,
} from './historySnapshot'
import { useHistoryStore } from './historyStore'
import { useSettingsStore } from './settingsStore'

let isConfigured = false
let isHydrating = false

const captureCurrentSnapshot = (): HistorySnapshot =>
  createHistorySnapshot(useFretboardStore.getState(), useSettingsStore.getState())

/**
 * ローカルストレージに現在のストアの状態を保存する
 * 各ストアから現在のStateを読んでそれを保存する
 */
const persistHistoryToLocalStorage = () => {
  if (isHydrating) {
    return
  }

  savePersistedHistory({
    current: captureCurrentSnapshot(),
    locale: useSettingsStore.getState().locale,
  })
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

    if (persisted.locale !== undefined) {
      useSettingsStore.setState({ locale: persisted.locale })
    }
  }
  isHydrating = false

  useFretboardStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })
  useSettingsStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })

  persistHistoryToLocalStorage()

  isConfigured = true
}
