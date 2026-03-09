import type { FretboardStoreState } from './fretboardStore'
import type { SettingsStoreState } from './settingsStore'

/**
 * 各storeの値のsnapshotを保持する
 * storeが増えたら、ここに追加される想定
 */
export type HistorySnapshot = {
  fretboard: FretboardStoreState
  settings: SettingsStoreState
}

const cloneFretboardState = (
  state: Pick<
    FretboardStoreState,
    'keyPc' | 'selectedScale' | 'displayedNotes' | 'connections' | 'bends'
  >,
): FretboardStoreState => ({
  keyPc: state.keyPc,
  selectedScale: state.selectedScale,
  displayedNotes: { ...state.displayedNotes },
  connections: { ...state.connections },
  bends: { ...state.bends },
})

const cloneSettingsState = (state: SettingsStoreState): SettingsStoreState => ({
  exportFretStart: state.exportFretStart,
  exportFretEnd: state.exportFretEnd,
  backgroundOpacityPercent: state.backgroundOpacityPercent,
  addScaleWithinExportRange: state.addScaleWithinExportRange,
})

export const createHistorySnapshot = (
  fretboard: FretboardStoreState,
  settings: SettingsStoreState,
): HistorySnapshot => ({
  fretboard: cloneFretboardState(fretboard),
  settings: cloneSettingsState(settings),
})

const notesEqual = (
  left: HistorySnapshot['fretboard']['displayedNotes'],
  right: HistorySnapshot['fretboard']['displayedNotes'],
) => {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  for (const [positionId, leftNote] of leftEntries) {
    const rightNote = right[positionId]
    if (rightNote === undefined) {
      return false
    }

    if (
      leftNote.positionId !== rightNote.positionId ||
      leftNote.isDimmed !== rightNote.isDimmed ||
      leftNote.colorVariant !== rightNote.colorVariant
    ) {
      return false
    }
  }

  return true
}

const connectionsEqual = (
  left: HistorySnapshot['fretboard']['connections'],
  right: HistorySnapshot['fretboard']['connections'],
) => {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  for (const [connectionId, leftConnection] of leftEntries) {
    const rightConnection = right[connectionId]
    if (rightConnection === undefined) {
      return false
    }

    if (
      leftConnection.id !== rightConnection.id ||
      leftConnection.from !== rightConnection.from ||
      leftConnection.to !== rightConnection.to
    ) {
      return false
    }
  }

  return true
}

const bendsEqual = (
  left: HistorySnapshot['fretboard']['bends'],
  right: HistorySnapshot['fretboard']['bends'],
) => {
  const leftEntries = Object.entries(left)
  const rightEntries = Object.entries(right)
  if (leftEntries.length !== rightEntries.length) {
    return false
  }

  for (const [bendId, leftBend] of leftEntries) {
    const rightBend = right[bendId]
    if (rightBend === undefined || rightBend.from !== leftBend.from) {
      return false
    }
  }

  return true
}

export const historySnapshotsEqual = (left: HistorySnapshot, right: HistorySnapshot): boolean => {
  return (
    left.fretboard.keyPc === right.fretboard.keyPc &&
    left.fretboard.selectedScale === right.fretboard.selectedScale &&
    notesEqual(left.fretboard.displayedNotes, right.fretboard.displayedNotes) &&
    connectionsEqual(left.fretboard.connections, right.fretboard.connections) &&
    bendsEqual(left.fretboard.bends, right.fretboard.bends) &&
    left.settings.exportFretStart === right.settings.exportFretStart &&
    left.settings.exportFretEnd === right.settings.exportFretEnd &&
    left.settings.backgroundOpacityPercent === right.settings.backgroundOpacityPercent &&
    left.settings.addScaleWithinExportRange === right.settings.addScaleWithinExportRange
  )
}

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
