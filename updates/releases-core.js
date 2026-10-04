// Turns GitHub releases of sinhgiang/helme-web into Updates entries and merges them with the
// entries in releases.js. Used by updates.js in the browser and by the tests under tests/.
(function (root, factory) {
  var core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  else root.HelmeReleases = core;
})(typeof self !== "undefined" ? self : this, function () {
  var REPO = "sinhgiang/helme-web";
  var API_URL = "https://api.github.com/repos/" + REPO + "/releases?per_page=100";
  var TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
  var SECTIONS = { new: "new", improved: "improved", fixed: "fixed" };

  function parseVersion(v) {
    var m = TAG.exec(String(v || "").trim());
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  }

  // Newest first.
  function compareVersions(a, b) {
    var x = parseVersion(a) || [0, 0, 0];
    var y = parseVersion(b) || [0, 0, 0];
    for (var i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i];
    return 0;
  }

  // Release notes format (Markdown):
  //   Summary paragraph(s)
  //   Includes v0.5.29 – v0.5.31        (optional line)
  //   ### New / ### Improved / ### Fixed, each followed by "- item" lines
  function parseBody(body) {
    var out = { summary: "", includes: "", new: [], improved: [], fixed: [] };
    var summary = [];
    var section = null; // null: before any heading; "": an unknown heading
    var lines = String(body || "").replace(/\r\n?/g, "\n").split("\n");
    lines.forEach(function (raw) {
      var line = raw.trim();
      var heading = /^#{1,6}\s+(.+?)\s*#*$/.exec(line);
      if (heading) {
        section = SECTIONS[heading[1].toLowerCase().replace(/[^a-z]/g, "")] || "";
        return;
      }
      if (section === null) {
        var inc = /^includes:?\s+(.+)$/i.exec(line);
        if (inc) out.includes = inc[1].trim();
        else summary.push(line);
        return;
      }
      if (!section || !line) return;
      var item = /^[-*+]\s+(.+)$/.exec(line);
      var list = out[section];
      if (item) list.push(item[1].trim());
      else if (list.length && /^\s/.test(raw)) list[list.length - 1] += " " + line;
    });
    out.summary = summary.join("\n").replace(/\n{2,}/g, "\n\n").trim().replace(/\s*\n\s*/g, " ");
    return out;
  }

  // One GitHub release -> one Updates entry, or null when it is not a published Helme version.
  function fromGitHub(rel) {
    if (!rel || rel.draft || rel.prerelease) return null;
    var version = String(rel.tag_name || "").trim();
    if (!parseVersion(version)) return null;
    var notes = parseBody(rel.body);
    var title = String(rel.name || "").trim();
    title = title.replace(new RegExp("^" + version.replace(/\./g, "\\.") + "\\s*[:\\-–—·|]?\\s*"), "").trim();
    var entry = {
      version: version,
      date: String(rel.published_at || rel.created_at || "").slice(0, 10),
      title: title || "Helme " + version,
      summary: notes.summary,
      source: "github",
      url: rel.html_url || "",
    };
    if (notes.includes) entry.includes = notes.includes;
    ["new", "improved", "fixed"].forEach(function (k) { if (notes[k].length) entry[k] = notes[k]; });
    var shot = (rel.assets || []).filter(function (a) {
      return a && /^screenshot\.png$/i.test(a.name || "") && a.browser_download_url;
    })[0];
    if (shot) {
      entry.shot = {
        src: shot.browser_download_url,
        alt: (shot.label || "").trim() || "Helme " + version + " with sample projects",
      };
    }
    return entry;
  }

  // Entries from releases.js plus GitHub releases. A GitHub release replaces a local entry with
  // the same version. Newest first.
  function merge(local, releases) {
    var byVersion = {};
    (local || []).forEach(function (e) { if (e && e.version) byVersion[e.version] = e; });
    (releases || []).forEach(function (r) {
      var e = fromGitHub(r);
      if (e) byVersion[e.version] = e;
    });
    return Object.keys(byVersion).map(function (k) { return byVersion[k]; }).sort(function (a, b) {
      return compareVersions(a.version, b.version);
    });
  }

  return {
    REPO: REPO,
    API_URL: API_URL,
    parseVersion: parseVersion,
    compareVersions: compareVersions,
    parseBody: parseBody,
    fromGitHub: fromGitHub,
    merge: merge,
  };
});
