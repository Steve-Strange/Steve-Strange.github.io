"""Build bilingual static pages and apply the shared shell to archived notes."""
import json
import re
from html import unescape
from xml.etree import ElementTree as ET
from site_common import ROOT, BASE, ESC, shell, header, footer, local
import build_publications


def replace_phrases(text, mapping):
    if not mapping:
        return text
    return re.sub('|'.join(re.escape(k) for k in sorted(mapping, key=len, reverse=True)),
                  lambda m: mapping[m[0]], text)


papers = build_publications.PAPERS
home_translations = json.loads((ROOT / 'scripts/home-translations.json').read_text())
for lang in ['en', 'zh']:
    body = (ROOT / 'scripts/templates/home.html').read_text()
    mapping = dict(home_translations[lang])
    for p in papers:
        if lang == 'en':
            mapping[p['summary']] = p['summary_en']
        else:
            mapping[p['title']] = build_publications.TRANSLATIONS[p['slug']]['title_zh']
    body = replace_phrases(body, mapping)
    # Internal navigation stays within the chosen language; assets and citations are shared.
    if lang == 'zh':
        body = re.sub(r'href="(/(?:publications/[^".]*|arcade/|archives/))"', r'href="/zh\1"', body)
    body = body.replace('/assets/media/fanpad.jpg', '/publications/fanpad/cover.webp').replace('/assets/media/moa.jpg', '/publications/moa/cover.webp')
    title = '王子腾 | 北京航空航天大学 · 具身智能与人机交互' if lang == 'zh' else 'Ziteng Wang (王子腾) | Beihang University — Embodied AI, VR & HCI'
    description = '王子腾，北京航空航天大学计算机学院直博生。研究具身智能、虚拟现实、人机交互与拆卸规划。论文、系统演示与个人简历。' if lang == 'zh' else 'Ziteng Wang (王子腾), PhD student in Computer Science at Beihang University. Research in embodied AI, VR/AR, HCI and disassembly planning. Publications, demos and CV.'
    person = {'@type': 'Person', '@id': BASE + '/#person', 'name': 'Ziteng Wang', 'alternateName': ['王子腾', 'Wang Ziteng'], 'url': BASE + '/', 'image': BASE + '/images/Head.jpg', 'jobTitle': 'PhD Student', 'affiliation': {'@type': 'CollegeOrUniversity', 'name': 'Beihang University'}, 'knowsAbout': ['Embodied AI', 'Virtual Reality', 'Human–Computer Interaction', 'Disassembly Sequence Planning'], 'sameAs': ['https://scholar.google.com/citations?user=FDuEOccAAAAJ', 'https://github.com/Steve-Strange']}
    structured = {'@context': 'https://schema.org', '@graph': [person, {'@type': 'ProfilePage', '@id': BASE + local('/', lang) + '#profile', 'url': BASE + local('/', lang), 'mainEntity': {'@id': BASE + '/#person'}, 'inLanguage': 'zh-CN' if lang == 'zh' else 'en'}]}
    out = ROOT / local('/', lang).strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(title, description, '/', body, lang, css='portfolio', structured=structured, metadata='<link rel="preload" as="image" href="/images/Head.jpg">'))

# The original blog posts remain at their published URLs and in their original languages.
notes = []
legacy_paths = []
for path in ROOT.rglob('index.html'):
    relative = path.relative_to(ROOT)
    if relative.parts[0] in {'.git', '.runtime', 'artifacts', 'scripts', 'lib', 'node_modules', 'zh'}:
        continue
    text = path.read_text()
    if 'Hexo 6.3.0' not in text:
        continue
    legacy_paths.append(path)
    if relative.parts[0].isdigit():
        title = re.search(r'<title>(.*?)</title>', text, re.S)[1].split(' | ')[0].strip()
        notes.append(('/' + relative.parent.as_posix() + '/', unescape(title), '-'.join(relative.parts[:3])))
    if relative.as_posix() in {'archives/index.html', 'about/index.html'}:
        continue
    page_url = '/' + relative.parent.as_posix() + '/'
    text = re.sub(r'<!-- shared-header:start -->.*?<!-- shared-header:end -->\s*', '', text, flags=re.S)
    text = re.sub(r'(<body\b[^>]*class=")([^"]*)"', lambda m: m[1] + ' '.join(dict.fromkeys((m[2] + ' legacy-page').split())) + '"', text)
    if '/assets/site.css' not in text:
        text = text.replace('</head>', '<link rel="stylesheet" href="/assets/site.css">\n<script defer src="/assets/portfolio.js"></script>\n</head>')
    nav = header(page_url, 'en', 'blog').replace(f'href="/zh{page_url}" lang="zh-CN"', f'href="{page_url}?lang=zh" lang="zh-CN"')
    text = re.sub(r'(<body\b[^>]*>)', lambda m: m[0] + '\n' + nav, text, count=1)
    # Remove legacy entrance animations so note content remains visible without JS/CDNs.
    text = text.replace('class="use-motion legacy-page"', 'class="legacy-page"')
    if 'class="shared-footer"' not in text:
        text = text.replace('</body>', footer() + '\n</body>')
    path.write_text(text)

for lang in ['en', 'zh']:
    title = '关于我' if lang == 'zh' else 'About me'
    lead = '我是王子腾，北京航空航天大学计算机学院直博生，研究具身智能、虚拟现实、人机交互与拆卸规划。' if lang == 'zh' else 'I am Ziteng Wang, a PhD student in Computer Science at Beihang University. I work on embodied AI, virtual reality, human–computer interaction and disassembly planning.'
    body = f'<main id="main"><section class="intro"><h1>{title}</h1><p class="lead">{lead}</p><div class="actions"><a class="button" href="{local("/", lang)}">{"个人主页" if lang == "zh" else "Homepage"}</a><a class="button" href="{local("/publications/", lang)}">{"研究论文" if lang == "zh" else "Publications"}</a></div></section></main>'
    out = ROOT / local('/about/', lang).strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(title, lead, '/about/', body, lang, body_class='publication-page'))

# Reuse the search index to keep this build repeatable after replacing the old archive landing page.
if not notes:
    raise RuntimeError('No original blog notes found')
for lang in ['en', 'zh']:
    title = '博客与笔记' if lang == 'zh' else 'Blog and notes'
    lead = '课程笔记、实验记录与随笔。文章保留原文语言。' if lang == 'zh' else 'Course notes, experiment logs and essays. Articles retain their original language.'
    entries = ''.join(f'<article class="archive-entry"><time>{date}</time><h2><a href="{url}{"?lang=zh" if lang == "zh" else ""}">{ESC(title)}</a></h2></article>' for url, title, date in sorted(notes, reverse=True))
    body = f'<main id="main"><section class="intro"><h1>{title}</h1><p class="lead">{lead}</p></section><div class="archive-list">{entries}</div></main>'
    out = ROOT / local('/archives/', lang).strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(title, lead, '/archives/', body, lang, active='blog', body_class='publication-page'))

# Arcade UI shares the same static language routes, while games retain their own visual styles.
arcade_translations = json.loads((ROOT / 'scripts/arcade-translations.json').read_text())
(ROOT / 'assets/arcade-i18n.js').write_text('window.arcadeLabels = ' + json.dumps(arcade_translations, ensure_ascii=False) + ';\n')
for lang in ['en', 'zh']:
    body = replace_phrases((ROOT / 'scripts/templates/arcade.html').read_text(), arcade_translations[lang])
    body = body.replace('src="/recoil-duel/?embed=1"', f'src="{local("/recoil-duel/", lang)}play.html?embed=1"')
    meta = '<link rel="stylesheet" href="/assets/arcade.css"><script defer src="/assets/arcade-i18n.js"></script><script defer src="/assets/arcade.js"></script>'
    title = '游戏室' if lang == 'zh' else 'Arcade Lab'
    description = '六款浏览器小游戏：反冲决斗、弹球、晴空小鸟、五子棋、小恐龙与赛车。' if lang == 'zh' else 'Six browser games: Recoil Duel, 3D Pinball, Sky Hopper, Gomoku, Dino Run and Pocket Racer.'
    out = ROOT / local('/arcade/', lang).strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(title, description, '/arcade/', body, lang, css='portfolio', active='arcade', metadata=meta, body_class='arcade-page'))

# Standalone games use a shell around the same game document used by the arcade.
# This keeps the navigation out of canvas coordinates and preserves game behavior.
game_translations = json.loads((ROOT / 'scripts/game-translations.json').read_text())
for source in sorted((ROOT / 'scripts/templates/games').glob('*.html')):
    slug = source.stem
    path = '/recoil-duel/' if slug == 'recoil-duel' else '/arcade/' + slug + '/'
    for lang in ['en', 'zh']:
        text = replace_phrases(source.read_text(), game_translations[lang])
        text = text.replace('<html lang="zh-CN">', '<html lang="' + ('en' if lang == 'en' else 'zh-CN') + '">')
        text = text.replace('</head>', f'<meta name="robots" content="noindex, follow"><link rel="canonical" href="{BASE}{local(path, lang)}"></head>')
        if lang == 'zh':
            text = text.replace('href="/arcade/', 'href="/zh/arcade/')
        out = ROOT / local(path, lang).strip('/')
        out.mkdir(parents=True, exist_ok=True)
        (out / 'play.html').write_text(text)
        title = re.search(r'<title>(.*?)</title>', text, re.S)[1].split('｜')[0]
        body = f'<main id="main" class="standalone-game"><iframe src="play.html" title="{ESC(title)}" allow="autoplay; fullscreen"></iframe></main>'
        (out / 'index.html').write_text(shell(title, title, path, body, lang, css='portfolio', active='arcade'))

(ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /scripts/\nDisallow: /lib/\n\nSitemap: ' + BASE + '/sitemap.xml\n')
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
urlset = ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
for path in sorted(ROOT.rglob('index.html')):
    relative = path.relative_to(ROOT)
    if any(part in {'.git', '.runtime', 'node_modules', 'artifacts', 'lib', 'scripts'} for part in relative.parts):
        continue
    url = ET.SubElement(urlset, 'url')
    ET.SubElement(url, 'loc').text = BASE + ('/' if relative.parent.as_posix() == '.' else '/' + relative.parent.as_posix() + '/')
ET.ElementTree(urlset).write(ROOT / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
print(f'Built bilingual homepage, publications, arcade and archive; shared navigation on {len(legacy_paths)} legacy pages.')
