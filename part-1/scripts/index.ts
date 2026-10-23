

const test = document.querySelector<HTMLParagraphElement>('#test');

if (!test) {
  throw new Error('Missing #status element');
}

test.textContent = 'Hello world from TypeScript';