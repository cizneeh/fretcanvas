import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '../i18n/useI18n'
import {
  type ExportGraphicInput,
  exportPng,
  exportSvg,
  renderExportPngCanvas,
  renderExportSvgMarkup,
} from '../libs/export'
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
  const { locale, t } = useI18n()
  const {
    keyPc,
    noteLabelMode,
    noteTextMode,
    selectedScale,
    strings,
    appliedChordSymbol,
    displayedNotes,
    connectionsById,
    bendsById,
  } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      noteTextMode: state.noteTextMode,
      selectedScale: state.selectedScale,
      strings: state.strings,
      appliedChordSymbol: state.appliedChordSymbol,
      displayedNotes: state.displayedNotes,
      connectionsById: state.connections,
      bendsById: state.bends,
    })),
  )
  const {
    exportFretStart,
    exportFretEnd,
    exportFormat,
    backgroundOpacityPercent,
    showExportTitle,
    setExportFormat,
    handleBackgroundOpacityPercentChange,
    setShowExportTitle,
  } = useSettingsStore(
    useShallow((state) => ({
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
      exportFormat: state.exportFormat,
      backgroundOpacityPercent: state.backgroundOpacityPercent,
      showExportTitle: state.showExportTitle,
      setExportFormat: state.setExportFormat,
      handleBackgroundOpacityPercentChange: state.handleBackgroundOpacityPercentChange,
      setShowExportTitle: state.setShowExportTitle,
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
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [previewErrorKey, setPreviewErrorKey] = useState<
    'export.previewCreateFailed' | 'export.previewFailed' | undefined
  >(undefined)

  const exportInput = useMemo<ExportGraphicInput>(
    () => ({
      locale,
      keyPc,
      noteLabelMode,
      noteTextMode,
      selectedScale,
      strings,
      appliedChordSymbol,
      displayedNotes,
      connections: Object.values(connectionsById),
      bends: Object.values(bendsById),
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
      showExportTitle,
    }),
    [
      locale,
      keyPc,
      noteLabelMode,
      noteTextMode,
      selectedScale,
      strings,
      appliedChordSymbol,
      displayedNotes,
      connectionsById,
      bendsById,
      exportFretStart,
      exportFretEnd,
      backgroundOpacityPercent,
      showExportTitle,
    ],
  )

  useEffect(() => {
    let nextPreviewUrl: string | undefined

    try {
      if (exportFormat === 'svg') {
        const svgMarkup = renderExportSvgMarkup(exportInput)
        const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
        nextPreviewUrl = URL.createObjectURL(blob)
      } else {
        const canvas = renderExportPngCanvas(exportInput)
        if (canvas === undefined) {
          setPreviewUrl(undefined)
          setPreviewErrorKey('export.previewFailed')
          return
        }

        nextPreviewUrl = canvas.toDataURL('image/png', 1)
      }

      setPreviewUrl(nextPreviewUrl)
      setPreviewErrorKey(undefined)
    } catch {
      setPreviewUrl(undefined)
      setPreviewErrorKey(
        exportFormat === 'svg' ? 'export.previewFailed' : 'export.previewCreateFailed',
      )
    }

    return () => {
      if (exportFormat === 'svg' && nextPreviewUrl !== undefined) {
        URL.revokeObjectURL(nextPreviewUrl)
      }
    }
  }, [exportFormat, exportInput])

  const previewError = previewErrorKey === undefined ? undefined : t(previewErrorKey)

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
          exportFormat={exportFormat}
          backgroundOpacityPercent={backgroundOpacityPercent}
          showExportTitle={showExportTitle}
          onExportFormatChange={setExportFormat}
          onBackgroundOpacityPercentChange={handleBackgroundOpacityPercentChange}
          onShowExportTitleChange={setShowExportTitle}
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
          onExport={() => {
            if (exportFormat === 'svg') {
              exportSvg(exportInput)
              return
            }

            exportPng(exportInput)
          }}
        />

        <div className={`${m3CardElevatedClass} p-3`}>
          <div className={`mb-2 ${m3FieldLabelClass}`}>{t('export.preview')}</div>
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
                  alt={t('export.previewAlt')}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              ) : undefined}
              {previewError !== undefined ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 px-3 text-center text-sm text-rose-200">
                  {previewError}
                </div>
              ) : undefined}
            </div>
          </button>
          <div className="mt-2 text-sm text-[color:var(--md-sys-color-on-surface-variant)]">
            {t('export.viewFullSize')}
          </div>
        </div>
      </div>

      {isPreviewModalOpen && previewUrl !== undefined ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={t('export.closePreviewBackdrop')}
            onClick={() => {
              setIsPreviewModalOpen(false)
            }}
          />
          <div className={`${m3CardElevatedClass} relative w-full max-w-6xl p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-[color:var(--md-sys-color-on-surface)]">
                {t('export.preview')}
              </div>
              <button
                type="button"
                className={`${m3OutlinedButtonClass} min-h-8 px-3 py-1.5 text-xs`}
                onClick={() => {
                  setIsPreviewModalOpen(false)
                }}
              >
                {t('common.close')}
              </button>
            </div>

            <div
              className="max-h-[80vh] overflow-auto rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline)] p-2"
              style={checkerboardStyle}
            >
              <img
                src={previewUrl}
                alt={t('export.previewAltEnlarged')}
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
  const { t } = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className={`${m3CardClass} overflow-hidden`}>
      <button
        type="button"
        className="m3-state-surface flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => {
          setIsExpanded((current) => !current)
        }}
        aria-expanded={isExpanded}
      >
        <div className="text-[15px] font-medium text-[color:var(--md-sys-color-on-surface)]">
          {t('export.settings')}
        </div>
        <svg
          className={`h-4 w-4 text-[color:var(--md-sys-color-on-surface-variant)] transition-transform duration-150 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6.5L8 10L12 6.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded ? <ExpandedExportSettingsContent /> : undefined}
    </section>
  )
}
