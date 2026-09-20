import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('the homepage renders the real organisation', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Haven Healing Hands Initiative/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('the header is the logo teal, not near-black', async ({ page }) => {
    await page.goto('/')

    // #006d77 is the colour sampled from public/logo.png. The bug this guards
    // against is the whole site rendering in #041b1d, which shares only a hue
    // with the mark.
    const header = page.locator('header').first()
    await expect(header).toHaveCSS('background-color', 'rgb(0, 109, 119)')
  })

  test('every programme on the listing is a link to its own page', async ({ page }) => {
    await page.goto('/programs')

    const links = page.locator('a[href^="/programs/"]')
    expect(await links.count()).toBeGreaterThan(0)

    const href = await links.first().getAttribute('href')
    await page.goto(href!)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('completed outreaches have their own section and pages', async ({ page }) => {
    await page.goto('/programs')

    await expect(page.locator('#completed')).toBeVisible()
    await expect(
      page.locator('#completed a[href="/programs/christmas-charity-outreach-2024"]'),
    ).toBeVisible()
  })

  test('listings with no content show an empty state rather than a blank page', async ({
    page,
  }) => {
    await page.goto('/blog')
    await expect(page.getByText('We have not published anything here yet')).toBeVisible()

    await page.goto('/events')
    await expect(page.getByText('No events are scheduled right now')).toBeVisible()
  })
})
