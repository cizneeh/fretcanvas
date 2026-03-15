import { getScaleExportTitle } from '../../i18n/config'
import { getAbsoluteNoteLabelByKey } from '../noteDisplay'
import type { ExportGraphicInput, ExportLayout } from './types'

const getExportTitle = ({
  locale,
  keyPc,
  noteLabelMode,
  selectedScale,
  appliedChordSymbol,
}: Pick<
  ExportGraphicInput,
  'appliedChordSymbol' | 'keyPc' | 'locale' | 'noteLabelMode' | 'selectedScale'
>): string | undefined => {
  if (noteLabelMode === 'scale') {
    if (selectedScale === undefined) {
      return undefined
    }

    return getScaleExportTitle(locale, getAbsoluteNoteLabelByKey(keyPc, keyPc), selectedScale)
  }

  return appliedChordSymbol
}

export const EXPORT_CANVAS_FONT_STACK = '"Avenir Next", "Avenir", "Segoe UI", sans-serif'
export const EXPORT_SVG_FONT_STACK = 'Avenir Next, Avenir, Segoe UI, sans-serif'

export const getExportLayout = ({
  locale,
  keyPc,
  noteLabelMode,
  selectedScale,
  appliedChordSymbol,
  strings,
  exportFretStart,
  exportFretEnd,
  showExportTitle,
  showExportStringLabels,
}: Pick<
  ExportGraphicInput,
  | 'locale'
  | 'keyPc'
  | 'noteLabelMode'
  | 'selectedScale'
  | 'appliedChordSymbol'
  | 'strings'
  | 'exportFretStart'
  | 'exportFretEnd'
  | 'showExportTitle'
  | 'showExportStringLabels'
>): ExportLayout => {
  const start = Math.min(exportFretStart, exportFretEnd)
  const end = Math.max(exportFretStart, exportFretEnd)
  const fretCountInRange = end - start + 1
  const exportTitle = getExportTitle({
    locale,
    keyPc,
    noteLabelMode,
    selectedScale,
    appliedChordSymbol,
  })
  const paddingX = 12
  const paddingY = 12
  const labelWidth = showExportStringLabels ? 34 : 0
  const titleHeight = showExportTitle && exportTitle !== undefined ? 26 : 0
  const headerHeight = 26
  const rowHeight = 44
  const stringCount = strings.length
  const markerHeight = 20
  const cellWidth = 64
  const boardHeight = stringCount * rowHeight
  const canvasWidth = paddingX * 2 + labelWidth + fretCountInRange * cellWidth
  const canvasHeight = paddingY * 2 + titleHeight + headerHeight + boardHeight + markerHeight
  const boardLeft = paddingX + labelWidth
  const boardTop = paddingY + titleHeight + headerHeight
  const markerY = boardTop + boardHeight + markerHeight / 2

  return {
    start,
    end,
    fretCountInRange,
    exportTitle,
    paddingX,
    paddingY,
    labelWidth,
    titleHeight,
    headerHeight,
    rowHeight,
    stringCount,
    markerHeight,
    cellWidth,
    boardHeight,
    canvasWidth,
    canvasHeight,
    boardLeft,
    boardTop,
    markerY,
  }
}
