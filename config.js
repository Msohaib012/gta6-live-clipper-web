// Clipper bridge (Cloudflare Worker + KV, account 2 — mkdrivedata).
// The website never talks to the VM directly; every submit goes here and
// the VM polls it. Change this URL only if the Worker moves.
window.CLIPPER_BRIDGE = "https://clipper-bridge.mkdrivedata.workers.dev";
