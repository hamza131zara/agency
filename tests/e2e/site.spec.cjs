const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

const ALLOWED_SERVICES = [
  'Full-stack development',
  'AI / LLM / agent development',
  'AI integration',
  'Cybersecurity / secure engineering',
  'Debugging / performance',
  'UI/UX and product design',
  'Digital marketing / growth',
  'Workflow automation consulting',
  'Something else'
];

const PAGES = [
  '/', '/services.html', '/work.html', '/about.html', '/contact.html',
  '/privacy.html', '/404.html', '/work/strideto.html', '/work/regexlab.html',
  '/work/jotjson.html', '/work/siteintel-pulse.html', '/work/free-ai-mixer.html', '/brief-builder.html'
];

test.describe('Phase I route and content checks', () => {
  for (const route of PAGES) {
    test('renders ' + route + ' with a title, one main heading and metadata', async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, 'Expected a response for ' + route).not.toBeNull();
      expect(response.status(), 'Unexpected HTTP status for ' + route).toBe(200);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('meta[name="description"][content]')).toHaveCount(1);
      await expect(page.locator('a.skip-link[href="#main"]')).toHaveCount(1);
    });
  }

  test('internal page links use safe attributes when opening new tabs', async ({ page }) => {
    for (const route of ['/', '/services.html', '/work.html', '/about.html', '/contact.html', '/privacy.html']) {
      await page.goto(route);
      const unsafeLinks = await page.locator('a[target="_blank"]').evaluateAll(links =>
        links.filter(link => !/\bnoopener\b/.test(link.rel) || !/\bnoreferrer\b/.test(link.rel))
          .map(link => ({ href: link.href, rel: link.rel }))
      );
      expect(unsafeLinks, 'Unsafe target=_blank links on ' + route).toEqual([]);
    }
  });

  test('home-page mobile navigation opens, closes with Escape, and follows links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Close navigation');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Open navigation');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/\/services\.html$/);
    await expect(page.locator('#primary-nav')).not.toBeVisible();
  });

  test('skip link receives the first keyboard focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
  });

  test('homepage and contact inquiry services match the PHP allow-list', async ({ page }) => {
    for (const route of ['/', '/contact.html']) {
      await page.goto(route);
      const services = await page.locator('select[name="interest"] option').evaluateAll(options =>
        options.filter(option => option.value !== '').map(option => option.value)
      );
      expect(services, 'Service options must match contact.php on ' + route).toEqual(ALLOWED_SERVICES);
    }
  });

  test('inquiry page labels fields and reports missing mail configuration honestly', async ({ page }) => {
    await page.goto('/contact.html');
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('What can we help with?')).toBeVisible();
    await expect(page.getByLabel('A little about the project')).toBeVisible();
    await expect(page.locator('#form-status')).toContainText(/inbox is not configured/i);
    await expect(page.locator('#local-inquiry-tools')).toBeVisible();

    await page.locator('input[name="name"]').fill('Test Visitor');
    await page.locator('input[name="email"]').fill('visitor@example.org');
    await page.locator('select[name="interest"]').selectOption({ label: 'Full-stack development' });
    await page.locator('textarea[name="message"]').fill('This is a browser smoke test and must never be delivered.');
    await page.getByRole('button', { name: /send inquiry/i }).click();
    await expect(page.locator('#form-status')).toContainText(/your inquiry has not been sent/i);
    await expect(page.locator('#form-status')).not.toContainText(/accepted by the website mail service/i);
  });


  test('contact page exports a local inquiry copy without posting it', async ({ page }) => {
    const postRequests = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/contact.php')) postRequests.push(request.url());
    });
    await page.goto('/contact.html');
    await expect(page.locator('#local-inquiry-tools')).toBeVisible();
    await page.getByLabel('Your name').fill('Local Copy Test');
    await page.getByLabel('Email address').fill('local-copy@example.org');
    await page.getByLabel('What can we help with?').selectOption({ label: 'Full-stack development' });
    await page.getByLabel('A little about the project').fill('Please build a local draft that can be saved without sending any message.');

    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download inquiry (.txt)' }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toMatch(/^agency-inquiry-\d{4}-\d{2}-\d{2}\.txt$/);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const contents = await fs.readFile(filePath, 'utf8');
    expect(contents).toContain('Local Copy Test');
    expect(contents).toContain('local-copy@example.org');
    expect(contents).toContain('Full-stack development');
    expect(contents).toContain('Please build a local draft');
    expect(contents).toContain('was not submitted');

    await page.getByRole('button', { name: 'Copy inquiry' }).click();
    await expect(page.locator('#local-inquiry-status')).toContainText(/copied to the clipboard|download your inquiry instead/i);
    expect(postRequests).toEqual([]);
  });


  test('service finder recommends a service and carries the selection into the project brief', async ({ page }) => {
    await page.goto('/services.html');
    const result = page.locator('#service-finder-result');
    await expect(result).toBeHidden();
    await page.locator('input[name="serviceNeed"][value="AI integration"]').check();
    await expect(result).toBeVisible();
    await expect(page.locator('#service-finder-result-title')).toHaveText('AI and platform integration');
    await expect(page.locator('#service-finder-status')).toContainText(/AI and platform integration/i);
    await expect(page.locator('#service-finder-brief')).toHaveAttribute('href', 'brief-builder.html?service=AI%20integration');
    await expect(page.locator('#service-finder-contact')).toHaveAttribute('href', 'contact.html?service=AI%20integration');

    await page.getByRole('link', { name: /Build a project brief/i }).click();
    await expect(page).toHaveURL(/brief-builder\.html\?service=AI%20integration$/);
    await expect(page.locator('#brief-service')).toHaveValue('AI integration');
  });

  test('portfolio search, category and status filters combine and reset', async ({ page }) => {
    await page.goto('/work.html');
    const visibleCards = page.locator('[data-project-card]:visible');
    await expect(page.locator('[data-project-card]')).toHaveCount(5);
    await expect(page.locator('#project-result-count')).toContainText('all 5 projects');

    await page.getByRole('button', { name: 'Developer tools' }).click();
    await expect(visibleCards).toHaveCount(2);
    await expect(page.locator('#project-result-count')).toContainText('2 of 5');

    await page.getByRole('searchbox', { name: 'Search projects' }).fill('RegexLab');
    await expect(visibleCards).toHaveCount(1);
    await expect(page.locator('#project-result-count')).toContainText('1 of 5');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(visibleCards).toHaveCount(5);
    await page.getByLabel('Current status').selectOption('development');
    await expect(visibleCards).toHaveCount(2);
    await expect(page.locator('#project-result-count')).toContainText('2 of 5');
  });

  test('project brief builder creates a local draft and supports text download', async ({ page }) => {
    const serviceRequests = [];
    page.on('request', request => {
      if (request.url().includes('/contact.php') || request.url().includes('/api/')) serviceRequests.push(request.url());
    });
    await page.goto('/brief-builder.html');
    expect(await page.locator('#brief-form').evaluate(form => form.checkValidity())).toBe(false);
    await page.getByLabel('Main area of help').selectOption({ label: 'AI / LLM / agent development' });
    await page.getByLabel('Where are you now?').selectOption({ label: 'Planning an MVP' });
    await page.getByLabel('Goal or problem to solve').fill('Create an AI support assistant that helps answer common product questions.');
    await page.getByLabel('Project name').fill('Support Assistant');
    await page.getByLabel('Who will use it?').fill('Customers and internal support staff');
    await page.getByLabel('Security & privacy').check();
    await page.getByLabel('AI quality & evaluation').check();
    await page.getByRole('button', { name: 'Generate project brief' }).click();

    const output = page.getByLabel('Generated project brief');
    const generatedBrief = await output.inputValue();
    expect(generatedBrief).toContain('Support Assistant');
    expect(generatedBrief).toContain('AI / LLM / agent development');
    expect(generatedBrief).toContain('Security and privacy');
    expect(generatedBrief).toContain('AI quality and evaluation');
    await expect(page.locator('#brief-status')).toContainText('generated in this browser tab');
    await expect(page.getByRole('button', { name: 'Copy brief' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeEnabled();

    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download .txt' }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe('support-assistant.txt');

    await expect(page.getByRole('button', { name: 'Download JSON' })).toBeEnabled();
    const jsonDownloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download JSON' }).click();
    const jsonDownload = await jsonDownloadEvent;
    expect(jsonDownload.suggestedFilename()).toBe('support-assistant.json');
    const jsonPath = await jsonDownload.path();
    expect(jsonPath).toBeTruthy();
    const structured = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    expect(structured.schemaVersion).toBe('1.0');
    expect(structured.documentType).toBe('agency-project-brief');
    expect(structured.project.name).toBe('Support Assistant');
    expect(structured.project.service).toBe('AI / LLM / agent development');
    expect(structured.priorities).toContain('Security and privacy');
    expect(structured.submitted).toBe(false);
    expect(structured.notAQuote).toBe(true);

    await page.getByLabel('Project name').fill('Internal Knowledge Assistant');
    await expect(output).toHaveValue(/Internal Knowledge Assistant/);
    await expect(output).not.toHaveValue(/Support Assistant/);
    expect(serviceRequests).toEqual([]);
  });

  test('project brief builder reset clears draft output and disables export actions', async ({ page }) => {
    await page.goto('/brief-builder.html');
    await page.getByLabel('Main area of help').selectOption({ label: 'Full-stack development' });
    await page.getByLabel('Where are you now?').selectOption({ label: 'Exploring an idea' });
    await page.getByLabel('Goal or problem to solve').fill('We need a responsive portal to help our customers manage requests.');
    await page.getByRole('button', { name: 'Generate project brief' }).click();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeEnabled();
    await page.getByRole('button', { name: 'Reset answers' }).click();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
    await expect(page.getByLabel('Generated project brief')).toHaveValue('');
  });


  test('project brief handoff prefills contact form but never submits the inquiry', async ({ page }) => {
    const postRequests = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/contact.php')) postRequests.push(request.url());
    });
    await page.goto('/brief-builder.html');
    await page.getByLabel('Main area of help').selectOption({ label: 'Full-stack development' });
    await page.getByLabel('Where are you now?').selectOption({ label: 'Exploring an idea' });
    await page.getByLabel('Goal or problem to solve').fill('Build a customer portal where clients can track their service requests.');
    await page.getByLabel('Project name').fill('Contact handoff test');
    await page.getByRole('button', { name: 'Generate project brief' }).click();
    await page.getByRole('button', { name: /Continue to contact/i }).click();

    await expect(page).toHaveURL(/contact\.html\?service=Full-stack%20development&from=brief-builder$/);
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/Contact handoff test/);
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/customer portal/);
    await expect(page.locator('#form-status')).toContainText(/inquiry has not been sent/i);
    expect(await page.evaluate(() => sessionStorage.getItem('agency-project-brief-draft'))).toBeNull();
    expect(postRequests).toEqual([]);
  });

});
