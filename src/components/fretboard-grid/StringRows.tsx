import { Fragment, memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  FRET_NUMBERS,
  getDisplayedNoteLabel,
  getNoteVisualRole,
  normalizePc,
  type PositionId,
  toPositionId,
} from '../../libs/model'
import { useFretboardStore } from '../../stores/fretboardStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { RenderProfiler } from '../dev/RenderProfiler'
import { FretCell } from './FretCell'

type StringRowsProps = {
  selectedPositionIds: Set<PositionId>
  disableCellPreview: boolean
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
  onNotePointerUp: (positionId: PositionId) => void
}

export const StringRows = memo(
  ({
    selectedPositionIds,
    disableCellPreview,
    onNotePointerDown,
    onNoteClick,
    onNoteContextMenu,
    onNotePointerUp,
  }: StringRowsProps) => {
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
            <div className="flex h-12 items-center justify-center pr-2 text-base text-slate-300">
              {stringInfo.name}
            </div>

            {/* ノート自体じゃなくて、マス目がmidiのデータを持ってるのか。で、ノート自体は、midi　音高の情報を持っていない。マス目の上にノートが来たら、マス目の音高で表示される。 */}
            {FRET_NUMBERS.map((fret) => {
              const positionId = toPositionId({ stringIndex, fret })
              const pitchClass = normalizePc(stringInfo.midi + fret)
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
                appliedChordSymbol,
              )
              const isStartFret = fret === startHighlightFret
              const isEndFret = showExportRangeHighlight && fret === exportFretEnd
              const isStartAtNutLine =
                showExportRangeHighlight && exportFretStart === 0 && fret === 0

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
