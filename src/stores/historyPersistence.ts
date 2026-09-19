import { normalizePianoRange, type PianoNotes } from '../libs/piano'
import {
  getDefaultStrings,
  getMatchingInstrumentPresetId,
  getPitchClassFromTuningName,
  getStringInfoFromPitchClass,
  normalizeStringPitches,
} from '../libs/tuning'
import type { FretboardStoreState } from './fretboardStore'
import { createHistorySnapshot, type HistorySnapshot } from './historySnapshot'
import { DEFAULT_PIANO_STATE, type PianoStoreState } from './pianoStore'
import type { SettingsStoreState } from './settingsStore'

const HISTORY_STORAGE_KEY = 'fretmap:history:v1'

export type PersistedHistory = {
  current: HistorySnapshot
}

const normalizeNoteTextMode = (noteTextMode: unknown): FretboardStoreState['noteTextMode'] =>
  noteTextMode === 'absolute' || noteTextMode === 'combined' || noteTextMode === 'interval'
    ? noteTextMode
    : 'interval'

const normalizeDisplayedNotes = (
  displayedNotes: FretboardStoreState['displayedNotes'] | undefined,
): FretboardStoreState['displayedNotes'] =>
  Object.fromEntries(
    Object.entries(displayedNotes ?? {}).map(([positionId, note]) => [
      positionId,
      {
        ...note,
        positionId,
        isDimmed: note?.isDimmed ?? false,
        isEmphasized: note?.isEmphasized ?? false,
        colorVariant: note?.colorVariant ?? 'default',
      },
    ]),
  ) as FretboardStoreState['displayedNotes']

const normalizeStrings = (strings: unknown): FretboardStoreState['strings'] => {
  if (!Array.isArray(strings) || strings.length === 0) {
    return getDefaultStrings()
  }

  const normalized = strings.map((stringInfo, stringIndex) => {
    const candidate = stringInfo as
      | {
          id?: string
          pitchClass?: number
          midi?: number
          name?: string
        }
      | undefined
    const pitchClass =
      typeof candidate?.pitchClass === 'number'
        ? candidate.pitchClass
        : typeof candidate?.midi === 'number'
          ? candidate.midi
          : typeof candidate?.name === 'string'
            ? getPitchClassFromTuningName(
                candidate.name as Parameters<typeof getPitchClassFromTuningName>[0],
              )
            : (getDefaultStrings()[stringIndex]?.pitchClass ?? 4)
    const string = getStringInfoFromPitchClass(
      stringIndex,
      pitchClass,
      typeof candidate?.id === 'string' ? candidate.id : undefined,
      typeof candidate?.name === 'string'
        ? (candidate.name as Parameters<typeof getPitchClassFromTuningName>[0])
        : undefined,
    )
    return { ...string, midi: Number.isInteger(candidate?.midi) ? candidate?.midi : undefined }
  })
  return normalizeStringPitches(normalized as FretboardStoreState['strings'])
}

const normalizePianoState = (value: Partial<PianoStoreState> | undefined): PianoStoreState => {
  const range = normalizePianoRange(value?.startMidi ?? 48, value?.octaves ?? 2)
  const notes: PianoNotes = {}
  for (const [pitch, note] of Object.entries(value?.notes ?? {})) {
    const midi = Number(pitch)
    if (!Number.isInteger(midi) || midi < 0 || midi > 127 || !note) continue
    notes[midi] = {
      isDimmed: note.isDimmed === true,
      isEmphasized: note.isEmphasized === true,
      colorVariant: note.colorVariant ?? 'default',
    }
  }
  const exportStartMidi = Math.max(
    range.startMidi,
    Math.min(
      range.endMidi,
      Number.isInteger(value?.exportStartMidi)
        ? (value?.exportStartMidi ?? range.startMidi)
        : range.startMidi,
    ),
  )
  const exportEndMidi = Math.max(
    exportStartMidi,
    Math.min(
      range.endMidi,
      Number.isInteger(value?.exportEndMidi)
        ? (value?.exportEndMidi ?? range.endMidi)
        : range.endMidi,
    ),
  )
  return {
    ...DEFAULT_PIANO_STATE,
    notes,
    startMidi: range.startMidi,
    octaves: range.octaves,
    exportStartMidi,
    exportEndMidi,
    showOctaveLabels: value?.showOctaveLabels ?? true,
    exportFormat: value?.exportFormat === 'svg' ? 'svg' : 'png',
    activeInstrument: value?.activeInstrument === 'piano' ? 'piano' : 'guitar',
  }
}

export const normalizePersistedHistory = (value: unknown): PersistedHistory | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const candidate = value as Partial<PersistedHistory>
  if (candidate.current === undefined) {
    return undefined
  }

  const rawFretboard = candidate.current.fretboard as Partial<FretboardStoreState>
  const rawSettings = candidate.current.settings as Partial<SettingsStoreState>
  const normalizedStrings = normalizeStrings(rawFretboard.strings)

  return {
    current: createHistorySnapshot(
      {
        keyPc: rawFretboard.keyPc ?? 0,
        selectedScale: rawFretboard.selectedScale,
        noteLabelMode: rawFretboard.noteLabelMode ?? 'scale',
        noteTextMode: normalizeNoteTextMode(rawFretboard.noteTextMode),
        strings: normalizedStrings,
        draftStrings: normalizedStrings,
        draftPresetId: getMatchingInstrumentPresetId(normalizedStrings) ?? 'custom',
        appliedChordSymbol:
          typeof rawFretboard.appliedChordSymbol === 'string'
            ? rawFretboard.appliedChordSymbol
            : undefined,
        chordInput:
          typeof rawFretboard.appliedChordSymbol === 'string'
            ? rawFretboard.appliedChordSymbol
            : '',
        displayedNotes: normalizeDisplayedNotes(rawFretboard.displayedNotes),
        connections: rawFretboard.connections ?? {},
        bends: rawFretboard.bends ?? {},
      },
      {
        exportFretStart: rawSettings.exportFretStart ?? 0,
        exportFretEnd: rawSettings.exportFretEnd ?? 24,
        exportFormat: rawSettings.exportFormat === 'svg' ? 'svg' : 'png',
        backgroundOpacityPercent: rawSettings.backgroundOpacityPercent ?? 0,
        addScaleWithinExportRange: rawSettings.addScaleWithinExportRange ?? true,
        showExportRangeHighlight: rawSettings.showExportRangeHighlight ?? true,
        showExportTitle: rawSettings.showExportTitle ?? false,
        showExportStringLabels: rawSettings.showExportStringLabels ?? true,
      },
      normalizePianoState(candidate.current.piano),
    ),
  }
}

export const loadPersistedHistory = (): PersistedHistory | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
  if (raw === null) {
    return undefined
  }

  try {
    return normalizePersistedHistory(JSON.parse(raw))
  } catch {
    return undefined
  }
}

export const savePersistedHistory = (payload: PersistedHistory) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload))
}
