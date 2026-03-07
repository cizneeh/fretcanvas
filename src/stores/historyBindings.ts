import { useFretboardStore } from './fretboardStore'
import { applyHistorySnapshot, captureHistorySnapshot } from './historySnapshot'
import { useHistoryStore } from './historyStore'
import { useSettingsStore } from './settingsStore'

let isConfigured = false

export const initializeHistoryBindings = () => {
  if (isConfigured) {
    return
  }

  useHistoryStore.getState().configureBindings({
    capture: () =>
      captureHistorySnapshot({
        fretboardState: useFretboardStore.getState(),
        settingsState: useSettingsStore.getState(),
      }),
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

  isConfigured = true
}
