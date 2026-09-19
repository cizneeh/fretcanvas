import { getChordPitchClasses, getScalePitchClasses } from '../../libs/chordAnalysis'
import { useFretboardStore } from '../../stores/fretboardStore'
import { usePianoStore } from '../../stores/pianoStore'
import { ControlPanel, type ControlPanelNoteActions } from '../ControlPanel'
import { PianoExportSettings } from './PianoExportSettings'
import { PianoView } from './PianoView'

const noteActions: ControlPanelNoteActions = {
  addScale: (withinRange) => {
    const { keyPc, selectedScale } = useFretboardStore.getState()
    if (selectedScale !== undefined)
      usePianoStore
        .getState()
        .addPitchClasses(getScalePitchClasses(keyPc, selectedScale), withinRange)
  },
  addChord: (withinRange) => {
    const { appliedChordSymbol } = useFretboardStore.getState()
    if (appliedChordSymbol !== undefined)
      usePianoStore
        .getState()
        .addPitchClasses(getChordPitchClasses(appliedChordSymbol), withinRange)
  },
  clear: () => usePianoStore.getState().clear(),
  clearOutsideRange: () => usePianoStore.getState().clear(true),
}

export const PianoWorkspace = () => (
  <div className="piano-workspace">
    <ControlPanel noteActions={noteActions} />
    <PianoView />
    <PianoExportSettings />
  </div>
)
