import { useFretboardStore } from '../stores/fretboardStore'

export const useFretboardState = () => {
  const keyPc = useFretboardStore((state) => state.keyPc)
  const selectedScale = useFretboardStore((state) => state.selectedScale)
  const highlightedPositions = useFretboardStore((state) => state.highlightedPositions)
  const setKeyPc = useFretboardStore((state) => state.setKeyPc)
  const setSelectedScale = useFretboardStore((state) => state.setSelectedScale)
  const addScaleNotes = useFretboardStore((state) => state.addScaleNotes)
  const clearHighlightedNotes = useFretboardStore((state) => state.clearHighlightedNotes)
  const togglePosition = useFretboardStore((state) => state.togglePosition)
  const exportFretStart = useFretboardStore((state) => state.exportFretStart)
  const exportFretEnd = useFretboardStore((state) => state.exportFretEnd)
  const backgroundOpacityPercent = useFretboardStore((state) => state.backgroundOpacityPercent)
  const handleExportFretStartChange = useFretboardStore((state) => state.handleExportFretStartChange)
  const handleExportFretEndChange = useFretboardStore((state) => state.handleExportFretEndChange)
  const handleBackgroundOpacityPercentChange = useFretboardStore(
    (state) => state.handleBackgroundOpacityPercentChange,
  )
  const exportTransparentPng = useFretboardStore((state) => state.exportTransparentPng)

  return {
    keyPc,
    selectedScale,
    highlightedPositions,
    setKeyPc,
    setSelectedScale,
    addScaleNotes,
    clearHighlightedNotes,
    togglePosition,
    exportFretStart,
    exportFretEnd,
    backgroundOpacityPercent,
    handleExportFretStartChange,
    handleExportFretEndChange,
    handleBackgroundOpacityPercentChange,
    exportTransparentPng,
  }
}
