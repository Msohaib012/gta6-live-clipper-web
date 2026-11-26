/* ArenaFlix website visitor counter v3.
   Writes to the SAME Firebase RTDB the Android app uses, in the exact
   shapes the published secure rules allow:
   - presence/{id} = { ts: <ms>, d: "YYYY-MM-DD", pg: page }   (heartbeat)
   - daily/{date}/{id} = 1                                 (unique/day)
   - hits/{date}/{pageKey}/{id} = 1                        (pages + title views;
         watch pages use w_m_/w_t_ so plays count separately)
   - pv/{date}/{pageKey}/{viewId} = 1                      (EVERY page view)
   - sess/{startDate}/{sid} = { a: startMs, b: lastMs }   (session duration)
   - hr/{date}/{pktHour}/{id} = 1                          (rush hours, PKT)
   - src/{date}/{sourceKey}/{id} = 1                       (traffic source)
   - ref/{date}/{hostKey}/{id} = 1                         (exact referring site)
   - dev/{date}/{devKey}/{id} = 1                          (device type)
   - brw/{date}/{browserKey}/{id} = 1                      (browser name;
         Chrome, Samsung Internet, Edge, Firefox, Opera, Safari,
         UC Browser, other — added 2026-11-13)
   - geo/{date}/{countryCode}/{id} = 1                     (country, via /api/geo)
   - qs/{date}/{searchTerm}/{id} = 1                       (site search box terms)
   - qz/{date}/{searchTerm}/{id} = 1                       (searches with no result)
   Ids are af_-prefixed; website ids carry af_web_. Dates are PKT
   (UTC+5) since 2026-11-02. Everything is best-effort and silent. */
(function () {
  /* Stats + login pages never count themselves (owner order 2026-11-02):
     a visit to /stats or /login writes nothing at all — no presence,
     no daily unique, no source/device/country record. */
  try {
    var _p0 = location.pathname.replace(/\.html$/, "");
    if (_p0 === "/stats" || _p0 === "/login" || _p0 === "/stats-manual") return;
  } catch (e) {}
  /* --- Bot detection (2026-11-16): crawlers inflate the visitor
     counters. A bot is recorded ONLY as a labelled bot (src key
     "bot_<name>") and skips every real-visitor counter — presence,
     daily, hits, pv, dev, brw, geo, hr, sess, qs — so the headline
     numbers show real people only, and the stats page can show the
     bot traffic separately. No Firebase rules change needed: /src
     already accepts any [a-z0-9_]+ key. --- */
  function botKey() {
    var ua = "";
    try { ua = (navigator.userAgent || "").toLowerCase(); } catch (e) {}
    try { if (navigator.webdriver) return "headless"; } catch (e) {}
    if (ua.indexOf("headlesschrome") >= 0) return "headless";
    var map = [
      ["googlebot", "googlebot"], ["bingbot", "bingbot"],
      ["gptbot", "gptbot"], ["chatgpt-user", "gptbot"], ["oai-searchbot", "gptbot"],
      ["claudebot", "claudebot"], ["anthropic-ai", "claudebot"], ["claude-web", "claudebot"],
      ["perplexitybot", "perplexitybot"], ["duckduckbot", "duckduckbot"],
      ["baiduspider", "baiduspider"], ["yandexbot", "yandexbot"],
      ["applebot", "applebot"], ["ccbot", "ccbot"], ["bytespider", "bytespider"],
      ["slurp", "yahoo"], ["sogou", "sogou"], ["exabot", "exabot"],
      ["facebot", "facebook"], ["ia_archiver", "alexa"],
      ["semrushbot", "seo_crawler"], ["ahrefsbot", "seo_crawler"],
      ["mj12bot", "seo_crawler"], ["dotbot", "seo_crawler"],
      ["petalbot", "seo_crawler"], ["dataforseo", "seo_crawler"],
      ["msnbot", "bingbot"], ["teoma", "ask"],
      ["bot", "other_bot"], ["crawler", "other_bot"], ["spider", "other_bot"],
      ["scrapy", "other_bot"], ["phantomjs", "headless"], ["curl", "other_bot"],
      ["wget", "other_bot"], ["python-requests", "other_bot"], ["axios", "other_bot"]
    ];
    for (var i = 0; i < map.length; i++) {
      if (ua.indexOf(map[i][0]) >= 0) return map[i][1];
    }
    return null;
  }
  var BOT = botKey();
  var DB = "https://arenaflix-53ce8-default-rtdb.firebaseio.com";
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function deviceId() {
    var id = lsGet("af_web_device_id");
    if (!id) {
      id = "af_web_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
      lsSet("af_web_device_id", id);
    }
    return id;
  }
  var id = deviceId();
  function put(path) {
    try {
      fetch(DB + path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "1",
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }
  function dateKey() { return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10); } /* PKT day (UTC+5) since 2026-11-02 */
  if (BOT) {
    /* Bot: record once per day under the labelled bot source, then stop.
       No presence, no daily unique, no page hit — the bot is invisible
       to every real-visitor number. */
    try {
      var stamp = "af_web_bot_" + dateKey();
      if (!lsGet(stamp)) {
        lsSet(stamp, "1");
        put("/src/" + dateKey() + "/bot_" + BOT + "/" + id + ".json");
      }
    } catch (e) {}
    return;
  }

  /* --- presence heartbeat + daily unique (same as v1 / the app) --- */
  function beat() {
    if (window.navigator && window.navigator.onLine === false) return;
    var now = Date.now();
    var payload = { ts: now, d: dateKey() };
    var pk = pageKey();
    if (pk) payload.pg = pk;
    try {
      fetch(DB + "/presence/" + id + ".json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    put("/daily/" + dateKey() + "/" + id + ".json");
  }

  /* --- page / title hits --- */
  function pageKey() {
    var p = location.pathname.replace(/\.html$/, "");
    var q = new URLSearchParams(location.search);
    if (p === "/" || p === "") return "home";
    if (p === "/detail" || p === "/watch") {
      var tid = q.get("id");
      var tt = q.get("type");
      if (tid && /^\d+$/.test(tid)) {
        var base = (tt === "tv" ? "t_" : "m_") + tid;
        return p === "/watch" ? "w_" + base : base; /* plays counted apart */
      }
      return p.slice(1);
    }
    var m = p.match(/^\/([a-z]+)$/);
    if (m && ["movies", "tv", "anime", "asian", "search", "mylist", "settings", "category", "dice", "person"].indexOf(m[1]) >= 0) return m[1];
    return null; /* /stats and anything unknown: not counted */
  }
  var hitDone = {};
  var pvCount = 0;
  var lastHr = -1;
  function pktHour() { return new Date(Date.now() + 5 * 3600 * 1000).getUTCHours(); }
  function hit(countView) {
    var k = pageKey();
    if (!k) return;
    if (countView !== false) {
      /* every view counts toward total views */
      pvCount++;
      put("/pv/" + dateKey() + "/" + k + "/" + id + "_" + Date.now().toString(36) + pvCount + ".json");
      /* rush hour, once per PKT hour per session */
      var hr = pktHour();
      if (hr !== lastHr) { lastHr = hr; put("/hr/" + dateKey() + "/" + hr + "/" + id + ".json"); }
    }
    if (hitDone[k]) return;
    hitDone[k] = 1;
    put("/hits/" + dateKey() + "/" + k + "/" + id + ".json");
  }

  /* --- traffic source + device type, once per day --- */
  function sourceKey() {
    var r = document.referrer || "";
    if (!r) return "direct";
    var h = "";
    try { h = new URL(r).hostname; } catch (e) { return "other"; }
    if (!h || h.indexOf("arenaflix.co.uk") >= 0) return "direct";
    if (h.indexOf("google.") >= 0) return "google";
    if (h.indexOf("t.me") >= 0 || h.indexOf("telegram") >= 0) return "telegram";
    if (h.indexOf("facebook") >= 0 || h.indexOf("fb.") >= 0) return "facebook";
    if (h.indexOf("instagram") >= 0) return "instagram";
    if (h.indexOf("bing.") >= 0) return "bing";
    if (h.indexOf("duckduckgo") >= 0) return "duckduckgo";
    return "other";
  }
  function devKey() {
    var ua = navigator.userAgent || "";
    if (/SmartTV|SMART-TV|HbbTV|Android ?TV|AFT[A-Z]{1,3}|BRAVIA|Tizen|Web0S|webOS|NetCast|Viera|CrKey|SHIELD|Nexus Player|MiTV|MiBox|AppleTV|Roku|Aquos/i.test(ua)) return "tv";
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
    if (/Mobi|iPhone|Android.*Mobile|Windows Phone/i.test(ua)) return "mobile";
    if (/Android/i.test(ua)) return "tablet";
    return "desktop";
  }
  /* Browser name, once per day (same stamp as dev/src). Order matters:
     Samsung Internet, Edge, Opera and UC all carry a Chrome token in
     their UA, so they must be checked before Chrome; Chrome carries a
     Safari token, so Safari goes last. In-app browsers report their
     host engine (Chrome on Android, Safari on iOS). */
  function browserKey() {
    var ua = navigator.userAgent || "";
    if (/SamsungBrowser/i.test(ua)) return "samsung_internet";
    if (/Edg/i.test(ua)) return "edge";
    if (/OPR\/|Opera/i.test(ua)) return "opera";
    if (/UCBrowser/i.test(ua)) return "uc_browser";
    if (/Firefox|FxiOS/i.test(ua)) return "firefox";
    if (/CriOS|Chrome/i.test(ua)) return "chrome";
    if (/Safari/i.test(ua)) return "safari";
    return "other";
  }
  function dailyMeta() {
    var stamp = "af_web_meta_" + dateKey();
    if (lsGet(stamp)) return;
    lsSet(stamp, "1");
    put("/src/" + dateKey() + "/" + sourceKey() + "/" + id + ".json");
    put("/dev/" + dateKey() + "/" + devKey() + "/" + id + ".json");
    put("/brw/" + dateKey() + "/" + browserKey() + "/" + id + ".json");
    /* exact referring site (external only), once per day */
    try {
      var rh = new URL(document.referrer || "").hostname.toLowerCase()
        .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
      if (rh && rh.indexOf("arenaflix_co_uk") !== 0) put("/ref/" + dateKey() + "/" + rh + "/" + id + ".json");
    } catch (e) {}
  }
  function dailyGeo() {
    var stamp = "af_web_geo_" + dateKey();
    if (lsGet(stamp)) return;
    try {
      fetch("https://arenaflix-split-scratch.af-split-scratch.workers.dev/api/geo", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
        var cc = (j && j.country ? String(j.country) : "xx").toLowerCase();
        if (!/^[a-z]{2}$/.test(cc)) cc = "xx";
        lsSet(stamp, "1");
        put("/geo/" + dateKey() + "/" + cc + "/" + id + ".json");
      }).catch(function () {});
    } catch (e) {}
  }

  /* --- session duration: one record per tab session (start + last-seen) --- */
  var sess = null;
  function sessGet() {
    if (sess) return sess;
    try {
      var raw = sessionStorage.getItem("af_sess");
      if (raw) { var p2 = JSON.parse(raw); if (p2 && p2.sid && p2.a) { sess = p2; return sess; } }
    } catch (e) {}
    sess = { sid: "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8), a: Date.now() };
    try { sessionStorage.setItem("af_sess", JSON.stringify(sess)); } catch (e) {}
    return sess;
  }
  function sessBeat() {
    if (window.navigator && window.navigator.onLine === false) return;
    var s2 = sessGet();
    var dk = new Date(s2.a + 5 * 3600 * 1000).toISOString().slice(0, 10);
    try {
      fetch(DB + "/sess/" + dk + "/" + s2.sid + ".json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: s2.a, b: Date.now() }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  beat();
  sessBeat();
  hit();
  dailyMeta();
  dailyGeo();
  setInterval(function () { beat(); sessBeat(); }, 120000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") { beat(); hit(false); sessBeat(); }
    else { sessBeat(); }
  });
  /* --- site search box terms (final typed term, debounced) --- */
  var qsDone = {};
  var qzDone = {};
  var qsTimer = null;
  function cleanTerm(raw) {
    return String(raw || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  }
  function recordSearch(raw, inp) {
    var term = cleanTerm(raw);
    if (term.length < 3 || qsDone[term]) return;
    qsDone[term] = 1;
    put("/qs/" + dateKey() + "/" + term + "/" + id + ".json");
    /* a few seconds later, did the page say "No results for"? */
    setTimeout(function () {
      if (qzDone[term] || !inp || cleanTerm(inp.value) !== term) return;
      var res = document.querySelector("#results");
      if (res && res.textContent.indexOf("No results for") >= 0) {
        qzDone[term] = 1;
        put("/qz/" + dateKey() + "/" + term + "/" + id + ".json");
      }
    }, 3000);
  }
  function watchSearch() {
    var inp = document.querySelector("input#q");
    if (!inp || inp.__afQsBound) return;
    inp.__afQsBound = 1;
    inp.addEventListener("input", function () {
      if (qsTimer) clearTimeout(qsTimer);
      var v = inp.value;
      qsTimer = setTimeout(function () { recordSearch(v, inp); }, 2000);
    });
  }

  /* SPA navigations: catch URL changes and count the new page */
  var lastHref = location.href;
  setInterval(function () {
    if (location.href !== lastHref) { lastHref = location.href; hit(); }
    watchSearch();
  }, 2500);
  watchSearch();
})();
