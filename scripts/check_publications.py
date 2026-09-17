"""Check generated publication content and every local publication asset/link."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
papers = json.loads((ROOT / 'publications/papers.json').read_text())

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta = []
        self.links = []
        self.alternates = {}
        self.canonical = ''
        self.lang = ''
        self.navigation = []
        self.in_nav = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta': self.meta.append(attrs)
        if tag == 'html': self.lang = attrs.get('lang')
        if tag == 'link' and attrs.get('rel') == 'alternate' and attrs.get('hreflang'):
            self.alternates[attrs['hreflang']] = attrs['href']
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs['href']
        if tag == 'nav' and attrs.get('id') == 'site-nav': self.in_nav = True
        if tag == 'a' and self.in_nav: self.navigation.append(attrs.get('href'))
        for key in ('src', 'href', 'poster'):
            if attrs.get(key): self.links.append(attrs[key])

    def handle_endtag(self, tag):
        if tag == 'nav': self.in_nav = False


def check_links(page, path):
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path: continue
        target = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else path.parent / unquote(url.path)
        if target.is_dir(): target /= 'index.html'
        assert target.is_file(), (str(path.relative_to(ROOT)), link)

assert len(papers) == len({p['doi'].lower() for p in papers}) == 6
for p in papers:
    assert p.get('cover') and p.get('cover_alt'), p['slug'] + ' needs a descriptive cover'
    path = ROOT / 'publications' / p['slug'] / 'index.html'
    text = path.read_text()
    page = Page(text)
    assert p['title'] in text and p['abstract'][:50] in text
    assert len(p['abstract'].split()) > 100, p['slug']
    authors = [m['content'] for m in page.meta if m.get('name') == 'citation_author']
    assert authors == p['authors'], p['slug']
    doi = next(m['content'] for m in page.meta if m.get('name') == 'citation_doi')
    assert doi == p['doi']
    assert f'/publications/{p["slug"]}/{p["cover"]}' in text
    assert 'citation_pdf_url' not in text, 'Do not advertise unverified full-text PDFs'
    assert all(s in text for s in ('id="results"', 'id="limitations"', 'id="cite"'))
    bib = path.with_name('cite.bib').read_text()
    assert p['doi'] in bib and ' and '.join(p['authors']) in bib
    check_links(page, path)
    chinese = Page((ROOT / 'zh/publications' / p['slug'] / 'index.html').read_text())
    assert [m['content'] for m in chinese.meta if m.get('name') == 'citation_author'] == p['authors']
assert '共同第一作者（署名第二）' in (ROOT/'zh/publications/fanpad/index.html').read_text()
assert 'Co-first author (second in the author list)' in (ROOT/'publications/fanpad/index.html').read_text()
assert '3732564' in (ROOT/'index.html').read_text()
assert '<strong>06</strong>' in (ROOT/'index.html').read_text()
tree = ET.parse(ROOT / 'sitemap.xml')
urls = {e.text for e in tree.iter() if e.tag.endswith('loc')}
assert all(f'https://steve-strange.github.io/publications/{p["slug"]}/' in urls for p in papers)
routes = ['', 'publications', 'arcade', 'archives', 'about', 'recoil-duel'] + ['arcade/' + s for s in ['gomoku','pinball','sky-hopper','dino','racer']] + ['publications/' + p['slug'] for p in papers]
for prefix, lang in [('', 'en'), ('zh/', 'zh-CN')]:
    for route in routes:
        path = ROOT / prefix / route / 'index.html'
        page = Page(path.read_text())
        url = 'https://steve-strange.github.io/' + prefix + (route + '/' if route else '')
        assert page.lang == lang and page.canonical == url, path
        assert url in urls, path
        assert set(page.alternates) == {'en', 'zh-CN', 'x-default'}, path
        assert page.navigation == [f'/{prefix}' + s for s in ['#research','publications/','#projects','arcade/','#experience','archives/']], path
        check_links(page, path)
print('PASS: six papers, author order, metadata, citations, images, bilingual routes, shared navigation, local links and sitemap.')
