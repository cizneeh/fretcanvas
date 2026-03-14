import { useMemo, useState } from 'react'
import { type BendArrow, FRET_NUMBERS, type PositionId } from '../libs/musicCore'
import { useFretboardStore } from '../stores/fretboardStore'
import { ConnectionLayer } from './fretboard-grid/ConnectionLayer'
import {
  BOARD_PADDING_X,
  BOARD_PADDING_Y,
  FRET_CELL_WIDTH,
  HEADER_ROW_HEIGHT,
  LABEL_WIDTH,
  STRING_ROW_HEIGHT,
} from './fretboard-grid/constants'
import { FretHeaderRow } from './fretboard-grid/FretHeaderRow'
import { FretMarkerRow } from './fretboard-grid/FretMarkerRow'
import { StringRows } from './fretboard-grid/StringRows'
import { TuningMenu } from './TuningMenu'

type FretboardGridProps = {
  previewConnection:
    | {
        from: PositionId
        toX: number
        toY: number
      }
    | undefined
  selectionRect:
    | {
        left: number
        top: number
        width: number
        height: number
      }
    | undefined
  selectedPositionIds: Set<PositionId>
  disableCellPreview: boolean
  onSelectClosestHandleToFret: (fret: number) => void
  onBoardPointerDown: (clientX: number, clientY: number, target: EventTarget | null) => void
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
}

export const FretboardGrid = ({
  previewConnection,
  selectionRect,
  selectedPositionIds,
  disableCellPreview,
  onSelectClosestHandleToFret,
  onBoardPointerDown,
  onNotePointerDown,
  onNoteClick,
  onNoteContextMenu,
  onNotePointerUp,
  onBoardPointerMove,
  onBoardPointerUpOrCancel,
  onBoardRefChange,
}: FretboardGridProps) => {
  const [tuningMenuAnchor, setTuningMenuAnchor] = useState<HTMLElement | null>(null)
  const connectionsById = useFretboardStore((state) => state.connections)
  const bendsById = useFretboardStore((state) => state.bends)
  const strings = useFretboardStore((state) => state.strings)
  const removeConnection = useFretboardStore((state) => state.removeConnection)
  const removeBend = useFretboardStore((state) => state.removeBend)
  const connections = useMemo(() => Object.values(connectionsById), [connectionsById])
  const bends = useMemo(() => Object.values(bendsById) as BendArrow[], [bendsById])

  const gridWidth = LABEL_WIDTH + FRET_NUMBERS.length * FRET_CELL_WIDTH
  const gridHeight = HEADER_ROW_HEIGHT + strings.length * STRING_ROW_HEIGHT
  const svgWidth = BOARD_PADDING_X * 2 + gridWidth
  const svgHeight = BOARD_PADDING_Y * 2 + gridHeight

  return (
    <div
      ref={(node) => {
        onBoardRefChange(node ?? undefined)
      }}
      className="relative inline-block min-w-full px-5 py-8"
      onPointerDown={(event) => {
        onBoardPointerDown(event.clientX, event.clientY, event.target)
      }}
      onPointerMove={(event) => {
        onBoardPointerMove(event.clientX, event.clientY)
      }}
      onPointerUp={onBoardPointerUpOrCancel}
      onPointerCancel={onBoardPointerUpOrCancel}
      onPointerLeave={onBoardPointerUpOrCancel}
    >
      <TuningMenu
        anchorElement={tuningMenuAnchor}
        onClose={() => {
          setTuningMenuAnchor(null)
        }}
      />

      <ConnectionLayer
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        connections={connections}
        bends={bends}
        previewConnection={previewConnection}
        onRemoveConnection={removeConnection}
        onRemoveBend={removeBend}
      />

      {selectionRect !== undefined ? (
        <div
          className="pointer-events-none absolute z-[6] rounded-sm border border-dashed border-cyan-200/80 bg-cyan-200/10"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      ) : undefined}

      <div
        className="grid"
        style={{
          gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
        }}
      >
        <FretHeaderRow />

        <StringRows
          selectedPositionIds={selectedPositionIds}
          disableCellPreview={disableCellPreview}
          onNotePointerDown={onNotePointerDown}
          onNoteClick={onNoteClick}
          onNoteContextMenu={onNoteContextMenu}
          onOpenTuningMenu={(anchorElement) => {
            setTuningMenuAnchor(anchorElement)
          }}
          onNotePointerUp={onNotePointerUp}
        />

        <FretMarkerRow onSelectClosestHandleToFret={onSelectClosestHandleToFret} />
      </div>
    </div>
  )
}
