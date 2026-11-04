# Portfolio Content Evidence Register

**Review date:** 4 November 2026  
**Purpose:** Keep public project descriptions factual, distinguish owner-provided information from repository evidence, and prevent development-stage work from being advertised as a released product.

## Review rules

- A repository README is evidence of what the project documents, not proof that every described feature is deployed or currently available.
- A GitHub Pages link may be a static showcase rather than the full application. State that distinction.
- Do not claim customer counts, revenue, rankings, security audits, certifications or measured outcomes unless evidence and date are recorded.
- The agency portfolio distinguishes public tools, products in development and future product ideas.
- External live pages should be checked by the owner again before the production launch. This review verified repository metadata and README content, not real-time uptime of every external URL.

## Project register

| Project | Evidence reviewed | Public status and safe description |
|---|---|---|
| STRIDETO | Public repository `Hafiz-Hamza-Liaqat/Strideto`; README describes a Pakistan career and education opportunity platform with jobs, scholarships, admissions, student and employer workflows. README identifies `https://strideto.com`. | Owner identifies the platform as live and free to use. Public copy describes a career and education opportunity platform; avoid claiming it is globally available unless regional coverage is verified. The agency case study does not claim paid-client delivery, specific agency contribution or quantified outcomes. |
| RegexLab | Public repository `Hafiz-Hamza-Liaqat/RegexLab`; README documents a browser regex application, match inspection, animated replay, interactive learning, TypeScript, Playwright and GitHub Pages deployment. README identifies `https://hafiz-hamza-liaqat.github.io/RegexLab/`. | Public tool. Describe as a browser app for regex testing, match inspection, replay and learning. Avoid unsupported usage or performance metrics. |
| JotJSON | Public repository `Hafiz-Hamza-Liaqat/JotJSON`; README identifies a live app, local-first browser processing, JSON validation/formatting/comparison/search and learning features. README identifies React, TypeScript, Vite, Tailwind CSS, CodeMirror, Vitest and Playwright, and `https://hafiz-hamza-liaqat.github.io/JotJSON/`. | Public tool. Describe as a local-first JSON toolkit with interactive learning. Do not imply JSON documents are uploaded to a backend; repository states processing is local to the browser. |
| SiteIntel Pulse | Public repository `Hafiz-Hamza-Liaqat/siteIntel-pulse`; README identifies Next.js, TypeScript and SQLite. README explicitly says GitHub Pages is a static design/documentation showcase and the full interactive scanner runs on a native Node.js runtime. README identifies `https://hafiz-hamza-liaqat.github.io/siteintel-pulse/`. | In development per owner status. Clearly label the GitHub Pages URL as a static showcase, not the full scanner. Full interactive functionality needs a separately hosted Node.js application. Do not label the scanner as a production service or ready-to-install package. |
| Free AI Mixer | Public repository `hamza131zara/Free-AI-Mixer`; README describes AI scene-generation orchestration, asynchronous job states, a maximum of two concurrent jobs, Replicate-first/Gemini-fallback provider logic, and requires `VITE_SCENE_API_BASE_URL` plus `VITE_SCENE_GENERATION_PATH`. | In development per owner status. State that a generation API must be configured and that no hosted public demo is advertised. Do not imply provider calls work without customer/environment configuration. |
| Auto-Trading-Agent | Public repository `hamza131zara/Auto-Trading-Agent`; README reports Phase 6 market-data/canonical-data work, unresolved price-source disagreement and explicit trading authorization gates. | In development and unavailable to buy/install per owner roadmap. Solana-only, customer-isolated/self-hosted direction; trading is not authorized. Do not advertise hosted trading, guaranteed returns, investment advice or a ready-to-install commercial product. |

## Owner-provided claims requiring confirmation

These items were supplied as agency/team information and were not independently verified through the project repositories:

- A graphic designer with 8+ years of professional experience and a bachelor's degree in graphic design.
- An e-commerce operations team of 10+ specialists covering the stated marketplaces.
- STRIDETO being live and free to use.
- Final agency name, legal operator, registered/principal address, jurisdiction and official legal contact.
- Final brand mark, visual identity, canonical website domain and inquiry inbox.

Obtain the relevant person's consent for their profile and credentials before publication. Confirm team count and marketplace coverage with the team lead. Confirm STRIDETO availability and access regions before launch. Do not publish legal pages as final until the actual operator and jurisdiction are known.

## Public-claims safeguards in the current site

- Work page states that project showcases are not claims of paid-client delivery and that conceptual UI previews are illustrative.
- Project notes avoid unverified business metrics and mark development-stage work.
- Products page clearly distinguishes live/public tools from projects in development.
- Privacy, Terms and Disclaimer pages remain reachable for review but carry `noindex, nofollow` and are excluded from the sitemap while they are drafts.
- Sitemap retains the `YOUR-DOMAIN.example` placeholder until the owner supplies the canonical domain. No production domain is guessed.

## Final launch review checklist

- [ ] Owner rechecks each external live URL and its regional availability.
- [ ] Owner approves agency attribution, project contributions and each technology stack.
- [ ] Team lead approves experience, qualifications, team size and bios.
- [ ] Owner confirms actual product release states and public support routes.
- [ ] Legal operator and jurisdiction are supplied, and Privacy/Terms/Disclaimer are reviewed.
- [ ] Final canonical domain, inbox and verified sender are configured and tested.
