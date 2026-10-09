// Turns GitHub releases of sinhgiang/helme-web into Updates entries and merges them with the
// entries in releases.js. Used by updates.js in the browser and by the tests under tests/.
(function (root, factory) {
  var core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  else root.HelmeReleases = core;
})(typeof self !== "undefined" ? self : this, function () {
  var REPO = "sinhgiang/helme-web";
  var API_URL = "https://api.github.com/repos/" + REPO + "/releases";
  var PER_PAGE = 100; // the most GitHub returns in one page
  var MAX_PAGES = 50; // a stop for a server that never sends a short page
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

  // The fields of a GitHub release that fromGitHub reads, so the cached list stays small.
  function slim(rel) {
    if (!rel || typeof rel !== "object") return rel;
    return {
      tag_name: rel.tag_name,
      name: rel.name,
      body: rel.body,
      draft: rel.draft,
      prerelease: rel.prerelease,
      published_at: rel.published_at,
      created_at: rel.created_at,
      html_url: rel.html_url,
      assets: (rel.assets || []).map(function (a) {
        return a && { name: a.name, label: a.label, browser_download_url: a.browser_download_url };
      }),
    };
  }

  function pageUrl(api, page, base) {
    var url = new URL(api, base);
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));
    return url.href;
  }

  // Every release, page by page, until GitHub sends a page with fewer than PER_PAGE releases.
  // Resolves { releases, complete }. complete is false when a later page failed: the releases of the
  // pages read so far are still returned. Rejects when the first page fails.
  function fetchAll(api, fetchFn, base) {
    var all = [];
    function next(page) {
      return fetchFn(pageUrl(api, page, base), { headers: { Accept: "application/vnd.github+json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("GitHub " + res.status);
          return res.json();
        })
        .then(function (data) {
          if (!Array.isArray(data)) throw new Error("GitHub sent no list");
          return data;
        })
        .then(function (data) {
          data.forEach(function (r) { all.push(slim(r)); });
          if (data.length < PER_PAGE) return { releases: all, complete: true };
          if (page >= MAX_PAGES) return { releases: all, complete: false };
          return next(page + 1);
        }, function (err) {
          if (page === 1) throw err;
          return { releases: all, complete: false };
        });
    }
    return next(1);
  }

  return {
    REPO: REPO,
    API_URL: API_URL,
    PER_PAGE: PER_PAGE,
    MAX_PAGES: MAX_PAGES,
    slim: slim,
    pageUrl: pageUrl,
    fetchAll: fetchAll,
    parseVersion: parseVersion,
    compareVersions: compareVersions,
    parseBody: parseBody,
    fromGitHub: fromGitHub,
    merge: merge,
  };
});
