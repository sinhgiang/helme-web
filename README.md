# helme-web

The introduction page for Helme, and its Updates page. Static HTML, no build step.

- `index.html`, `styles.css`, `favicon.svg`, `og.png`: the home page (`og/og.html` is the source of `og.png`)
- `updates/`: the Updates page (`/updates/`), linked from the footer
  - `releases.js`: the release notes, one entry per version, newest first
  - `updates.js`, `updates.css`, `index.html`: renders the list on the left and the selected release on the right
  - `shots/source.html`: every screenshot, drawn in HTML with sample projects; `shots/<id>.png` are rendered from it
  - `shots/render.mjs`: renders the screenshots with headless Edge or Chrome
- `vercel.json`: `trailingSlash` so `/updates` becomes `/updates/`

Every Helme window on these pages is drawn in HTML with fictional projects (shop-web, mobile-app,
booking-api, docs-site, analytics, landing), so no real data or paths from anyone's PC appear.

Run locally: open `index.html` in a browser, or `npx serve .`.
Deploy: Vercel project `helme-web` (static, no framework). Every pushed branch gets a preview.

## Adding a release

When Helme gets a new version (for example `v0.5.29`):

1. **Write the notes.** Read the new version's tag (`git tag` in the Helme repository) and its line in the
   log ("Nhật ký") of Helme's `CLAUDE.md`. Add a new object at the **top** of `window.HELME_RELEASES`
   in `updates/releases.js`:

   ```js
   {
     version: "v0.5.29",
     includes: "v0.5.29",            // optional: smaller versions folded into this entry
     date: "2026-10-04",
     title: "One line about what this release is for",
     summary: "One or two sentences for someone who does not code.",
     new: ["..."],                   // leave out a list that would be empty
     improved: ["..."],
     fixed: ["..."],
     shot: { src: "shots/v0-5-29.png", alt: "What the picture shows" },
   },
   ```

   Write in English for the reader. Use only sample project names (or the four public products:
   Wispra, Lenvid, Revova, Timio). No paths from a PC, no internal ticket numbers, no names of people.
   The first entry gets the **Latest** badge by itself. Several small versions may share one entry:
   name the highest version in `version` and the rest in `includes`.

2. **Draw the screenshot.** In `updates/shots/source.html`, copy the last `<section class="shot">`,
   set its `id` to the version with dashes (`v0-5-29`), set the status bar to `Helme v0.5.29 · Latest version`,
   and change the content to show the new feature with sample data. The classes are in `shots/shot.css`.

3. **Render it.** `node updates/shots/render.mjs v0-5-29` writes `updates/shots/v0-5-29.png`
   (1800 × 1080). Open the PNG and check it: sample data only, no paths, no real names.

4. **Check and publish.** Open `updates/index.html#v0.5.29` in a browser, at desktop and phone width.
   Commit on a `helme/...` branch, push, and check the Vercel preview before production.
