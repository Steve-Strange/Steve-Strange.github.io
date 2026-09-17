"""Build static, crawlable paper pages from the reviewed public catalog. Stdlib only."""
import json
from site_common import ROOT, BASE, ESC, shell, local

PAPERS = json.loads((ROOT / 'publications/papers.json').read_text())
BY_SLUG = {p['slug']: p for p in PAPERS}
TRANSLATIONS = json.loads((ROOT / 'publications/translations.json').read_text())

def bibtex(p):
    kind = 'inproceedings' if p['slug'] == 'fanpad' else 'article'
    fields = {'title': '{' + p['title'] + '}', 'author': ' and '.join(p['authors']),
              'booktitle' if kind == 'inproceedings' else 'journal': p['venue'],
              'year': p['year'], 'volume': p['volume'], 'number': p['issue'],
              'pages': p['pages'].replace('-', '--'), 'doi': p['doi'],
              'url': 'https://doi.org/' + p['doi']}
    return '@' + kind + '{' + p['slug'].replace('-', '') + str(p['year']) + ',\n' + ',\n'.join(
        f'  {key} = {{{value}}}' for key, value in fields.items() if value) + '\n}\n'



LABELS = {
    'en': ['Publisher', 'Markdown', 'All publications', 'Published', 'Abstract', 'Method', 'Evidence', 'Demo', 'Limitations', 'Cite', 'Evaluation', 'Result / observation', 'Scope', 'My contribution', 'Cite this paper', 'Download BibTeX', 'Copy BibTeX', 'Related work', 'Download demo', 'Methods, evidence and citation →'],
    'zh': ['出版全文', '纯文本', '全部论文', '已发表', '摘要（中文翻译）', '方法讲解', '实验与证据', '演示', '适用边界', '引用', '评测', '结果 / 观察', '解释范围', '我的贡献', '引用这篇论文', '下载 BibTeX', '复制 BibTeX', '继续阅读', '下载演示', '方法、证据与引用 →']
}


def translated(p, lang):
    q = dict(p)
    if lang == 'en':
        q.update(TRANSLATIONS[p['slug']]['en'])
        q['summary'] = p['summary_en']
    else:
        q['role'] = p['role'].split(' / ')[0]
    q['display_title'] = TRANSLATIONS[p['slug']]['title_zh'] if lang == 'zh' else p['title']
    return q


def card(p, lang):
    q = translated(p, lang)
    path = local(f'/publications/{p["slug"]}/', lang)
    return f'''<article class="paper-card"><a href="{path}" class="card-image"><img src="/publications/{p['slug']}/{p['cover']}" alt="{ESC(q['cover_alt'])}" width="1200" height="675" loading="lazy"></a><div class="card-body"><p class="kicker">{p['venue_short']} · {p['year']}</p><h2><a href="{path}">{ESC(q['display_title'])}</a></h2><p>{ESC(q['summary'])}</p><p class="role">{ESC(q['role'])}</p><a href="{path}">{LABELS[lang][19]}</a></div></article>'''


all_bib = ''
for p in PAPERS:
    slug = p['slug']
    original = ROOT / 'publications' / slug
    bib = bibtex(p)
    all_bib += bib + '\n'
    (original / 'cite.bib').write_text(bib)
    metadata = {'citation_title': p['title'], 'citation_publication_date': p['date'].replace('-', '/'),
                'citation_doi': p['doi'], 'citation_abstract_html_url': BASE + f'/publications/{slug}/',
                'citation_conference_title' if slug == 'fanpad' else 'citation_journal_title': p['venue'],
                'citation_volume': p['volume'], 'citation_issue': p['issue'],
                'citation_firstpage': p['pages'].split('-')[0], 'citation_lastpage': p['pages'].split('-')[-1],
                'citation_language': 'en'}
    meta = '\n'.join(f'<meta name="{k}" content="{ESC(str(v), quote=True)}">' for k, v in metadata.items() if v)
    meta += '\n' + '\n'.join(f'<meta name="citation_author" content="{ESC(a)}">' for a in p['authors'])
    meta += '\n<script defer src="/assets/publications.js"></script>'
    for lang in ['en', 'zh']:
        q = translated(p, lang)
        labels = LABELS[lang]
        publisher, markdown, all_papers, published, abstract_label, method, evidence_label, demo, limitations, cite_label, evaluation, observation, scope, contribution, cite_title, download_bib, copy_bib, related_label, download_demo, _ = labels
        path = f'/publications/{slug}/'
        assets = path
        out = ROOT / local(path, lang).strip('/')
        out.mkdir(parents=True, exist_ok=True)
        structured = {'@context': 'https://schema.org', '@type': 'ScholarlyArticle',
                      '@id': BASE + path + '#article', 'headline': p['title'], 'name': p['title'],
                      'author': [{'@type': 'Person', 'name': a, **({'@id': BASE + '/#person'} if a == 'Ziteng Wang' else {})} for a in p['authors']],
                      'datePublished': p['date'], 'abstract': p['abstract'], 'description': p['summary_en'],
                      'inLanguage': 'en', 'identifier': p['doi'], 'sameAs': 'https://doi.org/' + p['doi'],
                      'url': BASE + path, 'image': BASE + assets + p['cover'],
                      'isPartOf': {'@type': 'Periodical' if slug != 'fanpad' else 'CreativeWork', 'name': p['venue']},
                      'keywords': p['keywords']}
        links = [[publisher, 'https://doi.org/' + p['doi']], ['BibTeX', assets + 'cite.bib'], [markdown, 'index.md']] + q.get('links', [])
        buttons = ''.join(f'<a class="button" href="{ESC(u, quote=True)}">{ESC(label)}</a>' for label, u in links)
        figure = f'<figure><img src="{assets}{p["figure"]}" alt="{ESC(q["figure_caption"])}" loading="lazy"><figcaption>{ESC(q["figure_caption"])}</figcaption></figure>' if p.get('figure') else ''
        steps = ''.join(f'<li><h3>{ESC(title)}</h3><p>{ESC(text)}</p></li>' for title, text in q['steps'])
        rows = ''.join('<tr>' + ''.join(f'<{tag}>{ESC(cell)}</{tag}>' for tag, cell in zip(['th', 'td', 'td'], row)) + '</tr>' for row in q['results'])
        video = f'<section id="demo"><h2>{demo}</h2><video controls playsinline preload="none" poster="{assets}{p["cover"]}"><source src="{assets}{p["video"]}" type="video/mp4"><a href="{assets}{p["video"]}">{download_demo}</a></video><p class="caption">{ESC(q["video_caption"])}</p></section>' if p.get('video') else ''
        related = ''.join(f'<a href="{local("/publications/" + s + "/", lang)}">{ESC(BY_SLUG[s]["short"])}</a>' for s in p['related'])
        citation = ', '.join(p['authors']) + '. ' + p['title'] + '. ' + p['venue'] + ', ' + str(p['year']) + '. DOI: ' + p['doi']
        abstract = ESC(p['abstract']) if lang == 'en' else ESC(TRANSLATIONS[slug]['abstract_zh'])
        official_title = f'<p class="official-title" lang="en">{ESC(p["title"])}</p>' if lang == 'zh' else ''
        original_abstract = f'<details class="original-abstract"><summary>英文原摘要</summary><p lang="en">{ESC(p["abstract"])}</p></details>' if lang == 'zh' else ''
        body = f'''<main id="main"><article class="paper-detail">
<p class="breadcrumb"><a href="{local('/publications/', lang)}">← {all_papers}</a></p>
<p class="kicker">{ESC(p['venue_short'])} · {p['date']} · {published}</p>
<h1>{ESC(q['display_title'])}</h1>{official_title}
<p class="authors" lang="en">{ESC(', '.join(p['authors']))}</p>
<p class="role">{'王子腾' if lang == 'zh' else 'Ziteng Wang'}: {ESC(q['role'])}</p>
<p class="bibliography">{ESC(p['venue'])} {ESC(p['volume'])}{f'({p["issue"]})' if p['issue'] else ''}{f', pp. {p["pages"]}' if p['pages'] else ''} · <a href="https://doi.org/{p['doi']}">{p['doi']}</a></p>
<section class="abstract" aria-labelledby="abstract-title"><h2 id="abstract-title">{abstract_label}</h2><p>{abstract}</p>{original_abstract}</section>
<div class="actions">{buttons}</div>
<nav class="toc" aria-label="{'文章目录' if lang == 'zh' else 'On this page'}"><a href="#explanation">{method}</a><a href="#results">{evidence_label}</a>{f'<a href="#demo">{demo}</a>' if video else ''}<a href="#limitations">{limitations}</a><a href="#cite">{cite_label}</a></nav>
<section id="explanation"><h2>{ESC(q['summary'])}</h2><p>{ESC(q['question'])}</p>{figure}<ol class="method-steps">{steps}</ol></section>
<section id="results"><h2>{evidence_label}</h2><div class="table-wrap"><table><thead><tr><th>{evaluation}</th><th>{observation}</th><th>{scope}</th></tr></thead><tbody>{rows}</tbody></table></div><p class="source-note">{ESC(q['evidence'])}</p></section>
{video}
<section id="limitations"><h2>{limitations}</h2><p>{ESC(q['limitations'])}</p><h3>{contribution}</h3><p>{ESC(q['contribution'])}</p></section>
<section id="cite"><h2>{cite_title}</h2><p lang="en">{ESC(citation)}</p><div class="actions"><a class="button" href="{assets}cite.bib" download>{download_bib}</a><button class="button" data-copy="bibtex">{copy_bib}</button><span role="status" data-copy-status></span></div><pre id="bibtex" lang="en">{ESC(bib)}</pre></section>
<aside class="related"><h2>{related_label}</h2>{related}</aside></article></main>'''
        (out / 'index.html').write_text(shell(q['display_title'], q['summary'], path, body, lang, active='publications', metadata=meta, structured=structured, image=assets + p['cover'], body_class='publication-page'))
        md = f'# {q["display_title"]}\n\n' + ', '.join(p['authors']) + f'\n\n{p["venue"]}, {p["date"]}. DOI: https://doi.org/{p["doi"]}\n\nZiteng Wang: {q["role"]}\n\n## {abstract_label}\n\n' + (p['abstract'] if lang == 'en' else TRANSLATIONS[slug]['abstract_zh']) + f'\n\n## {method}\n\n{q["summary"]}\n\n{q["question"]}\n'
        for title, text in q['steps']: md += f'\n### {title}\n\n{text}\n'
        md += f'\n## {evidence_label}\n\n' + '\n'.join(' · '.join(row) for row in q['results']) + f'\n\n{q["evidence"]}\n\n## {limitations}\n\n{q["limitations"]}\n\n## {contribution}\n\n{q["contribution"]}\n\n## BibTeX\n\n```bibtex\n{bib}```\n'
        (out / 'index.md').write_text(md)

for lang in ['en', 'zh']:
    title = '论文与方法讲解' if lang == 'zh' else 'Research publications'
    intro = '从 VR 输入、多物体交互与感知，到多人协同拆卸规划。' if lang == 'zh' else 'From VR input and multi-object interaction to collaborative disassembly planning.'
    lead = '王子腾 · 北京航空航天大学。这里汇集 6 篇已发表论文的方法、证据、演示和引用信息。' if lang == 'zh' else 'Six published papers by Ziteng Wang at Beihang University, with methods, evidence, demonstrations and citations.'
    index = f'<main id="main"><section class="intro"><h1>{title}</h1><p class="lead">{intro}</p><p>{lead}</p><div class="actions"><a class="button" href="/publications/publications.bib" download>{"全部 BibTeX" if lang == "zh" else "Download all BibTeX"}</a><a class="button" href="https://scholar.google.com/citations?user=FDuEOccAAAAJ">Google Scholar</a></div></section><div class="paper-grid">' + ''.join(card(p, lang) for p in PAPERS) + '</div></main>'
    out = ROOT / local('/publications/', lang).strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(shell(title, lead, '/publications/', index, lang, active='publications', structured={'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': title, 'url': BASE + local('/publications/', lang), 'hasPart': [{'@type': 'ScholarlyArticle', 'name': p['title'], 'url': BASE + '/publications/' + p['slug'] + '/'} for p in PAPERS]}, body_class='publication-page'))
(ROOT / 'publications/publications.bib').write_text(all_bib.rstrip() + '\n')
(ROOT / 'llms.txt').write_text('# Ziteng Wang / 王子腾\n\n> PhD student at Beihang University working on embodied AI, VR/HCI and disassembly planning.\n\n- [English homepage](' + BASE + '/)\n- [中文主页](' + BASE + '/zh/)\n\n## Publications\n\n' + '\n'.join(f'- [{p["title"]}]({BASE}/publications/{p["slug"]}/index.md): {p["summary_en"]} DOI: {p["doi"]}.' for p in PAPERS) + '\n\n## Citation data\n\n- [BibTeX](' + BASE + '/publications/publications.bib)\n\nUse publisher records for authoritative bibliographic updates. Explainers distinguish study evidence from limitations.\n')
print('Built six paper explainers and publication indexes in English and Chinese.')
