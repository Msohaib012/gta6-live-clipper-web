/* ArenaFlix — TMDB API helpers (no key needed until first call) */
const TMDB = (() => {
  const BASE = "/api/tmdb";

  function keyMissing() {
    return !CONFIG.TMDB_KEY || CONFIG.TMDB_KEY === "PASTE_TMDB_KEY_HERE";
  }

  const _apiCache = new Map();
  async function api(path, params = {}) {
    if (keyMissing()) { const e = new Error("NO_KEY"); e.code = "NO_KEY"; throw e; }
    const url = new URL(BASE + path, location.origin);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
    /* short response cache (5 min). In-flight requests are shared via the
       stored promise, so a prefetch + the page script use ONE network call */
    const ck = url.toString();
    const hit = _apiCache.get(ck);
    if (hit) {
      if (Date.now() - hit.t < 300000) return hit.p;
      _apiCache.delete(ck);
    }
    const p = (async () => {
      const r = await fetch(url.toString());
      if (!r.ok) throw new Error("TMDB_HTTP_" + r.status);
      return r.json();
    })();
    _apiCache.set(ck, { p, t: Date.now() });
    if (_apiCache.size > 150) _apiCache.delete(_apiCache.keys().next().value);
    try { return await p; }
    catch (e) { _apiCache.delete(ck); throw e; }
  }

  /* Pakistan time (UTC+5, no DST): a title shows from its release DAY
     in PKT — "usi din hi release wale". All date math on this site uses
     this clock so listings, badges and caps agree. */
  const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
  const daysAgo = (n) => new Date(Date.now() + 5 * 3600e3 - n * 864e5).toISOString().slice(0, 10);

  /* Released-only gate (owner order 2026-11-24): upcoming titles must not
     show in any category or anywhere else — only from release day on.
     Dateless items stay (release unknown, not provably upcoming). */
  const isReleased = (it) => {
    const d = (it && (it.release_date || it.first_air_date)) || "";
    return !d || d <= today();
  };
  const releasedOnly = (list) => (list || []).filter(isReleased);

  return {
    keyMissing,
    api,
    today,
    releasedOnly,

    trending: (media = "all", window_ = "week") =>
      api(`/trending/${media}/${window_}`).then(d => releasedOnly(d.results)),

    popular: (type) => api(`/${type}/popular`).then(d => releasedOnly(d.results)),
    topRated: (type) => api(`/${type}/top_rated`).then(d => releasedOnly(d.results)),

    details: (type, id) =>
      api(`/${type}/${id}`, { append_to_response: "videos,credits,similar,images" }),

    season: (tvId, n) => api(`/tv/${tvId}/season/${n}`),

    videos: (type, id) => api(`/${type}/${id}/videos`).then(d => d.results || []),
    credits: (type, id) => api(`/${type}/${id}/credits`),
    similar: (type, id) => api(`/${type}/${id}/similar`).then(d => releasedOnly(d.results)),

    search: (q) =>
      api("/search/multi", { query: q, include_adult: "false" })
        .then(d => (d.results || []).filter(x => (x.media_type === "movie" || x.media_type === "tv") && isReleased(x))),

    genres: (type) => api(`/genre/${type}/list`).then(d => d.genres || []),

    /* watch providers: pinned majors first (Netflix, Disney+, Prime...),
       then the region's own providers behind them */
    providers: () =>
      Promise.all([
        api("/watch/providers/movie").then(d => d.results || []),
        api("/watch/providers/movie", { watch_region: "PK" }).then(d => d.results || []),
      ]).then(([g, pk]) => {
        const PINNED = [8, 337, 119, 1899, 350]; /* Netflix, Disney Plus, Prime Video, HBO Max, Apple TV */
        TMDB._pkIds = new Set((pk || []).map(p => p.provider_id));
        const byId = new Map();
        g.forEach(p => { if (p.logo_path) byId.set(p.provider_id, p); });
        const out = [];
        PINNED.forEach(id => { if (byId.has(id)) out.push(byId.get(id)); });
        pk.filter(p => p.logo_path && PINNED.indexOf(p.provider_id) < 0)
          .sort((a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999))
          .forEach(p => out.push(p));
        return out;
      }),

    /* person (cast biography page) */
    person: (id) => api(`/person/${id}`),
    personCredits: (id) =>
      api(`/person/${id}/combined_credits`)
        .then(d => releasedOnly(d.cast).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))),

    /* movie collection / parts (e.g. Drishyam 1 & 2, Spider-Man series) */
    collection: (id) =>
      api(`/collection/${id}`)
        .then(d => (d.parts || [])
          .filter(p => p.poster_path)
          .filter(isReleased)
          .sort((a, b) => (a.release_date || "").localeCompare(b.release_date || ""))),

    /* raw discover with app-style params, e.g. "&with_original_language=hi&sort_by=popularity.desc" */
    discoverRaw: (type, raw) => {
      const p = {};
      new URLSearchParams(String(raw || "").replace(/^&/, "")).forEach((v, k) => { p[k] = v; });
      return api(`/discover/${type}`, p).then(d => releasedOnly(d.results));
    },

    /* sort keys: movies -> popular | top_rated | now_playing
       ("upcoming" REMOVED 2026-11-24: unreleased titles show nowhere)
       tv        -> popular | top_rated | airing_today | on_the_air */
    discover: (type, { genre = "", year = "", sort = "popular", page = 1, provider = "", country = "", lang = "" } = {}) => {
      const p = { page, with_genres: genre, vote_count_gte: undefined };
      if (provider) {
        /* with_watch_providers is IGNORED by TMDB without watch_region —
           use PK for local providers, US for the global-only ones */
        p.with_watch_providers = provider;
        const pid = parseInt(provider, 10);
        const GLOBAL_ONLY = new Set([337, 350]); /* Disney Plus, Apple TV — not in PK */
        const isGlobalOnly = TMDB._pkIds ? !TMDB._pkIds.has(pid) : GLOBAL_ONLY.has(pid);
        p.watch_region = isGlobalOnly ? "US" : "PK";
      }
      if (country) p.with_origin_country = country;
      if (lang) p.with_original_language = lang;
      if (type === "movie") {
        p.first_air_date_year = undefined;
        if (year) p.primary_release_year = year;
        /* released-only cap: TMDB must not return future-dated titles,
           so paged grids stay full after the client-side gate */
        p["primary_release_date.lte"] = today();
        if (sort === "popular") p.sort_by = "popularity.desc";
        else if (sort === "top_rated") { p.sort_by = "vote_average.desc"; p["vote_count.gte"] = 300; }
        else if (sort === "now_playing") {
          p.sort_by = "popularity.desc";
          p["primary_release_date.gte"] = daysAgo(45);
        }
        else if (sort === "recent") p.sort_by = "primary_release_date.desc";
        else if (sort === "revenue") p.sort_by = "revenue.desc";
        return api("/discover/movie", p).then(d => { d.results = releasedOnly(d.results); return d; });
      }
      if (year) p.first_air_date_year = year;
      p["first_air_date.lte"] = today();
      if (sort === "popular") p.sort_by = "popularity.desc";
      else if (sort === "top_rated") { p.sort_by = "vote_average.desc"; p["vote_count.gte"] = 300; }
      else if (sort === "airing_today") {
        p.sort_by = "popularity.desc";
        p["air_date.gte"] = today(); p["air_date.lte"] = today();
      }
      else if (sort === "on_the_air") {
        p.sort_by = "popularity.desc";
        p["air_date.gte"] = daysAgo(7); p["air_date.lte"] = today();
      }
      return api("/discover/tv", p).then(d => { d.results = releasedOnly(d.results); return d; });
    }
  };
})();
