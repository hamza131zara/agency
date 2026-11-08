# SDC AI Assistant — Product, knowledge and release specification

**Status:** Groq provider migration candidate. The owner has configured `GROQ_API_KEY` in Netlify for Production and Deploy Previews. This PR updates the server function to use it; live provider connectivity must be verified after the new deploy preview is available.

## Product purpose

The SDC AI Assistant is a customer-facing, English-language agency consultant. Its primary job is to help a visitor understand the six service divisions, decide which approach fits their problem, collect only useful project context and prepare a handoff to the existing Contact form. It can also answer grounded questions about SDC's published process and route existing customers to the Contact page.

It is not a human operator, a quotation engine, a booking system, an authenticated customer support portal, an internal CRM user or an autonomous action agent.

## First-release scope

- Explain the six public SDC service divisions and help visitors compare them.
- Recommend a practical service or combination of services based on the visitor's stated goal.
- Ask concise, relevant scoping questions: problem/outcome, target users, project stage, key features/integrations, optional timing or indicative budget.
- Explain the published delivery approach and what information is useful before a project conversation.
- Be explicit when price, availability, timeline, credentials, guarantee, legal entity or other detail is not present in the published knowledge record.
- Provide a clear route to Services, Project Brief Builder and Contact.
- Offer an explicit **Prepare a project brief** action that places a short conversation context into the existing Contact form as an editable draft. The visitor must review and manually submit the form. Handoff is not submission.
- English only in v1, consistent with the website's current public-language policy. The API can be extended for language detection only after the owner approves the supported languages and translated knowledge.

## Accuracy and conversation policy

The source of truth for company facts is `netlify/functions/knowledge.mjs`, a versioned snapshot derived from the published service pages. The system instructions require the assistant to:
- Treat the knowledge record as the complete authority for company-specific claims. It does not browse the live internet, internal systems, CRM or project repositories.
- Never invent prices, quotes, dates, availability, service guarantees, client names/results, employee credentials, legal entity details, warranties or product-release statuses.
- Never guarantee SEO rankings/traffic/revenue, smart-contract safety or investment outcomes. Development and testing are not independent audits.
- Explain uncertainty, state when information is not published and offer the Contact route.
- Recommend the simplest suitable approach. In particular, rules, conventional software, search or normal integrations may be better than an LLM.
- Keep human approval where a workflow can affect money, customers, private data, account access, production systems or other consequential outcomes.
- Never ask visitors for passwords, API keys, tokens, payment credentials, confidential customer records or sensitive personal information.
- Never claim it submitted an enquiry, booked a call, notified a person or checked a private system.

The prompt is versioned with `SDC_CHAT_KNOWLEDGE_VERSION`. Update the knowledge file when service pages or public policies change, and review chatbot answers against the changed source before release.

## Architecture and data flow

1. `assets/js/main.js` loads `assets/js/sdc-chatbot.js` on public pages.
2. The widget is rendered client-side and uses the shared `assets/css/styles.css` theme tokens. It is keyboard accessible, uses text-only message rendering and has a narrow-screen full-panel layout.
3. Conversation turns are held in the current tab's `sessionStorage` so the chat can continue across page navigation. The visitor can clear it. Closing the tab ends the browser session.
4. The browser posts the latest bounded conversation turns to `/.netlify/functions/sdc-chat`.
5. The Netlify Function validates method, same-origin request, content type, request size, message roles/length and a per-instance request rate. It calls Groq's OpenAI-compatible Responses API from the server and returns only the reply and non-secret metadata.
6. The function omits Groq's unsupported `store` parameter, sends only recent turns required for the answer and does not create a persistent provider Conversation object or persist conversation history to an SDC database.
7. If the visitor chooses the handoff action, a shortened transcript is temporarily written to a separate sessionStorage key and pre-filled into the Contact form. That key is immediately removed when the Contact page consumes it. The visitor edits and submits the form independently.

No API key or provider credential is included in browser JavaScript, HTML, source-control assets, localStorage or the chat payload.

## Groq API configuration

Add these variables in the **Netlify site/project UI**, scoped to the deployed Functions runtime. Do not commit real values into Git or expose them as public/build variables.

| Variable | Required | Purpose |
|---|---:|---|
| `GROQ_API_KEY` | Yes | Secret Groq API key used only by `netlify/functions/sdc-chat.mjs` |
| `GROQ_MODEL` | No | Model override; default is `openai/gpt-oss-120b` |
| `SDC_CHAT_RATE_LIMIT_PER_MINUTE` | No | Secondary in-function per-instance guard; default 12 requests/minute. The Netlify edge limit is separately fixed at 12 per 60 seconds per IP/domain in the function config. |

The current implementation calls `https://api.groq.com/openai/v1/responses`. Groq documents this OpenAI-compatible Responses API as beta. The default `openai/gpt-oss-120b` model is listed on Groq's Free Plan limits table. Published base limits show 30 RPM, 1,000 RPD, 8,000 TPM and 200,000 TPD; the actual organisation limits shown in the Groq console take precedence. Groq's Responses API does not support the `store` parameter, so this request omits it.

**No key is present in this repository or this PR.** Until the owner configures the key, the function deliberately returns a truthful 503 response and the widget directs visitors to Contact. It must never simulate an AI answer or imply the AI is active.

## Security and abuse boundaries

- Same-origin only; cross-site requests are rejected.
- POST JSON only; maximum request size 18 KB, no more than 12 messages, 1,600 characters per message and 12,000 total history characters.
- Only `user` and `assistant` roles are accepted; the latest message must be a user message. The client cannot supply developer/system instructions.
- Netlify code-based rate limiting is configured on the function at 12 requests per 60 seconds, aggregated by client IP and domain. This runs at the platform edge before the function executes. The function also keeps a per-warm-instance in-memory guard as a second layer; that layer alone is not global. Netlify's per-domain shared cap is Enterprise-only, so the current per-IP/domain rule is not a hard global spend ceiling. Add provider usage/budget alerts and review function request volumes before production enablement.
- Provider errors are sanitized. Request bodies, visitor messages, API keys and provider error payloads are not written to application logs.
- The function has a 22-second upstream timeout and returns a safe fallback on provider errors.
- The chatbot does not take actions, run tools, query private systems, book appointments, send email or call the sandbox database.
- This chat must not be used to collect sensitive or confidential information. Use the existing Contact form for a deliberate project enquiry.

## Privacy and retention

- The browser keeps the conversation only in the tab's sessionStorage until the visitor clears it or the tab session ends.
- The SDC chatbot function does not write conversation history to the agency lead database or the internal P6.4/P6.5 sandbox.
- Messages are sent to GroqCloud's API for inference. Groq states that inference inputs and outputs are not retained by default, but may be temporarily logged for platform-reliability troubleshooting or suspected-abuse investigations for up to 30 days unless the organisation opts out through Data Controls. Usage metadata that does not contain customer inputs or outputs is collected. This is not a zero-retention guarantee; Groq's current data-handling policy and terms apply.
- The Contact form is a separate workflow. Handoff pre-fills a draft; the visitor controls whether to submit it.
- The privacy notice includes this flow and must receive the owner's final legal/operator review before public launch.

## Operational and cost controls before enabling

1. Create or select the agency's API project; store the API key only in Netlify Function environment settings.
2. Select and test the model. Confirm expected answer quality and the actual API project budget/usage monitoring before enabling the widget.
3. The function includes Netlify's code-based per-IP/domain rate limit (12 requests per 60 seconds) plus an in-function secondary guard. Confirm the rule is shown as valid in the Netlify deploy log; Netlify notes that invalid code-based rules may not fail the deploy. Review Groq organisation rate limits and usage in the console as an availability safeguard; the selected GPT-OSS model's published free limits are subject to organisation-specific account limits.
4. Deploy a preview with the key present and verify the function endpoint, normal answers, invalid input, provider errors, timeout and rate responses.
5. Run realistic SDC test questions: each service division, choosing between services, mixed projects, pricing questions, timeline questions, guarantees, unsupported company claims, prompt injection, requests for secrets, and a confused visitor.
6. Review real-world answer samples, ensure no hallucinated company claims, and confirm the handoff text is correct and editable.
7. Obtain approval for production enablement. Do not add key values or visitor transcripts to GitHub PR comments or test snapshots.

## Deferred scope

The first release does not implement:
- Persistent CRM storage or direct write into the P6.4/P6.5 lead database.
- Staff inboxes, live human chat, notifications, appointments or calendar booking.
- WhatsApp, voice, multilingual chat or customer accounts.
- Web search, arbitrary browsing, code execution, MCP tools or autonomous actions.
- File/image uploads, payment processing or authentication.
- Automatic quotations, prices, delivery commitments or contracts.

Each deferred capability needs its own data flow, authority, approval, security and privacy review before implementation.

## Automated verification

- `npm run test:chatbot` covers request validation, same-origin enforcement, payload bounds, no-key fallback, Groq Responses API payload shape without the unsupported `store` parameter, rate-limiting and safe upstream error handling.
- `npm run test:chatbot:browser` covers conversation flow, safe rendering, explicit contact handoff and viewport containment.
- The full CI browser suite runs these new tests with existing page, responsive and WCAG checks.
