"""Shared static navigation, language URLs and metadata. No runtime framework."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://steve-strange.github.io'
ESC = html.escape


def local(path, lang):
    return ('/zh' if lang == 'zh' else '') + path


def language_meta(path, lang):
    return f'<link rel="canonical" href="{BASE}{local(path, lang)}">\n' + '\n'.join(
        f'<link rel="alternate" hreflang="{code}" href="{BASE}{local(path, variant)}">'
        for code, variant in [('en', 'en'), ('zh-CN', 'zh'), ('x-default', 'en')])


def header(path, lang='en', active=''):
    zh = lang == 'zh'
    links = [('/#research', 'Research', '研究', 'research'),
             ('/publications/', 'Publications', '论文', 'publications'),
             ('/#projects', 'Systems', '系统', 'projects'),
             ('/arcade/', 'Arcade', '游戏', 'arcade'),
             ('/#experience', 'Background', '经历', 'experience'),
             ('/archives/', 'Blog', '博客', 'blog')]
    nav = ''.join(f'<a href="{local(url, lang)}"' + (' aria-current="page"' if key == active else '') + f'>{cn if zh else en}</a>' for url, en, cn, key in links)
    return f'''<!-- shared-header:start -->
<header id="global-header" class="site-header" data-header>
  <div class="header-inner">
    <a class="brand" href="{local('/', lang)}" aria-label="{'个人主页' if zh else 'Home'}"><span class="brand-mark" aria-hidden="true">ZW</span><span class="brand-name">{'王子腾' if zh else 'Ziteng Wang'}</span></a>
    <nav class="site-nav" id="site-nav" aria-label="{'主导航' if zh else 'Main navigation'}" data-nav>{nav}</nav>
    <div class="header-actions">
      <a class="header-cv" href="/assets/ziteng-wang-cv.pdf" aria-label="{'公开简历（中文 PDF）' if zh else 'CV (Chinese PDF)'}">{'简历' if zh else 'CV'}</a>
      <a class="language-switch" data-language-switch href="{local(path, 'en' if zh else 'zh')}" lang="{'en' if zh else 'zh-CN'}" hreflang="{'en' if zh else 'zh-CN'}" aria-label="{'Switch to English' if zh else '切换到中文'}">{'EN' if zh else '中文'}</a>
      <button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="{'打开菜单' if zh else 'Open menu'}" data-menu-toggle><span aria-hidden="true">☰</span></button>
    </div>
  </div>
</header>
<!-- shared-header:end -->'''


def footer(lang='en'):
    zh = lang == 'zh'
    return f'''<footer class="shared-footer"><div><strong>{'王子腾' if zh else 'Ziteng Wang'}</strong><p>{'北京航空航天大学 · 具身智能 · 虚拟现实 · 人机交互' if zh else 'Beihang University · Embodied AI · VR · HCI'}</p></div><nav aria-label="{'联系与学术主页' if zh else 'Contact and profiles'}"><a href="mailto:wzt2694630726@gmail.com">{'邮箱' if zh else 'Email'}</a><a href="https://scholar.google.com/citations?user=FDuEOccAAAAJ">Google Scholar</a><a href="https://github.com/Steve-Strange">GitHub</a></nav><small>© <span data-year>2026</span> Ziteng Wang</small></footer>'''


def shell(title, description, path, body, lang='en', *, css='publications', active='', metadata='', structured=None, image='', body_class=''):
    zh = lang == 'zh'
    data = json.dumps(structured or {}, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!doctype html>
<html lang="{'zh-CN' if zh else 'en'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{ESC(title) if path == '/' else ESC(title) + (' | 王子腾 · 北航' if zh else ' | Ziteng Wang · Beihang University')}</title>
<meta name="description" content="{ESC(description, quote=True)}">
<meta name="author" content="Ziteng Wang"><meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#091011">
{language_meta(path, lang)}
<link rel="icon" type="image/png" href="/images/a.png">
<meta property="og:type" content="{'article' if active == 'publications' and path != '/publications/' else 'website'}"><meta property="og:title" content="{ESC(title, quote=True)}">
<meta property="og:description" content="{ESC(description, quote=True)}"><meta property="og:url" content="{BASE}{local(path, lang)}">
<meta property="og:locale" content="{'zh_CN' if zh else 'en_US'}">
<meta property="og:image" content="{BASE}{image or '/images/Head.jpg'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/{css}.css"><link rel="stylesheet" href="/assets/site.css">
<script defer src="/lib/lucide/lucide.min.js"></script><script defer src="/assets/portfolio.js"></script>
{metadata}<script type="application/ld+json">{data}</script>
</head><body class="{body_class}"><a class="skip-link" href="#main">{'跳到正文' if zh else 'Skip to content'}</a>
{header(path, lang, active)}
{body}
{footer(lang)}
</body></html>'''
