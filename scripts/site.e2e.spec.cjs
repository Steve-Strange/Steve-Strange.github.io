const { test, expect } = require('playwright/test');
const base = process.env.ARCADE_URL || 'http://127.0.0.1:8766';
test.use({ launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const width of [1440, 390, 320]) {
  test(`navigation, locale and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['/', '/publications/', '/publications/dspt/', '/arcade/', '/archives/']) {
      await page.goto(base + route);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('#global-header')).toBeVisible();
      if (width < 1051) await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('#site-nav a')).toHaveText(['Research', 'Publications', 'Systems', 'Arcade', 'Background', 'Blog']);
      await expect(page.locator('#site-nav a[href="/publications/"]')).toBeVisible();
      if (width < 1051) {
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'false');
      }
      await page.locator('[data-language-switch]').click();
      await expect(page).toHaveURL(base + '/zh' + route);
      await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === '/publications/') {
        await page.locator('.paper-card').last().scrollIntoViewIfNeeded();
        await expect.poll(() => page.locator('.card-image img').evaluateAll(imgs => imgs.length === 6 && imgs.every(i => i.complete && i.naturalWidth))).toBe(true);
      }
      if (route === '/publications/dspt/') await page.screenshot({ path: `artifacts/visualizations/dspt-${width}.png` });
    }
    expect(errors).toEqual([]);
  });
}

test('language switch preserves section and selected game; standalone games retain navigation', async ({ page }) => {
  await page.goto(base + '/publications/dspt/#results');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL(base + '/zh/publications/dspt/#results');
  await page.goto(base + '/arcade/?game=gomoku');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL(base + '/zh/arcade/?game=gomoku');
  await expect(page.locator('#game-title')).toHaveText('五子棋');
  await expect(page.frameLocator('#game-frame').locator('#board')).toBeVisible();
  await page.goto(base + '/arcade/gomoku/');
  await expect(page.locator('#global-header')).toBeVisible();
  await expect(page.frameLocator('.standalone-game iframe').locator('#board')).toBeVisible();
});

test('research content and language links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base + '/publications/fanpad/');
  await expect(page.locator('.abstract')).toContainText('19.73');
  await expect(page.locator('.role')).toContainText('Co-first author');
  await page.locator('[data-language-switch]').click();
  await expect(page.locator('.role')).toContainText('共同第一作者（署名第二）');
  await expect(page.locator('.abstract')).toContainText('摘要（中文翻译）');
  await context.close();
});
