const state = {
  csrfToken: null,
  nextCursor: null,
  status: "",
  selectedLeadId: null,
  leads: [],
};

const byId = (id) => document.getElementById(id);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function humanize(value) {
  return String(value ?? "unknown").replaceAll("_", " ");
}

function setNotice(message, isError = false) {
  const notice = byId("dashboard-notice");
  notice.textContent = message;
  notice.className = isError ? "notice error" : "notice";
  notice.hidden = !message;
}

function showLogin(message = "") {
  state.csrfToken = null;
  byId("dashboard-view").hidden = true;
  byId("login-view").hidden = false;
  byId("login-error").textContent = message;
  byId("login-error").hidden = !message;
  byId("operator-password").value = "";
  byId("operator-password").focus();
}

function showDashboard() {
  byId("login-view").hidden = true;
  byId("dashboard-view").hidden = false;
  byId("login-error").hidden = true;
}

async function request(path, options = {}) {
  const method = options.method ?? "GET";
  const headers = { accept: "application/json", ...(options.headers ?? {}) };
  const init = { method, credentials: "same-origin", headers };
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }
  if (method !== "GET" && state.csrfToken) headers["x-csrf-token"] = state.csrfToken;
  const response = await fetch(path, init);
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== "/v1/operator/login") {
    showLogin("Your operator session has expired. Please sign in again.");
  }
  if (!response.ok) {
    const error = new Error(data.error ?? "request_failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

function renderCounts(counts = {}) {
  byId("count-total").textContent = counts.total ?? "0";
  byId("count-pending").textContent = counts.notification_pending ?? "0";
  byId("count-notified").textContent = counts.notified ?? "0";
  byId("count-failed").textContent = counts.notification_failed ?? "0";
}

function statusPill(value) {
  return element("span", `status ${String(value ?? "received").replace(/[^a-z_]/g, "")}`, humanize(value));
}

function leadCard(lead) {
  const button = element("button", "lead-card");
  button.type = "button";
  button.setAttribute("aria-pressed", String(lead.id === state.selectedLeadId));
  button.setAttribute("aria-label", `Open inquiry from ${lead.name}`);
  const top = element("div", "lead-card-top");
  top.append(element("span", "lead-name", lead.name));
  top.append(statusPill(lead.status));
  const meta = element("div", "lead-meta", lead.email);
  const service = element("div", "lead-meta", lead.service);
  const bottom = element("div", "lead-bottom");
  bottom.append(element("span", "lead-meta", formatDate(lead.receivedAt)));
  bottom.append(element("span", "lead-meta", `Attempts: ${lead.attemptCount ?? 0}`));
  button.append(top, meta, service, bottom);
  button.addEventListener("click", () => selectLead(lead.id));
  return button;
}

function renderLeadList(append = false) {
  const list = byId("lead-list");
  if (!append) list.replaceChildren();
  if (!state.leads.length && !append) {
    list.append(element("p", "empty", "No inquiries match this filter."));
  } else {
    const start = append ? Math.max(0, list.querySelectorAll(".lead-card").length) : 0;
    state.leads.slice(start).forEach((lead) => list.append(leadCard(lead)));
  }
  byId("load-more").hidden = !state.nextCursor;
}

async function loadLeads({ append = false } = {}) {
  const params = new URLSearchParams({ limit: "25" });
  if (state.status) params.set("status", state.status);
  if (append && state.nextCursor) params.set("cursor", state.nextCursor);
  const data = await request(`/v1/operator/leads?${params.toString()}`);
  if (append) {
    state.leads = [...state.leads, ...data.leads];
  } else {
    state.leads = data.leads;
  }
  state.nextCursor = data.nextCursor;
  renderCounts(data.counts);
  renderLeadList(append);
}

function field(label, value, wide = false) {
  const wrapper = element("div", wide ? "detail-field wide" : "detail-field");
  wrapper.append(element("dt", "", label));
  wrapper.append(element("dd", "", value || "—"));
  return wrapper;
}

function renderDetail(data) {
  const container = byId("lead-detail");
  container.replaceChildren();
  const lead = data.lead;
  const grid = element("dl", "detail-grid");
  grid.append(
    field("Name", lead.name),
    field("Email", lead.email),
    field("Requested service", lead.service, true),
    field("Received", formatDate(lead.receivedAt)),
    field("Lead status", humanize(lead.status)),
    field("Inquiry", lead.message, true),
  );
  container.append(grid);

  const notificationSection = element("section", "detail-section");
  notificationSection.append(element("h3", "", "Notification processing"));
  if (!data.notification) {
    notificationSection.append(element("p", "empty", "No notification task is attached to this inquiry."));
  } else {
    const notification = data.notification;
    const box = element("div", "notification-box");
    const info = element("div", "notification-info");
    info.append(statusPill(notification.status));
    info.append(element("small", "", `Attempts in current cycle: ${notification.attemptCount} · Retry generation: ${notification.retryGeneration}`));
    if (notification.lastErrorCode) info.append(element("small", "", `Last error: ${notification.lastErrorCode}`));
    box.append(info);
    if (notification.status === "dead_letter") {
      const retry = element("button", "retry", "Retry notification");
      retry.type = "button";
      retry.addEventListener("click", () => retryJob(notification.id, retry));
      box.append(retry);
    }
    notificationSection.append(box);
    const attemptsTitle = element("h3", "", "Delivery attempts");
    attemptsTitle.style.marginTop = "20px";
    notificationSection.append(attemptsTitle);
    const attempts = element("div", "attempt-list");
    if (!notification.attempts.length) {
      attempts.append(element("p", "empty", "No delivery attempts recorded yet."));
    } else {
      notification.attempts.forEach((attempt) => {
        const row = element("article", "attempt");
        const heading = element("div", "lead-card-top");
        heading.append(element("strong", "", `Generation ${attempt.retryGeneration} · Attempt ${attempt.attemptNumber}`));
        heading.append(statusPill(attempt.outcome));
        row.append(heading);
        row.append(element("small", "", `Started: ${formatDate(attempt.startedAt)}`));
        row.append(element("small", "", `Finished: ${formatDate(attempt.finishedAt)}`));
        if (attempt.errorCode) row.append(element("small", "", `Error: ${attempt.errorCode}`));
        attempts.append(row);
      });
    }
    notificationSection.append(attempts);
  }
  container.append(notificationSection);

  const auditSection = element("section", "detail-section");
  auditSection.append(element("h3", "", "Audit history"));
  const auditList = element("div", "audit-list");
  if (!data.audit.length) {
    auditList.append(element("p", "empty", "No audit events recorded."));
  } else {
    data.audit.forEach((item) => {
      const row = element("article", "audit-item");
      row.append(element("strong", "", humanize(item.action)));
      row.append(element("small", "", `${item.actor} · ${formatDate(item.occurredAt)}`));
      auditList.append(row);
    });
  }
  auditSection.append(auditList);
  container.append(auditSection);
}

async function selectLead(id) {
  state.selectedLeadId = id;
  renderLeadList();
  try {
    const data = await request(`/v1/operator/leads/${encodeURIComponent(id)}`);
    renderDetail(data);
  } catch (error) {
    setNotice(error.message, true);
  }
}

async function retryJob(jobId, button) {
  button.disabled = true;
  try {
    await request(`/v1/operator/jobs/${encodeURIComponent(jobId)}/retry`, { method: "POST" });
    setNotice("Manual retry queued. The worker will process it using the configured sandbox transport.");
    await loadLeads();
    if (state.selectedLeadId) await selectLead(state.selectedLeadId);
  } catch (error) {
    setNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function refresh() {
  setNotice("");
  await loadLeads();
  if (state.selectedLeadId) await selectLead(state.selectedLeadId);
}

byId("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  byId("login-error").hidden = true;
  try {
    const password = byId("operator-password").value;
    const data = await request("/v1/operator/login", { method: "POST", body: { password } });
    state.csrfToken = data.csrfToken;
    showDashboard();
    await refresh();
  } catch (error) {
    showLogin(error.status === 401 ? "The password was not accepted." : "Sign-in is unavailable. Check the operator configuration.");
  } finally {
    button.disabled = false;
  }
});

byId("status-filter").addEventListener("change", async (event) => {
  state.status = event.target.value;
  state.nextCursor = null;
  state.selectedLeadId = null;
  byId("lead-detail").replaceChildren(element("p", "empty", "Select an inquiry to review its processing history."));
  try {
    await loadLeads();
  } catch (error) {
    setNotice(error.message, true);
  }
});

byId("refresh-button").addEventListener("click", async () => {
  try { await refresh(); } catch (error) { setNotice(error.message, true); }
});

byId("load-more").addEventListener("click", async () => {
  try { await loadLeads({ append: true }); } catch (error) { setNotice(error.message, true); }
});

byId("logout-button").addEventListener("click", async () => {
  try {
    await request("/v1/operator/logout", { method: "POST", body: {} });
  } catch {
    // The browser session is discarded locally even when the server is unavailable.
  }
  showLogin("You have signed out.");
});

async function initialize() {
  try {
    const session = await request("/v1/operator/session");
    state.csrfToken = session.csrfToken;
    showDashboard();
    await refresh();
  } catch {
    showLogin();
  }
}

void initialize();
