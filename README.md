# Sendcloud frontend test

## Note about AI tools

We are looking for thoughtful engineers who understand the pros and cons of AI, not prompt engineers.

Using AI to enhance your workflow is fine; using AI to generate the test solution is not.

## Installing and running the test code

This project contains a basic development setup using `vite` and `vitest`. Feel free to add to it or adapt it as needed.

We have also included a mock backend, using [Mockoon](https://mockoon.com/).

### Requirements

- [Node.js](https://nodejs.org/) (v22 or above)
- `npm` (v10 or above; comes with Node.js by default)

You will also need a (free) [Figma](https://figma.com) account to view the design.

If you have any issues with running the project, please contact us as soon as possible.

### Commands

To install, run `npm install`.

To run a local development environment, run `npm start`. This will concurrently run the frontend and the mock backend. Visit <http://localhost:5174> to get to a placeholder root page that will take you to the different parts of the test.

You can also run the frontend and backend commands separately, with `npm run dev` and `npm run mock-backend`.

To build a version for production, run `npm run build`.

To serve the production build locally, run `npm run preview`.

To run tests, run `npm t` or `npm run test`

To read the API docs, run `npm run api-docs`. They will be available at <http://localhost:4000>.

### Pages

- <http://localhost:5174>: root page for navigation - not part of the test
- <http://localhost:5174/part-1/new-shipment.html>: Placeholder for a "New shipment" page - modify and extend this for part 1
- <http://localhost:5174/part-2/shipments.html>: Shipments page - use this in your code review for part 2

### The backend mock server

There is a mock backend, which uses [Mockoon](https://mockoon.com/). There is an OpenAPI specification for the available endpoints in the `/api` folder, along with Mockoon data files which we use to run the mock server. (Please don't modify anything in this folder.)

You can view the OpenAPI specification docs in your browser by running `npm run api-docs`.

The mock backend includes the following endpoints:

- <http://localhost:3000/shipments>
  - `POST`: create a new shipment. Has a 2 second delay. The endpoint will randomly respond with a `400` error.
  - `GET`: list shipments. Has a 2 second delay.
- <http://localhost:3000/shipping-methods>
  - `GET`: list shipping methods. Has a 1 second delay.

## How to complete the test

There are two parts to this test, **coding** (part 1) and **reviewing** (part 2). These are short exercises to see how you approach frontend development.

### Part 1 - coding

Using [this Figma design](https://www.figma.com/design/6MlvYL85pUHzam1S4is7Ng/Sendcloud-frontend-take-home-test?node-id=0-1&t=KUo1SiV4S6Y1NsRQ-1), build a form to create a new shipment. The password for the Figma design is `nacre-table-spout-prune`.

We have provided a mock backend to which you can `POST` the data, and an accompanying OpenAPI specification so you know how to send the data.

Note that the design we've provided is not perfect. You can either improve any issues you find, or document them.

Ensure that you structure your work into multiple commits, so we can see the way you work.

Please work in the `/part-1` folder for this part of the test.

#### Context for part 1

Please work under the following assumptions:

- Consider modern browsers only (latest 2 versions of Chrome, Firefox, and Safari)
- The project must be as performant and accessible (think [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)) as possible.
- The target audience will be using 3G connections and slower devices to view this page.
- If in doubt, try to keep your solution simple.
- Consider happy and unhappy user paths
- The solution should be production-ready - whatever that means to you
- We prefer a polished, but unfinished solution over a rushed, but complete one.
  - Feel free to document what you would have added with more time, and submit the document with your solution.
  - If you think of possible improvements that you think are out of scope but might be interesting, feel free to document those too.

#### Requirements for part 1

##### Requirements for the form

- The form should `POST` its data to `http://localhost:3000/shipments` with the `Content-Type` of `application/json` (see the OpenAPI spec in the `/api` folder for information on what this endpoint accepts).
- On successfully sending the data, the form should be cleared and a success message shown (design not provided).
- The Country field should display this list of countries:
  - The Netherlands
  - France
  - Germany
  - Portugal
  - Spain
  - Italy
  - United Kingdom
  - United States of America
- The Export reason should display this list of export reasons:
  - Commercial goods
  - Gift
  - Documents
- The Customs information section of the design should only be shown if the selected country is one of the following:
  - United Kingdom
  - United States of America

##### Requirements for how you work

- Implement the design for the form in `part-1/new-shipment.html`. Please make it fully responsive (360px is the minimum viewport width you need to support)
- Document or resolve any issues in the design.
- If you make design decisions yourself, keep usability best practices in mind.
- Use whatever technologies or tools you feel are necessary.
  - Note: We expect that this part of the test is completed in vanilla Javascript or Typescript, without using frameworks (i.e. React, Vue, Angular, etc). If you strongly feel you should use one, you can - but be prepared to make the case for it in your technical interview.

### Part 2 - reviewing

In the `/part-2` folder, you will find an implementation of a Shipments page. It consumes data from the mock backend server (from <http://localhost:3000/shipments> and <http://localhost:3000/shipping-methods> - see the OpenAPI specs in the `/api` folder for more information) and renders a list of shipments. There is also a test file (`shipments.test.js`).

There are several things that are wrong or could be improved in this code. We would like you to write a code review highlighting these issues.

#### Context for part 2

Please review the code in the `/part-2` folder using the following context:

- Consider modern browsers only (latest 2 versions of Chrome, Firefox, and Safari).
- The code should be as performant and accessible (think [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)) as possible.
- The target audience will be using 3G connections and slower devices to view this page.
- Assume the final design is coming later and that this is an interim step.

#### Requirements for part 2

- In `part-2/code-review.md`, please **write a review** of the code, as if you were reviewing a pull request for a junior colleague in your company.
- Explain what is wrong with the code, and how it could be improved.
- Explain why the last skipped test in `shipments.test.js` is not working.
- Your recommendations for the code should result in it being production-ready - whatever that means to you.

## How to submit your test

Either:

- Package the project as a `.zip` file
- Keep your `.git` folder in the file.
- Upload the packaged test to Google Drive/Dropbox and include a link in the message of your submission.

Or:

Share a link to a public GitHub or GitLab repository with the results of your test.