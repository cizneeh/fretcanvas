import { create } from 'zustand'
import {
  type BendArrow,
  type BendId,
  type Connection,
  type ConnectionId,
  FRET_COUNT,
  getBendId,
  getChordPitchClasses,
  getConnectionId,
  getScalePitchClasses,
  type HighlightedNote,
  type NoteLabelMode,
  type NoteTextMode,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  parseChordInput,
  type ScaleId,
  toPositionId,
} from '../libs/model'
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
  // 入力欄の文字列をそのまま表示や追加処理の基準にすると、打ちかけの不完全な文字列や
  // 一時的なパース失敗で UI 全体が不安定になる。
  // そのため、編集中の chordInput と、表示・色分け・export・Add Chord Tones の基準になる
  // 確定済みの activeChordSymbol を分けて持つ。
  activeChordSymbol: string | undefined
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
  setActiveChordSymbol: (nextChordSymbol: string | undefined) => void
  setChordInput: (nextChordInput: string) => void
  applyChordInput: () => void
  addScaleNotes: (options?: AddNotesOptions) => void
  addActiveChordNotes: (options?: AddNotesOptions) => void
  clearHighlightedNotes: () => void
  togglePosition: (positionId: PositionId) => void
  toggleNoteDimmed: (positionId: PositionId) => void
  removePositions: (positionIds: PositionId[]) => void
  setNotesDimmed: (positionIds: PositionId[], isDimmed: boolean) => void
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

    for (const [stringIndex, stringInfo] of OPEN_STRINGS.entries()) {
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
    activeChordSymbol: undefined,
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

    setActiveChordSymbol: (nextChordSymbol) => {
      const current = get()
      const nextChordInput = nextChordSymbol ?? ''
      if (current.activeChordSymbol === nextChordSymbol && current.chordInput === nextChordInput) {
        return
      }

      pushHistoryBeforeChange()
      set({ activeChordSymbol: nextChordSymbol, chordInput: nextChordInput })
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
      if ('error' in parsed) {
        return
      }

      if (current.activeChordSymbol === parsed.symbol) {
        if (current.chordInput !== parsed.symbol) {
          set({ chordInput: parsed.symbol })
        }
        return
      }

      // chordInput を直接参照して各 UI を動かすのではなく、Apply を境に activeChordSymbol へ昇格させる。
      // これで、入力途中でも現在の表示基準は維持される。
      pushHistoryBeforeChange()
      set({
        activeChordSymbol: parsed.symbol,
        chordInput: parsed.symbol,
      })
    },

    addScaleNotes: (options) => {
      const { keyPc, selectedScale, displayedNotes } = get()
      if (selectedScale === undefined) {
        return
      }

      const pcsToAdd = new Set(getScalePitchClasses(keyPc, selectedScale))
      const next = addPitchClassNotes(pcsToAdd, displayedNotes, options)
      if (next === undefined) {
        return
      }

      pushHistoryBeforeChange()
      set({ displayedNotes: next })
    },

    addActiveChordNotes: (options) => {
      const { activeChordSymbol, displayedNotes } = get()
      if (activeChordSymbol === undefined) {
        return
      }

      const pitchClasses = new Set<PitchClass>(getChordPitchClasses(activeChordSymbol))
      const next = addPitchClassNotes(pitchClasses, displayedNotes, options)
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
