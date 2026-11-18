/* GTA 6 Live Clipper — phone front-end logic.
   Data comes from the Cloudflare Worker bridge (config.js: CLIPPER_BRIDGE).
   The site never touches the VM directly. */
(function () {
  "use strict";
  var BRIDGE = window.CLIPPER_BRIDGE || "";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- settings (localStorage) ---------- */
  var DEFAULTS = {
    language: "auto", captionMode: "auto", ratio: "9:16", res: "720",
    mode: "gameplay", facecamPos: "top-left", captionPos: "bottom",
    style: "auto", favorites: ["hype", "hormozi", "comic", "pill", "bold"],
    autopost: { youtube: true, instagram: false, tiktok: false },
    romanCaption: true,
  };
  var settings = DEFAULTS;
  try {
    var saved = JSON.parse(localStorage.getItem("gta6clipper.settings.v1") || "null");
    if (saved && typeof saved === "object") {
      settings = Object.assign({}, DEFAULTS, saved);
      settings.autopost = Object.assign({}, DEFAULTS.autopost, saved.autopost || {});
      if (!Array.isArray(settings.favorites)) settings.favorites = DEFAULTS.favorites.slice();
    }
  } catch (e) { /* fresh defaults */ }
  function saveSettings() {
    try { localStorage.setItem("gta6clipper.settings.v1", JSON.stringify(settings)); } catch (e) {}
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* ---------- bridge fetch (retries; browser UA is fine) ---------- */
  function bridge(path, opts) {
    opts = opts || {};
    var url = BRIDGE + path;
    var tries = opts.tries || 3;
    function attempt(n) {
      return fetch(url, {
        method: opts.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      }).then(function (r) {
        return r.json().then(function (j) { return { status: r.status, json: j }; });
      }).catch(function (err) {
        if (n < tries) return new Promise(function (res) { setTimeout(function () { res(attempt(n + 1)); }, 1200); });
        throw err;
      });
    }
    return attempt(1);
  }

  function timeAgo(iso) {
    if (!iso) return "";
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "abhi abhi";
    if (s < 3600) return Math.floor(s / 60) + " min pehle";
    return Math.floor(s / 3600) + " ghante pehle";
  }
  function fmtViewers(n) {
    if (n == null) return "";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k dekh rahe hain";
    return n + " dekh rahe hain";
  }
  function detectPlatform(url) {
    url = (url || "").toLowerCase();
    if (url.indexOf("twitch.tv") >= 0) return "twitch";
    if (url.indexOf("kick.com") >= 0) return "kick";
    if (url.indexOf("facebook.com") >= 0) return "facebook";
    return "youtube";
  }

  /* ---------- nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#topnav a"));
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.forEach(function (x) { x.classList.remove("on"); });
      a.classList.add("on");
    });
  });

  /* ---------- 1. live streams ---------- */
  var allStreams = [];
  var picked = null; // {url, title, channel, platform}

  function streamAge(iso) {
    var t = Date.parse(iso);
    if (!t) return "";
    var m = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (m < 60) return m + " min se live";
    return Math.floor(m / 60) + "h " + (m % 60) + "m se live";
  }
  function streamCard(s) {
    var thumb = s.thumbnail
      ? '<img class="thumb" src="' + esc(s.thumbnail) + '" alt="" loading="lazy">'
      : '<img class="thumb" src="sample_bg.jpg" alt="" loading="lazy">';
    var viewers = s.viewers ? '<span class="chip">' + esc(fmtViewers(s.viewers)) + ' dekh rahe</span>' : "";
    var likes = s.likeCount ? '<span class="chip">♥ ' + esc(fmtViewers(s.likeCount)) + ' likes</span>' : "";
    var since = s.startedAt ? '<span class="chip">' + esc(streamAge(s.startedAt)) + '</span>' : "";
    return '<div class="card stream">' + thumb +
      '<div class="meta"><div class="t">' + esc(s.title || "Live stream") + '</div>' +
      '<div class="c">' + esc(s.channel || "") + '</div>' +
      '<div style="margin-top:6px"><span class="chip live">● LIVE</span>' +
      '<span class="chip">' + esc(s.platform || "youtube") + '</span>' + viewers + likes + since + '</div>' +
      '<div class="actions">' +
      '<button class="btn small" data-pick="' + esc(s.url) + '" data-title="' + esc(s.title || "") + '" data-channel="' + esc(s.channel || "") + '" data-platform="' + esc(s.platform || "youtube") + '">Clip karo</button>' +
      '<a class="btn small ghost" href="' + esc(s.url) + '" target="_blank" rel="noopener">Stream kholo</a>' +
      '</div></div></div>';
  }

  function renderStreams() {
    var q = ($("q").value || "").toLowerCase().trim();
    var list = allStreams.filter(function (s) {
      if (!q) return true;
      return ((s.title || "") + " " + (s.channel || "")).toLowerCase().indexOf(q) >= 0;
    });
    var box = $("stream-list");
    if (!list.length) {
      box.innerHTML = '<div class="empty"><div class="big">📺</div>' +
        (allStreams.length ? "Search se kuch nahi mila — koi aur lafz likho ya link paste karo."
                           : "Abhi koi live stream list me nahi hai — link paste karo ya thodi der baad dobara dekho.") +
        '</div>';
      return;
    }
    box.innerHTML = list.map(streamCard).join("");
    box.querySelectorAll("[data-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        pickStream({
          url: b.getAttribute("data-pick"),
          title: b.getAttribute("data-title"),
          channel: b.getAttribute("data-channel"),
          platform: b.getAttribute("data-platform"),
        });
      });
    });
  }

  function loadStreams() {
    return bridge("/streams").then(function (r) {
      allStreams = (r.json && r.json.streams) || [];
      renderStreams();
      $("streams-updated").textContent = r.json && r.json.updated_at
        ? "List taza hui: " + timeAgo(r.json.updated_at) + " · " + allStreams.length + " live streams"
        : allStreams.length + " live streams";
    }).catch(function () {
      $("stream-list").innerHTML = '<div class="empty"><div class="big">📡</div>Streams load nahi hue — internet check karo ya page refresh karo.</div>';
    });
  }

  function pickStream(s) {
    picked = s;
    $("submit-title").textContent = "Clip request — " + (s.title ? s.title.slice(0, 60) : "stream");
    $("submit-stream").textContent = (s.channel ? s.channel + " · " : "") + s.platform + " · " + s.url;
    $("submit-card").hidden = false;
    $("submit-result").hidden = true;
    syncFormFromSettings();
    $("submit-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("q").addEventListener("input", renderStreams);
  $("paste-go").addEventListener("click", function () {
    var url = ($("paste-link").value || "").trim();
    if (!url) { toast("Pehle link paste karo"); return; }
    if (!/^https?:\/\//i.test(url)) { toast("Sahi link paste karo — https:// se shuru ho"); return; }
    pickStream({ url: url, title: "", channel: "", platform: detectPlatform(url) });
  });
  $("submit-cancel").addEventListener("click", function () {
    $("submit-card").hidden = true;
    picked = null;
  });

  function syncFormFromSettings() {
    $("f-style").value = settings.style || "auto";
    $("f-mode").value = settings.mode;
    $("f-language").value = settings.language;
    $("f-caption").value = settings.captionMode;
    $("f-ratio").value = settings.ratio;
    $("f-res").value = settings.res;
  }
  ["f-style", "f-mode", "f-language", "f-caption", "f-ratio", "f-res"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      settings.style = $("f-style").value;
      settings.mode = $("f-mode").value;
      settings.language = $("f-language").value;
      settings.captionMode = $("f-caption").value;
      settings.ratio = $("f-ratio").value;
      settings.res = $("f-res").value;
      saveSettings();
      syncSettingsPanel();
    });
  });

  $("submit-btn").addEventListener("click", function () {
    if (!picked) { toast("Pehle stream chuno"); return; }
    var btn = $("submit-btn");
    btn.disabled = true;
    btn.textContent = "Bhej rahe hain…";
    var payload = {
      stream_url: picked.url,
      platform: picked.platform,
      title: picked.title || "",
      channel: picked.channel || "",
      style: $("f-style").value === "auto" ? (settings.favorites[0] || "neon") : $("f-style").value,
      favorites: settings.favorites,
      facecam_pos: settings.facecamPos,
      caption_pos: settings.captionPos,
      ratio: $("f-ratio").value,
      resolution: $("f-res").value,
      mode: $("f-mode").value,
      language: $("f-language").value,
      caption_mode: settings.romanCaption ? "auto" : $("f-caption").value,
      autopost: settings.autopost,
    };
    bridge("/submit", { method: "POST", body: payload }).then(function (r) {
      btn.disabled = false;
      btn.textContent = "Request bhejo — clip banao";
      var res = $("submit-result");
      res.hidden = false;
      if (r.status === 200 && r.json && r.json.ok) {
        res.innerHTML = "✅ <b>Request mil gayi!</b> ID: <code>" + esc(r.json.id) + "</code> — engine stream ko dekh raha hai, clip tayyar hote hi Gallery me aayega.";
        toast("Request bhej di — clip Gallery me aayega");
        loadHistory(); // nayi request foran History me dikhe
      } else {
        res.innerHTML = "❌ Request nahi gayi — " + esc((r.json && r.json.error) || ("HTTP " + r.status)) + ". Link dobara check karo.";
        toast("Request fail — dobara try karo");
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "Request bhejo — clip banao";
      var res = $("submit-result");
      res.hidden = false;
      res.innerHTML = "❌ Internet ya bridge ka masla — thodi der baad dobara try karo.";
      toast("Request fail — dobara try karo");
    });
  });

  /* ---------- 2. styles ---------- */
  var stylesData = [];
  function favLabel(id) {
    var i = settings.favorites.indexOf(id);
    return i >= 0 ? (i + 1) : null;
  }
  function toggleFav(id) {
    var i = settings.favorites.indexOf(id);
    if (i >= 0) settings.favorites.splice(i, 1);
    else settings.favorites.push(id);
    saveSettings();
    renderFavbar();
    renderStyles();
  }
  function moveFav(id, dir) {
    var i = settings.favorites.indexOf(id);
    var j = i + dir;
    if (i < 0 || j < 0 || j >= settings.favorites.length) return;
    var t = settings.favorites[i];
    settings.favorites[i] = settings.favorites[j];
    settings.favorites[j] = t;
    saveSettings();
    renderFavbar();
    renderStyles();
  }
  function renderFavbar() {
    var bar = $("favbar");
    if (!settings.favorites.length) {
      bar.innerHTML = '<span class="chip">Koi favorite nahi — ★ dabao to rotation banao</span>';
      return;
    }
    bar.innerHTML = settings.favorites.map(function (id, i) {
      var s = stylesData.find(function (x) { return x.id === id; });
      var name = s ? s.name : id;
      return '<span class="fav-chip">★' + (i + 1) + ' ' + esc(name) +
        ' <button data-up="' + esc(id) + '" aria-label="up">↑</button>' +
        ' <button data-down="' + esc(id) + '" aria-label="down">↓</button>' +
        ' <button data-unfav="' + esc(id) + '" aria-label="remove">✕</button></span>';
    }).join("");
    bar.querySelectorAll("[data-up]").forEach(function (b) { b.addEventListener("click", function () { moveFav(b.getAttribute("data-up"), -1); }); });
    bar.querySelectorAll("[data-down]").forEach(function (b) { b.addEventListener("click", function () { moveFav(b.getAttribute("data-down"), 1); }); });
    bar.querySelectorAll("[data-unfav]").forEach(function (b) { b.addEventListener("click", function () { toggleFav(b.getAttribute("data-unfav")); }); });
  }
  function renderStyles() {
    var grid = $("styles-grid");
    grid.innerHTML = stylesData.map(function (s) {
      var fav = favLabel(s.id);
      return '<div class="style-card' + (fav ? " fav" : "") + '">' +
        '<video data-src="' + esc(s.preview) + '" data-poster="' + esc(s.preview.replace(/\.mp4$/, ".jpg")) + '" preload="none" loop muted playsinline></video>' +
        '<div class="tap-hint">▶ Tap karo — preview chalegi</div>' +
        '<div class="body"><div class="name"><span>' + esc(s.name) + '</span>' +
        '<button class="star' + (fav ? " on" : "") + '" data-fav="' + esc(s.id) + '" aria-label="favorite">' + (fav ? "★" + fav : "☆") + '</button></div>' +
        '<div class="desc">' + esc(s.desc) + '</div></div></div>';
    }).join("");
    grid.querySelectorAll("video").forEach(function (v) {
      v.addEventListener("click", function () {
        if (!v.getAttribute("src")) { v.poster = v.getAttribute("data-poster"); v.src = v.getAttribute("data-src"); }
        grid.querySelectorAll("video").forEach(function (o) { if (o !== v) o.pause(); });
        if (v.paused) v.play(); else v.pause();
      });
    });
    // lazy load: sirf nazar aane wale cards ka poster/video load karo — slow net par page foran khule
    var lazyVideos = grid.querySelectorAll("video[data-src]");
    var loadOne = function (v) {
      if (v.getAttribute("src")) return;
      v.poster = v.getAttribute("data-poster");
      v.preload = "metadata";
      v.src = v.getAttribute("data-src");
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); loadOne(en.target); } });
      }, { rootMargin: "300px" });
      lazyVideos.forEach(function (v) { io.observe(v); });
    } else {
      lazyVideos.forEach(loadOne);
    }
    grid.querySelectorAll("[data-fav]").forEach(function (b) {
      b.addEventListener("click", function () { toggleFav(b.getAttribute("data-fav")); });
    });
  }
  function loadStyles() {
    return fetch("styles.json").then(function (r) { return r.json(); }).then(function (d) {
      stylesData = d;
      // style select in the submit form
      $("f-style").innerHTML = '<option value="auto">★ Favorites rotation (auto)</option>' +
        stylesData.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>'; }).join("");
      renderFavbar();
      renderStyles();
      syncFormFromSettings(); // saved form values wapas lagao (refresh ke baad bhi)
    }).catch(function () {
      $("styles-grid").innerHTML = '<div class="empty">Styles load nahi hue.</div>';
    });
  }

  /* ---------- 3. layout ---------- */
  var layoutData = null;
  function renderLayout() {
    if (!layoutData) return;
    $("facecam-grid").innerHTML = layoutData.facecam.map(function (p) {
      return '<div class="pos-card' + (settings.facecamPos === p.id ? " sel" : "") + '" data-fc="' + esc(p.id) + '">' +
        '<img src="' + esc(p.still) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '<div class="body"><div class="name">' + esc(p.name) + '</div><div class="desc">' + esc(p.desc) + '</div></div></div>';
    }).join("");
    $("caption-grid").innerHTML = layoutData.caption.map(function (p) {
      return '<div class="pos-card' + (settings.captionPos === p.id ? " sel" : "") + '" data-cc="' + esc(p.id) + '">' +
        '<img src="' + esc(p.still) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '<div class="body"><div class="name">' + esc(p.name) + '</div><div class="desc">' + esc(p.desc) + '</div></div></div>';
    }).join("");
    $("ratio-grid").innerHTML = layoutData.ratios.map(function (r) {
      var w = r.id === "9:16" ? 34 : r.id === "1:1" ? 54 : r.id === "4:5" ? 46 : 64;
      var h = r.id === "9:16" ? 60 : r.id === "1:1" ? 54 : r.id === "4:5" ? 57 : 36;
      return '<div class="ratio-card' + (settings.ratio === r.id ? " sel" : "") + '" data-ratio="' + esc(r.id) + '">' +
        '<div class="ratio-frame" style="width:' + w + 'px;height:' + h + 'px"></div>' +
        '<div class="name">' + esc(r.name) + '</div><div class="desc">' + esc(r.desc.split("—")[0]) + '</div></div>';
    }).join("");
    document.querySelectorAll("[data-fc]").forEach(function (el) {
      el.addEventListener("click", function () { settings.facecamPos = el.getAttribute("data-fc"); saveSettings(); renderLayout(); toast("Facecam: " + el.getAttribute("data-fc")); });
    });
    document.querySelectorAll("[data-cc]").forEach(function (el) {
      el.addEventListener("click", function () { settings.captionPos = el.getAttribute("data-cc"); saveSettings(); renderLayout(); toast("Captions: " + el.getAttribute("data-cc")); });
    });
    document.querySelectorAll("[data-ratio]").forEach(function (el) {
      el.addEventListener("click", function () {
        settings.ratio = el.getAttribute("data-ratio"); saveSettings(); renderLayout();
        var fr = $("f-ratio"); if (fr) fr.value = settings.ratio;
        var sr = $("set-ratio"); if (sr) sr.value = settings.ratio;
        toast("Ratio: " + settings.ratio);
      });
    });
  }
  function loadLayout() {
    return fetch("layout.json").then(function (r) { return r.json(); }).then(function (d) {
      layoutData = d;
      renderLayout();
    }).catch(function () { /* layout optional */ });
  }

  /* ---------- 4. gallery — COMPACT preview, tap to play ---------- */
  var galleryClips = [];
  var openClipCard = null;
  function clipPoster(c) {
    if (c.link && /drive\.google\.com\/file\/d\/([^\/]+)/.test(c.link)) {
      return "https://drive.google.com/thumbnail?id=" + c.link.match(/\/file\/d\/([^\/]+)/)[1] + "&sz=w360";
    }
    if (c.link && /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/.test(c.link)) {
      return "https://i.ytimg.com/vi/" + c.link.match(/(?:watch\?v=|youtu\.be\/)([\w-]{6,})/)[1] + "/hqdefault.jpg";
    }
    if (c.link && /\.mp4(\?|$)/i.test(c.link)) return c.link.replace(/\.mp4(\?.*)?$/i, "-poster.jpg");
    return "sample_bg.jpg";
  }
  function clipPlayerHtml(c) {
    if (c.link && /drive\.google\.com\/file\/d\//.test(c.link)) {
      // Google Drive preview: adaptive player, full quality (no degraded file)
      return '<iframe class="gal-video" src="' + esc(c.link) + '" allowfullscreen></iframe>';
    }
    if (c.link && /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(c.link)) {
      var vid = c.link.replace(/^.*(?:watch\?v=|youtu\.be\/)([\w-]{6,}).*$/, "$1");
      return '<iframe class="gal-video" src="https://www.youtube.com/embed/' + esc(vid) + '" allowfullscreen></iframe>';
    }
    if (c.link && /\.mp4(\?|$)/i.test(c.link)) {
      // direct video: inline player (controls only, NO autoplay) + Download
      return '<video class="gal-video" src="' + esc(c.link) + '" controls preload="metadata" playsinline></video>';
    }
    if (c.link) {
      return '<div style="margin-top:9px"><a class="btn small" href="' + esc(c.link) + '" target="_blank" rel="noopener">▶ YouTube par dekho</a></div>';
    }
    return '<div style="margin-top:9px"><button class="btn small ghost" disabled>Link jald aayega</button></div>';
  }
  function clipDownload(c) {
    if (c.link && /drive\.google\.com\/file\/d\//.test(c.link)) {
      var dl = c.link.replace(/\/file\/d\/([^\/]+)\/.*/, "https://drive.google.com/uc?export=download&id=$1");
      return '<a class="btn small" href="' + esc(dl) + '">⬇ Download</a>';
    }
    if (c.link && /\.mp4(\?|$)/i.test(c.link)) {
      return '<a class="btn small" href="' + esc(c.link) + '" download>⬇ Download</a>';
    }
    return "";
  }
  function clipCard(c, idx) {
    var st = (c.status || "ready").toLowerCase();
    var label = st === "ready" ? "Ready" : st === "rendering" ? "Ban raha hai" : "Dekh raha hai";
    var dur = c.duration ? Math.round(c.duration) + "s" : "";
    var dl = clipDownload(c);
    return '<div class="card clip">' +
      '<div class="gal-thumb" data-idx="' + idx + '">' +
      '<img src="' + esc(clipPoster(c)) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<span class="gal-play">▶</span>' + (dur ? '<span class="gal-dur">' + dur + '</span>' : "") +
      '</div>' +
      '<div class="gal-player" style="display:none"></div>' +
      '<div class="meta"><div class="t">' + esc(c.title || "Clip") + '</div>' +
      '<div class="c">' + esc(c.stream || "") + (c.style ? " · " + esc(c.style) : "") + (dur ? " · " + dur : "") + '</div>' +
      '<div style="margin-top:6px"><span class="status ' + esc(st) + '">' + esc(label) + '</span> ' +
      '<span class="chip">' + esc(timeAgo(c.created_at)) + '</span></div>' +
      (dl ? '<div style="margin-top:9px">' + dl + '</div>' : "") +
      '</div></div>';
  }
  function closeOpenClip() {
    if (!openClipCard) return;
    var p = openClipCard.querySelector(".gal-player");
    var v = p && p.querySelector("video");
    if (v) v.pause();
    if (p) { p.innerHTML = ""; p.style.display = "none"; }
    var th = openClipCard.querySelector(".gal-thumb");
    if (th) th.style.display = "";
    openClipCard = null;
  }
  function loadGallery() {
    return bridge("/clips").then(function (r) {
      var seen = {};
      var clips = ((r.json && r.json.clips) || []).filter(function (c) {
        if (!c.id || seen[c.id]) return false;
        seen[c.id] = 1;
        return true;
      });
      galleryClips = clips;
      closeOpenClip();
      var box = $("clip-list");
      if (!clips.length) {
        box.innerHTML = '<div class="empty"><div class="big">🎬</div>Abhi koi clip nahi hai — pehla clip tayyar hote hi yahan aayega.</div>';
        return;
      }
      box.innerHTML = clips.map(function (c, i) { return clipCard(c, i); }).join("");
    }).catch(function () {
      $("clip-list").innerHTML = '<div class="empty"><div class="big">📡</div>Gallery load nahi hui — thodi der baad dobara dekho.</div>';
    });
  }

  /* ---------- 4b. history — Meri Requests ---------- */
  function stageLabel(r) {
    var map = { queued: "Queue me", capturing: "Capture ho raha hai",
      transcribing: "Bol sun rahe hain", rendering: "Ban raha hai",
      ready: "Tayyar", failed: "Fail" };
    return map[r.stage] || r.stage || r.status || "pending";
  }
  function historyCard(r) {
    var st = (r.status || "pending").toLowerCase();
    var s = stylesData.find(function (x) { return x.id === r.style; });
    var styleName = s ? s.name : (r.style || "");
    var pct = typeof r.progress === "number" ? r.progress : 0;
    var queue = r.queue_position ? "Queue #" + r.queue_position : "";
    var clipBtn = r.clip_link
      ? '<a class="btn small" href="#gallery">▶ Gallery me dekho</a>' : "";
    return '<div class="card hist">' +
      '<div class="meta"><div class="t">' + esc(r.title || r.channel || "Clip request") + '</div>' +
      '<div class="c">' + esc(r.channel || "") + (styleName ? " · " + esc(styleName) : "") +
      ' · ' + esc(timeAgo(r.created_at)) + ' bheji</div>' +
      '<div style="margin-top:6px"><span class="status ' + esc(st) + '">' + esc(stageLabel(r)) + '</span> ' +
      (queue ? '<span class="chip">' + esc(queue) + '</span> ' : "") +
      '<span class="chip">' + pct + '%</span></div>' +
      '<div class="progress"><div class="bar" style="width:' + pct + '%"></div></div>' +
      (r.error ? '<div class="c" style="color:var(--danger);margin-top:6px">' + esc(r.error) + '</div>' : "") +
      (clipBtn ? '<div style="margin-top:9px">' + clipBtn + '</div>' : "") +
      '</div></div>';
  }
  function loadHistory() {
    return bridge("/history").then(function (r) {
      var reqs = (r.json && r.json.requests) || [];
      var box = $("history-list");
      if (!reqs.length) {
        box.innerHTML = '<div class="empty"><div class="big">📋</div>Abhi koi request nahi — pehli request bhejo, yahan us ka progress dikhega.</div>';
        return;
      }
      box.innerHTML = reqs.slice().reverse().map(historyCard).join("");
    }).catch(function () {
      $("history-list").innerHTML = '<div class="empty"><div class="big">📡</div>History load nahi hui — thodi der baad dobara dekho.</div>';
    });
  }

  /* ---------- 5. settings panel ---------- */
  function syncSettingsPanel() {
    $("set-yt").checked = !!settings.autopost.youtube;
    $("set-ig").checked = !!settings.autopost.instagram;
    $("set-tt").checked = !!settings.autopost.tiktok;
    $("set-roman").checked = !!settings.romanCaption;
    $("set-language").value = settings.language;
    $("set-ratio").value = settings.ratio;
  }
  $("set-yt").addEventListener("change", function () { settings.autopost.youtube = $("set-yt").checked; saveSettings(); });
  $("set-ig").addEventListener("change", function () { settings.autopost.instagram = $("set-ig").checked; saveSettings(); });
  $("set-tt").addEventListener("change", function () { settings.autopost.tiktok = $("set-tt").checked; saveSettings(); });
  $("set-roman").addEventListener("change", function () {
    settings.romanCaption = $("set-roman").checked;
    if (settings.romanCaption) { settings.captionMode = "auto"; var fc = $("f-caption"); if (fc) fc.value = "auto"; }
    saveSettings();
    toast(settings.romanCaption ? "Roman captions ON" : "Roman captions OFF — Captions select se chuno");
  });
  $("set-language").addEventListener("change", function () { settings.language = $("set-language").value; saveSettings(); var fl = $("f-language"); if (fl) fl.value = settings.language; });
  $("set-ratio").addEventListener("change", function () { settings.ratio = $("set-ratio").value; saveSettings(); var fr = $("f-ratio"); if (fr) fr.value = settings.ratio; renderLayout(); });

  /* ---------- boot + refresh ---------- */
  function checkBridge() {
    bridge("/health", { tries: 2 }).then(function (r) {
      $("bridge-status").textContent = r.json && r.json.ok ? "● Live — engine se jura hua" : "● Bridge jawab nahi de raha";
    }).catch(function () {
      $("bridge-status").textContent = "● Bridge se nahi jur saka — refresh karo";
    });
  }
  $("refresh-streams").addEventListener("click", function () { loadStreams(); toast("Streams taza ho rahe hain…"); });
  $("refresh-gallery").addEventListener("click", function () { loadGallery(); toast("Gallery taza ho rahi hai…"); });
  $("refresh-history").addEventListener("click", function () { loadHistory(); toast("History taza ho rahi hai…"); });
  // gallery: preview par tap karo to video khule (ek waqt me ek hi)
  $("clip-list").addEventListener("click", function (e) {
    var th = e.target.closest ? e.target.closest(".gal-thumb") : null;
    if (!th) return;
    var card = th.parentNode;
    var c = galleryClips[+th.getAttribute("data-idx")];
    if (!c || openClipCard === card) return;
    closeOpenClip();
    var p = card.querySelector(".gal-player");
    p.innerHTML = clipPlayerHtml(c);
    p.style.display = "block";
    th.style.display = "none";
    openClipCard = card;
    var v = p.querySelector("video");
    if (v) v.play().catch(function () {});
  });
  syncSettingsPanel();
  loadStyles();
  loadLayout();
  loadStreams();
  loadGallery();
  loadHistory();
  checkBridge();
  setInterval(function () { loadStreams(); loadGallery(); loadHistory(); }, 60000);
})();
