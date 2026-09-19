import type { Page } from '@playwright/test'

export const getHistoryShortcuts = async (page: Page) => {
  const isMacLikePlatform = await page.evaluate(() => {
    const navigatorWithUserAgentData = navigator as Navigator & {
      userAgentData?: { platform?: string }
    }
    const platform = navigatorWithUserAgentData.userAgentData?.platform ?? navigator.platform
    return platform.toLowerCase().includes('mac')
  })

  return isMacLikePlatform
    ? { redo: 'Meta+Shift+z', undo: 'Meta+z' }
    : { redo: 'Control+y', undo: 'Control+z' }
}
