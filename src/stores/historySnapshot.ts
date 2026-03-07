import { useFretboardStore } from './fretboardStore'
import { createHistorySnapshot, type HistorySnapshot } from './historyTypes'
import { useSettingsStore } from './settingsStore'

export const captureHistorySnapshot = (): HistorySnapshot => {
  const fretboardState = useFretboardStore.getState()
  const settingsState = useSettingsStore.getState()

  return createHistorySnapshot(
    {
      keyPc: fretboardState.keyPc,
      selectedScale: fretboardState.selectedScale,
      displayedNotes: fretboardState.displayedNotes,
      connections: fretboardState.connections,
      bends: fretboardState.bends,
    },
    {
      exportFretStart: settingsState.exportFretStart,
      exportFretEnd: settingsState.exportFretEnd,
      backgroundOpacityPercent: settingsState.backgroundOpacityPercent,
      addScaleWithinExportRange: settingsState.addScaleWithinExportRange,
    },
  )
}

export const applyHistorySnapshot = (snapshot: HistorySnapshot) => {
  useFretboardStore.setState({
    keyPc: snapshot.fretboard.keyPc,
    selectedScale: snapshot.fretboard.selectedScale,
    displayedNotes: { ...snapshot.fretboard.displayedNotes },
    connections: { ...snapshot.fretboard.connections },
    bends: { ...snapshot.fretboard.bends },
  })

  useSettingsStore.setState({
    exportFretStart: snapshot.settings.exportFretStart,
    exportFretEnd: snapshot.settings.exportFretEnd,
    backgroundOpacityPercent: snapshot.settings.backgroundOpacityPercent,
    addScaleWithinExportRange: snapshot.settings.addScaleWithinExportRange,
  })
}
