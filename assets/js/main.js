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
  // This is an explicit, one-time browser-session handoff from the Project Brief Builder.
  // Read it into the message field, then immediately remove it; nothing is submitted here.
  let briefHandoffLoaded = false;
  try {
    const pendingBrief = sessionStorage.getItem('agency-project-brief-draft');
    if (pendingBrief) {
      const messageField = form.elements.namedItem('message');
      if (messageField && typeof messageField.value === 'string') {
        messageField.value = pendingBrief;
        briefHandoffLoaded = true;
      }
      sessionStorage.removeItem('agency-project-brief-draft');
    }
  } catch (error) {
    // Storage can be disabled by the browser; the form stays usable without prefill.
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
      const deliveryStatus = data.configured
        ? 'Form connected. The server will confirm whether your inquiry was accepted for email processing.'
        : 'The form endpoint is reachable, but the official inbox is not configured. Your inquiry will not be reported as sent until hosting is configured.';
      setStatus(
        briefHandoffLoaded
          ? 'A project summary was added to the form. Your inquiry has not been sent. ' + deliveryStatus
          : deliveryStatus,
        data.configured ? '' : 'error'
      );
    } catch (err) {
      ready = false;
      if (submitButton) submitButton.disabled = false;
      setStatus(briefHandoffLoaded ? 'A project summary is prefilled, but the inquiry endpoint could not be reached. It has not been sent.' : 'The form endpoint could not be reached. This form requires the PHP-enabled website; a static preview will not claim to send messages.','error');
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

/* Portfolio discovery: search, project type and status. */
const portfolioExplorer = document.querySelector('.portfolio-explorer');
if (portfolioExplorer) {
  const cards = Array.from(document.querySelectorAll('[data-project-card]'));
  const search = document.querySelector('#project-search');
  const statusFilter = document.querySelector('#project-status');
  const filterButtons = Array.from(document.querySelectorAll('[data-project-filter]'));
  const resultCount = document.querySelector('#project-result-count');
  const clearButton = document.querySelector('#clear-project-filters');
  const emptyMessage = document.querySelector('#project-empty-state');
  let category = 'all';
  const applyFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const statusValue = statusFilter?.value || 'all';
    let visible = 0;
    cards.forEach(card => {
      const show = (category === 'all' || card.dataset.category === category)
        && (statusValue === 'all' || card.dataset.status === statusValue)
        && (!query || card.textContent.toLowerCase().includes(query));
      card.hidden = !show;
      if (show) visible++;
    });
    if (resultCount) resultCount.textContent = visible === cards.length ? 'Showing all ' + visible + ' projects.' : 'Showing ' + visible + ' of ' + cards.length + ' projects.';
    if (emptyMessage) emptyMessage.hidden = visible > 0;
  };
  filterButtons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.projectFilter || 'all';
    filterButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
  statusFilter?.addEventListener('change', applyFilters);
  clearButton?.addEventListener('click', () => {
    category = 'all';
    if (search) search.value = '';
    if (statusFilter) statusFilter.value = 'all';
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === 'all')));
    applyFilters();
    search?.focus();
  });
  applyFilters();
}

/* Project Brief Builder runs locally and does not submit or persist answers. */
const briefForm = document.querySelector('#brief-form');
if (briefForm) {
  const output = document.querySelector('#brief-output');
  const briefStatus = document.querySelector('#brief-status');
  const copyButton = document.querySelector('#copy-brief');
  const downloadButton = document.querySelector('#download-brief');
  const continueButton = document.querySelector('#continue-to-contact');
  const fieldValue = name => String(briefForm.elements.namedItem(name)?.value || '').trim();
  const selectedValues = name => Array.from(briefForm.querySelectorAll('input[name="' + name + '"]:checked')).map(input => input.value);
  const setBriefStatus = (message, state='') => { if (briefStatus) { briefStatus.textContent = message; briefStatus.dataset.state = state; } };
  const setExportEnabled = enabled => {
    if (copyButton) copyButton.disabled = !enabled;
    if (downloadButton) downloadButton.disabled = !enabled;
    if (continueButton) continueButton.disabled = !enabled;
  };
  let generated = false;
  const emptyOutput = 'Your formatted brief will appear here after you complete the required fields and generate the draft.';
  const buildText = () => {
    const now = new Date();
    const date = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    const priorities = selectedValues('priorities');
    const row = (label, value) => label + ': ' + (value || 'Not specified');
    return [
      'PROJECT BRIEF', 'Generated locally on ' + date, '',
      row('Project',fieldValue('projectName')),row('Company / organization',fieldValue('organization')),
      row('Main service',fieldValue('service')),row('Current stage',fieldValue('stage')), '',
      'GOAL / PROBLEM TO SOLVE',fieldValue('objective'), '',
      'TARGET USERS',fieldValue('audience') || 'Not specified', '',
      'PRIORITIES',priorities.length ? priorities.map(item => '- ' + item).join('\n') : 'No specific priorities selected yet', '',
      'EXISTING TOOLS / TECHNOLOGY',fieldValue('existingStack') || 'Not specified', '',
      'SYSTEMS / INTEGRATIONS',fieldValue('integrations') || 'Not specified', '',
      row('Preferred timeline',fieldValue('timeline')),row('Indicative budget (not a quote)',fieldValue('budget')), '',
      'SUCCESS CRITERIA',fieldValue('success') || 'To be defined together', '',
      'OPEN QUESTIONS / ASSUMPTIONS',
      '- Validate scope, dependencies, security/privacy needs and acceptance criteria during discovery.',
      '- Timeline and budget are user-provided planning inputs, not commitments or a proposal.', '',
      'Prepared with the Agency Project Brief Builder. This document reflects user-provided inputs and has not been submitted or reviewed by the agency.'
    ].join('\n');
  };
  const generate = announce => {
    if (!briefForm.checkValidity()) {
      briefForm.reportValidity(); generated = false; setExportEnabled(false);
      if (announce) setBriefStatus('Complete the required fields before generating the brief.','error');
      return false;
    }
    if (output) output.value = buildText();
    generated = true; setExportEnabled(true);
    if (announce) setBriefStatus('Brief generated in this browser tab. Review it, then copy or download when ready.','ready');
    return true;
  };
  briefForm.addEventListener('submit', event => { event.preventDefault(); if (generate(true)) output?.focus(); });
  briefForm.addEventListener('input', () => {
    if (!generated) return;
    if (briefForm.checkValidity()) generate(false);
    else { generated=false; if (output) output.value=emptyOutput; setExportEnabled(false); setBriefStatus('A required field needs attention before the brief can be refreshed.','error'); }
  });
  briefForm.addEventListener('reset', () => window.setTimeout(() => {
    generated=false; if (output) output.value=''; setExportEnabled(false); setBriefStatus('Answers cleared. Complete the required fields to generate a new brief.');
  },0));
  copyButton?.addEventListener('click', async () => {
    if (!generated || !output?.value) return;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(output.value); setBriefStatus('Project brief copied to the clipboard.','ready'); return;
      }
      output.focus(); output.select();
      const ok=document.execCommand('copy');
      setBriefStatus(ok?'Project brief copied to the clipboard.':'Select the preview text and copy it manually.',ok?'ready':'error');
    } catch (error) {
      output.focus(); output.select(); setBriefStatus('Clipboard access was blocked. The brief is selected so you can copy it manually.','error');
    }
  });
  downloadButton?.addEventListener('click', () => {
    if (!generated || !output?.value) return;
    const slug=(fieldValue('projectName')||'agency-project-brief').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
    const url=URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download=(slug||'agency-project-brief')+'.txt'; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000); setBriefStatus('Your text file download has been prepared locally.','ready');
  });
  continueButton?.addEventListener('click', () => {
    if (!generated) {
      setBriefStatus('Generate the brief before continuing to contact.','error');
      return;
    }
    const priorities = selectedValues('priorities');
    const lines = [
      fieldValue('projectName') ? 'Project: ' + fieldValue('projectName') : '',
      fieldValue('organization') ? 'Organization: ' + fieldValue('organization') : '',
      'Service: ' + fieldValue('service'),
      'Stage: ' + fieldValue('stage'),
      '',
      'Goal / problem:',
      fieldValue('objective'),
      fieldValue('audience') ? '\nUsers: ' + fieldValue('audience') : '',
      priorities.length ? '\nPriorities: ' + priorities.join(', ') : '',
      fieldValue('existingStack') ? '\nExisting technology: ' + fieldValue('existingStack') : '',
      fieldValue('integrations') ? '\nIntegrations: ' + fieldValue('integrations') : '',
      fieldValue('timeline') ? '\nPreferred timeline: ' + fieldValue('timeline') : '',
      fieldValue('budget') ? '\nIndicative budget (not a quote): ' + fieldValue('budget') : '',
      fieldValue('success') ? '\nSuccess criteria: ' + fieldValue('success') : ''
    ].filter(Boolean).join('\n');
    const suffix = '\n\n[Summary may be shortened to fit the contact form. Download the full brief above.]';
    const encoder = new TextEncoder();
    let handoff = lines;
    if (encoder.encode(handoff).length > 2600) {
      const chars = Array.from(handoff);
      while (chars.length && encoder.encode(chars.join('')).length > 2600 - encoder.encode(suffix).length) chars.pop();
      handoff = chars.join('').trimEnd() + suffix;
    }
    try {
      sessionStorage.setItem('agency-project-brief-draft', handoff);
    } catch (error) {
      setBriefStatus('Browser session storage is unavailable. Copy or download your brief and paste the summary into Contact instead.','error');
      return;
    }
    window.location.href = 'contact.html?service=' + encodeURIComponent(fieldValue('service')) + '&from=brief-builder';
  });
  if (output) output.value='';
}
