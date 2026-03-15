import { Key } from 'tonal'
import {
  getChordIntervalLabelFromRoot,
  getChordPitchClasses,
  getChordRootPc,
  getChordToneLabel,
  getChordTonePitchClasses,
  getPreferredMajorKeyTonic,
  getScaleIntervalLabelFromRoot,
  getScalePitchClasses,
} from './chordAnalysis'
import {
  type NoteLabelMode,
  type NoteTextMode,
  type NoteVisualRole,
  normalizePc,
  type PitchClass,
  type ScaleId,
} from './musicCore'

export type DisplayedNoteLabel = {
  primary: string
  secondary?: string
}

const SHARP_NOTE_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTE_LABELS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export const SCALE_LABELS: Record<ScaleId, string> = {
  major: 'Major',
  naturalMinor: 'Natural Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
  harmonicMinor: 'Harmonic Minor',
  melodicMinor: 'Melodic Minor',
  blues: 'Blues',
  ionian: 'Ionian',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  aeolian: 'Aeolian',
  locrian: 'Locrian',
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
): DisplayedNoteLabel => {
  const absoluteLabel = getAbsoluteNoteLabelByKey(pitchClass, keyPc)
  const intervalLabel =
    noteLabelMode === 'chord' && appliedChordSymbol !== undefined
      ? getChordToneLabel(pitchClass, appliedChordSymbol)
      : noteLabelMode === 'scale'
        ? getScaleIntervalLabelFromRoot(pitchClass, keyPc)
        : getChordIntervalLabelFromRoot(pitchClass, keyPc)

  if (noteTextMode === 'absolute') {
    return { primary: absoluteLabel }
  }

  if (noteTextMode === 'interval') {
    return { primary: intervalLabel }
  }

  return {
    primary: absoluteLabel,
    secondary: intervalLabel,
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
