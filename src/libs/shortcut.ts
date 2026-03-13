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

export const isDimShortcutPressed = (metaKey: boolean, ctrlKey: boolean): boolean => {
  if (isMacLikePlatform()) {
    return metaKey
  }
  return ctrlKey
}

export const getDimShortcutLabel = (): string => {
  if (isMacLikePlatform()) {
    return '⌘ + Click'
  }
  return 'Ctrl + Click'
}

export const isBendShortcutPressed = (altKey: boolean): boolean => altKey

export const getBendShortcutLabel = (): string => {
  if (isMacLikePlatform()) {
    return '⌥ + Click'
  }
  return 'Alt + Click'
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
