/* ArenaFlix — shared UI: icons, chrome (nav/footer), cards, rows, hero, my-list */
const UI = (() => {

  /* ---------- inline SVG icons (no emojis) ---------- */
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 16.5h4M17 7.5h4"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2"/><path d="m17 2-5 5-5-5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    logo: '<svg viewBox="0 0 64 64"><path d="M32 5 L11 59 L21 59 L32 22 L43 59 L53 59 Z" fill="#95FF50"/><path d="M32 5 L53 59 L43 59 L32 22 Z" fill="#3a8f1e"/><path d="M22 20 L52 32 L22 44 Z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="31" cy="29.5" r="2.2" fill="#0b0b0d"/><circle cx="37.5" cy="29.5" r="2.2" fill="#0b0b0d"/><path d="M31 34.5 Q34.5 38 38.5 34" stroke="#0b0b0d" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
  };

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const img = (path, size) => path ? CONFIG.IMG + "/" + size + path : null;
  const titleOf = (it) => it.title || it.name || "Untitled";
  const yearOf = (it) => (it.release_date || it.first_air_date || "").slice(0, 4) || "—";
  const typeOf = (it, fallback) => it.media_type === "tv" || fallback === "tv" ? "tv" : "movie";
  /* release status badge: "upcoming" (future date) or "in theaters" (movie, <35 days old, <100 votes) */
  const releaseStatus = (it) => {
    if (!it) return null;
    const date = it.release_date || it.first_air_date || "";
    if (!date) return null;
    /* PKT day, same clock as TMDB.today() — release day starts at PKT midnight */
    const today = new Date(Date.now() + 5 * 3600e3).toISOString().split("T")[0];
    if (date > today) return "upcoming";
    const mtype = it.media_type || (it.title ? "movie" : "tv");
    if (mtype === "movie") {
      const days = (new Date(today) - new Date(date)) / 864e5;
      if (days >= 0 && days < 35 && (it.vote_count || 0) < 100) return "intheaters";
    }
    return null;
  };
  const rating = (it) => (it.vote_average != null && it.vote_average > 0)
    ? it.vote_average.toFixed(1) : null;
  const qs = (o) => new URLSearchParams(o).toString();

  /* ---------- site chrome: nav + tabbar + footer ---------- */
  /* page-leave cleanup registry (hero interval etc.) */
  const _leaveFns = [];
  function onPageLeave(fn) { if (typeof fn === "function") _leaveFns.push(fn); }
  function runPageLeave() { while (_leaveFns.length) { try { _leaveFns.pop()(); } catch (_) {} } }

  /* active nav states + sliding lime indicator */
  let _currentNav = "";
  function setActiveNav(active) {
    _currentNav = active || "";
    document.querySelectorAll("#site-nav [data-nav]").forEach(a =>
      a.classList.toggle("active", !!active && a.dataset.nav === active));
    const ind = document.getElementById("navInd");
    const pill = document.querySelector("#site-nav .nav-pill");
    if (!ind || !pill) return;
    const cur = active && pill.querySelector('#navLinks a[data-nav="' + active + '"]');
    if (!cur || window.innerWidth <= 768) { ind.style.display = "none"; return; }
    const pr = pill.getBoundingClientRect(), cr = cur.getBoundingClientRect();
    ind.style.display = "";
    ind.style.left = (cr.left - pr.left) + "px";
    ind.style.width = cr.width + "px";
  }
  const NAV_KEY = { "index.html": "home", "": "home",
    "movies": "movies", "tv": "tv", "search": "search",
    "mylist": "mylist", "settings": "settings", "browse": "browse",
    "movies.html": "movies", "tv.html": "tv", "search.html": "search",
    "mylist.html": "mylist", "settings.html": "settings", "browse.html": "browse" };
  function navKeyFor(url) {
    const base = url.split("?")[0].split("/").pop();
    return NAV_KEY[base] || "";
  }

  /* SPA-style switching (Cinejoy feel): intercept clicks, fetch shell,
     swap <main> in place, pushState — no full reload, no white flash */
  let _spaInit = false;
  function initSpaNav() {
    if (_spaInit) return; _spaInit = true;
    const cache = new Map();
    const scrollPos = new Map();
    let curSpaUrl = location.pathname + location.search;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    async function fetchPage(url) {
      if (cache.has(url)) return cache.get(url);
      const p = (async () => {
        const r = await fetch(url, { credentials: "same-origin" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const doc = new DOMParser().parseFromString(await r.text(), "text/html");
        const main = doc.querySelector("main");
        if (!main) throw new Error("no main");
        const ps = doc.querySelector('script[src*="page-"]');
        return { title: doc.title, mainHTML: main.outerHTML, script: ps ? ps.getAttribute("src") : null };
      })();
      cache.set(url, p);
      try { return await p; } catch (e) { cache.delete(url); throw e; }
    }

    function runPageScript(src) {
      const old = document.getElementById("page-script");
      if (old) old.remove();
      if (!src) return Promise.resolve();
      return new Promise((res) => {
        const s = document.createElement("script");
        s.id = "page-script"; s.src = src;
        s.onload = () => res(); s.onerror = () => res();
        document.body.appendChild(s);
      });
    }

    let navSeq = 0;
    /* Cinejoy-style: keep the OLD page visible while the new one renders
       off-screen; swap instantly only when its data is ready (or timeout).
       No skeleton flash, no visible loading state. */
    async function navigate(url, push) {
      const my = ++navSeq;
      scrollPos.set(curSpaUrl, window.scrollY);
      document.documentElement.dataset.spa = "1"; /* survives only SPA swaps, wiped by full reload */
      try { PBar.start(); } catch (_) {}
      try {
        const page = await fetchPage(url);
        if (my !== navSeq) return;
        runPageLeave();

        /* SPA keeps the same document.body: drop the watch fullscreen lock
           unless the destination IS the watch page (system-back/popstate
           otherwise leaves overflow:hidden stuck on the home page) */
        if (!/watch\.html/.test(url)) document.body.classList.remove("truefs-active");

        /* render the destination off-screen */
        const off = document.createElement("div");
        off.setAttribute("aria-hidden", "true");
        off.style.cssText = "position:fixed;left:-10000px;top:0;width:100%;visibility:hidden;pointer-events:none";
        off.innerHTML = page.mainHTML;
        document.body.appendChild(off);
        window.__afRoot = off.querySelector("main") || off.firstElementChild;
        window.__afUrl = url;

        let readyFn;
        const readyP = new Promise(res => { readyFn = res; });
        window.__afReady = () => { try { readyFn(); } catch (_) {} };
        const timeoutP = new Promise(res => setTimeout(() => res("timeout"), 8000));

        /* WATCH PAGE — swap FIRST, then run its script in the live document.
           Rendering the watch page off-screen like the others made its
           player boot invisibly (audio playing while the old page was
           still on screen), the swap then waited for the page's data,
           and moving the playing iframe into the document reloaded it —
           so the movie visibly started twice. In-place rendering boots
           the player exactly once, already visible. (Owner's Lupin
           report, 2026-10-31.) */
        if (/\/watch(\.html)?$/.test(url.split("?")[0])) {
          const liveMain = off.querySelector("main") || off.firstElementChild;
          off.remove();
          document.querySelector("main").replaceWith(liveMain);
          window.__afRoot = liveMain;
          document.title = page.title;
          setActiveNav(navKeyFor(url));
          if (push) { try { history.pushState({ spa: url }, page.title, url); } catch (_) {} }
          curSpaUrl = url;
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          try { PBar.finish(); } catch (_) {}
          await runPageScript(page.script);
          window.__afRoot = null; window.__afReady = null; window.__afUrl = null;
          return;
        }

        await runPageScript(page.script);
        if (my !== navSeq) { off.remove(); window.__afRoot = null; window.__afReady = null; window.__afUrl = null; try { PBar.finish(); } catch (_) {} return; }
        /* wait for the page's data-ready signal (or timeout — swap anyway) */
        await Promise.race([readyP, timeoutP]);
        if (my !== navSeq) { off.remove(); window.__afRoot = null; window.__afReady = null; window.__afUrl = null; try { PBar.finish(); } catch (_) {} return; }

        /* instant swap to the fully-rendered page */
        const newMain = off.querySelector("main") || off.firstElementChild;
        off.remove();
        window.__afRoot = null;
        window.__afReady = null;
        window.__afUrl = null;
        document.querySelector("main").replaceWith(newMain);
        document.title = page.title;
        setActiveNav(navKeyFor(url));
        if (push) { try { history.pushState({ spa: url }, page.title, url); } catch (_) {} }
        curSpaUrl = url;
        if (push) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        else window.scrollTo({ top: scrollPos.get(url) || 0, left: 0, behavior: "instant" });
        try { PBar.finish(); } catch (_) {}
      } catch (e) { location.href = url; return; }
    }

    function targetUrl(a) {
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
      let u;
      try { u = new URL(a.getAttribute("href"), location.href); }
      catch (_) { return null; }
      if (u.origin !== location.origin) return null;
      const nxt = u.pathname + u.search;
      if (nxt === location.pathname + location.search) return null;
      return nxt;
    }

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      const nxt = targetUrl(a);
      if (!nxt) return;
      e.preventDefault();
      navigate(nxt, true);
    });

    /* warm the TMDB data cache for a destination page (intent prefetch) */
    function warmData(url) {
      try {
        const k = navKeyFor(url);
        if (k === "movies") TMDB.discover("movie", { genre: "", year: "", sort: "popular", page: 1 }).catch(() => {});
        else if (k === "tv") TMDB.discover("tv", { genre: "", year: "", sort: "popular", page: 1 }).catch(() => {});
        else if (k === "search") TMDB.trending("all", "day").catch(() => {});
        else if (url.indexOf("/detail") === 0) {
          /* card hover/touch -> detail data starts loading before the tap */
          const qp = new URLSearchParams(url.split("?")[1] || "");
          const t = qp.get("type") === "tv" ? "tv" : "movie";
          const id = qp.get("id");
          if (id && /^\d+$/.test(id)) TMDB.details(t, id).catch(() => {});
        }
        else if (url.indexOf("/watch") === 0) {
          const qp = new URLSearchParams(url.split("?")[1] || "");
          const t = qp.get("type") === "tv" ? "tv" : "movie";
          const id = qp.get("id");
          if (id && /^\d+$/.test(id)) TMDB.details(t, id).catch(() => {});
        }
      } catch (_) {}
    }

    /* hover prefetch — page shell + its data ready before the tap.
       Gated (Phase 2, 2026-11-26): 400ms dwell + pointer stillness, so a
       passing sweep over cards no longer fires a shell + TMDB fetch per
       card. Touch intent is unaffected (pointerdown warms immediately). */
    let hovT = null;
    let hovX = 0, hovY = 0, hovAX = 0, hovAY = 0;
    document.addEventListener("mousemove", (e) => { hovX = e.clientX; hovY = e.clientY; }, { passive: true });
    document.addEventListener("mouseover", (e) => {
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      const nxt = targetUrl(a);
      if (!nxt) return;
      clearTimeout(hovT);
      hovAX = hovX; hovAY = hovY;
      hovT = setTimeout(() => {
        if (Math.hypot(hovX - hovAX, hovY - hovAY) > 12) return; /* still travelling — not intent */
        fetchPage(nxt).catch(() => {});
        warmData(nxt);
      }, 400);
    }, { passive: true });

    /* touch intent: finger down on a nav link -> warm its data immediately */
    document.addEventListener("pointerdown", (e) => {
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      const nxt = targetUrl(a);
      if (nxt) warmData(nxt);
    }, { passive: true, capture: true });

    window.addEventListener("popstate", () => {
      /* SPIKE (overlay, 2026-11-27): when the fullscreen player overlay is
         open, Back must ONLY close the overlay — the SPA must NOT
         re-navigate/re-render the detail page underneath it. The
         overlay's own popstate handler (page-detail.js) closes it.
         Remove with the overlay code if the spike is dropped. */
      if (window.__afPlayerOpen) return;
      navigate(location.pathname + location.search, false);
    });

    /* homepage data prefetch: default data only, gated on idle + visible +
       not saveData. Shell prefetches REMOVED (Phase 2, 2026-11-26): shells
       are tiny — the 2-3s wait is TMDB latency, which the data prefetch
       already warms. Firing 10 calls on every home load, navigated or not,
       was ~2-3k wasted Worker invocations/day. */
    try {
      const isHome = navKeyFor(location.pathname + location.search) === "home";
      if (isHome) {
        const runHomePrefetch = () => {
          try {
            if (document.visibilityState !== "visible") return;
            if (navigator.connection && navigator.connection.saveData) return;
            TMDB.discover("movie", { genre: "", year: "", sort: "popular", page: 1 }).catch(() => {});
            TMDB.discover("tv", { genre: "", year: "", sort: "popular", page: 1 }).catch(() => {});
            TMDB.genres("movie").catch(() => {});
            TMDB.genres("tv").catch(() => {});
            TMDB.trending("all", "day").catch(() => {});
            TMDB.providers().catch(() => {});
          } catch (_) {}
        };
        const scheduleHomePrefetch = () => {
          setTimeout(() => {
            if (document.visibilityState !== "visible") {
              const onVis = () => {
                if (document.visibilityState !== "visible") return;
                document.removeEventListener("visibilitychange", onVis);
                scheduleHomePrefetch();
              };
              document.addEventListener("visibilitychange", onVis);
              return;
            }
            if (typeof requestIdleCallback === "function") requestIdleCallback(runHomePrefetch, { timeout: 5000 });
            else runHomePrefetch();
          }, 3000);
        };
        scheduleHomePrefetch();
      }
    } catch (_) {}
  }

  function mountChrome(active) {
    // static gradient ambient background (once per page — pure CSS, no images)
    if (!document.querySelector(".ambient")) {
      const au = document.createElement("div");
      au.className = "ambient"; au.setAttribute("aria-hidden", "true");
      document.body.prepend(au);
    }
    const navHost = document.getElementById("site-nav");
    if (navHost && !navHost.dataset.built) {
      navHost.dataset.built = "1";
      navHost.innerHTML = `
      <header class="topnav"><nav class="nav-pill" aria-label="Main">
        <a class="brand" href="./"><span class="brand-mark">${I.logo}</span><span class="brand-word"><b>Arena</b><span class="fx">Flix</span></span></a>
        <div class="nav-links" id="navLinks">
          <a href="./" data-nav="home">Home</a>
          <a href="/movies" data-nav="movies">Movies</a>
          <a href="/tv" data-nav="tv">TV Shows</a>
        </div>
        <span class="nav-indicator" id="navInd"></span>
        <div class="nav-icons">
          <button class="icon-btn" id="browsePopBtnD" aria-label="Browse">${I.compass}</button>
          <button class="icon-btn" id="searchPopBtn" aria-label="Search">${I.search}</button>
          <a class="icon-btn" href="/mylist" aria-label="My List">${I.bookmark}</a>
        </div>
      </nav></header>
      <nav class="tabbar" aria-label="Mobile">
        <a href="./" data-nav="home">${I.home}<span>Home</span></a>
        <a href="/movies" data-nav="movies">${I.film}<span>Movies</span></a>
        <a href="/tv" data-nav="tv">${I.tv}<span>TV</span></a>
        <button data-nav="browse" id="browsePopBtn" aria-label="Browse">${I.compass}<span>Browse</span></button>
        <a href="/search" data-nav="search">${I.search}<span>Search</span></a>
        <a href="/settings" data-nav="settings">${I.gear}<span>Settings</span></a>
      </nav>`;
      // active states + sliding lime indicator are handled by setActiveNav()
      let rzT = null;
      window.addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => setActiveNav(_currentNav), 120); });
      // mobile: header melts into hero at top, gains glass on scroll
      const topnav = navHost.querySelector(".topnav");
      const onScroll = () => { if (topnav) topnav.classList.toggle("scrolled", window.scrollY > 40); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      initAutoHideNav();
      PBar.init();
      const spBtn = navHost.querySelector("#searchPopBtn");
      if (spBtn) spBtn.addEventListener("click", (e) => { e.preventDefault(); openSearchPop(); });
      const brBtn = navHost.querySelector("#browsePopBtn");
      if (brBtn) brBtn.addEventListener("click", (e) => { e.preventDefault(); openBrowsePop(); });
      const brBtnD = navHost.querySelector("#browsePopBtnD");
      if (brBtnD) brBtnD.addEventListener("click", (e) => { e.preventDefault(); openBrowsePop(); });
    }
    setActiveNav(active);
    requestAnimationFrame(() => setActiveNav(active));
    const footHost = document.getElementById("site-foot");
    if (footHost && !footHost.dataset.built) {
      footHost.dataset.built = "1";
      footHost.innerHTML = `
      <footer><div class="wrap"><div class="foot-grid">
        <div>
          <div class="foot-brand"><span class="brand-mark">${I.logo}</span><span class="brand-word"><b>Arena</b><span class="fx">Flix</span></span></div>
          <p class="foot-disclaimer">ArenaFlix does not host any files. All content is provided by third-party services.</p>
        </div>
        <div class="foot-contact">
          <a class="fc-mail" href="mailto:mkdrivedata@gmail.com">Contact Us</a>
        </div>
      </div></div></footer>`;
    }
    initSpaNav();
  }

  /* ---------- cards ---------- */
  /* lazy images: start loading ~2 screens early so they're ready before scroll */
  const lzIO = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const im = en.target;
      lzIO.unobserve(im);
      const s = im.getAttribute("data-lz");
      if (s) { im.src = s; im.removeAttribute("data-lz"); }
    });
  }, { rootMargin: "1400px 0px", threshold: 0 }) : null;

  function watchLazy(scope) {
    const root = scope || document;
    const imgs = root.querySelectorAll ? root.querySelectorAll("img[data-lz]") : [];
    if (!lzIO) { imgs.forEach(im => { im.src = im.getAttribute("data-lz"); im.removeAttribute("data-lz"); }); return; }
    imgs.forEach(im => lzIO.observe(im));
  }
  /* auto-pick any lazily injected images (rows, grids, cast, search) */
  if ("MutationObserver" in window && lzIO) {
    new MutationObserver((muts) => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (!n || n.nodeType !== 1) return;
        if (n.tagName === "IMG") { if (n.hasAttribute("data-lz")) lzIO.observe(n); }
        else if (n.querySelectorAll) n.querySelectorAll("img[data-lz]").forEach(im => lzIO.observe(im));
      }));
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function posterCard(it, forceType) {
    if (!it || !it.poster_path) return ""; /* no image -> don't show the card at all */
    const type = typeOf(it, forceType);
    const t = esc(titleOf(it)), y = yearOf(it), r = rating(it);
    const p = img(it.poster_path, "w342");
    const rs = releaseStatus(it);
    const badge = rs === "upcoming" ? `<span class="rel-badge rb-up">Upcoming</span>`
      : rs === "intheaters" ? `<span class="rel-badge rb-th">In Theaters</span>` : "";
    return `<a class="card" href="/detail?${qs({ type, id: it.id })}">
      <div class="card-poster">
        <div class="logo-ph">${I.logo}</div>
        ${p ? `<img data-lz="${p}" decoding="async" alt="${t}" onload="this.style.opacity=1" onerror="this.remove()">` : ""}
        ${r ? `<span class="rating-chip">${I.star}${r}</span>` : ""}
        <div class="card-hover"><span class="play-circle">${I.play}</span></div>
      </div>
      ${badge ? `<div class="rel-wrap">${badge}</div>` : ""}
      <div class="card-caption"><h4>${t}</h4><p>${y}</p></div>
    </a>`;
  }

  function top10Item(it, i, forceType) {
    if (!it || !it.backdrop_path) return ""; /* no image -> don't show the card at all */
    const type = typeOf(it, forceType);
    const t = esc(titleOf(it)), y = yearOf(it), r = rating(it);
    const b = img(it.backdrop_path, "w500");
    return `<a class="top10-item" href="/detail?${qs({ type, id: it.id })}">
      <div class="top10-row">
        <span class="top10-num">${i + 1}</span>
        <div class="top10-thumb">
          <div class="logo-ph">${I.logo}</div>
          ${b ? `<img data-lz="${b}" decoding="async" alt="${t}" onload="this.style.opacity=1" onerror="this.remove()" style="position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease">` : ""}
          ${r ? `<span class="rating-chip" style="z-index:2">${I.star}${r}</span>` : ""}
        </div>
      </div>
      <div class="top10-meta"><h4>${t}</h4><p>${y}</p></div>
    </a>`;
  }

  /* ---------- continue watching (localStorage) ---------- */
  const CW_KEY = "arenaflix-continue";
  function getContinue() {
    try { return JSON.parse(localStorage.getItem(CW_KEY)) || []; }
    catch (_) { return []; }
  }
  function saveContinue(item) {
    try {
      const list = getContinue().filter(x => !(x.type === item.type && String(x.id) === String(item.id)));
      list.unshift(Object.assign({ ts: Date.now() }, item));
      localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (_) {}
  }
  function clearContinue() {
    try { localStorage.removeItem(CW_KEY); } catch (_) {}
  }

  /* ---------- provider chip (circular logo) ---------- */
  function providerChip(p) {
    const logo = img(p.logo_path, "w185");
    if (!logo) return "";
    return `<a class="prov-chip" href="/movies?${qs({ provider: p.provider_id, pname: p.provider_name, plogo: p.logo_path })}" title="${esc(p.provider_name)}">
      <span class="prov-logo"><img data-lz="${logo}" decoding="async" alt="${esc(p.provider_name)}" onload="this.style.opacity=1" onerror="this.remove()"></span>
      <span class="prov-name">${esc(p.provider_name)}</span>
    </a>`;
  }

  /* ---------- landscape card (continue watching) ---------- */
  function landscapeCard(it, forceType) {
    if (!it) return "";
    const type = typeOf(it, forceType);
    const t = esc(titleOf(it)), y = yearOf(it);
    const b = img(it.backdrop_path || it.poster_path, "w500");
    if (!b) return "";
    return `<a class="land-card" href="/watch?${qs({ type, id: it.id })}">
      <div class="land-thumb">
        <div class="logo-ph">${I.logo}</div>
        <img data-lz="${b}" decoding="async" alt="${t}" onload="this.style.opacity=1" onerror="this.remove()">
        <span class="land-play">${I.play}</span>
      </div>
      <div class="card-caption"><h4>${t}</h4>${y ? `<p>${y}</p>` : ""}</div>
    </a>`;
  }

  /* ---------- rows ---------- */
  function rowShell(title, viewAll, innerId, skeletonCount = 8) {
    return `<section class="row"><div class="wrap">
      <div class="row-head"><h2>${esc(title)}</h2>
      ${viewAll ? `<a class="view-all" href="${viewAll}">View All ${I.arrowR}</a>` : ""}</div>
      <div class="scroller" id="${innerId}">
        ${Array.from({ length: skeletonCount }, () =>
          `<div class="sk-card"><div class="sk"></div></div>`).join("")}
      </div>
    </div></section>`;
  }
  function fillRow(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html || `<div class="state-msg">Nothing found.</div>`;
  }
  function gridSkeleton(el, n = 12) {
    el.innerHTML = `<div class="browse-grid sk-grid">` +
      Array.from({ length: n }, () => `<div class="sk"></div>`).join("") + `</div>`;
  }

  /* ---------- key-missing / error states ---------- */
  function keyErrorHTML() {
    return `<div class="wrap"><div class="key-error">
      <h2>TMDB API key missing</h2>
      <p>Add your TMDB API key in <code>js/config.js</code> as <code>CONFIG.TMDB_KEY</code>, then reload.</p>
    </div></div>`;
  }
  function mountKeyError() {
    document.body.innerHTML =
      `<div id="site-nav"></div><main>${keyErrorHTML()}</main><div id="site-foot"></div>`;
    mountChrome("");
  }

  /* ---------- themes ---------- */
  const THEMES = [
    { id: "amber", name: "Midnight Amber", tag: "Dark", color: "#161310" },
    { id: "blue", name: "Midnight Blue", tag: "Dark", color: "#0d1626" },
    { id: "purple", name: "Violet Dusk", tag: "Dark", color: "#140f1e" },
    { id: "teal", name: "Deep Teal", tag: "Dark", color: "#0a1a1c" },
    { id: "crimson", name: "Crimson Night", tag: "Dark", color: "#1c0d10" },
    { id: "magenta", name: "Magenta Glow", tag: "Dark", color: "#1a0e18" },
    { id: "lime", name: "Lime Rush", tag: "Dark", color: "#0d1a0a" },
    { id: "ember", name: "Ember Fire", tag: "Dark", color: "#170d08" },
  ];
  const themeIds = THEMES.map(t => t.id);
  function getTheme() {
    try {
      const t = localStorage.getItem("arenaflix-theme");
      return themeIds.includes(t) ? t : "amber";
    } catch (e) { return "amber"; }
  }
  function applyTheme(name) {
    const t = themeIds.includes(name) ? name : "amber";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("arenaflix-theme", t); } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#0e2a1a"); // URL bar always dark green
    return t;
  }
  /* preferences: reduce motion + hero autoplay — applied on every page */
  function initPrefs() {
    try {
      if (localStorage.getItem("arenaflix-reduce-motion") === "1")
        document.documentElement.classList.add("reduce-motion");
    } catch (e) {}
  }
  function heroAuto() {
    try { return localStorage.getItem("arenaflix-hero-auto") !== "0"; }
    catch (e) { return true; }
  }

  /* ---------- ambient background: static gradient (no per-title image) ---------- */
  function setAmbient(_url) {
    /* No-op since 2026-10-14: the background is one static CSS gradient
       (dark green + sunlight). Zero image loads, zero blur cost, max FPS.
       Kept so page scripts calling UI.setAmbient don't need changes. */
  }

  /* header: COMPLETELY FIXED at top, never hides - user 2026-10-17 */
  function initAutoHideNav() {
    return; // fully disabled - header always visible
  }

  /* green top bar — SPA page switches only, never stuck (6s watchdog) */
  const PBar = {
    el: null, t: null,
    init() { this.el = document.getElementById("pbar"); },
    start() {
      const b = this.el; if (!b) return;
      clearTimeout(this.t);
      b.classList.remove("done"); void b.offsetWidth; b.classList.add("run");
      this.t = setTimeout(() => this.finish(), 6000);
    },
    finish() {
      const b = this.el; if (!b) return;
      clearTimeout(this.t);
      if (!b.classList.contains("run")) return;
      b.classList.add("done");
      this.t = setTimeout(() => b.classList.remove("run", "done"), 750);
    }
  };

  /* ---------- search popup (top-bar button) ---------- */
  let browsePopEl = null;
  function openBrowsePop() {
    if (browsePopEl) return;
    const el = document.createElement("div");
    el.className = "browse-pop";
    el.innerHTML = `
      <div class="bp-backdrop"></div>
      <div class="bp-panel" role="dialog" aria-label="Browse">
        <a class="bp-item" href="/anime"><span class="bp-ic">${I.sparkles || I.film}</span><span>Anime</span>${I.arrowR}</a>
        <a class="bp-item" href="/asian"><span class="bp-ic">${I.tv}</span><span>Asian Dramas</span>${I.arrowR}</a>
        <a class="bp-item" href="/dice"><span class="bp-ic">🎲</span><span>Random Pick</span>${I.arrowR}</a>
        <div class="bp-sep"></div>
        <a class="bp-item" href="/mylist"><span class="bp-ic">${I.bookmark}</span><span>My List</span>${I.arrowR}</a>
      </div>`;
    document.body.appendChild(el);
    browsePopEl = el;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    function close() {
      el.classList.remove("show");
      setTimeout(() => { el.remove(); if (browsePopEl === el) browsePopEl = null; }, 220);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    el.querySelector(".bp-backdrop").addEventListener("click", close);
    el.addEventListener("click", (e) => {
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !a.getAttribute("href").startsWith("#")) {
        setTimeout(close, 60);
      }
    });
  }
  let searchPopEl = null;
  function openSearchPop() {
    if (searchPopEl) { searchPopEl.querySelector("input").focus(); return; }
    const el = document.createElement("div");
    el.className = "search-pop";
    el.innerHTML = `
      <div class="sp-backdrop"></div>
      <div class="sp-panel" role="dialog" aria-label="Search">
        <div class="sp-bar">
          <span class="sp-icon">${I.search}</span>
          <input type="search" placeholder="Movies, TV shows…" autocomplete="off" aria-label="Search">
          <button class="sp-close" aria-label="Close">${I.x}</button>
        </div>
        <div class="sp-results"></div>
      </div>`;
    document.body.appendChild(el);
    searchPopEl = el;
    const input = el.querySelector("input");
    const results = el.querySelector(".sp-results");
    let t = null, lastQ = "", seq = 0;

    function close() {
      el.classList.add("hide");
      setTimeout(() => { el.remove(); if (searchPopEl === el) searchPopEl = null; }, 220);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    el.querySelector(".sp-backdrop").addEventListener("click", close);
    el.querySelector(".sp-close").addEventListener("click", close);
    // result clicks use SPA nav then close the popup
    el.addEventListener("click", (e) => {
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !a.getAttribute("href").startsWith("#")) {
        setTimeout(close, 60);
      }
    });

    async function run(qv) {
      const my = ++seq; lastQ = qv;
      if (!qv) {
        results.innerHTML = `<div class="sp-hint">Type to search movies and TV shows…</div>`;
        return;
      }
      results.innerHTML = `<div class="sp-grid">${'<div class="sk-card"></div>'.repeat(6)}</div>`;
      try {
        const list = await TMDB.search(qv);
        if (my !== seq || qv !== lastQ) return;
        results.innerHTML = list.length
          ? `<div class="sp-grid">${list.map(x => posterCard(x)).join("")}</div>`
          : `<div class="sp-hint">No results for "${esc(qv)}".</div>`;
        watchLazy(results);
      } catch (_) {
        if (my !== seq) return;
        results.innerHTML = `<div class="sp-hint">Search failed. Try again.</div>`;
      }
    }
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => run(input.value.trim()), 300);
    });
    // animate in, then focus (lets the keyboard open smoothly on mobile)
    requestAnimationFrame(() => { el.classList.add("show"); setTimeout(() => input.focus(), 120); });
    run("");
  }

  /* ---------- toast ---------- */
  let toastT = null;
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("show"), 1800);
  }

  /* query params for the CURRENT navigation (off-screen renders see the
     destination URL, not the still-visible old page's location) */
  function pageQuery() {
    const href = window.__afUrl || location.href;
    const qi = href.indexOf("?");
    return new URLSearchParams(qi >= 0 ? href.slice(qi + 1) : "");
  }

  /* custom dropdown — opens inline below the button (no native fullscreen picker) */
  const CHEV_D = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="m6 9 6 6 6-6"/></svg>';
  function dropdown(host, opts) {
    const { options, value: initVal, onChange, ariaLabel } = opts;
    const labelFor = (v) => {
      const o = (options || []).find(o => String(o[0]) === String(v));
      return o ? o[1] : "";
    };
    const optHTML = (v) => (options || []).map(([ov, ol]) =>
      `<button type="button" role="option" class="dd-opt${String(ov) === String(v) ? " sel" : ""}" data-v="${esc(String(ov))}" aria-selected="${String(ov) === String(v)}">${esc(ol)}</button>`
    ).join("");
    host.classList.add("dd");
    host.innerHTML = `
      <button type="button" class="dd-btn select" aria-haspopup="listbox" aria-expanded="false"${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}>
        <span class="dd-label">${esc(labelFor(initVal))}</span>${CHEV_D}
      </button>
      <div class="dd-menu" role="listbox" tabindex="-1">${optHTML(initVal)}</div>`;
    const btn = host.querySelector(".dd-btn"), menu = host.querySelector(".dd-menu");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const was = host.classList.contains("open");
      document.querySelectorAll(".dd.open").forEach(d => {
        d.classList.remove("open");
        const b = d.querySelector(".dd-btn"); if (b) b.setAttribute("aria-expanded", "false");
      });
      host.classList.toggle("open", !was);
      btn.setAttribute("aria-expanded", String(!was));
    });
    menu.addEventListener("click", (e) => {
      const o = e.target.closest(".dd-opt"); if (!o) return;
      const v = o.getAttribute("data-v");
      menu.querySelectorAll(".dd-opt").forEach(x => {
        const on = x === o;
        x.classList.toggle("sel", on); x.setAttribute("aria-selected", String(on));
      });
      host.querySelector(".dd-label").textContent = o.textContent;
      host.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
      if (onChange) onChange(v);
    });
    return {
      setOptions(newOpts, newVal) {
        opts.options = newOpts;
        menu.innerHTML = (newOpts || []).map(([ov, ol]) =>
          `<button type="button" role="option" class="dd-opt${String(ov) === String(newVal) ? " sel" : ""}" data-v="${esc(String(ov))}" aria-selected="${String(ov) === String(newVal)}">${esc(ol)}</button>`
        ).join("");
        const f = (newOpts || []).find(o => String(o[0]) === String(newVal));
        host.querySelector(".dd-label").textContent = f ? f[1] : "";
      }
    };
  }
  /* one global closer for every custom dropdown */
  if (!window.__afDdCloser) {
    window.__afDdCloser = true;
    document.addEventListener("click", () => {
      document.querySelectorAll(".dd.open").forEach(d => {
        d.classList.remove("open");
        const b = d.querySelector(".dd-btn"); if (b) b.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") document.querySelectorAll(".dd.open").forEach(d => d.classList.remove("open"));
    });
  }

  /* ---------- my list (localStorage) ---------- */
  const LS_KEY = "arenaflix_mylist";
  function getList() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function inList(type, id) {
    return getList().some(x => x.type === type && String(x.id) === String(id));
  }
  function toggleList(entry) {
    const list = getList();
    const i = list.findIndex(x => x.type === entry.type && String(x.id) === String(entry.id));
    if (i >= 0) { list.splice(i, 1); toast("Removed from My List"); }
    else {
      list.unshift({ type: entry.type, id: entry.id, title: entry.title,
        poster_path: entry.poster_path || null, vote_average: entry.vote_average || 0,
        release_date: entry.release_date || "", first_air_date: entry.first_air_date || "" });
      toast("Added to My List");
    }
    try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200))); } catch (e) {}
    return i < 0;
  }

  return {
    I, esc, img, titleOf, yearOf, typeOf, releaseStatus, rating, qs, watchLazy, dropdown, pageQuery,
    mountChrome, setActiveNav, onPageLeave, initSpaNav,
    getContinue, saveContinue, clearContinue, providerChip, landscapeCard,
    setAmbient, posterCard, top10Item, rowShell, fillRow, gridSkeleton,
    keyErrorHTML, mountKeyError, toast,
    getList, inList, toggleList,
    THEMES, getTheme, applyTheme, initPrefs, heroAuto, openSearchPop, openBrowsePop
  };
})();
/* apply saved prefs as early as possible on every page */
UI.initPrefs();

