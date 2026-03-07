import { useState } from 'react'
import type { BendArrow, Connection, PositionId } from '../../libs/model'
import { getPositionPoint } from './constants'

type ConnectionLayerProps = {
  svgWidth: number
  svgHeight: number
  connections: Connection[]
  bends: BendArrow[]
  previewConnection:
    | {
        from: PositionId
        toX: number
        toY: number
      }
    | undefined
  onRemoveConnection: (connectionId: string) => void
  onRemoveBend: (bendId: string) => void
}

export const ConnectionLayer = ({
  svgWidth,
  svgHeight,
  connections,
  bends,
  previewConnection,
  onRemoveConnection,
  onRemoveBend,
}: ConnectionLayerProps) => {
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | undefined>(undefined)
  const [hoveredBendId, setHoveredBendId] = useState<string | undefined>(undefined)

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

      {bends.map((bend) => {
        const fromPoint = getPositionPoint(bend.from)
        if (fromPoint === undefined) {
          return undefined
        }

        const startX = fromPoint.x
        const startY = fromPoint.y
        const control1X = startX + 18
        const control1Y = startY + 1
        const control2X = startX + 38
        const control2Y = startY - 8
        const endX = startX + 40
        const endY = startY - 46
        const isHovered = hoveredBendId === bend.id
        const strokeWidth = isHovered ? 3.8 : 2.4
        const strokeColor = isHovered ? 'rgba(192, 132, 252, 0.96)' : 'rgba(192, 132, 252, 0.78)'

        const tangentX = endX - control2X
        const tangentY = endY - control2Y
        const tangentLength = Math.hypot(tangentX, tangentY) || 1
        const unitX = tangentX / tangentLength
        const unitY = tangentY / tangentLength
        const arrowLength = 8
        const arrowSpread = 4
        const leftX = endX - unitX * arrowLength - unitY * arrowSpread
        const leftY = endY - unitY * arrowLength + unitX * arrowSpread
        const rightX = endX - unitX * arrowLength + unitY * arrowSpread
        const rightY = endY - unitY * arrowLength - unitX * arrowSpread

        const path = `M ${startX} ${startY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${endX} ${endY}`

        return (
          <g key={bend.id}>
            <path
              className="pointer-events-auto cursor-pointer"
              d={path}
              fill="none"
              stroke="rgba(0, 0, 0, 0.001)"
              strokeWidth={14}
              strokeLinecap="round"
              onPointerEnter={() => {
                setHoveredBendId(bend.id)
              }}
              onPointerLeave={() => {
                setHoveredBendId(undefined)
              }}
              onClick={(event) => {
                event.stopPropagation()
                onRemoveBend(bend.id)
              }}
            />

            <path
              className="pointer-events-none"
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 140ms ease, stroke 140ms ease' }}
            />
            <path
              className="pointer-events-none"
              d={`M ${leftX} ${leftY} L ${endX} ${endY} L ${rightX} ${rightY}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
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
