// Renders the release list and the selected release. Entries come from releases.js (versions up to
// v0.5.28) and from the GitHub releases of sinhgiang/helme-web (every newer version), merged by
// releases-core.js. The page shows the local entries at once and adds the GitHub ones when they arrive.
(function () {
  var core = window.HelmeReleases;
  var local = window.HELME_RELEASES || [];
  var releases = core.merge(local, []);
  var list = document.getElementById("rel-list");
  var view = document.getElementById("rel");

  var SECTIONS = [
    ["new", "New"],
    ["improved", "Improved"],
    ["fixed", "Fixed"],
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Text with `code` spans, built without innerHTML.
  function rich(tag, cls, text) {
    var e = el(tag, cls);
    String(text).split("`").forEach(function (part, i) {
      if (!part) return;
      e.appendChild(i % 2 ? el("code", null, part) : document.createTextNode(part.replace(/\*\*/g, "")));
    });
    return e;
  }

  function niceDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function renderList() {
    list.innerHTML = "";
    releases.forEach(function (r, i) {
      var a = el("a", "rel-item");
      a.href = "#" + r.version;
      a.dataset.id = r.version;
      var top = el("span", "ri-top");
      top.appendChild(el("span", "ri-ver", r.version));
      if (i === 0) top.appendChild(el("span", "badge", "Latest"));
      a.appendChild(top);
      a.appendChild(el("span", "ri-date", niceDate(r.date)));
      a.appendChild(el("span", "ri-title", r.title));
      list.appendChild(a);
    });
  }

  function render(id) {
    if (!releases.length) { view.textContent = "No releases yet."; return; }
    var i = releases.findIndex(function (r) { return r.version === id; });
    if (i < 0) i = 0;
    var r = releases[i];

    view.innerHTML = "";
    var meta = el("div", "rel-meta");
    meta.appendChild(el("span", "rel-ver", r.version));
    if (i === 0) meta.appendChild(el("span", "badge", "Latest"));
    var time = el("time", "rel-date", niceDate(r.date));
    time.setAttribute("datetime", r.date);
    meta.appendChild(time);
    view.appendChild(meta);
    if (r.includes) view.appendChild(el("p", "rel-includes", "Includes " + r.includes));

    view.appendChild(rich("h2", "rel-title", r.title));
    if (r.summary) view.appendChild(rich("p", "rel-summary", r.summary));

    if (r.shot) {
      var fig = el("figure", "rel-shot");
      var link = el("a");
      link.href = r.shot.src;
      link.target = "_blank";
      link.rel = "noopener";
      var img = el("img");
      img.src = r.shot.src;
      img.alt = r.shot.alt || "";
      img.width = 1800;
      img.height = 1080;
      img.decoding = "async";
      link.appendChild(img);
      fig.appendChild(link);
      fig.appendChild(el("figcaption", null, (r.shot.alt || "") + " · Helme " + r.version + ", sample data"));
      view.appendChild(fig);
    }

    SECTIONS.forEach(function (s) {
      var items = r[s[0]];
      if (!items || !items.length) return;
      var sec = el("section", "rel-sec");
      sec.appendChild(el("h3", "lbl lbl-" + s[0], s[1]));
      var ul = el("ul");
      items.forEach(function (t) { ul.appendChild(rich("li", null, t)); });
      sec.appendChild(ul);
      view.appendChild(sec);
    });

    // Older / newer
    var pn = el("div", "rel-pn");
    if (i < releases.length - 1) {
      var older = el("a", "pn older");
      older.href = "#" + releases[i + 1].version;
      older.appendChild(el("small", null, "Older"));
      older.appendChild(document.createTextNode(releases[i + 1].version));
      pn.appendChild(older);
    }
    if (i > 0) {
      var newer = el("a", "pn newer");
      newer.href = "#" + releases[i - 1].version;
      newer.appendChild(el("small", null, "Newer"));
      newer.appendChild(document.createTextNode(releases[i - 1].version));
      pn.appendChild(newer);
    }
    view.appendChild(pn);

    Array.prototype.forEach.call(list.children, function (a) {
      var on = a.dataset.id === r.version;
      a.classList.toggle("on", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        // keep the selected chip visible in the phone strip
        if (list.scrollWidth > list.clientWidth) {
          list.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
        }
      } else {
        a.removeAttribute("aria-current");
      }
    });
    document.title = "Helme " + r.version + " · Updates";
  }

  function current() { return decodeURIComponent(location.hash.slice(1)); }

  window.addEventListener("hashchange", function () {
    render(current());
    var top = view.getBoundingClientRect().top + window.scrollY - 80;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  });

  renderList();
  render(current());

  // GitHub releases. On a local test server the tests point the page at a fake API with ?api=...;
  // on the real site the address is fixed.
  var api = core.API_URL;
  var override = new URLSearchParams(location.search).get("api");
  if (override && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) api = override;

  var CACHE_KEY = "helme-releases:" + api;
  var CACHE_MS = 5 * 60 * 1000;

  function apply(data) {
    if (!Array.isArray(data)) return;
    releases = core.merge(local, data);
    renderList();
    render(current());
    document.documentElement.dataset.releases = "github";
  }

  try {
    var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.at < CACHE_MS) { apply(cached.data); return; }
  } catch (e) { /* storage may be blocked */ }

  fetch(api, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) { if (!res.ok) throw new Error("GitHub " + res.status); return res.json(); })
    .then(function (data) {
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
      apply(data);
    })
    .catch(function () {
      // Rate limit or offline: the entries from releases.js stay on screen.
      document.documentElement.dataset.releases = "local";
    });
})();
