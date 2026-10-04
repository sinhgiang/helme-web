// Renders the release list and the selected release from window.HELME_RELEASES (releases.js).
(function () {
  var releases = window.HELME_RELEASES || [];
  var list = document.getElementById("rel-list");
  var view = document.getElementById("rel");
  if (!releases.length) { view.textContent = "No releases yet."; return; }

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

  function niceDate(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function idOf(r) { return r.version; }

  // Left column (or the strip on phones)
  releases.forEach(function (r, i) {
    var a = el("a", "rel-item");
    a.href = "#" + idOf(r);
    a.dataset.id = idOf(r);
    var top = el("span", "ri-top");
    top.appendChild(el("span", "ri-ver", r.version));
    if (i === 0) top.appendChild(el("span", "badge", "Latest"));
    a.appendChild(top);
    a.appendChild(el("span", "ri-date", niceDate(r.date)));
    a.appendChild(el("span", "ri-title", r.title));
    list.appendChild(a);
  });

  function render(id) {
    var i = releases.findIndex(function (r) { return idOf(r) === id; });
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

    view.appendChild(el("h2", "rel-title", r.title));
    if (r.summary) view.appendChild(el("p", "rel-summary", r.summary));

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
      items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      sec.appendChild(ul);
      view.appendChild(sec);
    });

    // Older / newer
    var pn = el("div", "rel-pn");
    if (i < releases.length - 1) {
      var older = el("a", "pn older");
      older.href = "#" + idOf(releases[i + 1]);
      older.innerHTML = "<small>Older</small>";
      older.appendChild(document.createTextNode(releases[i + 1].version));
      pn.appendChild(older);
    }
    if (i > 0) {
      var newer = el("a", "pn newer");
      newer.href = "#" + idOf(releases[i - 1]);
      newer.innerHTML = "<small>Newer</small>";
      newer.appendChild(document.createTextNode(releases[i - 1].version));
      pn.appendChild(newer);
    }
    view.appendChild(pn);

    Array.prototype.forEach.call(list.children, function (a) {
      var on = a.dataset.id === idOf(r);
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
  render(current());
})();
