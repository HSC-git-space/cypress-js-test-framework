# cypress-js-test-framework

![CI](https://github.com/HSC-git-space/cypress-js-test-framework/actions/workflows/cypress.yml/badge.svg)

Cypress · JavaScript · Node.js · ExcelJS · GitHub Actions · DDT · cy.task · Environment Config · Retry Strategy · Custom Commands

---

## Overview

A Cypress + JavaScript test automation framework covering UI automation, API testing, data-driven testing via JSON and Excel, custom command composition, a Node-side file I/O bridge, environment-based configuration, and CI integration via GitHub Actions.

Every architectural decision has a documented reason. Every file is defensible.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Cypress 15 | Test runner — in-browser execution model |
| JavaScript ES6+ | Core language |
| Node.js v24 | Runtime + Node-side task bridge |
| ExcelJS | Excel parsing on the Node side via cy.task |
| GitHub Actions | CI pipeline — runs on every push to main |

---

## Architecture Notes

### Why cy.task() appears multiple times

Cypress test code runs inside a sandboxed browser context — it has no direct access to the filesystem or OS-level APIs. `cy.task()` + `setupNodeEvents` in `cypress.config.js` is the bridge between the sandboxed browser side and the Node side, which has full system access.

This bridge is used twice in this repo:
- File upload — reading the fixture file from disk
- Excel DDT — parsing `users-large.xlsx` via ExcelJS on the Node side

Same bridge, two different use cases. This is the idiomatic Cypress pattern for any file I/O requirement.

### Registration-time vs run-time data loading

Cypress commands are queued and executed asynchronously at run time. Mocha's `describe`/`it` collection phase — where test names are registered — is synchronous and happens before any test runs.

This creates a constraint: `cy.fixture()` cannot be called at registration time because it is itself a Cypress command requiring an active test context. For DDT where you need N independently named `it()` blocks generated from a data file, the data must be available synchronously at registration time.

Solution used in this repo: `require('../fixtures/users.json')` — plain Node `require()` which resolves synchronously at file load, bypassing the Cypress command queue entirely.

The same constraint applies to Excel: ExcelJS has no synchronous read API. Solution: a one-time conversion script (`cypress/support/convert-excel-to-json.js`) pre-converts the `.xlsx` to a JSON sidecar file, which the spec then loads via `require()`.

### Cypress vs Playwright — architectural difference

Cypress runs inside the browser (same event loop as the app under test) — this is why it has automatic waiting and retry built in, and why it needs `cy.task()` for filesystem access.

Playwright and Selenium run as external OS processes controlling the browser via WebDriver/CDP — they can call `fs.readFile()` or Apache POI directly from test code with no bridge needed.

This distinction is the root cause behind the entire `cy.task()` complexity arc in this repo. It is also the correct answer to "when would you pick Playwright over Cypress" — heavy data-driven testing with frequent filesystem access is a legitimate Playwright use case.

---

## Project Structure

```
cypress-js-test-framework/
│
├── .github/workflows/
│   └── cypress.yml                   # CI — triggers on push/PR to main
│
├── cypress/
│   ├── config/
│   │   ├── qa.json                   # QA environment values
│   │   └── prod.json                 # Prod environment values
│   │
│   ├── e2e/
│   │   ├── login_ddt.cy.js           # JSON fixture DDT — 4 login scenarios
│   │   ├── login_excel_ddt.cy.js     # Excel DDT — 50 named tests + cy.task bridge proof
│   │   ├── dynamic_loading.cy.js     # Auto-wait with custom timeout
│   │   ├── dropdown.cy.js            # Dropdown selection
│   │   ├── upload.cy.js              # File upload via cy.task bridge
│   │   ├── api.cy.js                 # API testing via cy.request()
│   │   └── command_composition.cy.js # Composed custom command
│   │
│   ├── fixtures/
│   │   ├── users.json                # DDT scenarios — valid, invalid, empty fields
│   │   ├── users-large.json          # Generated JSON sidecar from users-large.xlsx
│   │   ├── users-large.xlsx          # Source Excel file — 50 rows, 5 categories
│   │   └── example-upload.txt        # Upload fixture
│   │
│   └── support/
│       ├── commands.js               # cy.login() + cy.loginAndNavigateTo()
│       ├── convert-excel-to-json.js  # One-time conversion script — xlsx to JSON sidecar
│       └── e2e.js                    # Imports commands
│
├── cypress.config.js                 # baseUrl, retries, env config loader, cy.task registration
├── cypress.env.json                  # Local secrets — gitignored, never committed
├── package.json
└── .gitignore
```

---

## Test Coverage

### UI Tests — `https://the-internet.herokuapp.com`

**`login_ddt.cy.js`** — Data-driven login via JSON fixture
- 4 scenarios: valid login, invalid username, invalid password, empty fields
- Registration-time data loading via `require()` — generates 4 independently named `it()` blocks
- Empty-fields case: skips `cy.type()` calls entirely since Cypress rejects empty string input by design

**`login_excel_ddt.cy.js`** — Data-driven login via Excel pipeline
- 50 independently named tests generated at registration time from `users-large.json`
- Per-row category validation: `malformed_email` rows asserted to lack `@`, `empty_password` rows asserted to have null/empty password, `whitespace_username` rows asserted against `/^\s|\s$/`
- Separate `cy.task()` bridge proof: independently reads `users-large.xlsx` at runtime via ExcelJS and validates record count and schema
- Two techniques in one spec: `require()` for named test generation, `cy.task()` for live bridge proof

**`dynamic_loading.cy.js`** — Dynamic element timing
- Custom timeout `{ timeout: 10000 }` on `cy.get()` — correct Cypress pattern vs hard `cy.wait()` sleep

**`dropdown.cy.js`** — Dropdown selection and assertion

**`upload.cy.js`** — File upload via `cy.task()` Node bridge

**`command_composition.cy.js`** — Custom command composition
- `cy.loginAndNavigateTo(path)` internally calls `cy.login()` then asserts URL
- Demonstrates abstraction layering — commands composed from other commands

### API Tests — `https://jsonplaceholder.typicode.com`

**`api.cy.js`** — REST API assertions via `cy.request()`
- Response status, body shape, and field-level assertions
- No deserialization step needed — JS response bodies are native objects

---

## Data-Driven Testing — Excel Pipeline

```
users-large.xlsx (source, 50 rows)
        │
        ▼
convert-excel-to-json.js (one-time Node script)
        │
        ▼
users-large.json (sidecar, committed to repo)
        │
        ├── require() → 50 named it() blocks at registration time
        └── cy.task('readExcelUsers') → live bridge proof at run time
```

**Row distribution:**
- 25 valid
- 10 malformed_email
- 8 weak_password
- 4 empty_password
- 3 whitespace_username

**Why JSON sidecar instead of reading Excel directly in the spec:** ExcelJS has no synchronous API. Mocha's collection phase is synchronous. A conversion script run once bridges that gap cleanly — standard practice, not a workaround.

---

## Environment Configuration

Environment switching at CLI:

```bash
npx cypress run --env environment=qa
npx cypress run --env environment=prod
```

`cypress.config.js` reads `config.env.environment`, loads `cypress/config/<environment>.json`, and merges `baseUrl`, `apiUrl`, and `testUser` into the active config. The `return config` at the end of `setupNodeEvents` is required — Cypress ignores mutations to the config object if it is not returned explicitly.

Local secrets go in `cypress.env.json` — gitignored, never committed. `.env.example` documents required keys.

---

## Retry Strategy

```javascript
retries: {
  runMode: 2,   // headless / CI — retry up to 2 times before marking failed
  openMode: 0,  // interactive GUI — fail immediately for faster debugging
}
```

Configured at framework level in `cypress.config.js`. Equivalent to Java's `IRetryAnalyzer` but first-class config rather than custom implementation.

---

## CI Pipeline

GitHub Actions workflow at `.github/workflows/cypress.yml`:
- Triggers on push and PR to `main`
- Node.js 20, `npm ci` for clean installs
- Runs full suite with `--env environment=qa`
- Uploads screenshots as artifacts on failure

---

## Running Locally

```bash
git clone https://github.com/HSC-git-space/cypress-js-test-framework
cd cypress-js-test-framework
npm install
npx cypress run --env environment=qa        # headless, full suite
npx cypress open --env environment=qa       # interactive GUI
npx cypress run --spec cypress/e2e/login_ddt.cy.js --env environment=qa  # single spec
```

---

## Known Limitations

- `cy.loginAndNavigateTo()` does not support post-login navigation on the demo site — the-internet.herokuapp.com does not maintain session state across `cy.visit()` calls. Command asserts secure area URL instead of navigating further.
- Excel DDT validates data pipeline integrity, not live authentication outcomes — the demo site has one valid credential set. JSON DDT (`login_ddt.cy.js`) covers auth-outcome variation.
- No multi-tab or cross-origin testing — known Cypress architectural limitation.