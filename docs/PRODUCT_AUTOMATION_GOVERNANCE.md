# Products & Automation — Catalogue and Release Governance

## 1. Purpose

The agency platform will eventually present both ready-made software products and customer-facing automation tools. These must be treated as real product experiences with clear ownership, availability, installation, permission, licensing and support information—not as promotional cards with incomplete functionality.

## 2. Product lifecycle states

Use these states consistently:

- **Planned:** documented idea; no usable release.
- **In development:** active implementation; may not be production-ready.
- **Preview / Beta:** available only to a clearly defined test audience, with known limitations.
- **Live:** customer-usable release with tested deployment/use path and support ownership.
- **Maintenance:** existing product with limited feature development.
- **Retired:** no longer available; display migration or support information when necessary.

A product can be marked **Ready to install** only after a clean install/deploy has been tested and its requirements, package, configuration, licence, support route and update approach are documented.

## 3. Current portfolio starting point

This is a working catalogue baseline, not a statement that every item is a commercial, installable product.

| Project | Current known state | Public treatment |
|---|---|---|
| STRIDETO | Live platform; free to use | Product/platform showcase with public link and truthful description |
| RegexLab | Public developer tool | Live tool showcase; verify current demo and source links |
| JotJSON | Public developer tool | Tool showcase; verify current capabilities and links |
| SiteIntel Pulse | In development | Development-stage project; no ready-to-install claim |
| Free AI Mixer | In development | Development-stage AI workflow project; no unverified live-demo claim |
| Auto-Trading-Agent | Separate project with its own gated roadmap | Future product showcase only; not installable or available for hosted trading until approved release gates pass |

For each item, re-check its actual status before release. The portfolio should not imply that all items are client deliveries.

## 4. Product detail-page minimum content

- Product name, owner and category.
- Plain-language purpose and target user.
- Current lifecycle state and last updated/reviewed date.
- Screenshots, video or live demo with clear labels.
- Features and explicit limitations.
- Supported platform, runtime, browser, hosting and dependencies.
- Installation/deployment instructions and prerequisites.
- Security and privacy notes relevant to use.
- Licence and permitted use.
- Price and payment model only after owner approval.
- Updates, compatibility, versioning and changelog.
- Support route and response expectations.
- Data export, backup and retirement approach when data is involved.

## 5. Automation categories

The eventual automation catalogue may include:

- Marketing and social workflow automation.
- General business process automation.
- AI/LLM assistants, agents and document workflows.
- E-commerce and marketplace operations.
- Communication and notifications.
- API, webhook and system-to-system synchronisation.

A page may explain an automation service before a self-service automation product exists. Clearly distinguish **agency-delivered service**, **available self-service tool**, **preview**, and **planned**.

## 6. Automation tool release gate

A customer-facing automation is not live until it supports:

1. Clear use case, eligibility and integration list.
2. Explicit account connection and least-privilege permission explanation.
3. Safe configuration and validation.
4. Test or dry-run mode where feasible.
5. Human approval for consequential actions where appropriate.
6. Execution history and meaningful status.
7. Retries, timeouts, duplicate protection and understandable failures.
8. Secret storage that remains server-side.
9. Disconnect/revoke and data-retention controls.
10. Monitoring, support ownership and an incident response route.

## 7. Marketplace and commercial controls

Do not build payment and licence systems before product requirements are real. When approved, define:

- One-time purchase, subscription, free, open-source or custom licensing model per product.
- Allowed installations, seats, updates and transfer rights.
- Payment provider and supported regions.
- Tax/invoice requirements and refund/cancellation rules.
- Activation, renewal, expiry and revocation behavior.
- Download security and version integrity.
- Support plan and end-of-life policy.

Never expose private keys, payment secrets, provider API credentials, licence signing keys or customer data in public assets or repository history.

## 8. Customer trust

- Tell users what a tool can and cannot do before connection.
- Request only permissions required for its functions.
- Explain whether data is stored, processed by providers or retained.
- Provide clear failure and disconnection behavior.
- Never run a consequential action without the consent/approval model the customer was shown.
- Do not use fabricated dashboards, usage metrics or customer logos as proof.
