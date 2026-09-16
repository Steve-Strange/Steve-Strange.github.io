# Publication pages

Edit `papers.json`, then run from the repository root:

```sh
python scripts/build_publications.py
python scripts/check_publications.py
```

The build produces six static HTML explainers, Markdown equivalents, per-paper and combined BibTeX, a site-wide sitemap, robots.txt and llms.txt. Page content is available without JavaScript. The small script only copies citations.

Use publisher / DOI registration metadata for titles, author order, publication dates and pagination. Keep contribution roles distinct from author order. Do not infer publication year from a DOI's year component, or turn preliminary author-manuscript measurements into claims about a final publisher version.

Each paper page contains its full author-written abstract, Google Scholar `citation_*` metadata, ScholarlyArticle JSON-LD, method explanation, evidence boundaries and a canonical DOI. Do not add `citation_pdf_url` until an authorized, complete full-text version is hosted in that paper's own directory. Current pages link to publishers instead of redistributing institutional subscription downloads.

Figures derive from author-provided paper/project materials, with provenance in each caption. The three supplied demos were trimmed past their title cards (FanPad: 4 s; MOA: 8 s; collaborative disassembly: 8 s), encoded as H.264/AAC with fast-start metadata, and load on demand. They are demonstrations, not substitutes for the evaluation evidence.

The sitemap also retains existing blog and game index pages. `llms.txt` is a convenience for machine readers, not a promise of indexing. Google Scholar profile updates and search indexing are separate processes.
