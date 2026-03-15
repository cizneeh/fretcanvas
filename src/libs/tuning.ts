import type {
  InstrumentPreset,
  InstrumentPresetId,
  PitchClass,
  StringInfo,
  TuningNoteName,
} from './musicCore'
import { normalizePc } from './musicCore'

const CUSTOM_TUNING_PRESETS_STORAGE_KEY = 'fretmap:custom-tuning-presets:v1'

export const TUNING_NOTE_OPTIONS: TuningNoteName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

const TUNING_NOTE_TO_PITCH_CLASS: Record<TuningNoteName, PitchClass> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
}

const DEFAULT_TUNING_NAME_BY_PITCH_CLASS: TuningNoteName[] = [
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

export type CustomTuningPreset = {
  id: string
  name: string
  strings: StringInfo[]
}

const createStringId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `string:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`
}

export const getPitchClassFromTuningName = (note: TuningNoteName): PitchClass =>
  TUNING_NOTE_TO_PITCH_CLASS[note]

export const getTuningNameFromPitchClass = (pitchClass: number): TuningNoteName =>
  DEFAULT_TUNING_NAME_BY_PITCH_CLASS[normalizePc(pitchClass)]

export const createStringInfo = (
  _stringIndex: number,
  note: TuningNoteName,
  existingId: string = createStringId(),
): StringInfo => ({
  id: existingId,
  name: note,
  pitchClass: getPitchClassFromTuningName(note),
})

export const getStringInfoFromPitchClass = (
  stringIndex: number,
  pitchClass: number,
  existingId?: string,
  existingName?: TuningNoteName,
): StringInfo => {
  const normalizedPitchClass = normalizePc(pitchClass)
  return createStringInfo(
    stringIndex,
    existingName !== undefined && getPitchClassFromTuningName(existingName) === normalizedPitchClass
      ? existingName
      : getTuningNameFromPitchClass(normalizedPitchClass),
    existingId,
  )
}

export const cloneStrings = (strings: StringInfo[]): StringInfo[] =>
  strings.map((stringInfo, _stringIndex) => ({
    id: stringInfo.id || createStringId(),
    name: stringInfo.name,
    pitchClass: stringInfo.pitchClass,
  }))

const isTuningNoteName = (value: unknown): value is TuningNoteName =>
  typeof value === 'string' && TUNING_NOTE_OPTIONS.includes(value as TuningNoteName)

const isStringInfo = (value: unknown): value is StringInfo =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as StringInfo).id === 'string' &&
  isTuningNoteName((value as StringInfo).name) &&
  typeof (value as StringInfo).pitchClass === 'number'

const parseCustomTuningPreset = (value: unknown): CustomTuningPreset | undefined => {
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof (value as CustomTuningPreset).id !== 'string' ||
    typeof (value as CustomTuningPreset).name !== 'string' ||
    !Array.isArray((value as CustomTuningPreset).strings)
  ) {
    return undefined
  }

  const strings = (value as CustomTuningPreset).strings
  if (strings.some((stringInfo) => !isStringInfo(stringInfo))) {
    return undefined
  }

  return {
    id: (value as CustomTuningPreset).id,
    name: (value as CustomTuningPreset).name,
    strings: cloneStrings(strings),
  }
}

const createCustomTuningPresetId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `custom:${crypto.randomUUID()}`
  }

  return `custom:${Date.now().toString(36)}`
}

export const loadCustomTuningPresets = (): CustomTuningPreset[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(CUSTOM_TUNING_PRESETS_STORAGE_KEY)
  if (raw === null) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((preset) => parseCustomTuningPreset(preset))
      .filter((preset) => preset !== undefined)
  } catch {
    return []
  }
}

const persistCustomTuningPresets = (presets: CustomTuningPreset[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CUSTOM_TUNING_PRESETS_STORAGE_KEY, JSON.stringify(presets))
}

export const saveCustomTuningPreset = (
  name: string,
  strings: StringInfo[],
): CustomTuningPreset[] => {
  const trimmedName = name.trim()
  if (trimmedName.length === 0) {
    return loadCustomTuningPresets()
  }

  const presets = loadCustomTuningPresets()
  const existingPreset = presets.find((preset) => preset.name === trimmedName)
  const nextPreset: CustomTuningPreset = {
    id: existingPreset?.id ?? createCustomTuningPresetId(),
    name: trimmedName,
    strings: cloneStrings(strings),
  }
  const nextPresets = existingPreset
    ? presets.map((preset) => (preset.id === existingPreset.id ? nextPreset : preset))
    : [...presets, nextPreset]

  persistCustomTuningPresets(nextPresets)
  return nextPresets
}

export const deleteCustomTuningPreset = (presetId: string): CustomTuningPreset[] => {
  const presets = loadCustomTuningPresets()
  const nextPresets = presets.filter((preset) => preset.id !== presetId)
  persistCustomTuningPresets(nextPresets)
  return nextPresets
}

export const getMatchingCustomTuningPresetId = (
  strings: StringInfo[],
  presets: CustomTuningPreset[],
): string | undefined =>
  presets.find((preset) => stringInfoArraysEqual(strings, preset.strings))?.id

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
