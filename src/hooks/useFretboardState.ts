import { useState } from 'react'
import {
  FRET_NUMBERS,
  getPositionId,
  normalizePc,
  OPEN_STRINGS,
  type PitchClass,
  type PositionId,
  SCALE_INTERVALS,
  type ScaleId,
} from '../libs/model'

export const useFretboardState = () => {
  const [keyPc, setKeyPc] = useState<PitchClass>(0)
  const [selectedScale, setSelectedScale] = useState<ScaleId | undefined>('major')
  const [highlightedPositions, setHighlightedPositions] = useState<Set<PositionId>>(() => new Set())

  const addScaleNotes = () => {
    if (selectedScale === undefined) {
      return
    }

    const pcsToAdd = new Set(
      SCALE_INTERVALS[selectedScale].map((interval) => normalizePc(keyPc + interval)),
    )

    setHighlightedPositions((current) => {
      const next = new Set(current)

      for (const stringInfo of OPEN_STRINGS) {
        for (const fret of FRET_NUMBERS) {
          const midi = stringInfo.midi + fret
          const pitchClass = normalizePc(midi)

          if (pcsToAdd.has(pitchClass)) {
            next.add(getPositionId(stringInfo.id, fret))
          }
        }
      }

      return next
    })
  }

  const clearHighlightedNotes = () => {
    setHighlightedPositions(new Set())
  }

  const togglePosition = (positionId: PositionId) => {
    setHighlightedPositions((current) => {
      const next = new Set(current)
      if (next.has(positionId)) {
        next.delete(positionId)
      } else {
        next.add(positionId)
      }
      return next
    })
  }

  return {
    /** keyのPitch Class */
    keyPc,
    selectedScale,
    highlightedPositions,
    setKeyPc,
    setSelectedScale,
    addScaleNotes,
    clearHighlightedNotes,
    togglePosition,
  }
}
