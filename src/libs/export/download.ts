import type { ExportGraphicInput } from './types'

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

export const getExportFilename = (
  input: Pick<ExportGraphicInput, 'exportFretStart' | 'exportFretEnd'>,
  format: 'png' | 'svg',
) => {
  const start = Math.min(input.exportFretStart, input.exportFretEnd)
  const end = Math.max(input.exportFretStart, input.exportFretEnd)
  return `fretmap-frets-${start}-${end}.${format}`
}

export const downloadExportBlob = downloadBlob
