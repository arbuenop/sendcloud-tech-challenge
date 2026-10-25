import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Rules axe can't decide on that you've reviewed manually. Keep this list tiny.
const ALLOWED_INCOMPLETE: string[] = [];

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const incomplete = results.incomplete.filter((r) => !ALLOWED_INCOMPLETE.includes(r.id));

  // Readable failure output instead of a giant object diff
  const summarize = (list: typeof results.violations) =>
    list.map((r) => ({
      rule: r.id,
      impact: r.impact,
      nodes: r.nodes.map((n) => n.target.join(' ')),
    }));

  return { violations: summarize(results.violations), incomplete: summarize(incomplete) };
}

test.beforeEach(async ({ page }) => {
  // Stable colors: no transitions/animations while axe measures contrast
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important}',
  });

  // Mocking shippment methods response and loading page
  await page.route('http://localhost:3000/**', (route) =>
    route.fulfill({ json: [{ id: 1, name: 'Fast shipping method' }] }),
  );
  await page.goto('/part-1/new-shipment.html');

  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important}',
  });

  await expect(page.locator('input[name="shipping_preference"]').first()).toBeAttached();
  await expect(page.locator('#country option')).not.toHaveCount(0);
});

test('has no violations in its initial state', async ({ page }) => {
  const { violations, incomplete } = await scan(page);
  expect(violations).toEqual([]);
  expect(incomplete, 'axe could not verify these, review manually').toEqual([]);
});

test('has no violations with the customs fieldset visible', async ({ page }) => {
  await page.locator('#customs-fields').evaluate((el) => el.removeAttribute('hidden'));
  const { violations, incomplete } = await scan(page);
  expect(violations).toEqual([]);
  expect(incomplete).toEqual([]);
});

// Canary: proves this setup actually detects contrast problems.
test('canary: detects white text on white background', async ({ page }) => {
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div style="background-color:#fff"><p style="color:#fff">asdf</p></div>',
    );
  });
  const { violations, incomplete } = await scan(page);
  const flagged = [...violations, ...incomplete].some((r) => r.rule === 'color-contrast');
  expect(flagged).toBe(true);
});
