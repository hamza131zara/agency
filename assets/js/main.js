/* Configure the verified agency inbox before launch. Never add private credentials here. */
const CONTACT_EMAIL = "";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", function () {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !open);
  });

  primaryNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      primaryNav.classList.remove("is-open");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const form = document.querySelector("#inquiry-form");
const status = document.querySelector("#form-status");

if (form && status) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.dataset.state = "";
    status.textContent = "";

    if (!form.reportValidity()) {
      status.dataset.state = "error";
      status.textContent = "Please complete the required fields and check your email address.";
      return;
    }

    const name = String(form.elements.namedItem("name").value).trim();
    const email = String(form.elements.namedItem("email").value).trim();
    const interest = String(form.elements.namedItem("interest").value).trim();
    const message = String(form.elements.namedItem("message").value).trim();

    if (!name || !email || !interest || message.length < 10) {
      status.dataset.state = "error";
      status.textContent = "Please complete each field and include at least 10 characters about the project.";
      return;
    }

    if (!CONTACT_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT_EMAIL)) {
      status.dataset.state = "error";
      status.textContent = "This inquiry form is not connected yet. Your message has not been sent; the agency must configure its official contact inbox before launch.";
      return;
    }

    const subject = encodeURIComponent("Project inquiry — " + interest);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nService: " + interest + "\n\nProject details:\n" + message);
    status.dataset.state = "ready";
    status.textContent = "Your email application should open with the inquiry prepared. Review it and press Send in that application to deliver it.";
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
  });
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = document.querySelectorAll(".service-card, .work-card, .approach-list article, .automation-row, .faq-list details");
  targets.forEach(function (element) { element.classList.add("reveal"); });
  const observer = new IntersectionObserver(function (entries, currentObserver) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  targets.forEach(function (element) { observer.observe(element); });
}
