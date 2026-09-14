# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`experty.es` — a static, Russian-language directory of Russian-speaking specialists in Spain
(бухгалтеры, юристы, психологи, риелторы, мастера красоты, etc.). Hosted on GitHub Pages
(`CNAME` → `experty.es`). There is **no build system, no framework, no dependencies, no tests**.
Every page is hand-written (or generated externally and committed) HTML.

## Commands

- **Preview locally:** `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/`.
- **Deploy:** `git push origin main` — GitHub Pages publishes `main` directly. No CI, no lint, no test step.
- Some history commits are literally "Add files via upload" (GitHub web UI), so page structure is
  not perfectly uniform between generations — match the file you are editing, not a global template.

## Architecture

Three kinds of page, all self-contained:

1. **`index.html`** — homepage. Category grid (`#cats-grid`, cards carry `data-cats` for the
   `filterCats()` tag filter) + featured specialists grid (`#spec-grid`) + "find a specialist" /
   "become a specialist" modal.
2. **Category / landing pages** — e.g. `psiholog.html`, `yurist.html`, `buhgalter.html`,
   `logoped-na-russkom-v-ispanii.html`. SEO landing copy + a `.specialists-grid` of specialist
   cards for that category + `openModalSpec()` / `openModal()` lead forms.
3. **Specialist profile pages** — `<surname>-<name>.html` (e.g. `guseva-maria.html`,
   `patrenina-marina.html`). Hero with photo + contact buttons, service/price blocks, FAQ
   accordion (`toggleFaq`), a review list, and a review form (`#review-form` / `#rform`) with a
   star-rating widget (`setStars`).
4. **Legal pages** — `aviso-legal.html`, `privacidad.html`, `cookies.html` (content in Spanish;
   footer entity is "SL Claros Asesores").

### No shared assets — everything is inlined

There is **no shared `.css` or `.js` file** (the one `<script src>`, `/referral.js`, is not in
the repo — see Gotchas). Each page duplicates:

- The full `<style>` block in `<head>`, including the design tokens in `:root`:
  `--bg:#F7F5F2` `--ink:#1A1714` `--gold:#C8A96E`, `--serif:"Playfair Display"`,
  `--sans:"Inter"`, `--green:#2D6A4F`. Keep these values identical across pages.
- The Yandex.Metrika (`id=110939247`) and Google Analytics (`G-G0GYE2Q6Q7`) snippets in `<head>`.
- Its own `<script>` at end of `<body>` for that page's interactions.

When changing a global look-and-feel or an analytics ID, it must be edited in **every** HTML file.

### Forms

All forms POST to the same Formspree endpoint: `https://formspree.io/f/mbdvdyjw`. They are
distinguished only by a hidden `<input name="type">` (e.g. `client`, `specialist`,
`review-maria-guseva`, `help-psiholog`, `specialist-psiholog`). Submit is intercepted in JS:
`fetch(action, {method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}})`,
then a hidden success `<div>` is shown. Reuse this pattern for new forms.

### Contact links

Platform contacts: WhatsApp `wa.me/34685093534`, Telegram `t.me/infoaccount1`,
`info@experty.es`. Specialist pages use that specialist's own `wa.me` / `t.me` / `tel:` /
`mailto:` links (often with a pre-filled `?text=` on WhatsApp).

### SEO conventions (per page)

- `<link rel="canonical">`, `og:*` meta, and one or more `application/ld+json` blocks
  (`Organization`/`WebSite`/`FAQPage` on landing pages; `Person` + `BreadcrumbList` + `FAQPage`
  on profiles).
- **Canonical URLs and `sitemap.xml` are extensionless** (`https://experty.es/guseva-maria`).
  GitHub Pages' own static serving is the reason both `/foo` and `/foo.html` return `200` for
  the same file with no redirect between them — this is not Jekyll (the repo has no
  `_config.yml`/`.nojekyll`) but GH Pages' extensionless-URL fallback. That duplication is being
  consolidated page by page via Cloudflare Bulk Redirects (301, `.html` → bare), so **inter-page
  `<a href>` link format is currently mixed, not uniform** — link to whichever form is that
  target page's current state:
  - **Bare, no `.html`** (redirect already live in Cloudflare) — `rieltor`, `avto`, `nyanya`,
    `psiholog`, `massazh`, `klining`, `trener`, `fotograf`, `logoped`, `repetitor`,
    `master-krasoty`, `gv-doula`, `yurist`, `dizayner`, `ryabova-lyudmila`,
    `cheremisina-svetlana`, `patrenina-marina`, `gribovich-zlata`, `vilkova-diana`,
    `ardani-anna`, `lakaev-aleksandr`, `flacorus-sergey`.
  - **`.html`** (still current — no redirect configured yet) — every other specialist/category
    page. These already declare a bare `<link rel="canonical">` too, but until their Cloudflare
    redirect exists, linking to the bare URL would just be linking to the unredirected duplicate,
    not a real fix — leave them as `.html` for now.
  - **`.html`, and canonical points at `.html` too (not bare)** — `aviso-legal.html`,
    `cookies.html`, `privacidad.html`. The reverse inconsistency; unresolved, separate from the
    above two groups — don't fold them into either list.

  This is a migration in progress, not a permanent split. Once the remaining ~37 pages get their
  own Cloudflare redirect, the rule collapses back to "bare everywhere" and this section should
  be rewritten to say that plainly again.

## Adding a new specialist

1. Create `<surname>-<name>.html` (copy the closest existing profile page).
2. Add their photo `foto-<name>-<surname>.jpg` and reference it (profiles use `onerror` fallbacks
   so a missing image degrades gracefully).
3. Add a specialist card to the relevant category page's `.specialists-grid`.
4. Optionally add a card to `index.html` `#spec-grid`.
5. Add a `<url>` entry to `sitemap.xml` (extensionless `<loc>`, update `<lastmod>`).
6. Update the JSON-LD (`Person`, `BreadcrumbList`) and the review form's hidden
   `type` / `specialist` values on the new page.

## Gotchas

- `index.html` loads `<script src="/referral.js">` and calls `window.expertyFillRef()` /
  fills `#ref_code` — **`referral.js` is not committed to this repo.** It is either served
  separately or currently missing; guarded with `if(window.expertyFillRef)`.
- A few referenced assets are absent (e.g. `foto-maria-guseva.jpg`, `favicon-16x16.png`);
  pages handle this with `onerror` handlers, so a missing file is not necessarily a bug to "fix"
  by removing the reference.
- Cookie consent (`localStorage['cookie_consent']`) gates GA/YM; `rejected` sets
  `window['ga-disable-G-G0GYE2Q6Q7']` and stubs the Yandex counter.
