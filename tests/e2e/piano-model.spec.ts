import { expect, test } from '@playwright/test'
import {
  EMPTY_PIANO_NOTE,
  getGuitarPitch,
  getPianoLayout,
  guitarToPianoNotes,
  normalizePianoRange,
  pianoToGuitarNotes,
} from '../../src/libs/piano'
import { getDefaultStrings, getInstrumentPresetStrings } from '../../src/libs/tuning'
import { normalizePersistedHistory } from '../../src/stores/historyPersistence'

test('two octaves have the real 2-3-2-3 black-key pattern', () => {
  const layout = getPianoLayout(48, 72)
  expect(layout.keys).toHaveLength(25)
  expect(layout.keys.filter((key) => !key.isBlack)).toHaveLength(15)
  expect(layout.keys.filter((key) => key.isBlack).map((key) => key.midi)).toEqual([
    49, 51, 54, 56, 58, 61, 63, 66, 68, 70,
  ])
  expect(layout.keys.find((key) => key.midi === 49)?.x).toBe(45)
  expect(layout.keys.at(-1)?.x).toBe(896)
  expect(normalizePianoRange(108, 7)).toEqual({ startMidi: 96, octaves: 1, endMidi: 108 })
})

test('C4 transfers to all five C4 guitar positions, never C3 or C5', () => {
  const strings = getDefaultStrings()
  const displayed = pianoToGuitarNotes(strings, { 60: EMPTY_PIANO_NOTE })
  expect(Object.keys(displayed)).toEqual(['1:1', '2:5', '3:10', '4:15', '5:20'])
  expect(Object.keys(displayed).map((id) => getGuitarPitch(strings, id))).toEqual([
    60, 60, 60, 60, 60,
  ])
  expect(guitarToPianoNotes(strings, displayed, {})).toEqual({ 60: EMPTY_PIANO_NOTE })
})

test('unplayable pitches survive a guitar round trip, deleted playable pitches do not', () => {
  const strings = getDefaultStrings()
  const notes = { 21: EMPTY_PIANO_NOTE, 60: EMPTY_PIANO_NOTE, 108: EMPTY_PIANO_NOTE }
  expect(guitarToPianoNotes(strings, {}, notes)).toEqual({
    21: EMPTY_PIANO_NOTE,
    108: EMPTY_PIANO_NOTE,
  })
})

test('different unison decorations merge without losing an emphasized note', () => {
  const notes = guitarToPianoNotes(
    getDefaultStrings(),
    {
      '1:1': { ...EMPTY_PIANO_NOTE, positionId: '1:1', isDimmed: true },
      '2:5': { ...EMPTY_PIANO_NOTE, positionId: '2:5', isEmphasized: true },
    },
    {},
  )
  expect(notes[60]).toMatchObject({ isDimmed: false, isEmphasized: true })
})

test('legacy saves gain real guitar, bass, and reentrant ukulele octaves', () => {
  for (const [preset, expected] of [
    ['guitarStandard6', [64, 59, 55, 50, 45, 40]],
    ['bass4', [43, 38, 33, 28]],
    ['ukuleleC', [69, 64, 60, 67]],
  ] as const) {
    const strings = getInstrumentPresetStrings(preset).map(({ midi: _midi, ...string }) => string)
    const result = normalizePersistedHistory({
      current: {
        fretboard: { strings, displayedNotes: { '0:0': { positionId: '0:0' } } },
        settings: {},
      },
    })
    expect(result?.current.fretboard.strings.map((string) => string.midi)).toEqual(expected)
    expect(result?.current.fretboard.displayedNotes['0:0']).toBeDefined()
    expect(result?.current.piano.startMidi).toBe(48)
  }
})
