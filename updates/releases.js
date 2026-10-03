// Helme release notes shown on /updates. Newest first: add a new release at the TOP of the list.
// See README.md ("Adding a release") for the steps and the screenshot.
//
// Fields:
//   version   "v0.5.28" (the highest version this entry covers)
//   includes  optional, smaller versions folded into this entry, e.g. "v0.5.26 – v0.5.27"
//   date      "YYYY-MM-DD"
//   title     one line, what this release is about
//   summary   one or two sentences for the reader
//   new / improved / fixed   lists of short sentences (leave a list out when empty)
//   shot      { src: "shots/<id>.png", alt: "what the picture shows" }
//
// Write for people who do not code. No real project names (sample names only), no paths
// from anyone's PC, no internal ticket numbers.

window.HELME_RELEASES = [
  {
    version: "v0.5.28",
    includes: "v0.5.26 – v0.5.27",
    date: "2026-10-03",
    title: "Apply rule changes with one click, and install missing tools",
    summary:
      "The Chief of Staff can now propose a change to the phrases that hold a ticket for you, and you see it before and after with an Apply button. Helme also installs the free tools your agents need.",
    new: [
      "Proposals to change the auto-approve phrases show a before and after view with an Apply button. Only your click applies them.",
      "The Connections section has Install for a missing tool and Log in for a tool that needs your account. Each opens the tool's own official installer or login page.",
      "Agents install free tools from their official source by themselves, and ask you only for installs that need administrator rights or for a login.",
    ],
    improved: [
      "Tasks you order in the chat are no longer held back because of words the Chief wrote, or because your reply was short.",
      "When a ticket is held, Helme says which phrase in which part of the ticket caused it.",
    ],
    shot: { src: "shots/v0-5-28.png", alt: "A proposal with a before and after view and an Apply button, above the Connections list with Install and Log in buttons" },
  },
  {
    version: "v0.5.25",
    includes: "v0.5.20 – v0.5.24",
    date: "2026-10-03",
    title: "A clearer Reports tab that keeps your place",
    summary:
      "What waits for you now sits at the top of the Reports tab, with the reader right below it. Reloading or installing a new version no longer loses what you were looking at.",
    new: [
      "After Install or a reload, Helme opens the same tab, the same report or how-to, at the same scroll position.",
      "New Reports layout: Waiting for you on top, then the reader, then the list of reports.",
    ],
    improved: [
      "The waiting list is taller, so more items fit before you scroll.",
      "A how-to that is open updates within a second when the Chief edits it.",
      "Items you answer leave the list in the same turn: you can just say \"done\", send a picture or reply in one sentence.",
      "Tasks you order in the chat start right away instead of waiting in Proposed.",
    ],
    fixed: [
      "The Reviewer always reviews the branch of the task, not the branch it was started from.",
    ],
    shot: { src: "shots/v0-5-25.png", alt: "Reports tab with two items waiting, a how-to open below them and the list of reports at the bottom" },
  },
  {
    version: "v0.5.19",
    includes: "v0.5.17 – v0.5.18",
    date: "2026-10-02",
    title: "Merge on your word, and a how-to for every decision",
    summary:
      "Say \"merge pull request 14 of shop-web\" and the Chief merges it, after Helme checks your exact words. Every item on your waiting list can carry its own step-by-step how-to.",
    new: [
      "Merge on your word: Helme checks that you named the project and the pull request before anything is merged.",
      "Every waiting item can have its own how-to, opened with How to, with Expand and Back to list.",
      "Recently closed: the last 20 items that left your list, who closed them and what the answer was.",
      "Links in Helme open in the browser you use, never inside the Helme window.",
    ],
    fixed: [
      "An item whose linked report was renamed or removed now says so, instead of opening an empty page.",
    ],
    shot: { src: "shots/v0-5-19.png", alt: "The Chief merging a pull request on the left, a how-to with numbered steps on the right" },
  },
  {
    version: "v0.5.16",
    includes: "v0.5.15",
    date: "2026-10-02",
    title: "Reviews and approved work start by themselves",
    summary:
      "A ticket that reaches Review goes into the Reviewer's queue, and an approved ticket goes straight to work. Each project has its own queue, so agents finish one task before the next.",
    new: [
      "The Reviewer reviews every ticket in the Review column on its own, one at a time.",
      "Approve moves the ticket to Done with the report; changes needed sends it back to the agent; blocked adds an item to your list.",
      "Approved tickets start without pressing Send to Chief.",
      "The Tickets tab shows the queue of every project above the board.",
    ],
    shot: { src: "shots/v0-5-16.png", alt: "Tickets board with queues per project above it and tickets in Review and Done" },
  },
  {
    version: "v0.5.14",
    includes: "v0.5.11 – v0.5.13",
    date: "2026-10-02",
    title: "Move panes between tabs and see where they land",
    summary:
      "Drag a running agent to another tab, or onto + to give it a tab of its own. While you drag, the grid shows exactly where the pane will land.",
    new: [
      "Drag a pane onto another tab, or a whole tab onto another one to join their panes. The agent keeps running.",
      "A bright Drop here slot follows the mouse and shows the layout after the drop.",
      "The Chief can move a running project to another tab by command.",
      "Opening Helme in a second window no longer takes the terminals away: press Use here to move them.",
    ],
    fixed: [
      "On-demand reviews that stopped before reading any code now run correctly.",
    ],
    shot: { src: "shots/v0-5-14.png", alt: "Four panes with a highlighted Drop here slot where a dragged pane will land" },
  },
  {
    version: "v0.5.10",
    includes: "v0.5.7 – v0.5.9",
    date: "2026-10-02",
    title: "One list of everything that waits for you",
    summary:
      "Decisions that need you used to be spread over four places. Now they live in one list, on screen, that updates the moment anything changes.",
    new: [
      "One waiting list, grouped by project, with Done and How to on each item.",
      "Agents can add items for their own project; only you and the Chief can close them.",
      "The Chief can ask the Reviewer for a review of a ticket by command.",
    ],
    improved: [
      "Helme's notices never type into the Chief's chat while you are writing a message.",
      "Reports Helme writes itself, such as the morning report and the night shift scores, are in your language.",
    ],
    shot: { src: "shots/v0-5-10.png", alt: "Status tab with Needs your decision grouped by project, next to the Chief closing an answered item" },
  },
  {
    version: "v0.5.6",
    includes: "v0.5.3 – v0.5.5",
    date: "2026-10-02",
    title: "Simple tasks you ordered are approved for you",
    summary:
      "When you clearly ask for a simple task, its ticket goes straight to Approved, and Helme checks your own words to be sure. Anything that touches money, secrets or real people still waits for you.",
    new: [
      "Auto-approved tickets carry your exact sentence, with Back to Proposed and Reject if you change your mind.",
      "Project agents start in auto mode; the safety checks still run before every command.",
    ],
    fixed: [
      "A pane no longer loses its input box after a reload.",
      "Agents pick up their conversation again after a restart, instead of opening an empty terminal.",
    ],
    shot: { src: "shots/v0-5-6.png", alt: "Tickets board with an Auto-approved ticket and a ticket that waits because it touches money" },
  },
  {
    version: "v0.5.2",
    includes: "v0.5.0 – v0.5.1",
    date: "2026-10-01",
    title: "Agents know your accounts, and deploy finished work",
    summary:
      "Every agent now knows which accounts and tools are connected and where its project lives. Finished, checked work is deployed without waiting for you; money and big changes still wait.",
    new: [
      "A Connections section shows what is connected, what needs your login and what is not installed.",
      "Each project agent knows its own GitHub repository and hosting project, and pushes and deploys only there.",
      "Everything agents write for you, from reports to reviews, is in your language. Code stays in English.",
    ],
    improved: [
      "A service connected through its MCP server counts as connected.",
    ],
    shot: { src: "shots/v0-5-2.png", alt: "An agent pushing and deploying a preview, next to the Connections section" },
  },
  {
    version: "v0.4.0",
    date: "2026-10-01",
    title: "The Chief of Staff hands work to agents that are already running",
    summary:
      "No more closing and reopening tabs to give an agent a new task. The Chief types it into the running agent's chat, or queues it if the agent is busy.",
    new: [
      "The Chief sends a task to an open agent, or opens the project if it is not open yet.",
      "Busy agents get a queue; Helme never types while an agent asks for permission or while you are typing in that pane.",
      "Helme tells the Chief when an agent finishes its turn or waits for you.",
      "The Status tab shows the task each agent got from the Chief.",
    ],
    shot: { src: "shots/v0-4-0.png", alt: "The Chief sending a task to a running agent, with the project list on the right" },
  },
  {
    version: "v0.3.1",
    includes: "v0.3.0",
    date: "2026-10-01",
    title: "Reports you can read, next to the Chief",
    summary:
      "The report area gets a Reports tab. The Chief writes long answers as formatted reports and keeps its chat to two or three lines.",
    new: [
      "Reports tab: the newest reports first, with headings, lists and tables in large type, and an Expand button.",
      "A new report opens by itself; if you are reading another one, it only shows a dot.",
    ],
    fixed: [
      "If the newest code cannot start, Helme runs the last good version and says why.",
      "The morning report catches up at any time of day after a missed night.",
      "Jobs that could not run because the PC was off show as missed, in red.",
    ],
    shot: { src: "shots/v0-3-1.png", alt: "A formatted report comparing three options, next to the Chief's short answer" },
  },
  {
    version: "v0.2.2",
    includes: "v0.2.0 – v0.2.1",
    date: "2026-10-01",
    title: "Night shift, tickets, and coming back after a restart",
    summary:
      "Versions start here. This release brings the night shift, the Tickets board, and a Helme that comes back exactly as it was after a crash or a Windows restart.",
    new: [
      "Night shift on a schedule you can edit: night work at 23:00, review at 02:00, a read-only email scan at 03:00, scores and lessons at 05:00, the morning report at 06:30.",
      "Tickets board with five columns, from Proposed to Done. Agents propose, you approve.",
      "Helme restores every tab, pane and agent conversation after closing, a crash or a power cut, and starts with Windows.",
      "Terminals run in their own process, so restarting Helme does not stop agents at work.",
      "The version shows at the bottom right, with Install when a new one is ready.",
    ],
    improved: [
      "The safety guard reads shell commands too, and blocks writes outside the allowed folders.",
    ],
    shot: { src: "shots/v0-2-2.png", alt: "The night shift schedule and morning report, with a New version available notice at the bottom" },
  },
  {
    version: "v0.1.0",
    date: "2026-09-30",
    title: "First version: one screen for many agents",
    summary:
      "Real terminals in the browser, tabs and panes, a Chief of Staff and a Reviewer in their own fixed tabs, and a report area that shows what every agent is doing.",
    new: [
      "Tabs with up to six panes, each running an AI agent in its own project folder.",
      "A project picker with your most used projects first.",
      "Coordination tab with the Chief of Staff and a live report area; Review tab with the Reviewer.",
      "Live status from the agents themselves: working, needs permission, asks a question, turn finished.",
      "Agent identities and safety boundaries: no money, secrets, real data or messages to real people without you.",
      "Paste text, images and copied files straight into an agent.",
    ],
    shot: { src: "shots/v0-1-0.png", alt: "Six agents working side by side in one tab, each in its own project" },
  },
];
