import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getPositionBounds } from '../components/fretboard-grid/constants'
import { FRET_NUMBERS, getBendId, type PositionId } from '../libs/musicCore'
import {
  isBendShortcutPressed,
  isDimShortcutPressed,
  isEditableTarget,
  isEmphasisShortcutPressed,
  isSelectionDeleteShortcutPressed,
} from '../libs/shortcut'
import { useFretboardStore } from '../stores/fretboardStore'
import { useHistoryStore } from '../stores/historyStore'
import { useSettingsStore } from '../stores/settingsStore'

export const useFretboardInteractionState = () => {
  const displayedNotes = useFretboardStore((state) => state.displayedNotes)
  const exportFretStart = useSettingsStore((state) => state.exportFretStart)
  const exportFretEnd = useSettingsStore((state) => state.exportFretEnd)
  const togglePosition = useFretboardStore((state) => state.togglePosition)
  const toggleNoteDimmed = useFretboardStore((state) => state.toggleNoteDimmed)
  const toggleNoteEmphasized = useFretboardStore((state) => state.toggleNoteEmphasized)
  const removePositions = useFretboardStore((state) => state.removePositions)
  const setNotesDimmed = useFretboardStore((state) => state.setNotesDimmed)
  const setNotesEmphasized = useFretboardStore((state) => state.setNotesEmphasized)
  const connectPositions = useFretboardStore((state) => state.connectPositions)
  const upsertBendFromPosition = useFretboardStore((state) => state.upsertBendFromPosition)
  const removeBendByFromPosition = useFretboardStore((state) => state.removeBendByFromPosition)
  const handleExportFretStartChange = useSettingsStore((state) => state.handleExportFretStartChange)
  const handleExportFretEndChange = useSettingsStore((state) => state.handleExportFretEndChange)
  const beginBufferedEdit = useHistoryStore((state) => state.beginBufferedEdit)
  const commitBufferedEdit = useHistoryStore((state) => state.commitBufferedEdit)
  const cancelBufferedEdit = useHistoryStore((state) => state.cancelBufferedEdit)
  const captureSnapshot = useHistoryStore((state) => state.captureSnapshot)

  const trackRef = useRef<HTMLDivElement | undefined>(undefined)
  const boardRef = useRef<HTMLDivElement | undefined>(undefined)
  const contextMenuRef = useRef<HTMLDivElement | undefined>(undefined)
  const suppressNextClickToggleRef = useRef(false)

  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | undefined>(undefined)
  const [hoverPreview, setHoverPreview] = useState<
    { handle: 'start' | 'end'; fret: number } | undefined
  >(undefined)
  const [pendingConnectStart, setPendingConnectStart] = useState<
    { positionId: PositionId; clientX: number; clientY: number } | undefined
  >(undefined)
  const [pendingSelectionStart, setPendingSelectionStart] = useState<
    { clientX: number; clientY: number; x: number; y: number } | undefined
  >(undefined)
  const [dragConnectFrom, setDragConnectFrom] = useState<PositionId | undefined>(undefined)
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | undefined>(undefined)
  const [selectionRect, setSelectionRect] = useState<
    { left: number; top: number; width: number; height: number } | undefined
  >(undefined)
  const [selectedRegionRect, setSelectedRegionRect] = useState<
    { left: number; top: number; width: number; height: number } | undefined
  >(undefined)
  const [selectedPositionIds, setSelectedPositionIds] = useState<PositionId[]>([])
  const [noteContextMenu, setNoteContextMenu] = useState<
    { positionId: PositionId; x: number; y: number } | undefined
  >(undefined)
  const [selectionContextMenu, setSelectionContextMenu] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  const maxFret = FRET_NUMBERS.length - 1
  const fretCellCount = FRET_NUMBERS.length
  const clampFret = (value: number) => Math.max(0, Math.min(value, maxFret))
  const toPercentFromRangeBoundary = (fret: number, handle: 'start' | 'end') =>
    (handle === 'start' ? fret / fretCellCount : (fret + 1) / fretCellCount) * 100

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

  const toBoardPoint = useCallback((clientX: number, clientY: number) => {
    const board = boardRef.current
    if (board === undefined) {
      return undefined
    }

    const rect = board.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  const resetConnectionDrag = useCallback(() => {
    setPendingConnectStart(undefined)
    setDragConnectFrom(undefined)
    setDragPointer(undefined)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPositionIds([])
    setSelectionRect(undefined)
    setSelectedRegionRect(undefined)
    setPendingSelectionStart(undefined)
    setSelectionContextMenu(undefined)
  }, [])

  const getRectFromPoints = useCallback(
    (startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => ({
      left: Math.min(startPoint.x, endPoint.x),
      top: Math.min(startPoint.y, endPoint.y),
      width: Math.abs(endPoint.x - startPoint.x),
      height: Math.abs(endPoint.y - startPoint.y),
    }),
    [],
  )

  const isPointWithinSelectedRegion = useCallback(
    (clientX: number, clientY: number) => {
      const point = toBoardPoint(clientX, clientY)
      if (point === undefined || selectedRegionRect === undefined) {
        return false
      }

      return (
        point.x >= selectedRegionRect.left &&
        point.x <= selectedRegionRect.left + selectedRegionRect.width &&
        point.y >= selectedRegionRect.top &&
        point.y <= selectedRegionRect.top + selectedRegionRect.height
      )
    },
    [selectedRegionRect, toBoardPoint],
  )

  const getSelectedIdsInRect = useCallback(
    (rect: { left: number; top: number; width: number; height: number }): PositionId[] => {
      const right = rect.left + rect.width
      const bottom = rect.top + rect.height

      return Object.keys(useFretboardStore.getState().displayedNotes).filter((positionId) => {
        const bounds = getPositionBounds(positionId)
        if (bounds === undefined) {
          return false
        }

        return (
          bounds.left <= right &&
          bounds.right >= rect.left &&
          bounds.top <= bottom &&
          bounds.bottom >= rect.top
        )
      })
    },
    [],
  )

  const selectedPositionIdSet = useMemo(() => new Set(selectedPositionIds), [selectedPositionIds])
  const areAllSelectedNotesDimmed = useMemo(
    () =>
      selectedPositionIds.length > 0 &&
      selectedPositionIds.every((positionId) => displayedNotes[positionId]?.isDimmed === true),
    [displayedNotes, selectedPositionIds],
  )
  const areAllSelectedNotesEmphasized = useMemo(
    () =>
      selectedPositionIds.length > 0 &&
      selectedPositionIds.every((positionId) => displayedNotes[positionId]?.isEmphasized === true),
    [displayedNotes, selectedPositionIds],
  )

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const menu = contextMenuRef.current
      if (menu !== undefined && event.target instanceof Node && menu.contains(event.target)) {
        return
      }

      const board = boardRef.current
      const clickedInsideBoard =
        board !== undefined && event.target instanceof Node && board.contains(event.target)

      setNoteContextMenu(undefined)
      setSelectionContextMenu(undefined)
      if (!clickedInsideBoard) {
        clearSelection()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNoteContextMenu(undefined)
        clearSelection()
      }
    }

    const handleClose = () => {
      setNoteContextMenu(undefined)
      setSelectionContextMenu(undefined)
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
  }, [clearSelection])

  const updateHandleFromClientX = (
    clientX: number,
    handle: 'start' | 'end',
    skipHistory: boolean,
  ) => {
    const nextFret = toFretFromClientX(clientX)
    if (nextFret === undefined) {
      return
    }

    if (handle === 'start') {
      handleExportFretStartChange(nextFret, { skipHistory })
      return
    }

    handleExportFretEndChange(nextFret, { skipHistory })
  }

  const commitBufferedEditFromCurrentSnapshot = () => {
    const snapshot = captureSnapshot()
    if (snapshot !== undefined) {
      commitBufferedEdit(snapshot)
      return
    }

    cancelBufferedEdit()
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

    const nextHandle = getNearestHandle(nextFret)
    const snapshot = captureSnapshot()
    if (snapshot !== undefined) {
      beginBufferedEdit(snapshot)
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingHandle(nextHandle)
    setHoverPreview(undefined)
    updateHandleFromClientX(event.clientX, nextHandle, true)
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

    updateHandleFromClientX(event.clientX, draggingHandle, true)
  }

  const handleTrackPointerUp = () => {
    if (draggingHandle !== undefined) {
      commitBufferedEditFromCurrentSnapshot()
    }
    setDraggingHandle(undefined)
  }

  const handleTrackPointerCancel = () => {
    if (draggingHandle !== undefined) {
      cancelBufferedEdit()
    }
    setDraggingHandle(undefined)
  }

  const handleTrackPointerLeave = () => {
    if (draggingHandle === undefined) {
      setHoverPreview(undefined)
      return
    }

    commitBufferedEditFromCurrentSnapshot()
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

  const handleNotePointerDown = useCallback(
    (
      positionId: PositionId,
      isHighlighted: boolean,
      button: number,
      isMetaKey: boolean,
      isCtrlKey: boolean,
      isAltKey: boolean,
      clientX: number,
      clientY: number,
    ) => {
      if (
        button !== 0 ||
        isBendShortcutPressed(isAltKey, isMetaKey, isCtrlKey) ||
        isEmphasisShortcutPressed(isMetaKey, isCtrlKey) ||
        isDimShortcutPressed(isAltKey, isMetaKey, isCtrlKey)
      ) {
        return
      }

      setNoteContextMenu(undefined)
      setSelectionContextMenu(undefined)

      if (!isHighlighted) {
        const startPoint = toBoardPoint(clientX, clientY)
        if (startPoint === undefined) {
          return
        }

        clearSelection()
        setPendingSelectionStart({
          clientX,
          clientY,
          x: startPoint.x,
          y: startPoint.y,
        })
        setPendingConnectStart(undefined)
        setDragConnectFrom(undefined)
        setDragPointer(undefined)
        return
      }

      setPendingConnectStart({
        positionId,
        clientX,
        clientY,
      })
    },
    [clearSelection, toBoardPoint],
  )

  const handleBoardPointerDown = useCallback(
    (clientX: number, clientY: number, target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return
      }

      if (target.closest('[data-fret-cell="true"], [data-board-interactive="true"]') !== null) {
        return
      }

      const startPoint = toBoardPoint(clientX, clientY)
      if (startPoint === undefined) {
        return
      }

      setNoteContextMenu(undefined)
      setSelectionContextMenu(undefined)
      clearSelection()
      setPendingSelectionStart({
        clientX,
        clientY,
        x: startPoint.x,
        y: startPoint.y,
      })
      resetConnectionDrag()
    },
    [clearSelection, resetConnectionDrag, toBoardPoint],
  )

  const handleBoardPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (dragConnectFrom !== undefined) {
        const nextPoint = toBoardPoint(clientX, clientY)
        if (nextPoint === undefined) {
          return
        }
        setDragPointer(nextPoint)
        return
      }

      if (pendingSelectionStart !== undefined) {
        const distanceX = clientX - pendingSelectionStart.clientX
        const distanceY = clientY - pendingSelectionStart.clientY
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
        if (distance < 5) {
          return
        }

        const nextPoint = toBoardPoint(clientX, clientY)
        if (nextPoint === undefined) {
          return
        }

        suppressNextClickToggleRef.current = true
        const nextRect = getRectFromPoints(
          { x: pendingSelectionStart.x, y: pendingSelectionStart.y },
          nextPoint,
        )
        setSelectionRect(nextRect)
        setSelectedPositionIds(getSelectedIdsInRect(nextRect))
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
    },
    [
      dragConnectFrom,
      getRectFromPoints,
      getSelectedIdsInRect,
      pendingConnectStart,
      pendingSelectionStart,
      toBoardPoint,
    ],
  )

  const handleNotePointerUp = useCallback(
    (positionId: PositionId) => {
      if (dragConnectFrom === undefined) {
        return
      }

      if (useFretboardStore.getState().displayedNotes[positionId] === undefined) {
        togglePosition(positionId)
      }

      connectPositions(dragConnectFrom, positionId)
      resetConnectionDrag()
    },
    [connectPositions, dragConnectFrom, resetConnectionDrag, togglePosition],
  )

  const handleBoardPointerUpOrCancel = useCallback(() => {
    if (selectionRect !== undefined) {
      setSelectedPositionIds(getSelectedIdsInRect(selectionRect))
      setSelectedRegionRect(selectionRect)
      setSelectionRect(undefined)
      setPendingSelectionStart(undefined)
      resetConnectionDrag()
      return
    }

    if (pendingSelectionStart !== undefined) {
      setPendingSelectionStart(undefined)
    }

    resetConnectionDrag()
  }, [getSelectedIdsInRect, pendingSelectionStart, resetConnectionDrag, selectionRect])

  const handleNoteClick = useCallback(
    (positionId: PositionId, isMetaKey: boolean, isCtrlKey: boolean, isAltKey: boolean) => {
      if (isBendShortcutPressed(isAltKey, isMetaKey, isCtrlKey)) {
        if (useFretboardStore.getState().bends[getBendId(positionId)] !== undefined) {
          removeBendByFromPosition(positionId)
          return
        }
        upsertBendFromPosition(positionId)
        return
      }

      if (isEmphasisShortcutPressed(isMetaKey, isCtrlKey) && !isAltKey) {
        if (selectedPositionIds.length > 0 && selectedPositionIdSet.has(positionId)) {
          setNotesEmphasized(selectedPositionIds, !areAllSelectedNotesEmphasized)
          return
        }
        toggleNoteEmphasized(positionId)
        return
      }

      if (isDimShortcutPressed(isAltKey, isMetaKey, isCtrlKey)) {
        if (selectedPositionIds.length > 0 && selectedPositionIdSet.has(positionId)) {
          setNotesDimmed(selectedPositionIds, !areAllSelectedNotesDimmed)
          return
        }
        toggleNoteDimmed(positionId)
        return
      }

      if (suppressNextClickToggleRef.current) {
        suppressNextClickToggleRef.current = false
        return
      }

      if (selectedPositionIds.length > 0) {
        clearSelection()
      }

      togglePosition(positionId)
    },
    [
      areAllSelectedNotesDimmed,
      areAllSelectedNotesEmphasized,
      clearSelection,
      removeBendByFromPosition,
      selectedPositionIdSet,
      selectedPositionIds.length,
      selectedPositionIds,
      setNotesDimmed,
      setNotesEmphasized,
      toggleNoteDimmed,
      toggleNoteEmphasized,
      togglePosition,
      upsertBendFromPosition,
    ],
  )

  const handleNoteContextMenu = useCallback(
    (positionId: PositionId, isHighlighted: boolean, clientX: number, clientY: number) => {
      if (
        selectedPositionIds.length > 0 &&
        (selectedPositionIdSet.has(positionId) || isPointWithinSelectedRegion(clientX, clientY))
      ) {
        setNoteContextMenu(undefined)
        setSelectionContextMenu({
          x: clientX,
          y: clientY,
        })
        return
      }

      if (!isHighlighted) {
        setNoteContextMenu(undefined)
        setSelectionContextMenu(undefined)
        return
      }

      setSelectionContextMenu(undefined)
      setNoteContextMenu({
        positionId,
        x: clientX,
        y: clientY,
      })
    },
    [isPointWithinSelectedRegion, selectedPositionIdSet, selectedPositionIds.length],
  )

  const handleToggleBendFromContextMenu = useCallback(
    (positionId: PositionId) => {
      if (useFretboardStore.getState().bends[getBendId(positionId)] !== undefined) {
        removeBendByFromPosition(positionId)
        return
      }
      upsertBendFromPosition(positionId)
    },
    [removeBendByFromPosition, upsertBendFromPosition],
  )

  const handleDeleteSelectedNotes = useCallback(() => {
    removePositions(selectedPositionIds)
    setSelectionContextMenu(undefined)
    clearSelection()
  }, [clearSelection, removePositions, selectedPositionIds])

  const handleToggleDimSelectedNotes = useCallback(() => {
    setNotesDimmed(selectedPositionIds, !areAllSelectedNotesDimmed)
    setSelectionContextMenu(undefined)
  }, [areAllSelectedNotesDimmed, selectedPositionIds, setNotesDimmed])

  const handleToggleEmphasizeSelectedNotes = useCallback(() => {
    setNotesEmphasized(selectedPositionIds, !areAllSelectedNotesEmphasized)
    setSelectionContextMenu(undefined)
  }, [areAllSelectedNotesEmphasized, selectedPositionIds, setNotesEmphasized])

  useEffect(() => {
    const handleDeleteShortcut = (event: KeyboardEvent) => {
      if (selectedPositionIds.length === 0 || isEditableTarget(event.target)) {
        return
      }

      if (!isSelectionDeleteShortcutPressed(event.key)) {
        return
      }

      event.preventDefault()
      handleDeleteSelectedNotes()
    }

    window.addEventListener('keydown', handleDeleteShortcut)
    return () => {
      window.removeEventListener('keydown', handleDeleteShortcut)
    }
  }, [handleDeleteSelectedNotes, selectedPositionIds.length])

  const createRangeHandlePointerHandlers = (handle: 'start' | 'end') => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const snapshot = captureSnapshot()
      if (snapshot !== undefined) {
        beginBufferedEdit(snapshot)
      }
      setHoverPreview(undefined)
      setDraggingHandle(handle)
      updateHandleFromClientX(event.clientX, handle, true)
    },
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (draggingHandle !== handle) {
        return
      }
      updateHandleFromClientX(event.clientX, handle, true)
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      commitBufferedEditFromCurrentSnapshot()
      setDraggingHandle(undefined)
    },
  })

  const startHandlePointerHandlers = createRangeHandlePointerHandlers('start')
  const endHandlePointerHandlers = createRangeHandlePointerHandlers('end')

  return {
    trackRef,
    boardRef,
    contextMenuRef,
    noteContextMenu,
    selectionContextMenu,
    setNoteContextMenu,
    setSelectionContextMenu,
    handleToggleBendFromContextMenu,
    handleDeleteSelectedNotes,
    handleToggleDimSelectedNotes,
    handleToggleEmphasizeSelectedNotes,
    areAllSelectedNotesDimmed,
    areAllSelectedNotesEmphasized,
    selectedPositionIds,
    selectedPositionIdSet,
    selectionRect,
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
      startRangePercent: toPercentFromRangeBoundary(
        Math.min(exportFretStart, exportFretEnd),
        'start',
      ),
      rangeWidthPercent:
        toPercentFromRangeBoundary(Math.max(exportFretStart, exportFretEnd), 'end') -
        toPercentFromRangeBoundary(Math.min(exportFretStart, exportFretEnd), 'start'),
      startHandlePercent: toPercentFromRangeBoundary(exportFretStart, 'start'),
      endHandlePercent: toPercentFromRangeBoundary(exportFretEnd, 'end'),
      hoverPreview:
        draggingHandle !== undefined || hoverPreview === undefined
          ? undefined
          : {
              handle: hoverPreview.handle,
              percent: toPercentFromRangeBoundary(hoverPreview.fret, hoverPreview.handle),
            },
      onTrackRefChange: (node: HTMLDivElement | undefined) => {
        trackRef.current = node
      },
      onTrackPointerDown: handleTrackClickMove,
      onTrackPointerMove: handleTrackPointerMove,
      onTrackPointerUp: handleTrackPointerUp,
      onTrackPointerCancel: handleTrackPointerCancel,
      onTrackPointerLeave: handleTrackPointerLeave,
      onStartPointerDown: startHandlePointerHandlers.onPointerDown,
      onStartPointerMove: startHandlePointerHandlers.onPointerMove,
      onStartPointerUp: startHandlePointerHandlers.onPointerUp,
      onEndPointerDown: endHandlePointerHandlers.onPointerDown,
      onEndPointerMove: endHandlePointerHandlers.onPointerMove,
      onEndPointerUp: endHandlePointerHandlers.onPointerUp,
    },
    gridProps: {
      selectedPositionIds: selectedPositionIdSet,
      disableCellPreview:
        selectionRect !== undefined ||
        pendingSelectionStart !== undefined ||
        selectedPositionIds.length > 0,
      selectionRect,
      exportHoverPreview:
        draggingHandle !== undefined || hoverPreview === undefined ? undefined : hoverPreview,
      onSelectClosestHandleToFret: setClosestHandleToFret,
      onBoardPointerDown: handleBoardPointerDown,
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
