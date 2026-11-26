/* ArenaFlix — detail: Cinejoy-style hero (logo art, facts card), trailers, cast, collection */
(async function () {
  UI.mountChrome("");
  const main = window.__afRoot || document.getElementById("app");
  const q = UI.pageQuery();
  const type = q.get("type") === "tv" ? "tv" : "movie";
  const id = q.get("id");

  if (!id || !/^\d+$/.test(id)) {
    main.innerHTML = `<div class="wrap" style="padding-top:140px"><div class="state-msg">Invalid title link.</div></div>`;
    return;
  }

  /* DMCA takedown: a blocked title shows a removal notice, never the title.
     Keep in sync with DMCA_BLOCKED in web/worker.js (server-side). */
  const DMCA_BLOCKED = { "movie:339103": "Gotti (2018)" }; // Gotti (2018) — DMCA 2026-11-20
  const _blockedTitle = DMCA_BLOCKED[type + ":" + id];
  if (_blockedTitle) {
    document.title = "Content Removed — ArenaFlix";
    main.innerHTML = `<div class="wrap" style="padding-top:140px"><div style="max-width:560px;margin:0 auto;background:#122019;border:1px solid #1e3a2a;border-radius:16px;padding:36px 32px;text-align:center">`
      + `<div style="display:inline-block;background:#3a1d1d;color:#fca5a5;border:1px solid #7f2d2d;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:5px 12px;margin-bottom:18px">Content removed</div>`
      + `<h1 style="font-size:24px;margin:0 0 12px;color:#fff">This title has been removed</h1>`
      + `<p style="font-size:15px;line-height:1.65;color:#b8c9bb;margin:0 0 12px"><b style="color:#fff">${_blockedTitle}</b> was removed from ArenaFlix following a copyright takedown notice (DMCA) and is no longer available on this site.</p>`
      + `<p style="font-size:15px;line-height:1.65;color:#b8c9bb;margin:0 0 12px">If you are the copyright owner and believe this removal was made in error, please contact us with the details of your claim.</p>`
      + `<a href="/" style="display:inline-block;margin-top:14px;background:#22c55e;color:#06210f;font-weight:700;text-decoration:none;border-radius:999px;padding:12px 26px;font-size:15px">Browse other titles</a>`
      + `<div style="font-size:12px;color:#7d8f80;margin-top:18px">Takedown notice received 20 November 2026 &middot; ArenaFlix</div></div></div>`;
    return;
  }
  main.innerHTML = `<div class="detail-sk"><div class="wrap">
    <div class="sk" style="height:44px;width:62%;border-radius:12px;margin-bottom:16px"></div>
    <div class="sk" style="height:18px;width:38%;border-radius:8px;margin-bottom:20px"></div>
    <div style="display:flex;gap:10px;margin-bottom:22px">
      <div class="sk" style="height:46px;width:124px;border-radius:999px"></div>
      <div class="sk" style="height:46px;width:124px;border-radius:999px"></div>
      <div class="sk" style="height:46px;width:124px;border-radius:999px"></div>
    </div>
    <div class="sk" style="height:120px;border-radius:14px"></div>
  </div></div>`;

  const slowTimeout = (ms) => new Promise((_, rej) =>
    setTimeout(() => rej(Object.assign(new Error("SLOW"), { code: "SLOW" })), ms));
  const fmtRuntime = (m) => m ? `${Math.floor(m / 60)}h ${m % 60}m` : "";
  const fmtMoney = (n) => {
    if (!n || n <= 0) return "";
    return n >= 1e6
      ? "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
      : "$" + n.toLocaleString("en-US");
  };
  const fmtDate = (s) => {
    if (!s) return "";
    const [y, m, d] = s.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ""} ${y}`;
  };

  try {
    const d = await Promise.race([TMDB.details(type, id), slowTimeout(12000)]);
    const title = UI.titleOf(d);
    const r = UI.rating(d);
    const bg = d.backdrop_path ? UI.img(d.backdrop_path, "w1280")
      : (d.poster_path ? UI.img(d.poster_path, "w780") : "");

    /* official title-treatment logo art (fallback: text title) */
    const logos = (d.images && d.images.logos) || [];
    const logo = logos.find(l => l.iso_639_1 === "en") || logos.find(l => !l.iso_639_1) || logos[0];
    const logoUrl = logo ? UI.img(logo.file_path, "w500") : "";

    const genreText = (d.genres || []).map(g => g.name).join(" • ");
    const runtime = type === "movie" ? fmtRuntime(d.runtime)
      : [d.number_of_seasons ? d.number_of_seasons + (d.number_of_seasons > 1 ? " Seasons" : " Season") : "",
         d.number_of_episodes ? d.number_of_episodes + " Episodes" : ""].filter(Boolean).join(" · ");

    const crew = (d.credits && d.credits.crew) || [];
    const director = type === "movie"
      ? crew.find(c => c.job === "Director")
      : (d.created_by && d.created_by[0]);

    const vids = ((d.videos && d.videos.results) || []).filter(v => v.site === "YouTube");
    const trailers = vids.filter(v => v.type === "Trailer" || v.type === "Teaser").concat(
      vids.filter(v => v.type !== "Trailer" && v.type !== "Teaser")).slice(0, 6);

    const cast = ((d.credits && d.credits.cast) || []).slice(0, 12);
    const similar = ((d.similar && d.similar.results) || []).slice(0, 14);
    const listed = UI.inList(type, id);
    /* Unreleased titles (owner order 2026-11-24): no Play button — a Play
       on a title with no stream is exactly the "fake post" complaint.
       The notice below already says when it releases; Play returns
       automatically on release day when the gate flips. */
    const rs = UI.releaseStatus(Object.assign({ media_type: type }, d));
    const isUpcoming = rs === "upcoming";
    const relDateStr = fmtDate(d.release_date || d.first_air_date || "");

    /* facts card rows */
    const facts = [];
    if (type === "movie") {
      if (runtime) facts.push(["Runtime", runtime]);
    } else {
      if (d.number_of_seasons) facts.push(["Seasons", String(d.number_of_seasons)]);
      if (d.number_of_episodes) facts.push(["Episodes", String(d.number_of_episodes)]);
    }
    if (d.original_language) facts.push(["Language", d.original_language.toUpperCase()]);
    const relDate = fmtDate(d.release_date || d.first_air_date || "");
    if (relDate) facts.push([type === "tv" ? "First Air Date" : "Release Date", relDate]);
    if (type === "movie") {
      const b = fmtMoney(d.budget); if (b) facts.push(["Budget", b]);
      const rev = fmtMoney(d.revenue); if (rev) facts.push(["Revenue", rev]);
    }

    main.innerHTML = `
    <section class="detail-hero">
      <div class="detail-bg">${bg ? `<div class="logo-ph logo-ph-lg">${UI.I.logo}</div><img src="${bg}" alt="" decoding="async" fetchpriority="high" onload="this.style.opacity=1" onerror="this.remove()">` : ""}</div>
      <div class="detail-shade"></div>
      <div class="hero-curtain"></div>
    </section>
    <div class="detail-body"><div class="wrap">
      ${logoUrl
        ? `<img class="d-logo" src="${logoUrl}" alt="${UI.esc(title)}" onload="this.style.opacity=1" onerror="this.outerHTML='<h1 class=&quot;d-title&quot;>${UI.esc(title)}</h1>'">`
        : `<h1 class="d-title">${UI.esc(title)}</h1>`}
      ${genreText ? `<div class="d-genres">${UI.esc(genreText)}</div>` : ""}
      <div class="d-actions">
        ${isUpcoming
          ? `<span class="btn btn-lime btn-round" aria-disabled="true" style="opacity:.55;pointer-events:none">${UI.I.play}<span>Coming ${relDateStr}</span></span>`
          : `<a class="btn btn-lime btn-round play-ad" href="/watch?${UI.qs({ type, id })}">${UI.I.play}<span>Play</span></a>`}
        <button class="btn-circle" id="listBtn" aria-label="My List">${listed ? UI.I.check : UI.I.plus}</button>
      </div>
      <p style="font-size:12.5px;color:#ffffff;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:10px 12px;margin:12px 0 18px;line-height:1.5;max-width:540px">A short ad will open when you press Play \u2014 just come back and your movie will play. This one ad helps us cover the server costs and keep ArenaFlix free for everyone. Thank you for your support!</p>
      ${(() => {
        if (rs === "upcoming") {
          const rd = fmtDate(d.release_date || d.first_air_date || "");
          const tw = type === "tv" ? "TV show" : "movie";
          return `<div class="rs-box rs-up"><b>Not released yet.</b> This ${tw}${rd ? ` releases on ${rd}` : ""}. Streaming will be available after its release.</div>`;
        }
        if (rs === "intheaters") {
          return `<div class="rs-box rs-th"><b>Now showing in theaters.</b> This movie is currently running in cinemas, so HD quality may be not available yet.</div>`;
        }
        return "";
      })()}
      <div class="d-meta">
        ${r ? `<span class="rate-star">${UI.I.star}${r}</span>` : ""}
        <span>${UI.yearOf(d)}</span>
        ${runtime ? `<span>${runtime}</span>` : ""}
        <span>${type === "tv" ? "TV Series" : "Movie"}</span>
      </div>
      ${director ? `<div class="d-director">${type === "tv" ? "Created by" : "Director"}: <a href="/person?${UI.qs({ id: director.id })}">${UI.esc(director.name)}</a></div>` : ""}
      ${d.overview ? `<div class="d-ov-wrap">
        <p class="d-overview clamp" id="ovText">${UI.esc(d.overview)}</p>
        <button class="link-btn" id="ovToggle">Read More</button>
      </div>` : ""}
      ${facts.length ? `<div class="d-facts">
        ${facts.map(([k, v]) => `<div class="d-fact"><span>${k}</span><b>${UI.esc(v)}</b></div>`).join("")}
      </div>` : ""}
    </div></div>
    <div class="wrap">
      ${cast.length ? `<section class="section"><h2>Cast</h2><div class="cast-row">
        ${cast.map(c => {
          const p = UI.img(c.profile_path, "w185");
          const initials = UI.esc(String(c.name || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?");
          return `<a class="cast-member" href="/person?${UI.qs({ id: c.id })}">
            ${p ? `<img data-lz="${p}" decoding="async" alt="${UI.esc(c.name)}" onerror="this.outerHTML='<div class=&quot;noimg&quot;><span>${initials}</span></div>'">` : `<div class="noimg"><span>${initials}</span></div>`}
            <h5>${UI.esc(c.name)}</h5><p>${UI.esc(c.character || "")}</p>
          </a>`;
        }).join("")}
      </div></section>` : ""}
      ${trailers.length ? `<section class="section"><h2>Trailers</h2><div class="trailer-row">
        ${trailers.map(v => `
          <button class="trailer-card" data-key="${v.key}">
            <span class="trailer-thumb">
              <img data-lz="https://i.ytimg.com/vi/${v.key}/hqdefault.jpg" decoding="async" alt="${UI.esc(v.name)}" onerror="this.remove()">
              <span class="trailer-play">${UI.I.play}</span>
            </span>
            <span class="trailer-name">${UI.esc(v.name)}</span>
            <span class="trailer-type">${UI.esc(v.type || "")}</span>
          </button>`).join("")}
      </div></section>` : ""}
      ${(type === "movie" && d.belongs_to_collection) ? `<div id="collRow"></div>` : ""}
      ${similar.length ? `<section class="section"><h2>More Like This</h2>
        <div class="scroller">${similar.map(x => UI.posterCard(x, type)).join("")}</div>
      </section>` : ""}
    </div>
    <div class="modal" id="trailerModal"><div class="modal-box">
      <button class="modal-close" id="trailerClose" aria-label="Close">${UI.I.x}</button>
      <div class="player-wrap"><iframe data-src="" title="Trailer" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>
    </div></div>`;

    /* my list */
    const listBtn = main.querySelector("#listBtn");
    listBtn.addEventListener("click", () => {
      const added = UI.toggleList({ type, id, title, poster_path: d.poster_path,
        vote_average: d.vote_average, release_date: d.release_date || "",
        first_air_date: d.first_air_date || "" });
      listBtn.innerHTML = added ? UI.I.check : UI.I.plus;
      listBtn.classList.toggle("on", added);
    });
    if (listed) listBtn.classList.add("on");

    /* overview read more */
    const ovText = main.querySelector("#ovText");
    const ovToggle = main.querySelector("#ovToggle");
    if (ovText && ovToggle) {
      ovToggle.addEventListener("click", () => {
        const collapsed = ovText.classList.toggle("clamp");
        ovToggle.textContent = collapsed ? "Read More" : "Show Less";
      });
    }

    /* trailer modal (shared by all trailer cards) */
    const modal = main.querySelector("#trailerModal");
    const frame = () => modal.querySelector("iframe");
    const openTrailer = (key) => {
      frame().src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
      modal.classList.add("open");
    };
    const closeTrailer = () => {
      modal.classList.remove("open");
      frame().removeAttribute("src");
    };
    main.querySelectorAll(".trailer-card").forEach(c =>
      c.addEventListener("click", () => openTrailer(c.getAttribute("data-key"))));
    main.querySelector("#trailerClose").addEventListener("click", closeTrailer);
    modal.addEventListener("click", e => { if (e.target === modal) closeTrailer(); });

    /* SEO: keyword-rich title + multi-keyword description per title */
    var metaYr = (d.release_date || d.first_air_date || "").slice(0, 4);
    var metaTitleCore = title + (metaYr ? " (" + metaYr + ")" : "");
    var seoTitle = metaTitleCore + " — Watch Free Online in HD | ArenaFlix";
    var metaSegs = [];
    if (genreText) metaSegs.push(genreText);
    if (type === "tv") {
      if (d.number_of_seasons) metaSegs.push(d.number_of_seasons + (d.number_of_seasons > 1 ? " Seasons" : " Season"));
      if (d.number_of_episodes) metaSegs.push(d.number_of_episodes + (d.number_of_episodes > 1 ? " Episodes" : " Episode"));
    }
    if (r) metaSegs.push("Rating " + r + "/10");
    if (type === "movie" && runtime) metaSegs.push(runtime);
    var seoBody = type === "tv"
      ? "Watch " + title + " online free in HD on ArenaFlix"
      : "Watch " + metaTitleCore + " online free in HD on ArenaFlix";
    if (metaSegs.length) seoBody += " — " + metaSegs.join(" • ");
    seoBody += type === "tv"
      ? ". Watch episodes online, explore the full cast, episode guide, trailers, air dates, ratings, seasons and latest updates."
      : ". Stream the full movie online, explore the cast, official trailer, release date, ratings, story details and latest updates.";
    var seoTail = " Find where to watch " + title + " and start streaming on ArenaFlix.";
    var seoOverview = (d.overview || "").trim();
    if (seoOverview) {
      var seoRoom = 340 - seoBody.length - seoTail.length - 1;
      if (seoRoom >= 50) {
        var seoOvCut = seoOverview.slice(0, seoRoom), seoOvSpace = seoOvCut.lastIndexOf(" ");
        seoBody += " " + (seoOvSpace > 40 ? seoOvCut.slice(0, seoOvSpace) : seoOvCut).replace(/[\s,;:.•—-]+$/, "") + ".";
      }
    }
    var seoDesc = seoBody + seoTail;
    if (seoDesc.length > 340) {
      var seoMaxBody = 340 - seoTail.length;
      var seoCut = seoBody.slice(0, seoMaxBody), seoSpace = seoCut.lastIndexOf(" ");
      seoDesc = (seoSpace > 80 ? seoCut.slice(0, seoSpace) : seoCut).replace(/[\s,;:.•—-]+$/, "") + seoTail;
    }
    document.title = seoTitle;
    /* SEO: canonical, OG tags + structured data per title */
    try {
      var seoUrl = "https://arenaflix.co.uk/detail?type=" + type + "&id=" + id;
      var seoImg = d.poster_path ? UI.img(d.poster_path, "w500") : "";
      var putMeta = function(attr, key, val) {
        if (!val) return;
        var el = document.head.querySelector("meta[" + attr + "='" + key + "']");
        if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
        el.setAttribute("content", val);
      };
      putMeta("name", "description", seoDesc);
      putMeta("property", "og:title", seoTitle);
      putMeta("property", "og:description", seoDesc);
      putMeta("property", "og:url", seoUrl);
      putMeta("property", "og:type", type === "tv" ? "video.tv_show" : "video.movie");
      if (seoImg) putMeta("property", "og:image", seoImg);
      var can = document.head.querySelector("link[rel='canonical']");
      if (!can) { can = document.createElement("link"); can.setAttribute("rel", "canonical"); document.head.appendChild(can); }
      can.setAttribute("href", seoUrl);
      var ld = { "@context": "https://schema.org", "@type": type === "tv" ? "TVSeries" : "Movie", "name": title, "description": seoDesc, "url": seoUrl };
      if (seoImg) ld.image = seoImg;
      var yr = (d.release_date || d.first_air_date || "").slice(0, 4);
      /* Fixed publish date (matches api/meta.js): a date that changes daily
         is distrusted by Google, which then shows the movie release date
         from the page in the search snippet instead. */
      ld.datePublished = "2026-10-27";
      ld.dateModified = "2026-10-27";
      /* Rating: TMDB is a 0–10 scale — declare bestRating/worstRating or
         Google reads ratingValue on its default 1–5 scale and flags 8.5
         etc. as "outside the specified range" (GSC error on Hidden Love,
         2026-10-27). Omit aggregateRating entirely with no valid rating. */
      var rVal = (typeof d.vote_average === "number") ? Math.round(d.vote_average * 10) / 10 : 0;
      if (rVal > 0 && d.vote_count > 0) {
        ld.aggregateRating = { "@type": "AggregateRating", "ratingValue": Math.min(10, Math.max(0, rVal)), "bestRating": 10, "worstRating": 0, "ratingCount": d.vote_count };
      }
      var oldLd = document.getElementById("af-jsonld");
      if (oldLd) oldLd.remove();
      var sc = document.createElement("script");
      sc.type = "application/ld+json"; sc.id = "af-jsonld";
      sc.textContent = JSON.stringify(ld);
      document.head.appendChild(sc);
    } catch (e) {}
    UI.setAmbient(UI.img(d.backdrop_path, "w342"));
    UI.watchLazy(main);
    if (window.__afReady) window.__afReady();

    /* collection / parts row — loads after the main content */
    const collRow = main.querySelector("#collRow");
    if (collRow && d.belongs_to_collection && d.belongs_to_collection.id) {
      TMDB.collection(d.belongs_to_collection.id).then(parts => {
        const list = (parts || []).filter(p => String(p.id) !== String(id));
        if (!list.length) { collRow.remove(); return; }
        collRow.outerHTML = `<section class="section"><h2>Part of ${UI.esc(d.belongs_to_collection.name || "Collection")}</h2>
          <div class="scroller">${list.map(x => UI.posterCard(x, "movie")).join("")}</div></section>`;
        UI.watchLazy(main);
      }).catch(() => { collRow.remove(); });
    }
  } catch (e) {
    if (e.code === "NO_KEY") { UI.mountKeyError(); return; }
    main.innerHTML = `<div class="wrap" style="padding-top:140px"><div class="state-msg">${
      e.code === "SLOW" ? "Slow connection — the title is taking too long." : "Could not load this title."
    } <button class="btn btn-glass" id="retryBtn" style="margin-top:14px">Retry</button></div></div>`;
    const rb = main.querySelector("#retryBtn");
    if (rb) rb.addEventListener("click", () => location.reload());
  }
})();

/* ---------- Play-button direct link (Netout pattern, owner 2026-10-31) --
   Every click on the detail page's Play button opens the Monetag
   direct link (uplcm) in a NEW tab AND lets the navigation to /watch
   proceed in this tab - exactly the Netout flow the owner approved:
   click Play -> ad tab opens; come back from it -> the player page
   is already open. The site-wide Monetag OnClick TAG was removed
   from the page heads at the owner's order the same day (it fired
   on the first click anywhere and annoyed browsing); this Play-only
   link is the whole ad model now. The Android app WebView is
   skipped for the ad tab only (WebViews cannot open popups);
   navigation is never blocked anywhere. */
(function () {
  var LINK = "https://directyp.org/4/63e4b2384e1b68ef11560472f6796896";
  var inApp = /; wv\)/.test(navigator.userAgent || "") || !!window.ArenaFlixNative;
  document.addEventListener("click", function (e) {
    if (inApp) return;
    var a = e.target && e.target.closest ? e.target.closest("a.play-ad") : null;
    if (!a) return;
    try { window.open(LINK, "_blank", "noopener"); } catch (err) {}
  }, true);
})();

/* ---------- Player pre-warm (speed fix, 2026-10-31) ----------
   While the visitor is on this detail page, silently download the
   player document for THIS title plus the hls.js library into the
   browser cache. When Play is clicked, the /watch iframe then loads
   them from cache, so the player appears almost instantly even after
   the visitor returns from the ad tab (mobile browsers throttle
   background tabs — whatever is not cached by then only loads after
   he comes back, which read as a ~5s wait). Fetch-only: nothing
   executes, no streaming starts. Skipped in the app WebView. */
(function () {
  var inApp = /; wv\)/.test(navigator.userAgent || "") || !!window.ArenaFlixNative;
  if (inApp || !window.fetch) return;
  var done = false;
  function warm() {
    if (done) return;
    var a = document.querySelector("a.play-ad");
    if (!a || !a.getAttribute("href")) return;
    var u;
    try { u = new URL(a.getAttribute("href"), location.href); } catch (e) { return; }
    var type = u.searchParams.get("type") || "movie";
    var id = u.searchParams.get("id");
    if (!id) return;
    var p = "/player/?type=" + type + "&tmdb=" + id;
    if (type === "tv") p += "&s=" + (u.searchParams.get("s") || "1") + "&e=" + (u.searchParams.get("e") || "1");
    done = true;
    try { fetch(p, { mode: "no-cors", credentials: "omit" }).catch(function () {}); } catch (e) {}
    /* Also resolve Velvet (MovieBox) in the background (2026-11-04):
       its first resolve takes a few seconds; warmed here, the answer
       is cached server-side, so Play on the default server starts
       without the resolve wait. */
    try { fetch("https://moviebox-api.hidden-decodes.workers.dev/api/streams/moviebox/" + (type === "tv" ? "series" : "movie") + "/" + id + (type === "tv" ? "?season=" + (u.searchParams.get("s") || "1") + "&episode=" + (u.searchParams.get("e") || "1") : ""), { credentials: "omit" }).catch(function () {}); } catch (e) {}
  }
  var n = 0;
  var iv = setInterval(function () { warm(); if (done || ++n > 12) clearInterval(iv); }, 700);
})();

/* ---------- SPIKE ONLY (2026-11-27): same-URL fullscreen player overlay ----------
   Owner idea: after the ad tab, play on THIS detail URL instead of
   navigating to /watch. Play click keeps the EXACT ad behavior above
   (same LINK, same window.open) and the navigation to /watch is
   stopped here; the player opens as a fixed, opaque, fullscreen
   overlay on the same URL when the visitor comes back from the ad
   tab. Back (browser or the overlay close control) closes the overlay
   and restores the detail page — it never exits the site.
   DELETE this whole block (and the popstate guard in ui.js) to drop
   the spike. */
(function () {
  var PLAYER_HOST = "https://arenaflix-split-scratch.af-split-scratch.workers.dev";
  var inApp = /; wv\)/.test(navigator.userAgent || "") || !!window.ArenaFlixNative;
  if (inApp) return; /* app WebView: navigation to /watch proceeds as before */
  var overlay = null, opened = false, armed = false, pushed = false;
  var savedScroll = 0, leftAt = 0, watchTimer = 0, cssDone = false;

  /* Same param shape as page-watch.js srcFor(): type + tmdb id, plus
     s=/e= for TV (detail Play links carry no season/episode, so 1/1
     — identical to the pre-warm default above). */
  function playerUrl() {
    var type = "movie", id = "";
    var a = document.querySelector("a.play-ad");
    if (a) {
      try {
        var u = new URL(a.getAttribute("href"), location.href);
        type = u.searchParams.get("type") === "tv" ? "tv" : "movie";
        id = u.searchParams.get("id") || "";
      } catch (e) {}
    }
    if (!id) {
      try {
        var q = new URLSearchParams(location.search);
        type = q.get("type") === "tv" ? "tv" : "movie";
        id = q.get("id") || "969681";
      } catch (e) { id = "969681"; }
    }
    var p = PLAYER_HOST + "/player/?type=" + type + "&tmdb=" + encodeURIComponent(id);
    if (type === "tv") p += "&s=1&e=1";
    return p;
  }

  function injectCss() {
    if (cssDone) return; cssDone = true;
    var st = document.createElement("style");
    st.id = "af-player-overlay-css";
    st.textContent = "#af-player-overlay{position:fixed;inset:0;z-index:2147483647;background:#000;width:100%;height:100vh;height:100dvh;overflow:hidden;overscroll-behavior:none;}"
      + "#af-player-overlay iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;display:block;}"
      + "#af-player-close{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:12px;z-index:2;width:40px;height:40px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.55);color:#fff;font-size:22px;line-height:1;cursor:pointer;}";
    document.head.appendChild(st);
  }

  function openOverlay(source) {
    if (opened) return;
    opened = true; armed = false;
    if (watchTimer) { clearInterval(watchTimer); watchTimer = 0; }
    try { window.__afOverlaySource = source; } catch (e) {}
    savedScroll = window.scrollY || window.pageYOffset || 0;
    injectCss();
    var ov = document.createElement("div");
    ov.id = "af-player-overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Player");
    var fr = document.createElement("iframe");
    fr.id = "af-player-frame";
    fr.src = playerUrl();
    fr.setAttribute("title", "ArenaFlix player");
    fr.setAttribute("allowfullscreen", "");
    fr.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
    var close = document.createElement("button");
    close.id = "af-player-close";
    close.type = "button";
    close.setAttribute("aria-label", "Back to details");
    close.textContent = "\u00d7";
    ov.appendChild(fr);
    ov.appendChild(close);
    document.body.appendChild(ov);
    overlay = ov;
    window.__afPlayerOpen = true;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    /* One history entry, same URL: Back pops it -> popstate below
       closes the overlay instead of leaving the site. */
    try { history.pushState({ afPlayer: 1 }, "", location.href); pushed = true; }
    catch (e) { pushed = false; }
    close.addEventListener("click", function () {
      if (pushed) { try { history.back(); return; } catch (e) {} }
      closeOverlay();
    });
    /* Fullscreen API is gesture-dependent. Return detection
       (visibility/focus/timer) carries no user activation, so this
       will normally reject — caught and ignored on purpose. The
       fixed inset:0 overlay IS the fullscreen look and never
       depends on this call. */
    try {
      var p = ov.requestFullscreen ? ov.requestFullscreen() : null;
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function closeOverlay() {
    if (!overlay) { opened = false; pushed = false; window.__afPlayerOpen = false; return; }
    var ov = overlay;
    overlay = null; opened = false; pushed = false;
    window.__afPlayerOpen = false;
    var fr = ov.querySelector("iframe");
    if (fr) { try { fr.src = "about:blank"; } catch (e) {} }
    ov.remove();
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    window.scrollTo(0, savedScroll);
  }

  /* Return detection. Three signals, in priority order:
     1. visibilitychange -> visible (tab switch back from the ad tab;
        the reliable signal on desktop + mobile Chrome).
     2. window focus (backup for browsers that do not fire
        visibilitychange on tab return).
     3. pageshow with persisted=true (bfcache restore).
     Plus a poll as the catch-all: if the tab never hid (popup
     blocked, or the browser kept this tab focused), the overlay
     still opens ~1s after the click instead of wedging. The poll
     also covers a late return when signals 1-3 never fired. */
  function armReturnDetection() {
    if (armed || opened) return;
    armed = true;
    leftAt = Date.now();
    watchTimer = setInterval(function () {
      if (!armed || opened) { clearInterval(watchTimer); watchTimer = 0; return; }
      if (document.hidden) return;
      if (Date.now() - leftAt >= 1000) openOverlay("timer");
    }, 400);
  }
  document.addEventListener("visibilitychange", function () {
    if (!armed || opened) return;
    if (document.visibilityState === "visible") openOverlay("visibilitychange");
  });
  window.addEventListener("focus", function () {
    if (!armed || opened) return;
    if (Date.now() - leftAt > 300) openOverlay("focus");
  });
  window.addEventListener("pageshow", function (e) {
    if (!armed || opened) return;
    if (e.persisted) openOverlay("pageshow");
  });
  window.addEventListener("popstate", function () {
    if (opened) closeOverlay();
  });

  /* Runs AFTER the ad handler above (same capture phase, later
     registration): the ad tab is already opened by then. This
     preventDefault stops both the /watch navigation AND the SPA
     router (which bails on defaultPrevented). Modified clicks
     (ctrl/shift/meta/alt/middle) are left alone so "open in new
     tab" keeps working. */
  document.addEventListener("click", function (e) {
    if (inApp) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a.play-ad") : null;
    if (!a) return;
    e.preventDefault();
    if (opened || armed) return;
    armReturnDetection();
  }, true);
})();
