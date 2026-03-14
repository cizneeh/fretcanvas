import type { AppLocale } from '../i18n/config'
import {
  getDefaultStrings,
  getMatchingInstrumentPresetId,
  getPitchClassFromTuningName,
  getStringInfoFromPitchClass,
} from '../libs/tuning'
import type { FretboardStoreState } from './fretboardStore'
import { createHistorySnapshot, type HistorySnapshot } from './historySnapshot'
import type { SettingsStoreState } from './settingsStore'

const HISTORY_STORAGE_KEY = 'fretmap:history:v1'

export type PersistedHistory = {
  current: HistorySnapshot
  locale?: AppLocale
}

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

  return strings.map((stringInfo, stringIndex) => {
    const candidate = stringInfo as
      | {
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
    return getStringInfoFromPitchClass(stringIndex, pitchClass)
  })
}

const normalizePersistedHistory = (value: unknown): PersistedHistory | undefined => {
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
        noteTextMode: rawFretboard.noteTextMode ?? 'interval',
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
        locale: candidate.locale === 'ja' || candidate.locale === 'en' ? candidate.locale : 'en',
      },
    ),
    locale: candidate.locale === 'ja' || candidate.locale === 'en' ? candidate.locale : undefined,
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
