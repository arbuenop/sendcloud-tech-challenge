// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import html from './new-shipment.html?raw';

/**
 * Quick way to ensure no obcious accessibility issues are present in the new shipment page.
 */
describe('new shipment page accessibility', () => {
  beforeEach(() => {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    document.documentElement.lang = parsed.documentElement.lang;
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;
  });

  it('has no violations in its initial state', async () => {
    const { violations } = await axe.run(document);
    expect(violations.map((v) => v.description)).toEqual([]);
  });

  it('has no violations even with the customs fieldset visible', async () => {
    document.querySelector('#customs-fields')?.removeAttribute('hidden');
    const { violations } = await axe.run(document);
    expect(violations.map((v) => v.description)).toEqual([]);
  });
});
