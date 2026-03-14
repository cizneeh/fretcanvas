import { Chord, ChordType, Key, Note, Scale } from 'tonal'

// データ型定義、定数、ロジック

/** number of 0~11. 0 is C, 1 is C#, 2 is D, 3 is Eb, 4 is E, 5 is F, 6 is F#, 7 is G, 8 is Ab, 9 is A, 10 is Bb, 11 is B. */
export type PitchClass = number
export type ScaleId = 'major' | 'naturalMinor' | 'pentatonicMajor' | 'pentatonicMinor'
export type NoteLabelMode = 'scale' | 'chord'
export type NoteTextMode = 'interval' | 'absolute'
export type ChordInputErrorKey = 'couldNotParse' | 'empty'
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
  midi: number
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
export type InstrumentPresetId = 'guitarStandard6' | 'guitar7' | 'bass4' | 'bass5' | 'ukuleleC'

export type InstrumentPreset = {
  id: InstrumentPresetId
  strings: readonly {
    note: TuningNoteName
    octave: number
  }[]
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
export const TUNING_NOTE_OPTIONS: TuningNoteName[] = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]
export const TUNING_OCTAVE_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const
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
export const INSTRUMENT_PRESETS: InstrumentPreset[] = [
  {
    id: 'guitarStandard6',
    strings: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 2 },
    ],
  },
  {
    id: 'guitar7',
    strings: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 2 },
      { note: 'B', octave: 1 },
    ],
  },
  {
    id: 'bass4',
    strings: [
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
      { note: 'A', octave: 1 },
      { note: 'E', octave: 1 },
    ],
  },
  {
    id: 'bass5',
    strings: [
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
      { note: 'A', octave: 1 },
      { note: 'E', octave: 1 },
      { note: 'B', octave: 0 },
    ],
  },
  {
    id: 'ukuleleC',
    strings: [
      { note: 'A', octave: 4 },
      { note: 'E', octave: 4 },
      { note: 'C', octave: 4 },
      { note: 'G', octave: 4 },
    ],
  },
] as const

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

const EXPLICIT_EXTENSION_INTERVALS = {
  b9: '9m',
  9: '9M',
  '#9': '9A',
  11: '11P',
  '#11': '11A',
  b13: '13m',
  13: '13M',
} as const

type ExplicitExtensionToken = keyof typeof EXPLICIT_EXTENSION_INTERVALS

const EXPLICIT_EXTENSION_ORDER: Record<ExplicitExtensionToken, number> = {
  b9: 0,
  9: 1,
  '#9': 2,
  11: 3,
  '#11': 4,
  b13: 5,
  13: 6,
}

type ExplicitExtensionParseResult =
  | { kind: 'none' }
  | { kind: 'invalid' }
  | { kind: 'parsed'; baseInput: string; extensions: ExplicitExtensionToken[] }

const registeredCustomChordTypes = new Set<string>()

export type MajorDiatonicSeventhChordOption = {
  symbol: string
  label: string
}

export const POSITION_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const
export const FRET_NUMBERS = Array.from({ length: FRET_COUNT + 1 }, (_, index) => index)
export const MARKER_FRETS: number[] = POSITION_MARKERS.filter((fret) => fret <= FRET_COUNT)
const MIN_TUNING_MIDI = 12
const MAX_TUNING_MIDI = 95

const toStringId = (stringIndex: number) => String(stringIndex + 1)
const createStringInfo = (
  stringIndex: number,
  note: TuningNoteName,
  octave: number,
): StringInfo => {
  const midi = Note.midi(`${note}${octave}`)
  return {
    id: toStringId(stringIndex),
    name: note,
    midi: midi ?? MIN_TUNING_MIDI,
  }
}

export const getTuningNameFromMidi = (midi: number): TuningNoteName =>
  TUNING_NOTE_OPTIONS[normalizePc(midi)]

export const getTuningOctaveFromMidi = (midi: number): number =>
  Math.max(0, Math.min(6, Math.floor(midi / 12) - 1))

export const getTuningMidi = (note: TuningNoteName, octave: number): number =>
  Note.midi(`${note}${octave}`) ?? MIN_TUNING_MIDI

export const getStringInfoFromMidi = (stringIndex: number, midi: number): StringInfo => {
  const clampedMidi = Math.max(MIN_TUNING_MIDI, Math.min(midi, MAX_TUNING_MIDI))
  return {
    id: toStringId(stringIndex),
    name: getTuningNameFromMidi(clampedMidi),
    midi: clampedMidi,
  }
}

export const cloneStrings = (strings: StringInfo[]): StringInfo[] =>
  strings.map((stringInfo, stringIndex) => ({
    id: toStringId(stringIndex),
    name: stringInfo.name,
    midi: stringInfo.midi,
  }))

export const getInstrumentPresetStrings = (presetId: InstrumentPresetId): StringInfo[] => {
  const preset = INSTRUMENT_PRESETS.find((candidate) => candidate.id === presetId)
  if (preset === undefined) {
    return []
  }

  return preset.strings.map(({ note, octave }, stringIndex) =>
    createStringInfo(stringIndex, note, octave),
  )
}

export const getDefaultStrings = (): StringInfo[] => getInstrumentPresetStrings('guitarStandard6')

export const getMatchingInstrumentPresetId = (
  strings: StringInfo[],
): InstrumentPresetId | undefined => {
  const matchedPreset = INSTRUMENT_PRESETS.find((preset) => {
    const presetStrings = getInstrumentPresetStrings(preset.id)
    if (presetStrings.length !== strings.length) {
      return false
    }

    return presetStrings.every((presetString, stringIndex) => {
      const stringInfo = strings[stringIndex]
      return stringInfo?.name === presetString.name && stringInfo?.midi === presetString.midi
    })
  })

  return matchedPreset?.id
}

export const stringInfoArraysEqual = (left: StringInfo[], right: StringInfo[]): boolean =>
  left.length === right.length &&
  left.every((leftString, stringIndex) => {
    const rightString = right[stringIndex]
    return (
      rightString !== undefined &&
      leftString.name === rightString.name &&
      leftString.midi === rightString.midi
    )
  })

/**
 * PicthをPitch Classに正規化する
 * %は負の数になりうる（そうなの？）ので、+12しているらしい
 * @example
 * normalizePc(69) // 9 (midi number 69 は A4の音高でありA)
 */
export const normalizePc = (value: number): PitchClass => ((value % 12) + 12) % 12
export const getScaleIntervalLabelFromRoot = (pitchClass: PitchClass, rootPc: PitchClass): string =>
  SCALE_INTERVAL_LABELS[normalizePc(pitchClass - rootPc)]
export const getChordIntervalLabelFromRoot = (pitchClass: PitchClass, rootPc: PitchClass): string =>
  CHORD_INTERVAL_LABELS[normalizePc(pitchClass - rootPc)]

const getIntervalDegree = (interval: string): number => Number.parseInt(interval, 10)

const parseExplicitExtensionInput = (input: string): ExplicitExtensionParseResult => {
  const trimmedInput = input.trim()

  let baseInput: string | undefined
  let extensionInput: string | undefined

  if (trimmedInput.includes('(') || trimmedInput.includes(')')) {
    const match = /^(.+?)\(([^()]*)\)$/.exec(trimmedInput)
    if (match === null) {
      return { kind: 'invalid' }
    }

    baseInput = match[1]?.trim()
    extensionInput = match[2]?.trim()
  } else if (trimmedInput.includes(',')) {
    const [basePart, ...extensionParts] = trimmedInput.split(',')
    baseInput = basePart?.trim()
    extensionInput = extensionParts.join(',').trim()
  } else {
    return { kind: 'none' }
  }

  if (
    baseInput === undefined ||
    baseInput === '' ||
    extensionInput === undefined ||
    extensionInput === ''
  ) {
    return { kind: 'invalid' }
  }

  const normalizedTokens = Array.from(
    new Set(
      extensionInput
        .split(',')
        .map((token) => token.replaceAll(' ', '').trim())
        .filter((token) => token.length > 0),
    ),
  )

  if (normalizedTokens.length === 0) {
    return { kind: 'invalid' }
  }

  const extensions: ExplicitExtensionToken[] = []
  for (const token of normalizedTokens) {
    if (!(token in EXPLICIT_EXTENSION_INTERVALS)) {
      return { kind: 'invalid' }
    }

    extensions.push(token as ExplicitExtensionToken)
  }

  extensions.sort((left, right) => EXPLICIT_EXTENSION_ORDER[left] - EXPLICIT_EXTENSION_ORDER[right])

  return {
    kind: 'parsed',
    baseInput,
    extensions,
  }
}

const registerCustomChordType = (
  baseParsedChord: ReturnType<typeof Chord.get>,
  extensions: ExplicitExtensionToken[],
): string | undefined => {
  if (baseParsedChord.tonic === null) {
    return undefined
  }

  const customChordSymbol = `${baseParsedChord.symbol}(${extensions.join(',')})`
  const customChordTypeAlias = customChordSymbol.slice(baseParsedChord.tonic.length)

  if (registeredCustomChordTypes.has(customChordTypeAlias)) {
    return customChordSymbol
  }

  const intervalByDegree = new Map<number, string>()
  for (const interval of baseParsedChord.intervals) {
    intervalByDegree.set(getIntervalDegree(interval), interval)
  }

  for (const extension of extensions) {
    const interval = EXPLICIT_EXTENSION_INTERVALS[extension]
    const degree = getIntervalDegree(interval)
    const existingInterval = intervalByDegree.get(degree)

    if (existingInterval === undefined) {
      intervalByDegree.set(degree, interval)
      continue
    }

    if (existingInterval !== interval) {
      return undefined
    }
  }

  const mergedIntervals = Array.from(intervalByDegree.values()).sort((left, right) => {
    return getIntervalDegree(left) - getIntervalDegree(right)
  })

  ChordType.add(mergedIntervals, [customChordTypeAlias], `${baseParsedChord.type} with extensions`)
  registeredCustomChordTypes.add(customChordTypeAlias)

  return customChordSymbol
}

const resolveChordSymbol = (
  input: string,
): { parsedChord: ReturnType<typeof Chord.get>; symbol: string } | undefined => {
  const explicitExtensionInput = parseExplicitExtensionInput(input)

  if (explicitExtensionInput.kind === 'invalid') {
    return undefined
  }

  if (explicitExtensionInput.kind === 'none') {
    const parsedChord = Chord.get(input)
    if (parsedChord.empty || parsedChord.tonic === null) {
      return undefined
    }

    return {
      parsedChord,
      symbol: parsedChord.symbol,
    }
  }

  const baseParsedChord = Chord.get(explicitExtensionInput.baseInput)
  if (baseParsedChord.empty || baseParsedChord.tonic === null) {
    return undefined
  }

  const customChordSymbol = registerCustomChordType(
    baseParsedChord,
    explicitExtensionInput.extensions,
  )
  if (customChordSymbol === undefined) {
    return undefined
  }

  const parsedChord = Chord.get(customChordSymbol)
  if (parsedChord.empty || parsedChord.tonic === null) {
    return undefined
  }

  return {
    parsedChord,
    symbol: customChordSymbol,
  }
}

const getResolvedChord = (chordSymbol: string): ReturnType<typeof Chord.get> =>
  resolveChordSymbol(chordSymbol)?.parsedChord ?? Chord.get(chordSymbol)

const getChordRootPc = (chordSymbol: string): PitchClass | undefined => {
  const tonic = getResolvedChord(chordSymbol).tonic
  if (tonic === null) {
    return undefined
  }
  const chroma = Note.chroma(tonic)
  return chroma === undefined ? undefined : normalizePc(chroma)
}

export const getChordToneLabel = (pitchClass: PitchClass, chordSymbol: string): string => {
  const rootPc = getChordRootPc(chordSymbol)
  if (rootPc === undefined) {
    return CHORD_INTERVAL_LABELS[normalizePc(pitchClass)]
  }

  const intervalFromRoot = normalizePc(pitchClass - rootPc)
  const chordToneDegrees = getChordToneDegrees(chordSymbol)
  if (chordToneDegrees.has(2) && intervalFromRoot === 2) {
    return 'M2'
  }
  if (chordToneDegrees.has(4) && intervalFromRoot === 5) {
    return 'P4'
  }

  const isHalfDiminished = getResolvedChord(chordSymbol).intervals.includes('5d')
  if (isHalfDiminished && intervalFromRoot === 6) {
    return 'b5'
  }
  return CHORD_INTERVAL_LABELS[intervalFromRoot]
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
  appliedChordSymbol: string | undefined,
): PitchClass =>
  noteLabelMode === 'chord' && appliedChordSymbol !== undefined
    ? (getChordRootPc(appliedChordSymbol) ?? keyPc)
    : keyPc
export const getDisplayedNoteLabel = (
  pitchClass: PitchClass,
  noteTextMode: NoteTextMode,
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  appliedChordSymbol: string | undefined,
): string =>
  noteTextMode === 'absolute'
    ? getAbsoluteNoteLabelByKey(pitchClass, keyPc)
    : noteLabelMode === 'chord' && appliedChordSymbol !== undefined
      ? getChordToneLabel(pitchClass, appliedChordSymbol)
      : noteLabelMode === 'scale'
        ? getScaleIntervalLabelFromRoot(pitchClass, keyPc)
        : getChordIntervalLabelFromRoot(pitchClass, keyPc)

export const parseChordInput = (
  input: string,
): { symbol: string } | { errorKey: ChordInputErrorKey } => {
  const trimmedInput = input.trim()
  if (trimmedInput === '') {
    return {
      errorKey: 'empty',
    }
  }

  const resolvedChord = resolveChordSymbol(trimmedInput)
  if (resolvedChord === undefined) {
    return {
      errorKey: 'couldNotParse',
    }
  }

  return {
    symbol: resolvedChord.symbol,
  }
}

const getReferenceScalePitchClasses = (
  noteLabelMode: NoteLabelMode,
  keyPc: PitchClass,
  selectedScale: ScaleId | undefined,
): Set<PitchClass> | undefined => {
  if (noteLabelMode === 'chord') {
    return new Set(getScalePitchClasses(keyPc, 'major'))
  }

  if (selectedScale === undefined) {
    return undefined
  }

  return new Set(getScalePitchClasses(keyPc, selectedScale))
}

export const getNoteVisualRole = ({
  pitchClass,
  noteLabelMode,
  keyPc,
  selectedScale,
  appliedChordSymbol,
}: {
  pitchClass: PitchClass
  noteLabelMode: NoteLabelMode
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  appliedChordSymbol: string | undefined
}): NoteVisualRole => {
  const normalizedPitchClass = normalizePc(pitchClass)

  if (noteLabelMode === 'chord' && appliedChordSymbol !== undefined) {
    const chordRootPc = getChordRootPc(appliedChordSymbol)
    if (chordRootPc !== undefined && normalizedPitchClass === chordRootPc) {
      return 'root'
    }

    const chordTonePitchClasses = new Set(getChordTonePitchClasses(appliedChordSymbol))
    if (chordTonePitchClasses.has(normalizedPitchClass)) {
      return 'default'
    }

    const chordPitchClasses = new Set(getChordPitchClasses(appliedChordSymbol))
    if (chordPitchClasses.has(normalizedPitchClass)) {
      return 'tension'
    }

    return 'outOfKey'
  }

  const displayRootPc = getDisplayRootPc(noteLabelMode, keyPc, appliedChordSymbol)
  if (normalizePc(normalizedPitchClass - displayRootPc) === 0) {
    return 'root'
  }

  const referenceScalePitchClasses = getReferenceScalePitchClasses(
    noteLabelMode,
    keyPc,
    selectedScale,
  )
  if (
    referenceScalePitchClasses !== undefined &&
    !referenceScalePitchClasses.has(normalizedPitchClass)
  ) {
    return 'outOfKey'
  }

  return 'default'
}

export const getExportTitle = (
  keyPc: PitchClass,
  noteLabelMode: NoteLabelMode,
  selectedScale: ScaleId | undefined,
  appliedChordSymbol: string | undefined,
): string | undefined => {
  if (noteLabelMode === 'scale') {
    if (selectedScale === undefined) {
      return undefined
    }

    return `${getAbsoluteNoteLabelByKey(keyPc, keyPc)} ${SCALE_LABELS[selectedScale]} Scale`
  }

  return appliedChordSymbol
}

export const getScalePitchClasses = (keyPc: PitchClass, scaleId: ScaleId): PitchClass[] =>
  Scale.get(`${SHARP_NOTE_LABELS[normalizePc(keyPc)]} ${SCALE_NAME_BY_ID[scaleId]}`)
    .notes.map((noteName) => Note.chroma(noteName))
    .filter((value): value is number => value !== undefined)
    .map((value) => normalizePc(value))

export const getChordPitchClasses = (chordSymbol: string): PitchClass[] =>
  getResolvedChord(chordSymbol)
    .notes.map((noteName) => Note.chroma(noteName))
    .filter((value): value is number => value !== undefined)
    .map((value) => normalizePc(value))

const getChordToneDegrees = (chordSymbol: string): Set<number> => {
  const intervalDegrees = getResolvedChord(chordSymbol).intervals.map(getIntervalDegree)
  const chordToneDegrees = new Set([1, 3, 5, 7])

  // sus2 / sus4 は 3rd の代わりに 2nd / 4th が骨格音になるので chord tone として扱う。
  if (!intervalDegrees.includes(3)) {
    if (intervalDegrees.includes(2)) {
      chordToneDegrees.add(2)
    }
    if (intervalDegrees.includes(4)) {
      chordToneDegrees.add(4)
    }
  }

  return chordToneDegrees
}

export const getChordTonePitchClasses = (chordSymbol: string): PitchClass[] => {
  const parsed = getResolvedChord(chordSymbol)
  const chordToneDegrees = getChordToneDegrees(chordSymbol)

  return parsed.intervals
    .map((interval, index) => ({
      intervalDegree: getIntervalDegree(interval),
      noteName: parsed.notes[index],
    }))
    .filter(({ intervalDegree, noteName }) => {
      return chordToneDegrees.has(intervalDegree) && noteName !== undefined
    })
    .map(({ noteName }) => Note.chroma(noteName))
    .filter((value): value is number => value !== undefined)
    .map((value) => normalizePc(value))
}

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
