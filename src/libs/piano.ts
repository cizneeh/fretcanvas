import {
  FRET_COUNT,
  type HighlightedNote,
  normalizePc,
  parsePositionId,
  type StringInfo,
  toPositionId,
} from './musicCore'

export type Instrument = 'guitar' | 'piano'
export type PianoNote = Omit<HighlightedNote, 'positionId'>
export type PianoNotes = Record<number, PianoNote>

export const PIANO_LOWEST = 21
export const PIANO_HIGHEST = 108
export const WHITE_KEY_WIDTH = 64
export const WHITE_KEY_HEIGHT = 288
export const BLACK_KEY_WIDTH = 38
export const BLACK_KEY_HEIGHT = 180

export const isBlackKey = (midi: number) => [1, 3, 6, 8, 10].includes(normalizePc(midi))
export const getMidiLabel = (midi: number) =>
  `${['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][normalizePc(midi)]}${Math.floor(midi / 12) - 1}`

export const normalizePianoRange = (startMidi: number, octaves: number) => {
  let start = Number.isFinite(startMidi) ? Math.round(startMidi) : 48
  start = Math.max(PIANO_LOWEST, Math.min(96, start))
  if (isBlackKey(start)) start -= 1
  const count = Math.max(
    1,
    Math.min(7, Math.floor((PIANO_HIGHEST - start) / 12), Math.round(octaves) || 2),
  )
  return { startMidi: start, octaves: count, endMidi: start + count * 12 }
}

export type PianoKey = { midi: number; isBlack: boolean; x: number; width: number; height: number }

export const getPianoLayout = (startMidi: number, endMidi: number) => {
  const keys: PianoKey[] = []
  let whiteCount = 0
  // A cropped range may start or end on an accidental; retain its supporting white key.
  const start = isBlackKey(startMidi) ? startMidi - 1 : startMidi
  const end = isBlackKey(endMidi) ? endMidi + 1 : endMidi
  for (let midi = start; midi <= end; midi += 1) {
    const isBlack = isBlackKey(midi)
    keys.push({
      midi,
      isBlack,
      x: isBlack
        ? whiteCount * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
        : whiteCount * WHITE_KEY_WIDTH,
      width: isBlack ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH,
      height: isBlack ? BLACK_KEY_HEIGHT : WHITE_KEY_HEIGHT,
    })
    if (!isBlack) whiteCount += 1
  }
  return { keys, width: whiteCount * WHITE_KEY_WIDTH, height: WHITE_KEY_HEIGHT }
}

export const getGuitarPitch = (strings: StringInfo[], positionId: string): number | undefined => {
  const position = parsePositionId(positionId)
  if (position === undefined || position.fret < 0 || position.fret > FRET_COUNT) return undefined
  const string = strings[position.stringIndex]
  return string === undefined ? undefined : string.midi + position.fret
}

export const guitarToPianoNotes = (
  strings: StringInfo[],
  displayedNotes: Record<string, HighlightedNote>,
  previous: PianoNotes,
): PianoNotes => {
  const notes: PianoNotes = {}
  // Preserve pitches the current tuning cannot represent, including notes outside the viewport.
  for (const [pitch, note] of Object.entries(previous)) {
    const midi = Number(pitch)
    if (!strings.some((string) => midi >= string.midi && midi <= string.midi + FRET_COUNT)) {
      notes[midi] = { ...note }
    }
  }
  for (const [positionId, note] of Object.entries(displayedNotes)) {
    const midi = getGuitarPitch(strings, positionId)
    if (midi === undefined) continue
    const existing = notes[midi]
    const isEmphasized = note.isEmphasized || existing?.isEmphasized === true
    notes[midi] = {
      isEmphasized,
      isDimmed: !isEmphasized && note.isDimmed && (existing?.isDimmed ?? true),
      colorVariant: note.colorVariant,
    }
  }
  return notes
}

export const pianoToGuitarNotes = (
  strings: StringInfo[],
  notes: PianoNotes,
): Record<string, HighlightedNote> => {
  const displayedNotes: Record<string, HighlightedNote> = {}
  for (const [stringIndex, string] of strings.entries()) {
    for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
      const note = notes[string.midi + fret]
      if (note === undefined) continue
      const positionId = toPositionId({ stringIndex, fret })
      displayedNotes[positionId] = { ...note, positionId }
    }
  }
  return displayedNotes
}

export const EMPTY_PIANO_NOTE: PianoNote = {
  isDimmed: false,
  isEmphasized: false,
  colorVariant: 'default',
}
