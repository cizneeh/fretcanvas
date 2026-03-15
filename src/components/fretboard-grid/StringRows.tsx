import { Fragment, memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '../../i18n/useI18n'
import { FRET_NUMBERS, normalizePc, type PositionId, toPositionId } from '../../libs/musicCore'
import { getDisplayedNoteLabel, getNoteVisualRole } from '../../libs/noteDisplay'
import { useFretboardStore } from '../../stores/fretboardStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { RenderProfiler } from '../dev/RenderProfiler'
import { FretCell } from './FretCell'

type StringRowsProps = {
  selectedPositionIds: Set<PositionId>
  disableCellPreview: boolean
  exportHoverPreview:
    | {
        fret: number
        handle: 'start' | 'end'
      }
    | undefined
  onNotePointerDown: (
    positionId: PositionId,
    isHighlighted: boolean,
    button: number,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onNoteClick: (
    positionId: PositionId,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    isAltKey: boolean,
  ) => void
  onNoteContextMenu: (
    positionId: PositionId,
    isHighlighted: boolean,
    clientX: number,
    clientY: number,
  ) => void
  onOpenTuningMenu: (anchorElement: HTMLButtonElement) => void
  onNotePointerUp: (positionId: PositionId) => void
}

export const StringRows = memo(
  ({
    selectedPositionIds,
    disableCellPreview,
    exportHoverPreview,
    onNotePointerDown,
    onNoteClick,
    onNoteContextMenu,
    onOpenTuningMenu,
    onNotePointerUp,
  }: StringRowsProps) => {
    const { t } = useI18n()
    const { keyPc, noteLabelMode, noteTextMode, appliedChordSymbol, selectedScale, strings } =
      useFretboardStore(
        useShallow((state) => ({
          keyPc: state.keyPc,
          noteLabelMode: state.noteLabelMode,
          noteTextMode: state.noteTextMode,
          appliedChordSymbol: state.appliedChordSymbol,
          selectedScale: state.selectedScale,
          strings: state.strings,
        })),
      )
    const { exportFretStart, exportFretEnd, showExportRangeHighlight } = useSettingsStore(
      useShallow((state) => ({
        exportFretStart: state.exportFretStart,
        exportFretEnd: state.exportFretEnd,
        showExportRangeHighlight: state.showExportRangeHighlight,
      })),
    )
    const startHighlightFret = showExportRangeHighlight ? Math.max(0, exportFretStart - 1) : -1
    const startMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-cyan-300'
    const endMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-emerald-300'

    return (
      <RenderProfiler id="StringRows">
        {strings.map((stringInfo, stringIndex) => (
          <Fragment key={stringInfo.id}>
            <div className="flex h-12 items-center justify-center pr-2">
              <button
                type="button"
                className="m3-focus-ring rounded-md border border-transparent px-2 py-1 text-base text-slate-300 transition-colors hover:border-cyan-200/30 hover:bg-cyan-200/10 hover:text-slate-50 focus-visible:border-cyan-200/30 focus-visible:bg-cyan-200/10 focus-visible:text-slate-50"
                aria-label={`${stringInfo.name} ${t('tuning.openMenu')}`}
                onClick={(event) => {
                  onOpenTuningMenu(event.currentTarget)
                }}
              >
                {stringInfo.name}
              </button>
            </div>

            {/* 各マスは弦の pitch class と fret 番号から音名を決める。ノート自体は絶対音高を持たない。 */}
            {FRET_NUMBERS.map((fret) => {
              const positionId = toPositionId({ stringIndex, fret })
              const pitchClass = normalizePc(stringInfo.pitchClass + fret)
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
                selectedScale,
                appliedChordSymbol,
              )
              const isStartFret = fret === startHighlightFret
              const isEndFret = showExportRangeHighlight && fret === exportFretEnd
              const isStartAtNutLine =
                showExportRangeHighlight && exportFretStart === 0 && fret === 0
              const isPreviewStartAtNutLine =
                exportHoverPreview?.handle === 'start' &&
                exportHoverPreview.fret === 0 &&
                fret === 0
              const isPreviewStartFret =
                exportHoverPreview?.handle === 'start' &&
                exportHoverPreview.fret > 0 &&
                fret === exportHoverPreview.fret - 1
              const isPreviewEndFret =
                exportHoverPreview?.handle === 'end' && fret === exportHoverPreview.fret

              return (
                <FretCell
                  key={`${stringInfo.id}-${fret}`}
                  positionId={positionId}
                  isNut={fret === 0}
                  label={label}
                  visualRole={visualRole}
                  isSelected={selectedPositionIds.has(positionId)}
                  disablePreview={disableCellPreview}
                  isStartAtNutLine={isStartAtNutLine}
                  isStartFret={isStartFret}
                  isEndFret={isEndFret}
                  isPreviewStartAtNutLine={isPreviewStartAtNutLine}
                  isPreviewStartFret={isPreviewStartFret}
                  isPreviewEndFret={isPreviewEndFret}
                  startMarkerColor={startMarkerColor}
                  endMarkerColor={endMarkerColor}
                  onNotePointerDown={onNotePointerDown}
                  onNoteClick={onNoteClick}
                  onNoteContextMenu={onNoteContextMenu}
                  onNotePointerUp={onNotePointerUp}
                />
              )
            })}
          </Fragment>
        ))}
      </RenderProfiler>
    )
  },
)
