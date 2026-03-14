// なんか、historyのbinding? つまりhistoryのキャプチャーするのとアプライするのと
// 永続化コードが一緒になってて若干責務として分離できてないし理解しづらい感じがするけど、まあとりあえずこのままにしておく。

import type { AppLocale } from '../i18n/config'
import {
  getDefaultStrings,
  getMatchingInstrumentPresetId,
  getStringInfoFromMidi,
} from '../libs/model'
import type { FretboardStoreState } from './fretboardStore'
import { useFretboardStore } from './fretboardStore'
import {
  applyHistorySnapshotToActualStores,
  createHistorySnapshot,
  type HistorySnapshot,
} from './historySnapshot'
import { useHistoryStore } from './historyStore'
import type { SettingsStoreState } from './settingsStore'
import { useSettingsStore } from './settingsStore'

const HISTORY_STORAGE_KEY = 'fretmap:history:v1'

type PersistedHistory = {
  current: HistorySnapshot
  locale?: AppLocale
}

let isConfigured = false
let isHydrating = false

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

const normalizeStrings = (
  strings: FretboardStoreState['strings'] | undefined,
): FretboardStoreState['strings'] => {
  if (strings === undefined || strings.length === 0) {
    return getDefaultStrings()
  }

  return strings.map((stringInfo, stringIndex) => {
    const midi =
      typeof stringInfo?.midi === 'number'
        ? stringInfo.midi
        : (getDefaultStrings()[stringIndex]?.midi ?? 40)
    return getStringInfoFromMidi(stringIndex, midi)
  })
}

const captureCurrentSnapshot = (): HistorySnapshot =>
  createHistorySnapshot(useFretboardStore.getState(), useSettingsStore.getState())

const normalizePersistedHistory = (value: unknown): PersistedHistory | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  // TOOO 型チェックとハンドリングをちゃんとやる
  // ローカルストレージからの読み込みでクラッシュするかもしれない。
  // zodでパースして、キャッチしてハンドリングするかな
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
      },
    ),
    locale: candidate.locale === 'ja' || candidate.locale === 'en' ? candidate.locale : undefined,
  }
}

const loadPersistedHistory = (): PersistedHistory | undefined => {
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

/**
 * ローカルストレージに現在のストアの状態を保存する
 * 各ストアから現在のStateを読んでそれを保存する
 */
const persistHistoryToLocalStorage = () => {
  if (typeof window === 'undefined' || isHydrating) {
    return
  }

  const payload: PersistedHistory = {
    current: captureCurrentSnapshot(),
    locale: useSettingsStore.getState().locale,
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload))
}

export const initializeHistoryBindings = () => {
  if (isConfigured) {
    return
  }

  useHistoryStore.getState().configureBindings({
    capture: captureCurrentSnapshot,
    apply: (snapshot) => {
      applyHistorySnapshotToActualStores({
        snapshot,
        setFretboardState: (nextFretboardState) => {
          useFretboardStore.setState(nextFretboardState)
        },
        setSettingsState: (nextSettingsState) => {
          useSettingsStore.setState(nextSettingsState)
        },
      })
    },
  })

  isHydrating = true
  const persisted = loadPersistedHistory()
  if (persisted !== undefined) {
    applyHistorySnapshotToActualStores({
      snapshot: persisted.current,
      setFretboardState: (nextFretboardState) => {
        useFretboardStore.setState(nextFretboardState)
      },
      setSettingsState: (nextSettingsState) => {
        useSettingsStore.setState(nextSettingsState)
      },
    })

    if (persisted.locale !== undefined) {
      useSettingsStore.setState({ locale: persisted.locale })
    }
  }
  isHydrating = false

  useFretboardStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })
  useSettingsStore.subscribe(() => {
    persistHistoryToLocalStorage()
  })

  persistHistoryToLocalStorage()

  isConfigured = true
}
