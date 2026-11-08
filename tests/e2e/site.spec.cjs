const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

const ALLOWED_SERVICES = [
  'Software & website development',
  'AI, LLM & intelligent automation',
  'Blockchain & Web3',
  'Graphic design & creative services',
  'Digital marketing & growth',
  'E-commerce & marketplace operations',
  'Something else'
];

const PAGES = [
  '/',
  '/services.html',
  '/work.html',
  '/services/software-engineering.html',
  '/services/ai-automation.html',
  '/services/blockchain-web3.html',
  '/services/creative-design.html',
  '/services/digital-growth.html',
  '/services/ecommerce-operations.html',
  '/about.html',
  '/approach.html',
  '/team.html',
  '/products.html',
  '/products/strideto.html',
  '/products/regexlab.html',
  '/products/jotjson.html',
  '/products/siteintel-pulse.html',
  '/products/free-ai-mixer.html',
  '/automation.html',
  '/contact.html',
  '/privacy.html',
  '/terms.html',
  '/disclaimer.html',
  '/404.html',
  '/work/strideto.html',
  '/work/regexlab.html',
  '/work/jotjson.html',
  '/work/siteintel-pulse.html',
  '/work/free-ai-mixer.html',
  '/brief-builder.html'
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
    for (const route of ['/', '/services.html', '/work.html', '/about.html', '/approach.html', '/team.html', '/products.html', '/products/strideto.html', '/products/regexlab.html', '/products/jotjson.html', '/products/siteintel-pulse.html', '/products/free-ai-mixer.html', '/automation.html', '/contact.html', '/privacy.html', '/terms.html', '/disclaimer.html', '/work/regexlab.html', '/work/jotjson.html', '/work/siteintel-pulse.html', '/work/free-ai-mixer.html']) {
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
    await expect(page).toHaveURL(/services[.]html$/);
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
    await page.locator('select[name="interest"]').selectOption({ label: 'Software & website development' });
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
    await page.getByLabel('What can we help with?').selectOption({ label: 'Software & website development' });
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
    expect(contents).toContain('Software & website development');
    expect(contents).toContain('Please build a local draft');
    expect(contents).toContain('was not submitted');

    await page.getByRole('button', { name: 'Copy inquiry' }).click();
    await expect(page.locator('#local-inquiry-status')).toContainText(/copied to the clipboard|download your inquiry instead/i);
    expect(postRequests).toEqual([]);
  });



  test('project showcases expose the verified source links and do not imply an unconfirmed demo', async ({ page }) => {
    await page.goto('/work.html');
    const stridetoCard = page.locator('[data-project-card]').filter({ hasText: 'STRIDETO' });
    await expect(stridetoCard.getByRole('link', { name: /View source/i })).toHaveAttribute('href', 'https://github.com/Hafiz-Hamza-Liaqat/Strideto');

    const regexCard = page.locator('[data-project-card]').filter({ hasText: 'RegexLab' });
    await expect(regexCard.getByRole('link', { name: /View source/i })).toHaveAttribute('href', 'https://github.com/Hafiz-Hamza-Liaqat/RegexLab');

    const mixerCard = page.locator('[data-project-card]').filter({ hasText: 'Free AI Mixer' });
    await expect(mixerCard.getByRole('link', { name: /View source/i })).toHaveAttribute('href', 'https://github.com/hamza131zara/Free-AI-Mixer');

    await page.goto('/work/free-ai-mixer.html');
    await expect(page.locator('.case-study-aside')).toContainText(/No public demo confirmed/i);
    await expect(page.getByRole('link', { name: /View public source/i })).toHaveAttribute('rel', /noopener noreferrer/);
  });

  test('service divisions have working anchors and the finder carries its choice', async ({ page }) => {
    await page.goto('/services.html');
    for (const id of ['software','ai','web3','design','growth','ecommerce']) await expect(page.locator('#'+id)).toHaveCount(1);
    for (const href of ['services/software-engineering.html','services/ai-automation.html','services/blockchain-web3.html','services/creative-design.html','services/digital-growth.html','services/ecommerce-operations.html']) await expect(page.locator('a[href="'+href+'"]')).toHaveCount(1);
    const result = page.locator('#service-finder-result');
    await expect(result).toBeHidden();
    await page.locator('input[name="serviceNeed"][value="Blockchain & Web3"]').check();
    await expect(result).toBeVisible();
    await expect(page.locator('#service-finder-result-title')).toHaveText('Blockchain and Web3 engineering');
    await expect(page.locator('#service-finder-status')).toContainText(/Blockchain and Web3 engineering/i);
    await expect(page.locator('#service-finder-brief')).toHaveAttribute('href','brief-builder.html?service=Blockchain%20%26%20Web3');
    await expect(page.locator('#service-finder-contact')).toHaveAttribute('href','contact.html?service=Blockchain%20%26%20Web3');
    await expect(page.locator('#service-finder-related a')).toHaveCount(2);
    await expect(page.locator('#service-finder-related a').nth(0)).toHaveAttribute('href','services/software-engineering.html');
    await expect(page.locator('#service-finder-related a').nth(1)).toHaveAttribute('href','services/ai-automation.html');
    await page.getByRole('link',{name:/Build a project brief/i}).click();
    await expect(page).toHaveURL(/brief-builder\.html\?service=Blockchain%20%26%20Web3$/);
    await expect(page.locator('#brief-service')).toHaveValue('Blockchain & Web3');
  });

  test('six service detail pages explain delivery, scope and common questions', async ({ page }) => {
    const routes = [
      '/services/software-engineering.html',
      '/services/ai-automation.html',
      '/services/blockchain-web3.html',
      '/services/creative-design.html',
      '/services/digital-growth.html',
      '/services/ecommerce-operations.html'
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('.service-next-section')).toBeVisible();
      await expect(page.locator('.service-process-grid article')).toHaveCount(4);
      await expect(page.locator('.service-faq-block .faq-list details')).toHaveCount(3);
      const links = page.locator('.service-related-block li a');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href).toMatch(/^[a-z0-9-]+\.html$/);
        const response = await page.request.get(new URL(href, page.url()).toString());
        expect(response.status(), route + ' related link ' + href).toBe(200);
      }
    }
  });

  test('service detail pages reflow without horizontal overflow at every review breakpoint', async ({ page }) => {
    const routes = [
      '/services/software-engineering.html',
      '/services/ai-automation.html',
      '/services/blockchain-web3.html',
      '/services/creative-design.html',
      '/services/digital-growth.html',
      '/services/ecommerce-operations.html'
    ];
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route);
        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth
        }));
        expect(dimensions.document, route + ' horizontal overflow at ' + width + 'px')
          .toBeLessThanOrEqual(dimensions.viewport);
        await expect(page.locator('.service-process-grid')).toBeVisible();
        await expect(page.locator('.service-faq-block .faq-list details').first()).toBeVisible();
      }
    }
  });

  test('service FAQs retain native keyboard-operable disclosure behavior', async ({ page }) => {
    await page.goto('/services/software-engineering.html');
    const firstFaq = page.locator('.service-faq-block .faq-list details').first();
    const summary = firstFaq.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(firstFaq).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(firstFaq).not.toHaveAttribute('open', '');
  });

  test('team page does not publish unverified numerical credentials or team size', async ({ page }) => {
    await page.goto('/team.html');
    const body = await page.locator('main').innerText();
    expect(body).not.toMatch(/8\+ years|bachelor'?s degree in graphic design|10\+ team members/i);
    await expect(page.locator('.team-profile-note')).toContainText(/consent and owner approval/i);
  });

  test('homepage 3D service map links to all six dedicated service pages', async ({ page }) => {
    await page.goto('/');
    const atlas=page.locator('#service-atlas');
    await expect(atlas).toBeVisible();
    for (const href of ['services/software-engineering.html','services/ai-automation.html','services/blockchain-web3.html','services/creative-design.html','services/digital-growth.html','services/ecommerce-operations.html']) await expect(atlas.locator('a[href="'+href+'"]')).toHaveCount(1);
    await expect(atlas).toContainText('INTERACTIVE CSS 3D MAP');
  });

  test('SDC 3D hub uses the official shield and the primary button follows the approved hover palette', async ({ page }) => {
    await page.goto('/');
    const atlasLogo = page.locator('#service-atlas .atlas-hub-logo');
    await expect(atlasLogo).toHaveAttribute('src', '/assets/brand/sdc-logo.webp');
    await expect(atlasLogo).toHaveAttribute('alt', 'Software Damage Control shield');
    expect(await atlasLogo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.locator('#service-atlas .atlas-hub-mark')).toHaveCount(0);

    const primary = page.locator('.button-light').first();
    await primary.hover();
    expect(await primary.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(66, 133, 244)');
    expect(await primary.evaluate(el => getComputedStyle(el).color)).toBe('rgb(23, 27, 34)');
    const dark = page.locator('.button-dark').first();
    await dark.hover();
    expect(await dark.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(179, 38, 30)');
    expect(await dark.evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
  });

  test('portfolio filter hover uses the approved blue interaction state', async ({ page }) => {
    await page.goto('/work.html');
    const filter = page.getByRole('button', { name: 'Developer tools' });
    await filter.hover();
    expect(await filter.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(234, 242, 255)');
    expect(await filter.evaluate(el => getComputedStyle(el).borderColor)).toBe('rgb(66, 133, 244)');
    expect(await filter.evaluate(el => getComputedStyle(el).color)).toBe('rgb(23, 27, 34)');
  });

  test('service atlas orbit and globe motion pause for interaction and respect reduced motion', async ({ page }) => {
    await page.goto('/');
    const atlas = page.locator('#service-atlas');
    const orbit = atlas.locator('.atlas-orbit');
    const globe = atlas.locator('.atlas-globe');

    await expect(orbit).toBeVisible();
    await expect(globe).toHaveAttribute('aria-hidden', 'true');
    expect(await orbit.evaluate(el => getComputedStyle(el).animationName)).toBe('atlas-orbit-spin');
    expect(await globe.evaluate(el => getComputedStyle(el, '::before').animationName)).toBe('atlas-globe-drift');

    await atlas.hover();
    expect(await orbit.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');

    await page.mouse.move(0, 0);
    const firstLink = atlas.locator('.atlas-node').first();
    await firstLink.focus();
    expect(await orbit.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
    expect(await firstLink.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await orbit.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
    expect(await globe.evaluate(el => getComputedStyle(el, '::before').animationName)).toBe('none');
    expect(await atlas.locator('.atlas-ring-one').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  });

  test('all six service cards stay inside the spatial map at every review breakpoint', async ({ page }) => {
    const nodes = ['.atlas-software', '.atlas-ai', '.atlas-web3', '.atlas-ecommerce', '.atlas-design', '.atlas-growth'];
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const frame = await page.locator('#service-atlas').boundingBox();
      expect(frame, 'map frame should be measurable at ' + width + 'px').not.toBeNull();
      for (const selector of nodes) {
        const card = await page.locator('#service-atlas ' + selector).boundingBox();
        expect(card, selector + ' should have a visible layout box at ' + width + 'px').not.toBeNull();
        expect(card.x, selector + ' should not be clipped on the left at ' + width + 'px').toBeGreaterThanOrEqual(frame.x - 1);
        expect(card.x + card.width, selector + ' should not be clipped on the right at ' + width + 'px').toBeLessThanOrEqual(frame.x + frame.width + 1);
      }
    }
  });

  test('tablet navigation collapses cleanly and remains usable at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(toggle).toBeVisible();
    await expect(nav).not.toBeVisible();
    await toggle.click();
    await expect(nav.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await nav.getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/services[.]html$/);
    await expect(nav).not.toBeVisible();
  });

  test('portfolio search, category and status filters combine and reset', async ({ page }) => {
    await page.goto('/work.html');
    const visibleCards = page.locator('[data-project-card]:visible');
    await expect(page.locator('[data-project-card]')).toHaveCount(5);
    await expect(page.locator('#project-result-count')).toContainText('all 5 projects');
    const expectedCards = [
      ['strideto','Platform','Live'],
      ['regexlab','Developer tool','Live demo'],
      ['jotjson','Developer tool','Live demo'],
      ['siteintel-pulse','AI & intelligence','In development'],
      ['free-ai-mixer','AI & intelligence','In development']
    ];
    for (const [id, type, status] of expectedCards) {
      const card = page.locator('[data-project-card][data-project-id="' + id + '"]');
      await expect(card).toHaveCount(1);
      await expect(card.locator('.project-meta')).toContainText(type);
      await expect(card.locator('.project-status-chip')).toHaveText(status);
      await expect(card.getByRole('link', { name: /Read project notes/i })).toHaveAttribute('href', 'work/' + id + '.html');
    }

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

  test('product catalogue search, category and availability filters are truthful and reset cleanly', async ({ page }) => {
    await page.goto('/products.html');
    const cards = page.locator('[data-product-card]');
    const visibleCards = page.locator('[data-product-card]:visible');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('#product-result-count')).toHaveText('Showing all 6 products.');
    expect(await cards.evaluateAll(nodes => nodes.map(node => node.dataset.productId))).toEqual([
      'strideto', 'regexlab', 'jotjson', 'siteintel-pulse', 'free-ai-mixer', 'auto-trading-agent'
    ]);

    const expected = [
      ['strideto','platform','public','LIVE · FREE TO USE'],
      ['regexlab','developer-tool','public','PUBLIC TOOL'],
      ['jotjson','developer-tool','public','PUBLIC TOOL'],
      ['siteintel-pulse','ai-intelligence','development','IN DEVELOPMENT'],
      ['free-ai-mixer','ai-intelligence','development','IN DEVELOPMENT'],
      ['auto-trading-agent','research','unavailable','NOT AVAILABLE']
    ];
    for (const [id, category, status, label] of expected) {
      const card = page.locator('[data-product-card][data-product-id="' + id + '"]');
      await expect(card).toHaveCount(1);
      await expect(card).toHaveAttribute('data-category', category);
      await expect(card).toHaveAttribute('data-status', status);
      await expect(card.locator('.product-status')).toContainText(label);
    }

    await page.getByRole('button', { name: 'Developer tools' }).click();
    await expect(visibleCards).toHaveCount(2);
    await expect(page.locator('#product-result-count')).toHaveText('Showing 2 of 6 products.');

    await page.getByRole('searchbox', { name: 'Search products' }).fill('JotJSON');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('local-first JSON toolkit');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(visibleCards).toHaveCount(6);

    await page.getByRole('button', { name: 'AI & intelligence' }).focus();
    await page.keyboard.press('Enter');
    await expect(visibleCards).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'AI & intelligence' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByLabel('Availability').selectOption('development');
    await expect(visibleCards).toHaveCount(2);
    await page.getByRole('searchbox', { name: 'Search products' }).fill('SiteIntel');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('static showcase');

    await page.getByRole('button', { name: 'Research / future' }).click();
    await page.getByRole('searchbox', { name: 'Search products' }).fill('');
    await page.getByLabel('Availability').selectOption('unavailable');
    await expect(visibleCards).toHaveCount(1);
    const gated = page.locator('[data-product-id="auto-trading-agent"]');
    await expect(gated).toContainText('not available to buy or install');
    await expect(gated.getByRole('link', { name: /buy|install/i })).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Search products' }).fill('no-matching-product-xyz');
    await expect(visibleCards).toHaveCount(0);
    await expect(page.locator('#product-empty-state')).toBeVisible();
    await expect(page.locator('#product-result-count')).toHaveText('Showing 0 of 6 products.');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(visibleCards).toHaveCount(6);
    await expect(page.locator('#product-empty-state')).toBeHidden();
    await expect(page.locator('#product-result-count')).toHaveText('Showing all 6 products.');
    await expect(page.getByRole('button', { name: 'All products' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Availability')).toHaveValue('all');
  });

  test('five public product detail pages share a complete and navigable structure', async ({ page }) => {
    const products = [
      ['/products/strideto.html', 'strideto', 'STRIDETO', 'LIVE · FREE TO USE', 'Visit STRIDETO'],
      ['/products/regexlab.html', 'regexlab', 'RegexLab', 'PUBLIC BROWSER TOOL', 'Open RegexLab'],
      ['/products/jotjson.html', 'jotjson', 'JotJSON', 'PUBLIC BROWSER TOOL', 'Open JotJSON'],
      ['/products/siteintel-pulse.html', 'siteintel-pulse', 'SiteIntel Pulse', 'IN DEVELOPMENT', 'View static showcase'],
      ['/products/free-ai-mixer.html', 'free-ai-mixer', 'Free AI Mixer', 'IN DEVELOPMENT', 'View source repository']
    ];
    const sections = ['overview', 'capabilities', 'availability', 'data-security', 'requirements', 'commercial'];

    for (const [route, id, name, status, action] of products) {
      await page.goto(route);
      const main = page.locator('main.product-detail-page[data-product-detail-version="1"]');
      await expect(main).toBeVisible();
      await expect(main).toHaveAttribute('data-product-id', id);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await expect(main.locator('.product-status')).toContainText(status);

      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '../products.html');
      await expect(breadcrumb).toContainText(name);

      const toc = page.getByRole('navigation', { name: 'Product detail sections' });
      await expect(toc).toBeVisible();
      for (const section of sections) {
        await expect(main.locator('#' + section)).toBeVisible();
        await expect(toc.locator('a[href="#' + section + '"]')).toHaveCount(1);
      }
      await expect(main.locator('.product-detail-facts')).toBeVisible();
      await expect(main.locator('.product-detail-disclosure')).toContainText('not an independent production test');

      if (id === 'siteintel-pulse') {
        await expect(main).toContainText('static design showcase');
        await expect(main).toContainText('full interactive scanner');
      }
      if (id === 'free-ai-mixer') {
        await expect(main).toContainText('No hosted public application or working generation API endpoint is confirmed');
        await expect(main).toContainText('protected credential handling');
      }
      await expect(main.getByRole('link', { name: new RegExp(action, 'i') }).first()).toBeVisible();
    }

    await page.goto('/products.html');
    for (const [, id] of products) {
      await expect(page.locator('[data-product-id="' + id + '"]').getByRole('link', { name: 'Product details' }))
        .toHaveAttribute('href', 'products/' + id + '.html');
    }
    const gated = page.locator('[data-product-id="auto-trading-agent"]');
    await expect(gated.getByRole('link', { name: /product details/i })).toHaveCount(0);
  });

  test('product pages disclose release decisions and never imply unapproved installability', async ({ page }) => {
    const routes = [
      ['/products/strideto.html', 'Hosted reference platform only'],
      ['/products/regexlab.html', 'Public browser tool only'],
      ['/products/jotjson.html', 'Public browser tool only'],
      ['/products/siteintel-pulse.html', 'In development'],
      ['/products/free-ai-mixer.html', 'In development']
    ];
    for (const [route, disposition] of routes) {
      await page.goto(route);
      const releaseNote = page.locator('.product-release-note');
      await expect(releaseNote).toBeVisible();
      await expect(releaseNote).toContainText('Release decision');
      await expect(releaseNote).toContainText(disposition);
      await expect(page.getByRole('link', { name: /buy now|install now|purchase/i })).toHaveCount(0);
    }

    await page.goto('/products.html');
    const gated = page.locator('[data-product-id="auto-trading-agent"]');
    await expect(gated).toContainText('NOT AVAILABLE');
    await expect(gated.getByRole('link', { name: /product details|buy now|install now|purchase/i })).toHaveCount(0);
  });

  test('project brief builder creates a local draft and supports text download', async ({ page }) => {
    const serviceRequests = [];
    page.on('request', request => {
      if (request.url().includes('/contact.php') || request.url().includes('/api/')) serviceRequests.push(request.url());
    });
    await page.goto('/brief-builder.html');
    expect(await page.locator('#brief-form').evaluate(form => form.checkValidity())).toBe(false);
    await page.getByLabel('Main area of help').selectOption({ label: 'AI, LLM & intelligent automation' });
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
    expect(generatedBrief).toContain('AI, LLM & intelligent automation');
    expect(generatedBrief).toContain('Security and privacy');
    expect(generatedBrief).toContain('AI quality and evaluation');
    await expect(page.locator('#brief-status')).toContainText('generated in this browser tab');
    await expect(page.getByRole('button', { name: 'Copy brief' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeEnabled();

    await page.evaluate(() => {
      window.__printCalledForTest = false;
      window.print = () => { window.__printCalledForTest = true; };
    });
    await page.getByRole('button', { name: 'Print / Save PDF' }).click();
    await expect(page.locator('#brief-print-content')).toContainText('Support Assistant');
    expect(await page.evaluate(() => window.__printCalledForTest)).toBe(true);

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
    expect(structured.project.service).toBe('AI, LLM & intelligent automation');
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
    await page.getByLabel('Main area of help').selectOption({ label: 'Software & website development' });
    await page.getByLabel('Where are you now?').selectOption({ label: 'Exploring an idea' });
    await page.getByLabel('Goal or problem to solve').fill('We need a responsive portal to help our customers manage requests.');
    await page.getByRole('button', { name: 'Generate project brief' }).click();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeEnabled();
    await page.getByRole('button', { name: 'Reset answers' }).click();
    await expect(page.getByRole('button', { name: 'Download .txt' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Print / Save PDF' })).toBeDisabled();
    await expect(page.getByLabel('Generated project brief')).toHaveValue('');
  });


  test('project brief handoff prefills contact form but never submits the inquiry', async ({ page }) => {
    const postRequests = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/contact.php')) postRequests.push(request.url());
    });
    await page.goto('/brief-builder.html');
    await page.getByLabel('Main area of help').selectOption({ label: 'Software & website development' });
    await page.getByLabel('Where are you now?').selectOption({ label: 'Exploring an idea' });
    await page.getByLabel('Goal or problem to solve').fill('Build a customer portal where clients can track their service requests.');
    await page.getByLabel('Project name').fill('Contact handoff test');
    await page.getByRole('button', { name: 'Generate project brief' }).click();
    await page.getByRole('button', { name: /Continue to contact/i }).click();

    await expect(page).toHaveURL(/contact\.html\?service=Software%20%26%20website%20development&from=brief-builder$/);
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/Contact handoff test/);
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/customer portal/);
    await expect(page.locator('#form-status')).toContainText(/inquiry has not been sent/i);
    expect(await page.evaluate(() => sessionStorage.getItem('agency-project-brief-draft'))).toBeNull();
    expect(postRequests).toEqual([]);
  });

  test('terms and disclaimer drafts are reachable, clearly marked, and not indexable', async ({ page }) => {
    for (const [route, heading] of [['/privacy.html','Privacy, in'],['/terms.html','Clear terms for'],['/disclaimer.html','Know what the']]) {
      await page.goto(route);
      await expect(page.locator('h1')).toContainText(heading);
      await expect(page.locator('.legal-status').first()).toContainText(/DRAFT NOTICE|DRAFT ONLY|DRAFT TERMS|DRAFT DISCLAIMER/i);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
      await expect(page.locator('footer a[href="/terms.html"], footer a[href="../terms.html"], footer a[href="terms.html"]')).toHaveCount(1);
    }
  });

  test('footer exposes privacy, terms and disclaimer from the platform pages', async ({ page }) => {
    for (const route of PAGES) {
      await page.goto(route);
      await expect(page.locator('footer a[href$="terms.html"]')).toHaveCount(1);
      await expect(page.locator('footer a[href$="disclaimer.html"]')).toHaveCount(1);
      await expect(page.locator('footer a[href$="privacy.html"]')).toHaveCount(1);
    }
  });

  test('3D service map links are keyboard reachable and respect reduced motion', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero-actions a').last().focus();
    await page.keyboard.press('Tab');
    const links = page.locator('#service-atlas .atlas-node');
    await expect(links).toHaveCount(6);
    for (let i=0;i<6;i++) {
      await expect(links.nth(i)).toBeFocused();
      if (i<5) await page.keyboard.press('Tab');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const transition = await links.first().evaluate(el => getComputedStyle(el).transitionDuration);
    expect(Number.parseFloat(transition)).toBeLessThanOrEqual(0.00001);
  });

  test('each service detail enquiry CTA preselects the matching contact category', async ({ page }) => {
    const services = [
      ['/services/software-engineering.html','Software & website development'],
      ['/services/ai-automation.html','AI, LLM & intelligent automation'],
      ['/services/blockchain-web3.html','Blockchain & Web3'],
      ['/services/creative-design.html','Graphic design & creative services'],
      ['/services/digital-growth.html','Digital marketing & growth'],
      ['/services/ecommerce-operations.html','E-commerce & marketplace operations']
    ];
    for (const [route, service] of services) {
      await page.goto(route);
      await page.getByRole('link', { name: /Discuss this service/i }).first().click();
      expect(new URL(page.url()).pathname).toBe('/contact.html');
      expect(new URL(page.url()).searchParams.has('service')).toBe(true);
      await expect(page.locator('select[name="interest"]')).toHaveValue(service);
    }
  });

  test('draft legal pages are intentionally excluded from the sitemap', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).not.toContain('/privacy.html');
    expect(xml).not.toContain('/terms.html');
    expect(xml).not.toContain('/disclaimer.html');
  });

  test('mobile visitors can tap a service-map node and reach its detail page', async ({ page }) => {
    const context = await page.context().browser().newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await context.newPage();
    await mobilePage.goto('/');
    // Keep pointer-action checks deterministic while the separate orbit tests cover motion.
    await mobilePage.emulateMedia({ reducedMotion: 'reduce' });
    await mobilePage.locator('#service-atlas .atlas-software .atlas-node').tap();
    await mobilePage.waitForURL(url => url.pathname === '/services/software-engineering.html');
    expect(new URL(mobilePage.url()).pathname).toBe('/services/software-engineering.html');
    await expect(mobilePage.locator('h1')).toContainText('Websites and platforms');
    await context.close();
  });

  test('service and project detail pages provide working breadcrumbs', async ({ page }) => {
    const routes = [
      ['/services/software-engineering.html','/services.html'],
      ['/services/ai-automation.html','/services.html'],
      ['/services/blockchain-web3.html','/services.html'],
      ['/services/creative-design.html','/services.html'],
      ['/services/digital-growth.html','/services.html'],
      ['/services/ecommerce-operations.html','/services.html'],
      ['/work/strideto.html','/work.html'],
      ['/work/regexlab.html','/work.html'],
      ['/work/jotjson.html','/work.html'],
      ['/work/siteintel-pulse.html','/work.html'],
      ['/work/free-ai-mixer.html','/work.html']
    ];
    for (const [route,parent] of routes) {
      await page.goto(route);
      await expect(page.locator('.breadcrumb')).toBeVisible();
      await expect(page.locator('.breadcrumb a').first()).toHaveAttribute('href', route.startsWith('/services/') ? '../index.html' : '../index.html');
      await expect(page.locator('.breadcrumb a').nth(1)).toHaveAttribute('href', parent === '/services.html' ? '../services.html' : '../work.html');
      await expect(page.locator('.breadcrumb [aria-current="page"]')).toBeVisible();
    }
  });

  test('404 page is noindex and excluded from the sitemap', async ({ page }) => {
    await page.goto('/404.html');
    const heading = (await page.locator('h1').innerText())
      .replaceAll(String.fromCharCode(10), '')
      .replaceAll(String.fromCharCode(13), '')
      .replaceAll(' ', '')
      .toLowerCase();
    expect(heading).toBe('thispagetookawrongturn.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
    const response = await page.request.get('/sitemap.xml');
    const xml = await response.text();
    expect(xml).not.toContain('/404.html');
  });

  test('public pages do not expose internal release-phase labels', async ({ page }) => {
    for (const route of PAGES) {
      await page.goto(route);
      const visibleText = await page.locator('body').innerText();
      expect(visibleText, 'Internal release labels must stay in project documentation: ' + route)
        .not.toMatch(/\\bPHASE\\s*[12]\\b/i);
    }
  });


  test('portfolio catalogue exposes five unique, evidence-governed project records', async ({ page }) => {
    await page.goto('/work.html');
    const cards = page.locator('[data-project-card]');
    await expect(cards).toHaveCount(5);
    const ids = await cards.evaluateAll(items => items.map(item => item.dataset.projectId));
    expect(ids).toEqual(['strideto', 'regexlab', 'jotjson', 'siteintel-pulse', 'free-ai-mixer']);
    expect(new Set(ids).size).toBe(5);
    for (const card of await cards.all()) {
      await expect(card.locator('.project-copy h2')).toBeVisible();
      await expect(card.locator('.project-links a').first()).toHaveAttribute('href', /work\//);
      expect(await card.getAttribute('data-status')).toMatch(/^(live|development)$/);
    }
    await expect(page.locator('#project-result-count')).toHaveText('Showing all 5 projects.');
    await page.getByLabel('Search projects').fill('trading');
    await expect(page.locator('[data-project-card]:visible')).toHaveCount(0);
    await expect(page.locator('#project-empty-state')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('[data-project-card]:visible')).toHaveCount(5);
    await expect(page.locator('#project-empty-state')).toBeHidden();
  });



  test('project notes share a navigable case-study structure and semantic breadcrumbs', async ({ page }) => {
    const routes = ['/work/strideto.html', '/work/regexlab.html', '/work/jotjson.html', '/work/siteintel-pulse.html', '/work/free-ai-mixer.html'];
    const sections = [
      ['project-context', 'Context'],
      ['project-scope', 'Scope & approach'],
      ['project-details', 'Implementation details']
    ];

    for (const route of routes) {
      await page.goto(route);
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '../work.html');

      const article = page.locator('article[data-case-study-version="1"]');
      await expect(article).toBeVisible();
      const toc = page.getByRole('navigation', { name: 'On this page' });
      await expect(toc).toBeVisible();

      for (const [id, label] of sections) {
        await expect(article.locator('#' + id)).toBeVisible();
        await expect(toc.getByRole('link', { name: label })).toHaveAttribute('href', '#' + id);
      }

      await toc.getByRole('link', { name: 'Scope & approach' }).click();
      await expect(page).toHaveURL(/#project-scope$/);
    }
  });

  test('all project notes expose consistent evidence and attribution boundaries', async ({ page }) => {
    const routes = ['/work/strideto.html','/work/regexlab.html','/work/jotjson.html','/work/siteintel-pulse.html','/work/free-ai-mixer.html'];
    for (const route of routes) {
      await page.goto(route);
      const panel = page.locator('.project-evidence-panel');
      await expect(panel).toBeVisible();
      await expect(panel.getByRole('heading', { name: /What this page can verify/i })).toBeVisible();
      await expect(panel.locator('dt')).toHaveText(['Release status','Project relationship','Evidence boundary']);
      await expect(panel.getByText(/agency delivery/i).first()).toBeVisible();
      await expect(panel.getByRole('navigation', { name: 'Related portfolio projects' })).toBeVisible();
      await expect(panel.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '../work.html');
    }
  });

});
