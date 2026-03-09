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

export const createHistorySnapshot = (
  fretboard: FretboardStoreState,
  settings: SettingsStoreState,
): HistorySnapshot => ({
  fretboard: {
    keyPc: fretboard.keyPc,
    selectedScale: fretboard.selectedScale,
    displayedNotes: { ...fretboard.displayedNotes },
    connections: { ...fretboard.connections },
    bends: { ...fretboard.bends },
  },
  settings: {
    exportFretStart: settings.exportFretStart,
    exportFretEnd: settings.exportFretEnd,
    backgroundOpacityPercent: settings.backgroundOpacityPercent,
    addScaleWithinExportRange: settings.addScaleWithinExportRange,
  },
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

export const applyHistorySnapshot = ({
  snapshot,
  setFretboardState,
  setSettingsState,
}: {
  snapshot: HistorySnapshot
  setFretboardState: (next: FretboardStoreState) => void
  setSettingsState: (next: SettingsStoreState) => void
}) => {
  const cloned = createHistorySnapshot(snapshot.fretboard, snapshot.settings)
  setFretboardState(cloned.fretboard)
  setSettingsState(cloned.settings)
}
