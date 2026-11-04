const { test, expect } = require('@playwright/test');

const ROUTES = [
  '/', '/services.html', '/work.html',
  '/services/software-engineering.html', '/services/ai-automation.html',
  '/services/blockchain-web3.html', '/services/creative-design.html',
  '/services/digital-growth.html', '/services/ecommerce-operations.html',
  '/about.html', '/approach.html', '/team.html', '/products.html',
  '/automation.html', '/contact.html', '/privacy.html', '/terms.html',
  '/disclaimer.html', '/404.html',
  '/work/strideto.html', '/work/regexlab.html', '/work/jotjson.html',
  '/work/siteintel-pulse.html', '/work/free-ai-mixer.html',
  '/brief-builder.html'
];
const VIEWPORTS = [
  { name: 'small mobile', width: 320, height: 780 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

test('key pages do not create document-level horizontal overflow', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
      }));
      expect(
        dimensions.document,
        route + ' has horizontal overflow at ' + viewport.name + ': ' + JSON.stringify(dimensions)
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  }
});

test('captures desktop, tablet and mobile visual-review screenshots', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const screenshots = [
    { name: 'desktop', width: 1440, height: 1000, routes: ROUTES },
    { name: 'mobile', width: 390, height: 844, routes: ROUTES },
    { name: 'small-mobile', width: 320, height: 780, routes: ['/'] },
    { name: 'tablet', width: 768, height: 1024, routes: ['/'] }
  ];
  for (const viewport of screenshots) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of viewport.routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; }' });
      const routeName = route === '/' ? 'home' : route.slice(1).replace(/\.html$/, '').replace(/\//g, '-');
      const file = routeName + '-' + viewport.name + '.png';
      await page.screenshot({ path: testInfo.outputPath(file), fullPage: true, animations: 'disabled' });
    }
  }
});
