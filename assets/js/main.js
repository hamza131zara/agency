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

const localInquiryTools = document.querySelector('#local-inquiry-tools');
const localInquiryStatus = document.querySelector('#local-inquiry-status');
const downloadInquiryButton = document.querySelector('#download-inquiry');
const copyInquiryButton = document.querySelector('#copy-inquiry');
const showLocalInquiryTools = (show, message='') => {
  if (localInquiryTools) localInquiryTools.hidden = !show;
  if (message && localInquiryStatus) localInquiryStatus.textContent = message;
};
const setLocalInquiryStatus = (message, state='') => {
  if (localInquiryStatus) {
    localInquiryStatus.textContent = message;
    localInquiryStatus.dataset.state = state;
  }
};
const buildLocalInquiryText = () => {
  const read = key => String(form.elements.namedItem(key)?.value || '').trim();
  const name = read('name');
  const email = read('email');
  const service = read('interest');
  const message = read('message');
  if (![name, email, service, message].some(value => value.length > 0)) {
    setLocalInquiryStatus('Add some inquiry details before creating a local copy.', 'error');
    return '';
  }
  const date = new Date().toISOString().slice(0, 10);
  return [
    'AGENCY — PROJECT INQUIRY',
    'Prepared locally on ' + date,
    '',
    'Name: ' + (name || 'Not provided'),
    'Email: ' + (email || 'Not provided'),
    'Service: ' + (service || 'Not selected'),
    '',
    'PROJECT DETAILS',
    message || 'Not provided',
    '',
    'Local copy only. This text was not submitted by the download/copy action. Confirm receipt separately before assuming the inquiry was delivered.'
  ].join('\n');
};
downloadInquiryButton?.addEventListener('click', () => {
  const contents = buildLocalInquiryText();
  if (!contents) return;
  const blobUrl = URL.createObjectURL(new Blob([contents], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'agency-inquiry-' + new Date().toISOString().slice(0, 10) + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  setLocalInquiryStatus('A text copy was prepared locally. It has not been sent to the agency.', 'ready');
});
copyInquiryButton?.addEventListener('click', async () => {
  const contents = buildLocalInquiryText();
  if (!contents) return;
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(contents);
      setLocalInquiryStatus('Inquiry copied to the clipboard. It has not been sent.', 'ready');
      return;
    }
  } catch (error) {
    // Fall back to a direct browser copy attempt below.
  }
  const temporary = document.createElement('textarea');
  temporary.value = contents;
  temporary.setAttribute('aria-label', 'Local inquiry copy text');
  temporary.style.position = 'fixed';
  temporary.style.opacity = '0';
  temporary.style.pointerEvents = 'none';
  document.body.appendChild(temporary);
  temporary.focus();
  temporary.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
  temporary.remove();
  setLocalInquiryStatus(
    copied ? 'Inquiry copied to the clipboard. It has not been sent.' : 'Clipboard access is unavailable in this browser. Use Download inquiry (.txt) instead.',
    copied ? 'ready' : 'error'
  );
});

if (form && status) {
  const netlifyDelivery = form.dataset.delivery === 'netlify';
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
    if (netlifyDelivery) {
      ready = true;
      if (submitButton) submitButton.disabled = false;
      showLocalInquiryTools(false);
      setStatus(
        briefHandoffLoaded
          ? 'Your project summary is ready. Review the details before submitting your inquiry.'
          : 'The hosted project inquiry form is ready. Your message has not been submitted.',
        ''
      );
      return;
    }

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
      showLocalInquiryTools(!data.configured);
      setStatus(
        briefHandoffLoaded
          ? 'A project summary was added to the form. Your inquiry has not been sent. ' + deliveryStatus
          : deliveryStatus,
        data.configured ? '' : 'error'
      );
      if (!data.configured) setLocalInquiryStatus('The official inbox is not configured. Use copy or download to keep a local copy; neither action sends your inquiry.', 'error');
    } catch (err) {
      ready = false;
      if (submitButton) submitButton.disabled = false;
      showLocalInquiryTools(true, 'The inquiry endpoint is unreachable. You can keep a local copy while delivery is unavailable.');
      setStatus(briefHandoffLoaded ? 'A project summary is prefilled, but the inquiry endpoint could not be reached. It has not been sent.' : 'The form endpoint could not be reached. Your inquiry has not been sent.','error');
      setLocalInquiryStatus('The form endpoint is unavailable. Copy or download stays in this browser and does not submit your message.', 'error');
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) { setStatus('Please review the required fields and enter a valid email address.','error'); return; }
    if (!ready || (!netlifyDelivery && !csrfToken)) { setStatus('The form is not connected to the server. Your inquiry has not been sent.','error'); return; }
    const name = String(form.elements.namedItem('name')?.value || '').trim();
    const email = String(form.elements.namedItem('email')?.value || '').trim();
    const message = String(form.elements.namedItem('message')?.value || '').trim();
    if (!name || name.length > 100 || email.length > 254 || message.length < 20 || message.length > 3000) {
      setStatus('Please check your name, email and project details. The message must contain at least 20 characters.','error'); return;
    }
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending…'; }
    setStatus('Submitting your inquiry…');
    try {
      const data = new URLSearchParams(new FormData(form));
      if (netlifyDelivery) {
        data.set('form-name', form.getAttribute('name') || 'sdc-project-inquiry');
        if (!data.has('website')) data.set('website', '');
        const response = await fetch('/', {
          method: 'POST',
          headers: {'Content-Type':'application/x-www-form-urlencoded'},
          body: data.toString(),
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('The hosted form service did not accept the request.');
        form.reset();
        setStatus('Your inquiry was submitted to the hosted form service. This confirms platform acceptance, not that SDC has read or replied to it.', 'ready');
        return;
      }

      data.set('csrf_token', csrfToken);
      if (!data.has('website')) data.set('website','');
      const response = await fetch('contact.php',{method:'POST',credentials:'same-origin',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:data.toString(),cache:'no-store'});
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setStatus(result.message || 'The server could not accept the inquiry. Your message has not been reported as sent.','error');
        if (['not_configured', 'mail_failed'].includes(result.code) || response.status === 502 || response.status === 503) {
          showLocalInquiryTools(true, 'Delivery failed or is not configured. Keep a local copy while you review your next step.');
          setLocalInquiryStatus('The server did not confirm delivery. Copy or download the inquiry locally; these actions will not retry or submit it.', 'error');
        }
        if (result.code === 'csrf_failed') { ready = false; await initialize(); }
        return;
      }
      csrfToken = result.csrf_token || '';
      form.reset();
      setStatus(result.message || 'Your inquiry was accepted by the website mail service. This does not confirm final inbox delivery.','ready');
    } catch (err) {
      if (netlifyDelivery) {
        showLocalInquiryTools(true, 'The hosted form service did not confirm your submission. You can keep a local copy; it will not be sent by the copy/download action.');
        setStatus('We could not confirm that your inquiry was submitted. Please try again or keep a local copy.','error');
        setLocalInquiryStatus('No submission was confirmed. Copy or download stays in this browser and does not submit your message.', 'error');
      } else {
        setStatus('We could not confirm the submission. Your inquiry may not have been sent; please try again later.','error');
      }
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


/* Service Finder: recommend a conversation starter, then carry it into the brief. */
const serviceFinderForm = document.querySelector('#service-finder-form');
if (serviceFinderForm) {
  const resultPanel = document.querySelector('#service-finder-result');
  const resultTitle = document.querySelector('#service-finder-result-title');
  const resultDescription = document.querySelector('#service-finder-result-description');
  const resultRelated = document.querySelector('#service-finder-related');
  const briefLink = document.querySelector('#service-finder-brief');
  const contactLink = document.querySelector('#service-finder-contact');
  const finderStatus = document.querySelector('#service-finder-status');
  const serviceRecommendations = {
    'Software & website development': {
      title:'Software and website development',
      description:'A starting point for a new website or platform—from a business site or e-commerce store to a marketplace, portal, SaaS product, dashboard or custom web application. The technology stack is selected for the project.',
      related:[
        {label:'AI, LLM & Intelligent Automation',href:'services/ai-automation.html'},
        {label:'Graphic Design & Creative Services',href:'services/creative-design.html'},
        {label:'E-commerce & Marketplace Operations',href:'services/ecommerce-operations.html'}
      ]
    },
    'AI, LLM & intelligent automation': {
      title:'AI, LLM and intelligent automation',
      description:'A fit for AI-powered features, chatbots, agents, RAG workflows, model integrations or process automation with appropriate safeguards and human review.',
      related:[
        {label:'Software & Website Development',href:'services/software-engineering.html'},
        {label:'Digital Marketing & Growth',href:'services/digital-growth.html'}
      ]
    },
    'Blockchain & Web3': {
      title:'Blockchain and Web3 engineering',
      description:'Start here for smart contracts, decentralized applications, DAO governance, wallet connections or on-chain product integrations.',
      related:[
        {label:'Software & Website Development',href:'services/software-engineering.html'},
        {label:'AI, LLM & Intelligent Automation',href:'services/ai-automation.html'}
      ]
    },
    'Graphic design & creative services': {
      title:'Graphic design and creative services',
      description:'A fit for brand identity, marketing creatives, social graphics, presentations, product visuals or a more consistent visual system.',
      related:[
        {label:'Digital Marketing & Growth',href:'services/digital-growth.html'},
        {label:'Software & Website Development',href:'services/software-engineering.html'}
      ]
    },
    'Digital marketing & growth': {
      title:'Digital marketing and growth',
      description:'Start here to improve search visibility, AEO/GEO discoverability, content, affiliate channels, paid advertising or conversion paths.',
      related:[
        {label:'Graphic Design & Creative Services',href:'services/creative-design.html'},
        {label:'E-commerce & Marketplace Operations',href:'services/ecommerce-operations.html'},
        {label:'Software & Website Development',href:'services/software-engineering.html'}
      ]
    },
    'E-commerce & marketplace operations': {
      title:'E-commerce and marketplace operations',
      description:'A fit for marketplace setup, listings, catalogue operations, marketplace SEO, ads, inventory or multi-channel workflows.',
      related:[
        {label:'Software & Website Development',href:'services/software-engineering.html'},
        {label:'Digital Marketing & Growth',href:'services/digital-growth.html'}
      ]
    },
    'Something else': {
      title:'Project discovery',
      description:'You do not need to know which service is right. Describe the problem, your audience and the result you need, and we can clarify the scope together.',
      related:[
        {label:'Explore all six service divisions',href:'services.html'}
      ]
    }
  };
  const updateServiceRecommendation = () => {
    const selected = new FormData(serviceFinderForm).get('serviceNeed');
    const recommendation = serviceRecommendations[selected];
    if (!recommendation) {
      if (resultPanel) resultPanel.hidden = true;
      if (finderStatus) finderStatus.textContent = 'Choose one option to see a suggested starting point.';
      return;
    }
    if (resultTitle) resultTitle.textContent = recommendation.title;
    if (resultDescription) resultDescription.textContent = recommendation.description;
    if (resultRelated) {
      resultRelated.replaceChildren();
      recommendation.related.forEach(item => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        listItem.append(link);
        resultRelated.append(listItem);
      });
    }
    if (briefLink) briefLink.href = 'brief-builder.html?service=' + encodeURIComponent(String(selected));
    if (contactLink) contactLink.href = 'contact.html?service=' + encodeURIComponent(String(selected));
    if (resultPanel) resultPanel.hidden = false;
    if (finderStatus) finderStatus.textContent = 'Suggested starting point: ' + recommendation.title + '. You can change your choice at any time.';
  };
  serviceFinderForm.addEventListener('change', updateServiceRecommendation);
  updateServiceRecommendation();
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

/* Product catalogue discovery: search, category and availability. */
const productExplorer = document.querySelector('.product-explorer');
if (productExplorer) {
  const cards = Array.from(document.querySelectorAll('[data-product-card]'));
  const search = document.querySelector('#product-search');
  const statusFilter = document.querySelector('#product-status');
  const filterButtons = Array.from(productExplorer.querySelectorAll('[data-product-filter]'));
  const resultCount = document.querySelector('#product-result-count');
  const clearButton = document.querySelector('#clear-product-filters');
  const emptyMessage = document.querySelector('#product-empty-state');
  let category = 'all';

  const applyFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const statusValue = statusFilter?.value || 'all';
    let visible = 0;

    cards.forEach(card => {
      const categoryMatches = category === 'all' || card.dataset.category === category;
      const statusMatches = statusValue === 'all' || card.dataset.status === statusValue;
      const queryMatches = !query || card.textContent.toLowerCase().includes(query);
      const show = categoryMatches && statusMatches && queryMatches;
      card.hidden = !show;
      if (show) visible++;
    });

    if (resultCount) {
      resultCount.textContent = visible === cards.length
        ? 'Showing all ' + visible + ' products.'
        : 'Showing ' + visible + ' of ' + cards.length + ' products.';
    }
    if (emptyMessage) emptyMessage.hidden = visible > 0;
  };

  filterButtons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.productFilter || 'all';
    filterButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
  statusFilter?.addEventListener('change', applyFilters);
  clearButton?.addEventListener('click', () => {
    category = 'all';
    if (search) search.value = '';
    if (statusFilter) statusFilter.value = 'all';
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.productFilter === 'all')));
    applyFilters();
    search?.focus();
  });

  applyFilters();
}



/* Phase 6.2 automation catalogue: service and planned-tool discovery. */
const automationExplorer = document.querySelector('.automation-explorer');
if (automationExplorer) {
  const cards = Array.from(document.querySelectorAll('[data-automation-card]'));
  const search = document.querySelector('#automation-search');
  const deliveryFilter = document.querySelector('#automation-delivery');
  const categoryFilter = document.querySelector('#automation-category');
  const resultCount = document.querySelector('#automation-result-count');
  const clearButton = document.querySelector('#clear-automation-filters');
  const emptyMessage = document.querySelector('#automation-empty-state');

  const applyAutomationFilters = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const delivery = deliveryFilter?.value || 'all';
    const category = categoryFilter?.value || 'all';
    let visible = 0;

    cards.forEach(card => {
      const deliveryMatches = delivery === 'all' || card.dataset.delivery === delivery;
      const categoryMatches = category === 'all' || card.dataset.category === category;
      const queryMatches = !query || card.textContent.toLowerCase().includes(query);
      const show = deliveryMatches && categoryMatches && queryMatches;
      card.hidden = !show;
      if (show) visible++;
    });

    if (resultCount) {
      resultCount.textContent = visible === cards.length
        ? 'Showing all ' + visible + ' automation capabilities.'
        : 'Showing ' + visible + ' of ' + cards.length + ' automation capabilities.';
    }
    if (emptyMessage) emptyMessage.hidden = visible > 0;
  };

  search?.addEventListener('input', applyAutomationFilters);
  deliveryFilter?.addEventListener('change', applyAutomationFilters);
  categoryFilter?.addEventListener('change', applyAutomationFilters);
  clearButton?.addEventListener('click', () => {
    if (search) search.value = '';
    if (deliveryFilter) deliveryFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    applyAutomationFilters();
    search?.focus();
  });

  applyAutomationFilters();
}

/* Project Brief Builder runs locally and does not submit or persist answers. */
const briefForm = document.querySelector('#brief-form');
if (briefForm) {
  const output = document.querySelector('#brief-output');
  const briefStatus = document.querySelector('#brief-status');
  const copyButton = document.querySelector('#copy-brief');
  const downloadButton = document.querySelector('#download-brief');
  const jsonDownloadButton = document.querySelector('#download-brief-json');
  const printButton = document.querySelector('#print-brief');
  const printContent = document.querySelector('#brief-print-content');
  const continueButton = document.querySelector('#continue-to-contact');

  const requestedBriefService = new URLSearchParams(window.location.search).get('service');
  const briefServiceSelect = briefForm.elements.namedItem('service');
  if (requestedBriefService && briefServiceSelect) {
    const serviceOption = Array.from(briefServiceSelect.options).find(option =>
      option.value === requestedBriefService || option.textContent.trim() === requestedBriefService
    );
    if (serviceOption) briefServiceSelect.value = serviceOption.value;
  }

  const fieldValue = name => String(briefForm.elements.namedItem(name)?.value || '').trim();
  const selectedValues = name => Array.from(briefForm.querySelectorAll('input[name="' + name + '"]:checked')).map(input => input.value);
  const setBriefStatus = (message, state='') => { if (briefStatus) { briefStatus.textContent = message; briefStatus.dataset.state = state; } };
  const setExportEnabled = enabled => {
    if (copyButton) copyButton.disabled = !enabled;
    if (downloadButton) downloadButton.disabled = !enabled;
    if (jsonDownloadButton) jsonDownloadButton.disabled = !enabled;
    if (printButton) printButton.disabled = !enabled;
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
  const buildStructuredBrief = () => ({
    schemaVersion: '1.0',
    documentType: 'agency-project-brief',
    generatedAt: new Date().toISOString(),
    project: {
      name: fieldValue('projectName'),
      organization: fieldValue('organization') || null,
      service: fieldValue('service'),
      stage: fieldValue('stage')
    },
    problem: {
      goal: fieldValue('objective'),
      targetAudience: fieldValue('audience') || null
    },
    priorities: selectedValues('priorities'),
    existingTechnology: fieldValue('existingStack') || null,
    integrations: fieldValue('integrations') || null,
    preferredTimeline: fieldValue('timeline') || null,
    indicativeBudget: fieldValue('budget') || null,
    successCriteria: fieldValue('success') || null,
    assumptionsAndReview: [
      'Validate scope, dependencies, security/privacy needs and acceptance criteria during discovery.',
      'Timeline and budget are user-provided planning inputs, not commitments or a proposal.'
    ],
    notAQuote: true,
    submitted: false,
    storage: 'generated locally in the browser; not submitted by this export'
  });
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
  jsonDownloadButton?.addEventListener('click', () => {
    if (!generated) return;
    const slug=(fieldValue('projectName')||'agency-project-brief').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
    const jsonText=JSON.stringify(buildStructuredBrief(),null,2);
    const url=URL.createObjectURL(new Blob([jsonText],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;
    link.download=(slug||'agency-project-brief')+'.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    setBriefStatus('Your structured JSON brief has been prepared locally. It has not been submitted.','ready');
  });
  printButton?.addEventListener('click', () => {
    if (!generated || !output?.value || !printContent) return;
    printContent.textContent = output.value;
    setBriefStatus('The print dialog is opening. Choose your printer or “Save as PDF” in your browser; nothing is uploaded.','ready');
    window.print();
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
