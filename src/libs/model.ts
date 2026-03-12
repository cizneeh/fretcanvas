// データ型定義、定数、ロジック

/** number of 0~11. 0 is C, 1 is C#, 2 is D, 3 is Eb, 4 is E, 5 is F, 6 is F#, 7 is G, 8 is Ab, 9 is A, 10 is Bb, 11 is B. */
export type PitchClass = number
export type ScaleId = 'major' | 'naturalMinor' | 'pentatonicMajor' | 'pentatonicMinor'
export type ChordQuality = 'maj7' | 'm7' | '7' | 'm7b5'
export type NoteLabelMode = 'scale' | 'chord'
export type SelectedChord = {
  rootPc: PitchClass
  quality: ChordQuality
}
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

// midiというのは音高のこと。半音上がるごとに +1される数字。絶対的な音の高さ。
export const OPEN_STRINGS: StringInfo[] = [
  { id: '1', name: 'E', midi: 64 },
  { id: '2', name: 'B', midi: 59 },
  { id: '3', name: 'G', midi: 55 },
  { id: '4', name: 'D', midi: 50 },
  { id: '5', name: 'A', midi: 45 },
  { id: '6', name: 'E', midi: 40 },
]

/**
 * keyが0. keyからのInterval
 */
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

const CHORD_QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
}

const CHORD_QUALITY_LABELS: Record<ChordQuality, string> = {
  maj7: 'maj7',
  m7: 'm7',
  '7': '7',
  m7b5: 'm7b5',
}

const MAJOR_DIATONIC_SEVENTH_CHORD_DEFINITIONS: {
  id: string
  label: string
  intervalFromKey: number
  quality: ChordQuality
}[] = [
  { id: 'Imaj7', label: 'Imaj7', intervalFromKey: 0, quality: 'maj7' },
  { id: 'iim7', label: 'iim7', intervalFromKey: 2, quality: 'm7' },
  { id: 'iiim7', label: 'iiim7', intervalFromKey: 4, quality: 'm7' },
  { id: 'IVmaj7', label: 'IVmaj7', intervalFromKey: 5, quality: 'maj7' },
  { id: 'V7', label: 'V7', intervalFromKey: 7, quality: '7' },
  { id: 'vim7', label: 'vim7', intervalFromKey: 9, quality: 'm7' },
  { id: 'viim7b5', label: 'viim7b5', intervalFromKey: 11, quality: 'm7b5' },
]

export type MajorDiatonicSeventhChordOption = {
  id: string
  label: string
  chord: SelectedChord
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
export const getChordToneLabel = (pitchClass: PitchClass, selectedChord: SelectedChord): string => {
  const intervalFromRoot = normalizePc(pitchClass - selectedChord.rootPc)
  if (selectedChord.quality === 'm7b5' && intervalFromRoot === 6) {
    return 'b5'
  }
  return DEGREE_LABELS[intervalFromRoot]
}
export const getDisplayRootPc = (
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  selectedChord: SelectedChord | undefined,
): PitchClass =>
  noteLabelMode === 'chord' && selectedChord !== undefined ? selectedChord.rootPc : keyPc
export const getDisplayedNoteLabel = (
  pitchClass: PitchClass,
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  selectedChord: SelectedChord | undefined,
): string =>
  noteLabelMode === 'chord' && selectedChord !== undefined
    ? getChordToneLabel(pitchClass, selectedChord)
    : getLabelFromRoot(pitchClass, keyPc)
export const getChordPitchClasses = (selectedChord: SelectedChord): PitchClass[] =>
  CHORD_QUALITY_INTERVALS[selectedChord.quality].map((interval) =>
    normalizePc(selectedChord.rootPc + interval),
  )
export const getMajorDiatonicSeventhChordOptions = (
  keyPc: PitchClass,
): MajorDiatonicSeventhChordOption[] =>
  MAJOR_DIATONIC_SEVENTH_CHORD_DEFINITIONS.map((definition) => {
    const rootPc = normalizePc(keyPc + definition.intervalFromKey)
    const rootLabel = NOTE_LABELS[rootPc].split('/')[0]
    const qualityLabel = CHORD_QUALITY_LABELS[definition.quality]

    return {
      id: definition.id,
      label: `${rootLabel}${qualityLabel}`,
      chord: {
        rootPc,
        quality: definition.quality,
      },
    }
  })
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
