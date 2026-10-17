const { test, expect } = require('playwright/test');
const base = process.env.ARCADE_URL || 'http://127.0.0.1:8766';
test.use({ launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const width of [1440, 1050, 390, 320]) {
  test(`navigation, locale and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['/', '/publications/', '/publications/dspt/', '/arcade/', '/investment/', '/archives/']) {
      await page.goto(base + route);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('#global-header')).toBeVisible();
      if (width < 1051) await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('#site-nav a')).toHaveText(['Research', 'Publications', 'Systems', 'Background', 'Arcade', 'Investment', 'Blog']);
      await expect(page.locator('#site-nav a[href="/#publications"]')).toBeVisible();
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

  test(`homepage sections and detail links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const prefix of ['', '/zh']) {
      await page.goto(base + prefix + '/');
      // Scrolling stays in the same document; a navigation would replace this marker.
      await page.evaluate(() => { window.navigationMarker = true; });
      for (const section of ['research', 'publications', 'projects', 'experience', 'arcade', 'investment', 'blog']) {
        if (width < 1051) await page.locator('[data-menu-toggle]').click();
        const link = page.locator(`#site-nav a[data-section="${section}"]`);
        await link.click();
        await expect(page).toHaveURL(base + prefix + '/#' + section);
        await expect(link).toHaveAttribute('aria-current', 'location');
        expect(await page.evaluate(() => window.navigationMarker)).toBe(true);
        const title = await page.locator(`#${section} h2`).boundingBox();
        expect(title.y).toBeGreaterThanOrEqual(await page.locator('#global-header').evaluate(el => el.offsetHeight));
        expect(title.y).toBeLessThan(900);
        if (width < 1051) await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'false');
      }
      await page.locator('#arcade .game-preview').nth(1).click();
      await expect(page).toHaveURL(base + prefix + '/arcade/?game=gomoku');
      await expect(page.frameLocator('#game-frame').locator('#board')).toBeVisible();
      await page.locator('.page-breadcrumb a').click();
      await expect(page).toHaveURL(base + prefix + '/#arcade');
      await page.locator('#investment .section-action a').click();
      await expect(page).toHaveURL(base + prefix + '/investment/');
      await page.locator('.investment-toc a[href="#simulation"]').click();
      await expect(page.locator('#simulation')).toBeInViewport();
      await page.locator('[data-language-switch]').click();
      await expect(page).toHaveURL(base + (prefix ? '' : '/zh') + '/investment/#simulation');
    }
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

test('mobile navigation and investment sources work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto(base + '/zh/');
  await page.locator('#site-nav a[href="/zh/#investment"]').click();
  await page.locator('#investment .section-action a').click();
  await expect(page).toHaveURL(base + '/zh/investment/');
  await expect(page.locator('#site-nav a')).toHaveText(['研究', '论文', '系统', '经历', '游戏', '投资笔记', '博客']);
  await expect(page.locator('#channels a').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('archived article language switches refresh the shared navigation', async ({ page }) => {
  await page.goto(base + '/2023/01/08/00-00-00/?lang=zh');
  await expect(page.locator('#site-nav a')).toHaveText(['研究', '论文', '系统', '经历', '游戏', '投资笔记', '博客']);
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL(base + '/2023/01/08/00-00-00/');
  await expect(page.locator('#site-nav a')).toHaveText(['Research', 'Publications', 'Systems', 'Background', 'Arcade', 'Investment', 'Blog']);
  await page.locator('[data-language-switch]').click();
  await expect(page.locator('#site-nav a[data-section="investment"]')).toHaveText('投资笔记');
  await page.locator('#site-nav a[data-section="investment"]').click();
  await expect(page).toHaveURL(base + '/zh/#investment');
  await expect(page.locator('#investment h2')).toBeInViewport();
});
