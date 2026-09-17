const path = require('node:path');
const { test, expect } = require('playwright/test');
const { PNG } = require('playwright-core/lib/utilsBundle');

const base = process.env.ARCADE_URL || 'http://127.0.0.1:8765';
const output = path.join(__dirname, '..', 'artifacts', 'visualizations');
test.use({ launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

function pixelCount(buffer) {
  const { data } = PNG.sync.read(buffer);
  const colors = new Map();
  for (let i = 0; i < data.length; i += 16) {
    const color = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`;
    colors.set(color, (colors.get(color) || 0) + 1);
  }
  return { colors: colors.size, foreground: 1 - Math.max(...colors.values()) / (data.length / 16) };
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`six games render and fit at ${viewport.width}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    for (const game of ['recoil', 'pinball', 'sky-hopper', 'gomoku', 'dino', 'racer']) {
      await page.goto(`${base}/arcade/?game=${game}`);
      const frame = page.frameLocator('#game-frame');
      await expect(frame.locator('canvas').first()).toBeVisible();
      await expect(page.locator('#frame-error')).toBeHidden();
      await expect(frame.locator('.back')).toBeHidden();
      await expect(page.locator(`.game-card[data-game="${game}"]`)).toHaveAttribute('aria-current', 'true');
      expect(await page.locator('.game-card img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const box = await page.locator('#game-frame').boundingBox();
      const side = await page.locator('.game-info').boundingBox();
      if (viewport.width > 760) expect(side.x).toBeGreaterThanOrEqual(box.x + box.width);
      else expect(side.y).toBeGreaterThanOrEqual(box.y + box.height);
      const pixels = pixelCount(await frame.locator('canvas').first().screenshot());
      expect(pixels.colors).toBeGreaterThan(8);
      expect(pixels.foreground).toBeGreaterThan(.015);
      if (game === 'pinball' || game === 'gomoku' || game === 'recoil') await page.screenshot({ path: path.join(output, `${game}-${viewport.width}.png`), fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('game switching, URL history, mode, pause, mute and restart', async ({ page }) => {
  await page.goto(`${base}/arcade/`);
  const frame = page.frameLocator('#game-frame');
  await page.getByRole('button', { name: 'Local two-player', exact: true }).click();
  await expect(frame.locator('#game-shell')).toHaveAttribute('data-mode', 'pvp');
  await frame.locator('#overlay').click();
  await expect(frame.locator('#game-shell')).toHaveAttribute('data-state', 'playing');
  await page.locator('#mute-game').click();
  await expect.poll(() => page.frames()[1].evaluate(() => window.arcadeMuted)).toBe(true);
  await page.locator('.game-card[data-game="dino"]').click();
  await expect(page).toHaveURL(/game=dino/);
  await expect.poll(() => page.frames()[1].evaluate(() => window.arcadeMuted)).toBe(true);
  await frame.locator('#start').click();
  await page.waitForTimeout(200);
  await page.locator('#pause-game').click();
  await expect(page.locator('#resume-game')).toBeVisible();
  await expect.poll(() => page.frames()[1].evaluate(() => window.arcadePaused)).toBe(true);
  const score = await frame.locator('#game').getAttribute('data-score');
  await page.waitForTimeout(250);
  await expect(frame.locator('#game')).toHaveAttribute('data-score', score);
  await page.locator('#resume-game').click();
  await expect.poll(() => frame.locator('#game').getAttribute('data-score')).not.toBe(score);
  await page.locator('#restart-game').click();
  await expect(frame.locator('#game')).toHaveAttribute('data-state', 'playing');
  await page.goBack();
  await expect(page.locator('#game-title')).toHaveText('Recoil Duel');
});

test('Gomoku AI reply, occupied point, undo, win and restart', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/arcade/?game=gomoku`);
  const frame = page.frameLocator('#game-frame');
  const cells = frame.locator('.point');
  await cells.nth(112).click();
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '2');
  await cells.nth(112).evaluate(button => button.click());
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '2');
  await frame.locator('#undo').click();
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '0');
  await page.getByRole('button', { name: 'Local two-player', exact: true }).click();
  for (const index of [105, 0, 106, 1, 107, 2, 108, 3, 109]) await cells.nth(index).click();
  await expect(frame.locator('#status')).toHaveText('Black wins');
  await cells.nth(110).evaluate(button => button.click());
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '9');
  await frame.locator('#undo').click();
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '8');
  await expect(frame.locator('body')).toHaveAttribute('data-state', 'playing');
  await page.locator('#restart-game').click();
  await expect(frame.locator('#board')).toHaveAttribute('data-moves', '0');
  await cells.nth(112).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(cells.nth(113)).toHaveAttribute('data-stone', '1');
  expect(errors).toEqual([]);
});

test('Dino jumps, hits an obstacle, restarts and saves best', async ({ page }) => {
  await page.goto(`${base}/arcade/dino/play.html`);
  await page.locator('#start').click();
  await page.waitForTimeout(160);
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-player-y'))).toBeLessThan(410);
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'over', { timeout: 12000 });
  const best = await page.locator('#best').textContent();
  expect(Number(best)).toBeGreaterThan(0);
  await page.keyboard.press('KeyR');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing');
  await page.reload();
  await expect(page.locator('#best')).toHaveText(best);
});

test('Dino has a short jump and clears consecutive tall cacti through maximum speed', async ({ page }) => {
  await page.addInitScript(() => {
    let now = 0, frame, matter;
    Object.defineProperty(performance, 'now', { value: () => now });
    window.requestAnimationFrame = callback => { frame = callback; return 1; };
    window.stepDino = dt => { now += dt; frame(now); };
    Object.defineProperty(window, 'Matter', {
      get: () => matter,
      set(value) {
        matter = value;
        const create = value.Engine.create;
        value.Engine.create = (...args) => (window.dinoEngine = create(...args));
      }
    });
    // Mix tall cacti with minimum gaps; values stay below the flying-bird threshold.
    const random = [.6, .6, 0];
    let index = 0;
    Math.random = () => random[index++ % random.length];
  });
  for (const fps of [30, 60, 120]) for (const lead of [.2, .3]) {
    await page.goto(`${base}/arcade/dino/play.html`);
    const result = await page.evaluate(({ fps, lead }) => {
      const dt = 1000 / fps;
      const canvas = document.getElementById('game');
      const player = window.dinoEngine.world.bodies.find(body => body.label === 'player');
      const key = code => dispatchEvent(new KeyboardEvent('keydown', { code }));
      const settle = () => { for (let i = 0; i < Math.ceil(200 / dt); i++) window.stepDino(dt); };
      key('KeyR'); settle();
      const groundY = player.position.y;
      key('Space');
      let rise = 0, airtime = 0;
      do {
        window.stepDino(dt); airtime += dt;
        rise = Math.max(rise, groundY - player.position.y);
      } while (player.position.y < groundY - 1 && airtime < 2000);
      key('KeyR'); settle();
      const jumps = new Set(), cleared = new Set(), tallCleared = new Set();
      const inputs = ['Space', 'ArrowUp', 'touch'];
      let previousX, previousId, speed = 6;
      for (let elapsed = 0; elapsed < 30000 && canvas.dataset.state === 'playing'; elapsed += dt) {
        const obstacles = window.dinoEngine.world.bodies.filter(body => body.label === 'obstacle');
        for (const obstacle of obstacles) if (obstacle.bounds.max.x < player.bounds.min.x) {
          cleared.add(obstacle.id);
          if (obstacle.bounds.max.y - obstacle.bounds.min.y > 50) tallCleared.add(obstacle.id);
        }
        const next = obstacles.find(body => body.position.x > player.position.x && !jumps.has(body.id));
        if (next) {
          if (next.id === previousId) speed = (previousX - next.position.x) / dt * 16.667;
          previousId = next.id; previousX = next.position.x;
          if (next.position.x - player.position.x < speed * 60 * lead) {
            const input = inputs[jumps.size % inputs.length];
            if (input === 'touch') canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
            else key(input);
            jumps.add(next.id);
          }
        }
        window.stepDino(dt);
      }
      return { fps, lead, rise, airtime, state: canvas.dataset.state, cleared: cleared.size, tallCleared: tallCleared.size, speed, score: Number(canvas.dataset.score) };
    }, { fps, lead });
    expect(result.rise).toBeGreaterThan(75);
    expect(result.rise).toBeLessThan(105);
    expect(result.airtime).toBeGreaterThan(450);
    expect(result.airtime).toBeLessThan(650);
    expect(result.state).toBe('playing');
    expect(result.cleared).toBeGreaterThan(20);
    expect(result.tallCleared).toBeGreaterThan(5);
    expect(result.speed).toBeGreaterThan(10.5);
    console.log('Dino handling:', result);
  }
});

test('Racer steering, brake, collision and restart', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => .5; });
  await page.goto(`${base}/arcade/racer/play.html`);
  await page.locator('#start').click();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(180);
  await page.keyboard.up('ArrowRight');
  expect(Number(await page.locator('#game').getAttribute('data-player-x'))).toBeGreaterThan(430);
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(180);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('ArrowDown');
  await expect(page.locator('#brake')).toHaveClass(/is-active/);
  await page.keyboard.up('ArrowDown');
  await page.keyboard.press('KeyR');
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'over', { timeout: 12000 });
  await page.locator('#start').click();
  await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing');
});

test('Pinball ball moves and scores; flippers release on blur; restart clears round', async ({ page }) => {
  await page.goto(`${base}/arcade/?game=pinball`);
  const frame = page.frameLocator('#game-frame');
  await expect(page.locator('#game-title')).toHaveText('3D Pinball');
  await expect(frame.locator('body')).toHaveAttribute('data-theme', 'classic');
  await frame.locator('#start').click();
  await expect(frame.locator('body')).toHaveAttribute('data-state', 'playing');
  const before = await frame.locator('canvas').screenshot();
  await page.waitForTimeout(450);
  expect((await frame.locator('canvas').screenshot()).equals(before)).toBe(false);
  await page.keyboard.down('KeyA');
  await expect(frame.locator('#left')).toHaveClass(/is-active/);
  await page.locator('#pause-game').click();
  await expect(frame.locator('#left')).not.toHaveClass(/is-active/);
  await page.keyboard.up('KeyA');
  await page.locator('#resume-game').click();
  await expect.poll(() => frame.locator('#score').textContent(), { timeout: 15000 }).not.toBe('000000');
  await page.locator('#restart-game').click();
  await expect(frame.locator('#balls')).toHaveText('3');
  await expect(frame.locator('#multiplier')).toHaveText('1×');
  await expect(frame.locator('#score')).toHaveText('000000');
});

test('blocked storage does not prevent games from running', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }); });
  for (const game of ['dino', 'racer', 'sky-hopper']) {
    await page.goto(`${base}/arcade/${game}/play.html`);
    await page.locator('#start').click();
    await expect(page.locator('#game')).toHaveAttribute('data-state', 'playing');
  }
  expect(errors).toEqual([]);
});

test('mobile selection, touch controls and fullscreen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/arcade/`);
  await page.getByRole('combobox', { name: 'Switch game' }).selectOption('racer');
  const frame = page.frameLocator('#game-frame');
  await expect(page.locator('#game-title')).toHaveText('Pocket Racer');
  await frame.locator('#start').click();
  const right = await frame.locator('#right').boundingBox();
  await page.mouse.move(right.x + right.width / 2, right.y + right.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  await page.mouse.up();
  expect(Number(await frame.locator('#game').getAttribute('data-player-x'))).toBeGreaterThan(430);
  await expect(frame.locator('#right')).not.toHaveClass(/is-active/);
  await frame.locator('#brake').focus();
  await page.keyboard.down('Space');
  await expect(frame.locator('#brake')).toHaveClass(/is-active/);
  await page.keyboard.up('Space');
  await expect(frame.locator('#brake')).not.toHaveClass(/is-active/);
  await page.locator('#fullscreen-game').click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.locator('#fullscreen-game').click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
});
