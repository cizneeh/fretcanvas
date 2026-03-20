import { Fragment, memo, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '../../i18n/useI18n'
import { FRET_NUMBERS, normalizePc, type PositionId, toPositionId } from '../../libs/musicCore'
import { getDisplayedNoteLabel, getNoteVisualRole } from '../../libs/noteDisplay'
import { useFretboardStore } from '../../stores/fretboardStore'
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
    const stringRows = useMemo(
      () =>
        strings.map((stringInfo, stringIndex) => ({
          stringInfo,
          cells: FRET_NUMBERS.map((fret) => {
            const positionId = toPositionId({ stringIndex, fret })
            const pitchClass = normalizePc(stringInfo.pitchClass + fret)
            return {
              fret,
              positionId,
              label: getDisplayedNoteLabel(
                pitchClass,
                noteTextMode,
                noteLabelMode,
                keyPc,
                selectedScale,
                appliedChordSymbol,
              ),
              visualRole: getNoteVisualRole({
                pitchClass,
                noteLabelMode,
                keyPc,
                selectedScale,
                appliedChordSymbol,
              }),
            }
          }),
        })),
      [appliedChordSymbol, keyPc, noteLabelMode, noteTextMode, selectedScale, strings],
    )

    return (
      <RenderProfiler id="StringRows">
        {stringRows.map(({ stringInfo, cells }) => (
          <Fragment key={stringInfo.id}>
            <div className="flex h-12 items-center justify-center pr-2">
              <button
                type="button"
                className="m3-focus-ring rounded-md border border-cyan-300/0 px-2 py-1 text-base font-medium text-slate-300 transition-[background-color,border-color,color,box-shadow,transform] hover:-translate-y-px hover:border-cyan-200/55 hover:bg-cyan-200/18 hover:text-white hover:shadow-[0_0_0_1px_rgba(103,232,249,0.12)] focus-visible:-translate-y-px focus-visible:border-cyan-200/55 focus-visible:bg-cyan-200/18 focus-visible:text-white focus-visible:shadow-[0_0_0_1px_rgba(103,232,249,0.12)]"
                aria-label={`${stringInfo.name} ${t('tuning.openMenu')}`}
                onClick={(event) => {
                  onOpenTuningMenu(event.currentTarget)
                }}
              >
                {stringInfo.name}
              </button>
            </div>

            {/* 各マスは弦の pitch class と fret 番号から音名を決める。ノート自体は絶対音高を持たない。 */}
            {cells.map(({ fret, positionId, label, visualRole }) => {
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
                  fret={fret}
                  positionId={positionId}
                  isNut={fret === 0}
                  label={label}
                  visualRole={visualRole}
                  isSelected={selectedPositionIds.has(positionId)}
                  disablePreview={disableCellPreview}
                  isPreviewStartAtNutLine={isPreviewStartAtNutLine}
                  isPreviewStartFret={isPreviewStartFret}
                  isPreviewEndFret={isPreviewEndFret}
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
