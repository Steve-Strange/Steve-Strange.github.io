(() => {
  'use strict';
  const games = {
    recoil: { name: '反冲决斗', path: '/recoil-duel/', type: '01 / PHYSICS DUEL', tagline: '每一枪，也是下一步。', description: '零重力场地，青红双枪。枪口不停自旋，用开火的后坐力调整位置，也等待下一次瞄准。', rules: '命中三次获胜。子弹相撞会抵消；枪体碰到边界会反弹。', controls: [['F / Space', '蓝方开火'], ['J', '双人模式红方开火'], ['点击 / 触屏', '单人全场，双人左右半场']], note: '单键决斗 · 1–2 人', modes: true },
    pinball: { name: '3D Pinball', path: '/arcade/pinball/', type: '02 / CLASSIC PINBALL', tagline: '熟悉的球台，再来一局。', description: '参考经典 Space Cadet：蓝色太空印刷台面，银色轨道，红白碰撞器和象牙色挡板。钢球沿发射槽入场，在机械部件间弹跳。', rules: '每局三球。碰撞器得 100 分；点亮三枚目标，累积最高 5 倍倍率。', controls: [['A / ←', '左挡板'], ['D / →', '右挡板'], ['Space', '发球'], ['触屏按钮', '挡板与发球']], note: '经典太空弹球 · 单人' },
    'sky-hopper': { name: 'Sky Hopper', path: '/arcade/sky-hopper/', type: '03 / ONE BUTTON', tagline: '在下一道空隙里，找到节奏。', description: '晴蓝天空，暖黄小鸟，珊瑚红管沿。轻点一下向上跃起，松开后顺势下落。', rules: '穿过一组管道得 1 分。撞到管道、地面或顶部结束，最高分保存在当前浏览器。', controls: [['Space', '向上跃起'], ['点击 / 触屏', '向上跃起']], note: '无尽飞行 · 单人' },
    gomoku: { name: '五子棋', path: '/arcade/gomoku/', type: '04 / FIVE IN A ROW', tagline: '黑白之间，多想一步。', description: '木色棋盘，黑白落子。与电脑慢慢过招，或和身边的人轮流下一盘。', rules: '黑方先行，横、竖或斜向连成五子获胜。采用自由规则，无禁手，长连也算获胜。', controls: [['点击交叉点', '落子'], ['方向键 / Enter', '选择位置 / 落子'], ['Z', '悔棋']], note: '十五路棋盘 · 1–2 人', modes: true },
    dino: { name: 'Dino Run', path: '/arcade/dino/', type: '05 / PIXEL RUNNER', tagline: '没有网络，也有下一次跳跃。', description: '熟悉的黑白像素小恐龙，跑过仙人掌和低飞障碍。保持节奏，看白昼慢慢变成夜晚。', rules: '跳过仙人掌，下蹲躲开飞鸟。距离越远速度越快，碰到障碍结束。', controls: [['Space / ↑', '起跳'], ['↓', '按住下蹲'], ['触屏按钮', '跳跃 / 下蹲']], note: '像素跑酷 · 单人' },
    racer: { name: 'Pocket Racer', path: '/arcade/racer/', type: '06 / POCKET CIRCUIT', tagline: '沿着红白路肩，向前。', description: '掌机里的俯视公路，鲜红车身，绿色田野。穿过车流，在速度与空间之间留一点余地。', rules: '躲开车辆，按行驶距离计分。按住刹车降低速度；撞车后可立即重来。', controls: [['A / D · ← / →', '左右转向'], ['↓ / Space', '按住刹车'], ['触屏按钮', '转向 / 刹车']], note: '复古公路 · 单人' }
  };
  const $ = id => document.getElementById(id);
  const frame = $('game-frame');
  for (const [id, game] of Object.entries(games)) $('game-picker').add(new Option(game.name, id));
  let selected;
  let paused = false;
  let muted = false;
  let mode = 'ai';
  try { muted = localStorage.getItem('arcade-muted') === 'true'; } catch {}
  const send = (action, value) => frame.contentWindow?.postMessage({ arcade: true, action, value }, location.origin);
  const navigate = path => frame.contentWindow.location.replace(`${path}?embed=1`);
  function icon(button, name, label, pressed) {
    button.innerHTML = `<i data-lucide="${name}"></i>`;
    button.title = label;
    button.setAttribute('aria-label', label);
    if (pressed !== undefined) button.setAttribute('aria-pressed', String(pressed));
    window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });
  }
  function pause(value, focus = false) {
    paused = value;
    send('pause', value);
    $('resume-game').hidden = !value;
    icon($('pause-game'), value ? 'play' : 'pause', value ? '继续游戏' : '暂停', value);
    if (focus && !value) frame.contentWindow.focus();
  }
  function setMode(value) {
    mode = value;
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === value)));
  }
  function select(id, push = false) {
    if (!Object.hasOwn(games, id)) id = 'recoil';
    if (selected === id) return;
    selected = id;
    $('game-picker').value = id;
    $('game-stage').dataset.game = id;
    const game = games[id];
    pause(false);
    setMode('ai');
    for (const key of ['type', 'tagline', 'description', 'rules', 'note']) $(`game-${key}`).textContent = game[key];
    $('game-title').textContent = $('stage-name').textContent = frame.title = game.name;
    $('open-game').href = game.path;
    $('game-mode').hidden = !game.modes;
    $('game-controls').replaceChildren();
    for (const [key, label] of [...game.controls, ['R', '重新开始']]) {
      const dt = document.createElement('dt');
      const kbd = document.createElement('kbd');
      kbd.textContent = key;
      dt.append(kbd);
      const dd = document.createElement('dd');
      dd.textContent = label;
      $('game-controls').append(dt, dd);
    }
    document.querySelectorAll('.game-card[data-game]').forEach(link => {
      if (link.dataset.game === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    $('frame-error').hidden = true;
    navigate(game.path);
    document.title = `${game.name} · Arcade Lab｜Ziteng Wang`;
    $('arcade-live').textContent = `已选择${game.name}`;
    if (push) history.pushState(null, '', `?game=${id}`);
  }
  document.querySelectorAll('.game-card[data-game]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(link.dataset.game, true);
    $('games').scrollIntoView({ block: 'start', behavior: 'instant' });
  }));
  $('game-picker').addEventListener('change', event => select(event.target.value, true));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    setMode(button.dataset.mode);
    pause(false);
    send('mode', mode);
    frame.contentWindow.focus();
  }));
  frame.addEventListener('load', () => {
    $('frame-error').hidden = !!frame.contentDocument?.querySelector('canvas, #board');
    send('mute', muted);
    send('pause', paused);
    send('mode', mode);
  });
  frame.addEventListener('error', () => { $('frame-error').hidden = false; });
  $('retry-game').addEventListener('click', () => navigate(games[selected].path));
  $('pause-game').addEventListener('click', () => pause(!paused, true));
  $('resume-game').addEventListener('click', () => pause(false, true));
  $('restart-game').addEventListener('click', () => { pause(false); send('restart'); frame.contentWindow.focus(); });
  $('mute-game').addEventListener('click', () => {
    muted = !muted;
    try { localStorage.setItem('arcade-muted', String(muted)); } catch {}
    send('mute', muted);
    icon($('mute-game'), muted ? 'volume-x' : 'volume-2', muted ? '开启声音' : '静音', muted);
  });
  $('fullscreen-game').hidden = !document.fullscreenEnabled;
  $('fullscreen-game').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.querySelector('.play-column').requestFullscreen();
      frame.contentWindow.focus();
    } catch { $('arcade-live').textContent = '无法进入全屏，可独立打开游戏。'; }
  });
  document.addEventListener('fullscreenchange', () => icon($('fullscreen-game'), document.fullscreenElement ? 'minimize' : 'maximize', document.fullscreenElement ? '退出全屏' : '全屏'));
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data?.arcade) return;
    if (event.data.action === 'toggle-pause') pause(!paused, true);
    if (event.data.action === 'mode-changed' && ['ai', 'pvp'].includes(event.data.value)) setMode(event.data.value);
  });
  addEventListener('popstate', () => select(new URLSearchParams(location.search).get('game')));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
  icon($('mute-game'), muted ? 'volume-x' : 'volume-2', muted ? '开启声音' : '静音', muted);
  select(new URLSearchParams(location.search).get('game'));
})();
