const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PAGES = [
  '/', '/services.html', '/work.html', '/about.html', '/contact.html', '/privacy.html',
  '/404.html', '/work/strideto.html', '/work/regexlab.html', '/work/jotjson.html',
  '/work/siteintel-pulse.html', '/work/free-ai-mixer.html', '/brief-builder.html'
];

for (const route of PAGES) {
  test('automated WCAG accessibility scan: ' + route, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    // Wait until the real site stylesheet is loaded before measuring computed colors.
    await page.waitForFunction(() => {
      const stylesheet = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .find(link => /assets\/css\/styles\.css/.test(link.href));
      return Boolean(stylesheet && stylesheet.sheet);
    });
    // About-page contrast depends on this rule; assert it has taken effect before running axe.
    await page.waitForFunction(() => {
      const processNumber = document.querySelector('.approach-list article > span');
      return !processNumber || getComputedStyle(processNumber).color === 'rgb(80, 88, 78)';
    });
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; } .reveal { opacity: 1 !important; transform: none !important; }' });
    await page.waitForFunction(() => {
      const reveal = document.querySelector('.reveal');
      if (!reveal) return true;
      const style = getComputedStyle(reveal);
      return style.opacity === '1' && style.transitionDuration.split(',').every(value => Number.parseFloat(value) === 0);
    });
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
