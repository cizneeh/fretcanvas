import { readFile } from 'node:fs/promises'
import { type CDPSession, expect, test } from '@playwright/test'
import { getHistoryShortcuts } from './shortcuts'

async function swipe(
  cdp: CDPSession,
  start: { x: number; y: number },
  delta: { x: number; y: number },
) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] })
  for (let step = 1; step <= 8; step += 1) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: start.x + (delta.x * step) / 8, y: start.y + (delta.y * step) / 8 }],
    })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

test('piano black-key editing, context menus, history and persistence', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/piano')
  await expect(page.locator('[data-piano-midi]')).toHaveCount(25)
  await expect(page.locator('.piano-key--black')).toHaveCount(10)
  await page.getByRole('button', { name: 'Both', exact: true }).click()
  const key = page.getByRole('button', { name: 'C#4', exact: true })
  await key.click()
  await expect(key).toHaveAttribute('aria-pressed', 'true')
  await key.click({ button: 'right' })
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Add Bend' })).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'Emphasize', exact: true }).click()
  await expect(key).toHaveAttribute('data-note-emphasized', 'true')
  const shortcuts = await getHistoryShortcuts(page)
  await page.keyboard.press(shortcuts.undo)
  await expect(key).toHaveAttribute('data-note-emphasized', 'false')
  await page.keyboard.press(shortcuts.redo)
  await expect(key).toHaveAttribute('data-note-emphasized', 'true')
  await key.focus()
  await key.press('Shift+F10')
  await page.getByRole('menuitem', { name: 'Dim', exact: true }).click()
  await expect(key).toHaveAttribute('data-note-dimmed', 'true')
  await expect(key).toHaveAttribute('data-note-emphasized', 'false')
  await page.reload()
  await expect(key).toHaveAttribute('data-note-dimmed', 'true')
  expect(errors).toEqual([])
})

test('C4 transfers between instruments without changing octave, including reload and language', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Key', { exact: true }).selectOption('6')
  await page.getByRole('button', { name: 'Both', exact: true }).click()
  const c4 = page.locator('[data-position-id="1:1"]')
  await c4.click()
  await page.getByRole('link', { name: 'Piano', exact: true }).click()
  await expect(page.getByLabel('Key', { exact: true })).toHaveValue('6')
  await expect(page.getByRole('button', { name: 'Both', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('button', { name: 'C4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('button', { name: 'C3', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await page.getByRole('button', { name: 'C#4', exact: true }).click()
  await page.getByRole('link', { name: 'Guitar', exact: true }).click()
  await expect(page.locator('[data-note-highlighted="true"]')).toHaveCount(10)
  await expect(c4).toHaveAttribute('data-note-highlighted', 'true')
  await page.getByRole('link', { name: 'Piano', exact: true }).click()
  await page.getByRole('link', { name: 'Switch language to Japanese' }).click()
  await expect(page).toHaveURL(/\/ja\/piano/)
  await expect(page.getByRole('button', { name: 'C#4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.getByRole('button', { name: 'C4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('changing only a tuning octave changes the pitch transferred to piano', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Tuning', exact: true }).click()
  await page.getByLabel('String 2 octave', { exact: true }).selectOption('4')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.locator('[data-position-id="1:1"]').click()
  await page.getByRole('link', { name: 'Piano', exact: true }).click()
  await expect(page.getByRole('button', { name: 'C5', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('button', { name: 'C4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await page.goBack()
  await expect(page.locator('[data-position-id="1:1"]')).toHaveAttribute(
    'data-note-highlighted',
    'true',
  )
})

test('chord addition includes black keys, range changes retain offscreen notes, exports are valid', async ({
  page,
}) => {
  await page.goto('/piano')
  await page.getByRole('button', { name: 'Chord', exact: true }).click()
  const input = page.getByPlaceholder('Cmaj7, Dm7(11), Cmaj7/B...')
  await input.fill('C7(b9)')
  await input.press('Enter')
  await page.getByRole('button', { name: 'Both', exact: true }).click()
  await page.getByRole('button', { name: 'Add Chord Tones', exact: true }).click()
  await expect(page.locator('[data-note-highlighted="true"]')).toHaveCount(11)
  await expect(page.getByRole('button', { name: 'C#4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByLabel('Start note', { exact: true }).selectOption('72')
  await page.getByLabel('Start note', { exact: true }).selectOption('48')
  await expect(page.locator('[data-note-highlighted="true"]')).toHaveCount(11)
  await page.getByRole('button', { name: 'Export Settings' }).click()
  await page.getByRole('button', { name: 'SVG', exact: true }).click()
  const svgPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export SVG' }).click()
  const svg = await svgPromise
  const svgPath = await svg.path()
  expect(svgPath).toBeTruthy()
  const text = await readFile(svgPath as string, 'utf8')
  expect(text).toContain('C#')
  expect(text).toContain('b9')
  expect(text).toContain('viewBox="0 0 992 348"')
  await page.getByLabel('First key', { exact: true }).selectOption('61')
  await page.getByLabel('Last key', { exact: true }).selectOption('67')
  const croppedPreview = await page.getByAltText('Export preview').getAttribute('src')
  const croppedSvg = decodeURIComponent(croppedPreview?.split(',')[1] ?? '')
  expect(croppedSvg).toContain('viewBox="0 0 352 348"')
  expect(croppedSvg).toContain('>C#</text>')
  expect(croppedSvg).not.toContain('>C</text>')
  await page.getByLabel('First key', { exact: true }).selectOption('48')
  await page.getByLabel('Last key', { exact: true }).selectOption('72')
  await page.getByRole('button', { name: 'PNG', exact: true }).click()
  const pngPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export PNG' }).click()
  const png = await pngPromise
  const pngPath = await png.path()
  const bytes = await readFile(pngPath as string)
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  expect(bytes.readUInt32BE(16)).toBe(1984)
  expect(bytes.readUInt32BE(20)).toBe(696)
})

test.describe('piano touch interactions', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('a long press tolerates finger movement without toggling the note', async ({ page }) => {
    await page.goto('/piano')
    await page.getByRole('button', { name: 'Both', exact: true }).click()
    const key = page.getByRole('button', { name: 'C3', exact: true })
    await key.scrollIntoViewIfNeeded()
    const box = await key.boundingBox()
    if (box === null) throw new Error('Missing C3 key')
    const touch = { x: box.x + box.width / 2, y: box.y + box.height - 60 }
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] })
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: touch.x + 3, y: touch.y + 3 }],
    })
    await expect(page.getByRole('menu')).toBeVisible()
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(key).toHaveAttribute('aria-pressed', 'false')
    await page.getByRole('menuitem', { name: 'Add note', exact: true }).click()
    await expect(key).toHaveAttribute('aria-pressed', 'true')
  })

  test('swipes on keys scroll both the page and the keyboard', async ({ page }) => {
    await page.goto('/piano')
    await page.getByRole('button', { name: 'Both', exact: true }).click()
    const key = page.getByRole('button', { name: 'C3', exact: true })
    await key.scrollIntoViewIfNeeded()
    const box = await key.boundingBox()
    if (box === null) throw new Error('Missing C3 key')
    const cdp = await page.context().newCDPSession(page)
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await swipe(cdp, { x: box.x + box.width / 2, y: box.y + box.height - 70 }, { x: 0, y: 120 })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore - 40)
    await key.scrollIntoViewIfNeeded()
    const currentBox = await key.boundingBox()
    if (currentBox === null) throw new Error('Missing C3 key')
    await swipe(
      cdp,
      { x: currentBox.x + 200, y: currentBox.y + currentBox.height - 70 },
      { x: -140, y: 0 },
    )
    await expect
      .poll(() => page.locator('.piano-scroll').evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(40)
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.locator('[data-note-highlighted="true"]')).toHaveCount(0)
  })
})

test('mobile keeps page controls inside viewport and keyboard scrolls horizontally', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/piano')
  await expect(page.getByLabel('Start note', { exact: true })).toBeVisible()
  const sizes = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
    keyboard: document.querySelector('.piano-scroll')?.scrollWidth,
  }))
  expect(sizes.page).toBeLessThanOrEqual(sizes.width)
  expect(sizes.keyboard).toBeGreaterThan(sizes.width)
  await page.getByRole('button', { name: 'C5', exact: true }).click()
  await expect(page.getByRole('button', { name: 'C5', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
