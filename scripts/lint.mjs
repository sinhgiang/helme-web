// Lint for a site with no dependencies: every script must parse, every JSON file and JSON-LD block
// must be valid JSON, and a few things that break a page quietly are caught (a duplicate id,
// a leftover console.log or debugger). Run it with `npm run lint`. It reads files and changes nothing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SKIP = new Set([".git", "node_modules", ".vercel", ".internal", "inbox"]);

export function listFiles(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    // Folders that start with a dot are tooling, not the site (.git, .vercel, the browser profile
    // the page tests create in .test-profile, which changes while the tests run).
    if (SKIP.has(name) || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

// Inline <script> blocks of an HTML file: { type, body }.
export function inlineScripts(html) {
  const found = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    const type = (/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1]) || [])[1] || "text/javascript";
    found.push({ type, body: m[2] });
  }
  return found;
}

// Returns a list of problems; each is "<file>: <what is wrong>".
export function lintFile(file, text) {
  const problems = [];
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const ext = extname(file).toLowerCase();
  const fail = (msg) => problems.push(`${rel}: ${msg}`);

  if (ext === ".json") {
    try {
      JSON.parse(text);
    } catch (e) {
      fail(`not valid JSON (${e.message})`);
    }
  } else if (ext === ".js") {
    // Browser scripts are classic scripts, not modules.
    try {
      new vm.Script(text, { filename: rel });
    } catch (e) {
      fail(`does not parse (${e.message})`);
    }
  } else if (ext === ".mjs") {
    const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (r.status !== 0) fail(`does not parse (${(r.stderr || "").split("\n").find((l) => /Error/.test(l)) || "syntax error"})`);
  } else if (ext === ".html") {
    for (const s of inlineScripts(text)) {
      if (s.type === "application/ld+json") {
        try {
          JSON.parse(s.body);
        } catch (e) {
          fail(`a JSON-LD block is not valid JSON (${e.message})`);
        }
      } else if (/javascript|module/.test(s.type)) {
        try {
          new vm.Script(s.body, { filename: rel });
        } catch (e) {
          fail(`an inline script does not parse (${e.message})`);
        }
      }
    }
    const ids = new Map();
    for (const m of text.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
    for (const [id, n] of ids) if (n > 1) fail(`id "${id}" is used ${n} times`);
    if (!/<!doctype html>/i.test(text)) fail("no <!doctype html>");
    if (!/<html[^>]*\slang=/i.test(text)) fail("<html> has no lang");
  } else if (ext === ".css") {
    const bare = text.replace(/\/\*[\s\S]*?\*\//g, "");
    const open = (bare.match(/{/g) || []).length;
    const close = (bare.match(/}/g) || []).length;
    if (open !== close) fail(`unbalanced braces (${open} "{" and ${close} "}")`);
  }

  // Leftovers of debugging in the shipped scripts (the tests and scripts/ may print).
  if (ext === ".js" && /(^|[^.\w])(console\.log\s*\(|debugger\s*;)/m.test(text.replace(/\/\/.*$/gm, ""))) {
    fail("has a console.log or debugger left in");
  }
  return problems;
}

export function lintAll() {
  const problems = [];
  let checked = 0;
  for (const file of listFiles()) {
    if (![".json", ".js", ".mjs", ".html", ".css"].includes(extname(file).toLowerCase())) continue;
    checked += 1;
    problems.push(...lintFile(file, readFileSync(file, "utf8")));
  }
  return { checked, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { checked, problems } = lintAll();
  if (problems.length) {
    console.error(problems.map((p) => `  ${p}`).join("\n"));
    console.error(`\nlint: ${problems.length} problem(s) in ${checked} files`);
    process.exit(1);
  }
  console.log(`lint: ${checked} files, no problems`);
}
