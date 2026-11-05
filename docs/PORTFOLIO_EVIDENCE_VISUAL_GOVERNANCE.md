# Portfolio Evidence & Visual Governance

**Policy version:** 1.0  
**Review date:** 5 November 2026  
**Applies to:** The public Work catalogue and all project-note pages.

## Publication standard

Every public project statement and visual must be traceable to evidence. The portfolio currently describes owner-associated projects; it does not assert paid-client delivery or a verified agency contribution. A repository README documents intended or reported scope; it does not by itself prove that a feature is deployed, available to visitors, or delivered by this agency.

## Evidence classes

| Class | Acceptable source | What it supports | What it does not prove |
|---|---|---|---|
| Repository fact | Exact repository URL, file/path, commit SHA and review date | Code, dependencies, tests, documented architecture | Production availability, agency authorship, customer outcomes |
| Live product fact | Exact public URL, access date, tested route/workflow and environment | Only the behavior actually observed during that review | Usage scale, uptime history, regional availability outside tested locations |
| Owner-provided fact | Named approver, dated written confirmation and precise claim | The specific owner-confirmed status or relationship | Independent verification beyond that confirmation |
| Agency contribution | Approved scope record, commit/PR evidence or signed delivery record identifying the agency's work | The exact contribution and period stated | Unrelated project work or business outcomes |
| Outcome/metric | Source system, metric definition, period, baseline/comparison and owner approval | The specific measured result | Causation unless the method supports it |
| Visual asset | Original asset path, source/creator, rights holder, permission scope and approval record | Publication of that exact asset in the approved channel | Permission for other assets, channels, edits or future reuse |

## Visual publication workflow

1. **Identify the asset.** Record the exact repository path or original source URL, creator/rights holder, project ID and a stable checksum where practical.
2. **Confirm rights and scope.** Record who owns it, who grants permission, and whether permission covers the agency website, social media, paid promotion, cropping, annotation and ongoing use. Do not infer permission from public availability.
3. **Inspect for sensitive information.** Check browser chrome, account names, customer data, personal information, email addresses, API keys, tokens, credentials, private URLs, internal dashboards and unreleased features. Redact only with approval; record the edited derivative as a separate asset.
4. **Check authenticity.** Label conceptual mockups and illustrative compositions visibly. Never use them as proof of a live product, customer deployment or completed agency work.
5. **Approve the final derivative.** The owner/rights holder must approve the exact final asset and its caption/context before publication.
6. **Record and recheck.** Add the asset to that project's `visualGovernance.approvedAssets` list with source, permission scope, approval identity/date, review date and checksum. Recheck permission and accuracy before launch and when the asset changes.

An empty `approvedAssets` list means no authentic screenshots, logos or third-party visual assets are approved for that project. Do not add any until the record is complete.

## Claim review workflow

For each technical claim, record the project ID, exact statement, repository URL, path/section, commit SHA, reviewer and date. Inspect the current source rather than relying only on a README where the claim concerns implementation details. For a live capability, test the exact public workflow and record the date/environment. Remove or qualify claims that cannot be reproduced.

For agency attribution, require an approved project/delivery record that identifies the agency's actual scope. For client names, logos, testimonials and quotations, require explicit publication permission. For metrics, preserve the source, calculation, period, baseline and approval. Never invent traffic, revenue, conversion, user counts, performance improvements, security assurance, rankings or business outcomes.

## Page labels and status

- **Live/public tool:** A visitor can access the stated tool at the recorded public destination; owner must recheck uptime and access before launch.
- **In development:** Do not imply commercial readiness, public onboarding or full functionality. Explain any static showcase or provider/configuration dependency.
- **Illustrative:** Visible wording must state that the visual is conceptual/illustrative and not an authentic product screenshot.
- **Project notes:** Use this label where contribution, client context or outcome evidence is incomplete. Do not present the page as a complete client case study.

## Current portfolio baseline (5 November 2026)

| Project | Public status | Visual publication status | Boundary |
|---|---|---|---|
| STRIDETO | Live (owner-identified; recheck before launch) | Illustrative only; no authentic asset approved | No agency delivery, technology stack or quantified outcome claim |
| RegexLab | Live public tool | Illustrative only; no authentic asset approved | Repository documents scope; no usage or performance metrics |
| JotJSON | Live public tool | Illustrative only; no authentic asset approved | Local-first browser processing; do not imply server upload |
| SiteIntel Pulse | In development | Illustrative only; no authentic asset approved | GitHub Pages is a static showcase, not the full scanner |
| Free AI Mixer | In development | Conceptual workflow illustration only; no authentic asset approved | No hosted demo confirmed; provider configuration is required |
| Auto-Trading-Agent | Excluded from public catalogue | No public visual approved | Not available to buy/install; live trading not authorized |

## Asset approval record template

Create one record per asset; do not use a project-wide blanket approval.

- Project ID:
- Asset path / immutable source URL:
- SHA-256 (or equivalent):
- Creator / rights holder:
- Permission granted by:
- Permission evidence location:
- Approved channels and permitted edits:
- Sensitive-data inspection and redaction result:
- Caption and authenticity label:
- Final asset approved by:
- Approval date:
- Last rechecked date:
- Expiry / withdrawal conditions:

## Launch gate

Before public launch, the owner must recheck each live URL and status, approve exact agency-contribution wording, approve each visual and its caption, confirm client/team permissions, and ensure every published metric has a reproducible source. If a required approval is missing, omit the claim or asset rather than publishing it provisionally.
