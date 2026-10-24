// The lint and build checks must fail on a broken site, not only pass on the good one.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lintFile, lintAll } from "../scripts/lint.mjs";
import { checkHtml, buildCheck, fileForUrlPath, htmlReferences } from "../scripts/build.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const page = (body, head = "") => `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`;
const htmlProblems = (html) => {
  const problems = [];
  checkHtml(join(ROOT, "index.html"), html, problems);
  return problems;
};

test("the real site passes lint and the build check", () => {
  assert.deepEqual(lintAll().problems, []);
  assert.deepEqual(buildCheck().problems, []);
});

test("lint: a script that does not parse fails", () => {
  assert.equal(lintFile(join(ROOT, "x.js"), "var a = ;").length, 1);
  assert.equal(lintFile(join(ROOT, "x.js"), "var a = 1;").length, 0);
});

test("lint: invalid JSON and invalid JSON-LD fail", () => {
  assert.equal(lintFile(join(ROOT, "v.json"), "{ nope }").length, 1);
  const bad = page("", '<script type="application/ld+json">{ "a": }</script>');
  assert.match(lintFile(join(ROOT, "p.html"), bad)[0], /JSON-LD/);
  const good = page("", '<script type="application/ld+json">{ "a": 1 }</script>');
  assert.deepEqual(lintFile(join(ROOT, "p.html"), good), []);
});

test("lint: a duplicate id, a missing lang and unbalanced CSS fail", () => {
  assert.match(lintFile(join(ROOT, "p.html"), page('<i id="a"></i><b id="a"></b>'))[0], /used 2 times/);
  assert.match(lintFile(join(ROOT, "p.html"), "<!doctype html><html><body></body></html>")[0], /lang/);
  assert.match(lintFile(join(ROOT, "s.css"), "a { color: red;")[0], /unbalanced/);
});

test("lint: console.log in a shipped script fails, in a comment it does not", () => {
  assert.match(lintFile(join(ROOT, "x.js"), "console.log(1);")[0], /console\.log/);
  assert.deepEqual(lintFile(join(ROOT, "x.js"), "// console.log(1);\nvar a = 1;"), []);
});

test("build: a link to a missing file, a missing anchor and a missing image fail", () => {
  assert.equal(htmlProblems(page('<a href="nowhere/">x</a>')).length, 1);
  assert.equal(htmlProblems(page('<a href="#ghost">x</a>')).length, 1);
  assert.equal(htmlProblems(page('<img src="missing.png" alt="">')).length, 1);
  assert.equal(htmlProblems(page("", '<meta property="og:image" content="https://helme-web.vercel.app/missing.png">')).length, 1);
});

test("build: links that exist, other sites, mailto and anchors with an id pass", () => {
  const ok = page('<a href="updates/">u</a><a href="https://example.org/x">x</a><a href="mailto:ten@example.com">m</a><i id="faq"></i><a href="#faq">f</a><link rel="stylesheet" href="styles.css">');
  assert.deepEqual(htmlProblems(ok), []);
});

test("build: a Vercel-style URL path finds index.html, and a path outside the site finds nothing", () => {
  assert.ok(fileForUrlPath("/updates/").endsWith("index.html"));
  assert.equal(fileForUrlPath("/../package.json"), null);
  assert.equal(htmlReferences('<a href="a/">x</a><img srcset="b.png 1x, c.png 2x">').length, 3);
});
