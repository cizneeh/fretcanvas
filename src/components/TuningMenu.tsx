import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useShallow } from 'zustand/react/shallow'
import { getInstrumentPresetLabel } from '../i18n/config'
import { useI18n } from '../i18n/useI18n'
import {
  getMatchingInstrumentPresetId,
  INSTRUMENT_PRESETS,
  stringInfoArraysEqual,
  TUNING_NOTE_OPTIONS,
} from '../libs/tuning'
import { useFretboardStore } from '../stores/fretboardStore'
import {
  m3CardElevatedClass,
  m3FieldLabelClass,
  m3FilledButtonClass,
  m3OutlinedButtonClass,
  m3SelectChevronClass,
  m3SelectClass,
} from './ui/materialClasses'

type TuningMenuProps = {
  anchorElement: HTMLElement | null
  onClose: () => void
}

export const TuningMenu = ({ anchorElement, onClose }: TuningMenuProps) => {
  const { locale, t } = useI18n()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelPosition, setPanelPosition] = useState({
    left: 0,
    top: 0,
  })
  const {
    strings,
    draftStrings,
    draftPresetId,
    displayedNotes,
    connections,
    bends,
    setDraftPreset,
    appendDraftString,
    removeDraftString,
    setDraftStringNote,
    resetDraftStrings,
    applyDraftStrings,
  } = useFretboardStore(
    useShallow((state) => ({
      strings: state.strings,
      draftStrings: state.draftStrings,
      draftPresetId: state.draftPresetId,
      displayedNotes: state.displayedNotes,
      connections: state.connections,
      bends: state.bends,
      setDraftPreset: state.setDraftPreset,
      appendDraftString: state.appendDraftString,
      removeDraftString: state.removeDraftString,
      setDraftStringNote: state.setDraftStringNote,
      resetDraftStrings: state.resetDraftStrings,
      applyDraftStrings: state.applyDraftStrings,
    })),
  )

  const isOpen = anchorElement !== null

  const isDirty = useMemo(
    () =>
      draftPresetId !== (getMatchingInstrumentPresetId(strings) ?? 'custom') ||
      !stringInfoArraysEqual(strings, draftStrings),
    [draftPresetId, draftStrings, strings],
  )

  const willClearBoardState =
    Object.keys(displayedNotes).length > 0 ||
    Object.keys(connections).length > 0 ||
    Object.keys(bends).length > 0

  const closeWithCancel = useCallback(() => {
    resetDraftStrings()
    onClose()
  }, [onClose, resetDraftStrings])

  const applyAndClose = useCallback(() => {
    if (
      isDirty &&
      willClearBoardState &&
      typeof window !== 'undefined' &&
      window.confirm(t('tuning.applyWarning')) === false
    ) {
      return
    }

    applyDraftStrings()
    onClose()
  }, [applyDraftStrings, isDirty, onClose, t, willClearBoardState])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    resetDraftStrings()
  }, [isOpen, resetDraftStrings])

  useEffect(() => {
    if (!isOpen || anchorElement === null) {
      return
    }

    const updatePanelPosition = () => {
      const rect = anchorElement.getBoundingClientRect()
      const width = 18.5 * 16
      const height = panelRef.current?.offsetHeight ?? 520
      const gap = 12
      const preferredLeft = rect.left - width - gap
      const fallbackLeft = rect.right + gap
      const nextLeft =
        preferredLeft >= 16
          ? preferredLeft
          : Math.min(Math.max(fallbackLeft, 16), window.innerWidth - width - 16)
      const centeredTop = rect.top + rect.height / 2 - 64
      const nextTop = Math.min(
        Math.max(16, centeredTop),
        Math.max(16, window.innerHeight - height - 16),
      )

      setPanelPosition({
        left: nextLeft,
        top: nextTop,
      })
    }

    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node
      if (
        anchorElement.contains(targetNode) === true ||
        panelRef.current?.contains(targetNode) === true
      ) {
        return
      }
      closeWithCancel()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeWithCancel()
      }
    }

    updatePanelPosition()
    window.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('resize', updatePanelPosition)
    document.addEventListener('scroll', updatePanelPosition, true)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('resize', updatePanelPosition)
      document.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [anchorElement, closeWithCancel, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    panelRef.current?.focus()
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') {
    return undefined
  }

  return createPortal(
    <div
      ref={panelRef}
      className={`${m3CardElevatedClass} fixed z-40 w-[18.5rem] p-3`}
      role="dialog"
      aria-label={t('tuning.title')}
      tabIndex={-1}
      style={{
        left: panelPosition.left,
        top: panelPosition.top,
      }}
    >
      <div className="mb-3 text-sm font-medium text-[color:var(--md-sys-color-on-surface)]">
        {t('tuning.title')}
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={m3FieldLabelClass}>{t('tuning.preset')}</span>
          <div className="relative">
            <select
              className={m3SelectClass}
              value={draftPresetId}
              onChange={(event) => {
                setDraftPreset(event.target.value as typeof draftPresetId)
              }}
            >
              {INSTRUMENT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {getInstrumentPresetLabel(locale, preset.id)}
                </option>
              ))}
              {draftPresetId === 'custom' ? (
                <option value="custom">{t('tuning.custom')}</option>
              ) : undefined}
            </select>
            <svg
              className={m3SelectChevronClass}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6.5L8 10L12 6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </label>

        <div className="space-y-2">
          <div className="grid grid-cols-[1.9rem_1.6rem_minmax(0,1fr)] items-center gap-2 px-1">
            <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]" />
            <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]" />
            <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
              {t('tuning.note')}
            </span>
          </div>

          {draftStrings.map((stringInfo, stringIndex) => (
            <div
              key={stringInfo.id}
              className="grid grid-cols-[1.9rem_1.6rem_minmax(0,1fr)] items-center gap-2"
            >
              <div className="text-center text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
                {stringIndex + 1}
              </div>

              <button
                type="button"
                className="m3-focus-ring m3-state-surface flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--md-sys-color-outline)] text-sm text-[color:var(--md-sys-color-on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('tuning.removeString')}
                disabled={draftStrings.length <= 4}
                onClick={() => {
                  removeDraftString(stringIndex)
                }}
              >
                -
              </button>

              <div className="relative">
                <select
                  className={m3SelectClass}
                  value={stringInfo.name}
                  onChange={(event) => {
                    setDraftStringNote(
                      stringIndex,
                      event.target.value as (typeof TUNING_NOTE_OPTIONS)[number],
                    )
                  }}
                >
                  {TUNING_NOTE_OPTIONS.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
                <svg
                  className={m3SelectChevronClass}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6.5L8 10L12 6.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="m3-focus-ring m3-state-surface flex min-h-10 w-full items-center justify-center rounded-[var(--md-shape-md)] border border-dashed border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-low)] px-3 py-2 text-sm text-[color:var(--md-sys-color-on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('tuning.addString')}
            disabled={draftStrings.length >= 8}
            onClick={() => {
              appendDraftString()
            }}
          >
            + {t('tuning.addString')}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" className={m3OutlinedButtonClass} onClick={closeWithCancel}>
            {t('tuning.cancel')}
          </button>
          <button
            type="button"
            className={m3FilledButtonClass}
            disabled={!isDirty}
            onClick={applyAndClose}
          >
            {t('tuning.apply')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
