(() => {
  document.documentElement.classList.add('js');
  const zh = document.body.classList.contains('legacy-page')
    ? new URLSearchParams(location.search).get('lang') === 'zh'
    : document.documentElement.lang.startsWith('zh');
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', zh ? '打开菜单' : 'Open menu');
  };

  if (nav && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', zh ? (open ? '关闭菜单' : '打开菜单') : (open ? 'Close menu' : 'Open menu'));
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1050) closeMenu();
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) closeMenu();
    });
  }

  const sections = Array.from(nav?.querySelectorAll('a[data-section]') || [])
    .filter(link => new URL(link.href).pathname === location.pathname)
    .map(link => ({ link, section: document.getElementById(link.dataset.section) }))
    .filter(item => item.section);
  const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    if (!sections.length) return;
    let current;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= header.offsetHeight + 32) current = item;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections.at(-1);
    }
    for (const item of sections) {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  };

  syncHeader();
  let scrollPending = false;
  window.addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => { syncHeader(); scrollPending = false; });
  }, { passive: true });
  window.addEventListener('resize', syncHeader);
  window.addEventListener('load', syncHeader);

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  if (window.lucide) {
    window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
  }

  // A language link keeps the current section and arcade selection.
  const languageLink = document.querySelector('[data-language-switch]');
  if (languageLink) {
    const target = new URL(languageLink.href);
    for (const [key, value] of new URLSearchParams(location.search)) {
      if (key !== 'lang') target.searchParams.set(key, value);
    }
    languageLink.href = target.href;
    languageLink.addEventListener('click', () => {
      const url = new URL(languageLink.href);
      // The arcade updates its query while switching games.
      for (const [key, value] of new URLSearchParams(location.search)) {
        if (key !== 'lang') url.searchParams.set(key, value);
      }
      url.hash = location.hash;
      languageLink.href = url.href;
    });
  }

  // Archived articles keep their original text; their site navigation is bilingual.
  if (document.body.classList.contains('legacy-page')) {
    const chineseUI = new URLSearchParams(location.search).get('lang') === 'zh';
    nav.querySelectorAll('a').forEach(a => {
      a.textContent = chineseUI ? a.dataset.labelZh : a.dataset.labelEn;
      if (chineseUI) a.setAttribute('href', '/zh' + a.getAttribute('href'));
    });
    header.querySelector('.brand').href = chineseUI ? '/zh/' : '/';
    header.querySelector('.brand-name').textContent = chineseUI ? '王子腾' : 'Ziteng Wang';
    header.querySelector('.header-cv').textContent = chineseUI ? '简历' : 'CV';
    languageLink.textContent = chineseUI ? 'EN' : '中文';
    languageLink.href = location.pathname + (chineseUI ? '' : '?lang=zh');
    languageLink.setAttribute('aria-label', chineseUI ? 'Switch to English' : '切换到中文');
    languageLink.lang = chineseUI ? 'en' : 'zh-CN';
    header.querySelector('nav').setAttribute('aria-label', chineseUI ? '主导航' : 'Main navigation');
    header.querySelector('.brand').setAttribute('aria-label', chineseUI ? '个人主页' : 'Home');
    if (chineseUI) {
      const labels = ['邮箱', 'Google Scholar', 'GitHub'];
      document.querySelectorAll('.shared-footer nav a').forEach((a, i) => { a.textContent = labels[i]; });
      document.querySelector('.shared-footer strong').textContent = '王子腾';
      document.querySelector('.shared-footer p').textContent = '北京航空航天大学 · 具身智能 · 虚拟现实 · 人机交互';
    }
  }
})();
