import { create } from 'zustand'
import { getChordPitchClasses, getScalePitchClasses, parseChordInput } from '../libs/chordAnalysis'
import {
  type BendArrow,
  type BendId,
  type Connection,
  type ConnectionId,
  FRET_COUNT,
  getBendId,
  getConnectionId,
  type HighlightedNote,
  type InstrumentPresetId,
  type NoteLabelMode,
  type NoteTextMode,
  normalizePc,
  type PitchClass,
  type PositionId,
  type ScaleId,
  type StringInfo,
  toPositionId,
} from '../libs/musicCore'
import {
  getDefaultStrings,
  getInstrumentPresetStrings,
  getMatchingInstrumentPresetId,
  getStringInfoFromMidi,
  getTuningMidi,
  getTuningOctaveFromMidi,
  stringInfoArraysEqual,
  type TuningNoteName,
} from '../libs/tuning'
import { useHistoryStore } from './historyStore'

type AddNotesOptions = {
  fretRange:
    | {
        start: number
        end: number
      }
    | undefined
}

export type FretboardStoreState = {
  keyPc: PitchClass
  selectedScale: ScaleId | undefined
  noteLabelMode: NoteLabelMode
  noteTextMode: NoteTextMode
  strings: StringInfo[]
  draftStrings: StringInfo[]
  draftPresetId: InstrumentPresetId | 'custom'
  // 入力欄の文字列をそのまま表示や追加処理の基準にすると、打ちかけの不完全な文字列や
  // 一時的なパース失敗で UI 全体が不安定になる。
  // そのため、編集中の chordInput と、表示・色分け・export・Add Chord Tones の基準になる
  // 確定済みの appliedChordSymbol を分けて持つ。
  appliedChordSymbol: string | undefined
  chordInput: string
  displayedNotes: Record<PositionId, HighlightedNote>
  connections: Record<ConnectionId, Connection>
  bends: Record<BendId, BendArrow>
}

export type FretboardStoreActions = {
  setKeyPc: (nextKeyPc: PitchClass) => void
  setSelectedScale: (nextScale: ScaleId | undefined) => void
  setNoteLabelMode: (nextMode: NoteLabelMode) => void
  setNoteTextMode: (nextMode: NoteTextMode) => void
  setDraftPreset: (nextPresetId: InstrumentPresetId | 'custom') => void
  setDraftStringCount: (nextCount: number) => void
  setDraftStringNote: (stringIndex: number, nextNote: TuningNoteName) => void
  setDraftStringOctave: (stringIndex: number, nextOctave: number) => void
  resetDraftStrings: () => void
  applyDraftStrings: () => void
  setAppliedChordSymbol: (nextChordSymbol: string | undefined) => void
  setChordInput: (nextChordInput: string) => void
  applyChordInput: () => void
  addScaleNotes: (options?: AddNotesOptions) => void
  addAppliedChordNotes: (options?: AddNotesOptions) => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  toggleNoteDimmed: (positionId: PositionId) => void
  toggleNoteEmphasized: (positionId: PositionId) => void
  removePositions: (positionIds: PositionId[]) => void
  setNotesDimmed: (positionIds: PositionId[], isDimmed: boolean) => void
  setNotesEmphasized: (positionIds: PositionId[], isEmphasized: boolean) => void
  connectPositions: (from: PositionId, to: PositionId) => void
  removeConnection: (connectionId: ConnectionId) => void
  removeConnectionsByPosition: (positionId: PositionId) => void
  upsertBendFromPosition: (from: PositionId) => void
  removeBend: (bendId: BendId) => void
  removeBendByFromPosition: (from: PositionId) => void
}

export type FretboardStore = FretboardStoreState & FretboardStoreActions

export const useFretboardStore = create<FretboardStore>((set, get) => {
  const pushHistoryBeforeChange = () => {
    useHistoryStore.getState().pushBeforeChange()
  }
  const defaultStrings = getDefaultStrings()
  const defaultPresetId = getMatchingInstrumentPresetId(defaultStrings) ?? 'custom'
  const clampStringCount = (value: number) => Math.max(4, Math.min(value, 8))
  const buildExtendedDraftStrings = (
    sourceStrings: StringInfo[],
    nextCount: number,
  ): StringInfo[] => {
    const trimmedStrings = sourceStrings
      .slice(0, clampStringCount(nextCount))
      .map((stringInfo, stringIndex) => getStringInfoFromMidi(stringIndex, stringInfo.midi))

    while (trimmedStrings.length < clampStringCount(nextCount)) {
      const previousMidi = trimmedStrings.at(-1)?.midi ?? defaultStrings.at(-1)?.midi ?? 40
      trimmedStrings.push(getStringInfoFromMidi(trimmedStrings.length, previousMidi - 5))
    }

    return trimmedStrings
  }

  const getNextConnectionsWithoutPositions = (
    connections: Record<ConnectionId, Connection>,
    positionIds: Set<PositionId>,
  ): Record<ConnectionId, Connection> => {
    return Object.fromEntries(
      Object.entries(connections).filter(([, connection]) => {
        return !positionIds.has(connection.from) && !positionIds.has(connection.to)
      }),
    ) as Record<ConnectionId, Connection>
  }

  const getNextBendsWithoutPositions = (
    bends: Record<BendId, BendArrow>,
    positionIds: Set<PositionId>,
  ): Record<BendId, BendArrow> => {
    return Object.fromEntries(
      Object.entries(bends).filter(([, bend]) => {
        return !positionIds.has(bend.from)
      }),
    ) as Record<BendId, BendArrow>
  }

  const addPitchClassNotes = (
    pitchClasses: Set<PitchClass>,
    displayedNotes: Record<PositionId, HighlightedNote>,
    strings: StringInfo[],
    options: AddNotesOptions | undefined,
  ): Record<PositionId, HighlightedNote> | undefined => {
    const next: Record<PositionId, HighlightedNote> = { ...displayedNotes }
    let didChange = false
    const minFret =
      options?.fretRange !== undefined
        ? Math.min(options.fretRange.start, options.fretRange.end)
        : 0
    const maxFret =
      options?.fretRange !== undefined
        ? Math.max(options.fretRange.start, options.fretRange.end)
        : FRET_COUNT

    for (const [stringIndex, stringInfo] of strings.entries()) {
      for (let fret = minFret; fret <= maxFret; fret += 1) {
        const midi = stringInfo.midi + fret
        const pitchClass = normalizePc(midi)

        if (pitchClasses.has(pitchClass)) {
          const positionId = toPositionId({
            stringIndex,
            fret,
          })
          if (next[positionId] === undefined) {
            next[positionId] = {
              positionId,
              isDimmed: false,
              isEmphasized: false,
              colorVariant: 'default',
            }
            didChange = true
          }
        }
      }
    }

    if (!didChange) {
      return undefined
    }

    return next
  }

  return {
    keyPc: 0,
    selectedScale: 'major',
    noteLabelMode: 'scale',
    noteTextMode: 'interval',
    strings: defaultStrings,
    draftStrings: defaultStrings,
    draftPresetId: defaultPresetId,
    appliedChordSymbol: undefined,
    chordInput: '',
    displayedNotes: {},
    connections: {},
    bends: {},

    setKeyPc: (nextKeyPc) => {
      const current = get()
      if (current.keyPc === nextKeyPc) {
        return
      }

      pushHistoryBeforeChange()
      set({ keyPc: nextKeyPc })
    },

    setSelectedScale: (nextScale) => {
      const current = get()
      if (current.selectedScale === nextScale) {
        return
      }

      pushHistoryBeforeChange()
      set({ selectedScale: nextScale })
    },

    setNoteLabelMode: (nextMode) => {
      const current = get()
      if (current.noteLabelMode === nextMode) {
        return
      }

      pushHistoryBeforeChange()
      set({ noteLabelMode: nextMode })
    },

    setNoteTextMode: (nextMode) => {
      const current = get()
      if (current.noteTextMode === nextMode) {
        return
      }

      pushHistoryBeforeChange()
      set({ noteTextMode: nextMode })
    },

    setDraftPreset: (nextPresetId) => {
      if (nextPresetId === 'custom') {
        set({ draftPresetId: 'custom' })
        return
      }

      set({
        draftPresetId: nextPresetId,
        draftStrings: getInstrumentPresetStrings(nextPresetId),
      })
    },

    setDraftStringCount: (nextCount) => {
      const current = get()
      const clampedCount = clampStringCount(nextCount)
      const nextStrings = buildExtendedDraftStrings(current.draftStrings, clampedCount)
      if (
        current.draftPresetId === (getMatchingInstrumentPresetId(nextStrings) ?? 'custom') &&
        stringInfoArraysEqual(current.draftStrings, nextStrings)
      ) {
        return
      }

      set({
        draftPresetId: getMatchingInstrumentPresetId(nextStrings) ?? 'custom',
        draftStrings: nextStrings,
      })
    },

    setDraftStringNote: (stringIndex, nextNote) => {
      const current = get()
      const currentString = current.draftStrings[stringIndex]
      if (currentString === undefined) {
        return
      }

      const nextMidi = getTuningMidi(nextNote, getTuningOctaveFromMidi(currentString.midi))
      if (currentString.midi === nextMidi && currentString.name === nextNote) {
        return
      }

      const nextDraftStrings = current.draftStrings.map((stringInfo, index) =>
        index === stringIndex ? getStringInfoFromMidi(index, nextMidi) : stringInfo,
      )

      set({
        draftPresetId: getMatchingInstrumentPresetId(nextDraftStrings) ?? 'custom',
        draftStrings: nextDraftStrings,
      })
    },

    setDraftStringOctave: (stringIndex, nextOctave) => {
      const current = get()
      const currentString = current.draftStrings[stringIndex]
      if (currentString === undefined) {
        return
      }

      const nextMidi = getTuningMidi(currentString.name as TuningNoteName, nextOctave)
      if (currentString.midi === nextMidi) {
        return
      }

      const nextDraftStrings = current.draftStrings.map((stringInfo, index) =>
        index === stringIndex ? getStringInfoFromMidi(index, nextMidi) : stringInfo,
      )

      set({
        draftPresetId: getMatchingInstrumentPresetId(nextDraftStrings) ?? 'custom',
        draftStrings: nextDraftStrings,
      })
    },

    resetDraftStrings: () => {
      const current = get()
      const nextDraftStrings = current.strings.map((stringInfo, stringIndex) =>
        getStringInfoFromMidi(stringIndex, stringInfo.midi),
      )
      const nextPresetId = getMatchingInstrumentPresetId(current.strings) ?? 'custom'

      if (
        current.draftPresetId === nextPresetId &&
        stringInfoArraysEqual(current.draftStrings, nextDraftStrings)
      ) {
        return
      }

      set({
        draftPresetId: nextPresetId,
        draftStrings: nextDraftStrings,
      })
    },

    applyDraftStrings: () => {
      const current = get()
      if (stringInfoArraysEqual(current.strings, current.draftStrings)) {
        return
      }

      pushHistoryBeforeChange()
      set({
        strings: current.draftStrings.map((stringInfo, stringIndex) =>
          getStringInfoFromMidi(stringIndex, stringInfo.midi),
        ),
        displayedNotes: {},
        connections: {},
        bends: {},
      })
    },

    setAppliedChordSymbol: (nextChordSymbol) => {
      const current = get()
      const nextChordInput = nextChordSymbol ?? ''
      if (current.appliedChordSymbol === nextChordSymbol && current.chordInput === nextChordInput) {
        return
      }

      pushHistoryBeforeChange()
      set({ appliedChordSymbol: nextChordSymbol, chordInput: nextChordInput })
    },

    setChordInput: (nextChordInput) => {
      const current = get()
      if (current.chordInput === nextChordInput) {
        return
      }

      set({ chordInput: nextChordInput })
    },

    applyChordInput: () => {
      const current = get()
      const parsed = parseChordInput(current.chordInput)
      if ('errorKey' in parsed) {
        return
      }

      if (current.appliedChordSymbol === parsed.symbol) {
        if (current.chordInput !== parsed.symbol) {
          set({ chordInput: parsed.symbol })
        }
        return
      }

      // chordInput を直接参照して各 UI を動かすのではなく、Apply を境に appliedChordSymbol へ昇格させる。
      // これで、入力途中でも現在の表示基準は維持される。
      pushHistoryBeforeChange()
      set({
        appliedChordSymbol: parsed.symbol,
        chordInput: parsed.symbol,
      })
    },

    addScaleNotes: (options) => {
      const { keyPc, selectedScale, displayedNotes, strings } = get()
      if (selectedScale === undefined) {
        return
      }

      const pcsToAdd = new Set(getScalePitchClasses(keyPc, selectedScale))
      const next = addPitchClassNotes(pcsToAdd, displayedNotes, strings, options)
      if (next === undefined) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    addAppliedChordNotes: (options) => {
      const { appliedChordSymbol, displayedNotes, strings } = get()
      if (appliedChordSymbol === undefined) {
        return
      }

      const pitchClasses = new Set<PitchClass>(getChordPitchClasses(appliedChordSymbol))
      const next = addPitchClassNotes(pitchClasses, displayedNotes, strings, options)
      if (next === undefined) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    clearHighlightedNotes: () => {
      const current = get()
      if (
        Object.keys(current.displayedNotes).length === 0 &&
        Object.keys(current.connections).length === 0 &&
        Object.keys(current.bends).length === 0
      ) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: {}, connections: {}, bends: {} })
    },

    togglePosition: (positionId) => {
      const current = get()
      const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
      let nextConnections = current.connections
      let nextBends = current.bends

      if (next[positionId] !== undefined) {
        delete next[positionId]
        const filteredEntries = Object.entries(current.connections).filter(([, connection]) => {
          return connection.from !== positionId && connection.to !== positionId
        })
        nextConnections = Object.fromEntries(filteredEntries) as Record<ConnectionId, Connection>
        const bendId = getBendId(positionId)
        if (nextBends[bendId] !== undefined) {
          nextBends = { ...nextBends }
          delete nextBends[bendId]
        }
      } else {
        next[positionId] = {
          positionId,
          isDimmed: false,
          isEmphasized: false,
          colorVariant: 'default',
        }
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next, connections: nextConnections, bends: nextBends })
    },

    toggleNoteDimmed: (positionId) => {
      const current = get()
      const currentNote = current.displayedNotes[positionId]
      if (currentNote === undefined) {
        return
      }

      const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
      next[positionId] = {
        ...currentNote,
        isDimmed: !currentNote.isDimmed,
        isEmphasized: currentNote.isDimmed ? currentNote.isEmphasized : false,
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    toggleNoteEmphasized: (positionId) => {
      const current = get()
      const currentNote = current.displayedNotes[positionId]
      if (currentNote === undefined) {
        return
      }

      const next: Record<PositionId, HighlightedNote> = { ...current.displayedNotes }
      next[positionId] = {
        ...currentNote,
        isDimmed: currentNote.isEmphasized ? currentNote.isDimmed : false,
        isEmphasized: !currentNote.isEmphasized,
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    removePositions: (positionIds) => {
      if (positionIds.length === 0) {
        return
      }

      const current = get()
      const positionIdSet = new Set(positionIds)
      const nextDisplayedNotes = { ...current.displayedNotes }
      let didChange = false

      for (const positionId of positionIdSet) {
        if (nextDisplayedNotes[positionId] === undefined) {
          continue
        }

        delete nextDisplayedNotes[positionId]
        didChange = true
      }

      if (!didChange) {
        return
      }

      pushHistoryBeforeChange()
      set({
        displayedNotes: nextDisplayedNotes,
        connections: getNextConnectionsWithoutPositions(current.connections, positionIdSet),
        bends: getNextBendsWithoutPositions(current.bends, positionIdSet),
      })
    },

    setNotesDimmed: (positionIds, isDimmed) => {
      if (positionIds.length === 0) {
        return
      }

      const current = get()
      const nextDisplayedNotes = { ...current.displayedNotes }
      let didChange = false

      for (const positionId of positionIds) {
        const currentNote = nextDisplayedNotes[positionId]
        if (currentNote === undefined || currentNote.isDimmed === isDimmed) {
          continue
        }

        nextDisplayedNotes[positionId] = {
          ...currentNote,
          isDimmed,
          isEmphasized: isDimmed ? false : currentNote.isEmphasized,
        }
        didChange = true
      }

      if (!didChange) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: nextDisplayedNotes })
    },

    setNotesEmphasized: (positionIds, isEmphasized) => {
      if (positionIds.length === 0) {
        return
      }

      const current = get()
      const nextDisplayedNotes = { ...current.displayedNotes }
      let didChange = false

      for (const positionId of positionIds) {
        const currentNote = nextDisplayedNotes[positionId]
        if (currentNote === undefined || currentNote.isEmphasized === isEmphasized) {
          continue
        }

        nextDisplayedNotes[positionId] = {
          ...currentNote,
          isDimmed: isEmphasized ? false : currentNote.isDimmed,
          isEmphasized,
        }
        didChange = true
      }

      if (!didChange) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: nextDisplayedNotes })
    },

    connectPositions: (from, to) => {
      if (from === to) {
        return
      }

      const current = get()
      const connectionId = getConnectionId(from, to)
      if (current.connections[connectionId] !== undefined) {
        return
      }

      pushHistoryBeforeChange()
      set({
        connections: {
          ...current.connections,
          [connectionId]: {
            id: connectionId,
            from,
            to,
          },
        },
      })
    },

    removeConnection: (connectionId) => {
      const current = get()
      if (current.connections[connectionId] === undefined) {
        return
      }

      const nextConnections = { ...current.connections }
      delete nextConnections[connectionId]

      pushHistoryBeforeChange()
      set({ connections: nextConnections })
    },

    removeConnectionsByPosition: (positionId) => {
      const current = get()
      const nextEntries = Object.entries(current.connections).filter(([, connection]) => {
        return connection.from !== positionId && connection.to !== positionId
      })
      const nextConnections = Object.fromEntries(nextEntries) as Record<ConnectionId, Connection>

      if (Object.keys(nextConnections).length === Object.keys(current.connections).length) {
        return
      }

      pushHistoryBeforeChange()
      set({ connections: nextConnections })
    },

    upsertBendFromPosition: (from) => {
      const current = get()
      if (current.displayedNotes[from] === undefined) {
        return
      }

      const bendId = getBendId(from)
      const nextBends = {
        ...current.bends,
        [bendId]: {
          id: bendId,
          from,
        },
      }

      const currentBend = current.bends[bendId]
      if (currentBend !== undefined && currentBend.from === from) {
        return
      }

      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },

    removeBend: (bendId) => {
      const current = get()
      if (current.bends[bendId] === undefined) {
        return
      }

      const nextBends = { ...current.bends }
      delete nextBends[bendId]
      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },

    removeBendByFromPosition: (from) => {
      const current = get()
      const bendId = getBendId(from)
      if (current.bends[bendId] === undefined) {
        return
      }

      const nextBends = { ...current.bends }
      delete nextBends[bendId]
      pushHistoryBeforeChange()
      set({ bends: nextBends })
    },
  }
})
