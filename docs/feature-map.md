# Feature map

## Features

- Home page: `index.html`, `styles.css`, `favicon.svg`, `logo.svg`, `og.png` (source `og/og.html`); the user gets there by https://helme-web.vercel.app.
- Updates page: `updates/index.html`, `updates/updates.js`, `updates/updates.css`; the user gets there by the "Updates" link in the footer, or https://helme-web.vercel.app/updates/.
- Release entries: versions up to v0.5.28 in `updates/releases.js`; newer ones are the GitHub releases of `sinhgiang/helme-web`, read page by page (100 a page) and merged by `updates/releases-core.js`.
- Release screenshots: drawn in `updates/shots/source.html`, rendered by `updates/shots/render.mjs`; newer ones are the `screenshot.png` asset of each GitHub release.
- Hosting: Vercel project `helme-web`; `main` is production, every pushed branch gets a preview. `vercel.json` adds the trailing slash.

## Run and check

- Open it: a static site with no build step. Serve the folder with any static server (for example `npx serve .`) and open `/updates/`. On `localhost` or `127.0.0.1`, `?api=<address>` points the page at a fake releases API.
- Test account: none; the site has no login.
- Main flow to go through: open `/updates/`; the newest version is on top with "Latest"; click an older version in the list; its notes and screenshot show; "Older" and "Newer" move between versions.
- Tests: `npm test` (unit tests, and page tests in headless Edge or Chrome with a fake GitHub API that pages like GitHub).
- Screenshot: headless Edge, `msedge --headless=new --screenshot=<file>.png --window-size=1440,900 <address>`; `updates/shots/render.mjs` shows the same use.
