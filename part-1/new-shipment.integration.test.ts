import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import html from './new-shipment.html?raw';
import { initNewShipment } from './scripts/features/new-shipment';

const fetchMock = vi.fn<typeof fetch>();
let shipmentStatus = 201;

beforeEach(async () => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.lang = parsed.documentElement.lang;
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
  vi.stubGlobal('fetch', fetchMock);
  shipmentStatus = 201;
  fetchMock
    .mockReset()
    .mockImplementation((url, init) =>
      Promise.resolve(
        new Response(
          init?.method === 'POST'
            ? null
            : JSON.stringify([{ id: 1, name: 'Fast shipping method' }]),
          { status: init?.method === 'POST' ? shipmentStatus : 200 },
        ),
      ),
    );
  initNewShipment();
  await vi.waitFor(() =>
    expect(document.querySelector('input[name="shipping_preference"]')).not.toBeNull(),
  );
  document.querySelector<HTMLInputElement>('#name')!.value = 'Jane Doe';
  document.querySelector<HTMLSelectElement>('#country')!.value = 'NL';
  document.querySelector<HTMLInputElement>('#city')!.value = 'Eindhoven';
  document.querySelector<HTMLInputElement>('input[name="shipping_preference"]')!.checked = true;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('new shipment HTML to API', () => {
  it('submits valid form data and shows success', async () => {
    document
      .querySelector('#shipment-form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));

    await vi.waitFor(() =>
      expect(document.querySelector('#form-success')?.textContent).not.toBeNull(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/shipments',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"name":"Jane Doe"'),
      }),
    );
  });

  it('shows an error when the API responds with 400', async () => {
    shipmentStatus = 400;
    document
      .querySelector('#shipment-form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));

    await vi.waitFor(() =>
      expect(document.querySelector('#form-error')?.textContent).toContain('status 400'),
    );
  });

  it('shows form errors without posting invalid data', async () => {
    document.querySelector<HTMLInputElement>('#name')!.value = '';
    document
      .querySelector('#shipment-form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));

    expect(document.querySelector('#name')?.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector<HTMLParagraphElement>('#name-error')?.hidden).toBe(false);
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
  });

  it('shows a connection error when the request cannot reach the server', async () => {
    fetchMock.mockImplementation((_url, init) =>
      init?.method === 'POST'
        ? Promise.reject(new TypeError('Failed to fetch'))
        : Promise.resolve(new Response(JSON.stringify([{ id: 1, name: 'Fast shipping method' }]))),
    );
    document
      .querySelector('#shipment-form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));

    await vi.waitFor(() =>
      expect(document.querySelector('#form-error')?.textContent).toContain(
        'could not reach the server',
      ),
    );
  });

  it('shows an error when a required field is focused and then blurred empty', () => {
    const name = document.querySelector<HTMLInputElement>('#name')!;
    name.value = '';
    name.focus();
    name.blur();

    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector<HTMLParagraphElement>('#name-error')?.textContent).toContain(
      "Enter the recipient's name",
    );
  });
});
