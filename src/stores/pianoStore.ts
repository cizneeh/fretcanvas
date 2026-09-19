import { create } from 'zustand'
import { normalizePc } from '../libs/musicCore'
import {
  EMPTY_PIANO_NOTE,
  type Instrument,
  normalizePianoRange,
  PIANO_HIGHEST,
  PIANO_LOWEST,
  type PianoNotes,
} from '../libs/piano'
import { useHistoryStore } from './historyStore'

export type PianoStoreState = {
  notes: PianoNotes
  startMidi: number
  octaves: number
  exportStartMidi: number
  exportEndMidi: number
  showOctaveLabels: boolean
  exportFormat: 'png' | 'svg'
  activeInstrument: Instrument
}

export const DEFAULT_PIANO_STATE: PianoStoreState = {
  notes: {},
  startMidi: 48,
  octaves: 2,
  exportStartMidi: 48,
  exportEndMidi: 72,
  showOctaveLabels: true,
  exportFormat: 'png',
  activeInstrument: 'guitar',
}

type PianoStore = PianoStoreState & {
  setRange: (startMidi: number, octaves: number) => void
  setExportRange: (startMidi: number, endMidi: number) => void
  setShowOctaveLabels: (value: boolean) => void
  setExportFormat: (value: 'png' | 'svg') => void
  toggleNote: (midi: number) => void
  toggleStyle: (midi: number, style: 'isDimmed' | 'isEmphasized') => void
  addPitchClasses: (pitchClasses: number[], withinExportRange?: boolean) => void
  clear: (outsideExportRange?: boolean) => void
}

export const usePianoStore = create<PianoStore>((set, get) => {
  const update = (next: Partial<PianoStoreState>) => {
    if (
      Object.entries(next).every(
        ([key, value]) =>
          JSON.stringify(get()[key as keyof PianoStoreState]) === JSON.stringify(value),
      )
    )
      return
    useHistoryStore.getState().pushBeforeChange()
    set(next)
  }
  return {
    ...DEFAULT_PIANO_STATE,
    setRange: (startMidi, octaves) => {
      const range = normalizePianoRange(startMidi, octaves)
      update({
        startMidi: range.startMidi,
        octaves: range.octaves,
        exportStartMidi: range.startMidi,
        exportEndMidi: range.endMidi,
      })
    },
    setExportRange: (startMidi, endMidi) => {
      const { startMidi: start, octaves } = get()
      const end = start + octaves * 12
      const low = Math.max(start, Math.min(end, Math.round(startMidi)))
      const high = Math.max(low, Math.min(end, Math.round(endMidi)))
      update({ exportStartMidi: low, exportEndMidi: high })
    },
    setShowOctaveLabels: (showOctaveLabels) => update({ showOctaveLabels }),
    setExportFormat: (exportFormat) => update({ exportFormat }),
    toggleNote: (midi) => {
      if (!Number.isInteger(midi) || midi < PIANO_LOWEST || midi > PIANO_HIGHEST) return
      const notes = { ...get().notes }
      if (notes[midi] !== undefined) delete notes[midi]
      else notes[midi] = { ...EMPTY_PIANO_NOTE }
      update({ notes })
    },
    toggleStyle: (midi, style) => {
      const { notes } = get()
      const note = notes[midi]
      if (note === undefined) return
      const enabled = !note[style]
      const opposite = style === 'isDimmed' ? 'isEmphasized' : 'isDimmed'
      update({
        notes: {
          ...notes,
          [midi]: { ...note, [style]: enabled, [opposite]: enabled ? false : note[opposite] },
        },
      })
    },
    addPitchClasses: (pitchClasses, withinExportRange = false) => {
      const state = get()
      const start = withinExportRange ? state.exportStartMidi : state.startMidi
      const end = withinExportRange ? state.exportEndMidi : state.startMidi + state.octaves * 12
      const notes = { ...state.notes }
      for (let midi = start; midi <= end; midi += 1) {
        if (pitchClasses.includes(normalizePc(midi)) && notes[midi] === undefined)
          notes[midi] = { ...EMPTY_PIANO_NOTE }
      }
      update({ notes })
    },
    clear: (outsideExportRange = false) => {
      const state = get()
      update({
        notes: outsideExportRange
          ? Object.fromEntries(
              Object.entries(state.notes).filter(
                ([midi]) =>
                  Number(midi) >= state.exportStartMidi && Number(midi) <= state.exportEndMidi,
              ),
            )
          : {},
      })
    },
  }
})
