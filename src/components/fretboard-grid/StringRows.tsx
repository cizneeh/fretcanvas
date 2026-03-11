import { Fragment } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  FRET_NUMBERS,
  getChordToneLabel,
  getLabelFromRoot,
  normalizePc,
  OPEN_STRINGS,
  type PositionId,
  SCALE_INTERVALS,
  toPositionId,
} from '../../libs/model'
import { useFretboardStore } from '../../stores/fretboardStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { FretCell } from './FretCell'

type StringRowsProps = {
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

export const StringRows = ({
  onNotePointerDown,
  onNoteClick,
  onNoteContextMenu,
  onNotePointerUp,
}: StringRowsProps) => {
  const { keyPc, noteLabelMode, selectedChord, selectedScale, displayedNotes } = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteLabelMode: state.noteLabelMode,
      selectedChord: state.selectedChord,
      selectedScale: state.selectedScale,
      displayedNotes: state.displayedNotes,
    })),
  )
  const { exportFretStart, exportFretEnd } = useSettingsStore(
    useShallow((state) => ({
      exportFretStart: state.exportFretStart,
      exportFretEnd: state.exportFretEnd,
    })),
  )
  const startHighlightFret = Math.max(0, exportFretStart - 1)
  const startMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-cyan-300'
  const endMarkerColor = exportFretStart === exportFretEnd ? 'bg-fuchsia-300' : 'bg-emerald-300'
  const scalePitchClasses =
    selectedScale === undefined
      ? undefined
      : new Set(SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)))

  return (
    <>
      {OPEN_STRINGS.map((stringInfo, stringIndex) => (
        <Fragment key={stringInfo.id}>
          <div className="flex h-12 items-center justify-center pr-2 text-base text-slate-300">
            {stringInfo.name}
          </div>

          {/* ノート自体じゃなくて、マス目がmidiのデータを持ってるのか。で、ノート自体は、midi　音高の情報を持っていない。マス目の上にノートが来たら、マス目の音高で表示される。 */}
          {FRET_NUMBERS.map((fret) => {
            const positionId = toPositionId({ stringIndex, fret })
            const pitchClass = normalizePc(stringInfo.midi + fret)
            const displayedNote = displayedNotes[positionId]
            const isHighlighted = displayedNote !== undefined
            const intervalFromKey = normalizePc(pitchClass - keyPc)
            const isRoot = intervalFromKey === 0
            const isOutOfScale =
              scalePitchClasses !== undefined && !scalePitchClasses.has(pitchClass)
            const label =
              noteLabelMode === 'chord' && selectedChord !== undefined
                ? getChordToneLabel(pitchClass, selectedChord)
                : getLabelFromRoot(pitchClass, keyPc)
            const isStartFret = fret === startHighlightFret
            const isEndFret = fret === exportFretEnd
            const isStartAtNutLine = exportFretStart === 0 && fret === 0

            return (
              <FretCell
                key={`${stringInfo.id}-${fret}`}
                positionId={positionId}
                isNut={fret === 0}
                isHighlighted={isHighlighted}
                isDimmed={displayedNote?.isDimmed ?? false}
                label={label}
                isRoot={isRoot}
                isOutOfScale={isOutOfScale}
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
    </>
  )
}
