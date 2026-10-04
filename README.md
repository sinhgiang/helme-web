<p align="center">
  <a href="https://helme-web.vercel.app"><img src="favicon.svg" alt="Helme" width="96" height="96"></a>
</p>

<h1 align="center">Helme</h1>

<p align="center">
  <strong>Run a team of AI coding agents from one screen.</strong><br>
  You make the decisions. The agents do the rest.
</p>

<p align="center">
  <a href="https://helme-web.vercel.app"><strong>helme-web.vercel.app</strong></a>
</p>

<p align="center">
  <a href="https://helme-web.vercel.app">Website</a> ·
  <a href="https://helme-web.vercel.app/#how">How it works</a> ·
  <a href="https://helme-web.vercel.app/#features">Features</a> ·
  <a href="https://helme-web.vercel.app/#safety">Safety</a> ·
  <a href="https://helme-web.vercel.app/#faq">FAQ</a> ·
  <a href="https://helme-web.vercel.app/updates/">Updates</a>
</p>

---

Helme is a local control room for AI coding agents. It gives every project its own agent in a real
terminal, puts one coordinating agent, the Chief of Staff, in charge of all of them, and has a Reviewer
agent check the work before it is merged. A live report area shows what is running, what was reviewed,
and the short list of decisions that only the owner can make. It runs on the owner's own Windows PC, with
real terminals and plain text files: no cloud service, no database.

**This repository is the source of the Helme website**, [helme-web.vercel.app](https://helme-web.vercel.app):
the introduction page and the [Updates](https://helme-web.vercel.app/updates/) page with the notes and a
screenshot for every version. Helme itself is in private use today; the website introduces it and is not a
download page.

## Table of contents

- [The problem](#the-problem)
- [How Helme solves it](#how-helme-solves-it)
- [Who it is for](#who-it-is-for)
- [Features](#features)
  - [One screen for every project](#one-screen-for-every-project)
  - [A Chief of Staff that hands out the work](#a-chief-of-staff-that-hands-out-the-work)
  - [Tickets and review](#tickets-and-review)
  - [One list of what waits for the owner](#one-list-of-what-waits-for-the-owner)
  - [Reports and the night shift](#reports-and-the-night-shift)
  - [Boundaries by default](#boundaries-by-default)
  - [Nothing is lost on a restart](#nothing-is-lost-on-a-restart)
- [How it works, step by step](#how-it-works-step-by-step)
- [The website](#the-website)
- [FAQ](#faq)
- [Tech stack](#tech-stack)
- [Repository](#repository)
- [Get started](#get-started)
- [Adding a release to the Updates page](#adding-a-release-to-the-updates-page)

## The problem

AI coding agents are now good enough to do real work on a real product. The bottleneck has moved to the
person running them.

One agent in one terminal is easy to follow. Five products, each with its own agent, are not. The owner
ends up as a switchboard: copying instructions between windows, checking which agent finished and which one
is stuck on a permission question, remembering which branch holds which change, and reading code they never
wanted to read.

The risks grow with every agent added:

- An agent asked to "just fix it" can touch what it should not: payment settings, API keys, production data,
  messages to real customers, the main branch.
- Work gets merged that nobody checked.
- The questions agents need answered are scattered across terminals, chats and notes, so they are answered
  late or not at all.
- When the PC restarts, the context of every running conversation is gone.

Engineering teams solve this with a manager, a reviewer and a ticket board. A founder working alone has none
of them.

## How Helme solves it

Helme gives the owner that structure, staffed by agents:

1. **The owner says what they want** to the Chief of Staff, in a plain sentence, in their own language.
2. **The Chief of Staff turns it into tickets** with the context, the reason and the expected result, and
   sends each one to the agent of the right project, opening that project if needed.
3. **Each project agent works on its own branch**, never on main, and reports back with evidence: the
   branch, the commits, the checks it ran.
4. **The Reviewer reads the change** and writes a verdict. Approved work moves on; work that needs changes
   goes back to the agent.
5. **Anything only the owner may decide** lands on one waiting list, each item with its own how-to.
6. **The owner merges.** Nothing reaches the main branch without the owner's explicit order.

Throughout, the agents work inside boundaries that Helme enforces itself, not only by instruction: money,
secrets, real data, messages to real people and the main branch are off limits unless the owner says yes.

## Who it is for

- **Founders and solo operators running several software products** who use AI agents to build them.
- **Owners who do not write code**, and want to give work in plain sentences and read results in plain
  language.
- **Small teams that want guard rails around their agents**: a review step before merge, and hard limits on
  money, secrets and production data.
- **People who want everything on their own machine**: projects, reports and decisions stay as plain text
  files on the owner's disk.

## Features

### One screen for every project

**Tabs and panes of real terminals.** Every pane is a real Windows terminal shown in the browser. A tab holds
up to six panes side by side; panes and tabs can be dragged to a new place, with a preview of exactly where a
pane will land. A new pane offers a project picker and starts its agent in that project's folder.

**A fixed home.** Three tabs are always there: Coordination (the Chief of Staff next to the report area),
Tickets (the board) and Review (the Reviewer).

### A Chief of Staff that hands out the work

**Work in one sentence.** The Chief of Staff turns an order into a ticket and types the task straight into
the chat of the agent that is already open, or opens the project in a new pane. A busy agent gets a queue.

**It follows up, and never types over the owner.** Helme tells the Chief when an agent finishes a turn or
stops to wait for the owner, and holds its notices back while the owner is writing a message.

### Tickets and review

**A ticket board.** Every piece of work is a Markdown file on a board with five columns: Proposed, Approved,
Doing, Review, Done. Agents may only propose; the owner approves.

**Owner orders start at once.** When the owner orders a simple task directly, the ticket can start approved.
Helme checks the quoted words against what the owner actually typed, and anything sensitive still waits for
the owner's click.

**Automatic review.** A ticket in the Review column is queued for the Reviewer, which reads the branch and
writes a report with a verdict: approve, changes needed, or blocked.

**Merging on the owner's order only.** The Chief can merge a pull request only when the owner ordered that
exact merge and the review approved it.

### One list of what waits for the owner

Every decision that needs the owner, from every agent, lands on a single live list, grouped by project. Each
item carries its own step-by-step how-to, disappears as soon as the owner's message answers it, and stays
traceable under "Recently closed".

### Reports and the night shift

**A live report area.** The Status tab shows every open project with its state, branch and uncommitted files,
the waiting list and the latest reviews. The Reports tab renders reports for reading, newest first.

**A night shift.** A schedule the owner can edit by hand: night work at 23:00, review at 02:00, a read-only
email scan at 03:00, scores and lessons learned at 05:00, and a morning report at 06:30. Work that missed its
time because the PC was off runs when it wakes.

### Boundaries by default

**Enforced, not just requested.** Before every command and every file write, a guard checks what the agent is
about to do. Agents cannot read `.env` files, cannot write outside the folders their role allows, and cannot
commit, merge or push on the main branch. The Reviewer only reads.

**Trust that grows.** When the owner says "next time you can decide this yourself", the agent adds that one
kind of task to what it may do alone.

### Nothing is lost on a restart

After closing the window, a crash, a power cut or a reboot, Helme reopens with the same tabs, panes and
projects, and each agent resumes its conversation. Terminals run in a separate process, so installing a new
version restarts only the server while the agents keep working.

## How it works, step by step

1. **Start Helme** on the Windows PC. It opens in its own window, with the Chief of Staff, the report area,
   the ticket board and the Reviewer.
2. **Register the projects** once: each one is a folder, optionally with its own boundaries and linked
   services.
3. **Tell the Chief of Staff what you want**, for example "fix the login crash on the mobile app and ship the
   new checkout page".
4. **The Chief creates tickets and hands them out.** Each project agent gets its task in its own pane and
   starts on a new branch.
5. **The agents work and report.** The Status tab shows who is working, who is waiting, and on which branch.
6. **Questions for you appear on the waiting list**, each with a how-to. Answer in the chat and the item
   disappears.
7. **Finished work goes to review.** The Reviewer writes a verdict; approved tickets move to Done.
8. **You merge** what you want released.
9. **Overnight, the night shift** carries on with approved tickets, reviews them and writes the morning
   report.

## The website

| Page | What it shows |
|---|---|
| [Home](https://helme-web.vercel.app) | The introduction: what Helme is, the three roles, the main features, the safety boundaries, an FAQ |
| [Updates](https://helme-web.vercel.app/updates/) | Every version of Helme, newest first, with its date, what is new, improved and fixed, and a screenshot |

Every Helme window on the website, including the release screenshots, is drawn in HTML with fictional sample
projects (shop-web, mobile-app, booking-api, docs-site, analytics, landing). No real project data and no paths
from anyone's PC appear on the site.

## FAQ

**What exactly is Helme?**
A local web app for Windows that opens real terminals for AI coding agents, one per project, and arranges them
in tabs and panes. A Chief of Staff agent coordinates them, a Reviewer agent checks their work, and a report
area shows what is running and what waits for the owner.

**Do I need to know how to code?**
No. Helme was built for an owner who runs several products and does not write code. Work is given in plain
sentences, and the decisions that need the owner come with step-by-step how-tos.

**Which AI does it use?**
Agents run Claude Code. The Reviewer runs as a separate agent with its own instructions and its own model
setting.

**Can an agent spend money or leak my keys?**
Not without the owner. Money, secrets, real data, messages to real people and the main branch are blocked by
default, and Helme checks every command before it runs.

**Does it run in the cloud?**
No. Helme runs on the owner's own PC. Only this website is hosted, on Vercel.

**Can I download Helme?**
Not yet. Helme is in private use today, and the website only introduces it.

**Is the source of Helme in this repository?**
No. This repository holds the website only. Helme's own source is in a separate, private repository.

## Tech stack

**The website (this repository)**

| Layer | Technology |
|---|---|
| Pages | Static HTML and CSS, no framework and no build step |
| Updates page | A small script that renders `updates/releases.js` |
| Type | Geist and Geist Mono (Google Fonts) |
| Screenshots | Helme windows drawn in HTML, rendered to PNG with headless Microsoft Edge or Chrome (`updates/shots/render.mjs`, Node.js) |
| Hosting | Vercel, with a preview deployment for every pushed branch |

**Helme (described by the website)**

| Layer | Technology |
|---|---|
| Server | Node.js, TypeScript |
| Terminals | node-pty (ConPTY on Windows), in a separate terminal host process |
| Browser UI | xterm.js |
| Live updates | WebSocket |
| Storage | Plain Markdown and JSON files on disk, no database |
| Agents | Claude Code, with hooks for status and a guard for boundaries |

## Repository

```
index.html, styles.css     the home page
favicon.svg                the Helme mark
og.png, og/og.html         the share preview image and its HTML source
updates/                   the Updates page
  releases.js              the release notes, newest first
  index.html, updates.js, updates.css
  shots/source.html        every release screenshot, drawn in HTML with sample data
  shots/shot.css           styles of the screenshots
  shots/render.mjs         renders shots/<id>.png from source.html
  shots/*.png              the rendered screenshots
vercel.json                trailingSlash, so /updates becomes /updates/
```

The website's code and text belong to the owner of Helme.

## Get started

- Read the introduction: [helme-web.vercel.app](https://helme-web.vercel.app)
- See what changed in each version: [helme-web.vercel.app/updates/](https://helme-web.vercel.app/updates/)

To work on the website locally, open `index.html` in a browser, or serve the folder:

```
npx serve .
```

Then open the address it prints. There is nothing to install or build. Push a branch to get a Vercel preview.

## Adding a release to the Updates page

When Helme gets a new version (for example `v0.5.29`):

1. **Write the notes.** Read the new version's tag and its entry in Helme's development log. Add a new object
   at the **top** of `window.HELME_RELEASES` in `updates/releases.js`:

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

   Write in English for the reader. Use only sample project names (or the four public products: Wispra,
   Lenvid, Revova, Timio). No paths from a PC, no internal ticket numbers, no names of people. The first entry
   gets the **Latest** badge by itself. Several small versions may share one entry: name the highest version
   in `version` and the rest in `includes`.

2. **Draw the screenshot.** In `updates/shots/source.html`, copy the last `<section class="shot">`, set its
   `id` to the version with dashes (`v0-5-29`), set the status bar to `Helme v0.5.29 · Latest version`, and
   change the content to show the new feature with sample data. The classes are in `updates/shots/shot.css`.

3. **Render it.** `node updates/shots/render.mjs v0-5-29` writes `updates/shots/v0-5-29.png` (1800 × 1080).
   Open the PNG and check it: sample data only, no paths, no real names.

4. **Check and publish.** Open `updates/index.html#v0.5.29` in a browser, at desktop and phone width. Commit on
   a `helme/...` branch, push, and check the Vercel preview before production.
