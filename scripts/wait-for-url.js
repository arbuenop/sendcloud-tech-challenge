/**
 * This script is to wait for the url of the page when starting the autogen tool from playwright.
 *
 * @see generate-ui-tests from the package.json
 */

const [url] = process.argv.slice(2);

if (!url) {
  throw new Error('Usage: node scripts/wait-for-url.js <url>');
}

const timeoutMs = 120_000;
const startTime = Date.now();

while (Date.now() - startTime < timeoutMs) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      process.exit(0);
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error(`Timed out waiting for ${url}`);
