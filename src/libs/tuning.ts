import { Note } from 'tonal'
import type { InstrumentPreset, InstrumentPresetId, StringInfo, TuningNoteName } from './musicCore'
import { normalizePc } from './musicCore'

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

const MIN_TUNING_MIDI = 12
const MAX_TUNING_MIDI = 95

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
