(() => {
  'use strict';
  const zh = document.documentElement.lang.startsWith('zh');
  const racing = document.body.dataset.game === 'racer';
  const { Engine, Bodies, Body, Composite, Events } = Matter;
  const W = 800, H = 600, floor = 450;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const message = document.getElementById('message');
  const scoreNode = document.getElementById('score');
  const bestNode = document.getElementById('best');
  const live = document.getElementById('live');
  const engine = Engine.create();
  engine.gravity.y = racing ? 0 : 2.4;
  const player = Bodies.rectangle(racing ? 400 : 126, racing ? 465 : floor - 24, racing ? 36 : 30, racing ? 66 : 44, { inertia: Infinity, friction: 0, frictionAir: 0, restitution: 0, label: 'player' });
  const ground = Bodies.rectangle(W / 2, floor + 24, W * 3, 48, { isStatic: true, friction: 0, label: 'ground' });
  Composite.add(engine.world, racing ? [player] : [player, ground]);
  let obstacles = [];
  let state = 'idle';
  let distance = 0;
  let timer = 0;
  let last = performance.now();
  let ducking = false;
  let elapsed = 0;
  const held = new Set();
  const bestKey = racing ? 'pocket-racer-best' : 'dino-run-best';
  let best = window.arcadeStorage.get(bestKey);
  bestNode.textContent = String(best).padStart(5, '0');
  const dino = ['000000111111', '000000110111', '000000111111', '000000111100', '100001111100', '110011111110', '111111111000', '011111111000', '001111110000', '000110110000', '000100010000', '000110011000'];
  const cactus = ['00011000', '00011000', '10011001', '10011001', '11011011', '01111110', '00011000', '00011000', '00011000', '00011000'];
  function reset() {
    for (const item of obstacles) Composite.remove(engine.world, item.body);
    obstacles = []; held.clear(); keyboardHeld.clear(); pointerHeld.clear(); setDuck(false);
    document.querySelectorAll('.control').forEach(button => button.classList.remove('is-active'));
    Body.setPosition(player, { x: racing ? 400 : 126, y: racing ? 465 : floor - 24 });
    Body.setVelocity(player, { x: 0, y: 0 });
    distance = elapsed = 0; timer = racing ? 650 : 900;
    state = 'playing'; message.hidden = true;
    live.textContent = zh ? (racing ? '比赛开始' : '开始奔跑') : (racing ? 'Race started' : 'Run started');
    window.arcadeTone(380);
  }
  function end() {
    if (state !== 'playing') return;
    state = 'over'; held.clear();
    best = Math.max(best, Math.floor(distance));
    window.arcadeStorage.set(bestKey, best);
    bestNode.textContent = String(best).padStart(5, '0');
    document.getElementById('result').textContent = zh ? (racing ? '撞车了' : '游戏结束') : (racing ? 'CRASH!' : 'GAME OVER');
    document.getElementById('start').textContent = zh ? '再来一局' : 'PLAY AGAIN';
    message.hidden = false;
    live.textContent = `${zh ? '游戏结束，距离' : 'Game over. Distance:'} ${Math.floor(distance)}`;
    window.arcadeTone(100, .16);
  }
  function setDuck(value) {
    if (racing || value === ducking) return;
    const bottom = player.bounds.max.y;
    Body.scale(player, value ? 1.4 : 1 / 1.4, value ? .5 : 2);
    Body.setPosition(player, { x: player.position.x, y: bottom - (value ? 11 : 22) });
    ducking = value;
  }
  function jump() {
    if (state !== 'playing') { reset(); return; }
    if (window.arcadePaused || player.bounds.max.y < floor - 4 || Math.abs(player.velocity.y) > 1) return;
    setDuck(false);
    Body.setVelocity(player, { x: 0, y: -10.8 });
    window.arcadeTone(530, .05);
  }
  function spawn() {
    if (racing) {
      // A single car per row always leaves two lanes open.
      const lane = Math.floor(Math.random() * 3);
      const body = Bodies.rectangle(290 + lane * 110, -80, 38, 66, { isStatic: true, isSensor: true, label: 'obstacle' });
      obstacles.push({ body, color: ['#f2ce58', '#dedfdd', '#62bdd3'][Math.floor(Math.random() * 3)] });
      Composite.add(engine.world, body);
    } else {
      const flying = distance > 180 && Math.random() > .65;
      const tall = !flying && Math.random() > .55;
      const height = flying ? 18 : tall ? 54 : 40;
      const body = Bodies.rectangle(W + 40, flying ? floor - 41 : floor - height / 2, flying ? 38 : 22, height, { isStatic: true, isSensor: true, label: 'obstacle' });
      obstacles.push({ body, flying, tall });
      Composite.add(engine.world, body);
    }
  }
  Events.on(engine, 'collisionStart', event => {
    if (event.pairs.some(pair => (pair.bodyA === player && pair.bodyB.label === 'obstacle') || (pair.bodyB === player && pair.bodyA.label === 'obstacle'))) end();
  });
  function update(dt) {
    if (state !== 'playing') return;
    elapsed += dt;
    const speed = racing ? (held.has('brake') ? 3.1 : 6 + Math.min(distance / 400, 5)) : 6 + Math.min(distance / 160, 5);
    distance += speed * dt / 160;
    timer -= dt;
    if (timer <= 0) { spawn(); timer = racing ? Math.max(650, 1400 - distance * .35) : Math.max(720, (1000 + Math.random() * 650) * 6 / speed); }
    if (racing) {
      const turn = Number(held.has('right')) - Number(held.has('left'));
      Body.setPosition(player, { x: Math.max(250, Math.min(550, player.position.x + turn * dt * .38)), y: 465 });
      Body.setVelocity(player, { x: 0, y: 0 });
    } else setDuck(held.has('duck') && player.bounds.max.y >= floor - 4);
    const steps = Math.max(1, Math.ceil(dt / 8.333));
    for (let step = 0; step < steps && state === 'playing'; step++) {
      for (const item of obstacles) Body.setPosition(item.body, {
        x: item.body.position.x - (racing ? 0 : speed * dt / 16.667 / steps),
        y: item.body.position.y + (racing ? speed * dt / 16.667 / steps : 0)
      });
      Engine.update(engine, dt / steps);
    }
    obstacles = obstacles.filter(item => {
      const keep = racing ? item.body.position.y < H + 100 : item.body.position.x > -100;
      if (!keep) Composite.remove(engine.world, item.body);
      return keep;
    });
  }
  function pixels(sprite, x, y, scaleX, scaleY, color) {
    ctx.fillStyle = color;
    sprite.forEach((row, r) => [...row].forEach((pixel, c) => { if (pixel === '1') ctx.fillRect(Math.round(x + c * scaleX), Math.round(y + r * scaleY), Math.ceil(scaleX), Math.ceil(scaleY)); }));
  }
  function drawDino() {
    const night = Math.floor(distance / 400) % 2 === 1;
    const ink = night ? '#e0e8df' : '#46524a';
    ctx.fillStyle = night ? '#232a2d' : '#f5f6f2'; ctx.fillRect(0, 0, W, H);
    document.body.style.color = ink;
    ctx.fillStyle = night ? '#798880' : '#dce1d9';
    for (let i = 0; i < 5; i++) {
      const x = ((i * 190 + 75 - distance * .4) % 980 + 980) % 980 - 80;
      if (night) { ctx.fillRect(x, 120 + i % 3 * 48, 3, 3); }
      else { ctx.fillRect(x, 140 + i % 3 * 36, 54, 3); ctx.fillRect(x + 9, 128 + i % 3 * 36, 32, 12); ctx.fillRect(x + 17, 122 + i % 3 * 36, 16, 7); }
    }
    ctx.fillStyle = night ? '#acb7a2' : '#e2e6db'; ctx.fillRect(670, 72, 34, 34);
    ctx.fillStyle = night ? '#232a2d' : '#f5f6f2'; if (night) ctx.fillRect(680, 67, 29, 29);
    ctx.strokeStyle = night ? '#647268' : '#cdd5c9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, floor - 8);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, floor - 10 - (Math.sin(x * .023) + 1) * 18);
    ctx.stroke();
    ctx.fillStyle = ink; ctx.fillRect(0, floor, W, 2);
    for (let i = 0; i < 38; i++) { const x = ((i * 49 - distance * 10) % W + W) % W; ctx.fillRect(x, floor + 12 + (i % 4) * 9, i % 3 + 3, 2); }
    const body = player.bounds;
    const stride = state === 'playing' && player.bounds.max.y >= floor - 4 ? Math.floor(elapsed / 95) % 2 : 0;
    if (ducking) {
      pixels(dino.slice(0, 9), body.min.x - 5, body.min.y - 4, 4.7, 2.8, ink);
    } else {
      pixels(dino, player.position.x - 24, body.max.y - 52, 4, 4.3, ink);
      if (stride) { ctx.fillStyle = night ? '#232a2d' : '#f5f6f2'; ctx.fillRect(player.position.x - 13, body.max.y - 8, 9, 9); }
    }
    const preview = state === 'idle' ? [{ body: { position: { x: 625, y: floor - 20 } } }] : [];
    for (const item of [...obstacles, ...preview]) {
      const { x, y } = item.body.position;
      if (item.flying) {
        ctx.fillStyle = ink; ctx.fillRect(x - 17, y - 3, 35, 7); ctx.fillRect(x - 23, y - 1, 9, 4);
        ctx.fillRect(x - 3, Math.floor(elapsed / 150) % 2 ? y - 16 : y + 3, 10, 15);
      } else pixels(cactus, x - 16, floor - (item.tall ? 54 : 40), 4, item.tall ? 5.4 : 4, ink);
    }
    ctx.fillStyle = night ? '#a8b7aa' : '#91a092'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
    ctx.fillText('DINO / ENDLESS RUN', 30, H - 26);
  }
  function car(x, y, color, steer = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(steer);
    ctx.fillStyle = '#23342b55'; ctx.fillRect(-18, -30, 44, 73);
    ctx.fillStyle = '#202726'; ctx.fillRect(-24, -23, 8, 17); ctx.fillRect(16, -23, 8, 17); ctx.fillRect(-24, 17, 8, 16); ctx.fillRect(16, 17, 8, 16);
    ctx.fillStyle = color; ctx.fillRect(-18, -35, 36, 70); ctx.fillRect(-21, -25, 42, 47);
    ctx.fillStyle = '#172d33'; ctx.fillRect(-14, -15, 28, 14); ctx.fillRect(-13, 16, 26, 9);
    ctx.fillStyle = '#d5e9e2'; ctx.fillRect(-11, -13, 21, 3);
    ctx.fillStyle = '#fff0a7'; ctx.fillRect(-16, -33, 9, 5); ctx.fillRect(7, -33, 9, 5);
    ctx.fillStyle = '#fff8'; ctx.fillRect(-3, -32, 6, 15); ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = held.has('brake') && color === '#e65849' ? '#fff199' : '#9e3538'; ctx.fillRect(-15, 30, 8, 5); ctx.fillRect(7, 30, 8, 5);
    ctx.restore();
  }
  function drawRace() {
    ctx.fillStyle = '#648e61'; ctx.fillRect(0, 0, W, H);
    const offset = distance * 6 % 120;
    for (let y = -120; y < H; y += 120) {
      ctx.fillStyle = '#6c9866'; ctx.fillRect(0, y + offset, W, 60);
      for (const x of [80, 686]) {
        ctx.fillStyle = '#416d4e'; ctx.fillRect(x + 5, y + offset + 14, 40, 35);
        ctx.fillStyle = '#b9c98b'; ctx.fillRect(x, y + offset + 4, 35, 30);
        ctx.fillStyle = '#9ab875'; ctx.fillRect(x + 9, y + offset - 5, 20, 45);
        ctx.fillStyle = '#ecdc9c'; ctx.fillRect(x - 30, y + offset + 60, 5, 5);
      }
    }
    ctx.fillStyle = '#b9bca4'; ctx.fillRect(216, 0, 368, H);
    ctx.fillStyle = '#414947'; ctx.fillRect(238, 0, 324, H);
    for (let y = -120; y < H; y += 30) {
      ctx.fillStyle = Math.round(y / 30) % 2 ? '#edece2' : '#d85a4c'; ctx.fillRect(223, y + offset, 12, 30); ctx.fillRect(565, y + offset, 12, 30);
    }
    ctx.fillStyle = '#b7c0b7';
    for (let y = -120; y < H; y += 120) { ctx.fillRect(343, y + offset, 3, 56); ctx.fillRect(453, y + offset, 3, 56); }
    const preview = state === 'idle' ? [{ body: { position: { x: 290, y: 130 } }, color: '#f2ce58' }, { body: { position: { x: 510, y: 285 } }, color: '#dedfdd' }] : [];
    for (const item of [...obstacles, ...preview]) car(item.body.position.x, item.body.position.y, item.color);
    car(player.position.x, player.position.y, '#e65849', (Number(held.has('right')) - Number(held.has('left'))) * .075);
    ctx.fillStyle = '#e7ebd9'; ctx.textAlign = 'left'; ctx.font = 'bold 16px monospace';
    ctx.fillText(`${state === 'playing' ? Math.round((held.has('brake') ? 3.1 : 6 + Math.min(distance / 400, 5)) * 20) : 0}`, 28, H - 58);
    ctx.font = '10px monospace'; ctx.fillText('KM/H', 28, H - 42);
    ctx.save(); ctx.translate(744, H / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#d9e6c6'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.fillText('POCKET CIRCUIT', 0, 0); ctx.restore();
  }
  function resize() { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr); }
  function frame(now) {
    const dt = Math.min(now - last, 33.3); last = now;
    if (!window.arcadePaused) update(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = racing ? '#648e61' : Math.floor(distance / 400) % 2 ? '#232a2d' : '#f5f6f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / (racing ? 400 : W), canvas.height / H);
    ctx.setTransform(scale, 0, 0, scale, (canvas.width - W * scale) / 2, (canvas.height - H * scale) / 2);
    ctx.imageSmoothingEnabled = false;
    if (racing) drawRace(); else drawDino();
    scoreNode.textContent = String(Math.floor(distance)).padStart(5, '0');
    canvas.dataset.score = String(Math.floor(distance)); canvas.dataset.state = state;
    canvas.dataset.playerX = String(Math.round(player.position.x)); canvas.dataset.playerY = String(Math.round(player.position.y));
    document.body.dataset.state = state;
    requestAnimationFrame(frame);
  }
  const mapping = racing ? { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'brake', Space: 'brake' } : { ArrowDown: 'duck' };
  const keyboardHeld = new Set();
  const pointerHeld = new Map();
  function syncHeld() {
    held.clear();
    for (const key of keyboardHeld) held.add(mapping[key]);
    for (const action of pointerHeld.values()) held.add(action);
    document.querySelectorAll('.control').forEach(button => button.classList.toggle('is-active', held.has(button.id)));
  }
  addEventListener('keydown', event => {
    if (event.code === 'KeyR') { if (!event.repeat) reset(); }
    else if (!racing && ['Space', 'ArrowUp'].includes(event.code)) { if (!event.repeat) jump(); }
    else if (mapping[event.code]) { if (state !== 'playing' && racing && event.code === 'Space') reset(); keyboardHeld.add(event.code); syncHeld(); }
    else return;
    event.preventDefault();
  });
  addEventListener('keyup', event => { keyboardHeld.delete(event.code); syncHeld(); });
  for (const button of document.querySelectorAll('.control')) {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      if (button.id === 'jump') jump();
      else { if (state !== 'playing') reset(); pointerHeld.set(event.pointerId, button.id); syncHeld(); }
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, e => { pointerHeld.delete(e.pointerId); syncHeld(); });
    button.addEventListener('click', event => { if (event.detail === 0 && button.id === 'jump') jump(); });
    if (button.id !== 'jump') {
      button.addEventListener('keydown', event => {
        if (!['Space', 'Enter'].includes(event.code)) return;
        event.preventDefault();
        if (state !== 'playing') reset();
        pointerHeld.set(`key-${button.id}`, button.id); syncHeld();
      });
      button.addEventListener('keyup', event => {
        if (!['Space', 'Enter'].includes(event.code)) return;
        pointerHeld.delete(`key-${button.id}`); syncHeld();
      });
    }
  }
  addEventListener('blur', () => { keyboardHeld.clear(); pointerHeld.clear(); syncHeld(); });
  document.getElementById('start').addEventListener('click', () => { reset(); document.getElementById('start').blur(); });
  if (!racing) canvas.addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  window.lucide?.createIcons();
  resize(); requestAnimationFrame(frame); document.body.dataset.ready = 'true';
})();
