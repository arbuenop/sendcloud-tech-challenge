import type { Page } from '@playwright/test';

/**
 * Fills in a form as intended, with no errors and checking the conditional of the Customs.
 * That means that if this doesn't work, maybe we need to consider on checking the Customs information rendering.
 *
 * @param page - Playwright Page
 */
export async function fillValidForm(page: Page) {
  await page.getByRole('textbox', { name: 'Name' }).fill('John Doe');
  await page.getByRole('textbox', { name: 'Phone number (Optional)' }).fill('+31123456789');
  await page.getByLabel('Country').selectOption('GB');
  await page.getByRole('textbox', { name: 'City' }).fill('London');
  await page.getByRole('textbox', { name: 'Tax number' }).fill('123456');
  await page.getByLabel('Export reason').selectOption('gift');
  await page
    .getByRole('textbox', { name: 'Statements and declarations (' })
    .fill('Some declarations');
  await page.getByRole('radio', { name: 'Fast' }).check();
  await page.getByRole('checkbox', { name: "I'd like my shipment to be" }).check();
}

// What the form above should send to the API
export const validPayload = {
  city: 'London',
  country: 'GB',
  export_reason: 'gift',
  insured: true,
  name: 'John Doe',
  shipping_preference: 'fast',
  statements: 'Some declarations',
  tax_number: '123456',
  telephone_number: '+31123456789',
};
