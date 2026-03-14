import type { AppLocale } from '../i18n/config'

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    platform?: string
  }
}

const getPlatformText = (): string => {
  if (typeof navigator === 'undefined') {
    return ''
  }

  const platformFromUserAgentData = (navigator as NavigatorWithUserAgentData).userAgentData
    ?.platform
  if (platformFromUserAgentData !== undefined) {
    return platformFromUserAgentData
  }
  return navigator.platform
}

export const isMacLikePlatform = (): boolean => {
  const platformText = getPlatformText().toLowerCase()
  return platformText.includes('mac')
}

const getClickLabel = (locale: AppLocale): string => (locale === 'ja' ? 'クリック' : 'Click')

export const isEmphasisShortcutPressed = (metaKey: boolean, ctrlKey: boolean): boolean => {
  if (isMacLikePlatform()) {
    return metaKey
  }
  return ctrlKey
}

export const getEmphasisShortcutLabel = (locale: AppLocale = 'en'): string => {
  const clickLabel = getClickLabel(locale)

  if (isMacLikePlatform()) {
    return `⌘ + ${clickLabel}`
  }
  return `Ctrl + ${clickLabel}`
}

export const isDimShortcutPressed = (
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean => {
  if (!altKey) {
    return false
  }

  if (isMacLikePlatform()) {
    return !metaKey
  }

  return !ctrlKey
}

export const getDimShortcutLabel = (locale: AppLocale = 'en'): string => {
  const clickLabel = getClickLabel(locale)

  if (isMacLikePlatform()) {
    return `⌥ + ${clickLabel}`
  }
  return `Alt + ${clickLabel}`
}

export const isBendShortcutPressed = (
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean => {
  if (!altKey) {
    return false
  }

  if (isMacLikePlatform()) {
    return metaKey
  }

  return ctrlKey
}

export const getBendShortcutLabel = (locale: AppLocale = 'en'): string => {
  const clickLabel = getClickLabel(locale)

  if (isMacLikePlatform()) {
    return `⌥ + ⌘ + ${clickLabel}`
  }
  return `Alt + Ctrl + ${clickLabel}`
}

export const isUndoShortcutPressed = (
  key: string,
  metaKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
): boolean => {
  if (key.toLowerCase() !== 'z' || shiftKey) {
    return false
  }

  if (isMacLikePlatform()) {
    return metaKey
  }
  return ctrlKey
}

export const isRedoShortcutPressed = (
  key: string,
  metaKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
): boolean => {
  const lowerKey = key.toLowerCase()
  if (isMacLikePlatform()) {
    return lowerKey === 'z' && metaKey && shiftKey
  }
  return lowerKey === 'y' && ctrlKey
}

export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const tagName = target.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

export const isSelectionDeleteShortcutPressed = (key: string): boolean =>
  key === 'Backspace' || key === 'Delete'

export const getSelectionDeleteShortcutLabel = (): string => 'Backspace'
