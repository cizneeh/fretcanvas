import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type ExportTransparentPngInput,
  exportTransparentPng,
  renderExportPngCanvas,
} from '../libs/exportTransparentPng'
import { useFretboardStore } from '../stores/fretboardStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ExportPanel } from './ExportPanel'

export const ExportSettingsSection = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const noteLabelMode = useFretboardStore((state) => state.noteLabelMode)
  const selectedScale = useFretboardStore((state) => state.selectedScale)
  const selectedChord = useFretboardStore((state) => state.selectedChord)
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const connectionsById = useFretboardStore((state) => state.connections)
  const bendsById = useFretboardStore((state) => state.bends)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useSettingsStore((state) => state.backgroundOpacityPercent)
  const handleBackgroundOpacityPercentChange = useSettingsStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const beginBufferedEdit = useHistoryStore((state) => state.beginBufferedEdit)
  const commitBufferedEdit = useHistoryStore((state) => state.commitBufferedEdit)
  const cancelBufferedEdit = useHistoryStore((state) => state.cancelBufferedEdit)
  const captureSnapshot = useHistoryStore((state) => state.captureSnapshot)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [previewStatus, setPreviewStatus] = useState<'rendering' | 'ready' | 'error'>('rendering')
  const [previewError, setPreviewError] = useState<string | undefined>(undefined)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const rafIdRef = useRef<number | undefined>(undefined)
  const renderIdRef = useRef(0)
  const latestInputRef = useRef<ExportTransparentPngInput | undefined>(undefined)
  const previewUrlRef = useRef<string | undefined>(undefined)

  const exportInput = useMemo<ExportTransparentPngInput>(
    () => ({
      keyPc,
      noteLabelMode,
      selectedScale,
      selectedChord,
      displayedNotes,
      connections: Object.values(connectionsById),
      bends: Object.values(bendsById),
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    }),
    [
      keyPc,
      noteLabelMode,
      selectedScale,
      selectedChord,
      displayedNotes,
      connectionsById,
      bendsById,
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
    ],
  )

  useEffect(() => {
    latestInputRef.current = exportInput
    if (rafIdRef.current !== undefined) {
      return
    }

    setPreviewStatus('rendering')
    setPreviewError(undefined)
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = undefined
      const input = latestInputRef.current
      if (input === undefined) {
        return
      }

      const nextRenderId = renderIdRef.current + 1
      renderIdRef.current = nextRenderId
      const canvas = renderExportPngCanvas(input)
      if (canvas === undefined) {
        if (renderIdRef.current !== nextRenderId) {
          return
        }
        setPreviewStatus('error')
        setPreviewError('Preview render failed')
        return
      }

      canvas.toBlob(
        (blob) => {
          if (renderIdRef.current !== nextRenderId) {
            return
          }

          if (blob === null) {
            setPreviewStatus('error')
            setPreviewError('Failed to create preview image')
            return
          }

          const nextUrl = URL.createObjectURL(blob)
          const previousUrl = previewUrlRef.current
          previewUrlRef.current = nextUrl
          if (previousUrl !== undefined) {
            URL.revokeObjectURL(previousUrl)
          }
          setPreviewUrl(nextUrl)
          setPreviewStatus('ready')
          setPreviewError(undefined)
        },
        'image/png',
        1,
      )
    })
  }, [exportInput])

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current)
      }
      renderIdRef.current += 1
      const url = previewUrlRef.current
      if (url !== undefined) {
        URL.revokeObjectURL(url)
        previewUrlRef.current = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (!isPreviewModalOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewModalOpen])

  return (
    <section className="rounded-lg border border-zinc-600 bg-zinc-800/80 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <ExportPanel
          exportStart={Math.min(exportFretStart, exportFretEnd)}
          exportEnd={Math.max(exportFretStart, exportFretEnd)}
          backgroundOpacityPercent={backgroundOpacityPercent}
          onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
          onBackgroundOpacityEditStart={() => {
            const snapshot = captureSnapshot()
            if (snapshot !== undefined) {
              beginBufferedEdit(snapshot)
            }
          }}
          onBackgroundOpacityEditEnd={() => {
            const snapshot = captureSnapshot()
            if (snapshot !== undefined) {
              commitBufferedEdit(snapshot)
            } else {
              cancelBufferedEdit()
            }
          }}
          onExportTransparentPng={() => {
            exportTransparentPng(exportInput)
          }}
        />

        <div className="rounded-md border border-zinc-600 bg-zinc-900/60 p-3">
          <div className="mb-2 text-sm font-medium text-zinc-100">Preview</div>
          <button
            type="button"
            className={`w-full rounded-md border border-zinc-600 p-2 text-left transition-colors ${
              previewUrl !== undefined
                ? 'cursor-zoom-in hover:border-zinc-500'
                : 'cursor-not-allowed opacity-80'
            }`}
            onClick={() => {
              if (previewUrl === undefined) {
                return
              }
              setIsPreviewModalOpen(true)
            }}
            disabled={previewUrl === undefined}
          >
            <div
              className="relative aspect-[16/7] w-full overflow-hidden rounded-sm"
              style={{
                backgroundColor: '#27272a',
                backgroundImage:
                  'repeating-conic-gradient(rgba(255,255,255,0.09) 0% 25%, rgba(255,255,255,0.02) 0% 50%)',
                backgroundSize: '14px 14px',
              }}
            >
              {previewUrl !== undefined ? (
                <img
                  src={previewUrl}
                  alt="Export preview"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : undefined}
              {previewStatus === 'rendering' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-xs text-zinc-200">
                  Rendering preview...
                </div>
              ) : undefined}
              {previewStatus === 'error' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 px-3 text-center text-xs text-rose-200">
                  {previewError ?? 'Preview render failed'}
                </div>
              ) : undefined}
            </div>
          </button>
          <div className="mt-2 text-xs text-zinc-400">クリックで拡大表示</div>
        </div>
      </div>

      {isPreviewModalOpen && previewUrl !== undefined ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close preview modal backdrop"
            onClick={() => {
              setIsPreviewModalOpen(false)
            }}
          />
          <div className="relative w-full max-w-6xl rounded-lg border border-zinc-600 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-100">Export Preview</div>
              <button
                type="button"
                className="rounded-md border border-zinc-500 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-zinc-700"
                onClick={() => {
                  setIsPreviewModalOpen(false)
                }}
              >
                Close
              </button>
            </div>

            <div
              className="max-h-[80vh] overflow-auto rounded-md border border-zinc-600 p-2"
              style={{
                backgroundColor: '#27272a',
                backgroundImage:
                  'repeating-conic-gradient(rgba(255,255,255,0.09) 0% 25%, rgba(255,255,255,0.02) 0% 50%)',
                backgroundSize: '14px 14px',
              }}
            >
              <img
                src={previewUrl}
                alt="Export preview enlarged"
                className="mx-auto block h-auto max-h-[74vh] w-auto max-w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : undefined}
    </section>
  )
}
