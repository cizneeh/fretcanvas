import { type NoteLabelMode, type NoteTextMode, normalizePc, type ScaleId } from './musicCore'
import { type DisplayedNoteLabel, getDisplayedNoteLabel, getNoteVisualRole } from './noteDisplay'

export type MusicSelection = {
  keyPc: number
  noteLabelMode: NoteLabelMode
  noteTextMode: NoteTextMode
  selectedScale: ScaleId | undefined
  appliedChordSymbol: string | undefined
}

const NOTE_COLORS = {
  root: { light: '#be185d', dark: '#fda4af' },
  default: { light: '#087e9c', dark: '#67e8f9' },
  tension: { light: '#15803d', dark: '#86efac' },
  outOfKey: { light: '#c2410c', dark: '#fdba74' },
}

export const getPianoNoteDisplay = (
  midi: number,
  isBlack: boolean,
  music: MusicSelection,
): { label: DisplayedNoteLabel; color: string } => {
  const pitchClass = normalizePc(midi)
  const role = getNoteVisualRole({ ...music, pitchClass })
  return {
    label: getDisplayedNoteLabel(
      pitchClass,
      music.noteTextMode,
      music.noteLabelMode,
      music.keyPc,
      music.selectedScale,
      music.appliedChordSymbol,
    ),
    color: NOTE_COLORS[role][isBlack ? 'dark' : 'light'],
  }
}
