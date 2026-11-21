/* CFB Clips — cfb.html ka JS. Bridge: config.js (window.CLIPPER_BRIDGE).
   Flow: /cfb-submit (YouTube URL + count) -> job id -> /cfb-status?id=
   har 10s poll karo -> ready par clip link dikhao. */
(function () {
  "use strict";
  var BRIDGE = window.CLIPPER_BRIDGE || "";
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }
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

  var jobId = null;
  var pollTimer = null;
  var STAGE_TEXT = {
    queued: "Queue me — engine free hote hi shuru hoga",
    download: "Video download ho rahi hai…",
    transcribe: "Baat sun kar transcript ban raha hai…",
    moments: "Best moments dhoondhe ja rahe hain…",
    rank: "Clips rank ho rahe hain…",
    render: "Stage + gold frame me render ho raha hai…",
    complete: "Tayyar!",
    ready: "Tayyar!",
    failed: "Fail ho gaya"
  };

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
  function showStatus(job) {
    var st = job.status || "queued";
    var pct = typeof job.progress === "number" ? job.progress : 0;
    $("cfb-status-text").textContent = (STAGE_TEXT[job.stage] || STAGE_TEXT[st] || st) + " · " + pct + "%";
    $("cfb-bar").style.width = pct + "%";
    var note = $("cfb-status-note");
    var linkBox = $("cfb-status-link");
    if (st === "ready") {
      stopPolling();
      note.textContent = "Clip tayyar hai — neeche link se dekho ya download karo. Gallery me bhi aa gaya hai.";
      var html = "";
      var links = [];
      if (job.clip_link) links.push(job.clip_link);
      (job.links || []).forEach(function (l) { if (l && links.indexOf(l) === -1) links.push(l); });
      links.forEach(function (l, i) {
        var label = i === 0 ? "▶ Clip dekho / download karo" : "Link " + (i + 1);
        html += '<p style="margin:6px 0"><a class="btn" style="display:inline-block;text-decoration:none" href="' + esc(l) + '" target="_blank" rel="noopener">' + label + "</a></p>";
      });
      linkBox.innerHTML = html;
      toast("CFB clip tayyar hai");
    } else if (st === "failed") {
      stopPolling();
      note.textContent = "❌ " + (job.error || "Engine fail ho gaya — dobara try karo ya chhoti video do.");
      linkBox.innerHTML = "";
    } else {
      note.textContent = "Job chal rahi hai — ye page khula rakho, link yahin aayega.";
      linkBox.innerHTML = "";
    }
  }
  function pollStatus() {
    if (!jobId) return;
    bridge("/cfb-status?id=" + encodeURIComponent(jobId)).then(function (r) {
      if (r.status === 200 && r.json && r.json.ok && r.json.job) {
        showStatus(r.json.job);
      }
    }).catch(function () { /* agli poll par dobara */ });
  }

  // Bridge health pill
  bridge("/health").then(function (r) {
    $("bridge-status").textContent = (r.status === 200 && r.json && r.json.ok) ? "Bridge online" : "Bridge se rabta nahi";
  }).catch(function () {
    $("bridge-status").textContent = "Bridge se rabta nahi";
  });

  $("cfb-go").addEventListener("click", function () {
    var url = ($("cfb-link").value || "").trim();
    var btn = $("cfb-go");
    if (!url) { toast("Pehle video ka link paste karo"); return; }
    if (!/^https?:\/\//i.test(url)) { toast("Sahi link paste karo — https:// se shuru ho"); return; }
    if (!/(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(url)) { toast("Sirf YouTube link chalta hai"); return; }
    var count = parseInt($("cfb-count").value, 10) || 1;
    btn.disabled = true;
    btn.textContent = "Bhej rahe hain…";
    bridge("/cfb-submit", { method: "POST", body: { video_url: url, count: count } }).then(function (r) {
      btn.disabled = false;
      btn.textContent = "CFB Shorts banao";
      var res = $("cfb-result");
      res.hidden = false;
      if (r.status === 200 && r.json && r.json.ok) {
        jobId = r.json.id;
        res.innerHTML = "✅ <b>CFB job mil gayi!</b> ID: <code>" + esc(jobId) + "</code> — engine video ka transcript parh kar best moments dhoondh raha hai.";
        $("cfb-status-card").hidden = false;
        $("cfb-status-text").textContent = "Queue me · 0%";
        $("cfb-bar").style.width = "0%";
        $("cfb-status-note").textContent = "Job chal rahi hai — ye page khula rakho, link yahin aayega.";
        $("cfb-status-link").innerHTML = "";
        toast("CFB job bhej di");
        stopPolling();
        pollTimer = setInterval(pollStatus, 10000);
      } else {
        res.innerHTML = "❌ Job nahi gayi — " + esc((r.json && r.json.error) || ("HTTP " + r.status)) + ". Link dobara check karo.";
        toast("CFB job fail — dobara try karo");
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "CFB Shorts banao";
      var res = $("cfb-result");
      res.hidden = false;
      res.innerHTML = "❌ Internet ya bridge ka masla — thodi der baad dobara try karo.";
      toast("CFB job fail — dobara try karo");
    });
  });
})();
