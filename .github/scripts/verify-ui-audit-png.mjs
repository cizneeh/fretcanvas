import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

export const decodePngDataUrl = (dataUrl) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('PNG preview data URL was not found.')
  }

  const bytes = Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64')
  if (bytes.length <= pngSignature.length) {
    throw new Error('PNG preview is empty.')
  }
  if (!bytes.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error('PNG signature is invalid.')
  }

  return bytes
}

const main = () => {
  const [inputPath, outputPath] = process.argv.slice(2)
  if (inputPath === undefined || outputPath === undefined) {
    throw new Error('Usage: verify-ui-audit-png.mjs <data-url-json> <output.png>')
  }
  if (path.extname(outputPath).toLowerCase() !== '.png') {
    throw new Error('Output file must use the .png extension.')
  }

  const dataUrl = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const bytes = decodePngDataUrl(dataUrl)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, bytes)
  console.log(`Verified PNG: ${outputPath} (${bytes.length} bytes)`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
