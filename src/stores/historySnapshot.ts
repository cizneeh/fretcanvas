import {
  createHistorySnapshot,
  type FretboardHistoryState,
  type HistorySnapshot,
  type SettingsHistoryState,
} from './historyTypes'

export const captureHistorySnapshot = ({
  fretboardState,
  settingsState,
}: {
  fretboardState: FretboardHistoryState
  settingsState: SettingsHistoryState
}): HistorySnapshot => createHistorySnapshot(fretboardState, settingsState)

export const applyHistorySnapshot = ({
  snapshot,
  setFretboardState,
  setSettingsState,
}: {
  snapshot: HistorySnapshot
  setFretboardState: (next: FretboardHistoryState) => void
  setSettingsState: (next: SettingsHistoryState) => void
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
