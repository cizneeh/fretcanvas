import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  type ExportTransparentPngInput,
  exportTransparentPng,
  renderExportPngCanvas,
} from '../libs/exportTransparentPng'
import { useFretboardStore } from '../stores/fretboardStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ExportPanel } from './ExportPanel'

const checkerboardStyle = {
  backgroundColor: '#27272a',
  backgroundImage:
    'repeating-conic-gradient(rgba(255,255,255,0.09) 0% 25%, rgba(255,255,255,0.02) 0% 50%)',
  backgroundSize: '14px 14px',
} as const

const ExpandedExportSettingsContent = () => {
  const {
    keyPc,
    noteLabelMode,
    selectedScale,
    selectedChord,
    displayedNotes,
    connectionsById,
    bendsById,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      selectedScale: state.selectedScale,
      selectedChord: state.selectedChord,
      displayedNotes: state.displayedNotes,
      connectionsById: state.connections,
      bendsById: state.bends,
    })),
  )
  const {
    exportFretStart,
    exportFretEnd,
    backgroundOpacityPercent,
    handleBackgroundOpacityPercentChange,
  } = useSettingsStore(
    useShallow((state) => ({
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      backgroundOpacityPercent: state.backgroundOpacityPercent,
      handleBackgroundOpacityPercentChange: state.handleBackgroundOpacityPercentChange,
    })),
  )
  const { beginBufferedEdit, commitBufferedEdit, cancelBufferedEdit, captureSnapshot } =
    useHistoryStore(
      useShallow((state) => ({
        beginBufferedEdit: state.beginBufferedEdit,
        commitBufferedEdit: state.commitBufferedEdit,
        cancelBufferedEdit: state.cancelBufferedEdit,
        captureSnapshot: state.captureSnapshot,
      })),
    )
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

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

  const preview = useMemo(() => {
    const canvas = renderExportPngCanvas(exportInput)
    if (canvas === undefined) {
      return {
        url: undefined,
        error: 'Preview render failed',
      }
    }

    try {
      return {
        url: canvas.toDataURL('image/png', 1),
        error: undefined,
      }
    } catch {
      return {
        url: undefined,
        error: 'Failed to create preview image',
      }
    }
  }, [exportInput])

  const previewUrl = preview.url
  const previewError = preview.error

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
    <>
      <div className="grid gap-4 border-t border-zinc-700/70 p-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
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

        <div className="rounded-xl border border-zinc-600 bg-zinc-900/60 p-3">
          <div className="mb-2 text-sm font-medium text-zinc-100">Preview</div>
          <button
            type="button"
            className={`w-full rounded-md border border-zinc-600 p-2 text-left transition-colors ${
              previewUrl !== undefined
                ? 'cursor-zoom-in hover:border-zinc-500 hover:bg-zinc-700/20'
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
              style={checkerboardStyle}
            >
              {previewUrl !== undefined ? (
                <img
                  src={previewUrl}
                  alt="Export preview"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : undefined}
              {previewError !== undefined ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 px-3 text-center text-xs text-rose-200">
                  {previewError}
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
              style={checkerboardStyle}
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
    </>
  )
}

export const ExportSettingsSection = () => {
  const { exportFretStart, exportFretEnd, backgroundOpacityPercent } = useSettingsStore(
    useShallow((state) => ({
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      backgroundOpacityPercent: state.backgroundOpacityPercent,
    })),
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const exportStart = Math.min(exportFretStart, exportFretEnd)
  const exportEnd = Math.max(exportFretStart, exportFretEnd)
  const contentId = 'export-settings-content'

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800/80">
      <button
        type="button"
        className="group flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-zinc-700/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => {
          setIsExpanded((previous) => !previous)
        }}
      >
        <div className="min-w-0">
          <div className="text-sm font-medium tracking-[0.01em] text-zinc-100">Export Settings</div>
          <div className="mt-1 text-xs text-zinc-300">
            Frets {exportStart} - {exportEnd} ・ Opacity {backgroundOpacityPercent}%
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-300 sm:inline">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          <svg
            className={`h-5 w-5 text-zinc-300 transition-transform duration-200 ease-out ${
              isExpanded ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      <div
        id={contentId}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">{isExpanded ? <ExpandedExportSettingsContent /> : undefined}</div>
      </div>
    </section>
  )
}
