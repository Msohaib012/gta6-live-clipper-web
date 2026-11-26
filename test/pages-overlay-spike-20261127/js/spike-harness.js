/* SPIKE-ONLY harness (2026-11-27). DELETE with the spike.
   The scratch API Worker has no TMDB secret by design (it returns 503),
   so real detail data can never load on this scratch host and no real
   Play button renders. To make the overlay flow browser-testable, this
   harness injects a demo Play button (same .play-ad class, same href
   shape, movie 969681) if no real Play button appears within 20s.
   It never touches a page where a real Play button exists. */
(function () {
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (document.querySelector("a.play-ad")) { clearInterval(iv); return; }
    if (tries >= 20) { clearInterval(iv); injectDemo(); }
  }, 1000);
  function injectDemo() {
    if (document.querySelector("a.play-ad")) return;
    var app = document.getElementById("app");
    if (!app) return;
    var box = document.createElement("div");
    box.id = "spike-demo-play";
    box.style.cssText = "max-width:560px;margin:24px auto 0;padding:20px;text-align:center;font-family:sans-serif;color:#fff";
    box.innerHTML = '<p style="color:#fbbf24;font-size:13px;line-height:1.5;margin:0 0 12px">SPIKE DEMO — TMDB data is unavailable on this scratch host (API Worker has no key by design), so a demo Play button is shown to exercise the overlay flow.</p>'
      + '<a class="btn btn-lime btn-round play-ad" href="/watch?type=movie&id=969681" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#22c55e;color:#06210f;font-weight:700;text-decoration:none">\u25b6 <span>Play (Spike Demo — Spider-Man 969681)</span></a>';
    app.appendChild(box);
  }
})();
