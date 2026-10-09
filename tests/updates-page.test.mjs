// End-to-end test of /updates: serves the site and a fake GitHub releases API on 127.0.0.1, opens
// the page in headless Edge or Chrome and checks what it shows. Run: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };
const BROWSER = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean).find((b) => existsSync(b));

let server;
let base;
let releases = [];
let apiStatus = 200;
let failPage = 0;
const pagesAsked = [];

before(async () => {
  server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/fake-api/releases") {
      // Pages like GitHub: per_page (default 30, at most 100) and page (from 1).
      const per = Math.min(Number(url.searchParams.get("per_page") || 30), 100);
      const page = Number(url.searchParams.get("page") || 1);
      pagesAsked.push(page);
      const status = page === failPage ? 403 : apiStatus;
      res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*" });
      return res.end(JSON.stringify(status === 200 ? releases.slice((page - 1) * per, page * per) : { message: "API rate limit exceeded" }));
    }
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end(); }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404); res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    execFile(BROWSER, [
      "--headless=new", "--disable-gpu", "--no-first-run", "--disable-extensions",
      `--user-data-dir=${join(ROOT, ".test-profile")}`,
      "--virtual-time-budget=5000", "--dump-dom", url,
    ], { timeout: 60000, maxBuffer: 20 * 1024 * 1024 }, (err, stdout) => (err ? reject(err) : resolve(stdout)));
  });
}

const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const listVersions = (html) => [...html.matchAll(/class="rel-item[^"]*" href="[^"]*" data-id="([^"]+)"/g)].map((m) => m[1]);

const NEW_RELEASE = {
  tag_name: "v9.9.9",
  name: "v9.9.9: A test release from GitHub",
  body: "Shown without any change to the code.\n\n### New\n- Release notes come from `gh release create`.\n\n### Fixed\n- Nothing was broken.",
  draft: false,
  prerelease: false,
  published_at: "2026-10-05T09:00:00Z",
  assets: [{ name: "screenshot.png", label: "Test screenshot with sample projects", browser_download_url: "/updates/shots/v0-5-28.png" }],
};

test("a new GitHub release appears on top with its notes and screenshot", { skip: !BROWSER && "no Edge or Chrome" }, async () => {
  releases = [NEW_RELEASE, { ...NEW_RELEASE, tag_name: "v9.9.10", prerelease: true }];
  apiStatus = 200;
  const api = encodeURIComponent(`${base}/fake-api/releases`);
  const html = await dumpDom(`${base}/updates/?api=${api}`);
  const versions = listVersions(html);

  assert.match(html, /data-releases="github"/);
  assert.equal(versions[0], "v9.9.9", "new release first");
  assert.ok(!versions.includes("v9.9.10"), "pre-release hidden");
  assert.equal(versions.length, 13, "12 old entries + 1 new");
  assert.equal(versions.at(-1), "v0.1.0", "old entries still there");

  const t = text(html);
  assert.match(t, /v9\.9\.9 Latest/);
  assert.match(t, /A test release from GitHub/);
  assert.match(t, /Release notes come from gh release create/);
  assert.match(html, /<code>gh release create<\/code>/);
  assert.match(html, /<img src="\/updates\/shots\/v0-5-28\.png" alt="Test screenshot with sample projects"/);
  assert.doesNotMatch(versions.slice(1).join(" "), /v9/);
});

// 130 releases, v2.0.129 (newest) down to v2.0.0, so GitHub needs two pages.
const MANY = Array.from({ length: 130 }, (_, i) => ({
  ...NEW_RELEASE,
  tag_name: `v2.0.${129 - i}`,
  name: `v2.0.${129 - i}: Release number ${129 - i}`,
  assets: [],
}));

test("more than 100 GitHub releases: every one is listed", { skip: !BROWSER && "no Edge or Chrome" }, async () => {
  releases = MANY;
  apiStatus = 200;
  failPage = 0;
  pagesAsked.length = 0;
  const api = encodeURIComponent(`${base}/fake-api/releases?many`);
  const html = await dumpDom(`${base}/updates/?api=${api}#v2.0.0`);
  const versions = listVersions(html);

  assert.match(html, /data-releases="github"/);
  assert.deepEqual(pagesAsked, [1, 2]);
  assert.equal(versions.length, 130 + 12, "130 GitHub releases + 12 old entries");
  assert.equal(versions[0], "v2.0.129");
  assert.equal(versions[129], "v2.0.0", "the oldest GitHub release, on page 2, is listed");
  assert.equal(versions.at(-1), "v0.1.0");
  assert.match(text(html), /Release number 0 /, "the release from page 2 opens");
});

test("when page 2 fails, the releases of page 1 still show", { skip: !BROWSER && "no Edge or Chrome" }, async () => {
  releases = MANY;
  apiStatus = 200;
  failPage = 2;
  const api = encodeURIComponent(`${base}/fake-api/releases?page2fails`);
  const html = await dumpDom(`${base}/updates/?api=${api}`);
  failPage = 0;
  const versions = listVersions(html);
  assert.match(html, /data-releases="partial"/);
  assert.equal(versions.length, 100 + 12);
  assert.equal(versions[0], "v2.0.129");
  assert.equal(versions.at(-1), "v0.1.0");
});

test("an old entry still opens with its own screenshot", { skip: !BROWSER && "no Edge or Chrome" }, async () => {
  releases = [NEW_RELEASE];
  apiStatus = 200;
  const api = encodeURIComponent(`${base}/fake-api/releases`);
  const html = await dumpDom(`${base}/updates/?api=${api}#v0.5.14`);
  const t = text(html);
  assert.match(t, /Move panes between tabs and see where they land/);
  assert.match(html, /<img src="shots\/v0-5-14\.png"/);
  assert.doesNotMatch(t, /v0\.5\.14 Latest/);
});

test("when GitHub cannot be reached, the old entries stay", { skip: !BROWSER && "no Edge or Chrome" }, async () => {
  apiStatus = 403;
  const api = encodeURIComponent(`${base}/fake-api/releases?limited`);
  const html = await dumpDom(`${base}/updates/?api=${api}`);
  assert.match(html, /data-releases="local"/);
  const versions = listVersions(html);
  assert.equal(versions.length, 12);
  assert.equal(versions[0], "v0.5.28");
  assert.match(text(html), /v0\.5\.28 Latest/);
});
