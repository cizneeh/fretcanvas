import type { PositionId } from '../../libs/model'
import { parsePositionId } from '../../libs/model'

export const LABEL_WIDTH = 32
export const HEADER_ROW_HEIGHT = 32
export const STRING_ROW_HEIGHT = 48
export const FRET_CELL_WIDTH = 56
export const BOARD_PADDING_X = 20
export const BOARD_PADDING_Y = 16

export const getPositionPoint = (positionId: PositionId): { x: number; y: number } | undefined => {
  const parsed = parsePositionId(positionId)
  if (parsed === undefined) {
    return undefined
  }

  const stringIndex = parsed.stringIndex
  if (stringIndex < 0) {
    return undefined
  }

  return {
    x: BOARD_PADDING_X + LABEL_WIDTH + parsed.fret * FRET_CELL_WIDTH + FRET_CELL_WIDTH / 2,
    y:
      BOARD_PADDING_Y + HEADER_ROW_HEIGHT + stringIndex * STRING_ROW_HEIGHT + STRING_ROW_HEIGHT / 2,
  }
}
