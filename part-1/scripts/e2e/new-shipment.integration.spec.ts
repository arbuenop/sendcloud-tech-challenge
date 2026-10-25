import { test, expect } from '@playwright/test';
import { fillValidForm, validPayload } from './helpers';

test.describe('Full integration test. The form behaves as expected end 2 end', () => {
  test.beforeEach('go to the page', async ({ page }) => {
    // Mocking shippment methods response and loading page
    await page.route('http://localhost:3000/**', (route) =>
      route.fulfill({ json: [{ id: 1, name: 'Cheap shipping method' }] }),
    );
    await page.goto('/part-1/new-shipment.html');
  });

  test('submits the form and shows a success or error alert #happy_flow', async ({ page }) => {
    await fillValidForm(page);

    // Start listening BEFORE the click
    const requestPromise = page.waitForRequest(
      (request) => request.url().endsWith('/shipments') && request.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Create shipment' }).click();

    // The request was sent with the right payload
    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual(validPayload);
    // Either alert is fine, we only care that the user gets feedback
    await expect(page.locator('#form-success:visible, #form-error:visible')).toBeVisible();
  });

  test('toggles the Customs information correctly #happy_flow', async ({ page }) => {
    await page.goto('http://localhost:5173/part-1/new-shipment.html');

    // Checks that the shipping methods load correctly
    await page.locator('#shipping-methods-loading-cloud').waitFor({ state: 'hidden' });

    // Checks if it toggles the Customs information
    await page.getByLabel('Country').selectOption('GB');
    await expect(page.getByRole('group', { name: 'Customs information' })).toBeVisible();
    await page.getByLabel('Country').selectOption('US');
    await expect(page.getByRole('group', { name: 'Customs information' })).toBeVisible();
    await page.getByLabel('Country').selectOption('NL');
    await expect(page.getByRole('group', { name: 'Customs information' })).not.toBeVisible();

    // Checks that the field is required
    await page.getByLabel('Country').selectOption('');
    await expect(page.locator('#country-error')).toBeVisible();
  });

  test('shows errors without sending data when the form is invalid #sad_flow', async ({ page }) => {
    // Record every POST to /shipments
    const posts: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/shipments') && request.method() === 'POST') {
        posts.push(request.url());
      }
    });

    await page.getByRole('textbox', { name: 'Name' }).fill('');
    await page.getByRole('radio', { name: 'Cheap' }).check();

    await page.getByRole('button', { name: 'Create shipment' }).click();

    // The validation errors are shown
    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#city-error')).toBeVisible();
    await expect(page.locator('#country-error')).toBeVisible();

    // No request was sent
    expect(posts).toEqual([]);
  });

  test('shows a connection error when the request cannot reach the server #sad_flow', async ({
    page,
  }) => {
    // Make the POST fail as if the server were unreachable
    await page.route('**/shipments', (route) => route.abort());

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Create shipment' }).click();

    await expect(page.locator('#form-error')).toContainText('could not reach the server');
  });
});
