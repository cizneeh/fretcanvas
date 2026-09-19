import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useShallow } from 'zustand/react/shallow'
import { useI18n } from '../../i18n/useI18n'
import { getMidiLabel, getPianoLayout, isBlackKey, PIANO_LOWEST } from '../../libs/piano'
import { getPianoNoteDisplay } from '../../libs/pianoDisplay'
import { isDimShortcutPressed, isEmphasisShortcutPressed } from '../../libs/shortcut'
import { useFretboardStore } from '../../stores/fretboardStore'
import { usePianoStore } from '../../stores/pianoStore'
import { NoteLegend } from '../NoteLegend'
import { m3InputClass, m3MenuContainerClass, m3MenuItemClass } from '../ui/materialClasses'

type NoteMenu = { midi: number; x: number; y: number; trigger: HTMLButtonElement }

const startNotes = Array.from(
  { length: 96 - PIANO_LOWEST + 1 },
  (_, index) => PIANO_LOWEST + index,
).filter((midi) => !isBlackKey(midi))

export const PianoView = () => {
  const { t } = useI18n()
  const piano = usePianoStore()
  const music = useFretboardStore(
    useShallow((state) => ({
      keyPc: state.keyPc,
      noteTextMode: state.noteTextMode,
      noteLabelMode: state.noteLabelMode,
      selectedScale: state.selectedScale,
      appliedChordSymbol: state.appliedChordSymbol,
    })),
  )
  const layout = getPianoLayout(piano.startMidi, piano.startMidi + piano.octaves * 12)
  const [menu, setMenu] = useState<NoteMenu>()
  const menuRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const longPressStart = useRef<{ x: number; y: number } | undefined>(undefined)
  const wasLongPress = useRef(false)
  const clearLongPress = () => {
    clearTimeout(longPressTimer.current)
    longPressTimer.current = undefined
    longPressStart.current = undefined
  }

  useEffect(() => () => clearTimeout(longPressTimer.current), [])

  useEffect(() => {
    if (menu === undefined) return
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const closeOnOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(undefined)
    }
    const close = () => setMenu(undefined)
    window.addEventListener('pointerdown', closeOnOutside)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutside)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [menu])

  const openMenu = (midi: number, trigger: HTMLButtonElement, x?: number, y?: number) => {
    const rect = trigger.getBoundingClientRect()
    setMenu({
      midi,
      trigger,
      x: Math.max(8, Math.min(x ?? rect.left, window.innerWidth - 228)),
      y: Math.max(8, Math.min(y ?? rect.bottom, window.innerHeight - 174)),
    })
  }
  const closeMenu = () => {
    menu?.trigger.focus()
    setMenu(undefined)
  }
  const menuNote = menu === undefined ? undefined : piano.notes[menu.midi]

  return (
    <section className="piano-panel" aria-label={t('piano.keyboard')}>
      <div className="piano-toolbar">
        <NoteLegend />
        <div className="piano-range-fields">
          <label>
            <span>{t('piano.startNote')}</span>
            <select
              className={m3InputClass}
              aria-label={t('piano.startNote')}
              value={piano.startMidi}
              onChange={(event) => piano.setRange(Number(event.target.value), piano.octaves)}
            >
              {startNotes.map((midi) => (
                <option key={midi} value={midi}>
                  {getMidiLabel(midi)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('piano.octaves')}</span>
            <select
              className={m3InputClass}
              aria-label={t('piano.octaves')}
              value={piano.octaves}
              onChange={(event) => piano.setRange(piano.startMidi, Number(event.target.value))}
            >
              {Array.from(
                { length: Math.min(7, Math.floor((108 - piano.startMidi) / 12)) },
                (_, index) => index + 1,
              ).map((octaves) => (
                <option key={octaves} value={octaves}>
                  {octaves}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="piano-scroll">
        <div
          className="piano-keyboard"
          style={{
            minWidth: layout.width,
            maxWidth: layout.width * 1.5,
            aspectRatio: `${layout.width} / ${layout.height}`,
          }}
        >
          {layout.keys.map((key) => {
            const note = piano.notes[key.midi]
            const display = getPianoNoteDisplay(key.midi, key.isBlack, music)
            return (
              <button
                key={key.midi}
                type="button"
                className={`piano-key ${key.isBlack ? 'piano-key--black' : 'piano-key--white'}`}
                style={{
                  left: `${(key.x / layout.width) * 100}%`,
                  width: `${(key.width / layout.width) * 100}%`,
                  height: `${(key.height / layout.height) * 100}%`,
                }}
                aria-label={getMidiLabel(key.midi)}
                aria-pressed={note !== undefined}
                aria-haspopup="menu"
                data-piano-midi={key.midi}
                data-note-highlighted={note !== undefined}
                data-note-dimmed={note?.isDimmed === true}
                data-note-emphasized={note?.isEmphasized === true}
                onClick={(event) => {
                  if (wasLongPress.current) {
                    wasLongPress.current = false
                    return
                  }
                  if (isDimShortcutPressed(event.altKey, event.metaKey, event.ctrlKey))
                    piano.toggleStyle(key.midi, 'isDimmed')
                  else if (isEmphasisShortcutPressed(event.metaKey, event.ctrlKey))
                    piano.toggleStyle(key.midi, 'isEmphasized')
                  else piano.toggleNote(key.midi)
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  clearLongPress()
                  openMenu(key.midi, event.currentTarget, event.clientX, event.clientY)
                }}
                onPointerDown={(event) => {
                  clearLongPress()
                  wasLongPress.current = false
                  if (event.pointerType !== 'touch' || !event.isPrimary) return
                  longPressStart.current = { x: event.clientX, y: event.clientY }
                  const trigger = event.currentTarget
                  longPressTimer.current = setTimeout(() => {
                    wasLongPress.current = true
                    openMenu(key.midi, trigger)
                  }, 500)
                }}
                onPointerUp={clearLongPress}
                onPointerCancel={clearLongPress}
                onPointerMove={(event) => {
                  const start = longPressStart.current
                  if (
                    start !== undefined &&
                    Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
                  )
                    clearLongPress()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                    event.preventDefault()
                    openMenu(key.midi, event.currentTarget)
                    return
                  }
                  const next =
                    event.key === 'ArrowRight'
                      ? key.midi + 1
                      : event.key === 'ArrowLeft'
                        ? key.midi - 1
                        : event.key === 'Home'
                          ? piano.startMidi
                          : event.key === 'End'
                            ? piano.startMidi + piano.octaves * 12
                            : undefined
                  if (next !== undefined) {
                    event.preventDefault()
                    event.currentTarget.parentElement
                      ?.querySelector<HTMLButtonElement>(`[data-piano-midi="${next}"]`)
                      ?.focus()
                  }
                  if (note !== undefined && (event.key === 'Delete' || event.key === 'Backspace')) {
                    event.preventDefault()
                    piano.toggleNote(key.midi)
                  }
                }}
              >
                <span
                  className={`piano-note ${note === undefined ? 'piano-note--preview' : ''}`}
                  aria-hidden="true"
                  style={{ color: display.color, opacity: note?.isDimmed ? 0.42 : undefined }}
                >
                  <span className="piano-note-primary">{display.label.primary}</span>
                  {display.label.secondary === undefined ? undefined : (
                    <span className="piano-note-secondary">{display.label.secondary}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
        <div
          className="piano-octave-labels"
          style={{ minWidth: layout.width, maxWidth: layout.width * 1.5 }}
        >
          {layout.keys
            .filter((key) => key.midi % 12 === 0 || key.midi === piano.startMidi)
            .map((key) => (
              <span
                key={key.midi}
                style={{ left: `${((key.x + key.width / 2) / layout.width) * 100}%` }}
              >
                {getMidiLabel(key.midi)}
              </span>
            ))}
        </div>
      </div>
      {menu === undefined
        ? undefined
        : createPortal(
            <div
              ref={menuRef}
              className={m3MenuContainerClass}
              style={{ left: menu.x, top: menu.y, width: 220 }}
              role="menu"
              aria-label={t('piano.noteMenu', { note: getMidiLabel(menu.midi) })}
              onKeyDown={(event) => {
                if (event.key === 'Escape' || event.key === 'Tab') {
                  if (event.key === 'Escape') event.preventDefault()
                  closeMenu()
                }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault()
                  const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
                  const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
                  buttons[
                    (current + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) %
                      buttons.length
                  ]?.focus()
                }
              }}
            >
              {menuNote === undefined ? (
                <button
                  type="button"
                  role="menuitem"
                  className={m3MenuItemClass}
                  onClick={() => {
                    piano.toggleNote(menu.midi)
                    closeMenu()
                  }}
                >
                  {t('piano.addNote')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className={m3MenuItemClass}
                    onClick={() => {
                      piano.toggleStyle(menu.midi, 'isEmphasized')
                      closeMenu()
                    }}
                  >
                    {t(menuNote.isEmphasized ? 'context.deemphasize' : 'context.emphasize')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={m3MenuItemClass}
                    onClick={() => {
                      piano.toggleStyle(menu.midi, 'isDimmed')
                      closeMenu()
                    }}
                  >
                    {t(menuNote.isDimmed ? 'context.undim' : 'context.dim')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={m3MenuItemClass}
                    onClick={() => {
                      piano.toggleNote(menu.midi)
                      closeMenu()
                    }}
                  >
                    {t('context.delete')}
                  </button>
                </>
              )}
            </div>,
            document.body,
          )}
    </section>
  )
}
