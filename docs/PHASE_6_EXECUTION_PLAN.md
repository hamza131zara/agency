# Phase 6 — Automation Catalogue and Customer Tools Execution Plan

**Status:** P6.1–P6.2 ACCEPTED; P6.3 MVP ARCHITECTURE PROPOSAL IN REVIEW. No customer-facing automation product is being presented as live, connected or production-ready.  
**Master scope:** `docs/PLATFORM_MASTER_PLAN.md` — Phase 6.  
**Baseline:** `main` after PR #31 at `6343d918f553889629d42d2c010238179cc1eaea`; 6 November 2026.

## 1. Purpose

Move the existing automation service description toward a real, trustworthy catalogue and, only after a defensible product decision, one usable customer-facing automation tool.

Phase 6 is not a promise to build a generic automation builder or a collection of imaginary integrations. The first tool must solve one narrow, repeated customer problem and have a complete permission, execution, failure, monitoring and support model.

## 2. Existing repository baseline

The repository already contains:

- `automation.html`: an agency-delivered automation services page, a planned self-service roadmap, and a permission-first tool experience outline.
- `docs/PRODUCT_AUTOMATION_GOVERNANCE.md`: lifecycle definitions, minimum detail-page content, automation categories, customer-facing release gate and marketplace boundaries.
- The wider site has a shared static-page shell, a project-brief workflow and a contact-intake endpoint. These are not evidence of a live workflow automation runtime.
- The site deployment target is PHP-enabled shared hosting. That target is not presumed capable of running durable queues, background workers, scheduled jobs, webhook consumers or a secrets vault.

P6.1 must extend these assets and keep service engagements distinct from self-service software.

## 3. Product truth and non-negotiable boundaries

- The existing automation page may describe **agency-delivered services** and **planned tools**. It must not imply customer accounts can currently be connected or workflows executed.
- A catalogue listing, integration logo or technical prototype is not proof of a production integration.
- No provider is declared supported until its current API, OAuth or credential flow, scopes, pricing, regional availability, rate limits and platform terms have been checked.
- Do not collect real customer credentials or connect provider accounts during discovery.
- Never expose provider secrets, tokens, webhook signing secrets or encryption keys in browser code, local storage, public logs or Git history.
- Consequential actions require an explicit customer approval policy and auditable approval evidence.
- Workspaces, account management, billing and licence entitlements remain subject to the Phase 7 scope and must not be pulled forward without an approved dependency.
- Do not buy services, incur provider charges, create external accounts, contact providers or deploy anything without explicit owner approval.
- The owner may buy the domain and Hostinger plan immediately before publication. Neither is a prerequisite for P6.1 discovery and local/CI work. A runtime decision must be made separately for the actual automation product; do not assume the marketing website's shared-hosting plan is a suitable worker platform.

## 4. Candidate discovery — no premature product selection

Evaluate these roadmap candidates against the same scorecard:

| Candidate | Potential first use | Main feasibility and risk questions |
|---|---|---|
| Notifications and SMS | Triggered customer notifications with templates and delivery status | Consent, opt-out/suppression, sender registration, provider coverage and pricing, delivery failures, retries and retention |
| Social publishing | Draft, review and schedule approved social content | Platform app approval, account scopes, token lifecycle, publishing restrictions, content ownership, moderation and audit history |
| API and webhook workspace | Receive, validate, route and monitor business events | Tenant isolation, endpoint abuse, signature verification, replay protection, idempotency, durable queues, rate limits and operational monitoring |
| AI agent workflows | A bounded assistant that uses approved tools for a defined task | Prompt injection, tool allowlists, untrusted content, human approval, model/provider cost, data processing and traceability |
| E-commerce workflows | A narrowly scoped catalogue, order or inventory workflow | Merchant authorization, provider policy, customer/order data, rate limits, duplicate writes, rollback and platform-specific support |

No candidate is selected by this plan. A selection requires a documented target user/problem, owner approval, verified integration feasibility and a credible cost/operating model. Do not infer customer demand from the existence of an idea.

### Candidate scoring framework

Score each candidate from 1–5 with evidence attached. Higher scores must mean *more favorable* (for example, lower/manageable security risk and lower/manageable operating burden).

| Criterion | Weight |
|---|---:|
| Repeated customer problem and evidence of demand | 20% |
| Provider/API access feasibility and terms | 15% |
| Narrow MVP scope and time-to-validate | 15% |
| Manageable security, privacy and consent risk | 15% |
| Hosting/runtime and operations feasibility | 15% |
| Provider, infrastructure and support cost | 10% |
| Reuse across agency customer segments | 10% |

A missing evidence item is **unknown**, not a zero-risk pass. Do not select a winner just because a numerical score can be calculated.

## 5. Minimum architecture and safety requirements

The selected MVP must document the following before implementation touches real provider accounts.

### Identity and tenant boundaries

- Define whether the first release is a single-customer pilot or multi-tenant service.
- If multi-tenant, enforce tenant ownership on every record and operation; test cross-tenant denial.
- Apply least-privilege roles and server-side authorization. Hiding UI controls is not authorization.
- Define account recovery, connection revocation and customer offboarding.

### Provider connections and secrets

- Explain the exact data and scopes requested before consent.
- Prefer OAuth authorization-code flows with PKCE where supported; use server-side callback validation, state/nonce protection and strict redirect URI allowlists.
- Store refresh/access tokens only in an encrypted server-side secret store with a documented key-management and rotation approach.
- Never accept or retain provider credentials in browser storage or query strings.
- Support disconnect/revoke and define what happens to queued work and retained data after revocation.

### Workflow execution

- Validate event schemas and reject unexpected payloads.
- Verify signed webhooks where the provider supports signatures; protect endpoints against replay and abuse.
- Make execution idempotent; define deduplication keys and duplicate behavior.
- Use bounded retries with backoff, timeouts and a dead-letter/recovery path.
- Use durable job storage and background workers for work that cannot safely finish in a web request.
- Provide test/dry-run mode where practical. Separate test events from live actions.
- Require human approval for consequential, externally visible or difficult-to-reverse actions.

### Observability and customer control

- Show execution state, timestamps, meaningful errors and retry status without leaking secrets or unnecessary personal data.
- Record an audit trail for connection, configuration, approval, execution, revocation and administrative events.
- Define rate limits, quotas, abuse controls, provider cost ceilings and incident handling.
- Document data categories, retention, export/deletion behavior, backup and restore responsibilities.
- Define a support owner and a realistic support channel before any live release.

### Runtime decision

Before selecting infrastructure, document the product's actual runtime needs: HTTP API, webhook ingress, durable database, queue, worker, scheduler, encrypted secrets, logs/metrics, backups and outbound network access. Evaluate the selected hosting/backend against these needs. The public agency website and automation runtime may be separate deployments. Do not commit to Hostinger shared hosting for workers/queues without verified capability and load/security testing.

## 6. Delivery packages

| Package | Scope | Acceptance evidence |
|---|---|---|
| P6.1 — Discovery and feasibility | Audit existing catalogue/governance, compare candidate workflows, define scorecard, MVP decision inputs and architecture guardrails | Evidence-backed candidate register; open questions explicit; no unsupported live claims; owner decision recorded or selection deliberately deferred |
| P6.2 — Automation catalogue and integration directory | Refine automation overview, use cases, service-vs-product labels, and integration detail schema | All content links to verified capabilities; planned items clearly marked; responsive/accessibility/link checks pass |
| P6.3 — MVP selection and architecture | Select one narrowly scoped workflow; map user journey, provider contracts, data flow, threat model, permissions and operating cost | Owner-approved decision record, provider/API verification and architecture/security review |
| P6.4 — Sandbox vertical slice | Implement one workflow with test credentials/sandbox or simulated provider; no real customer actions | End-to-end automated tests, idempotency/failure tests, audit events and safe test/live boundary |
| P6.5 — Customer control and operations | Add the minimum approved identity/connection/configuration/approval/history/revoke experience | Authorization, tenant isolation (if applicable), secret handling, retention and operational controls tested |
| P6.6 — Release acceptance | Load/security/privacy/accessibility/regression checks, support/runbook, deployment and rollback design | Explicit owner release decision; all mandatory governance gates pass before any live listing |

## 7. P6.1 work checklist

- [x] Confirm the existing automation page and automation governance document before proposing new routes.
- [x] Distinguish agency-delivered services from planned self-service tools.
- [x] Identify candidate workflows and material external dependencies.
- [x] Define a consistent evidence-backed candidate scoring framework.
- [x] Establish minimum security, provider-connection, execution and operations requirements.
- [x] Keep domain/Hostinger purchase outside discovery; require a separate runtime capability review.
- [ ] Collect owner/customer-segment and priority-integration evidence.
- [ ] Complete candidate scores with source evidence and unknowns.
- [ ] Record an owner-approved MVP selection, or explicitly defer selection if evidence is insufficient.
- [ ] Have the owner accept the P6.1 baseline before implementing a provider integration.

## 7A. P6.2 — Automation catalogue and integration directory

**Implementation branch:** `phase6/p6-2-automation-catalogue`.

- [x] Extend the existing automation page rather than creating a duplicate route.
- [x] Distinguish four scoped agency service capabilities from six planned self-service tool concepts.
- [x] Add catalogue search, delivery-model filtering, workflow-area filtering, result count, empty state and reset behavior.
- [x] Make planned concepts explicitly unavailable for account connection, message sending, publishing or workflow execution.
- [x] Add an integration-pattern directory for OAuth services, signed webhooks, AI/model APIs and commerce/marketplace APIs.
- [x] Mark every integration pattern as provider-unverified; no vendor, logo, scope or supported-connector claim is introduced.
- [x] Exact-head `validate` and `browser-and-accessibility` checks passed before merge.
- [x] Owner merged PR #31 at `6343d918f553889629d42d2c010238179cc1eaea`.
- [x] Post-merge `main` CI [#42269325279](https://github.com/hamza131zara/agency/actions/runs/42269325279) passed both required jobs.

P6.2 does not select a provider or MVP. That decision remains in P6.3 and requires owner-approved problem evidence and current provider/API verification.

## 7B. P6.3 — MVP selection proposal and architecture

**Implementation branch:** `phase6/p6-3-mvp-architecture`.  
**Architecture proposal:** `docs/PHASE_6_MVP_ARCHITECTURE.md`.

- [x] Review the actual PHP contact endpoint and deployment model before proposing a workflow.
- [x] Compare the five P6.1 automation candidates and record material unknowns rather than assigning invented scores.
- [x] Propose a narrow internal-first lead-intake routing and notification pilot based on an existing repository workflow.
- [x] Define the sandbox boundary, signed server-to-server event contract, durable PostgreSQL/outbox design, worker behavior, fake notification transport, privacy controls and failure tests.
- [x] Keep production provider, runtime host, price and real customer integration unselected.
- [ ] Owner approves the lead-intake pilot, proposes a different target workflow with customer/problem evidence, or defers MVP selection.
- [ ] Complete provider/runtime verification for whichever live transport is later selected.
- [ ] Complete architecture/security review before implementing real integrations or storing real customer inquiry data.

**Decision status:** the lead-intake workflow is a recommendation for an internal-first technical pilot, not evidence that customers have requested it and not a live self-service product. P6.4 must not begin until the owner decision is recorded.

## 8. Phase 6 exit criteria

Phase 6 is complete only when at least one approved customer-facing tool allows a customer to discover, configure, test, run, monitor and disconnect its supported workflow; the data/permission model is transparent; failures and retries are recoverable; secrets remain server-side; security, privacy, accessibility and operational evidence passes; and the owner approves the release. A static catalogue or simulated demo alone does not satisfy this exit gate.

## 9. Scope boundaries and dependencies

- Phase 5 remains subject to owner/manual acceptance and the separate public launch checklist. This plan does not mark those gates complete.
- Phase 7 owns general customer accounts, checkout, payment, licensing and commercial entitlement infrastructure. Phase 6 may define a narrow identity/connection mechanism only when required by the selected MVP and explicitly approved.
- Phase 9 owns production website deployment and ongoing operations. Domain and Hostinger purchase can be deferred until the website release; automation runtime hosting must be evaluated on technical requirements, not brand assumption.
- Existing separate project roadmaps (including Auto-Trading-Agent) remain authoritative and are not changed by this phase.
