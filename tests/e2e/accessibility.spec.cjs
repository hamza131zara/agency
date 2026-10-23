const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PAGES = [
  '/', '/services.html', '/work.html', '/about.html', '/contact.html', '/privacy.html',
  '/404.html', '/work/strideto.html', '/work/regexlab.html', '/work/jotjson.html',
  '/work/siteintel-pulse.html', '/work/free-ai-mixer.html'
];

for (const route of PAGES) {
  test('automated WCAG accessibility scan: ' + route, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; }' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const materialViolations = results.violations.filter(item =>
      item.impact === 'critical' || item.impact === 'serious'
    );
    expect(
      materialViolations.map(item => ({
        id: item.id,
        impact: item.impact,
        description: item.help,
        nodes: item.nodes.map(node => ({
          target: node.target,
          summary: node.failureSummary
        }))
      })),
      'WCAG accessibility violations on ' + route
    ).toEqual([]);
  });
}
