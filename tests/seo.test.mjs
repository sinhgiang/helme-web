// SEO, AEO and brand-voice checks on the static files. No browser needed. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const ORIGIN = "https://helme-web.vercel.app";

const PAGES = [
  { file: "index.html", url: `${ORIGIN}/` },
  { file: "updates/index.html", url: `${ORIGIN}/updates/` },
];

const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`));
  return m && m[1];
};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const squash = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}

test("every page has its own title, description, canonical and share tags", () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const p of PAGES) {
    const html = read(p.file);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const desc = meta(html, "name", "description");
    assert.ok(title.length >= 15 && title.length <= 70, `${p.file}: title length ${title.length}`);
    assert.ok(desc.length >= 70 && desc.length <= 165, `${p.file}: description length ${desc && desc.length}`);
    assert.ok(!titles.has(title), `${p.file}: title repeats`);
    assert.ok(!descriptions.has(desc), `${p.file}: description repeats`);
    titles.add(title);
    descriptions.add(desc);
    assert.match(html, /<html lang="en">/);
    assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)[1], p.url);
    assert.equal(meta(html, "property", "og:url"), p.url);
    assert.equal(meta(html, "property", "og:image"), `${ORIGIN}/og.png`);
    assert.ok(meta(html, "property", "og:image:alt"), `${p.file}: og:image:alt`);
    assert.equal(meta(html, "property", "og:site_name"), "Helme");
    assert.equal(meta(html, "name", "twitter:card"), "summary_large_image");
    assert.ok(meta(html, "name", "twitter:title") && meta(html, "name", "twitter:description") && meta(html, "name", "twitter:image"));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${p.file}: exactly one h1`);
  }
});

test("robots.txt allows the site and names the sitemap; the sitemap lists every page once", () => {
  const robots = read("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${ORIGIN}/sitemap\\.xml$`, "m"));

  const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs.sort(), PAGES.map((p) => p.url).sort());
});

test("llms.txt describes the site and every link in it points at a page that exists", () => {
  const txt = read("llms.txt");
  assert.match(txt, /^# Helme$/m);
  assert.match(txt, /^> .{80,}/m, "a summary line");
  const links = [...txt.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 3);
  for (const l of links.filter((l) => l.startsWith(ORIGIN))) {
    const path = l.slice(ORIGIN.length) || "/";
    assert.ok(PAGES.some((p) => p.url === `${ORIGIN}${path}`), `llms.txt links to a page the site does not have: ${l}`);
  }
  assert.match(txt, /not yet available to download/i, "llms.txt keeps saying Helme cannot be downloaded");
});

test("the FAQPage JSON-LD is word for word the visible FAQ", () => {
  const html = read("index.html");
  const faq = jsonLd(html).flatMap((b) => b["@graph"] || [b]).find((b) => b["@type"] === "FAQPage");
  assert.ok(faq, "FAQPage block");
  const shown = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)]
    .map((m) => [squash(m[1]), squash(m[2])]);
  const marked = faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
  assert.ok(shown.length >= 8);
  assert.deepEqual(marked, shown);
});

test("every JSON-LD block parses and names real things", () => {
  for (const p of PAGES) {
    const blocks = jsonLd(read(p.file));
    assert.ok(blocks.length >= 1, `${p.file}: structured data`);
    for (const b of blocks) assert.equal(b["@context"], "https://schema.org");
  }
  const types = jsonLd(read("index.html")).flatMap((b) => b["@graph"]).map((b) => b["@type"]);
  assert.deepEqual(types.sort(), ["FAQPage", "SoftwareApplication", "WebPage", "WebSite"]);
  const app = jsonLd(read("index.html"))[0]["@graph"].find((b) => b["@type"] === "SoftwareApplication");
  assert.equal(app.operatingSystem, "Windows");
  assert.equal(app.offers, undefined, "no price is claimed while Helme cannot be downloaded");
});

test("the home page and the Updates page link to each other, and 404.html is not indexed", () => {
  assert.match(read("index.html"), /<nav class="nav-links"[\s\S]*?href="updates\/"/);
  assert.match(read("updates/index.html"), /href="\.\.\/"/);
  assert.match(read("404.html"), /<meta name="robots" content="noindex">/);
  assert.ok(existsSync(`${ROOT}og.png`) && existsSync(`${ROOT}favicon.svg`));
});

test("the page text keeps the brand voice: no hype words, no claim that Helme can be downloaded", () => {
  const banned = /\b(revolutionary|unleash|seamless(ly)?|supercharge[sd]?|game-changer|elevate|effortless(ly)?|10x|cutting-edge|next-generation|AI-powered)\b/i;
  for (const f of ["index.html", "updates/index.html", "404.html", "llms.txt"]) {
    const t = squash(read(f).replace(/<script[\s\S]*?<\/script>/g, " "));
    assert.doesNotMatch(t, banned, `${f}: hype word`);
    assert.doesNotMatch(t, /\w!(\s|$)/, `${f}: exclamation mark`);
  }
  const t = squash(read("index.html"));
  assert.match(t, /Can I download it\? Not yet\./);
});
