const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.route('**/.netlify/functions/sdc-chat', async route => {
    const request = route.request();
    const payload = request.postDataJSON();
    const lastUserMessage = payload.messages.filter(message => message.role === 'user').at(-1)?.content || '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reply: 'For your project, Software & Digital Product Engineering is a likely fit. If marketplace operations are central, E-commerce & Marketplace Operations may complement it. ' +
          'To narrow the recommendation: ' + lastUserMessage
      })
    });
  });
});

test('SDC AI assistant loads on the homepage and guides a visitor through a service question', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open SDC AI Assistant' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  await expect(page.getByRole('dialog', { name: 'SDC AI Assistant' })).toBeVisible();
  await expect(page.getByText(/Hello, I'm the SDC AI Assistant/i)).toBeVisible();
  await page.getByRole('button', { name: 'Help me choose the right service' }).click();
  await expect(page.getByText(/Software & Digital Product Engineering is a likely fit/i)).toBeVisible();
  await expect(page.getByText(/marketplace operations are central/i)).toBeVisible();
});

test('chat messages are rendered as text and never interpreted as HTML', async ({ page }) => {
  await page.route('**/.netlify/functions/sdc-chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: '<img src=x onerror=window.__sdcXss=true> This is plain text.' })
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open SDC AI Assistant' }).click();
  const input = page.getByLabel('Message the SDC AI Assistant');
  await input.fill('Can you explain your service options?');
  await page.getByRole('button', { name: 'Send message' }).click();
  const bubble = page.locator('.sdc-chat-message--assistant .sdc-chat-bubble').last();
  await expect(bubble).toContainText('<img src=x onerror=window.__sdcXss=true>');
  await expect(page.locator('.sdc-chat-message--assistant img[onerror]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__sdcXss)).toBeUndefined();
});

test('explicit chat handoff pre-fills an editable Contact draft without submitting it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open SDC AI Assistant' }).click();
  const input = page.getByLabel('Message the SDC AI Assistant');
  await input.fill('I want to build a multi-vendor booking marketplace for local service providers.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(/Software & Digital Product Engineering is a likely fit/i)).toBeVisible();

  await page.getByRole('button', { name: 'Prepare a project brief' }).click();
  await expect(page).toHaveURL(/contact\.html\?from=chatbot/);
  const message = page.locator('#message');
  await expect(message).toHaveValue(/PROJECT CONTEXT FROM SDC AI ASSISTANT/);
  await expect(message).toHaveValue(/multi-vendor booking marketplace/);
  await expect(page.getByText(/editable draft.*Nothing has been sent yet/i)).toBeVisible();
  await expect(page.locator('#inquiry-form')).toBeVisible();
});

test('chat panel remains inside the viewport on narrow mobile screens', async ({ page }) => {
  for (const width of [320, 360, 390, 560, 768]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open SDC AI Assistant' }).click();
    const panel = await page.locator('#sdc-chat-panel').boundingBox();
    expect(panel, 'chat panel should have a layout box at ' + width + 'px').not.toBeNull();
    expect(panel.x).toBeGreaterThanOrEqual(-1);
    expect(panel.y).toBeGreaterThanOrEqual(-1);
    expect(panel.x + panel.width).toBeLessThanOrEqual(width + 1);
    expect(panel.y + panel.height).toBeLessThanOrEqual(820 + 1);
    await expect(page.getByLabel('Message the SDC AI Assistant')).toBeVisible();
  }
});

test('the chatbot asset loads on nested service pages as well as root pages', async ({ page }) => {
  await page.goto('/services/ai-automation.html');
  await expect(page.getByRole('button', { name: 'Open SDC AI Assistant' })).toBeVisible();
  await page.getByRole('button', { name: 'Open SDC AI Assistant' }).click();
  await expect(page.getByRole('dialog', { name: 'SDC AI Assistant' })).toBeVisible();
  await expect(page.getByLabel('Message the SDC AI Assistant')).toBeVisible();
});
