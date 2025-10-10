/**
 * verify.js - Final merged version
 *
 * Behavior:
 * - Automatically shows verification popup on every page/post if not verified.
 * - 3 buttons: LinkShortify (24h), GPLinks (24h), AroLinks (12h).
 * - Shorteners generate a short link that redirects back to the SAME page with ?verify=TOKEN&d=12|24.
 * - After return, script validates token, sets localStorage verifiedUntil, and hides popup.
 * - Button visibility controlled by SHOW_BTN1/2/3 ("on"/"off").
 * - No close button; overlay click disabled.
 * - Starfield background + floating animation + language tabs (EN/HI/TE/TA).
 * - Basic anti-tamper deterrents (devtools key blocks + simple detection).
 *
 * Install: upload this file to your repo path (e.g. /manifest/verify.js) and include it on pages.
 *
 * NOTE: Client-side API tokens are visible in-browser. For maximum security move shortening calls to server.
 */

/* ==========================
   CONFIG
   ========================== */
const SHOW_BTN1 = "on"; // LinkShortify (24h)
const SHOW_BTN2 = "on"; // GPLinks    (24h)
const SHOW_BTN3 = "on"; // AroLinks   (12h)

/* API tokens - replace/change if needed */
const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";

/* LocalStorage keys */
const LS_TOKEN_KEY = "anime_verify_token";
const LS_VERIFIED_UNTIL = "anime_verified_until";

/* Durations */
const HOUR = 60 * 60 * 1000;
const DUR_24H = 24 * HOUR;
const DUR_12H = 12 * HOUR;

/* ==========================
   Utilities
   ========================== */
function nowMs() { return Date.now(); }
function genToken(len = 10) { return Math.random().toString(36).substr(2, len); }
function formatRemaining(ms) {
  if (ms <= 0) return "0h 0m";
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / 60000);
  return `${h}h ${m}m`;
}
function getUrlBaseWithoutVerify() {
  const u = new URL(window.location.href);
  u.searchParams.delete("verify");
  u.searchParams.delete("d");
  return u.toString();
}
function getQueryParam(name) {
  try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
}

/* ==========================
   Anti-tamper deterrents (basic)
   ========================== */
(function antiTamper() {
  // Softly block common inspect keys & right-click (Alt+RightClick bypass allowed)
  window.addEventListener("keydown", (e) => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toLowerCase() === "u")) {
      e.preventDefault();
      showTemporaryMessage("This action is disabled for security.");
    }
  });
  window.addEventListener("contextmenu", (e) => {
    if (!e.altKey) { e.preventDefault(); showTemporaryMessage("Right-click disabled."); }
  });

  // Simple detection (viewport change or timing delta) - if suspicious, clear tokens and reinit popup
  let lastPerf = performance.now();
  setInterval(() => {
    const d = performance.now() - lastPerf;
    lastPerf = performance.now();
    const devOpen = (window.outerWidth - window.innerWidth > 160) || (window.outerHeight - window.innerHeight > 160);
    if (devOpen || d > 400) {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_VERIFIED_UNTIL);
      showTemporaryMessage("Security check: close developer tools to continue.");
      setTimeout(() => { try { initVerificationUI(); } catch (e) {} }, 800);
    }
  }, 1500);
})();

/* ==========================
   Shortener helpers
   ========================== */
async function shortenWithLinkShortify(callbackUrl) {
  try {
    const alias = genToken(6);
    const api = `https://linkshortify.com/api?api=${encodeURIComponent(LINKSHORTIFY_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    const r = await fetch(api, { method: "GET", cache: "no-store" });
    if (!r.ok) throw new Error("LinkShortify failed");
    const txt = await r.text();
    return txt ? txt.trim() : null;
  } catch (e) { console.warn("LinkShortify error:", e); return null; }
}
async function shortenWithGPLinks(callbackUrl) {
  try {
    const alias = genToken(6);
    const api = `https://api.gplinks.com/api?api=${encodeURIComponent(GPLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}`;
    const r = await fetch(api, { method: "GET", cache: "no-store" });
    if (!r.ok) throw new Error("GPLinks failed");
    const j = await r.json();
    if (j && j.status === "success" && j.shortenedUrl) return j.shortenedUrl;
    return null;
  } catch (e) { console.warn("GPLinks error:", e); return null; }
}
async function shortenWithAroLinks(callbackUrl) {
  try {
    const alias = genToken(6);
    const api = `https://arolinks.com/api?api=${encodeURIComponent(AROLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    const r = await fetch(api, { method: "GET", cache: "no-store" });
    if (!r.ok) throw new Error("AroLinks failed");
    const txt = await r.text();
    return txt ? txt.trim() : null;
  } catch (e) { console.warn("AroLinks error:", e); return null; }
}

/* ==========================
   UI: starfield, styles, popup
   ========================== */
function injectStyles() {
  if (document.getElementById("verify-style")) return;
  const s = document.createElement("style");
  s.id = "verify-style";
  s.textContent = `
    /* core styles (compact) */
    #verify-overlay{position:fixed;inset:0;background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:9998}
    #verify-popup{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;width:92%;max-width:500px;background:linear-gradient(135deg,rgba(26,0,31,.95),rgba(20,10,30,.95));border-radius:24px;padding:30px;border:1px solid rgba(123,31,162,.4);box-shadow:0 25px 80px rgba(0,0,0,.6);color:#fff;font-family:Poppins,Inter,system-ui,Arial;animation:float 6s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 15px))}}
    .lang-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:18px;flex-wrap:wrap}
    .lang-tab{padding:8px 14px;background:rgba(123,31,162,.1);border-radius:20px;border:1px solid rgba(123,31,162,.25);color:#bdb9c9;cursor:pointer;font-weight:600}
    .lang-tab.active{background:rgba(123,31,162,.32);color:#fff;box-shadow:0 0 18px rgba(123,31,162,.22)}
    .verify-title{text-align:center;font-size:18px;font-weight:700;margin-bottom:8px}
    .verify-desc{text-align:center;color:#cfcbd6;font-size:14px;margin-bottom:18px;line-height:1.4}
    .verify-buttons{display:flex;flex-direction:column;gap:12px;margin-bottom:14px}
    .verify-btn{display:flex;align-items:center;gap:10px;padding:14px;border-radius:12px;border:none;cursor:pointer;font-weight:700;font-size:15px;background:linear-gradient(135deg,rgba(123,31,162,.85),rgba(156,39,176,.85));color:#fff;box-shadow:0 6px 20px rgba(123,31,162,.18)}
    .verify-btn.secondary{background:linear-gradient(135deg,rgba(106,27,154,.85),rgba(142,36,170,.85))}
    .verify-btn.tertiary{background:linear-gradient(135deg,rgba(74,20,140,.85),rgba(106,27,154,.85))}
    .verify-note{font-size:12px;color:#d7d3df;margin-left:8px;margin-top:6px}
    .verify-warning{background:rgba(255,152,0,.1);padding:12px;border-radius:10px;color:#ffb74d;margin-top:10px;text-align:center}
    .verify-progress{height:4px;background:rgba(123,31,162,.18);border-radius:4px;overflow:hidden;margin-top:12px}
    .verify-progress .bar{height:100%;background:linear-gradient(90deg,#7b1fa2,#9c27b0,#ba68c8);background-size:200% 100%;animation:flow 3s linear infinite}
    @keyframes flow{0%{background-position:0 0}100%{background-position:200% 0}}
    @media(max-width:480px){#verify-popup{padding:22px}}
  `;
  document.head.appendChild(s);
}

function createStarfieldCanvas() {
  // Remove existing if any
  const old = document.getElementById("verify-starfield-canvas");
  if (old) old.remove();

  const canvas = document.createElement("canvas");
  canvas.id = "verify-starfield-canvas";
  Object.assign(canvas.style, { position: "fixed", left: "0", top: "0", width: "100%", height: "100%", zIndex: "1000", pointerEvents: "none" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener("resize", resize);

  const stars = [];
  const count = Math.max(80, Math.floor((window.innerWidth * window.innerHeight) / 9000));
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      d: Math.random() * 0.03 + 0.005
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(6,3,10,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let s of stars) {
      s.alpha += s.d * (Math.random() > 0.5 ? 1 : -1);
      if (s.alpha < 0.15) s.alpha = 0.15;
      if (s.alpha > 1) s.alpha = 1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.x += (Math.random() - 0.5) * 0.2;
      s.y += (Math.random() - 0.5) * 0.2;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================
   Popup build & wiring
   ========================== */
function removeExistingUI() {
  ["verify-overlay", "verify-popup", "verify-temp-msg", "verify-starfield-canvas", "verify-verified-badge"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  const st = document.getElementById("verify-style");
  if (st) st.remove();
}

function showTemporaryMessage(msg, duration = 3000) {
  if (document.getElementById("verify-temp-msg")) return;
  const d = document.createElement("div");
  d.id = "verify-temp-msg";
  Object.assign(d.style, {
    position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "26px",
    background: "rgba(0,0,0,0.75)", color: "#fff", padding: "10px 14px", borderRadius: "10px",
    zIndex: 30000, fontWeight: 700
  });
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => { if (d.parentNode) d.remove(); }, duration);
}

function buildPopup() {
  removeExistingUI();
  injectStyles();
  // overlay
  const overlay = document.createElement("div");
  overlay.id = "verify-overlay";
  overlay.addEventListener("click", (e) => { e.stopPropagation(); }); // do not close on overlay click
  document.body.appendChild(overlay);

  // popup
  const pop = document.createElement("div");
  pop.id = "verify-popup";
  pop.innerHTML = `
    <div class="lang-tabs" id="verifyLangTabs">
      <div class="lang-tab active" data-lang="en">English</div>
      <div class="lang-tab" data-lang="hi">हिंदी</div>
      <div class="lang-tab" data-lang="te">తెలుగు</div>
      <div class="lang-tab" data-lang="ta">தமிழ்</div>
    </div>

    <div class="verify-title" id="verifyTitle">Skip Ad once and Enjoy Unlimited Ad-Free Anime Streaming till 24h.</div>
    <div class="verify-desc" id="verifyDesc">Click on a button below, go to another site, follow steps there, and you'll be returned to this same page.</div>

    <div class="verify-buttons">
      ${SHOW_BTN1 === "on" ? `<div><button class="verify-btn" id="verifyBtn1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 1 (24h)</span></button><div class="verify-note">Use LinkShortify</div></div>` : `<div class="verify-note">⚠️ Skip Ads 1 - Unavailable</div>`}
      ${SHOW_BTN2 === "on" ? `<div><button class="verify-btn secondary" id="verifyBtn2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 2 (24h)</span></button><div class="verify-note">Use GPLinks</div></div>` : `<div class="verify-note">⚠️ Skip Ads 2 - Unavailable</div>`}
      ${SHOW_BTN3 === "on" ? `<div><button class="verify-btn tertiary" id="verifyBtn3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 3 (12h)</span></button><div class="verify-note">Use AroLinks</div></div>` : `<div class="verify-note">⚠️ Skip Ads 3 - Unavailable</div>`}
    </div>

    <div class="verify-warning">⚠️ If AdBlocker detected, please disable PrivateDNS in your device settings.</div>

    <div class="verify-progress"><div class="bar"></div></div>
  `;
  document.body.appendChild(pop);

  // starfield
  createStarfieldCanvas();

  // language wiring
  const langTabs = pop.querySelectorAll(".lang-tab");
  const texts = {
    en: {
      title: "Skip Ad once and Enjoy Unlimited Ad-Free Anime Streaming till 24h.",
      desc: "Click on a button below, go to another site, follow steps there, and you'll be returned to this same page."
    },
    hi: {
      title: "एक बार विज्ञापन छोड़ें और अगले 24 घंटे के लिए एड-फ्री एनीमे का आनंद लें।",
      desc: "नीचे दिए गए बटन पर क्लिक करें, दूसरी साइट पर जाएँ, वहां दिए निर्देशों का पालन करें और आप उसी पेज पर वापस आ जाएंगे।"
    },
    te: {
      title: "ఒకసారి ప్రకటనను స్కిప్ చేయండి మరియు తదుపరి 24 గంటల పాటు యాక్సెస్ పొందండి.",
      desc: "క్రింది బటన్‌పై క్లిక్ చేయండి, ఇతర సైట్‌కు వెళ్లి సూచనలను అనుసరించండి, మీరు అదే పేజీకి తిరిగి వస్తారు."
    },
    ta: {
      title: "ஒரு விளம்பரத்தைத் தவிர்த்து 24 மணிநேரம் விளம்பரமில்லா அனுபவத்தை அனுபவிக்கவும்.",
      desc: "கீழ் உள்ள பொத்தானில் கிளிக் செய்து மற்ற தளத்தில் வழிமுறைகளை பின்பற்றவும்; நீங்கள் மீண்டும் அதே பக்கத்திற்கு திரும்புவீர்கள்."
    }
  };
  langTabs.forEach(t => {
    t.addEventListener("click", () => {
      langTabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const lang = t.getAttribute("data-lang");
      const txt = texts[lang] || texts.en;
      const title = document.getElementById("verifyTitle");
      const desc = document.getElementById("verifyDesc");
      if (title) title.textContent = txt.title;
      if (desc) desc.textContent = txt.desc;
    });
  });

  // button wiring
  if (SHOW_BTN1 === "on") {
    const b1 = document.getElementById("verifyBtn1");
    if (b1) b1.addEventListener("click", () => handleButtonFlow({ durationMs: DUR_24H, shortenerOrder: ["linkshortify", "gplinks"] }));
  }
  if (SHOW_BTN2 === "on") {
    const b2 = document.getElementById("verifyBtn2");
    if (b2) b2.addEventListener("click", () => handleButtonFlow({ durationMs: DUR_24H, shortenerOrder: ["gplinks", "linkshortify"] }));
  }
  if (SHOW_BTN3 === "on") {
    const b3 = document.getElementById("verifyBtn3");
    if (b3) b3.addEventListener("click", () => handleButtonFlow({ durationMs: DUR_12H, shortenerOrder: ["arolinks", "gplinks", "linkshortify"] }));
  }
}

/* ==========================
   Flow: shorten & redirect
   ========================== */
async function handleButtonFlow({ durationMs, shortenerOrder }) {
  try {
    const token = genToken(12);
    localStorage.setItem(LS_TOKEN_KEY, token);

    const callbackBase = getUrlBaseWithoutVerify();
    const callbackUrl = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}verify=${encodeURIComponent(token)}&d=${durationMs === DUR_12H ? 12 : 24}`;

    // try shorteners in order
    let short = null;
    for (const s of shortenerOrder) {
      if (s === "linkshortify") short = await shortenWithLinkShortify(callbackUrl);
      else if (s === "gplinks") short = await shortenWithGPLinks(callbackUrl);
      else if (s === "arolinks") short = await shortenWithAroLinks(callbackUrl);
      if (short) break;
    }

    const finalUrl = short || callbackUrl;
    // prefer same-tab navigation (old flow)
    try { window.location.href = finalUrl; }
    catch (e) { try { window.open(finalUrl, "_blank"); } catch (e2) { showTemporaryMessage("Could not open link. Please allow popups."); } }
  } catch (err) {
    console.error("handleButtonFlow error:", err);
    showTemporaryMessage("An error occurred. Try again.");
  }
}

/* ==========================
   On load: check verify param or existing verification
   ========================== */
function showVerifiedBadge(untilMs) {
  if (document.getElementById("verify-verified-badge")) return;
  const b = document.createElement("div");
  b.id = "verify-verified-badge";
  Object.assign(b.style, {
    position: "fixed", right: "16px", top: "16px", zIndex: 30000,
    background: "linear-gradient(90deg,#22c55e22,#22c55e11)", padding: "10px 12px", borderRadius: "10px",
    color: "#e9fbe9", fontWeight: 700, boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
  });
  b.innerHTML = `✅ Verified — Ad-free for <span id="verify-remaining">${formatRemaining(untilMs - nowMs())}</span>`;
  document.body.appendChild(b);
}
function startExpiryTicker() {
  const id = setInterval(() => {
    const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    const el = document.getElementById("verify-remaining");
    if (el) el.textContent = formatRemaining(until - nowMs());
    if (!until || nowMs() > until) {
      clearInterval(id);
      localStorage.removeItem(LS_VERIFIED_UNTIL);
      const badge = document.getElementById("verify-verified-badge");
      if (badge) badge.remove();
      // show popup again
      buildPopup();
    }
  }, 30 * 1000);
}

function hidePopupAndCleanup() {
  removeExistingUI();
}

/* main check function */
function checkAndHandleVerificationOnLoad() {
  try {
    // If already verified and not expired: hide popup
    const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    if (until && nowMs() < until) {
      hidePopupAndCleanup();
      showVerifiedBadge(until);
      startExpiryTicker();
      return;
    }

    // If URL contains verify param, validate token
    const params = new URLSearchParams(window.location.search);
    const v = params.get("verify");
    const d = params.get("d");
    const storedToken = localStorage.getItem(LS_TOKEN_KEY);

    if (v && storedToken && v === storedToken) {
      const duration = (d === "12") ? DUR_12H : DUR_24H;
      const untilNew = nowMs() + duration;
      localStorage.setItem(LS_VERIFIED_UNTIL, String(untilNew));
      // cleanup URL (remove params)
      try {
        const base = getUrlBaseWithoutVerify();
        history.replaceState(null, "", base);
      } catch (e) { /* ignore */ }
      hidePopupAndCleanup();
      showVerifiedBadge(untilNew);
      startExpiryTicker();
      return;
    }

    // else show popup immediately (old behavior: popup on every post)
    buildPopup();
  } catch (err) {
    console.error("verification check error:", err);
    buildPopup();
  }
}

/* ==========================
   Init on DOM ready
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  try {
    // create background starfield immediately
    createStarfieldCanvas();
    // small delay to allow CSS to load before rendering popup
    setTimeout(() => { checkAndHandleVerificationOnLoad(); }, 120);
  } catch (e) {
    console.error("verify init error:", e);
    // fallback: attempt to show popup
    try { checkAndHandleVerificationOnLoad(); } catch (e2) { console.error(e2); }
  }
});
