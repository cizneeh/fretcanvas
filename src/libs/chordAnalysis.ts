import { Chord, ChordType, Key, Note, Scale } from 'tonal'
import {
  CHORD_INTERVAL_LABELS,
  type ChordInputErrorKey,
  normalizePc,
  type PitchClass,
  SCALE_INTERVAL_LABELS,
  type ScaleId,
} from './musicCore'

const SHARP_NOTE_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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

const SCALE_NAME_BY_ID: Record<ScaleId, string> = {
  major: 'major',
  naturalMinor: 'minor',
  pentatonicMajor: 'major pentatonic',
  pentatonicMinor: 'minor pentatonic',
  harmonicMinor: 'harmonic minor',
  melodicMinor: 'melodic minor',
  blues: 'blues',
  ionian: 'ionian',
  dorian: 'dorian',
  phrygian: 'phrygian',
  lydian: 'lydian',
  mixolydian: 'mixolydian',
  aeolian: 'aeolian',
  locrian: 'locrian',
}

const SCALE_INTERVAL_LABEL_OVERRIDES: Partial<
  Record<ScaleId, Partial<Record<PitchClass, string>>>
> = {
  lydian: { 6: '#4' },
  locrian: { 6: 'b5' },
  blues: { 6: 'b5' },
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

export const getScaleIntervalLabelFromRoot = (
  pitchClass: PitchClass,
  rootPc: PitchClass,
  scaleId: ScaleId | undefined,
): string => {
  const intervalFromRoot = normalizePc(pitchClass - rootPc)
  const override = scaleId === undefined ? undefined : SCALE_INTERVAL_LABEL_OVERRIDES[scaleId]
  return override?.[intervalFromRoot] ?? SCALE_INTERVAL_LABELS[intervalFromRoot]
}

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

export const getChordRootPc = (chordSymbol: string): PitchClass | undefined => {
  const tonic = getResolvedChord(chordSymbol).tonic
  if (tonic === null) {
    return undefined
  }
  const chroma = Note.chroma(tonic)
  return chroma === undefined ? undefined : normalizePc(chroma)
}

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

export const getPreferredMajorKeyTonic = (keyPc: PitchClass): string => {
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
