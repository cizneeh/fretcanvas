import {
  type Connection,
  DEGREE_LABELS,
  type HighlightedNote,
  MARKER_FRETS,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  parsePositionId,
  toPositionId,
} from './model'

type ExportTransparentPngInput = {
  keyPc: PitchClass
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Connection[]
  exportFretStart: number
  exportFretEnd: number
  backgroundOpacityPercent: number
}

export const exportTransparentPng = ({
  keyPc,
  displayedNotes,
  connections,
  exportFretStart,
  exportFretEnd,
  backgroundOpacityPercent,
}: ExportTransparentPngInput) => {
  const start = Math.min(exportFretStart, exportFretEnd)
  const end = Math.max(exportFretStart, exportFretEnd)
  const fretCountInRange = end - start + 1

  const paddingX = 12
  const paddingY = 12
  const labelWidth = 34
  const headerHeight = 26
  const rowHeight = 44
  const markerHeight = 20
  const cellWidth = 56
  const boardHeight = OPEN_STRINGS.length * rowHeight

  const canvasWidth = paddingX * 2 + labelWidth + fretCountInRange * cellWidth
  const canvasHeight = paddingY * 2 + headerHeight + boardHeight + markerHeight

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return
  }

  const boardLeft = paddingX + labelWidth
  const boardTop = paddingY + headerHeight

  // Background is intentionally transparent.
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  if (backgroundOpacityPercent > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${(backgroundOpacityPercent / 100).toFixed(3)})`
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
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
    const intervalFromKey = normalizePc(pitchClass - keyPc)
    const isRoot = intervalFromKey === 0
    const label = DEGREE_LABELS[intervalFromKey]
    const xCenter = boardLeft + (fret - start + 0.5) * cellWidth

    const noteOpacity = displayedNote.isDimmed ? 0.45 : 1
    ctx.save()
    ctx.globalAlpha = noteOpacity
    ctx.fillStyle = isRoot ? 'rgba(190, 24, 93, 0.8)' : 'rgba(8, 145, 178, 0.8)'
    ctx.beginPath()
    ctx.arc(xCenter, yCenter, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = isRoot ? 'rgba(254, 205, 211, 0.8)' : 'rgba(207, 250, 254, 0.7)'
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
    ctx.fillText(String(fret), xCenter, paddingY + headerHeight / 2)

    const lineX = boardLeft + (fret - start + 1) * cellWidth
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.78)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lineX, boardTop)
    ctx.lineTo(lineX, boardTop + boardHeight)
    ctx.stroke()
  }

  OPEN_STRINGS.forEach((stringInfo, row) => {
    const yCenter = boardTop + row * rowHeight + rowHeight / 2
    ctx.fillStyle = 'rgba(241, 245, 249, 0.98)'
    ctx.textAlign = 'center'
    ctx.fillText(stringInfo.name, paddingX + labelWidth / 2, yCenter)

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.72)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boardLeft, yCenter)
    ctx.lineTo(boardLeft + fretCountInRange * cellWidth, yCenter)
    ctx.stroke()
  })

  ctx.save()
  ctx.beginPath()
  ctx.rect(boardLeft, boardTop, fretCountInRange * cellWidth, boardHeight)
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
