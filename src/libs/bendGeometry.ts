export type BendGeometry = {
  control1X: number
  control1Y: number
  control2X: number
  control2Y: number
  endX: number
  endY: number
  leftX: number
  leftY: number
  rightX: number
  rightY: number
  path: string
}

export const createBendGeometry = (startX: number, startY: number): BendGeometry => {
  const control1X = startX + 14
  const control1Y = startY + 1
  const control2X = startX + 30
  const control2Y = startY - 8
  const endX = startX + 32
  const endY = startY - 36

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

  return {
    control1X,
    control1Y,
    control2X,
    control2Y,
    endX,
    endY,
    leftX,
    leftY,
    rightX,
    rightY,
    path: `M ${startX} ${startY} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${endX} ${endY}`,
  }
}
