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
