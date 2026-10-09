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

// A fake GitHub releases API: `total` releases, newest first, served page by page like GitHub does.
function fakeGitHub(total, { failPage, badPage } = {}) {
  const all = Array.from({ length: total }, (_, i) =>
    release({ tag_name: `v1.${Math.floor((total - 1 - i) / 1000)}.${(total - 1 - i) % 1000}`, name: `Release ${total - 1 - i}` }));
  const calls = [];
  const fetchFn = async (url) => {
    const u = new URL(url);
    calls.push(u.search);
    const page = Number(u.searchParams.get("page") || 1);
    const per = Number(u.searchParams.get("per_page") || 30);
    if (page === failPage) return { ok: false, status: 403, json: async () => ({ message: "API rate limit exceeded" }) };
    if (page === badPage) return { ok: true, status: 200, json: async () => ({ message: "Not a list" }) };
    return { ok: true, status: 200, json: async () => all.slice((page - 1) * per, page * per) };
  };
  return { all, calls, fetchFn };
}

test("fetchAll reads every page when there are more than 100 releases", async () => {
  const gh = fakeGitHub(250);
  const got = await core.fetchAll(core.API_URL, gh.fetchFn);
  assert.equal(got.complete, true);
  assert.equal(got.releases.length, 250);
  assert.deepEqual(gh.calls, ["?per_page=100&page=1", "?per_page=100&page=2", "?per_page=100&page=3"]);
  assert.deepEqual(got.releases.map((r) => r.tag_name), gh.all.map((r) => r.tag_name));
  const merged = core.merge(localEntries(), got.releases);
  assert.equal(merged.length, 250 + 12, "every GitHub release and every local entry");
  assert.equal(merged[0].version, "v1.0.249");
  assert.equal(merged[249].version, "v1.0.0", "the oldest GitHub release is still listed");
});

test("fetchAll stops after a short page, also when the last page is exactly full", async () => {
  const small = fakeGitHub(70);
  assert.equal((await core.fetchAll(core.API_URL, small.fetchFn)).releases.length, 70);
  assert.equal(small.calls.length, 1);

  const full = fakeGitHub(200);
  const got = await core.fetchAll(core.API_URL, full.fetchFn);
  assert.equal(got.complete, true);
  assert.equal(got.releases.length, 200);
  assert.equal(full.calls.length, 3, "page 3 is empty and ends the loop");
});

test("fetchAll keeps the pages it read when a later page fails", async () => {
  const limited = fakeGitHub(250, { failPage: 2 });
  const got = await core.fetchAll(core.API_URL, limited.fetchFn);
  assert.equal(got.complete, false);
  assert.equal(got.releases.length, 100);

  const bad = fakeGitHub(250, { badPage: 3 });
  const got2 = await core.fetchAll(core.API_URL, bad.fetchFn);
  assert.equal(got2.complete, false);
  assert.equal(got2.releases.length, 200);
});

test("fetchAll fails when the first page fails, so the page keeps the local entries", async () => {
  await assert.rejects(core.fetchAll(core.API_URL, fakeGitHub(10, { failPage: 1 }).fetchFn), /GitHub 403/);
  await assert.rejects(core.fetchAll(core.API_URL, fakeGitHub(10, { badPage: 1 }).fetchFn), /no list/);
  await assert.rejects(core.fetchAll(core.API_URL, async () => { throw new TypeError("offline"); }), /offline/);
});

test("fetchAll stops at MAX_PAGES when every page is full", async () => {
  let calls = 0;
  const endless = async () => { calls++; return { ok: true, json: async () => Array.from({ length: 100 }, () => release()) }; };
  const got = await core.fetchAll(core.API_URL, endless);
  assert.equal(calls, core.MAX_PAGES);
  assert.equal(got.complete, false);
});

test("pageUrl keeps the query of a test address and resolves it against the page", () => {
  assert.equal(core.pageUrl("/fake-api/releases?limited", 2, "http://127.0.0.1:5000/updates/"),
    "http://127.0.0.1:5000/fake-api/releases?limited=&per_page=100&page=2");
  assert.equal(core.pageUrl(core.API_URL, 1), "https://api.github.com/repos/sinhgiang/helme-web/releases?per_page=100&page=1");
});

test("slim keeps what fromGitHub reads", () => {
  const full = release({ author: { login: "someone" }, assets: [{ name: "screenshot.png", label: "L", browser_download_url: "https://example.test/s.png", uploader: {}, size: 1 }] });
  const s = core.slim(full);
  assert.equal(s.author, undefined);
  assert.deepEqual(s.assets, [{ name: "screenshot.png", label: "L", browser_download_url: "https://example.test/s.png" }]);
  assert.deepEqual(core.fromGitHub(s), core.fromGitHub(full));
});
