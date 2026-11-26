/* ArenaFlix — home: hero carousel + rows */
(async function () {
  UI.mountChrome("home");
  const main = window.__afRoot || document.getElementById("app");

  main.innerHTML = `
    <section class="hero" id="hero">
      <div id="heroSlides"></div>
      <div class="hero-shade"></div>
      <div class="hero-curtain"></div>
      <div class="hero-content"><div class="wrap" id="heroContent"></div></div>
      <div class="hero-arrows">
        <button class="hero-arrow" id="heroPrev" aria-label="Previous">${UI.I.chevL}</button>
        <button class="hero-arrow" id="heroNext" aria-label="Next">${UI.I.chevR}</button>
      </div>
      <div class="hero-segments" id="heroSegs"></div>
    </section>
    <div class="wrap">
      <div class="social-banner">Join our channel for ArenaFlix updates</div>
      <div class="social-icons">
        <a class="social-box tg" href="https://t.me/arenaflix" target="_blank" rel="noopener" aria-label="Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </a>
        <a class="social-box wa" href="https://whatsapp.com/channel/0029VaeFfBv9MF98D6WX1X3z" target="_blank" rel="noopener" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>
      </div>
    </div>
    <div id="rows"></div>`;

  /* ---------- hero ---------- */
  let items = [], idx = 0, timer = null;
  UI.onPageLeave(() => clearInterval(timer));
  const slidesEl = main.querySelector("#heroSlides");
  const contentEl = main.querySelector("#heroContent");
  const segsEl = main.querySelector("#heroSegs");
  const heroEl = main.querySelector("#hero");

  function renderHero() {
    slidesEl.innerHTML = items.map((it, i) => {
      const b = UI.img(it.backdrop_path, "w1280");
      return `<div class="hero-slide${i === 0 ? " active" : ""}">` +
        (b ? `<img class="bg" src="${b}" alt="" decoding="async"${i === 0 ? ' fetchpriority="high"' : ""}>` : "") + `</div>`;
    }).join("");
    segsEl.innerHTML = items.map((_, i) =>
      `<button data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("");
    segsEl.querySelectorAll("button").forEach(b =>
      b.addEventListener("click", () => goTo(+b.dataset.i, true)));
    updateContent();
  }
  function updateContent() {
    const it = items[idx]; if (!it) return;
    if (it.backdrop_path) UI.setAmbient(UI.img(it.backdrop_path, "w342"));
    const type = UI.typeOf(it);
    const r = UI.rating(it);
    contentEl.innerHTML = `
      <span class="eyebrow"><span class="dot"></span>${idx === 0 ? "#1 TRENDING" : "TRENDING NOW"}</span>
      ${it._logoUrl 
        ? `<img class="hero-logo" src="${it._logoUrl}" alt="${UI.esc(UI.titleOf(it))}" onerror="this.outerHTML='<h1 class=&quot;hero-title&quot;>${UI.esc(UI.titleOf(it))}</h1>'">`
        : `<h1 class="hero-title">${UI.esc(UI.titleOf(it))}</h1>`}
      <div class="hero-meta">
        ${r ? `<span class="rate">${UI.I.star}${r}</span>` : ""}
        <span>${UI.yearOf(it)}</span>
        <span>${type === "tv" ? "TV Series" : "Movie"}</span>
      </div>
      <p class="hero-overview">${UI.esc(it.overview || "")}</p>
      <div class="hero-actions">
        <a class="btn btn-white" href="/detail?${UI.qs({ type, id: it.id })}">${UI.I.play}Play</a>
        <a class="btn btn-glass" href="/detail?${UI.qs({ type, id: it.id })}">More Info</a>
      </div>`;
  }
  function goTo(i, manual) {
    idx = (i + items.length) % items.length;
    slidesEl.querySelectorAll(".hero-slide").forEach((s, k) =>
      s.classList.toggle("active", k === idx));
    segsEl.querySelectorAll("button").forEach((b, k) =>
      b.classList.toggle("active", k === idx));
    updateContent();
    if (manual) restart();
  }
  function restart() { clearInterval(timer); if (UI.heroAuto()) timer = setInterval(() => goTo(idx + 1), 7000); }

  main.querySelector("#heroPrev").addEventListener("click", () => goTo(idx - 1, true));
  main.querySelector("#heroNext").addEventListener("click", () => goTo(idx + 1, true));
  heroEl.addEventListener("mouseenter", () => clearInterval(timer));
  heroEl.addEventListener("mouseleave", restart);

  /* ---------- rows ---------- */
  /* app home categories #2-14 (from web_version.html homeCategories) */
  const CATS = [
    { id: "rowRecentMovies", title: "Recent Movies", link: "/category?cat=rowRecentMovies", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_original_language=hi&sort_by=primary_release_date.desc&vote_count.gte=1") },
    { id: "rowRecentTv", title: "Recent TV Shows", link: "/category?cat=rowRecentTv", type: "tv",
      fetch: () => TMDB.discoverRaw("tv", "&with_original_language=hi&sort_by=first_air_date.desc&vote_count.gte=1") },
    { id: "rowKdrama", title: "Popular K-Drama", link: "/category?cat=rowKdrama", type: "tv",
      fetch: () => TMDB.discoverRaw("tv", "&with_origin_country=KR&sort_by=popularity.desc") },
    { id: "rowPopTv", title: "Popular TV Shows", link: "/category?cat=rowPopTv", type: "tv",
      fetch: () => TMDB.popular("tv") },
    { id: "rowTopMovies", title: "Top Rated Movies", link: "/category?cat=rowTopMovies", type: "movie",
      fetch: () => TMDB.topRated("movie") },
    { id: "rowTopTv", title: "Top Rated TV Shows", link: "/category?cat=rowTopTv", type: "tv",
      fetch: () => TMDB.topRated("tv") },
    { id: "rowHollywood", title: "Hollywood Blockbusters", link: "/category?cat=rowHollywood", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_original_language=en&sort_by=revenue.desc") },
    { id: "rowAction", title: "Action Movies", link: "/category?cat=rowAction", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_genres=28") },
    { id: "rowComedy", title: "Comedy Movies", link: "/category?cat=rowComedy", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_genres=35") },
    { id: "rowHorror", title: "Horror Movies", link: "/category?cat=rowHorror", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_genres=27") },
    { id: "rowCartoon", title: "Cartoon Movies", link: "/category?cat=rowCartoon", type: "movie",
      fetch: () => TMDB.discoverRaw("movie", "&with_genres=16") },
  ];

  const rowsEl = main.querySelector("#rows");
  const cwList = UI.getContinue();
  rowsEl.innerHTML =
    `<section class="row"><div class="wrap">
       <div class="row-head"><h2>Browse by Providers</h2></div>
       <div class="prov-row" id="rowProviders">${'<div class="sk sk-circle"></div>'.repeat(8)}</div>
     </div></section>` +
    (cwList.length ?
    `<section class="row" id="cwSection"><div class="wrap">
       <div class="row-head"><h2>Continue Watching</h2><button class="row-clear" id="cwClear">Clear</button></div>
       <div class="scroller" id="rowContinue">${cwList.map(x => UI.landscapeCard(x)).join("")}</div>
     </div></section>` : "") +
    UI.rowShell("Trending Today", "/movies", "rowTrending") +
    `<section class="row"><div class="wrap">
       <div class="row-head"><h2>Top 10 Movies</h2><a class="view-all" href="/movies">View All ${UI.I.arrowR}</a></div>
       <div class="scroller" id="rowTop10">${'<div class="sk-card"><div class="sk"></div></div>'.repeat(6)}</div>
     </div></section>` +
    CATS.map(c => UI.rowShell(c.title, c.link, c.id)).join("");
  // Store filter in sessionStorage when View All clicked (backup for URL params)
  // Use event delegation to handle dynamically loaded links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.view-all');
    if (a && a.href) {
      try {
        const url = new URL(a.href, window.location.origin);
        const params = {};
        for (const [k, v] of url.searchParams) params[k] = v;
        sessionStorage.setItem('viewAllFilter', JSON.stringify(params));
        if (params.cat) sessionStorage.setItem('viewAllCat', params.cat);
      } catch(err) {}
    }
  });

  try {
    const [trendAll, trendMovies, providers] = await Promise.all([
      TMDB.trending("all", "week"),
      TMDB.trending("movie", "week"),
      TMDB.providers().catch(() => []),
    ]);
    items = trendAll.filter(x => x.backdrop_path).slice(0, 5);
    if (items.length) { 
      renderHero(); restart();
      // Fetch logos for hero (movie original title art)
      items.forEach(it => {
        const type = UI.typeOf(it);
        TMDB.details(type, it.id).then(d => {
          const logos = (d.images && d.images.logos) || [];
          const logo = logos.find(l => l.iso_639_1 === "en") || logos.find(l => !l.iso_639_1) || logos[0];
          if (logo) {
            it._logoUrl = UI.img(logo.file_path, "w500");
            if (items[idx] === it) updateContent();
          }
        }).catch(() => {});
      });
    }
    else { heroEl.style.display = "none"; }

    UI.fillRow("rowTrending", trendAll.map(x => UI.posterCard(x)).join(""));
    UI.fillRow("rowTop10", trendMovies.filter(x => x.backdrop_path).slice(0, 10).map((x, i) => UI.top10Item(x, i, "movie")).join(""));
    const provEl = main.querySelector("#rowProviders");
    if (provEl) {
      const html = (providers || []).slice(0, 15).map(p => UI.providerChip(p)).join("");
      if (html) provEl.innerHTML = html;
      else provEl.closest("section").style.display = "none";
    }
    const cwClear = main.querySelector("#cwClear");
    if (cwClear) cwClear.addEventListener("click", () => {
      UI.clearContinue();
      const sec = main.querySelector("#cwSection");
      if (sec) sec.remove();
    });

    /* remaining 13 rows: lazy-load near viewport (staggered, like the app) */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const cat = CATS.find(c => c.id === en.target.id);
        if (!cat || cat._done) return;
        cat._done = true;
        io.unobserve(en.target);
        cat.fetch()
          .then(list => UI.fillRow(cat.id, list.map(x => UI.posterCard(x, cat.type)).join("")))
          .catch(() => UI.fillRow(cat.id, `<div class="state-msg">Could not load.</div>`));
      });
    }, { rootMargin: "600px" });
    CATS.forEach(c => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    if (window.__afReady) window.__afReady();
  } catch (e) {
    if (e.code === "NO_KEY") { UI.mountKeyError(); return; }
    rowsEl.innerHTML = `<div class="wrap"><div class="state-msg">Could not load content. Check your connection and try again.</div></div>`;
    heroEl.style.display = "none";
  }
})();
