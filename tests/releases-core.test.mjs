// Unit tests for updates/releases-core.js. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const core = require("../updates/releases-core.js");

// The entries of releases.js, loaded the way the browser does.
function localEntries() {
  const window = {};
  vm.runInNewContext(readFileSync(new URL("../updates/releases.js", import.meta.url), "utf8"), { window });
  return JSON.parse(JSON.stringify(window.HELME_RELEASES));
}

const BODY = `The night shift now also works on projects that are open.

Includes v0.5.29 – v0.5.31

### New
- Night work runs in a separate \`git worktree\`.
- Pick the model and effort per ticket,
  set by the Chief.

### Improved
* The morning report says where each run happened.

## Fixed
- A ticket is taken off the open agent's queue.

### Notes for later
- not shown
`;

function release(over = {}) {
  return {
    tag_name: "v0.5.32",
    name: "v0.5.32: Night shift on open projects",
    body: BODY,
    draft: false,
    prerelease: false,
    published_at: "2026-10-04T08:15:00Z",
    html_url: "https://github.com/sinhgiang/helme-web/releases/tag/v0.5.32",
    assets: [
      { name: "notes.txt", browser_download_url: "https://example.test/notes.txt" },
      { name: "screenshot.png", label: "Night shift with sample projects", browser_download_url: "https://example.test/screenshot.png" },
    ],
    ...over,
  };
}

test("compareVersions sorts newest first, numerically", () => {
  const sorted = ["v0.5.9", "v0.5.28", "v0.10.0", "v0.5.10", "v1.0.0"].sort(core.compareVersions);
  assert.deepEqual(sorted, ["v1.0.0", "v0.10.0", "v0.5.28", "v0.5.10", "v0.5.9"]);
});

test("parseBody reads summary, includes and the three sections", () => {
  const n = core.parseBody(BODY);
  assert.equal(n.summary, "The night shift now also works on projects that are open.");
  assert.equal(n.includes, "v0.5.29 – v0.5.31");
  assert.deepEqual(n.new, [
    "Night work runs in a separate `git worktree`.",
    "Pick the model and effort per ticket, set by the Chief.",
  ]);
  assert.deepEqual(n.improved, ["The morning report says where each run happened."]);
  assert.deepEqual(n.fixed, ["A ticket is taken off the open agent's queue."]);
});

test("parseBody copes with Windows line ends and an empty body", () => {
  assert.equal(core.parseBody(BODY.replace(/\n/g, "\r\n")).new.length, 2);
  assert.deepEqual(core.parseBody(""), { summary: "", includes: "", new: [], improved: [], fixed: [] });
  assert.deepEqual(core.parseBody(null).new, []);
});

test("fromGitHub makes an Updates entry with the screenshot", () => {
  const e = core.fromGitHub(release());
  assert.equal(e.version, "v0.5.32");
  assert.equal(e.date, "2026-10-04");
  assert.equal(e.title, "Night shift on open projects");
  assert.equal(e.includes, "v0.5.29 – v0.5.31");
  assert.deepEqual(e.shot, { src: "https://example.test/screenshot.png", alt: "Night shift with sample projects" });
  assert.equal(e.new.length, 2);
});

test("fromGitHub: title without the version prefix, alt text fallback, no screenshot", () => {
  assert.equal(core.fromGitHub(release({ name: "v0.5.32 — Lanes" })).title, "Lanes");
  assert.equal(core.fromGitHub(release({ name: "Lanes" })).title, "Lanes");
  assert.equal(core.fromGitHub(release({ name: "v0.5.32" })).title, "Helme v0.5.32");
  const noLabel = core.fromGitHub(release({ assets: [{ name: "Screenshot.PNG", browser_download_url: "https://example.test/s.png" }] }));
  assert.equal(noLabel.shot.alt, "Helme v0.5.32 with sample projects");
  assert.equal(core.fromGitHub(release({ assets: [] })).shot, undefined);
});

test("fromGitHub skips drafts, pre-releases and tags that are not versions", () => {
  assert.equal(core.fromGitHub(release({ draft: true })), null);
  assert.equal(core.fromGitHub(release({ prerelease: true })), null);
  assert.equal(core.fromGitHub(release({ tag_name: "website-2026-10" })), null);
  assert.equal(core.fromGitHub(release({ tag_name: "v0.5" })), null);
});

test("merge keeps every local entry and puts the new GitHub release on top", () => {
  const local = localEntries();
  assert.equal(local.length, 12);
  const merged = core.merge(local, [release(), release({ tag_name: "v0.5.33", draft: true })]);
  assert.equal(merged.length, 13);
  assert.equal(merged[0].version, "v0.5.32");
  assert.equal(merged[0].source, "github");
  assert.deepEqual(merged.slice(1).map((e) => e.version), local.map((e) => e.version));
  assert.equal(merged[merged.length - 1].version, "v0.1.0");
});

test("merge: a GitHub release replaces the local entry with the same version", () => {
  const local = localEntries();
  const merged = core.merge(local, [release({ tag_name: "v0.5.28", name: "Corrected notes" })]);
  assert.equal(merged.length, 12);
  assert.equal(merged[0].version, "v0.5.28");
  assert.equal(merged[0].title, "Corrected notes");
});

test("merge without GitHub data is the local list, newest first", () => {
  const local = localEntries();
  assert.deepEqual(core.merge(local, []).map((e) => e.version), local.map((e) => e.version));
});
