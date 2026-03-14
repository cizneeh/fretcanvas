import { downloadExportBlob, getExportFilename } from './download'
import { renderExportPngCanvas, renderExportSvgMarkup } from './renderers'
import type { ExportGraphicInput } from './types'

export { renderExportPngCanvas, renderExportSvgMarkup } from './renderers'
export type { ExportGraphicInput } from './types'

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

      downloadExportBlob(blob, filename)
    },
    'image/png',
    1,
  )
}

export const exportSvg = (input: ExportGraphicInput) => {
  const svgMarkup = renderExportSvgMarkup(input)
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  downloadExportBlob(blob, getExportFilename(input, 'svg'))
}
