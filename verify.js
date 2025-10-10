/**
 * verify.js - Final AnimeDekho verification popup
 *
 * IMPORTANT:
 *  - Upload this file to: https://raw.githubusercontent.com/<your-repo>/manifest/main/verify.js
 *  - Replace placeholders below if you want different API tokens or a custom callback base.
 *
 * FEATURES:
 *  - 3 buttons: LinkShortify (24h), GPLinks (24h), AroLinks (12h)
 *  - SHOW_BTN1/2/3 toggles ("on"/"off")
 *  - Uses LinkShortify, GPLinks, AroLinks (AroLinks token integrated)
 *  - Preserves same-page redirect after verification (?verify=token&d=12|24)
 *  - Starfield + floating popup animation (from your provided code)
 *  - Language switch (en, hi, te, ta)
 *  - No close button; overlay click disabled
 *  - Basic anti-tamper deterrents (devtools detection + console override)
 *
 * SECURITY NOTE:
 *  Client-side checks are deterrents only. If you need true unforgeable protection,
 *  implement server-side verification (JWT / HttpOnly cookie) later.
 */

/* ==========================
   CONFIG - Edit here only
   ========================== */
/* Toggle button visibility: "on" or "off" */
const SHOW_BTN1 = "on"; // LinkShortify (24h)
const SHOW_BTN2 = "on"; // GPLinks    (24h)
const SHOW_BTN3 = "on"; // AroLinks    (12h)

/* API tokens (these are used client-side; visible to users).
   For stronger security move these calls server-side. */
const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34"; // LinkShortify
const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";       // GPLinks
const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";       // AroLinks (provided)

/* If you want the external shortener to redirect back to the same page automatically,
   we build a callback URL pointing to the current page (base). No change needed normally. */

/* LocalStorage keys */
const LS_TOKEN_KEY = "anime_verify_token";
const LS_VERIFIED_UNTIL = "anime_verified_until";

/* Durations */
const HOUR = 60 * 60 * 1000;
const D24 = 24 * HOUR;
const D12 = 12 * HOUR;

/* Visual/theme tweaks (kept from your design) */
const THEME_ACCENT = "#7b1fa2";

/* ==========================
   Utility helpers
   ========================== */
function nowMs() { return Date.now(); }
function genToken(len = 12) { return Math.random().toString(36).slice(2, 2 + len); }
function formatRemaining(ms) {
  if (ms <= 0) return "0h 0m";
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / 60000);
  return `${h}h ${m}m`;
}
function safeJSONParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

/* ==========================
   Anti-tamper deterrents (basic)
   ========================== */
(function antiTamperInit(){
  // Simple console lock - prevents verbose output. Keeps a hidden copy.
  try {
    console.__orig_log = console.log.bind(console);
    console.log = function(){ /* blocked */ };
  } catch(e){}

  // Block common inspect keys
  window.addEventListener("keydown", (e) => {
    if (e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === "u")) {
      e.preventDefault();
      showTemporaryMessage("This action is disabled for security.");
    }
  });

  // Right-click disable (soft; Alt+RightClick still allowed)
  window.addEventListener("contextmenu", (e) => {
    if (!e.altKey) {
      e.preventDefault();
      showTemporaryMessage("Right-click is disabled.");
    }
  });

  // Devtools open detection (simple)
  let last = performance.now();
  setInterval(() => {
    const d = performance.now() - last;
    last = performance.now();
    // if there is a long delay (possible breakpoint) or viewport change (devtools)
    const devtoolsOpen = (window.outerWidth - window.innerWidth > 160) || (window.outerHeight - window.innerHeight > 160);
    if (devtoolsOpen || d > 300) {
      // clear sensitive local tokens to make bypass harder
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_VERIFIED_UNTIL);
      showTemporaryMessage("Security check: close developer tools to continue.");
      // reinitialize UI to reapply popup
      setTimeout(() => { initVerificationUI(); }, 900);
    }
  }, 1500);
})();

/* ==========================
   UI: build popup & animation
   ========================== */
function initVerificationUI(){
  // cleanup existing elements if they exist
  const existingOverlay = document.getElementById("anime-verify-overlay");
  if (existingOverlay) existingOverlay.remove();
  const existingPopup = document.getElementById("anime-verify-popup");
  if (existingPopup) existingPopup.remove();
  const existingStyle = document.getElementById("anime-verify-style");
  if (existingStyle) existingStyle.remove();

  // inject styles (kept compact; based on your provided CSS)
  const style = document.createElement("style");
  style.id = "anime-verify-style";
  style.textContent = `
    /* minimal style - uses your theme */
    #anime-verify-overlay{position:fixed;inset:0;background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:9998}
    #anime-verify-popup{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;
      width:92%;max-width:500px;background:linear-gradient(135deg,rgba(26,0,31,.95),rgba(20,10,30,.95));
      border-radius:24px;padding:30px;border:1px solid rgba(123,31,162,.4);box-shadow:0 25px 80px rgba(0,0,0,.6);
      color:#fff;font-family:Poppins,Inter,system-ui,Arial;animation:float 6s ease-in-out infinite;}
    @keyframes float{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 15px))}}
    .anime-lang-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:18px;flex-wrap:wrap}
    .anime-lang-tab{padding:8px 14px;background:rgba(123,31,162,.1);border-radius:20px;border:1px solid rgba(123,31,162,.25);color:#bdb9c9;cursor:pointer;font-weight:600}
    .anime-lang-tab.active{background:rgba(123,31,162,.32);color:#fff;box-shadow:0 0 18px rgba(123,31,162,.22)}
    .anime-title{text-align:center;font-size:18px;font-weight:700;margin-bottom:8px}
    .anime-desc{text-align:center;color:#cfcbd6;font-size:14px;margin-bottom:18px;line-height:1.5}
    .anime-buttons{display:flex;flex-direction:column;gap:12px;margin-bottom:14px}
    .anime-btn{display:flex;align-items:center;gap:10px;padding:14px;border-radius:12px;border:none;cursor:pointer;font-weight:700;font-size:15px;background:linear-gradient(135deg,rgba(123,31,162,.85),rgba(156,39,176,.85));color:#fff;box-shadow:0 6px 20px rgba(123,31,162,.18)}
    .anime-btn.secondary{background:linear-gradient(135deg,rgba(106,27,154,.85),rgba(142,36,170,.85))}
    .anime-btn.tertiary{background:linear-gradient(135deg,rgba(74,20,140,.85),rgba(106,27,154,.85))}
    .anime-note{font-size:12px;color:#d7d3df;margin-left:8px;margin-top:6px}
    .anime-warning{background:rgba(255,152,0,.1);padding:12px;border-radius:10px;color:#ffb74d;margin-top:10px;text-align:center}
    .anime-progress{height:4px;background:rgba(123,31,162,.18);border-radius:4px;overflow:hidden;margin-top:12px}
    .anime-progress .bar{height:100%;background:linear-gradient(90deg,#7b1fa2,#9c27b0,#ba68c8);background-size:200% 100%;animation:flow 3s linear infinite}
    @keyframes flow{0%{background-position:0 0}100%{background-position:200% 0}}
    /* small responsive */
    @media(max-width:480px){#anime-verify-popup{padding:22px}}
  `;
  document.head.appendChild(style);

  // overlay and popup container
  const overlay = document.createElement("div");
  overlay.id = "anime-verify-overlay";
  // disable overlay click to close (we keep it blocking)
  overlay.addEventListener("click", (e) => { e.stopPropagation(); /* do nothing */ });
  document.body.appendChild(overlay);

  const popup = document.createElement("div");
  popup.id = "anime-verify-popup";
  popup.innerHTML = `
    <div class="anime-lang-tabs" id="animeLangTabs">
      <div class="anime-lang-tab active" data-lang="en">English</div>
      <div class="anime-lang-tab" data-lang="hi">हिंदी</div>
      <div class="anime-lang-tab" data-lang="te">తెలుగు</div>
      <div class="anime-lang-tab" data-lang="ta">தமிழ்</div>
    </div>

    <div class="anime-title" id="animeTitle">Skip Ads once and Enjoy Unlimited Anime Free Watch/Download for 24h.</div>
    <div class="anime-desc" id="animeDesc">Click on the button below, go to another site, follow steps shown there, and you'll be redirected back to the same page.</div>

    <div class="anime-buttons">
      ${SHOW_BTN1 === "on" ? `<div>
        <button class="anime-btn" id="animeBtn1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Skip Ads 1 (24h)</span>
        </button>
        <div class="anime-note">Use LinkShortify</div>
      </div>` : `<div class="anime-note">⚠️ Skip Ads 1 (LinkShortify) - Unavailable</div>`}

      ${SHOW_BTN2 === "on" ? `<div>
        <button class="anime-btn secondary" id="animeBtn2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Skip Ads 2 (24h)</span>
        </button>
        <div class="anime-note">Use GPLinks</div>
      </div>` : `<div class="anime-note">⚠️ Skip Ads 2 (GPLinks) - Unavailable</div>`}

      ${SHOW_BTN3 === "on" ? `<div>
        <button class="anime-btn tertiary" id="animeBtn3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Skip Ads 3 (12h)</span>
        </button>
        <div class="anime-note">Use AroLinks</div>
      </div>` : `<div class="anime-note">⚠️ Skip Ads 3 (AroLinks) - Unavailable</div>`}
    </div>

    <div class="anime-warning">⚠️ If AdBlocker detected, please disable PrivateDNS in your device settings.</div>

    <div class="anime-progress"><div class="bar"></div></div>
  `;
  document.body.appendChild(popup);

  // language switching
  const langTabs = document.querySelectorAll(".anime-lang-tab");
  const texts = {
    en: {
      title: "Skip Ads once and Enjoy Unlimited Anime Free Watch/Download for 24h.",
      desc: "Click on the button below, go to another site, follow steps shown there, and you'll be redirected back to the same page."
    },
    hi: {
      title: "एक बार विज्ञापन छोड़ें और 24 घंटे तक फ्री एनीमे देखें/डाउनलोड करें।",
      desc: "नीचे दिए गए बटन पर क्लिक करें, दूसरी साइट पर जाएं, निर्देशों का पालन करें और आप उसी पेज पर वापस आ जाएंगे।"
    },
    te: {
      title: "ఒకసారి ప్రకటనను దాటండి మరియు 24 గంటల పాటు ఉచిత ఆనిమే చూడండి/డౌన్లోడ్ చేయండి.",
      desc: "క్రింది బటన్‌పై క్లిక్ చేసి, ఇతర సైట్‌కి వెళ్లి సూచనలు అనుసరించండి. మీరు తిరిగి అదే పేజీకి వస్తారు."
    },
    ta: {
      title: "ஒருமுறை விளம்பரத்தைத் தவிர்த்து 24 மணிநேரம் இலவசமாக அனிமே பார்க்கவும்/பதிவிறக்கவும்.",
      desc: "கீழே உள்ள பொத்தானை அழுத்தி, மற்ற தளத்தில் வழிமுறைகளை பின்பற்றி நீங்கள் மீண்டும் அதே பக்கத்திற்கு திரும்புவீர்கள்."
    }
  };
  langTabs.forEach(t => t.addEventListener("click", () => {
    langTabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    const lang = t.getAttribute("data-lang");
    const txt = texts[lang] || texts.en;
    document.getElementById("animeTitle").textContent = txt.title;
    document.getElementById("animeDesc").textContent = txt.desc;
  }));

  // wire button handlers (if present)
  if (SHOW_BTN1 === "on") document.getElementById("animeBtn1").addEventListener("click", onClickBtn1);
  if (SHOW_BTN2 === "on") document.getElementById("animeBtn2").addEventListener("click", onClickBtn2);
  if (SHOW_BTN3 === "on") document.getElementById("animeBtn3").addEventListener("click", onClickBtn3);

  // initial verify check (if already verified in localStorage hide popup)
  checkLocalVerificationOnLoad();
}

/* ==========================
   Shorteners: call APIs and return final short URL (string)
   - LinkShortify API (returns JSON)
   - GPLinks API (returns JSON)
   - AroLinks API (can return text; we request &format=text)
   ========================== */

/* Note: client-side tokens are visible. For best security, do these calls on server. */
async function shortenWithLinkShortify(callbackUrl) {
  // Example endpoint (linkshortify)
  // https://linkshortify.com/api?api=TOKEN&url=ENCODED&alias=ALIAS
  try {
    const alias = genToken(6);
    const api = `https://linkshortify.com/api?api=${encodeURIComponent(LINKSHORTIFY_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    const res = await fetch(api, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("LinkShortify failed");
    const text = await res.text();
    if (!text) throw new Error("LinkShortify empty");
    return text.trim();
  } catch (e) { console.warn("LinkShortify error:", e); return null; }
}

async function shortenWithGPLinks(callbackUrl) {
  try {
    const alias = genToken(6);
    const api = `https://api.gplinks.com/api?api=${encodeURIComponent(GPLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}`;
    const res = await fetch(api, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("GPLinks failed");
    const data = await res.json();
    if (data && data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
    throw new Error("GPLinks response error");
  } catch (e) { console.warn("GPLinks error:", e); return null; }
}

async function shortenWithAroLinks(callbackUrl) {
  try {
    const alias = genToken(6);
    // AroLinks supports &format=text for plain text
    const api = `https://arolinks.com/api?api=${encodeURIComponent(AROLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    const res = await fetch(api, { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("AroLinks failed");
    const text = await res.text();
    if (!text) throw new Error("AroLinks empty");
    return text.trim();
  } catch (e) { console.warn("AroLinks error:", e); return null; }
}

/* ==========================
   Button click handlers - build callback -> shorten -> redirect
   Behavior:
   1) create a one-time token (stored locally)
   2) build callback URL: current page base + ?verify=TOKEN&d=24|12
   3) call shortener(s) and open shortened URL
   4) if redirect back to same page with ?verify=TOKEN, mark verified
   ========================== */

function getBasePageUrl() {
  // keep original pathname+hash but strip any verify params
  const u = new URL(window.location.href);
  // remove verify search param if present
  u.searchParams.delete("verify");
  u.searchParams.delete("d");
  return u.toString();
}

async function onClickBtn1(e) {
  e.preventDefault();
  await handleButtonFlow({ durationMs: D24, shortenerOrder: ["linkshortify","gplinks"] });
}

async function onClickBtn2(e) {
  e.preventDefault();
  await handleButtonFlow({ durationMs: D24, shortenerOrder: ["gplinks","linkshortify"] });
}

async function onClickBtn3(e) {
  e.preventDefault();
  await handleButtonFlow({ durationMs: D12, shortenerOrder: ["arolinks","gplinks","linkshortify"] });
}

async function handleButtonFlow({ durationMs, shortenerOrder }) {
  // 1) create token & store
  const token = genToken(10);
  localStorage.setItem(LS_TOKEN_KEY, token);

  // 2) build callback - ensure user returns to the same page
  const callbackBase = getBasePageUrl();
  const callbackUrl = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}verify=${encodeURIComponent(token)}&d=${durationMs === D12 ? 12 : 24}`;

  // 3) try shorteners in order
  let shortLink = null;
  for (const s of shortenerOrder) {
    if (s === "linkshortify") {
      shortLink = await shortenWithLinkShortify(callbackUrl);
    } else if (s === "gplinks") {
      shortLink = await shortenWithGPLinks(callbackUrl);
    } else if (s === "arolinks") {
      shortLink = await shortenWithAroLinks(callbackUrl);
    }
    if (shortLink) break;
  }

  // 4) if no short link available, fallback to callbackUrl (direct)
  const finalUrl = shortLink || callbackUrl;

  // 5) Attempt navigate (same-tab navigation preferred - matches old flow)
  try {
    window.location.href = finalUrl;
    // give navigation time; if it fails (popup blockers) fallback attempts could be added
  } catch (e) {
    // as fallback try open in new tab/window
    try { window.open(finalUrl, "_blank"); } catch (e2) { showTemporaryMessage("Could not open link. Please allow popups."); }
  }
}

/* ==========================
   On page load: detect ?verify=token&d=... and validate
   ========================== */
function checkLocalVerificationOnLoad() {
  // If already verified (expiry not passed) -> hide popup / do nothing
  const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
  if (until && nowMs() < until) {
    // Verified - hide popup
    hideVerificationUI();
    showVerifiedBadge(until);
    startExpiryTicker();
    return;
  }

  // If the URL contains verify param, validate it against stored token
  const params = new URLSearchParams(window.location.search);
  const v = params.get("verify");
  const d = params.get("d");
  const storedToken = localStorage.getItem(LS_TOKEN_KEY);

  if (v && storedToken && v === storedToken) {
    // mark verified
    const duration = (d === "12") ? D12 : D24;
    localStorage.setItem(LS_VERIFIED_UNTIL, String(nowMs() + duration));
    // cleanup URL (remove verify params)
    const newUrl = getBasePageUrl();
    try { history.replaceState(null, "", newUrl); } catch (e) {}
    hideVerificationUI();
    showVerifiedBadge(nowMs() + duration);
    startExpiryTicker();
    return;
  }

  // Else show popup (init UI)
  initVerificationUI();
}

/* ==========================
   UI helper functions
   ========================== */
function hideVerificationUI() {
  const overlay = document.getElementById("anime-verify-overlay");
  if (overlay) overlay.remove();
  const popup = document.getElementById("anime-verify-popup");
  if (popup) popup.remove();
}

function showTemporaryMessage(msg, duration = 3000) {
  if (document.getElementById("anime-temp-msg")) return;
  const d = document.createElement("div");
  d.id = "anime-temp-msg";
  d.style = `position:fixed;left:50%;transform:translateX(-50%);bottom:26px;background:rgba(0,0,0,.75);color:#fff;padding:10px 14px;border-radius:10px;z-index:20000;font-weight:700;`;
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => { if (d.parentNode) d.remove(); }, duration);
}

function showVerifiedBadge(untilMs) {
  if (document.getElementById("anime-verified-badge")) return;
  const b = document.createElement("div");
  b.id = "anime-verified-badge";
  b.style = `position:fixed;right:18px;top:18px;background:linear-gradient(90deg,#22c55e22,#22c55e11);padding:10px 12px;border-radius:10px;color:#e9fbe9;font-weight:700;z-index:20000;box-shadow:0 8px 30px rgba(0,0,0,0.3);`;
  const rem = formatRemaining(untilMs - nowMs());
  b.innerHTML = `✅ Verified — Ad-free for <span id="anime-verified-remaining">${rem}</span>`;
  document.body.appendChild(b);
}

function startExpiryTicker() {
  const id = setInterval(() => {
    const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    const el = document.getElementById("anime-verified-remaining");
    if (el) el.textContent = formatRemaining(until - nowMs());
    if (!until || nowMs() > until) {
      clearInterval(id);
      localStorage.removeItem(LS_VERIFIED_UNTIL);
      const b = document.getElementById("anime-verified-badge");
      if (b) b.remove();
      // show popup again
      initVerificationUI();
    }
  }, 1000 * 30);
}

/* ==========================
   Initialize starfield animation (lightweight) and trigger flow
   ========================== */
(function startStarfield(){
  // create canvas like your provided animation (keeps lightweight)
  const canvas = document.createElement("canvas");
  canvas.id = "anime-starfield-canvas";
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "1000";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); window.addEventListener("resize", resize);
  const stars = [];
  const count = Math.max(80, Math.floor((window.innerWidth * window.innerHeight)/8000));
  for (let i=0;i<count;i++){
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.6+0.3,
      alpha: Math.random()*0.8+0.2,
      d: Math.random()*0.03+0.005
    });
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // gentle background overlay (keeps original theme)
    ctx.fillStyle = "rgba(6,3,10,0.25)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for (let s of stars){
      s.alpha += s.d * (Math.random()>0.5?1:-1);
      if (s.alpha < 0.2) s.alpha = 0.2;
      if (s.alpha > 1) s.alpha = 1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
      // slight drift
      s.x += (Math.random()-0.5)*0.2;
      s.y += (Math.random()-0.5)*0.2;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ==========================
   Kick off verification check on load
   (this will show popup if not verified)
   ========================== */
try {
  checkLocalVerificationOnLoad();
} catch (e) {
  console.error("verify.js init error:", e);
}

/* ==========================
   End of file
   ========================== */
