import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getInstrumentPresetLabel } from '../i18n/config'
import { useI18n } from '../i18n/useI18n'
import {
  getMatchingInstrumentPresetId,
  getTuningOctaveFromMidi,
  INSTRUMENT_PRESETS,
  stringInfoArraysEqual,
  TUNING_NOTE_OPTIONS,
  TUNING_OCTAVE_OPTIONS,
} from '../libs/tuning'
import { useFretboardStore } from '../stores/fretboardStore'
import { BOARD_PADDING_Y } from './fretboard-grid/constants'
import {
  m3CardElevatedClass,
  m3FieldLabelClass,
  m3FilledButtonClass,
  m3OutlinedButtonClass,
  m3SelectChevronClass,
  m3SelectClass,
} from './ui/materialClasses'

export const TuningMenu = () => {
  const { locale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const {
    strings,
    draftStrings,
    draftPresetId,
    setDraftPreset,
    setDraftStringCount,
    setDraftStringNote,
    setDraftStringOctave,
    resetDraftStrings,
    applyDraftStrings,
  } = useFretboardStore(
    useShallow((state) => ({
      strings: state.strings,
      draftStrings: state.draftStrings,
      draftPresetId: state.draftPresetId,
      setDraftPreset: state.setDraftPreset,
      setDraftStringCount: state.setDraftStringCount,
      setDraftStringNote: state.setDraftStringNote,
      setDraftStringOctave: state.setDraftStringOctave,
      resetDraftStrings: state.resetDraftStrings,
      applyDraftStrings: state.applyDraftStrings,
    })),
  )

  const isDirty = useMemo(
    () =>
      draftPresetId !== (getMatchingInstrumentPresetId(strings) ?? 'custom') ||
      !stringInfoArraysEqual(strings, draftStrings),
    [draftPresetId, draftStrings, strings],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node) === true) {
        return
      }
      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className="absolute z-30"
      style={{
        left: 8,
        top: BOARD_PADDING_Y + 6,
      }}
    >
      <button
        type="button"
        className="m3-focus-ring m3-state-surface flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--md-sys-color-outline)] bg-[color:var(--md-sys-color-surface-container-high)] text-[color:var(--md-sys-color-on-surface-variant)] shadow-[var(--md-elevation-2)]"
        aria-label={t('tuning.openMenu')}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current)
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M3 4H13M3 8H13M3 12H13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          className={`${m3CardElevatedClass} absolute left-10 top-[-8px] w-[18rem] p-3`}
          role="dialog"
          aria-label={t('tuning.title')}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-[color:var(--md-sys-color-on-surface)]">
              {t('tuning.title')}
            </div>
            <button
              type="button"
              className="m3-state-surface rounded-full px-2 py-1 text-xs text-[color:var(--md-sys-color-on-surface-variant)]"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              {t('common.close')}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={m3FieldLabelClass}>{t('tuning.instrument')}</span>
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

            <label className="flex flex-col gap-1.5">
              <span className={m3FieldLabelClass}>{t('tuning.stringCount')}</span>
              <div className="relative">
                <select
                  className={m3SelectClass}
                  value={draftStrings.length}
                  onChange={(event) => {
                    setDraftStringCount(Number(event.target.value))
                  }}
                >
                  {[4, 5, 6, 7, 8].map((count) => (
                    <option key={count} value={count}>
                      {count}
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
            </label>

            <div className="space-y-2">
              <div className="grid grid-cols-[1.6rem_minmax(0,1fr)_5.5rem] items-center gap-2 px-1">
                <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]" />
                <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
                  {t('tuning.note')}
                </span>
                <span className="text-[11px] text-[color:var(--md-sys-color-on-surface-variant)]">
                  {t('tuning.octave')}
                </span>
              </div>

              {draftStrings.map((stringInfo, stringIndex) => (
                <div
                  key={stringInfo.id}
                  className="grid grid-cols-[1.6rem_minmax(0,1fr)_5.5rem] items-center gap-2"
                >
                  <div className="text-center text-xs text-[color:var(--md-sys-color-on-surface-variant)]">
                    {stringIndex + 1}
                  </div>

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

                  <div className="relative">
                    <select
                      className={m3SelectClass}
                      value={getTuningOctaveFromMidi(stringInfo.midi)}
                      onChange={(event) => {
                        setDraftStringOctave(stringIndex, Number(event.target.value))
                      }}
                    >
                      {TUNING_OCTAVE_OPTIONS.map((octave) => (
                        <option key={octave} value={octave}>
                          {octave}
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
            </div>

            <div className="mt-1 flex gap-2">
              <button
                type="button"
                className={`flex-1 ${m3FilledButtonClass}`}
                onClick={() => {
                  applyDraftStrings()
                  setIsOpen(false)
                }}
                disabled={!isDirty}
              >
                {t('tuning.apply')}
              </button>
              <button
                type="button"
                className={`flex-1 ${m3OutlinedButtonClass}`}
                onClick={() => {
                  resetDraftStrings()
                }}
                disabled={!isDirty}
              >
                {t('tuning.reset')}
              </button>
            </div>
          </div>
        </div>
      ) : undefined}
    </div>
  )
}
