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
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta': self.meta.append(attrs)
        for key in ('src', 'href', 'poster'):
            if attrs.get(key): self.links.append(attrs[key])

assert len(papers) == len({p['doi'].lower() for p in papers}) == 6
for p in papers:
    path = ROOT / 'publications' / p['slug'] / 'index.html'
    text = path.read_text()
    page = Page(text)
    assert p['title'] in text and p['abstract'][:50] in text
    assert len(p['abstract'].split()) > 100, p['slug']
    authors = [m['content'] for m in page.meta if m.get('name') == 'citation_author']
    assert authors == p['authors'], p['slug']
    doi = next(m['content'] for m in page.meta if m.get('name') == 'citation_doi')
    assert doi == p['doi']
    assert 'citation_pdf_url' not in text, 'Do not advertise unverified full-text PDFs'
    assert all(s in text for s in ('id="results"', 'id="limitations"', 'id="cite"'))
    bib = path.with_name('cite.bib').read_text()
    assert p['doi'] in bib and ' and '.join(p['authors']) in bib
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path: continue
        target = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else path.parent / unquote(url.path)
        if target.is_dir(): target /= 'index.html'
        assert target.is_file(), (p['slug'], link)
assert '共同第一作者（署名第二）' in (ROOT/'publications/fanpad/index.html').read_text()
assert '3732564' in (ROOT/'index.html').read_text()
assert '<strong>06</strong>' in (ROOT/'index.html').read_text()
tree = ET.parse(ROOT / 'sitemap.xml')
urls = {e.text for e in tree.iter() if e.tag.endswith('loc')}
assert all(f'https://steve-strange.github.io/publications/{p["slug"]}/' in urls for p in papers)
print('PASS: six papers, author order, metadata, citations, local assets, homepage and sitemap.')
