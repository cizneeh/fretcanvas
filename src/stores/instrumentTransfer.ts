import { guitarToPianoNotes, type Instrument, pianoToGuitarNotes } from '../libs/piano'
import { useFretboardStore } from './fretboardStore'
import { usePianoStore } from './pianoStore'

export const transferInstrument = (instrument: Instrument) => {
  const piano = usePianoStore.getState()
  if (piano.activeInstrument === instrument) return
  const guitar = useFretboardStore.getState()
  if (instrument === 'piano') {
    usePianoStore.setState({
      notes: guitarToPianoNotes(guitar.strings, guitar.displayedNotes, piano.notes),
      activeInstrument: instrument,
    })
  } else {
    const displayedNotes = pianoToGuitarNotes(guitar.strings, piano.notes)
    useFretboardStore.setState({
      displayedNotes,
      connections: Object.fromEntries(
        Object.entries(guitar.connections).filter(
          ([, connection]) =>
            displayedNotes[connection.from] !== undefined &&
            displayedNotes[connection.to] !== undefined,
        ),
      ),
      bends: Object.fromEntries(
        Object.entries(guitar.bends).filter(([, bend]) => displayedNotes[bend.from] !== undefined),
      ),
    })
    usePianoStore.setState({ activeInstrument: instrument })
  }
}
