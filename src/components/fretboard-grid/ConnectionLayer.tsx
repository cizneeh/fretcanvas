import { useState } from 'react'
import type { Connection, PositionId } from '../../libs/model'
import { getPositionPoint } from './constants'

type ConnectionLayerProps = {
  svgWidth: number
  svgHeight: number
  connections: Connection[]
  previewConnection:
    | {
        from: PositionId
        toX: number
        toY: number
      }
    | undefined
  onRemoveConnection: (connectionId: string) => void
}

export const ConnectionLayer = ({
  svgWidth,
  svgHeight,
  connections,
  previewConnection,
  onRemoveConnection,
}: ConnectionLayerProps) => {
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | undefined>(undefined)

  return (
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
  )
}
