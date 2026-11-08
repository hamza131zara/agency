const { test, expect } = require('@playwright/test');

test.describe('Phase 6 automation catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/automation.html');
  });

  test('shows agency-delivered services separately from planned self-service tools', async ({ page }) => {
    const cards = page.locator('[data-automation-card]');
    await expect(cards).toHaveCount(10);
    await expect(page.locator('#automation-result-count')).toHaveText('Showing all 10 automation capabilities.');

    const serviceCards = page.locator('[data-automation-card][data-delivery="agency-service"]');
    const plannedCards = page.locator('[data-automation-card][data-delivery="planned-tool"]');
    await expect(serviceCards).toHaveCount(4);
    await expect(plannedCards).toHaveCount(6);

    await expect(serviceCards.first().locator('.automation-delivery-status')).toHaveText('AGENCY SERVICE');
    await expect(plannedCards.first().locator('.automation-delivery-status')).toContainText('PLANNED · NOT CONNECTED');
    await expect(plannedCards.first()).toContainText('No account connection or message sending is available.');
  });

  test('filters by delivery model and workflow area, with combined search', async ({ page }) => {
    const visibleCards = page.locator('[data-automation-card]:visible');
    await page.getByLabel('Delivery model').selectOption('planned-tool');
    await expect(visibleCards).toHaveCount(6);
    await expect(page.locator('#automation-result-count')).toHaveText('Showing 6 of 10 automation capabilities.');

    await page.getByLabel('Workflow area').selectOption('integrations');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toHaveAttribute('data-automation-id', 'api-webhook-workspace');

    await page.getByRole('searchbox', { name: 'Search capabilities' }).fill('endpoint');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('event routing');

    await page.getByLabel('Delivery model').selectOption('agency-service');
    await expect(visibleCards).toHaveCount(0);
    await expect(page.locator('#automation-empty-state')).toBeVisible();
    await expect(page.locator('#automation-result-count')).toHaveText('Showing 0 of 10 automation capabilities.');
  });

  test('searches capabilities and resets every filter', async ({ page }) => {
    const visibleCards = page.locator('[data-automation-card]:visible');
    await page.getByRole('searchbox', { name: 'Search capabilities' }).fill('inventory');
    await expect(visibleCards).toHaveCount(2);
    await expect(page.locator('#automation-result-count')).toHaveText('Showing 2 of 10 automation capabilities.');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(visibleCards).toHaveCount(10);
    await expect(page.getByRole('searchbox', { name: 'Search capabilities' })).toHaveValue('');
    await expect(page.getByLabel('Delivery model')).toHaveValue('all');
    await expect(page.getByLabel('Workflow area')).toHaveValue('all');
    await expect(page.locator('#automation-empty-state')).toBeHidden();
    await expect(page.locator('#automation-result-count')).toHaveText('Showing all 10 automation capabilities.');
  });

  test('integration directory does not claim unsupported providers', async ({ page }) => {
    const directory = page.locator('#integration-directory');
    await expect(directory).toBeVisible();
    await expect(directory.locator('article')).toHaveCount(4);
    await expect(directory).toContainText('PROVIDER NOT VERIFIED');
    await expect(directory).toContainText('no provider approved');
    await expect(directory).toContainText('no production event source confirmed');
    await expect(directory).toContainText('no commerce connector verified');
    await expect(directory).toContainText('not a list of supported vendors or connected accounts');
  });

  test('automation service links preselect the correct contact service', async ({ page }) => {
    await page.locator('[data-automation-id="ai-workflow-design"]').getByRole('link', { name: /Discuss this service/i }).click();
    await expect(page).toHaveURL(/contact\.html\?service=/);
    await expect(page.getByLabel('What can we help with?')).toHaveValue('AI, LLM & intelligent automation');
  });

  test('automation route remains valid in the main navigation', async ({ page }) => {
    await expect(page).toHaveTitle('Business & AI Automation — SDC');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Main navigation"] a[aria-current="page"]')).toHaveAttribute('href', 'automation.html');
    await expect(page.getByRole('link', { name: /Discuss automation/i })).toHaveAttribute('href', /contact\.html\?service=/);
  });
});
