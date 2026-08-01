import { expect, test } from '@playwright/test'

test('loads the English app and fretboard', async ({ page }) => {
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

test('adds scale notes to the fretboard', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: 'Select scale' }).selectOption('major')
  await page.getByRole('button', { name: 'Add Scale Notes' }).click()

  await expect(page.getByText('Scale Notes', { exact: true })).toBeVisible()
  await expect(page.locator('[data-note-highlighted="true"]').first()).toBeVisible()
})

test('applies a manually entered chord with Enter', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Chord', exact: true }).click()
  const chordInput = page.getByPlaceholder('Cmaj7, Dm7(11), Cmaj7/B...')
  await chordInput.fill('Cmaj7')
  await chordInput.press('Enter')

  const appliedChord = page.getByText('Applied Chord', { exact: true }).locator('..')
  await expect(appliedChord).toContainText('Cmaj7')
  await expect(page.getByText('Chord Notes', { exact: true })).toBeVisible()
})

test('generates and opens the PNG export preview', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Export Settings' }).click()
  const preview = page.getByRole('img', { name: 'Export preview', exact: true })

  await expect(preview).toBeVisible()
  await expect(preview).toHaveAttribute('src', /^data:image\/png;base64,/)
  await preview.click()
  await expect(page.getByRole('img', { name: 'Export preview enlarged' })).toBeVisible()
})
