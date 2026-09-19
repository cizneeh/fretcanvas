import { getExportTitle } from '../noteDisplay'
import { getMidiLabel, getPianoLayout, type PianoNotes } from '../piano'
import { getPianoNoteDisplay, type MusicSelection } from '../pianoDisplay'
import { downloadExportBlob } from './download'

export type PianoExportInput = MusicSelection & {
  notes: PianoNotes
  startMidi: number
  endMidi: number
  backgroundOpacityPercent: number
  showTitle: boolean
  showOctaveLabels: boolean
}

const escapeXml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character] ??
      character,
  )

export const getPianoExportSize = (input: PianoExportInput) => {
  const layout = getPianoLayout(input.startMidi, input.endMidi)
  const title = input.showTitle
    ? getExportTitle(
        input.keyPc,
        input.noteLabelMode,
        input.selectedScale,
        input.appliedChordSymbol,
      )
    : undefined
  const titleHeight = title === undefined ? 0 : 36
  return {
    layout,
    title,
    titleHeight,
    width: layout.width + 32,
    height: layout.height + 32 + titleHeight + (input.showOctaveLabels ? 28 : 0),
  }
}

export const renderPianoSvg = (input: PianoExportInput): string => {
  const { layout, title, titleHeight, width, height } = getPianoExportSize(input)
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${escapeXml(title ?? 'Piano')}</title>`,
  ]
  parts.push(
    `<rect width="${width}" height="${height}" fill="#0f1217" fill-opacity="${input.backgroundOpacityPercent / 100}"/>`,
  )
  if (title !== undefined)
    parts.push(
      `<text x="16" y="29" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="20">${escapeXml(title)}</text>`,
    )
  parts.push(`<g transform="translate(16 ${16 + titleHeight})">`)
  for (const key of [...layout.keys].sort((a, b) => Number(a.isBlack) - Number(b.isBlack))) {
    const fill = key.isBlack ? '#1b2027' : '#faf9f6'
    parts.push(
      `<rect x="${key.x + 0.5}" y="0.5" width="${key.width - 1}" height="${key.height - 1}" rx="4" fill="${fill}" stroke="${key.isBlack ? '#05070a' : '#a1a1aa'}"/>`,
    )
    if (key.isBlack)
      parts.push(
        `<rect x="${key.x + 3}" y="3" width="${key.width - 6}" height="${key.height - 10}" rx="2" fill="none" stroke="#353a42"/>`,
      )
    const note = input.notes[key.midi]
    if (note === undefined || key.midi < input.startMidi || key.midi > input.endMidi) continue
    const { color, label } = getPianoNoteDisplay(key.midi, key.isBlack, input)
    const noteWidth = Math.min(key.width * 0.72, key.isBlack ? 34 : 48)
    const noteHeight = key.isBlack ? 52 : 64
    const x = key.x + (key.width - noteWidth) / 2
    const y = key.height - noteHeight - (key.isBlack ? 9 : 10)
    const stripe = key.isBlack ? 5 : 6
    parts.push(`<g opacity="${note.isDimmed ? 0.42 : 1}">`)
    if (note.isEmphasized)
      parts.push(
        `<rect x="${x - 4}" y="${y - 4}" width="${noteWidth + 8}" height="${noteHeight + 8}" rx="7" fill="none" stroke="${color}" stroke-width="2"/>`,
      )
    parts.push(
      `<rect x="${x}" y="${y}" width="${noteWidth}" height="${noteHeight}" rx="5" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`,
    )
    parts.push(
      `<path d="M ${x + 1} ${y + noteHeight - stripe} h ${noteWidth - 2} v ${stripe - 2} q 0 1 -3 1 h ${-(noteWidth - 8)} q -3 0 -3 -1 Z" fill="${color}"/>`,
    )
    const center = x + noteWidth / 2
    const primaryY =
      y + (label.secondary === undefined ? (noteHeight - stripe) / 2 + 6 : key.isBlack ? 22 : 27)
    parts.push(
      `<text x="${center}" y="${primaryY}" text-anchor="middle" fill="${color}" font-family="system-ui, sans-serif" font-size="${key.isBlack ? 13 : 18}" font-weight="650">${escapeXml(label.primary)}</text>`,
    )
    if (label.secondary !== undefined)
      parts.push(
        `<text x="${center}" y="${primaryY + (key.isBlack ? 15 : 18)}" text-anchor="middle" fill="${color}" font-family="system-ui, sans-serif" font-size="${key.isBlack ? 11 : 14}" font-weight="550">${escapeXml(label.secondary)}</text>`,
      )
    parts.push('</g>')
  }
  if (input.showOctaveLabels) {
    for (const key of layout.keys.filter(
      (key) => key.midi % 12 === 0 || key.midi === input.startMidi,
    )) {
      parts.push(
        `<text x="${key.x + key.width / 2}" y="${layout.height + 24}" text-anchor="middle" fill="#b8c1ce" font-family="system-ui, sans-serif" font-size="13">${getMidiLabel(key.midi)}</text>`,
      )
    }
  }
  parts.push('</g></svg>')
  return parts.join('')
}

export const exportPiano = async (input: PianoExportInput, format: 'png' | 'svg') => {
  const svg = renderPianoSvg(input)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const filename = `fret-canvas-piano-${getMidiLabel(input.startMidi)}-${getMidiLabel(input.endMidi)}.${format}`
  if (format === 'svg') {
    downloadExportBlob(blob, filename)
    return
  }
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const { width, height } = getPianoExportSize(input)
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('Canvas is unavailable')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value === null ? reject(new Error('PNG encoding failed')) : resolve(value)),
        'image/png',
      ),
    )
    downloadExportBlob(png, filename)
  } finally {
    URL.revokeObjectURL(url)
  }
}
