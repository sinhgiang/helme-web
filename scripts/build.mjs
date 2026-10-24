// The site has no build step: the folder is what Vercel serves. This is the build check instead.
// It "builds" the site the way a visitor reaches it and fails when the result is broken:
// every local link, script, stylesheet, image and url() must point at a file that exists, every
// #anchor must have its id, every page listed in sitemap.xml must exist, and every entry in
// updates/releases.js must have a unique version and a screenshot file. Run it with `npm run build`.
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { listFiles } from "./lint.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const ORIGIN = "https://helme-web.vercel.app";
const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");

// The file Vercel serves for a URL path ("/updates/" -> updates/index.html), or null.
export function fileForUrlPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]).replace(/^\/+/, "");
  const target = join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, "index.html");
  if (existsSync(index)) return index;
  if (existsSync(target + ".html")) return target + ".html";
  return null;
}

// Local references in an HTML file: { url, kind } with kind "page" for a link or "asset" otherwise.
export function htmlReferences(html) {
  const refs = [];
  for (const m of html.matchAll(/<(a|link|script|img|source|iframe)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const attr = tag === "a" || tag === "link" ? "href" : "src";
    const v = new RegExp(`\\s${attr}\\s*=\\s*["']([^"']*)["']`, "i").exec(m[2]);
    if (v) refs.push({ url: v[1], kind: tag === "a" ? "page" : "asset" });
    const set = /\ssrcset\s*=\s*["']([^"']*)["']/i.exec(m[2]);
    if (set) for (const part of set[1].split(",")) refs.push({ url: part.trim().split(/\s+/)[0], kind: "asset" });
  }
  for (const m of html.matchAll(/<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["'][^>]*\bcontent\s*=\s*["']([^"']+)["']/gi)) {
    refs.push({ url: m[1], kind: "asset" });
  }
  for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) refs.push({ url: m[1], kind: "asset" });
  return refs.filter((r) => r.url);
}

export function checkHtml(file, html, problems) {
  const dir = dirname(file);
  const ids = new Set([...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]));
  for (const { url } of htmlReferences(html)) {
    if (/^(mailto:|tel:|data:|javascript:)/i.test(url)) continue;
    if (url.startsWith("#")) {
      if (url.length > 1 && url !== "#top" && !ids.has(url.slice(1))) problems.push(`${rel(file)}: link ${url} has no element with that id`);
      continue;
    }
    let urlPath;
    if (/^https?:\/\//i.test(url)) {
      if (!url.startsWith(ORIGIN)) continue; // somebody else's site: not ours to check
      urlPath = url.slice(ORIGIN.length) || "/";
    } else if (url.startsWith("//")) continue;
    else if (url.startsWith("/")) urlPath = url;
    else urlPath = "/" + rel(join(dir, url.split(/[?#]/)[0])) + (url.split(/[?#]/)[0].endsWith("/") ? "/" : "");
    const target = fileForUrlPath(urlPath);
    if (!target) problems.push(`${rel(file)}: ${url} points at a file that does not exist`);
  }
}

export function checkSitemap(problems) {
  const file = join(ROOT, "sitemap.xml");
  if (!existsSync(file)) return;
  for (const m of readFileSync(file, "utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    if (!m[1].startsWith(ORIGIN)) {
      problems.push(`sitemap.xml: ${m[1]} is not on ${ORIGIN}`);
      continue;
    }
    if (!fileForUrlPath(m[1].slice(ORIGIN.length) || "/")) problems.push(`sitemap.xml: ${m[1]} is not a page of this site`);
  }
}

export function checkReleases(problems) {
  const file = join(ROOT, "updates", "releases.js");
  if (!existsSync(file)) return;
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(readFileSync(file, "utf8"), sandbox, { filename: "updates/releases.js" });
  } catch (e) {
    problems.push(`updates/releases.js: cannot be run (${e.message})`);
    return;
  }
  const list = sandbox.window.HELME_RELEASES;
  if (!Array.isArray(list) || !list.length) {
    problems.push("updates/releases.js: HELME_RELEASES is not a list with entries");
    return;
  }
  const seen = new Set();
  for (const r of list) {
    if (!/^v\d+\.\d+\.\d+$/.test(r.version || "")) problems.push(`updates/releases.js: "${r.version}" is not a version like v0.5.28`);
    if (seen.has(r.version)) problems.push(`updates/releases.js: ${r.version} appears twice`);
    seen.add(r.version);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date || "")) problems.push(`updates/releases.js: ${r.version} has no date like 2026-10-03`);
    if (!r.title) problems.push(`updates/releases.js: ${r.version} has no title`);
    if (!r.shot || !r.shot.src) problems.push(`updates/releases.js: ${r.version} has no screenshot (every update needs a picture)`);
    else if (!existsSync(join(ROOT, "updates", r.shot.src))) problems.push(`updates/releases.js: ${r.version} screenshot ${r.shot.src} does not exist`);
    else if (!r.shot.alt) problems.push(`updates/releases.js: ${r.version} screenshot has no alt text`);
  }
}

export function buildCheck() {
  const problems = [];
  const pages = listFiles().filter((f) => extname(f) === ".html");
  for (const page of pages) checkHtml(page, readFileSync(page, "utf8"), problems);
  for (const css of listFiles().filter((f) => extname(f) === ".css")) {
    const dir = dirname(css);
    for (const m of readFileSync(css, "utf8").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      const u = m[1];
      if (/^(data:|https?:|\/\/|#)/i.test(u)) continue;
      const target = u.startsWith("/") ? fileForUrlPath(u) : fileForUrlPath("/" + rel(join(dir, u.split(/[?#]/)[0])));
      if (!target) problems.push(`${rel(css)}: url(${u}) points at a file that does not exist`);
    }
  }
  checkSitemap(problems);
  checkReleases(problems);
  return { pages: pages.length, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { pages, problems } = buildCheck();
  if (problems.length) {
    console.error(problems.map((p) => `  ${p}`).join("\n"));
    console.error(`\nbuild: ${problems.length} problem(s) in ${pages} pages`);
    process.exit(1);
  }
  console.log(`build: ${pages} pages, every link, asset, anchor and release entry resolves`);
}
