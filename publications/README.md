# Publication pages

Edit `papers.json` for bibliographic facts and Chinese explainers, and `translations.json` for English explainers and Chinese abstract translations. Then run from the repository root:

```sh
python scripts/build_site.py
python scripts/check_publications.py
```

The build produces English pages at the root and Chinese pages under `/zh/`, including the homepage, six paper explainers, publication index, arcade, standalone game shells, archive landing page and about page. Every pair has a self-canonical URL and reciprocal `hreflang` links; English is the default. Content and language links work without JavaScript. The language switch preserves the current section and selected game when JavaScript is available.

`scripts/site_common.py` owns the shared navigation, footer and metadata. `assets/site.css` applies the same navigation, typography and palette across current pages and archived blog pages. Homepage and game sources live in `scripts/templates/`; edit those sources rather than generated HTML. Games use the same generated `play.html` inside the arcade and standalone shells, keeping the shared navigation outside the canvas. Existing blog posts retain their original paths and original language; `?lang=zh` selects Chinese site navigation on those pages.

BibTeX, Markdown, sitemap.xml, robots.txt and llms.txt are generated too. Browser checks use `scripts/site.e2e.spec.cjs` and `arcade/e2e.spec.cjs` with Playwright (`ARCADE_URL` sets the preview origin).

Use publisher / DOI registration metadata for titles, author order, publication dates and pagination. Keep contribution roles distinct from author order. Do not infer publication year from a DOI's year component, or turn preliminary author-manuscript measurements into claims about a final publisher version.

Each paper page contains its full author-written abstract, Google Scholar `citation_*` metadata, ScholarlyArticle JSON-LD, method explanation, evidence boundaries and a canonical DOI. Do not add `citation_pdf_url` until an authorized, complete full-text version is hosted in that paper's own directory. Current pages link to publishers instead of redistributing institutional subscription downloads.

Figures derive from author-provided paper/project materials, with provenance in each caption. The three supplied demos were trimmed past their title cards (FanPad: 4 s; MOA: 8 s; collaborative disassembly: 8 s), encoded as H.264/AAC with fast-start metadata, and load on demand. They are demonstrations, not substitutes for the evaluation evidence.

All six cards have dedicated 1200×675 covers. Collaborative disassembly, FanPad and MOA use demonstration frames. Align-Box and cybersickness use crops from the paper figures. DSPT uses Figure 1 from the recoverable publisher PDF pages; its method overview is also shown in the article. Original detailed figures remain in the article bodies. DSPT's Tables 2 and 4 support the reported accuracy and task-time results.

The sitemap also retains existing blog and game index pages. `llms.txt` is a convenience for machine readers, not a promise of indexing. Google Scholar profile updates and search indexing are separate processes.

For search discovery, the homepage identifies Ziteng Wang, 王子腾, Wang Ziteng and Beihang University through visible text and Person / ProfilePage metadata. Paper pages preserve exact English publication titles, ordered authors and DOI metadata in both language versions. Covers have descriptive alt text and Open Graph metadata.

To request Google indexing, verify the URL-prefix property `https://steve-strange.github.io/` in [Google Search Console](https://search.google.com/search-console/), submit `https://steve-strange.github.io/sitemap.xml`, and inspect the homepage and `/publications/` URLs. Verification needs the property owner's account; no verification token has been invented or submitted. [Google's guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) says crawling can take days to weeks and does not guarantee inclusion. Bing offers the equivalent process in [Bing Webmaster Tools](https://www.bing.com/webmasters/).

Useful search queries: `"Ziteng Wang" "Beihang"`, `"王子腾" "FanPad"`, `"Ziteng Wang" "Collaborative Disassembly"`, or an exact paper title / DOI. `site:steve-strange.github.io` can help inspect visible search results but is not an exhaustive index-status report. Direct search checks from this server returned JavaScript interstitials or unrelated results, so current indexing status was not established.
