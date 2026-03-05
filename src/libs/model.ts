export type PitchClass = number
export type ScaleId = 'major' | 'naturalMinor' | 'pentatonicMajor' | 'pentatonicMinor'
export type PositionId = string

export type StringInfo = {
  id: string
  name: string
  midi: number
}

export const FRET_COUNT = 24
export const DEGREE_LABELS = [
  'R',
  'b9',
  '9',
  'm3',
  'M3',
  'P4',
  '#11',
  'P5',
  'b13',
  '13',
  'm7',
  'M7',
]
export const NOTE_LABELS = ['C', 'C#/Db', 'D', 'Eb', 'E', 'F', 'F#/Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export const OPEN_STRINGS: StringInfo[] = [
  { id: '1', name: 'E', midi: 64 },
  { id: '2', name: 'B', midi: 59 },
  { id: '3', name: 'G', midi: 55 },
  { id: '4', name: 'D', midi: 50 },
  { id: '5', name: 'A', midi: 45 },
  { id: '6', name: 'E', midi: 40 },
]

export const SCALE_INTERVALS: Record<ScaleId, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
}

export const SCALE_LABELS: Record<ScaleId, string> = {
  major: 'Major',
  naturalMinor: 'Natural Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
}

export const POSITION_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
export const FRET_NUMBERS = Array.from({ length: FRET_COUNT + 1 }, (_, index) => index)
export const MARKER_FRETS = POSITION_MARKERS.filter((fret) => fret <= FRET_COUNT)

export const normalizePc = (value: number): PitchClass => ((value % 12) + 12) % 12
export const getPositionId = (stringId: string, fret: number): PositionId => `${stringId}:${fret}`
