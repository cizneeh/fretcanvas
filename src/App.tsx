import { useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { ExportSettingsSection } from './components/ExportSettingsSection'
import { FretboardView } from './components/FretboardView'
import {
  m3SegmentedButtonClass,
  m3SegmentedContainerClass,
} from './components/ui/materialClasses'
import { useI18n } from './i18n/useI18n'
import { isEditableTarget, isRedoShortcutPressed, isUndoShortcutPressed } from './libs/shortcut'
import { initializeHistoryBindings } from './stores/historyBindings'
import { useHistoryStore } from './stores/historyStore'
import { useSettingsStore } from './stores/settingsStore'

const SUPPORT_URL = 'https://ko-fi.com/G2G31BLRA7'
const WEBSITE_URL = 'https://echizen.me'
const X_URL = 'https://x.com/cizneeh'

function App() {
  const { locale, t } = useI18n()
  const setLocale = useSettingsStore((state) => state.setLocale)

  useEffect(() => {
    initializeHistoryBindings()
  }, [])

  const undo = useHistoryStore((state) => state.undo)
  const redo = useHistoryStore((state) => state.redo)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (isUndoShortcutPressed(event.key, event.metaKey, event.ctrlKey, event.shiftKey)) {
        event.preventDefault()
        undo()
        return
      }

      if (isRedoShortcutPressed(event.key, event.metaKey, event.ctrlKey, event.shiftKey)) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [undo, redo])

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-8 text-zinc-100 md:px-8">
      <header className="fixed inset-x-0 top-0 z-30 bg-[color:var(--md-sys-color-surface-container-low)]/42 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[106rem] items-center justify-between gap-4 px-4 py-2 md:px-8">
          <h1 className="text-xl font-medium tracking-tight text-zinc-100/92">Fret Canvas</h1>

          <fieldset className={m3SegmentedContainerClass}>
            <legend className="sr-only">{t('app.language')}</legend>
            <button
              type="button"
              aria-pressed={locale === 'en'}
              className={m3SegmentedButtonClass(locale === 'en')}
              aria-label={t('app.switchToEnglish')}
              onClick={() => {
                setLocale('en')
              }}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={locale === 'ja'}
              className={m3SegmentedButtonClass(locale === 'ja')}
              aria-label={t('app.switchToJapanese')}
              onClick={() => {
                setLocale('ja')
              }}
            >
              JA
            </button>
          </fieldset>
        </div>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-[106rem] flex-1 flex-col gap-6 pt-10">
        <ControlPanel />

        <FretboardView />

        <ExportSettingsSection />
      </div>

      <footer
        className="mx-auto mt-10 flex w-full max-w-[106rem] items-center justify-between gap-3 border-t px-1 pt-4 text-sm text-[color:var(--md-sys-color-on-surface-variant)]"
        style={{
          borderTopColor:
            'color-mix(in srgb, var(--md-sys-color-outline-variant) 90%, transparent)',
        }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p>
            Made by{' '}
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
              className="m3-focus-ring underline decoration-[color:var(--md-sys-color-outline)] underline-offset-4 transition-colors duration-150 hover:text-[color:var(--md-sys-color-on-surface)] hover:decoration-[color:var(--md-sys-color-on-surface)]"
            >
              Shinjiro Echizen
            </a>
          </p>

          <p>
            {t('footer.feedbackPrefix')}
            <a
              href={X_URL}
              target="_blank"
              rel="noreferrer"
              className="m3-focus-ring underline decoration-[color:var(--md-sys-color-outline)] underline-offset-4 transition-colors duration-150 hover:text-[color:var(--md-sys-color-on-surface)] hover:decoration-[color:var(--md-sys-color-on-surface)]"
            >
              X
            </a>
            {t('footer.feedbackSuffix')}
          </p>
        </div>

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t('support.aria')}
          aria-describedby="support-tooltip"
          className="group relative m3-focus-ring shrink-0 transition-transform duration-150 hover:scale-105"
        >
          <span
            id="support-tooltip"
            role="tooltip"
            className="pointer-events-none absolute bottom-full right-0 mb-3 w-[18rem] translate-y-1 rounded-[var(--md-shape-md)] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-high)] px-3 py-2.5 text-left text-xs leading-5 text-[color:var(--md-sys-color-on-surface)] opacity-0 shadow-[var(--md-elevation-2)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
          >
            <span>{t('support.tooltipBody')}</span>
          </span>
          <img
            src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
            height="36"
            style={{ border: 0, height: 36 }}
          />
        </a>
      </footer>
    </main>
  )
}

export default App
