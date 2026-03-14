import type {
  InstrumentPreset,
  InstrumentPresetId,
  PitchClass,
  StringInfo,
  TuningNoteName,
} from './musicCore'
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

export const INSTRUMENT_PRESETS: InstrumentPreset[] = [
  {
    id: 'guitarStandard6',
    strings: ['E', 'B', 'G', 'D', 'A', 'E'],
  },
  {
    id: 'guitarHalfStepDown6',
    strings: ['Eb', 'Bb', 'Gb', 'Db', 'Ab', 'Eb'],
  },
  {
    id: 'guitar7',
    strings: ['E', 'B', 'G', 'D', 'A', 'E', 'B'],
  },
  {
    id: 'bass4',
    strings: ['G', 'D', 'A', 'E'],
  },
  {
    id: 'bass5',
    strings: ['G', 'D', 'A', 'E', 'B'],
  },
  {
    id: 'bass6',
    strings: ['C', 'G', 'D', 'A', 'E', 'B'],
  },
  {
    id: 'ukuleleC',
    strings: ['A', 'E', 'C', 'G'],
  },
] as const

const toStringId = (stringIndex: number) => String(stringIndex + 1)

export const getPitchClassFromTuningName = (note: TuningNoteName): PitchClass =>
  TUNING_NOTE_OPTIONS.indexOf(note)

export const getTuningNameFromPitchClass = (pitchClass: number): TuningNoteName =>
  TUNING_NOTE_OPTIONS[normalizePc(pitchClass)]

export const createStringInfo = (stringIndex: number, note: TuningNoteName): StringInfo => ({
  id: toStringId(stringIndex),
  name: note,
  pitchClass: getPitchClassFromTuningName(note),
})

export const getStringInfoFromPitchClass = (
  stringIndex: number,
  pitchClass: number,
): StringInfo => {
  const normalizedPitchClass = normalizePc(pitchClass)
  return {
    id: toStringId(stringIndex),
    name: getTuningNameFromPitchClass(normalizedPitchClass),
    pitchClass: normalizedPitchClass,
  }
}

export const cloneStrings = (strings: StringInfo[]): StringInfo[] =>
  strings.map((stringInfo, stringIndex) => ({
    id: toStringId(stringIndex),
    name: stringInfo.name,
    pitchClass: stringInfo.pitchClass,
  }))

export const getInstrumentPresetStrings = (presetId: InstrumentPresetId): StringInfo[] => {
  const preset = INSTRUMENT_PRESETS.find((candidate) => candidate.id === presetId)
  if (preset === undefined) {
    return []
  }

  return preset.strings.map((note, stringIndex) => createStringInfo(stringIndex, note))
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
      return (
        stringInfo !== undefined &&
        stringInfo.name === presetString.name &&
        stringInfo.pitchClass === presetString.pitchClass
      )
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
      leftString.pitchClass === rightString.pitchClass
    )
  })
