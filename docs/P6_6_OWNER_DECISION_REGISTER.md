# P6.6 — Owner Decision and Release Evidence Register

**Status:** OPEN — repository readiness implementation is merged; production and public-release decisions are not approved.  
**Baseline:** main at 5e7ce045156e69c66f8c6c0cb6fcf4d7e22cb30d after PR #36.  
**Purpose:** collect the real business, legal, security, infrastructure and operational decisions needed to move from a tested repository to a controlled release.

This register is a decision aid, not a legal checklist or a claim that any approval has been granted. An item changes to APPROVED only when the decision-maker, date and evidence are recorded. Unknown values must remain unknown; do not infer them from a profile, development environment, repository URL or hosting account.

## 1. Current evidence baseline

| Area | Verified repository evidence | What it does not prove |
|---|---|---|
| Website code | 30 HTML routes; site, PHP syntax, endpoint smoke and browser/accessibility CI pass | Production hosting behavior, real email receipt, legal/content approval or human accessibility acceptance |
| Search structure | 26 indexable routes have unique titles/descriptions and one primary H1; four routes are intentionally excluded/noindex | Search ranking, indexing, qualified traffic, AI citations or live canonical-domain correctness |
| Contact endpoint | PHP validation, CSRF, honeypot, per-session throttle and safe unsent fallback | A live monitored inbox, sender authentication or final inbox delivery |
| Automation sandbox | HMAC-authenticated synthetic intake, PostgreSQL outbox, worker, fake transport and internal operator console; 18 PostgreSQL tests pass | Production runtime, live provider delivery, real customer data, multi-instance safety or operations |
| Security boundary | Production startup guard blocks the sandbox API and fake worker when NODE_ENV=production | Independent penetration testing or production security approval |
| Legal/privacy | Data-flow and threat-model review is documented; legal pages remain draft/noindex | A legal basis, compliance status, approved retention periods or legal advice |

References: docs/PRODUCTION_SECURITY_PRIVACY_REVIEW.md, docs/AGENCY_MARKETING_SEO_AEO_GEO_STRATEGY.md, docs/LAUNCH_READINESS_CHECKLIST.md, docs/LAUNCH_APPROVALS.json and automation-runtime/README.md.

## 2. Owner and reviewer decisions

Record each decision in the table or link a dated decision record. Do not put personal data, passwords, API keys, private customer records or secret values in this public repository.

| ID | Decision | Required input / evidence | Status |
|---|---|---|---|
| O-01 | Public brand | Approved public display name, logo, usage rules and approver | OPEN |
| O-02 | Legal operator | Legal person/entity, jurisdiction, registered/business address and official privacy contact; verified by an appropriately qualified reviewer | OPEN |
| O-03 | Primary market | Primary customer segment, target countries/regions and actual service coverage | OPEN |
| O-04 | Primary offer | One primary lead-generation offer and at most one secondary offer for the first market test; scope, exclusions and capacity | OPEN |
| O-05 | Commercial claims | Evidence and permission for team bios, credentials, project attribution, client names, screenshots, testimonials, outcome metrics, white-label claims and support promises | OPEN |
| O-06 | Sales ownership | Business owner for enquiry monitoring, response, qualification, proposals and follow-up; realistic response commitment | OPEN |
| O-07 | Canonical domain | Exact HTTPS origin, canonical host choice and DNS control evidence | OPEN |
| O-08 | Website hosting | Hostinger plan, document root, PHP version/extensions, .htaccess behavior, SSL, redirects and backup/restore evidence | OPEN |
| O-09 | Contact delivery | Monitored inbox, verified sender, SPF/DKIM/DMARC evidence, private server config and real submission/receipt/Reply-To test | OPEN |
| O-10 | Privacy purposes and roles | Per-data-flow purposes, controller/processor roles, legal basis, data minimization, disclosures and data-subject request route | OPEN |
| O-11 | Retention and deletion | Separate approved periods and deletion behavior for enquiries, project records, sessions, access/security logs, delivery attempts/audit data and backups | OPEN |
| O-12 | Mail and subprocessors | Actual hosting, mail, database, backup, monitoring, font, analytics and notification vendors; processing locations and transfer review where applicable | OPEN |
| O-13 | Marketing consent | Marketing follow-up, separate opt-in where required, unsubscribe/suppression behavior and proof of consent | OPEN |
| O-14 | Analytics and advertising | Whether measurement pixels/cookies or paid campaigns are needed; purposes, vendors, consent/disclosure, access, retention and approved budget | OPEN |
| O-15 | Automation runtime | Node-capable runtime, PostgreSQL provider/region, TLS termination, private networking, availability and cost decision | OPEN |
| O-16 | Automation security operations | Shared rate limiting, MFA/recovery, managed secrets, key rotation/revocation, least-privilege access and independent security review | OPEN |
| O-17 | Backup and recovery objectives | Backup frequency, retention, encryption, RPO/RTO expectations, restore owner and successful restore-drill evidence | OPEN |
| O-18 | Monitoring and incident response | Service/worker/database metrics, alert recipients, dead-letter handling, incident severity, escalation and support owner | OPEN |
| O-19 | Notification provider | Provider/API, supported countries, terms, sender approval, pricing, idempotency/reconciliation, consent and deliverability tests | OPEN |
| O-20 | Final release | Exact commit, release scope, completed strict validators, staging evidence, rollback evidence and explicit owner approval | OPEN |

### Retention decision rules

- Do not prefill a number of days or months.
- The owner and qualified reviewer must decide whether different records need different periods.
- Consider application records, mailboxes, web-host logs, database backups and third-party processor logs separately.
- A deletion job is not complete merely because a row is hidden or soft-deleted. Define backup expiry, restore behavior and deletion verification.
- Keep audit metadata minimal; do not copy inquiry message content into audit logs by default.
- Until the policy is approved and implemented, do not accept real inquiries into the automation sandbox.

### Marketing decision rules

- Audience and offer entries are hypotheses until supported by interviews, enquiries or delivery evidence.
- Do not claim white-label capacity, partner coverage, fixed turnaround, team size, certifications, client outcomes or geographic service areas without evidence.
- Start with one primary offer and a limited channel experiment; do not run six simultaneous campaigns.
- Do not activate analytics, advertising pixels, paid media or bulk outreach until privacy, budget, contact delivery and lead-follow-up gates are accepted.
- Do not promise rankings, Google AI Overview inclusion, answer-engine placement, generative-engine citations, traffic or lead volume.

### Search and local-discoverability rules

- Keep canonical tags absent until the canonical HTTPS domain is approved.
- After approval, use self-referencing canonicals and verify redirects, sitemap and robots over the deployed domain.
- Add only structured data that matches visible, approved business facts.
- Do not infer service locations from account profile or personal location. Add local pages or a Google Business Profile only after real eligibility and service-area evidence are confirmed.
- Review Search Console and Bing Webmaster results after property verification; impressions/citations are not equivalent to qualified enquiries.

## 3. Release gates

| Gate | Scope | Minimum evidence before passing |
|---|---|---|
| G0 — Identity and legal | Public brand, legal operator, jurisdiction, privacy contact, terms, privacy notice and disclaimer | Approved facts, qualified review, dated evidence and updated launch approval record |
| G1 — Website release | Domain, DNS, Hostinger/PHP, SSL, redirects, private mail config, real contact receipt, backup, content and human accessibility | Strict predeploy and post-deploy validators; deployed smoke tests; rollback evidence; owner publish approval |
| G2 — Automation live pilot | Real inquiries, Node runtime, PostgreSQL, provider delivery, privacy/retention, security and operations | Independent security review; TLS/network controls; MFA/recovery; managed secrets; shared abuse controls; restore drill; monitoring; provider consent/delivery tests; deletion verification; explicit limited-pilot approval |
| G3 — Marketing activation | SEO/webmaster verification, organic content, social, outreach and paid channel tests | Approved audience/offer/geography, consented content evidence, working enquiry handling, measurement/privacy plan and channel-specific budget approval |

G1 and G2 are separate releases. Publishing the PHP/static agency website does not authorize deploying the Node/PostgreSQL automation runtime. Passing automation CI does not prove the Hostinger site or contact endpoint is production-ready.

## 4. Evidence log template

Copy this structure for every decision; keep secrets and personal data out of the record.

- Decision ID:
- Decision:
- Status: proposed / approved / rejected / deferred
- Decision owner / reviewer:
- Decision date:
- Scope and limitations:
- Evidence URL or repository path:
- Expiry / next review date:
- Related release gate: G0 / G1 / G2 / G3

## 5. Execution order

1. Confirm public brand, legal operator, primary audience, target geography, primary offer and content-evidence permissions.
2. Complete privacy purposes/roles, vendor inventory and legally reviewed retention/deletion decisions.
3. Decide the canonical domain, website hosting configuration, monitored inbox and sender authentication; complete the real website delivery test.
4. Complete human accessibility and public-claim review; then run the website strict predeploy gate.
5. Separately decide whether the lead-intake automation pilot should proceed. If yes, select its Node runtime, PostgreSQL and notification provider based on verified requirements and cost.
6. Complete production security controls, shared rate limiting, MFA/recovery, secrets, backups, restore drills, monitoring, incident response and independent testing.
7. Run the automation pilot acceptance tests and record a limited-scope owner approval before any real customer data is introduced.
8. Approve measurement and marketing channels, verify webmaster properties on the live domain and begin the controlled 90-day experiment.

## 6. Explicit current prohibitions

Until the corresponding gate is approved:
- Do not connect contact.php to the automation sandbox.
- Do not run the sandbox API or fake-transport worker in production or bypass their startup guard.
- Do not use real customer/personal data in the sandbox.
- Do not install production secrets or provider credentials in Git, browser storage or public logs.
- Do not activate real notifications, analytics, advertising or outbound campaigns.
- Do not publish canonical placeholders, draft legal pages, fabricated reviews, unsupported local business facts or unapproved case-study claims.
- Do not deploy the website or automation runtime based only on a green CI run.

**Current release decision: NOT APPROVED for production automation, real customer data or public website deployment.** The repository is ready for the next owner-decision and evidence stage only.
