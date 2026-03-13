import { Chord, Key, Note, Scale } from 'tonal'

// データ型定義、定数、ロジック

/** number of 0~11. 0 is C, 1 is C#, 2 is D, 3 is Eb, 4 is E, 5 is F, 6 is F#, 7 is G, 8 is Ab, 9 is A, 10 is Bb, 11 is B. */
export type PitchClass = number
export type ScaleId = 'major' | 'naturalMinor' | 'pentatonicMajor' | 'pentatonicMinor'
export type NoteLabelMode = 'scale' | 'chord'
export type NoteTextMode = 'interval' | 'absolute'
/**
 * 指板上の1マスごとのid
 * 例: "1:3" は1弦3フレット
 * ２次元配列ではんく文字数なのは、その方が一意idとして扱いやすく、setで高速にhas/add/deleteしやすいから。らしい。
 * まぁそうかも？表示側でも、セルごとにidを持ってて、突き合わせてハイライトする。
 * 上下左右のポジションをたどるとか、行・列単位の処理とか、矩形選択とか、そういうのをやるんだったら座標で持ったほうが良い。文字列だとそういう比較ができず、パースすることになるから。今stringで良いのは、単一点のトグルだけだから。
 * 検索するときに、positionIdみたいな文字列がキーになっている方が確認しやすい。なので、PositionIdをキーにして、そのRecordの値として、noteのデータ、dimmedやcolorを持つことにした。
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
export type HighlightedNote = {
  positionId: PositionId
  isDimmed: boolean
  colorVariant: NoteColorVariant
}

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
const SHARP_NOTE_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTE_LABELS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const MAJOR_KEY_TONIC_CANDIDATES: Record<PitchClass, string[]> = {
  0: ['C'],
  1: ['Db', 'C#'],
  2: ['D'],
  3: ['Eb', 'D#'],
  4: ['E'],
  5: ['F'],
  6: ['F#', 'Gb'],
  7: ['G'],
  8: ['Ab', 'G#'],
  9: ['A'],
  10: ['Bb', 'A#'],
  11: ['B', 'Cb'],
}

// midiというのは音高のこと。半音上がるごとに +1される数字。絶対的な音の高さ。
export const OPEN_STRINGS: StringInfo[] = [
  { id: '1', name: 'E', midi: 64 },
  { id: '2', name: 'B', midi: 59 },
  { id: '3', name: 'G', midi: 55 },
  { id: '4', name: 'D', midi: 50 },
  { id: '5', name: 'A', midi: 45 },
  { id: '6', name: 'E', midi: 40 },
]

const SCALE_NAME_BY_ID: Record<ScaleId, string> = {
  major: 'major',
  naturalMinor: 'minor',
  pentatonicMajor: 'major pentatonic',
  pentatonicMinor: 'minor pentatonic',
}

export const SCALE_LABELS: Record<ScaleId, string> = {
  major: 'Major',
  naturalMinor: 'Natural Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
}

export type MajorDiatonicSeventhChordOption = {
  symbol: string
  label: string
}

export const POSITION_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const
export const FRET_NUMBERS = Array.from({ length: FRET_COUNT + 1 }, (_, index) => index)
export const MARKER_FRETS: number[] = POSITION_MARKERS.filter((fret) => fret <= FRET_COUNT)

/**
 * PicthをPitch Classに正規化する
 * %は負の数になりうる（そうなの？）ので、+12しているらしい
 * @example
 * normalizePc(69) // 9 (midi number 69 は A4の音高でありA)
 */
export const normalizePc = (value: number): PitchClass => ((value % 12) + 12) % 12
export const getLabelFromRoot = (pitchClass: PitchClass, rootPc: PitchClass): string =>
  DEGREE_LABELS[normalizePc(pitchClass - rootPc)]

const getChordRootPc = (chordSymbol: string): PitchClass | undefined => {
  const tonic = Chord.get(chordSymbol).tonic
  if (tonic === null) {
    return undefined
  }
  const chroma = Note.chroma(tonic)
  return chroma === undefined ? undefined : normalizePc(chroma)
}

export const getChordToneLabel = (pitchClass: PitchClass, chordSymbol: string): string => {
  const rootPc = getChordRootPc(chordSymbol)
  if (rootPc === undefined) {
    return DEGREE_LABELS[normalizePc(pitchClass)]
  }

  const intervalFromRoot = normalizePc(pitchClass - rootPc)
  const isHalfDiminished = Chord.get(chordSymbol).intervals.includes('5d')
  if (isHalfDiminished && intervalFromRoot === 6) {
    return 'b5'
  }
  return DEGREE_LABELS[intervalFromRoot]
}

const getAccidentalPreferenceByKey = (keyPc: PitchClass): 'sharp' | 'flat' => {
  const tonic = getPreferredMajorKeyTonic(keyPc)
  const keySignature = Key.majorKey(tonic).keySignature
  if (keySignature.includes('b')) {
    return 'flat'
  }
  if (keySignature.includes('#')) {
    return 'sharp'
  }
  if (tonic.includes('b')) {
    return 'flat'
  }
  return 'sharp'
}

export const getAbsoluteNoteLabelByKey = (pitchClass: PitchClass, keyPc: PitchClass): string => {
  const normalizedPitchClass = normalizePc(pitchClass)
  const preference = getAccidentalPreferenceByKey(keyPc)
  return preference === 'flat'
    ? FLAT_NOTE_LABELS[normalizedPitchClass]
    : SHARP_NOTE_LABELS[normalizedPitchClass]
}

export const getDisplayRootPc = (
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  selectedChordSymbol: string | undefined,
): PitchClass =>
  noteLabelMode === 'chord' && selectedChordSymbol !== undefined
    ? (getChordRootPc(selectedChordSymbol) ?? keyPc)
    : keyPc
export const getDisplayedNoteLabel = (
  pitchClass: PitchClass,
  noteTextMode: NoteTextMode,
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  selectedChordSymbol: string | undefined,
): string =>
  noteTextMode === 'absolute'
    ? getAbsoluteNoteLabelByKey(pitchClass, keyPc)
    : noteLabelMode === 'chord' && selectedChordSymbol !== undefined
      ? getChordToneLabel(pitchClass, selectedChordSymbol)
      : getLabelFromRoot(pitchClass, keyPc)

export const getExportTitle = (
  keyPc: PitchClass,
  noteLabelMode: NoteLabelMode,
  selectedScale: ScaleId | undefined,
  selectedChordSymbol: string | undefined,
): string | undefined => {
  if (noteLabelMode === 'scale') {
    if (selectedScale === undefined) {
      return undefined
    }

    return `${getAbsoluteNoteLabelByKey(keyPc, keyPc)} ${SCALE_LABELS[selectedScale]} Scale`
  }

  return selectedChordSymbol
}

export const getScalePitchClasses = (keyPc: PitchClass, scaleId: ScaleId): PitchClass[] =>
  Scale.get(`${SHARP_NOTE_LABELS[normalizePc(keyPc)]} ${SCALE_NAME_BY_ID[scaleId]}`)
    .notes.map((noteName) => Note.chroma(noteName))
    .filter((value): value is number => value !== undefined)
    .map((value) => normalizePc(value))

export const getChordPitchClasses = (chordSymbol: string): PitchClass[] =>
  Chord.get(chordSymbol)
    .notes.map((noteName) => Note.chroma(noteName))
    .filter((value): value is number => value !== undefined)
    .map((value) => normalizePc(value))

const getMajorKeyAccidentalCount = (tonic: string): number => {
  const signature = Key.majorKey(tonic).keySignature
  return (signature.match(/[b#]/g) ?? []).length
}
const getPreferredMajorKeyTonic = (keyPc: PitchClass): string => {
  const candidates = MAJOR_KEY_TONIC_CANDIDATES[normalizePc(keyPc)] ?? ['C']
  return [...candidates].sort((left, right) => {
    return getMajorKeyAccidentalCount(left) - getMajorKeyAccidentalCount(right)
  })[0]
}
export const getMajorDiatonicSeventhChordOptions = (
  keyPc: PitchClass,
): MajorDiatonicSeventhChordOption[] => {
  const tonic = getPreferredMajorKeyTonic(keyPc)
  const chordSymbols = Key.majorKey(tonic).chords.filter((chordSymbol) => chordSymbol.length > 0)
  return chordSymbols.map((symbol) => ({
    symbol,
    label: symbol,
  }))
}
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
