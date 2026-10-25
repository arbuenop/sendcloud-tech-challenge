# Notes for the Sendcloud tech challenge

> ## **DISCLAIMER (please read until the end):**
>
> I want to be upfront about the approach I took. The [README](./README.md) asks for production-grade code and for simplicity, and those two pull in opposite directions: a form with conditional, lazy rendering and validation isn’t a simple project by definition, and even less so if it has to be production-grade. Without knowing where this form will live, who will use it and how it could grow, I couldn’t tell which one should win, so I built both: the main version ([part-1](./part-1/)), reusable and scalable for future forms, and a simplified one in ([part-1-lite](./part-1-lite/)) that keeps the same architecture (MVC) with less scaffolding and fewer shared components.
>
> To decide which approach suits this use case, I'd need more context: where the form will be displayed, who will use it and how it could grow over time. The challenge doesn't give me that, so I chose the approach that better shows what I can do in terms of architecture.
>
> Regarding the use of AI, I want to clarify that I mostly used AI to make sure I had no blindspots during the planning and to write some of the most simple parts of the codebase such as the [function to populate dropdowns](./part-1/scripts/features/new-shipment/view/utils/populate-options.ts) or the [sync customs logic](./part-1/scripts/features/new-shipment/view/utils/customs.ts) in addition to some unit tests (definetly not all of them) that I personally reviewed together with every single line of this project. I also wrote all the JSDocs comments across the files so I am more than ready to defend it during the technical interview.

## Step 1: Setting up the environment

After installing dependencies, I noticed some packages were reporting critical issues. I investigated and found vulnerabilities in packages pulled in by other modules, so I upgraded some packages and added others to the `overrides` object in `package.json`.

## Step 2: Checking the design and what can be improved

To understand Sendcloud's design language better, I opened my own Sendcloud account. That way I could match colors, fonts, elevations, margins and so on exactly.

After a quick look at a few forms (and while I wait for approval to edit the Figma file and add error messages), I write some comments pointing out the easiest differences to align [Figma comments](./part-1/docs/DESIGN-NOTES.md)

I also set priorities from PRIO 1 (highest) to PRIO 3 (lowest), so you can filter the comments in Figma and see what to tackle first. Normally I'd use GitHub issues or a DevOps tool for this, and I read the API docs, so I could align the design with them from the very beginning.

## Step 3: Implementation plan

Normally I'd make the figma mocks first and ask for a review, but since this is a test I went straight into the implementation plan.

### 1st consideration: tech stack

The API docs show there's no validation on the API side, so the data we send must be as clean as possible. At first I thought about using Yup, but performance matters here because of connectivity restrictions, so I went with Valibot which is way lighter and gives me what I wanted from Yup: I don't have to reinvent the wheel for things like email validation, and all the validation logic is centralized in a reliable, well-tested library.

I also considered a CSS preprocessor, but I found it unnecessary here. The target browsers already support CSS variables, and if the code gets too long, splitting it into separate files solves that easily.

For testing:

- **Vitest** for the API endpoints and schema validation.
- **playwright** to check the form's reactivity (when a field is filled in incorrectly, something changes in the DOM) and integration tests.
- **axe-core** for general accessibility.

### 2nd consideration: folder/file structure

At first I split the implementation into these concepts [V1](./part-1/docs/V1_FOLDER-STRUCTURE.md):

However, after a few trials and errors, I realized how quickly the UI files turn into spaghetti code, so I changed how I looked at it. Instead of separating layers globally, I keep all the global/shared code at root level and add a `feature/` folder that scaffolds the different layers (api, schema, view) per form. This is a feature-based architecture: if we need more than one form, we scale by adding a new folder and still reuse the shared logic at the root.

On top of that, to organize a bit better how the UI scripts communicate with the api, I used an MCV pattern, this helped a lot to enchance and test the reactivity and the UX.

So after discussing with claude to check there were no blindspots in the way I envisioned the whole thing, I came up with a second version of the file structure that would make things easier to refactor in the future.

This is the second file structure I came up with [V2](./part-1/docs/V2_FOLDER-STRUCTURE.md):

In a real scenario, the global/shared files (API client, tools to connect the view object with the DOM, shared utilities) would live in a shared package. This form would import that package and this codebase would only contain the code under `feature/new-shipment`, so in a more realistic scenario this would look more like the following:

```
part-1/scripts/
├── index.ts                # composition root: wires ui, api and schemas together
│
├── view/
│ ├── view.ts                   # view object that communicates the DOM with the controller
│ ├── view.test.ts
│ └── utils/                    # needed tools to handle complex tasks beyond the form rendering itself like the shipping methods fetch.
│   ├── customs.ts
│   ├── shipping-methods.ts
│   └── Other UI tools...
│
├── api/
│ ├── endpoints.ts              # endpoints required for this form.
│ └── endpoints.test.ts
│
├── schemas/                    # where we define all the validation requirements
│ ├── schema.ts                 # Base and Customs schemas, Shipment type
│ └── validation.ts             # validating functions
│
└── controller/
  └── controller.ts             # connects the view to the API
```

I already had a mental picture of how everything should look, so I wrote the structure in a `.md` file ([V2](./part-1/docs/V2_FOLDER-STRUCTURE.md)) and started implementing it.

> While doing so, I realized some things could be reshaped for better reusability and scalability, so the final result is not a spinning image of the V2 folder structure, but I kept it out-dated to let you know on what things i've changed my mind.

Unit test files live next to the implementations they cover and e2e integration tests would live in a common folder.

## Step 4: TypeScript implementation

I started with a very simple API client with `get` and `post` functions. Since those are the only two HTTP calls we need, I decided against Axios so devices on poor connections have less JavaScript to download. I also built the functions so they'd be easy to swap for Axios if needed.

Then I implemented the endpoints for the form: one to post the form and one to get the shipping methods. Normally I'd rather have DTOs and my own frontend types/domain. But here the frontend talks straight to the API, so this layer needs some small tests to make sure the data we receive from the server is correctly formatted. The data we send should already be validated by the schemas. The strictness of the tests for this layer would depend entirely on the project's context and how it could grow.

With all the API tests green, I moved on to a light implementation of the HTML template, so I could start selecting elements from the view and later connect them to the API through the controller. Doing the template before the controller is just personal preference: I like to see the elements in the HTML first and then link them.

I created a test file using axe-core to keep an eye on basic HTML accessibility issues like missing alt texts or untied labels.

While implementing the view script, I documented all the helper functions and separated code blocks with the same purpose into regions. This helps me to stay close to the Single Responsibility Principle and will help my team to understand what each part of the code does without having to read it all. I also wrote a test file for the view, checking that the bound functions are called when things happen in the DOM.

> I load the HTML with new-shipment.html?raw, parse it with DOMParser and inject the body into the test document. These tests run in jsdom, so they exercise real elements, attributes and events, but nothing is actually rendered: there’s no layout, no CSS and no browser behavior. That’s why they don’t replace the Playwright tests, which cover what the user actually sees in a browser.

I decided not to write dedicated tests for the controller. Instead, I will add some integration tests next to the HTML that covers the full flow, from the HTML to the API. It's simple for now, but it's meant to be extended with specific edge cases, like a new modal.

## Step 5: Styling

I didn't make many commits for this step. I already had all the comments documented from earlier, so I went into focus mode and finished them all in one go. I followed CSS best practices such as BEM 101.

I'm not using a pre-built UI library, and I didn't want Bootstrap or Tailwind, because configuring them would take me more time than they'd save. So I wrote my own CSS. That means a handful of files covering the different UI components, so I can reuse most of the design tokens.

I styled the whole form mobile-first, then adjusted the media queries to make better use of the space on larger screens.

## Step 6: e2e testing

After finishing the implementation, I made the [accessibility tests](./part-1/scripts/e2e/new-shipment.a11y.spec.ts) stricter so they check the result as the user sees it in the browser. I installed Playwright and wrote a full [integration tests](./part-1/scripts/e2e/new-shipment.integration.spec.ts) for the happy and unhappy flows, plus some [reactivity tests](./part-1/scripts/e2e/new-shipment.reactivity.spec.ts). Since I'm not using a framework to connect the DOM with the JS, it's very important to make sure that communication is solid.

> If this weren't a technical challenge, I'd probably use a small library for it, such as Lit or Backbone.js.

## Step 7: coverage testing

I finished the testing round with some coverage tests that helped me to see how much of the code is actually being tested.
After some configuration work and some extra small tests for for the schema and validation I can say the code is decently tested for production. Of course there is always room for improvement, but I consider this code robust at this point.

I also added and configured some npm scripts to run all tests at the same time (thinking along the lines of a future CI integration) and separated tests for each impementation, with the possibility to flag them as -- --ui to run the interactive playwright UI.

I also took the chance to try to build the whole project and run some lighthouse tests to check the navigationperformance for both implementations and configured my browser network tab to throttle as a 3G internet for both cases. You can see all those results in the docs folder under the [browser-insights/](./part-1/docs/browser-insights/) folder.

I skipped the CD/CI integration because it was not explicitly asked in the readme, but I have taken it in account

## Extra: simplified implementation

As mentioned in the disclaimer, the brief asked for a production-grade form and for simplicity at the same time. For me, production-grade comes first: given full freedom, I'd rather build the better solution. But I also wanted to show that I can adapt when simplicity is a must, so I built both.

### Production-grade version

The implementation above is what I consider production-grade. I'd be confident merging it into the main branch because it:

- has a scalable, reusable and (arguably) clean architecture
- works across devices and browsers
- includes a mini UI kit that can be reused in other apps
- is covered by unit and end-to-end tests

### Simplified version

Since the tests were already in place, I also built a simplified version: [part-1-lite](./part-1-lite/). It shows how I'd approach this challenge under an aggressive deadline, or if the project truly required it.

Its simplicity would make sense if performance or a very lightweight codebase were a hard requirement, but it comes with trade-offs:

- **Less reusability:** reusability wasn't a priority here, so the communication between the DOM and the view is somewhat embedded in the view object. Taking it out would need some extra work. The extended version already has that done.
- **Less scalability:** if the project grows, the extended version is faster to build on, because it already has the essentials in place.
- **Less reactivity:** probably the biggest downside. In the lite version you have to submit the form to see the validation errors. The extended version validates on blur, which can make a big difference to the UX because the user knows what's wrong as soon as they leave a field.

### Which one to pick

I'd need to understand the project's real requirements before making that call.

## Additional notes:

### JSDocs

The [docs folder of the part-1-lite](./part-1-lite/docs) implementation contains an auto-generated docs. I thought it would be cool to see all the comments I've been spreading acoss the different files in a proper UI.
To display them, just open the file [index.html](./part-1-lite/docs/index.html) from the browser.

### Running the tests

The test commands run the unit tests with coverage first, followed by the relevant Playwright end-to-end tests:

- `npm test` runs both the production-grade and lite projects.
- `npm run test:part-1` runs only the production-grade project's tests and coverage.
- `npm run test:part-1-lite` runs only the lite project's tests and coverage.

To open Playwright's interactive UI after the coverage run, pass `--ui` after `--`:

```sh
npm test -- --ui
npm run test:part-1 -- --ui
npm run test:part-1-lite -- --ui
```
