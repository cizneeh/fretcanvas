import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { FRET_NUMBERS, type PositionId } from '../libs/model'
import { isDimShortcutPressed } from '../libs/shortcut'
import { useFretboardStore } from '../stores/fretboardStore'
import { useSettingsStore } from '../stores/settingsStore'

export const useFretboardInteractionState = () => {
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const togglePosition = useFretboardStore((state) => state.togglePosition)
  const toggleNoteDimmed = useFretboardStore((state) => state.toggleNoteDimmed)
  const connectPositions = useFretboardStore((state) => state.connectPositions)
  const handleExportFretStartChange = useSettingsStore((state) => state.handleExportFretStartChange)
  const handleExportFretEndChange = useSettingsStore((state) => state.handleExportFretEndChange)

  const trackRef = useRef<HTMLDivElement | undefined>(undefined)
  const boardRef = useRef<HTMLDivElement | undefined>(undefined)
  const contextMenuRef = useRef<HTMLDivElement | undefined>(undefined)
  const suppressNextClickToggleForPositionRef = useRef<PositionId | undefined>(undefined)

  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | undefined>(undefined)
  const [hoverPreview, setHoverPreview] = useState<
    { handle: 'start' | 'end'; fret: number } | undefined
  >(undefined)
  const [pendingConnectStart, setPendingConnectStart] = useState<
    { positionId: PositionId; clientX: number; clientY: number } | undefined
  >(undefined)
  const [dragConnectFrom, setDragConnectFrom] = useState<PositionId | undefined>(undefined)
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | undefined>(undefined)
  const [noteContextMenu, setNoteContextMenu] = useState<
    { positionId: PositionId; x: number; y: number } | undefined
  >(undefined)

  const maxFret = FRET_NUMBERS.length - 1
  const fretCellCount = FRET_NUMBERS.length
  const clampFret = (value: number) => Math.max(0, Math.min(value, maxFret))
  const toPercentFromFretCenter = (fret: number) => ((fret + 0.5) / fretCellCount) * 100

  const toFretFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (track === undefined) {
      return undefined
    }

    const rect = track.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const ratio = rect.width > 0 ? relativeX / rect.width : 0
    return clampFret(Math.round(ratio * fretCellCount - 0.5))
  }

  const toBoardPoint = (clientX: number, clientY: number) => {
    const board = boardRef.current
    if (board === undefined) {
      return undefined
    }

    const rect = board.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const resetConnectionDrag = () => {
    setPendingConnectStart(undefined)
    setDragConnectFrom(undefined)
    setDragPointer(undefined)
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const menu = contextMenuRef.current
      if (menu !== undefined && event.target instanceof Node && menu.contains(event.target)) {
        return
      }
      setNoteContextMenu(undefined)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNoteContextMenu(undefined)
      }
    }

    const handleClose = () => {
      setNoteContextMenu(undefined)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [])

  const updateHandleFromClientX = (clientX: number, handle: 'start' | 'end') => {
    const nextFret = toFretFromClientX(clientX)
    if (nextFret === undefined) {
      return
    }

    if (handle === 'start') {
      handleExportFretStartChange(nextFret)
      return
    }

    handleExportFretEndChange(nextFret)
  }

  const getNearestHandle = (fret: number): 'start' | 'end' => {
    const startDistance = Math.abs(fret - exportFretStart)
    const endDistance = Math.abs(fret - exportFretEnd)
    return startDistance <= endDistance ? 'start' : 'end'
  }

  const handleTrackClickMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof HTMLElement && target.closest('[data-export-handle="true"]') !== null) {
      return
    }

    const nextFret = toFretFromClientX(event.clientX)
    if (nextFret === undefined) {
      return
    }

    updateHandleFromClientX(event.clientX, getNearestHandle(nextFret))
  }

  const handleTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingHandle === undefined) {
      const nextFret = toFretFromClientX(event.clientX)
      if (nextFret === undefined) {
        setHoverPreview(undefined)
        return
      }
      setHoverPreview({
        fret: nextFret,
        handle: getNearestHandle(nextFret),
      })
      return
    }

    updateHandleFromClientX(event.clientX, draggingHandle)
  }

  const handleTrackPointerUp = () => {
    setDraggingHandle(undefined)
  }

  const handleTrackPointerCancel = () => {
    setDraggingHandle(undefined)
  }

  const handleTrackPointerLeave = () => {
    if (draggingHandle === undefined) {
      setHoverPreview(undefined)
      return
    }

    setDraggingHandle(undefined)
  }

  const setClosestHandleToFret = (fret: number) => {
    const startDistance = Math.abs(fret - exportFretStart)
    const endDistance = Math.abs(fret - exportFretEnd)
    if (startDistance <= endDistance) {
      handleExportFretStartChange(fret)
      return
    }
    handleExportFretEndChange(fret)
  }

  const handleNotePointerDown = (
    positionId: PositionId,
    isHighlighted: boolean,
    button: number,
    isMetaKey: boolean,
    isCtrlKey: boolean,
    clientX: number,
    clientY: number,
  ) => {
    if (button !== 0 || isDimShortcutPressed(isMetaKey, isCtrlKey)) {
      return
    }

    if (!isHighlighted) {
      togglePosition(positionId)
      suppressNextClickToggleForPositionRef.current = positionId
    }

    setPendingConnectStart({
      positionId,
      clientX,
      clientY,
    })
  }

  const handleBoardPointerMove = (clientX: number, clientY: number) => {
    if (dragConnectFrom !== undefined) {
      const nextPoint = toBoardPoint(clientX, clientY)
      if (nextPoint === undefined) {
        return
      }
      setDragPointer(nextPoint)
      return
    }

    if (pendingConnectStart === undefined) {
      return
    }

    const distanceX = clientX - pendingConnectStart.clientX
    const distanceY = clientY - pendingConnectStart.clientY
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    if (distance < 5) {
      return
    }

    const nextPoint = toBoardPoint(clientX, clientY)
    if (nextPoint === undefined) {
      return
    }

    setDragConnectFrom(pendingConnectStart.positionId)
    setPendingConnectStart(undefined)
    setDragPointer(nextPoint)
  }

  const handleNotePointerUp = (positionId: PositionId) => {
    if (dragConnectFrom === undefined) {
      return
    }

    if (displayedNotes[positionId] === undefined) {
      togglePosition(positionId)
    }

    connectPositions(dragConnectFrom, positionId)
    resetConnectionDrag()
  }

  const handleBoardPointerUpOrCancel = () => {
    resetConnectionDrag()
  }

  const handleNoteClick = (positionId: PositionId, isMetaKey: boolean, isCtrlKey: boolean) => {
    if (isDimShortcutPressed(isMetaKey, isCtrlKey)) {
      toggleNoteDimmed(positionId)
      return
    }

    if (suppressNextClickToggleForPositionRef.current === positionId) {
      suppressNextClickToggleForPositionRef.current = undefined
      return
    }

    togglePosition(positionId)
  }

  const handleNoteContextMenu = (
    positionId: PositionId,
    isHighlighted: boolean,
    clientX: number,
    clientY: number,
  ) => {
    if (!isHighlighted) {
      setNoteContextMenu(undefined)
      return
    }

    setNoteContextMenu({
      positionId,
      x: clientX,
      y: clientY,
    })
  }

  return {
    trackRef,
    boardRef,
    contextMenuRef,
    noteContextMenu,
    setNoteContextMenu,
    previewConnection:
      dragConnectFrom !== undefined && dragPointer !== undefined
        ? {
            from: dragConnectFrom,
            toX: dragPointer.x,
            toY: dragPointer.y,
          }
        : undefined,
    rangeTrackProps: {
      fretColumnSpan: FRET_NUMBERS.length,
      startRangePercent: toPercentFromFretCenter(Math.min(exportFretStart, exportFretEnd)),
      rangeWidthPercent:
        ((Math.max(exportFretStart, exportFretEnd) - Math.min(exportFretStart, exportFretEnd)) /
          fretCellCount) *
        100,
      startHandlePercent: toPercentFromFretCenter(exportFretStart),
      endHandlePercent: toPercentFromFretCenter(exportFretEnd),
      hoverPreview:
        hoverPreview === undefined
          ? undefined
          : {
              handle: hoverPreview.handle,
              percent: toPercentFromFretCenter(hoverPreview.fret),
            },
      onTrackRefChange: (node: HTMLDivElement | undefined) => {
        trackRef.current = node
      },
      onTrackPointerDown: handleTrackClickMove,
      onTrackPointerMove: handleTrackPointerMove,
      onTrackPointerUp: handleTrackPointerUp,
      onTrackPointerCancel: handleTrackPointerCancel,
      onTrackPointerLeave: handleTrackPointerLeave,
      onStartPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        setDraggingHandle('start')
        updateHandleFromClientX(event.clientX, 'start')
      },
      onStartPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (draggingHandle !== 'start') {
          return
        }
        updateHandleFromClientX(event.clientX, 'start')
      },
      onStartPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        setDraggingHandle(undefined)
      },
      onEndPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        setDraggingHandle('end')
        updateHandleFromClientX(event.clientX, 'end')
      },
      onEndPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (draggingHandle !== 'end') {
          return
        }
        updateHandleFromClientX(event.clientX, 'end')
      },
      onEndPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        setDraggingHandle(undefined)
      },
    },
    gridProps: {
      onSelectClosestHandleToFret: setClosestHandleToFret,
      onNotePointerDown: handleNotePointerDown,
      onNoteClick: handleNoteClick,
      onNoteContextMenu: handleNoteContextMenu,
      onNotePointerUp: handleNotePointerUp,
      onBoardPointerMove: handleBoardPointerMove,
      onBoardPointerUpOrCancel: handleBoardPointerUpOrCancel,
      onBoardRefChange: (node: HTMLDivElement | undefined) => {
        boardRef.current = node
      },
    },
  }
}
