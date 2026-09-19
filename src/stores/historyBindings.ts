import type { Instrument } from '../libs/piano'
import { useFretboardStore } from './fretboardStore'
import { loadPersistedHistory, savePersistedHistory } from './historyPersistence'
import {
  applyHistorySnapshotToActualStores,
  createHistorySnapshot,
  type HistorySnapshot,
} from './historySnapshot'
import { useHistoryStore } from './historyStore'
import { transferInstrument } from './instrumentTransfer'
import { usePianoStore } from './pianoStore'
import { useSettingsStore } from './settingsStore'

let isConfigured = false
let isHydrating = false

const captureCurrentSnapshot = (): HistorySnapshot =>
  createHistorySnapshot(
    useFretboardStore.getState(),
    useSettingsStore.getState(),
    usePianoStore.getState(),
  )

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
  })
}

export const initializeHistoryBindings = (instrument: Instrument = 'guitar') => {
  if (isConfigured) {
    return
  }

  useHistoryStore.getState().configureBindings({
    capture: captureCurrentSnapshot,
    apply: (snapshot) => {
      applyHistorySnapshotToActualStores({
        snapshot,
        setPianoState: (next) => usePianoStore.setState(next),
        setFretboardState: (nextFretboardState) => {
          useFretboardStore.setState(nextFretboardState)
        },
        setSettingsState: (nextSettingsState) => {
          useSettingsStore.setState(nextSettingsState)
        },
      })
    },
  })

  const restoreCurrentInstrument = () => {
    isHydrating = true
    const persisted = loadPersistedHistory()
    if (persisted !== undefined) {
      applyHistorySnapshotToActualStores({
        snapshot: persisted.current,
        setPianoState: (next) => usePianoStore.setState(next),
        setFretboardState: (nextFretboardState) => {
          useFretboardStore.setState(nextFretboardState)
        },
        setSettingsState: (nextSettingsState) => {
          useSettingsStore.setState(nextSettingsState)
        },
      })
    }
    transferInstrument(instrument)
    isHydrating = false
  }
  restoreCurrentInstrument()

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return
    restoreCurrentInstrument()
    useHistoryStore.setState({ undoStack: [], redoStack: [], bufferedSnapshot: undefined })
    persistHistoryToLocalStorage()
  })

  useFretboardStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })
  usePianoStore.subscribe(persistHistoryToLocalStorage)
  useSettingsStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })

  persistHistoryToLocalStorage()

  isConfigured = true
}
