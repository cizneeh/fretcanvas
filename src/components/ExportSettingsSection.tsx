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
import {
  m3CardClass,
  m3CardElevatedClass,
  m3FieldLabelClass,
  m3OutlinedButtonClass,
} from './ui/materialClasses'

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
    selectedChordSymbol,
    displayedNotes,
    connectionsById,
    bendsById,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      selectedScale: state.selectedScale,
      selectedChordSymbol: state.selectedChordSymbol,
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
      selectedChordSymbol,
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
      selectedChordSymbol,
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

        <div className={`${m3CardElevatedClass} p-3`}>
          <div className={`mb-2 ${m3FieldLabelClass}`}>Preview</div>
          <button
            type="button"
            className={`m3-state-surface w-full rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] p-2 text-left transition-colors ${
              previewUrl !== undefined ? 'cursor-zoom-in' : 'cursor-not-allowed opacity-80'
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
          <div className="mt-2 text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
            クリックで拡大表示
          </div>
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
          <div className={`${m3CardElevatedClass} relative w-full max-w-6xl p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-[color:var(--md-sys-color-on-surface)]">
                Export Preview
              </div>
              <button
                type="button"
                className={`${m3OutlinedButtonClass} min-h-8 px-3 py-1.5 text-xs`}
                onClick={() => {
                  setIsPreviewModalOpen(false)
                }}
              >
                Close
              </button>
            </div>

            <div
              className="max-h-[80vh] overflow-auto rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] p-2"
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
  const [isExpanded, setIsExpanded] = useState(false)
  const contentId = 'export-settings-content'

  return (
    <section className={`${m3CardClass} overflow-hidden`}>
      <button
        type="button"
        className="m3-focus-ring m3-state-surface group flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => {
          setIsExpanded((previous) => !previous)
        }}
      >
        <div className="text-sm font-medium tracking-[0.01em] text-[color:var(--md-sys-color-on-surface)]">
          Export Settings
        </div>

        <svg
          className={`h-5 w-5 text-[color:var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ease-out ${
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
