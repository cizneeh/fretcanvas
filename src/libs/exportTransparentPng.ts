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

export type ExportTransparentPngInput = {
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

export const renderExportPngCanvas = ({
  keyPc,
  noteLabelMode,
  noteTextMode,
  selectedScale,
  appliedChordSymbol,
  displayedNotes,
  connections,
  bends,
  exportFretStart,
  exportFretEnd,
  backgroundOpacityPercent,
  showExportTitle,
}: ExportTransparentPngInput) => {
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

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return undefined
  }

  const boardLeft = paddingX + labelWidth

  // Background is intentionally transparent.
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  if (backgroundOpacityPercent > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${(backgroundOpacityPercent / 100).toFixed(3)})`
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  if (showExportTitle && exportTitle !== undefined) {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)'
    ctx.font = '700 24px "Avenir Next", "Avenir", "Segoe UI", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(exportTitle, boardLeft + cellWidth * 0.28, paddingY + titleHeight / 2 + 1)
  }

  const boardTop = paddingY + titleHeight + headerHeight
  ctx.textAlign = 'center'
  ctx.font = '12px "Avenir Next", "Avenir", "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
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
    const xCenter = boardLeft + (fret - start + 0.5) * cellWidth
    const palette = getNotePalette(visualRole)

    const noteOpacity = displayedNote.isDimmed ? 0.35 : 1
    ctx.save()
    ctx.globalAlpha = noteOpacity
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
    ctx.font = '600 13px "Avenir Next", "Avenir", "Segoe UI", sans-serif'
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

  for (let fret = start; fret <= end; fret += 1) {
    const xCenter = boardLeft + (fret - start + 0.5) * cellWidth
    ctx.fillStyle = 'rgba(226, 232, 240, 0.98)'
    ctx.fillText(String(fret), xCenter, paddingY + titleHeight + headerHeight / 2)

    const lineX = boardLeft + (fret - start + 1) * cellWidth
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.78)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lineX, boardTop)
    ctx.lineTo(lineX, boardTop + boardHeight)
    ctx.stroke()
  }

  if (start === 0) {
    const nutRightX = boardLeft + cellWidth
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.92)'
    ctx.lineWidth = 2.8
    ctx.beginPath()
    ctx.moveTo(nutRightX, boardTop)
    ctx.lineTo(nutRightX, boardTop + boardHeight)
    ctx.stroke()
  }

  OPEN_STRINGS.forEach((_stringInfo, row) => {
    const yCenter = boardTop + row * rowHeight + rowHeight / 2
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.72)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boardLeft, yCenter)
    ctx.lineTo(boardLeft + fretCountInRange * cellWidth, yCenter)
    ctx.stroke()
  })

  ctx.save()
  ctx.beginPath()
  const clipTop = Math.max(0, boardTop - 56)
  ctx.rect(boardLeft, clipTop, fretCountInRange * cellWidth, boardTop + boardHeight - clipTop)
  ctx.clip()
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.95)'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  for (const connection of connections) {
    const from = parsePositionId(connection.from)
    const to = parsePositionId(connection.to)
    if (from === undefined || to === undefined) {
      continue
    }

    const fromStringIndex = from.stringIndex
    const toStringIndex = to.stringIndex
    if (fromStringIndex < 0 || toStringIndex < 0) {
      continue
    }

    const fromX = boardLeft + (from.fret - start + 0.5) * cellWidth
    const fromY = boardTop + fromStringIndex * rowHeight + rowHeight / 2
    const toX = boardLeft + (to.fret - start + 0.5) * cellWidth
    const toY = boardTop + toStringIndex * rowHeight + rowHeight / 2

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

    const startX = boardLeft + (from.fret - start + 0.5) * cellWidth
    const startY = boardTop + from.stringIndex * rowHeight + rowHeight / 2
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
    const yCenter = boardTop + stringIndex * rowHeight + rowHeight / 2
    for (let fret = start; fret <= end; fret += 1) {
      drawNote(stringIndex, stringInfo.midi, fret, yCenter)
    }
  })

  const markerY = boardTop + boardHeight + markerHeight / 2
  for (let fret = start; fret <= end; fret += 1) {
    if (!MARKER_FRETS.includes(fret)) {
      continue
    }

    const xCenter = boardLeft + (fret - start + 0.5) * cellWidth
    const isDoubleMarker = fret === 12 || fret === 24
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)'
    ctx.beginPath()
    ctx.arc(xCenter - (isDoubleMarker ? 4 : 0), markerY, 2.5, 0, Math.PI * 2)
    ctx.fill()

    if (isDoubleMarker) {
      ctx.beginPath()
      ctx.arc(xCenter + 4, markerY, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas
}

export const exportTransparentPng = (input: ExportTransparentPngInput) => {
  const canvas = renderExportPngCanvas(input)
  if (canvas === undefined) {
    return
  }

  const start = Math.min(input.exportFretStart, input.exportFretEnd)
  const end = Math.max(input.exportFretStart, input.exportFretEnd)
  const filename = `fretmap-frets-${start}-${end}.png`
  canvas.toBlob(
    (blob) => {
      if (blob === null) {
        return
      }

      const file = new File([blob], filename, { type: 'image/png' })
      const downloadUrl = URL.createObjectURL(file)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.setAttribute('download', filename)
      anchor.style.display = 'none'
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000)
    },
    'image/png',
    1,
  )
}
