import { Fragment, type ReactNode, useState } from 'react'
import {
  type Connection,
  DEGREE_LABELS,
  FRET_NUMBERS,
  type HighlightedNote,
  MARKER_FRETS,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  parsePositionId,
  toPositionId,
} from '../libs/model'
import { NoteChip } from './NoteChip'

const LABEL_WIDTH = 32
const HEADER_ROW_HEIGHT = 32
const STRING_ROW_HEIGHT = 48
const FRET_CELL_WIDTH = 56

type FretboardGridProps = {
  keyPc: PitchClass
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Connection[]
  exportFretStart: number
  exportFretEnd: number
  startHighlightFret: number
  previewConnection:
    | {
        from: PositionId
        toX: number
        toY: number
      }
    | undefined
  onSelectClosestHandleToFret: (fret: number) => void
  onRemoveConnection: (connectionId: string) => void
  onNotePointerDown: (
    positionId: PositionId,
    isHighlighted: boolean,
    button: number,
    isMetaKey: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onNoteClick: (positionId: PositionId, isMetaKey: boolean) => void
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
  keyPc,
  displayedNotes,
  connections,
  exportFretStart,
  exportFretEnd,
  startHighlightFret,
  previewConnection,
  onSelectClosestHandleToFret,
  onRemoveConnection,
  onNotePointerDown,
  onNoteClick,
  onNoteContextMenu,
  onNotePointerUp,
  onBoardPointerMove,
  onBoardPointerUpOrCancel,
  onBoardRefChange,
  rangeTrack,
}: FretboardGridProps) => {
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | undefined>(undefined)
  const startMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-cyan-300'
  const endMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-emerald-300'

  const getPositionPoint = (positionId: PositionId): { x: number; y: number } | undefined => {
    const parsed = parsePositionId(positionId)
    if (parsed === undefined) {
      return undefined
    }

    const stringIndex = parsed.stringIndex
    if (stringIndex < 0) {
      return undefined
    }

    return {
      x: LABEL_WIDTH + parsed.fret * FRET_CELL_WIDTH + FRET_CELL_WIDTH / 2,
      y: HEADER_ROW_HEIGHT + stringIndex * STRING_ROW_HEIGHT + STRING_ROW_HEIGHT / 2,
    }
  }

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
      <svg
        className="pointer-events-none absolute left-0 top-0 z-[5]"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {connections.map((connection) => {
          const fromPoint = getPositionPoint(connection.from)
          const toPoint = getPositionPoint(connection.to)
          if (fromPoint === undefined || toPoint === undefined) {
            return undefined
          }

          const isHovered = hoveredConnectionId === connection.id

          return (
            <g key={connection.id}>
              <line
                className="pointer-events-auto cursor-pointer"
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke="rgba(0, 0, 0, 0.001)"
                strokeWidth={14}
                strokeLinecap="round"
                onPointerEnter={() => {
                  setHoveredConnectionId(connection.id)
                }}
                onPointerLeave={() => {
                  setHoveredConnectionId(undefined)
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveConnection(connection.id)
                }}
              />
              <line
                className="pointer-events-none"
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke={isHovered ? 'rgba(34, 211, 238, 1)' : 'rgba(34, 211, 238, 0.9)'}
                strokeWidth={isHovered ? 4 : 2.5}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 140ms ease, stroke 140ms ease' }}
              />
            </g>
          )
        })}

        {previewConnection !== undefined
          ? (() => {
              const fromPoint = getPositionPoint(previewConnection.from)
              if (fromPoint === undefined) {
                return undefined
              }

              return (
                <line
                  x1={fromPoint.x}
                  y1={fromPoint.y}
                  x2={previewConnection.toX}
                  y2={previewConnection.toY}
                  stroke="rgba(34, 211, 238, 0.55)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
              )
            })()
          : undefined}
      </svg>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `2rem repeat(${FRET_NUMBERS.length}, minmax(3.5rem, 3.5rem))`,
        }}
      >
        <div />
        {FRET_NUMBERS.map((fret) => (
          <div
            key={`fret-header-${fret}`}
            className="flex h-8 items-center justify-center pb-1 text-sm text-slate-300"
          >
            {fret}
          </div>
        ))}

        {OPEN_STRINGS.map((stringInfo, stringIndex) => (
          <Fragment key={stringInfo.id}>
            <div className="flex h-12 items-center justify-center pr-2 text-base text-slate-300">
              {stringInfo.name}
            </div>

            {/* ノート自体じゃなくて、マス目がmidiのデータを持ってるのか。で、ノート自体は、midi　音高の情報を持っていない。マス目の上にノートが来たら、マス目の音高で表示される。 */}
            {FRET_NUMBERS.map((fret) => {
              const positionId = toPositionId({ stringIndex, fret })
              const pitchClass = normalizePc(stringInfo.midi + fret)
              const displayedNote = displayedNotes[positionId]
              const isHighlighted = displayedNote !== undefined
              const intervalFromKey = normalizePc(pitchClass - keyPc)
              const isRoot = intervalFromKey === 0
              const isStartFret = fret === startHighlightFret
              const isEndFret = fret === exportFretEnd
              const isStartAtNutLine = exportFretStart === 0 && fret === 0

              return (
                <button
                  key={`${stringInfo.id}-${fret}`}
                  type="button"
                  className="group relative flex h-12 items-center justify-center border-r border-slate-700 focus-visible:outline-none"
                  onClick={(event) => {
                    onNoteClick(positionId, event.metaKey)
                  }}
                  onPointerDown={(event) => {
                    onNotePointerDown(
                      positionId,
                      isHighlighted,
                      event.button,
                      event.metaKey,
                      event.clientX,
                      event.clientY,
                    )
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    onNoteContextMenu(positionId, isHighlighted, event.clientX, event.clientY)
                  }}
                  onPointerUp={() => {
                    onNotePointerUp(positionId)
                  }}
                >
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-500/70" />
                  {isStartAtNutLine ? (
                    <span
                      className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[2px] ${startMarkerColor}`}
                    />
                  ) : undefined}
                  {isStartFret && !isStartAtNutLine ? (
                    <span
                      className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${startMarkerColor}`}
                    />
                  ) : undefined}
                  {isEndFret ? (
                    <span
                      className={`pointer-events-none absolute bottom-0 right-[-1px] top-0 z-10 w-[2px] ${endMarkerColor}`}
                    />
                  ) : undefined}
                  <NoteChip
                    isHighlighted={isHighlighted}
                    isRoot={isRoot}
                    isDimmed={displayedNote?.isDimmed ?? false}
                    label={DEGREE_LABELS[intervalFromKey]}
                  />
                </button>
              )
            })}
          </Fragment>
        ))}

        <div />
        {FRET_NUMBERS.map((fret) => {
          const isDoubleDot = fret === 12 || fret === 24
          const showMarker = MARKER_FRETS.includes(fret)

          return (
            <button
              key={`marker-${fret}`}
              type="button"
              className="relative flex h-6 items-center justify-center pt-2 focus-visible:outline-none"
              data-testid={`fret-selector-${fret}`}
              onClick={() => {
                onSelectClosestHandleToFret(fret)
              }}
            >
              {showMarker ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  {isDoubleDot ? <span className="h-2 w-2 rounded-full bg-slate-500" /> : undefined}
                </span>
              ) : undefined}
            </button>
          )
        })}

        {rangeTrack}
      </div>
    </div>
  )
}
