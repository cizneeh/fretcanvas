/** number of 0~11. 0 is C, 1 is C#, 2 is D, 3 is Eb, 4 is E, 5 is F, 6 is F#, 7 is G, 8 is Ab, 9 is A, 10 is Bb, 11 is B. */
export type PitchClass = number
export type ScaleId =
  | 'major'
  | 'naturalMinor'
  | 'pentatonicMajor'
  | 'pentatonicMinor'
  | 'harmonicMinor'
  | 'melodicMinor'
  | 'blues'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
export type NoteLabelMode = 'scale' | 'chord'
export type NoteTextMode = 'interval' | 'absolute' | 'combined'
export type ChordInputErrorKey = 'couldNotParse' | 'empty'

/**
 * 指板上の1マスごとのid
 * 例: "1:3" は1弦3フレット
 */
export type PositionId = string
export type Position = {
  stringIndex: number
  fret: number
}

export type ConnectionId = string
export type Connection = {
  id: ConnectionId
  from: PositionId
  to: PositionId
}

export type BendId = string
export type BendArrow = {
  id: BendId
  from: PositionId
}

export type NoteColorVariant = 'default' | 'amber' | 'violet'
export type NoteVisualRole = 'root' | 'default' | 'tension' | 'outOfKey'

export type HighlightedNote = {
  positionId: PositionId
  isDimmed: boolean
  isEmphasized: boolean
  colorVariant: NoteColorVariant
}

export type StringInfo = {
  id: string
  name: string
  pitchClass: PitchClass
}

export type TuningNoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'Ab'
  | 'A'
  | 'Bb'
  | 'B'

export type InstrumentPresetId =
  | 'guitarStandard6'
  | 'guitarHalfStepDown6'
  | 'guitar7'
  | 'bass4'
  | 'bass5'
  | 'bass6'
  | 'ukuleleC'

export type InstrumentPreset = {
  id: InstrumentPresetId
  strings: readonly TuningNoteName[]
}

export const FRET_COUNT = 24

export const CHORD_INTERVAL_LABELS = [
  'R',
  'b9',
  '9',
  'm3',
  'M3',
  '11',
  '#11',
  'P5',
  'b13',
  '13',
  'm7',
  'M7',
]

export const SCALE_INTERVAL_LABELS = [
  'R',
  'm2',
  'M2',
  'm3',
  'M3',
  'P4',
  '#4',
  'P5',
  'm6',
  'M6',
  'm7',
  'M7',
]

export const NOTE_LABELS = ['C', 'C#/Db', 'D', 'Eb', 'E', 'F', 'F#/Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export const POSITION_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const
export const FRET_NUMBERS = Array.from({ length: FRET_COUNT + 1 }, (_, index) => index)
export const MARKER_FRETS: number[] = POSITION_MARKERS.filter((fret) => fret <= FRET_COUNT)

/**
 * PicthをPitch Classに正規化する
 * %は負の数になりうるので、+12している。
 * @example
 * normalizePc(69) // 9 (midi number 69 は A4の音高でありA)
 */
export const normalizePc = (value: number): PitchClass => ((value % 12) + 12) % 12

export const toPositionId = (position: Position): PositionId =>
  `${position.stringIndex}:${position.fret}`

export const parsePositionId = (positionId: PositionId): Position | undefined => {
  const [stringIndexText, fretText] = positionId.split(':')
  const stringIndex = Number(stringIndexText)
  const fret = Number(fretText)
  if (Number.isNaN(stringIndex) || Number.isNaN(fret)) {
    return undefined
  }
  return { stringIndex, fret }
}

export const getConnectionId = (from: PositionId, to: PositionId): ConnectionId => {
  const left = parsePositionId(from)
  const right = parsePositionId(to)
  if (left === undefined || right === undefined) {
    if (from <= to) {
      return `${from}|${to}`
    }
    return `${to}|${from}`
  }

  const isFromFirst =
    left.stringIndex < right.stringIndex ||
    (left.stringIndex === right.stringIndex && left.fret <= right.fret)
  if (isFromFirst) {
    return `${toPositionId(left)}|${toPositionId(right)}`
  }
  return `${toPositionId(right)}|${toPositionId(left)}`
}

export const getBendId = (from: PositionId): BendId => `bend:${from}`
