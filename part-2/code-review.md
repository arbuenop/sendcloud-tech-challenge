# Code review

Good first step: the core functionality is in place and the tests
cover the main flows. However, there is still some room for improvement.

Each issue is flagged with [PRIO X] at the start of its comment, so
it is easier to see which ones to tackle first ([PRIO 1] being the
most important).

## Inline comments

### `part-2/shipments.css` (line 2)

[PRIO 2]

When you set the width to 100vw, to a scrollable element it doesn't compute the width of the scrollbar itself and that can create an unwanted horizontal scrolling. Removing this line should fix the issue.

```suggestion

```

### `part-2/shipments.html` (line 17)

[PRIO 1]
`<Loading>` isn't a real element, if you really want to use a custom tag for that you can create a [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) but that will likely add more complexity.
I would add a regular div instead.

```suggestion
<div id="loading" class="loading" role="status">Loading...</div>
```

### `part-2/shipments.html` (line 10)

[PRIO 1]

This loads whatever the latest axios is at request time, so a breaking or compromised release could cause a lot of trouble (not exactly the same, but just check what happened with PHP a few days ago...)

In view of the latest security breaches I would agree on an exact version and add an integrity hash so we ensure we always get the same files.

you can generate a valid hash using this website https://srihash.christianoliff.com

```html
<script
  src="https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js"
  integrity="sha384-jLwhcmGu/RL8PSTUEl/559f8QVLL4QqM+HBvoZlt4F7XCdsdoDGAwW4nPFfoM7lU"
  crossorigin="anonymous"
></script>
```

However, this app just uses a GET, using the native `fetch` would make it all way easier and the user would not need to download the full axios library, which would improve the performance on 3G networks.

```suggestion

```

![hate php](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2M4ODFmbmZoc2w1Y3p3cmdpNGp6YjNiaGY5ZHV0ZTY0djF4M3g1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KLaJVJujrDqCYB8a11/giphy.gif)

### `part-2/shipments.html` (line 20)

[PRIO 2]

`role="button"` on a `<span>` tells the browser it is a button but doesn't change it's behavior, you can't focus it and ignores Enter/Space. replacing this by a `<button>` tag is a low-hanging fruit that fixes both.

```suggestion
<button type="button" class="jump-to-top" aria-label="Jump to top">&uarr;</button>
```

[PRIO 3]

jumpToTop is camelCase while shipments-title is kebab-case. Let's agree on one (I generally prefer with kebab-case).

### `part-2/shipments.html` (line 25)

[PRIO 1]

This `window.init()` only works if the last line from shipments.js stays like `window.init = init;`, what would happen if you'd accidentally swap the order of those script tags?

The browser will automatically execute whatever is in `shipments.js` so adding replacing that window.init = init by a simple`init()` will still do the job.

```suggestion
<script type="module" src="shipments.js"></script>
```

### `part-2/shipments.css` (line 37)

[PRIO 3]

Remember to update the name of the class here too ;)

### `part-2/shipments.html` (line 15)

[PRIO 3]

Adding an `<h1>` for the title at the beginning of any document is almost always a good idea.

```suggestion
<h1 class="shipments-title">Shipments</h1>
```

### `part-2/shipments.js` (line 16)

[PRIO 1]

If I look at the name and the comment of this function without reading it's content, it is not very clear to me what his job is.

This function takes the needed information to render a shipment card and it renders it in the `#wrapper` div.

To make it a bit less abstract, I would change the name of the function and the parameters to something more descriptive like `renderShipmentCard` or `displayShipmentCard`.

[PRIO 2]

- If time doesn't allow a normal `//` comment to explain something important about the function that is not described in the name is enough, however if possible I would consider adding something a bit more detailed, I always use JSdoc annotations to describe what the function is doing behind the scenes, this might be a good moment to play with it to make sure everyone understands the function's job before reading inside. here are the [docs](https://jsdoc.app/about-getting-started)

- This function is not being used by any other file, so the export at the beginning is not necessary.

With all the changes, this is my suggestion:

```suggestion
/**
 * Uses the information sent through params to display a shipment card inside the #wrapper element.
 *
 * @param shipment - A shipment object
 * @param index - A shipment object
 * @param shippingMethods -  an array with all the available shipping methods
 */
function renderShipmentCard(shipment, index, shippingMethods) {
```

### `part-2/shipments.js` (line 64)

I like the fact that you created a separated function which's job is to render a single card, thumbs up!

### `part-2/shipments.js` (line 31)

[PRIO 1]

Important to use `let` instead of `var` here because `var` will make `i` index visible outside the loop. This is specially dangerous in this function because you are also sending an `i` that has a completely different job.

```suggestion
  for (let i = 0; i <= methods.length; i++) {
```

### `part-2/shipments.js` (line 29)

[PRIO 1]

I see what you are trying here, but inserting html directly in can be dangerous and it should be reserved for very specific use cases and always verifying the inserted content. If a name like `<img src=x onerror="...">` came from the backend, the browser would parse it as a real element and run the handler.

There are a few ways to get the same result safely. For example, we could build the row in a separate helper and set the values with textContent, so they’re always treated as plain text:

```javascript
function createCardRow(label, value) {
  const row = document.createElement('div');
  const labelEl = document.createElement('strong');
  const valueEl = document.createElement('span');

  labelEl.textContent = `${label}: `;
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  return row;
}

const name = createCardRow('Name', s.name);
```

### `part-2/shipments.js` (line 19)

[PRIO 2]

This function is quite clean, it does only one thing, but this single line makes it depend on whatever is outside.
The fact that you decide if the card is highlighted as if you were inside a loop, makes the whole function to depend on being called from a loop.
What if I want to call this function from somewhere else?
What if I don't use a loop to render those cards?
then I would need to call this function like this `createShipment({...}, 1, {...})`, which is not very practical...

```javascript
export function createShipment(s, isHighlighted, methods) {
  // Rest of the code...
  if (isHighlighted) t.className = 'shipment highlighted';
}
```

This would also solve the issue below about the duplicated index

### `part-2/shipments.js` (line 37)

Ditto the comment above about the HTML injection

### `part-2/shipments.js` (line 8)

[PRIO 3]

There is a function in the window object that is called [scrollTo](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo).

Besides that, there is a function that does exactly this [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)

### `part-2/shipments.js` (line 13)

[PRIO 3]

Small naming thing: PascalCase is usually reserved for classes and constructors, so ScrollToTop feels a bit odd for a regular function.

The name also doesn’t quite describe it's job: it attaches a click handler, and it scrolls to .shipments-title, not to the top. Something like addScrollToTopListener would be clearer.

Since scrollIntoView already handles the smooth scrolling, we can also drop the separate scrollTo helper and use addEventListener instead of onclick:

```suggestion
function addScrollToTopListener() {
  const upArrow = document.querySelector('.jumpToTop');
  upArrow.addEventListener('click', () => {
    document.querySelector('.shipments-title').scrollIntoView({ behavior: 'smooth' });
  });
}
```

### `part-2/shipments.js` (line 39)

[PRIO 3]

If this container is always the same, passing it through params would prevent this function from looking for the same container each time it needs to render a new card.

### `part-2/shipments.js` (line 66)

[PRIO 1]

I think there’s a small race here, shipping methods are filled by one request, but the shipments callback uses it before waiting for that request to finish.

If /shipments call is faster, shipping methods will still be undefined and `createShipment` fails on methods.length.
We can wait for both requests with `Promise.all`, so the data is always ready before we render:

```javascript
export async function load() {
  const [{ data: methods }, { data: shipments }] = await Promise.all([
    axios.get('http://localhost:3000/shipping-methods'),
    axios.get('http://localhost:3000/shipments'),
  ]);
 // Rest of the code inside the "then" statements
```

### `part-2/shipments.js` (line 66)

[PRIO 2]

Right now there’s no `.catch`, so if a request fails the user just sees an empty page and there’s nothing in the code to tell us why.
Also, the .loading element is removed before the data arrives, so the spinner disappears while we’re still waiting.

Once this uses `async/await`, a `try/catch/finally` solves both: we can show an error message, and we only remove the loader once the requests are done, whether they succeed or fail:

```javascript
export async function load() {
  try {
    // ...fetch and render
  } catch (error) {
    console.error('Failed to load shipments', error);
    // show an error message in the UI
  } finally {
    document.querySelector('.loading')?.remove();
  }
}
```

### `part-2/shipments.js` (line 62)

[PRIO 3]

The comparator returns undefined when two dates are equal, and it parses each date twice. Subtracting the dates gives a number directly, so it’s shorter and handles equal dates too:

```suggestion
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
```

### `part-2/shipments.js` (line 55)

[PRIO 3]

The URL http://localhost:3000 is repeated in two places. Pulling it into a constant at the top of the file means we only have one spot to change when the API URL changes (for example for a deployed environment):

```javascript
const API_URL = 'http://localhost:3000';
```

then we could

```suggestion
  axios.get(`${API_URL}/shipping-methods`).then(({ data }) => {
    methods = data;
  });
  axios.get(`${API_URL}/shipments`).then(({ data }) => {
```

### `part-2/shipments.js` (line 74)

[PRIO 1]

Following up on my comment in the HTML file.

```suggestion
init();
```

### `part-2/shipments.css` (line 12)

[PRIO 3]

No horizontal padding on #wrapper. On screens narrower than 600px the cards will touch the screen edges.

### `part-2/shipments.css` (line 1)

[PRIO 2]

All the size units should be established in em or rem, and not in px. em and rem respect the browsers' font-size while px don't.

Tip: To know the exact rem value from a pixel you can divide it per 16. (8 / 16 = 0.5 then 8px == .5rem)

### `part-2/shipments.css` (line 54)

[PRIO 3]

The `!important` is probably there because `#wrapper .shipment` has an ID in its selector, so a plain `.highlighted` can’t override its background. Instead of forcing it, we can match the specificity and let it win naturally:

```suggestion
#wrapper .shipment.highlighted {
  background-color: #ecf7ff;
}
```

### `part-2/shipments.css` (line 3)

[PRIO 3]

Since `line-height: 30px` is inherited by everything, it won’t adapt if the font size changes (the 30px title already has a line height equal to its font size). A value scales taking as a reference each element’s own font size:

```suggestion
  line-height: 1.5;
```

### `part-2/shipments.test.js` (line 89)

[PRIO 1]

This test fails because of the first line of load() I flagged before,

```javascript
document.querySelector('.loading').remove();
```

The first test already removed `.loading` from the shared DOM, so here it returns null and .remove() throws an error. That happens before any axios call, so the test never gets to its assertions.

### `part-2/shipments.test.js` (line 18)

[PRIO 1]

beforeAll means that it will execute this only once. This is typically used when all the tests need to follow a sequence, but these are at first glance totally separated tests.

### `part-2/shipments.test.js` (line 62)

[PRIO 2]

Almost all the code wrapped within this code is duplicated, maybe this is a good use case to try the beforeEach for this describe function, then we can also cleanup the mocked axios function.

### `part-2/shipments.test.js` (line 60)

[PRIO 1]

Three `await new Promise(setImmediate)` calls is a magic number. the test only passes if `load()` settles within three event-loop turns, and it fails silently if the implementation adds another await.

Better to make `load()` return its promise and await it directly:

```suggestion
    await load();
```
