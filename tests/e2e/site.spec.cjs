const { test, expect } = require('@playwright/test');

const PAGES = [
  '/', '/services.html', '/work.html', '/about.html', '/contact.html',
  '/privacy.html', '/404.html', '/work/strideto.html', '/work/regexlab.html',
  '/work/jotjson.html', '/work/siteintel-pulse.html', '/work/free-ai-mixer.html'
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
        links.filter(link => !/\\bnoopener\\b/.test(link.rel) || !/\\bnoreferrer\\b/.test(link.rel))
          .map(link => ({ href: link.href, rel: link.rel }))
      );
      expect(unsafeLinks, 'Unsafe target=_blank links on ' + route).toEqual([]);
    }
  });

  test('home-page mobile navigation opens, closes with Escape, and follows links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open navigation' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/\\/services\\.html$/);
    await expect(page.locator('#primary-nav')).not.toBeVisible();
  });

  test('skip link receives the first keyboard focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
  });

  test('inquiry page labels fields and reports missing mail configuration honestly', async ({ page }) => {
    await page.goto('/contact.html');
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('What can we help with?')).toBeVisible();
    await expect(page.getByLabel('A little about the project')).toBeVisible();
    await expect(page.locator('#form-status')).toContainText(/inbox is not configured/i);

    await page.locator('input[name="name"]').fill('Test Visitor');
    await page.locator('input[name="email"]').fill('visitor@example.org');
    await page.locator('select[name="interest"]').selectOption({ label: 'Full-stack development' });
    await page.locator('textarea[name="message"]').fill('This is a browser smoke test and must never be delivered.');
    await page.getByRole('button', { name: /send inquiry/i }).click();
    await expect(page.locator('#form-status')).toContainText(/your inquiry has not been sent/i);
    await expect(page.locator('#form-status')).not.toContainText(/accepted by the website mail service/i);
  });
});
