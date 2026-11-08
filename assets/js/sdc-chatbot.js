(() => {
  "use strict";

  const HISTORY_KEY = "sdc-chat-history-v1";
  const HANDOFF_KEY = "sdc-chat-contact-draft-v1";
  const MAX_CLIENT_MESSAGES = 18;
  const MAX_TEXT_LENGTH = 1600;
  const WELCOME = "Hello, I'm the SDC AI Assistant. I can help you understand our six services, compare practical options and shape a project brief. What are you hoping to build or improve?";
  const starters = [
    "Help me choose the right service",
    "I want to plan a new project",
    "Can AI automation help my business?",
    "How does working with SDC work?"
  ];

  const safeText = value => String(value ?? "").slice(0, MAX_TEXT_LENGTH);
  const readHistory = () => {
    try {
      const value = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "null");
      if (!Array.isArray(value)) return null;
      const valid = value.slice(-MAX_CLIENT_MESSAGES).filter(item =>
        item && (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" && item.content.trim()
      ).map(item => ({ role: item.role, content: safeText(item.content) }));
      return valid.length ? valid : null;
    } catch {
      return null;
    }
  };

  const root = document.createElement("div");
  root.id = "sdc-chatbot";
  root.innerHTML = `
    <button class="sdc-chat-trigger" type="button" aria-label="Ask SDC — open AI Assistant" aria-expanded="false" aria-controls="sdc-chat-panel">
      <span class="sdc-chat-trigger-icon" aria-hidden="true">✳</span>
      <span class="sdc-chat-trigger-label">Ask SDC</span>
    </button>
    <section class="sdc-chat-panel" id="sdc-chat-panel" role="dialog" aria-label="SDC AI Assistant" aria-modal="false" hidden>
      <header class="sdc-chat-header">
        <img src="/assets/brand/sdc-logo.webp" alt="" width="42" height="48">
        <div class="sdc-chat-heading">
          <strong>SDC AI Assistant</strong>
          <span><i aria-hidden="true"></i> Here to help you decide</span>
        </div>
        <div class="sdc-chat-header-actions">
          <button class="sdc-chat-icon-button" type="button" data-action="clear" aria-label="Clear conversation" title="Clear conversation">↻</button>
          <button class="sdc-chat-icon-button" type="button" data-action="close" aria-label="Close chat" title="Close chat">×</button>
        </div>
      </header>
      <div class="sdc-chat-disclosure">
        AI assistant · Answers use SDC's published service information. <a href="/privacy.html#chatbot">Privacy</a>
      </div>
      <div class="sdc-chat-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation"></div>
      <div class="sdc-chat-starters" aria-label="Suggested questions"></div>
      <div class="sdc-chat-status" role="status" aria-live="polite"></div>
      <footer class="sdc-chat-compose">
        <form class="sdc-chat-form">
          <label class="sdc-chat-sr-only" for="sdc-chat-input">Message the SDC AI Assistant</label>
          <textarea id="sdc-chat-input" name="chat-message" rows="1" maxlength="1200" placeholder="Tell us what you're trying to achieve…" required></textarea>
          <button class="sdc-chat-send" type="submit" aria-label="Send message">
            <span aria-hidden="true">↑</span>
          </button>
        </form>
        <div class="sdc-chat-compose-meta">
          <span>Shift + Enter for a new line</span>
          <span class="sdc-chat-shortcuts">
            <a href="/services.html">Explore services</a>
            <a href="/contact.html">Contact SDC</a>
            <button type="button" data-action="handoff">Prepare a project brief ↗</button>
          </span>
        </div>
        <p class="sdc-chat-privacy-note">This chat stays in this browser tab and is sent to our AI provider to generate replies. Don't share passwords, API keys or confidential data.</p>
      </footer>
    </section>
  `;
  document.body.appendChild(root);

  const trigger = root.querySelector(".sdc-chat-trigger");
  const panel = root.querySelector(".sdc-chat-panel");
  const messagesElement = root.querySelector(".sdc-chat-messages");
  const starterElement = root.querySelector(".sdc-chat-starters");
  const statusElement = root.querySelector(".sdc-chat-status");
  const form = root.querySelector(".sdc-chat-form");
  const input = root.querySelector("#sdc-chat-input");
  const sendButton = root.querySelector(".sdc-chat-send");
  const state = {
    messages: readHistory() || [{ role: "assistant", content: WELCOME }],
    busy: false,
    opened: false
  };

  const persist = () => {
    state.messages = state.messages.slice(-MAX_CLIENT_MESSAGES);
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(state.messages));
    } catch {
      setStatus("Browser storage is unavailable. The conversation will remain in memory only.");
    }
  };

  const setStatus = (message = "", tone = "") => {
    statusElement.textContent = message;
    statusElement.dataset.tone = tone;
  };

  const renderApprovedLinks = (element, content) => {
    const pattern = /https:\/\/softwaredamagecontrol\.com\/[^\s<>"']+/g;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let candidate = match[0];
      let suffix = "";
      while (/[.,!?;:]$/.test(candidate)) {
        suffix = candidate.slice(-1) + suffix;
        candidate = candidate.slice(0, -1);
      }
      let approved = false;
      try {
        const parsed = new URL(candidate);
        approved = parsed.protocol === "https:" && parsed.hostname === "softwaredamagecontrol.com";
      } catch {
        approved = false;
      }
      if (!approved || !candidate) continue;
      element.appendChild(document.createTextNode(content.slice(cursor, match.index)));
      const link = document.createElement("a");
      link.href = candidate;
      link.textContent = candidate;
      link.rel = "noopener noreferrer";
      element.appendChild(link);
      if (suffix) element.appendChild(document.createTextNode(suffix));
      cursor = match.index + match[0].length;
    }
    element.appendChild(document.createTextNode(content.slice(cursor)));
  };

  const appendMessage = (message, options = {}) => {
    const article = document.createElement("article");
    article.className = "sdc-chat-message sdc-chat-message--" + message.role;
    const avatar = document.createElement("span");
    avatar.className = "sdc-chat-avatar";
    avatar.setAttribute("aria-hidden", "true");
    if (message.role === "assistant") {
      const image = document.createElement("img");
      image.src = "/assets/brand/sdc-logo.webp";
      image.alt = "";
      image.width = 24;
      image.height = 27;
      avatar.appendChild(image);
    } else {
      avatar.textContent = "You";
    }
    const body = document.createElement("div");
    body.className = "sdc-chat-bubble";
    renderApprovedLinks(body, message.content);
    article.append(avatar, body);
    messagesElement.appendChild(article);

    if (options.action) {
      const action = document.createElement("a");
      action.className = "sdc-chat-inline-action";
      action.href = options.action.href;
      action.textContent = options.action.label;
      article.appendChild(action);
    }
    messagesElement.scrollTop = messagesElement.scrollHeight;
  };

  const renderHistory = () => {
    messagesElement.replaceChildren();
    state.messages.forEach(message => appendMessage(message));
    if (!state.messages.some(message => message.role === "user")) {
      renderStarters();
    } else {
      starterElement.hidden = true;
    }
  };

  const renderStarters = () => {
    starterElement.replaceChildren();
    starters.forEach(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sdc-chat-starter";
      button.textContent = label;
      button.addEventListener("click", () => sendMessage(label));
      starterElement.appendChild(button);
    });
    starterElement.hidden = false;
  };

  const addMessage = (role, content, options = {}) => {
    const message = { role, content: safeText(content) };
    state.messages.push(message);
    persist();
    appendMessage(message, options);
    if (role === "user") starterElement.hidden = true;
  };

  const typing = () => {
    const item = document.createElement("div");
    item.className = "sdc-chat-typing";
    item.dataset.typing = "true";
    item.setAttribute("role", "status");
    item.setAttribute("aria-label", "SDC assistant is thinking");
    item.innerHTML = "<span></span><span></span><span></span><small>Thinking…</small>";
    messagesElement.appendChild(item);
    messagesElement.scrollTop = messagesElement.scrollHeight;
    return item;
  };

  const sendMessage = async text => {
    const content = safeText(text).trim();
    if (!content || state.busy) return;
    state.busy = true;
    setStatus("");
    sendButton.disabled = true;
    input.disabled = true;
    addMessage("user", content);
    input.value = "";
    input.style.height = "auto";
    const indicator = typing();

    try {
      const response = await fetch("/.netlify/functions/sdc-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ messages: state.messages.slice(-12) })
      });
      let payload = {};
      try { payload = await response.json(); } catch { /* handled as a safe fallback below */ }
      indicator.remove();

      if (!response.ok || typeof payload.reply !== "string" || !payload.reply.trim()) {
        const fallback = typeof payload.message === "string"
          ? payload.message
          : "I can't reach the assistant service right now. You can still contact the SDC team or prepare a project brief.";
        addMessage("assistant", fallback, {
          action: { label: "Contact SDC", href: "/contact.html" }
        });
        setStatus(response.status === 429 ? "Please wait a moment before sending another message." : "The assistant is temporarily unavailable.", "error");
        return;
      }

      addMessage("assistant", payload.reply.trim());
    } catch {
      indicator.remove();
      addMessage("assistant", "I couldn't connect to the assistant service. Your message has not been submitted to the SDC team. You can continue through the Contact page.", {
        action: { label: "Open contact form", href: "/contact.html" }
      });
      setStatus("Connection unavailable. No inquiry was submitted.", "error");
    } finally {
      state.busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      if (panel.hidden === false) input.focus();
    }
  };

  const openChat = () => {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    state.opened = true;
    window.setTimeout(() => input.focus(), 40);
  };

  const closeChat = () => {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    state.opened = false;
    trigger.focus();
  };

  const buildHandoff = () => {
    const transcript = state.messages
      .filter(message => message.role === "user" || message.role === "assistant")
      .slice(-14)
      .map(message => (message.role === "user" ? "Visitor" : "SDC AI Assistant") + ":\n" + message.content)
      .join("\n\n");
    const prefix = "PROJECT CONTEXT FROM SDC AI ASSISTANT\nPlease review and edit this context before sending. It has not been submitted.\n\n";
    const suffix = "\n\n[Chat context shortened to fit the contact form. The original conversation remains only in this browser tab.]";
    const encoder = new TextEncoder();
    let value = prefix + transcript;
    if (encoder.encode(value).length > 2500) {
      const chars = Array.from(transcript);
      while (chars.length && encoder.encode(prefix + chars.join("") + suffix).length > 2900) chars.pop();
      value = prefix + chars.join("").trimEnd() + suffix;
    }
    return value;
  };

  const handoff = () => {
    const draft = buildHandoff();
    try {
      sessionStorage.setItem(HANDOFF_KEY, draft);
      window.location.assign("/contact.html?from=chatbot");
    } catch {
      setStatus("Your browser blocked session storage. Copy the conversation and paste it into the Contact form instead.", "error");
      const range = document.createRange();
      range.selectNodeContents(messagesElement);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  root.querySelector('[data-action="close"]').addEventListener("click", closeChat);
  root.querySelector('[data-action="clear"]').addEventListener("click", () => {
    state.messages = [{ role: "assistant", content: WELCOME }];
    persist();
    setStatus("Conversation cleared in this browser tab.", "ready");
    renderHistory();
  });
  root.querySelector('[data-action="handoff"]').addEventListener("click", handoff);
  trigger.addEventListener("click", () => panel.hidden ? openChat() : closeChat());
  form.addEventListener("submit", event => {
    event.preventDefault();
    void sendMessage(input.value);
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) closeChat();
  });

  // Explicit handoff from chat to the existing contact form. This only pre-fills
  // an editable draft; the visitor must review and submit the form themselves.
  if (document.querySelector("#inquiry-form")) {
    try {
      const draft = sessionStorage.getItem(HANDOFF_KEY);
      if (draft) {
        const field = document.querySelector("#message");
        if (field && !field.value.trim()) {
          field.value = draft;
          field.dispatchEvent(new Event("input", { bubbles: true }));
          const notice = document.createElement("p");
          notice.className = "sdc-chat-handoff-notice";
          notice.setAttribute("role", "status");
          notice.textContent = "Your chat context has been added as an editable draft. Review it, add your contact details, and submit only when ready. Nothing has been sent yet.";
          field.insertAdjacentElement("afterend", notice);
        }
        sessionStorage.removeItem(HANDOFF_KEY);
      }
    } catch {
      setStatus("Chat context could not be transferred. You can copy it from the conversation instead.", "error");
    }
  }

  renderHistory();
})();
