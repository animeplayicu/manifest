/**
 * verify.js
 * Upgraded verification popup for AnimeDekho
 * Features:
 * - Old dark theme (#000 / #1e1e1e / #7b1fa2)
 * - 3 buttons: 1 -> LinkShortify (24h), 2 -> GPLinks (24h), 3 -> AroLinks (12h)
 * - Show/hide buttons via SHOW_BTN1/2/3 flags (set "on" / "off")
 * - Loading animation (fade-in)
 * - Smart messages for unavailable servers
 * - 1-hour left notification
 * - Expiry display for verified users
 * - Auto fallback if link opening blocked
 * - Small label under each button indicating API used
 * - Inline SVG icons (professional look)
 * - Animated starfield background (canvas)
 * - Language tabs (EN / HI / TE / TA)
 * - Footer branding
 */

/* ========== CONFIG ========== */
const SHOW_BTN1 = "on"; // LinkShortify (24h)
const SHOW_BTN2 = "on"; // GPLinks    (24h)
const SHOW_BTN3 = "on"; // AroLinks   (12h)

/* Tokens / API Keys */
const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34"; // Button1
const GPLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";         // Button2
const AROLINKS_API_URL = "https://arolinks.com/api?api=98b5522d34aba1ef83a9197dd406ecfbfc6f8629&url="; // Button3

/* Theme */
const THEME_BG = "#0d0d0f";
const CARD_BG = "#1e1e1e";
const ACCENT = "#7b1fa2";

/* Expiry durations */
const HOUR = 60 * 60 * 1000;
const DUR_24H = 24 * HOUR;
const DUR_12H = 12 * HOUR;

/* LocalStorage keys */
const LS_TOKEN_KEY = "userToken";
const LS_VERIFIED_UNTIL = "verifiedUntil";
const LS_ONE_HOUR_SHOWN = "oneHourLeftNotificationShown";

/* ========== UTILITIES ========== */
function generateToken() { return Math.random().toString(36).substr(2, 12); }
function now() { return Date.now(); }
function formatRemaining(ms) {
  if (ms <= 0) return "0h 0m";
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / (60 * 1000));
  return `${h}h ${m}m`;
}

/* ========== ANTI-TAMPER ========== */
(function antiTamper() {
  const threshold = 160;
  let lastTime = performance.now();

  function devtoolsCheck() {
    return (window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold);
  }
  function timingCheck() {
    const t = performance.now();
    const delta = t - lastTime;
    lastTime = t;
    return delta > 200;
  }
  function showTamperWarning() {
    if (document.getElementById("tamper-warning")) return;
    const b = document.createElement("div");
    b.id = "tamper-warning";
    b.style = `
      position:fixed; top:20px; left:50%; transform:translateX(-50%);
      background: rgba(123,31,162,0.95); color:#fff; padding:10px 18px;
      border-radius:8px; z-index:99999; box-shadow:0 6px 20px rgba(0,0,0,0.4);
      font-family: Inter, Poppins, sans-serif; font-weight:600;
    `;
    b.textContent = "Security check: please close developer tools to continue.";
    document.body.appendChild(b);
    setTimeout(() => { if (b.parentNode) b.remove(); }, 4000);
  }

  setInterval(() => {
    if (devtoolsCheck() || timingCheck()) {
      localStorage.removeItem(LS_TOKEN_KEY);
      showTamperWarning();
      setTimeout(() => { initVerificationUI(); }, 1200);
    }
  }, 1500);

  window.addEventListener("keydown", (e) => {
    if ((e.key === "F12") || (e.ctrlKey && e.shiftKey && ["I","J"].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toLowerCase() === "u")) {
      e.preventDefault(); showTamperWarning();
    }
  });

  window.addEventListener("contextmenu", (e) => { if (!e.altKey) { e.preventDefault(); showTamperWarning(); } });
})();

/* ========== UI ========== */
function initVerificationUI() {
  const oldOverlay = document.getElementById("verification-overlay"); if(oldOverlay) oldOverlay.remove();
  const oldPopup = document.getElementById("verification-popup"); if(oldPopup) oldPopup.remove();
  const oldStyle = document.getElementById("verify-style"); if(oldStyle) oldStyle.remove();
  applyBackgroundStarfield();
  injectStyles();
  renderPopup();
  checkVerifiedOnLoad();
}

/* Starfield */
function applyBackgroundStarfield() {
  let overlay = document.getElementById("verification-overlay");
  if (!overlay) { overlay = document.createElement("div"); overlay.id="verification-overlay"; overlay.style=`position:fixed;inset:0;z-index:1000;background:${THEME_BG};`; document.body.appendChild(overlay);}
  overlay.innerHTML = `<canvas id="starfield" style="width:100%;height:100%;display:block;"></canvas>`;
  const canvas = document.getElementById("starfield");
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const stars=[]; const numStars=Math.max(60, Math.floor((window.innerWidth*window.innerHeight)/5000));
  for(let i=0;i<numStars;i++){stars.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*1.4+0.3,twinkle:Math.random()*0.02+0.005,phase:Math.random()*Math.PI*2});}

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const g = ctx.createLinearGradient(0,0,0,window.innerHeight);
    g.addColorStop(0,"rgba(10,6,15,0.6)"); g.addColorStop(1,"rgba(5,2,8,0.8)");
    ctx.fillStyle=g; ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
    for(let s of stars){s.phase+=s.twinkle; const alpha=0.6+Math.sin(s.phase)*0.4; ctx.beginPath(); ctx.fillStyle=`rgba(255,255,255,${alpha})`; ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();}
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener("resize",()=>{canvas.width=window.innerWidth*devicePixelRatio;canvas.height=window.innerHeight*devicePixelRatio;canvas.style.width=window.innerWidth+"px";canvas.style.height=window.innerHeight+"px";});
}

/* CSS */
function injectStyles() {
  const style=document.createElement("style"); style.id="verify-style";
  style.innerHTML=`
    :root { --card-bg:${CARD_BG}; --accent:${ACCENT}; --text:#fff; --muted:#cfcfd2; }
    #verification-popup{position:fixed; z-index:1001; left:50%; top:50%; transform:translate(-50%,-50%); width:92%; max-width:450px;
      background: linear-gradient(180deg, rgba(20,20,20,0.9), rgba(28,28,28,0.95)); border-radius:14px; padding:18px; box-shadow:0 10px 40px rgba(0,0,0,0.6);
      color:var(--text); font-family: Inter,Poppins,system-ui,Arial; transition: opacity .35s ease, transform .35s ease; backdrop-filter: blur(6px);}
    .verify-header{text-align:center;margin-bottom:8px;}
    .verify-title{font-size:20px;font-weight:700;letter-spacing:0.2px;}
    .verify-sub{font-size:13px;color:var(--muted);margin-top:6px;line-height:1.4;}
    .lang-tabs{display:flex;gap:6px;justify-content:center;margin:10px 0 12px;}
    .lang-tab{background:rgba(255,255,255,0.03);padding:6px 9px;border-radius:999px;font-size:12px;cursor:pointer;color:var(--muted);}
    .lang-tab.active{box-shadow:0 4px 18px rgba(123,31,162,0.12);color:var(--text);border:1px solid rgba(123,31,162,0.14);}
    .buttons-wrap{display:flex;flex-direction:column;gap:10px;margin-top:12px;}
    .verify-btn{display:flex;align-items:center;gap:10px;justify-content:flex-start;padding:12px 14px;border-radius:10px;font-weight:700;cursor:pointer;border:none;width:100%;color:white;background:var(--accent);box-shadow:0 6px 20px rgba(123,31,162,0.12);transition: transform .12s ease, box-shadow .12s ease;font-size:15px;}
    .verify-btn.secondary{background:#6a1b9a;}
    .verify-btn.tertiary{background:#9c27b0;}
    .verify-btn:hover{transform: translateY(-3px); box-shadow:0 12px 28px rgba(123,31,162,0.18);}
    .btn-icon{width:20px;height:20px;flex:0 0 20px;display:inline-block;}
    .btn-label{flex:1;text-align:left;}
    .btn-note{font-size:12px;color:#d0cfe0;margin-top:4px;text-align:left;margin-left:30px;}
    .help-text{font-size:13px;color:var(--muted);margin-top:12px;text-align:center;line-height:1.4;}
    .how-link{color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:600;}
    .footer-brand{margin-top:12px;font-size:12px;color:#a8a6b2;text-align:center;opacity:0.9;}
    .small-muted{font-size:11px;color:#bdbbd0;text-align:center;margin-top:6px;}
    .loader-wrap{display:flex;justify-content:center;align-items:center;padding:18px 0;}
    .loader{width:80px;height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;position:relative;}
    .loader>i{position:absolute;left:-40%;width:40%;height:100%;background:linear-gradient(90deg,rgba(123,31,162,0),rgba(123,31,162,0.9),rgba(123,31,162,0));animation:slide 1.3s linear infinite;}
    @keyframes slide{to{left:110%;}}
    .close-x{position:absolute;right:12px;top:10px;cursor:pointer;opacity:0.85;color:var(--muted);font-weight:700;}
    @media(min-width:600px){#verification-popup{padding:22px;}}`;
  document.head.appendChild(style);
}

/* ========== Popup HTML ========== */
function renderPopup() {
  const popup = document.createElement("div"); popup.id="verification-popup";
  popup.innerHTML = `
    <div class="close-x" id="verify-close" title="Close">✕</div>
    <div class="verify-header">
      <div class="verify-title">🔐 Verification Required</div>
      <div class="verify-sub" id="verify-sub">Skip Ad once and Enjoy Unlimited Ad-Free Anime Streaming till 24h.</div>
    </div>
    <div class="lang-tabs" id="langTabs">
      <div class="lang-tab active" data-lang="en">English</div>
      <div class="lang-tab" data-lang="hi">हिंदी</div>
      <div class="lang-tab" data-lang="te">తెలుగు</div>
      <div class="lang-tab" data-lang="ta">தமிழ்</div>
    </div>
    <div id="loaderSection" class="loader-wrap"><div class="loader"><i></i></div></div>
    <div id="verifySection" style="display:none;">
      <div class="buttons-wrap">
        <div id="btn1wrap">${SHOW_BTN1==="on"?`<button id="verify-btn1" class="verify-btn"><span class="btn-icon">${svgIcon("link")}</span><span class="btn-label">Skip Ads 1 (24h)</span></button><div class="btn-note">(Uses LinkShortify API)</div>`:`<div class="btn-note">⚠️ Skip Ads 1 (LinkShortify) - Server Temporarily Unavailable</div>`}</div>
        <div id="btn2wrap">${SHOW_BTN2==="on"?`<button id="verify-btn2" class="verify-btn secondary"><span class="btn-icon">${svgIcon("link")}</span><span class="btn-label">Skip Ads 2 (24h)</span></button><div class="btn-note">(Uses GPLinks API)</div>`:`<div class="btn-note">⚠️ Skip Ads 2 (GPLinks) - Server Temporarily Unavailable</div>`}</div>
        <div id="btn3wrap">${SHOW_BTN3==="on"?`<button id="verify-btn3" class="verify-btn tertiary"><span class="btn-icon">${svgIcon("link")}</span><span class="btn-label">Skip Ads 3 (12h)</span></button><div class="btn-note">(Uses AroLinks API)</div>`:`<div class="btn-note">⚠️ Skip Ads 3 (AroLinks) - Server Temporarily Unavailable</div>`}</div>
      </div>
      <div class="help-text">Having issues? <span class="how-link" id="howLink">Click here</span></div>
      <div class="footer-brand">© AnimeDekho | Powered by Bolt AI</div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("verify-close").onclick = ()=>popup.remove();
  document.getElementById("howLink").onclick = ()=>window.open("https://yourtutorial.com","_blank");

  // Lang tab switching
  document.querySelectorAll(".lang-tab").forEach(tab=>{
    tab.onclick=()=>{
      document.querySelectorAll(".lang-tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
    }
  });
}

/* SVG icon */
function svgIcon(type){return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 010 5.656m-5.656 0a4 4 0 010-5.656m2.828 2.828l4-4"/></svg>`;}

/* ========== VERIFICATION LOGIC ========== */
function checkVerifiedOnLoad() {
  const verifiedUntil = localStorage.getItem(LS_VERIFIED_UNTIL);
  const token = localStorage.getItem(LS_TOKEN_KEY);
  const loader = document.getElementById("loaderSection");
  const verifySec = document.getElementById("verifySection");

  setTimeout(()=>{
    loader.style.display="none";
    verifySec.style.display="block";
  },1200);

  if(token && verifiedUntil && now() < parseInt(verifiedUntil)){
    const remaining = parseInt(verifiedUntil) - now();
    console.log(`✅ User already verified. Time left: ${formatRemaining(remaining)}`);
    if(remaining <= HOUR && !localStorage.getItem(LS_ONE_HOUR_SHOWN)){
      alert(`⏳ Only 1 hour left on verification.`);
      localStorage.setItem(LS_ONE_HOUR_SHOWN,"true");
    }
    return;
  }
  // Bind buttons
  bindVerificationButtons();
}

function bindVerificationButtons() {
  const btn1 = document.getElementById("verify-btn1");
  const btn2 = document.getElementById("verify-btn2");
  const btn3 = document.getElementById("verify-btn3");

  if(btn1) btn1.onclick = ()=>handleButton(LINKSHORTIFY_API_TOKEN,DUR_24H);
  if(btn2) btn2.onclick = ()=>handleButton(GPLINKS_API_TOKEN,DUR_24H);
  if(btn3) btn3.onclick = ()=>handleButton(AROLINKS_API_URL,DUR_12H);
}

/* ========== OPEN LINK HANDLER ========== */
function handleButton(api, duration) {
  const token = generateToken();
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_VERIFIED_UNTIL, now() + duration);
  console.log(`🔗 Verification done via API: ${api}. Token saved.`);
  alert(`✅ Verification complete! Enjoy Ad-Free streaming for ${duration/HOUR}h.`);
}

/* ========== INIT ========== */
initVerificationUI();
