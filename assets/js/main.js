/* Agency Phase 1 browser behavior and inquiry delivery. */
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    primaryNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      primaryNav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      menuToggle.focus();
    }
  });
}
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
const form = document.querySelector('#inquiry-form');
const status = document.querySelector('#form-status');
const setStatus = (message, state='') => { if (status) { status.textContent = message; status.dataset.state = state; } };
if (form && status) {
  let csrfToken = '';
  let ready = false;
  const submitButton = form.querySelector('button[type="submit"]');
  const idleMarkup = submitButton ? submitButton.innerHTML : '';
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get('service');
  const interest = form.elements.namedItem('interest');
  if (requestedService && interest) {
    const match = Array.from(interest.options).find(o => o.value === requestedService || o.textContent.trim() === requestedService);
    if (match) interest.value = match.value;
  }
  async function initialize() {
    if (submitButton) submitButton.disabled = true;
    setStatus('Connecting to the website inquiry service…');
    try {
      const response = await fetch('contact.php?csrf=1', {credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'});
      const data = await response.json();
      if (!response.ok || !data.csrf_token) throw new Error('No valid form token.');
      csrfToken = data.csrf_token; ready = true;
      if (submitButton) submitButton.disabled = false;
      setStatus(data.configured
        ? 'Form connected. The server will confirm whether your inquiry was accepted for email processing.'
        : 'The form endpoint is reachable, but the official inbox is not configured. Your inquiry will not be reported as sent until hosting is configured.',
        data.configured ? '' : 'error');
    } catch (err) {
      ready = false;
      if (submitButton) submitButton.disabled = false;
      setStatus('The form endpoint could not be reached. This form requires the PHP-enabled website; a static preview will not claim to send messages.','error');
    }
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) { setStatus('Please review the required fields and enter a valid email address.','error'); return; }
    if (!ready || !csrfToken) { setStatus('The form is not connected to the server. Your inquiry has not been sent.','error'); return; }
    const name = String(form.elements.namedItem('name')?.value || '').trim();
    const email = String(form.elements.namedItem('email')?.value || '').trim();
    const message = String(form.elements.namedItem('message')?.value || '').trim();
    if (!name || name.length > 100 || email.length > 254 || message.length < 20 || message.length > 3000) {
      setStatus('Please check your name, email and project details. The message must contain at least 20 characters.','error'); return;
    }
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending…'; }
    setStatus('Submitting your inquiry securely…');
    try {
      const data = new URLSearchParams(new FormData(form));
      data.set('csrf_token', csrfToken);
      if (!data.has('website')) data.set('website','');
      const response = await fetch('contact.php',{method:'POST',credentials:'same-origin',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:data.toString(),cache:'no-store'});
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setStatus(result.message || 'The server could not accept the inquiry. Your message has not been reported as sent.','error');
        if (result.code === 'csrf_failed') { ready = false; await initialize(); }
        return;
      }
      csrfToken = result.csrf_token || '';
      form.reset();
      setStatus(result.message || 'Your inquiry was accepted by the website mail service. This does not confirm final inbox delivery.','ready');
    } catch (err) {
      setStatus('We could not confirm the submission. Your inquiry may not have been sent; please try again later.','error');
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = idleMarkup; }
    }
  });
  initialize();
}
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const nodes = document.querySelectorAll('.service-card,.work-card,.approach-list article,.automation-row,.faq-list details');
  nodes.forEach(n => n.classList.add('reveal'));
  const observer = new IntersectionObserver((entries, obs) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }), {threshold:.08});
  nodes.forEach(n => observer.observe(n));
}
