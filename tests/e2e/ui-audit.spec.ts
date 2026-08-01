import { readFile } from 'node:fs/promises'
import { expect, type Page, test } from '@playwright/test'

type PageHealth = {
  consoleErrors: string[]
  pageErrors: string[]
  requestFailures: string[]
  serverErrors: string[]
}

const pageHealthByPage = new WeakMap<Page, PageHealth>()

test.beforeEach(async ({ page }) => {
  const health: PageHealth = {
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
    serverErrors: [],
  }
  pageHealthByPage.set(page, health)

  page.on('console', (message) => {
    if (message.type() === 'error') {
      health.consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    health.pageErrors.push(error.message)
  })
  page.on('requestfailed', (request) => {
    health.requestFailures.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown error'}`,
    )
  })
  page.on('response', (response) => {
    if (response.status() >= 500) {
      health.serverErrors.push(`${response.status()} ${response.url()}`)
    }
  })
})

test.afterEach(async ({ page }, testInfo) => {
  const health = pageHealthByPage.get(page)
  if (health === undefined) {
    return
  }

  const issues = Object.values(health).flat()
  if (issues.length > 0) {
    await testInfo.attach('page-health.json', {
      body: JSON.stringify(health, undefined, 2),
      contentType: 'application/json',
    })
  }

  expect(health.consoleErrors, 'console errors').toEqual([])
  expect(health.pageErrors, 'uncaught page errors').toEqual([])
  expect(health.requestFailures, 'failed network requests').toEqual([])
  expect(health.serverErrors, 'HTTP 5xx responses').toEqual([])
})

const getHistoryShortcuts = async (page: Page) => {
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

test('renders the English app and fretboard', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Fret Canvas')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('button', { name: 'Tuning', exact: true })).toBeVisible()
  await expect(page.locator('[data-fret-cell="true"]').first()).toBeVisible()
})

test('loads the Japanese app', async ({ page }) => {
  await page.goto('/ja/')

  await expect(page).toHaveTitle('Fret Canvas')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByRole('button', { name: 'チューニング', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'スケール音を追加' })).toBeVisible()
})

test('adds scale notes and supports undo and redo', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: 'Select scale' }).selectOption('major')
  await page.getByRole('button', { name: 'Add Scale Notes' }).click()

  await expect(page.getByText('Scale Notes', { exact: true })).toBeVisible()
  const highlightedNotes = page.locator('[data-note-highlighted="true"]')
  await expect(highlightedNotes.first()).toBeVisible()
  const highlightedNoteCount = await highlightedNotes.count()
  const historyShortcuts = await getHistoryShortcuts(page)

  await page.keyboard.press(historyShortcuts.undo)
  await expect(highlightedNotes).toHaveCount(0)

  await page.keyboard.press(historyShortcuts.redo)
  await expect(highlightedNotes).toHaveCount(highlightedNoteCount)
})

test('applies a chord, adds its tones, and supports undo and redo', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Chord', exact: true }).click()
  const chordInput = page.getByPlaceholder('Cmaj7, Dm7(11), Cmaj7/B...')
  await chordInput.fill('Cmaj7')
  await chordInput.press('Enter')

  const appliedChord = page.getByText('Applied Chord', { exact: true }).locator('..')
  await expect(appliedChord).toContainText('Cmaj7')
  await expect(page.getByText('Chord Notes', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Add Chord Tones' }).click()
  const highlightedNotes = page.locator('[data-note-highlighted="true"]')
  await expect(highlightedNotes.first()).toBeVisible()
  const highlightedNoteCount = await highlightedNotes.count()
  const historyShortcuts = await getHistoryShortcuts(page)

  await page.keyboard.press(historyShortcuts.undo)
  await expect(highlightedNotes).toHaveCount(0)
  await expect(appliedChord).toContainText('Cmaj7')

  await page.keyboard.press(historyShortcuts.redo)
  await expect(highlightedNotes).toHaveCount(highlightedNoteCount)
})

test('opens a note context menu with a real right click', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: 'Select scale' }).selectOption('major')
  await page.getByRole('button', { name: 'Add Scale Notes' }).click()

  const highlightedNote = page.locator('[data-note-highlighted="true"]').first()
  await highlightedNote.click({ button: 'right' })
  await expect(page.getByRole('button', { name: /^Emphasize/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Dim/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Add Bend/ })).toBeVisible()

  await page.getByRole('button', { name: /^Emphasize/ }).click()
  await expect(highlightedNote.locator('span[aria-hidden="true"]')).toBeVisible()

  await highlightedNote.click({ button: 'right' })
  await expect(page.getByRole('button', { name: /^Remove Emphasis/ })).toBeVisible()
})

test('persists tuning, chord, export settings, and language after reload', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Tuning', exact: true }).click()
  const tuningDialog = page.getByRole('dialog', { name: 'Tuning' })
  await tuningDialog.getByLabel('Preset').selectOption('bass4')
  await tuningDialog.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.locator('[data-fret-cell="true"]')).toHaveCount(100)

  await page.getByRole('button', { name: 'Chord', exact: true }).click()
  const chordInput = page.getByPlaceholder('Cmaj7, Dm7(11), Cmaj7/B...')
  await chordInput.fill('Cmaj7')
  await chordInput.press('Enter')
  await page.getByRole('button', { name: 'Add Chord Tones' }).click()

  await page.getByTestId('fret-selector-12').click()
  await page.getByRole('button', { name: 'Export Settings' }).click()
  await page.getByRole('button', { name: '50%' }).click()
  await expect(page.getByText('Frets 12 - 24', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Background opacity percentage')).toHaveValue('50')

  await page.getByRole('link', { name: 'Switch language to Japanese' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.locator('[data-fret-cell="true"]')).toHaveCount(100)
  await expect(page.getByText('適用中のコード', { exact: true }).locator('..')).toContainText(
    'Cmaj7',
  )

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.locator('[data-fret-cell="true"]')).toHaveCount(100)
  await expect(page.getByText('適用中のコード', { exact: true }).locator('..')).toContainText(
    'Cmaj7',
  )
  await expect(page.locator('[data-note-highlighted="true"]').first()).toBeVisible()

  await page.getByRole('button', { name: 'エクスポート設定' }).click()
  await expect(page.getByText('12 - 24フレット', { exact: true })).toBeVisible()
  await expect(page.getByLabel('背景不透明度のパーセント')).toHaveValue('50')
})

test('generates, previews, and downloads a valid PNG export', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Export Settings' }).click()
  const preview = page.getByRole('img', { name: 'Export preview', exact: true })

  await expect(preview).toBeVisible()
  await expect(preview).toHaveAttribute('src', /^data:image\/png;base64,/)
  await preview.click()
  await expect(page.getByRole('img', { name: 'Export preview enlarged' })).toBeVisible()

  await page.getByRole('button', { name: 'Close', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export PNG', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.png$/i)

  const downloadPath = await download.path()
  expect(downloadPath).not.toBeNull()
  const pngBytes = await readFile(downloadPath as string)
  expect(pngBytes.length).toBeGreaterThan(8)
  expect([...pngBytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
})
