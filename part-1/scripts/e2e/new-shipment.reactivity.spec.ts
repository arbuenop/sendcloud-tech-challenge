import { test, expect, Page } from '@playwright/test';

/**
 * With this test I am NOT checking on the Valibot validation system. I assume that if the required/non null validation works, all the rest work too.
 * Valibot is a well tested library and this test is meant to check the View-DOM connection.
 */
test.describe('Reactivity. Only applies to the Production-grade implementation. It focuses on the communication between the DOM and the view object', () => {
  test.beforeEach('go to the page', async ({ page }) => {
    // Mocking shippment methods response and loading page
    await page.route('http://localhost:3000/**', (route) =>
      route.fulfill({ json: [{ id: 1, name: 'Fast shipping method' }] }),
    );
    await page.goto('/part-1/new-shipment.html');
  });

  test('renders an error below a text field when the value is incorrect and erases it when the form is correct again', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'Name' }).focus();
    await page.getByRole('textbox', { name: 'Name' }).fill('');
    await page.getByRole('textbox', { name: 'Name' }).blur();
    await expect(page.locator('#name-error')).toBeVisible();
    await page.getByRole('textbox', { name: 'Name' }).focus();
    await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Name' }).blur();
    await expect(page.locator('#name-error')).not.toBeVisible();
  });

  test('renders an error below a select field when the selected value is incorrect and erases it when the form is correct again', async ({
    page,
  }) => {
    const country = page.getByLabel('Country');
    const error = page.locator('#country-error');

    // Invalid: pick the empty option, then leave the field
    await country.focus();
    await country.selectOption('');
    await country.blur();
    await expect(error).toBeVisible();

    // Valid: pick a country, then leave the field
    await country.focus();
    await country.selectOption('NL');
    await country.blur();
    await expect(error).toBeHidden();
  });

  test('Select fields are dynamically populated', async ({ page, browser, baseURL }) => {
    const countryOptions = (p: Page) => p.getByLabel('Country').locator('option');
    // 1. Without JavaScript: only the static HTML is there
    const noJsContext = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto('/part-1/new-shipment.html');
    const emptyCountryCount = await countryOptions(noJsPage).count();
    await noJsContext.close();
    // 2. With JavaScript (your normal page from beforeEach): wait for the options to be added
    await expect(countryOptions(page)).not.toHaveCount(emptyCountryCount);
  });
});
