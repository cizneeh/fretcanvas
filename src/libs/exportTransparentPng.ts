import { createBendGeometry } from './bendGeometry'
import {
  type BendArrow,
  type Connection,
  getDisplayedNoteLabel,
  getExportTitle,
  getNoteVisualRole,
  type HighlightedNote,
  MARKER_FRETS,
  type NoteLabelMode,
  type NoteTextMode,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  parsePositionId,
  type ScaleId,
  toPositionId,
} from './model'
import { getNotePalette } from './notePalette'

export type ExportGraphicInput = {
  keyPc: PitchClass
  noteLabelMode: NoteLabelMode
  noteTextMode: NoteTextMode
  selectedScale: ScaleId | undefined
  appliedChordSymbol: string | undefined
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Connection[]
  bends: BendArrow[]
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
  showExportTitle: boolean
}

type ExportLayout = {
  start: number
  end: number
  fretCountInRange: number
  exportTitle: string | undefined
  paddingX: number
  paddingY: number
  labelWidth: number
  titleHeight: number
  headerHeight: number
  rowHeight: number
  markerHeight: number
  cellWidth: number
  boardHeight: number
  canvasWidth: number
  canvasHeight: number
  boardLeft: number
  boardTop: number
  markerY: number
}

const EXPORT_CANVAS_FONT_STACK = '"Avenir Next", "Avenir", "Segoe UI", sans-serif'
const EXPORT_SVG_FONT_STACK = 'Avenir Next, Avenir, Segoe UI, sans-serif'

const getExportLayout = ({
  keyPc,
  noteLabelMode,
  selectedScale,
  appliedChordSymbol,
  exportFretStart,
  exportFretEnd,
  showExportTitle,
}: Pick<
  ExportGraphicInput,
  | 'keyPc'
  | 'noteLabelMode'
  | 'selectedScale'
  | 'appliedChordSymbol'
  | 'exportFretStart'
  | 'exportFretEnd'
  | 'showExportTitle'
>): ExportLayout => {
  const start = Math.min(exportFretStart, exportFretEnd)
  const end = Math.max(exportFretStart, exportFretEnd)
  const fretCountInRange = end - start + 1
  const exportTitle = getExportTitle(keyPc, noteLabelMode, selectedScale, appliedChordSymbol)
  const paddingX = 12
  const paddingY = 12
  const labelWidth = 34
  const titleHeight = showExportTitle && exportTitle !== undefined ? 26 : 0
  const headerHeight = 26
  const rowHeight = 44
  const markerHeight = 20
  const cellWidth = 56
  const boardHeight = OPEN_STRINGS.length * rowHeight
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

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const downloadBlob = (blob: Blob, filename: string) => {
  const downloadUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.setAttribute('download', filename)
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000)
}

const getExportFilename = (
  input: Pick<ExportGraphicInput, 'exportFretStart' | 'exportFretEnd'>,
  format: 'png' | 'svg',
) => {
  const start = Math.min(input.exportFretStart, input.exportFretEnd)
  const end = Math.max(input.exportFretStart, input.exportFretEnd)
  return `fretmap-frets-${start}-${end}.${format}`
}

export const renderExportPngCanvas = ({
  keyPc,
  noteLabelMode,
  noteTextMode,
  selectedScale,
  appliedChordSymbol,
  displayedNotes,
  connections,
  bends,
  backgroundOpacityPercent,
  showExportTitle,
  ...rangeInput
}: ExportGraphicInput) => {
  const layout = getExportLayout({
    keyPc,
    noteLabelMode,
    selectedScale,
    appliedChordSymbol,
    showExportTitle,
    ...rangeInput,
  })
  const canvas = document.createElement('canvas')
  canvas.width = layout.canvasWidth
  canvas.height = layout.canvasHeight
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return undefined
  }

  ctx.clearRect(0, 0, layout.canvasWidth, layout.canvasHeight)
  if (backgroundOpacityPercent > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${(backgroundOpacityPercent / 100).toFixed(3)})`
    ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)
  }

  if (showExportTitle && layout.exportTitle !== undefined) {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)'
    ctx.font = `700 24px ${EXPORT_CANVAS_FONT_STACK}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      layout.exportTitle,
      layout.boardLeft + layout.cellWidth * 0.28,
      layout.paddingY + layout.titleHeight / 2 + 1,
    )
  }

  ctx.textAlign = 'center'
  ctx.font = `12px ${EXPORT_CANVAS_FONT_STACK}`
  ctx.textBaseline = 'middle'

  const drawNote = (stringIndex: number, midiBase: number, fret: number, yCenter: number) => {
    const positionId = toPositionId({
      stringIndex,
      fret,
    })
    const displayedNote = displayedNotes[positionId]
    if (displayedNote === undefined) {
      return
    }

    const pitchClass = normalizePc(midiBase + fret)
    const visualRole = getNoteVisualRole({
      pitchClass,
      noteLabelMode,
      keyPc,
      selectedScale,
      appliedChordSymbol,
    })
    const label = getDisplayedNoteLabel(
      pitchClass,
      noteTextMode,
      noteLabelMode,
      keyPc,
      appliedChordSymbol,
    )
    const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
    const palette = getNotePalette(visualRole)

    ctx.save()
    ctx.globalAlpha = displayedNote.isDimmed ? 0.35 : 1
    ctx.fillStyle = palette.png.fill
    ctx.beginPath()
    ctx.arc(xCenter, yCenter, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = palette.png.stroke
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(xCenter, yCenter, 16, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = `600 13px ${EXPORT_CANVAS_FONT_STACK}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 1
    ctx.fillText(label, xCenter, yCenter + 1.5)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.restore()
  }

  for (let fret = layout.start; fret <= layout.end; fret += 1) {
    const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
    const lineX = layout.boardLeft + (fret - layout.start + 1) * layout.cellWidth
    ctx.fillStyle = 'rgba(226, 232, 240, 0.98)'
    ctx.fillText(
      String(fret),
      xCenter,
      layout.paddingY + layout.titleHeight + layout.headerHeight / 2,
    )

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.78)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lineX, layout.boardTop)
    ctx.lineTo(lineX, layout.boardTop + layout.boardHeight)
    ctx.stroke()
  }

  if (layout.start === 0) {
    const nutRightX = layout.boardLeft + layout.cellWidth
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.92)'
    ctx.lineWidth = 2.8
    ctx.beginPath()
    ctx.moveTo(nutRightX, layout.boardTop)
    ctx.lineTo(nutRightX, layout.boardTop + layout.boardHeight)
    ctx.stroke()
  }

  OPEN_STRINGS.forEach((_stringInfo, row) => {
    const yCenter = layout.boardTop + row * layout.rowHeight + layout.rowHeight / 2
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.72)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(layout.boardLeft, yCenter)
    ctx.lineTo(layout.boardLeft + layout.fretCountInRange * layout.cellWidth, yCenter)
    ctx.stroke()
  })

  ctx.save()
  ctx.beginPath()
  const clipTop = Math.max(0, layout.boardTop - 56)
  ctx.rect(
    layout.boardLeft,
    clipTop,
    layout.fretCountInRange * layout.cellWidth,
    layout.boardTop + layout.boardHeight - clipTop,
  )
  ctx.clip()
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.95)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  for (const connection of connections) {
    const from = parsePositionId(connection.from)
    const to = parsePositionId(connection.to)
    if (from === undefined || to === undefined || from.stringIndex < 0 || to.stringIndex < 0) {
      continue
    }

    const fromX = layout.boardLeft + (from.fret - layout.start + 0.5) * layout.cellWidth
    const fromY = layout.boardTop + from.stringIndex * layout.rowHeight + layout.rowHeight / 2
    const toX = layout.boardLeft + (to.fret - layout.start + 0.5) * layout.cellWidth
    const toY = layout.boardTop + to.stringIndex * layout.rowHeight + layout.rowHeight / 2

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
  }

  for (const bend of bends) {
    const from = parsePositionId(bend.from)
    if (from === undefined || from.stringIndex < 0) {
      continue
    }

    const startX = layout.boardLeft + (from.fret - layout.start + 0.5) * layout.cellWidth
    const startY = layout.boardTop + from.stringIndex * layout.rowHeight + layout.rowHeight / 2
    const { control1X, control1Y, control2X, control2Y, endX, endY, leftX, leftY, rightX, rightY } =
      createBendGeometry(startX, startY)

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.82)'
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, endX, endY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(leftX, leftY)
    ctx.lineTo(endX, endY)
    ctx.lineTo(rightX, rightY)
    ctx.stroke()
  }

  ctx.restore()

  OPEN_STRINGS.forEach((stringInfo, stringIndex) => {
    const yCenter = layout.boardTop + stringIndex * layout.rowHeight + layout.rowHeight / 2
    for (let fret = layout.start; fret <= layout.end; fret += 1) {
      drawNote(stringIndex, stringInfo.midi, fret, yCenter)
    }
  })

  for (let fret = layout.start; fret <= layout.end; fret += 1) {
    if (!MARKER_FRETS.includes(fret)) {
      continue
    }

    const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
    const isDoubleMarker = fret === 12 || fret === 24
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'
    ctx.beginPath()
    ctx.arc(xCenter - (isDoubleMarker ? 4 : 0), layout.markerY, 2.5, 0, Math.PI * 2)
    ctx.fill()

    if (isDoubleMarker) {
      ctx.beginPath()
      ctx.arc(xCenter + 4, layout.markerY, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas
}

export const renderExportSvgMarkup = ({
  keyPc,
  noteLabelMode,
  noteTextMode,
  selectedScale,
  appliedChordSymbol,
  displayedNotes,
  connections,
  bends,
  backgroundOpacityPercent,
  showExportTitle,
  ...rangeInput
}: ExportGraphicInput) => {
  const layout = getExportLayout({
    keyPc,
    noteLabelMode,
    selectedScale,
    appliedChordSymbol,
    showExportTitle,
    ...rangeInput,
  })
  const clipTop = Math.max(0, layout.boardTop - 56)
  const svgParts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.canvasWidth}" height="${layout.canvasHeight}" viewBox="0 0 ${layout.canvasWidth} ${layout.canvasHeight}" fill="none">`,
    `<defs><clipPath id="fretmap-export-board-clip"><rect x="${layout.boardLeft}" y="${clipTop}" width="${layout.fretCountInRange * layout.cellWidth}" height="${layout.boardTop + layout.boardHeight - clipTop}" /></clipPath></defs>`,
  ]

  if (backgroundOpacityPercent > 0) {
    svgParts.push(
      `<rect x="0" y="0" width="${layout.canvasWidth}" height="${layout.canvasHeight}" fill="rgba(0, 0, 0, ${(backgroundOpacityPercent / 100).toFixed(3)})" />`,
    )
  }

  if (showExportTitle && layout.exportTitle !== undefined) {
    svgParts.push(
      `<text x="${layout.boardLeft + layout.cellWidth * 0.28}" y="${layout.paddingY + layout.titleHeight / 2 + 1}" fill="rgba(241, 245, 249, 0.92)" font-family="${EXPORT_SVG_FONT_STACK}" font-size="24" font-weight="700" dominant-baseline="middle">${escapeXml(layout.exportTitle)}</text>`,
    )
  }

  for (let fret = layout.start; fret <= layout.end; fret += 1) {
    const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
    const lineX = layout.boardLeft + (fret - layout.start + 1) * layout.cellWidth
    svgParts.push(
      `<text x="${xCenter}" y="${layout.paddingY + layout.titleHeight + layout.headerHeight / 2}" fill="rgba(226, 232, 240, 0.98)" font-family="${EXPORT_SVG_FONT_STACK}" font-size="12" text-anchor="middle" dominant-baseline="middle">${fret}</text>`,
    )
    svgParts.push(
      `<line x1="${lineX}" y1="${layout.boardTop}" x2="${lineX}" y2="${layout.boardTop + layout.boardHeight}" stroke="rgba(203, 213, 225, 0.78)" stroke-width="1" />`,
    )
  }

  if (layout.start === 0) {
    const nutRightX = layout.boardLeft + layout.cellWidth
    svgParts.push(
      `<line x1="${nutRightX}" y1="${layout.boardTop}" x2="${nutRightX}" y2="${layout.boardTop + layout.boardHeight}" stroke="rgba(226, 232, 240, 0.92)" stroke-width="2.8" />`,
    )
  }

  OPEN_STRINGS.forEach((_stringInfo, row) => {
    const yCenter = layout.boardTop + row * layout.rowHeight + layout.rowHeight / 2
    svgParts.push(
      `<line x1="${layout.boardLeft}" y1="${yCenter}" x2="${layout.boardLeft + layout.fretCountInRange * layout.cellWidth}" y2="${yCenter}" stroke="rgba(203, 213, 225, 0.72)" stroke-width="1" />`,
    )
  })

  svgParts.push('<g clip-path="url(#fretmap-export-board-clip)">')

  for (const connection of connections) {
    const from = parsePositionId(connection.from)
    const to = parsePositionId(connection.to)
    if (from === undefined || to === undefined || from.stringIndex < 0 || to.stringIndex < 0) {
      continue
    }

    const fromX = layout.boardLeft + (from.fret - layout.start + 0.5) * layout.cellWidth
    const fromY = layout.boardTop + from.stringIndex * layout.rowHeight + layout.rowHeight / 2
    const toX = layout.boardLeft + (to.fret - layout.start + 0.5) * layout.cellWidth
    const toY = layout.boardTop + to.stringIndex * layout.rowHeight + layout.rowHeight / 2
    svgParts.push(
      `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="rgba(34, 211, 238, 0.95)" stroke-width="2" stroke-linecap="round" />`,
    )
  }

  for (const bend of bends) {
    const from = parsePositionId(bend.from)
    if (from === undefined || from.stringIndex < 0) {
      continue
    }

    const startX = layout.boardLeft + (from.fret - layout.start + 0.5) * layout.cellWidth
    const startY = layout.boardTop + from.stringIndex * layout.rowHeight + layout.rowHeight / 2
    const { endX, endY, leftX, leftY, path, rightX, rightY } = createBendGeometry(startX, startY)
    svgParts.push(
      `<path d="${path}" fill="none" stroke="rgba(192, 132, 252, 0.82)" stroke-width="2.4" stroke-linecap="round" />`,
    )
    svgParts.push(
      `<path d="M ${leftX} ${leftY} L ${endX} ${endY} L ${rightX} ${rightY}" fill="none" stroke="rgba(192, 132, 252, 0.82)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
    )
  }

  svgParts.push('</g>')

  OPEN_STRINGS.forEach((stringInfo, stringIndex) => {
    const yCenter = layout.boardTop + stringIndex * layout.rowHeight + layout.rowHeight / 2
    for (let fret = layout.start; fret <= layout.end; fret += 1) {
      const positionId = toPositionId({ stringIndex, fret })
      const displayedNote = displayedNotes[positionId]
      if (displayedNote === undefined) {
        continue
      }

      const pitchClass = normalizePc(stringInfo.midi + fret)
      const visualRole = getNoteVisualRole({
        pitchClass,
        noteLabelMode,
        keyPc,
        selectedScale,
        appliedChordSymbol,
      })
      const label = getDisplayedNoteLabel(
        pitchClass,
        noteTextMode,
        noteLabelMode,
        keyPc,
        appliedChordSymbol,
      )
      const palette = getNotePalette(visualRole)
      const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
      svgParts.push(`<g opacity="${displayedNote.isDimmed ? 0.35 : 1}">`)
      svgParts.push(`<circle cx="${xCenter}" cy="${yCenter}" r="16" fill="${palette.png.fill}" />`)
      svgParts.push(
        `<circle cx="${xCenter}" cy="${yCenter}" r="16" fill="none" stroke="${palette.png.stroke}" stroke-width="1.5" />`,
      )
      svgParts.push(
        `<text x="${xCenter}" y="${yCenter + 1.5}" fill="#ffffff" font-family="${EXPORT_SVG_FONT_STACK}" font-size="13" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>`,
      )
      svgParts.push('</g>')
    }
  })

  for (let fret = layout.start; fret <= layout.end; fret += 1) {
    if (!MARKER_FRETS.includes(fret)) {
      continue
    }

    const xCenter = layout.boardLeft + (fret - layout.start + 0.5) * layout.cellWidth
    const isDoubleMarker = fret === 12 || fret === 24
    svgParts.push(
      `<circle cx="${xCenter - (isDoubleMarker ? 4 : 0)}" cy="${layout.markerY}" r="2.5" fill="rgba(226, 232, 240, 0.9)" />`,
    )

    if (isDoubleMarker) {
      svgParts.push(
        `<circle cx="${xCenter + 4}" cy="${layout.markerY}" r="2.5" fill="rgba(226, 232, 240, 0.9)" />`,
      )
    }
  }

  svgParts.push('</svg>')

  return svgParts.join('')
}

export const exportPng = (input: ExportGraphicInput) => {
  const canvas = renderExportPngCanvas(input)
  if (canvas === undefined) {
    return
  }

  const filename = getExportFilename(input, 'png')
  canvas.toBlob(
    (blob) => {
      if (blob === null) {
        return
      }

      downloadBlob(blob, filename)
    },
    'image/png',
    1,
  )
}

export const exportSvg = (input: ExportGraphicInput) => {
  const svgMarkup = renderExportSvgMarkup(input)
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, getExportFilename(input, 'svg'))
}
