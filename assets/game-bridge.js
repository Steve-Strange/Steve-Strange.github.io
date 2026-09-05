(() => {
  'use strict';
  const embedded = window.parent !== window && new URLSearchParams(location.search).has('embed');
  document.documentElement.classList.toggle('embedded', embedded);
  window.arcadePaused = false;
  window.arcadeMuted = false;
  try { window.arcadeMuted = localStorage.getItem('arcade-muted') === 'true'; } catch {}
  window.arcadeStorage = {
    get(key) { try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch { return 0; } },
    set(key, value) { try { localStorage.setItem(key, String(value)); } catch {} }
  };
  let audio;
  window.arcadeTone = (frequency = 440, duration = .06) => {
    if (window.arcadeMuted || window.arcadePaused) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audio ||= new Audio();
    audio.resume().catch(() => {});
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  };
  addEventListener('message', event => {
    if (!embedded || event.origin !== location.origin || event.source !== parent || !event.data?.arcade) return;
    const { action, value } = event.data;
    if (action === 'pause') {
      window.arcadePaused = value === true;
      dispatchEvent(new Event('blur'));
    } else if (action === 'mute') window.arcadeMuted = value === true;
    else if (action === 'restart') dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
    else if (action === 'mode' && ['ai', 'pvp'].includes(value)) dispatchEvent(new CustomEvent('arcade-mode', { detail: value }));
  });
  addEventListener('keydown', event => {
    if (event.code === 'Escape' && embedded) {
      parent.postMessage({ arcade: true, action: 'toggle-pause' }, location.origin);
      event.stopImmediatePropagation();
    } else if (window.arcadePaused) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  addEventListener('keydown', event => {
    if (event.target.closest?.('button, a, select, input') && ['Space', 'Enter'].includes(event.code)) event.stopImmediatePropagation();
  });
  addEventListener('pointerdown', event => {
    if (window.arcadePaused) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (!embedded) window.arcadePaused = document.hidden;
  });
})();
