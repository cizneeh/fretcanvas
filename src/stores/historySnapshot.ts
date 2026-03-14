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

/**
 * 各storeのstateをコピーして、historysnapshotを作る
 * コピーしないと参照が共有される
 */
export const createHistorySnapshot = (
  fretboard: FretboardStoreState,
  settings: SettingsStoreState,
): HistorySnapshot => ({
  fretboard: {
    keyPc: fretboard.keyPc,
    noteLabelMode: fretboard.noteLabelMode,
    noteTextMode: fretboard.noteTextMode,
    selectedScale: fretboard.selectedScale,
    activeChordSymbol: fretboard.activeChordSymbol,
    chordInput: fretboard.chordInput,
    displayedNotes: { ...fretboard.displayedNotes },
    connections: { ...fretboard.connections },
    bends: { ...fretboard.bends },
  },
  settings: {
    exportFretStart: settings.exportFretStart,
    exportFretEnd: settings.exportFretEnd,
    backgroundOpacityPercent: settings.backgroundOpacityPercent,
    addScaleWithinExportRange: settings.addScaleWithinExportRange,
    showExportRangeHighlight: settings.showExportRangeHighlight,
    showExportTitle: settings.showExportTitle,
  },
})
const recordsEqual = <T>(
  left: Record<string, T>,
  right: Record<string, T>,
  itemEqual: (leftItem: T, rightItem: T) => boolean,
) => {
  const leftEntries = Object.entries(left)
  if (leftEntries.length !== Object.keys(right).length) {
    return false
  }

  for (const [key, leftItem] of leftEntries) {
    const rightItem = right[key]
    if (rightItem === undefined || !itemEqual(leftItem, rightItem)) {
      return false
    }
  }

  return true
}

const notesEqual = (
  left: HistorySnapshot['fretboard']['displayedNotes'],
  right: HistorySnapshot['fretboard']['displayedNotes'],
) =>
  recordsEqual(left, right, (leftNote, rightNote) => {
    return (
      leftNote.positionId === rightNote.positionId &&
      leftNote.isDimmed === rightNote.isDimmed &&
      leftNote.colorVariant === rightNote.colorVariant
    )
  })

const connectionsEqual = (
  left: HistorySnapshot['fretboard']['connections'],
  right: HistorySnapshot['fretboard']['connections'],
) =>
  recordsEqual(left, right, (leftConnection, rightConnection) => {
    return (
      leftConnection.id === rightConnection.id &&
      leftConnection.from === rightConnection.from &&
      leftConnection.to === rightConnection.to
    )
  })

const bendsEqual = (
  left: HistorySnapshot['fretboard']['bends'],
  right: HistorySnapshot['fretboard']['bends'],
) => recordsEqual(left, right, (leftBend, rightBend) => leftBend.from === rightBend.from)

export const historySnapshotsEqual = (left: HistorySnapshot, right: HistorySnapshot): boolean => {
  return (
    left.fretboard.keyPc === right.fretboard.keyPc &&
    left.fretboard.noteLabelMode === right.fretboard.noteLabelMode &&
    left.fretboard.noteTextMode === right.fretboard.noteTextMode &&
    left.fretboard.selectedScale === right.fretboard.selectedScale &&
    left.fretboard.activeChordSymbol === right.fretboard.activeChordSymbol &&
    left.fretboard.chordInput === right.fretboard.chordInput &&
    notesEqual(left.fretboard.displayedNotes, right.fretboard.displayedNotes) &&
    connectionsEqual(left.fretboard.connections, right.fretboard.connections) &&
    bendsEqual(left.fretboard.bends, right.fretboard.bends) &&
    left.settings.exportFretStart === right.settings.exportFretStart &&
    left.settings.exportFretEnd === right.settings.exportFretEnd &&
    left.settings.backgroundOpacityPercent === right.settings.backgroundOpacityPercent &&
    left.settings.addScaleWithinExportRange === right.settings.addScaleWithinExportRange &&
    left.settings.showExportRangeHighlight === right.settings.showExportRangeHighlight &&
    left.settings.showExportTitle === right.settings.showExportTitle
  )
}

export const applyHistorySnapshotToActualStores = ({
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
