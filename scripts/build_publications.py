"""Build static, crawlable paper pages from the reviewed public catalog. Stdlib only."""
import html
import json
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://steve-strange.github.io'
PAPERS = json.loads((ROOT / 'publications/papers.json').read_text())
ESC = html.escape
BY_SLUG = {p['slug']: p for p in PAPERS}


def bibtex(p):
    kind = 'inproceedings' if p['slug'] == 'fanpad' else 'article'
    fields = {'title': '{' + p['title'] + '}', 'author': ' and '.join(p['authors']),
              'booktitle' if kind == 'inproceedings' else 'journal': p['venue'],
              'year': p['year'], 'volume': p['volume'], 'number': p['issue'],
              'pages': p['pages'].replace('-', '--'), 'doi': p['doi'],
              'url': 'https://doi.org/' + p['doi']}
    return '@' + kind + '{' + p['slug'].replace('-', '') + str(p['year']) + ',\n' + ',\n'.join(
        f'  {key} = {{{value}}}' for key, value in fields.items() if value) + '\n}\n'


def shell(title, description, path, body, metadata='', structured=None, image=''):
    structured_text = json.dumps(structured, ensure_ascii=False).replace('<', '\\u003c') if structured else '{}'
    return f'''<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{ESC(title)} | Ziteng Wang</title>
<meta name="description" content="{ESC(description, quote=True)}">
<meta name="author" content="Ziteng Wang"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{BASE}{path}">
<meta property="og:type" content="article"><meta property="og:title" content="{ESC(title, quote=True)}">
<meta property="og:description" content="{ESC(description, quote=True)}"><meta property="og:url" content="{BASE}{path}">
{f'<meta property="og:image" content="{BASE}{image}">' if image else ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/publications.css"><script defer src="/assets/publications.js"></script>
{metadata}<script type="application/ld+json">{structured_text}</script>
</head><body><a class="skip" href="#main">跳到正文</a>
<header><a class="brand" href="/">王子腾 <span>Ziteng Wang</span></a><nav aria-label="主导航"><a href="/publications/">论文 / Papers</a><a href="https://scholar.google.com/citations?user=FDuEOccAAAAJ">Scholar</a><a href="/assets/ziteng-wang-cv.pdf">简历</a></nav></header>
<main id="main">{body}</main>
<footer>王子腾 · Ziteng Wang · Beihang University <a href="/publications/">全部论文</a> <a href="mailto:wzt2694630726@gmail.com">联系作者</a><p>引用请使用论文正式题名与 DOI。研究说明与出版全文相互补充。</p></footer>
</body></html>'''


def card(p):
    image = f'<img src="/publications/{p["slug"]}/{p["figure"]}" alt="{ESC(p["short"])} 方法示意" loading="lazy">' if p.get('figure') else '<div class="diagram-thumb" aria-hidden="true">Sequence → Transformer → Guidance</div>'
    return f'''<article class="paper-card"><a href="/publications/{p['slug']}/" class="card-image">{image}</a><div class="card-body"><p class="kicker">{p['venue_short']} · {p['year']}</p><h2><a href="/publications/{p['slug']}/">{ESC(p['title'])}</a></h2><p>{ESC(p['summary'])}</p><p class="role">{ESC(p['role'])}</p><a href="/publications/{p['slug']}/">方法、证据与引用 →</a></div></article>'''


all_bib = ''
for p in PAPERS:
    slug = p['slug']
    out = ROOT / 'publications' / slug
    out.mkdir(exist_ok=True)
    bib = bibtex(p)
    all_bib += bib + '\n'
    (out / 'cite.bib').write_text(bib)
    metadata = {'citation_title': p['title'], 'citation_publication_date': p['date'].replace('-', '/'),
                'citation_doi': p['doi'], 'citation_abstract_html_url': BASE + f'/publications/{slug}/',
                'citation_conference_title' if slug == 'fanpad' else 'citation_journal_title': p['venue'],
                'citation_volume': p['volume'], 'citation_issue': p['issue'],
                'citation_firstpage': p['pages'].split('-')[0], 'citation_lastpage': p['pages'].split('-')[-1],
                'citation_language': 'en'}
    meta = '\n'.join(f'<meta name="{k}" content="{ESC(str(v), quote=True)}">' for k,v in metadata.items() if v)
    meta += '\n' + '\n'.join(f'<meta name="citation_author" content="{ESC(a)}">' for a in p['authors'])
    structured = {'@context':'https://schema.org','@type':'ScholarlyArticle',
                  '@id':BASE+f'/publications/{slug}/#article', 'headline':p['title'], 'name':p['title'],
                  'author':[{'@type':'Person','name':a} for a in p['authors']], 'datePublished':p['date'],
                  'abstract':p['abstract'], 'description':p['summary_en'], 'inLanguage':'en',
                  'identifier':p['doi'], 'sameAs':'https://doi.org/'+p['doi'],
                  'url':BASE+f'/publications/{slug}/', 'isPartOf':{'@type':'Periodical' if slug!='fanpad' else 'CreativeWork','name':p['venue']},
                  'keywords':p['keywords']}
    links = [['出版全文 / Publisher', 'https://doi.org/' + p['doi']], ['BibTeX', 'cite.bib'], ['纯文本 / Markdown', 'index.md']] + p.get('links', [])
    buttons = ''.join(f'<a class="button" href="{ESC(u, quote=True)}">{ESC(label)}</a>' for label,u in links)
    figure = f'<figure><img src="{p["figure"]}" alt="{ESC(p["figure_caption"])}"><figcaption>{ESC(p["figure_caption"])}</figcaption></figure>' if p.get('figure') else ''
    steps = ''.join(f'<li><h3>{ESC(title)}</h3><p>{ESC(text)}</p></li>' for title,text in p['steps'])
    rows = ''.join('<tr>' + ''.join(f'<{tag}>{ESC(cell)}</{tag}>' for tag,cell in zip(['th','td','td'], row)) + '</tr>' for row in p['results'])
    video = f'<section id="demo"><h2>演示 / Demo</h2><video controls playsinline preload="none" poster="{p.get("figure", "")}"><source src="{p["video"]}" type="video/mp4"><a href="{p["video"]}">下载演示视频</a></video><p class="caption">{ESC(p["video_caption"])}</p></section>' if p.get('video') else ''
    related = ''.join(f'<a href="/publications/{s}/">{ESC(BY_SLUG[s]["short"])}</a>' for s in p['related'])
    citation = ', '.join(p['authors']) + '. ' + p['title'] + '. ' + p['venue'] + ', ' + str(p['year']) + '. DOI: ' + p['doi']
    body = f'''<article class="paper-detail">
<p class="breadcrumb"><a href="/publications/">← 全部论文</a></p>
<p class="kicker">{ESC(p['venue_short'])} · {p['date']} · 已发表</p>
<h1 lang="en">{ESC(p['title'])}</h1>
<p class="authors" lang="en">{ESC(', '.join(p['authors']))}</p>
<p class="role">王子腾：{ESC(p['role'])}</p>
<p class="bibliography">{ESC(p['venue'])} {ESC(p['volume'])}{f'({p["issue"]})' if p['issue'] else ''}{f', pp. {p["pages"]}' if p['pages'] else ''} · <a href="https://doi.org/{p['doi']}">{p['doi']}</a></p>
<section class="abstract" aria-labelledby="abstract-title"><h2 id="abstract-title">Abstract</h2><p lang="en">{ESC(p['abstract'])}</p></section>
<div class="actions">{buttons}</div>
<nav class="toc" aria-label="文章目录"><a href="#explanation">方法讲解</a><a href="#results">实验与证据</a>{'<a href="#demo">演示</a>' if video else ''}<a href="#limitations">适用边界</a><a href="#cite">引用</a></nav>
<section id="explanation"><p class="kicker">THE IDEA</p><h2>{ESC(p['summary'])}</h2><p class="english-summary" lang="en">{ESC(p['summary_en'])}</p><p>{ESC(p['question'])}</p>{figure}<ol class="method-steps">{steps}</ol></section>
<section id="results"><h2>实验告诉我们什么</h2><div class="table-wrap"><table><thead><tr><th>评测</th><th>结果 / 观察</th><th>解释范围</th></tr></thead><tbody>{rows}</tbody></table></div><p class="source-note">{ESC(p['evidence'])}</p></section>
{video}
<section id="limitations"><h2>适用边界</h2><p>{ESC(p['limitations'])}</p><h3>我的贡献</h3><p>{ESC(p['contribution'])}</p></section>
<section id="cite"><h2>引用这篇论文</h2><p lang="en">{ESC(citation)}</p><div class="actions"><a class="button" href="cite.bib" download>下载 BibTeX</a><button class="button" data-copy="bibtex">复制 BibTeX</button><span role="status" data-copy-status></span></div><pre id="bibtex" lang="en">{ESC(bib)}</pre></section>
<aside class="related"><h2>继续阅读</h2>{related}</aside></article>'''
    (out/'index.html').write_text(shell(p['title'],p['summary_en'],f'/publications/{slug}/',body,meta,structured,f'/publications/{slug}/{p["figure"]}' if p.get('figure') else ''))
    md = f'# {p["title"]}\n\n' + ', '.join(p['authors']) + f'\n\n{p["venue"]}, {p["date"]}. DOI: https://doi.org/{p["doi"]}\n\nZiteng Wang: {p["role"]}\n\n## Abstract\n\n{p["abstract"]}\n\n## 方法讲解\n\n{p["summary"]}\n\n{p["summary_en"]}\n\n{p["question"]}\n'
    for title,text in p['steps']: md += f'\n### {title}\n\n{text}\n'
    md += '\n## 实验与证据\n\n' + '\n'.join(' · '.join(row) for row in p['results']) + f'\n\n{p["evidence"]}\n\n## 适用边界\n\n{p["limitations"]}\n\n## 我的贡献\n\n{p["contribution"]}\n\n## BibTeX\n\n```bibtex\n{bib}```\n'
    (out/'index.md').write_text(md)

index = '<section class="intro"><p class="kicker">RESEARCH PUBLICATIONS</p><h1>论文与方法讲解</h1><p class="lead">从 VR 输入、多物体交互与感知，到多人协同拆卸规划。</p><p lang="en">Research by Ziteng Wang · Beihang University. Explore the methods, evidence, demos, and citations behind six published papers.</p><div class="actions"><a class="button" href="publications.bib" download>全部 BibTeX</a><a class="button" href="https://scholar.google.com/citations?user=FDuEOccAAAAJ">Google Scholar</a></div></section><div class="paper-grid">' + ''.join(card(p) for p in PAPERS) + '</div>'
(ROOT/'publications/index.html').write_text(shell('论文与方法讲解 / Research Publications','Six research papers by Ziteng Wang on virtual reality, interaction, cybersickness, and collaborative disassembly.','/publications/',index,structured={'@context':'https://schema.org','@type':'CollectionPage','name':'Research publications by Ziteng Wang','url':BASE+'/publications/','hasPart':[{'@type':'ScholarlyArticle','name':p['title'],'url':BASE+'/publications/'+p['slug']+'/'} for p in PAPERS]}))
(ROOT/'publications/publications.bib').write_text(all_bib)
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'/sitemap.xml\n')
# Preserve discovery of existing blog and game pages alongside research pages.
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
urlset = ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
for path in sorted(ROOT.rglob('index.html')):
    if any(part in {'.git','.runtime','node_modules','artifacts','lib'} for part in path.relative_to(ROOT).parts): continue
    relative=path.parent.relative_to(ROOT).as_posix()
    url=ET.SubElement(urlset,'url');ET.SubElement(url,'loc').text=BASE+('/' if relative=='.' else '/'+relative+'/')
ET.ElementTree(urlset).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(ROOT/'llms.txt').write_text('# Ziteng Wang / 王子腾\n\n> Beihang University researcher working on VR/HCI and disassembly planning.\n\n## Publications\n\n'+ '\n'.join(f'- [{p["title"]}]({BASE}/publications/{p["slug"]}/index.md): {p["summary_en"]} DOI: {p["doi"]}.' for p in PAPERS) + '\n\n## Citation data\n\n- [BibTeX]('+BASE+'/publications/publications.bib)\n- [Structured catalog]('+BASE+'/publications/papers.json)\n\nUse publisher records for authoritative bibliographic updates. Explainers distinguish study evidence from limitations.\n')
print(f'Built {len(PAPERS)} paper pages, index, citations, sitemap, and text discovery files.')
