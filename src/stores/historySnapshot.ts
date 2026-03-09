import type { FretboardStoreState } from './fretboardStore'
import { createHistorySnapshot, type HistorySnapshot } from './historyTypes'
import type { SettingsStoreState } from './settingsStore'

export const captureHistorySnapshot = ({
  fretboardState,
  settingsState,
}: {
  fretboardState: FretboardStoreState
  settingsState: SettingsStoreState
}): HistorySnapshot => createHistorySnapshot(fretboardState, settingsState)

export const applyHistorySnapshot = ({
  snapshot,
  setFretboardState,
  setSettingsState,
}: {
  snapshot: HistorySnapshot
  setFretboardState: (next: FretboardStoreState) => void
  setSettingsState: (next: SettingsStoreState) => void
}) => {
  setFretboardState({
    keyPc: snapshot.fretboard.keyPc,
    selectedScale: snapshot.fretboard.selectedScale,
    displayedNotes: { ...snapshot.fretboard.displayedNotes },
    connections: { ...snapshot.fretboard.connections },
    bends: { ...snapshot.fretboard.bends },
  })

  setSettingsState({
    exportFretStart: snapshot.settings.exportFretStart,
    exportFretEnd: snapshot.settings.exportFretEnd,
    backgroundOpacityPercent: snapshot.settings.backgroundOpacityPercent,
    addScaleWithinExportRange: snapshot.settings.addScaleWithinExportRange,
  })
}
