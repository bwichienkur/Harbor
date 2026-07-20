import { chromium } from 'playwright'
import { copyFile, mkdir } from 'node:fs/promises'

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4173/'
const OUT_DIR = new URL('../demo/', import.meta.url)
const OUT_WEBM = new URL('../demo/harbor-ui-demo.webm', import.meta.url)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function dismissOnboarding(page) {
  const explore = page.getByRole('button', { name: /Explore Home/i })
  if (await explore.count()) {
    await explore.click({ force: true })
    await sleep(600)
  }
}

async function openTool(page, label) {
  await page.keyboard.press('Escape')
  await sleep(150)
  await page.locator(`button[aria-label="${label}"]`).click({ force: true })
  await sleep(500)
}

async function openStats(page) {
  await page.keyboard.press('Escape')
  await sleep(150)
  await page.locator('button[aria-label="More tools"]').click({ force: true })
  await page.locator('.more-dropdown').waitFor({ state: 'visible', timeout: 3000 })
  await page.locator('.more-dropdown button', { hasText: 'Stats' }).click({ force: true })
  await sleep(500)
}

async function closePanel(page) {
  await page.keyboard.press('Escape')
  await sleep(350)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'],
  })

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: OUT_DIR.pathname,
      size: { width: 1440, height: 900 },
    },
  })

  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(800)
  await dismissOnboarding(page)

  // Disable soft-clear / auto-clear so chrome stays visible
  await page.evaluate(() => {
    const key = 'harbor-focus-dashboard'
    const raw = localStorage.getItem(key)
    let data
    try {
      data = raw ? JSON.parse(raw) : { state: {}, version: 0 }
    } catch {
      data = { state: {}, version: 0 }
    }
    const state = data.state || data
    state.settings = {
      ...(state.settings || {}),
      softClearFocus: false,
      autoClearOnStart: false,
      onboardingComplete: true,
    }
    state.clearMode = false
    state.panel = 'none'
    localStorage.setItem(key, JSON.stringify(data.state ? data : { state, version: 0 }))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await sleep(900)
  await dismissOnboarding(page)

  // 1) Home — brand + timer
  await page.mouse.move(720, 420)
  await sleep(1400)

  // 2) Focus mode
  await page.getByRole('tab', { name: /Focus/i }).click({ force: true })
  await sleep(1000)

  // 3) Start timer
  await page.locator('.timer-card').hover()
  await sleep(250)
  await page.locator('.timer-card .timer-controls button.primary').click({ force: true })
  await sleep(1800)

  // 4) Pause
  await page.locator('.timer-card').hover()
  await sleep(200)
  await page.locator('.timer-card .timer-controls button.primary').click({ force: true })
  await sleep(700)

  // 5) Tasks
  await openTool(page, 'Tasks')
  await sleep(700)
  const add = page.getByPlaceholder(/Add a task|What will you focus/i)
  if (await add.count()) {
    await add.fill('Ship Harbor demo')
    await page.keyboard.press('Enter')
    await sleep(800)
  } else {
    const input = page.locator('.tasks-panel input, .panel-section input[type="text"]').first()
    if (await input.count()) {
      await input.fill('Ship Harbor demo')
      await page.keyboard.press('Enter')
      await sleep(800)
    }
  }
  await closePanel(page)

  // 6) Themes
  await openTool(page, 'Themes')
  await sleep(600)
  const coding = page.locator('.theme-card').filter({ hasText: 'Coding Desk' }).first()
  if (await coding.count()) {
    await coding.click({ force: true })
  } else {
    await page.locator('.theme-card').nth(1).click({ force: true })
  }
  await sleep(1200)
  await closePanel(page)

  // 7) Sounds
  await openTool(page, 'Sounds')
  await sleep(600)
  const rain = page.locator('.sound-btn').filter({ hasText: 'Rain' }).first()
  if (await rain.count()) await rain.click({ force: true })
  await sleep(1000)
  await closePanel(page)

  // 8) Stats
  await openStats(page)
  await sleep(1400)
  await closePanel(page)

  // 9) Break mode + start
  await page.getByRole('tab', { name: /Break/i }).click({ force: true })
  await sleep(1000)
  await page.locator('.timer-card').hover()
  await page.locator('.timer-card .timer-controls button.primary').click({ force: true })
  await sleep(1400)

  // 10) Home finish
  await page.getByRole('tab', { name: /Home/i }).click({ force: true })
  await sleep(1600)

  const video = page.video()
  await context.close()
  await browser.close()

  const videoPath = await video.path()
  await copyFile(videoPath, OUT_WEBM.pathname)
  console.log('Saved', OUT_WEBM.pathname)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
