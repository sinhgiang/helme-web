// Renders every <section class="shot" id="..."> of source.html to <id>.png with headless Edge or Chrome.
// Usage: node updates/shots/render.mjs [id ...]   (no id: all shots)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "source.html");
const browsers = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const browser = browsers.find((b) => existsSync(b));
if (!browser) throw new Error("No Edge or Chrome found; set BROWSER to its path.");

const all = [...readFileSync(source, "utf8").matchAll(/<section class="shot" id="([^"]+)"/g)].map((m) => m[1]);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;

for (const id of ids) {
  if (!all.includes(id)) throw new Error(`No shot with id ${id} in source.html`);
  const out = join(here, `${id}.png`);
  execFileSync(browser, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--window-size=1200,720", "--force-device-scale-factor=1.5",
    "--virtual-time-budget=3000", `--screenshot=${out}`,
    `${pathToFileURL(source).href}#${id}`,
  ], { stdio: "ignore" });
  console.log(`rendered ${id}.png`);
}
