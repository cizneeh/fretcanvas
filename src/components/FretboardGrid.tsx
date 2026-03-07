import { type ReactNode, useMemo } from 'react'
import { type BendArrow, FRET_NUMBERS, OPEN_STRINGS, type PositionId } from '../libs/model'
import { useFretboardStore } from '../stores/fretboardStore'
import { ConnectionLayer } from './fretboard-grid/ConnectionLayer'
import {
  FRET_CELL_WIDTH,
  HEADER_ROW_HEIGHT,
  LABEL_WIDTH,
  STRING_ROW_HEIGHT,
} from './fretboard-grid/constants'
import { FretHeaderRow } from './fretboard-grid/FretHeaderRow'
import { FretMarkerRow } from './fretboard-grid/FretMarkerRow'
import { StringRows } from './fretboard-grid/StringRows'

type FretboardGridProps = {
  previewConnection:
    | {
        from: PositionId
        toX: number
        toY: number
      }
    | undefined
  onSelectClosestHandleToFret: (fret: number) => void
  onNotePointerDown: (
    positionId: PositionId,
    isHighlighted: boolean,
    button: number,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onNoteClick: (
    positionId: PositionId,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
  ) => void
  onNoteContextMenu: (
    positionId: PositionId,
    isHighlighted: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onNotePointerUp: (positionId: PositionId) => void
  onBoardPointerMove: (clientX: number, clientY: number) => void
  onBoardPointerUpOrCancel: () => void
  onBoardRefChange: (node: HTMLDivElement | undefined) => void
  rangeTrack: ReactNode
}

export const FretboardGrid = ({
  previewConnection,
  onSelectClosestHandleToFret,
  onNotePointerDown,
  onNoteClick,
  onNoteContextMenu,
  onNotePointerUp,
  onBoardPointerMove,
  onBoardPointerUpOrCancel,
  onBoardRefChange,
  rangeTrack,
}: FretboardGridProps) => {
  const connectionsById = useFretboardStore((state) => state.connections)
  const bendsById = useFretboardStore((state) => state.bends)
  const removeConnection = useFretboardStore((state) => state.removeConnection)
  const removeBend = useFretboardStore((state) => state.removeBend)
  const connections = useMemo(() => Object.values(connectionsById), [connectionsById])
  const bends = useMemo(() => Object.values(bendsById) as BendArrow[], [bendsById])

  const svgWidth = LABEL_WIDTH + FRET_NUMBERS.length * FRET_CELL_WIDTH
  const svgHeight = HEADER_ROW_HEIGHT + OPEN_STRINGS.length * STRING_ROW_HEIGHT

  return (
    <div
      ref={(node) => {
        onBoardRefChange(node ?? undefined)
      }}
      className="relative"
      onPointerMove={(event) => {
        onBoardPointerMove(event.clientX, event.clientY)
      }}
      onPointerUp={onBoardPointerUpOrCancel}
      onPointerCancel={onBoardPointerUpOrCancel}
      onPointerLeave={onBoardPointerUpOrCancel}
    >
      <ConnectionLayer
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        connections={connections}
        bends={bends}
        previewConnection={previewConnection}
        onRemoveConnection={removeConnection}
        onRemoveBend={removeBend}
      />

      <div
        className="grid"
        style={{
          gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
        }}
      >
        <FretHeaderRow />

        <StringRows
          onNotePointerDown={onNotePointerDown}
          onNoteClick={onNoteClick}
          onNoteContextMenu={onNoteContextMenu}
          onNotePointerUp={onNotePointerUp}
        />

        <FretMarkerRow onSelectClosestHandleToFret={onSelectClosestHandleToFret} />

        {rangeTrack}
      </div>
    </div>
  )
}
