/* ========== CONFIG ========== */
const SHOW_BTN1 = "on"; // LinkShortify (24h)
const SHOW_BTN2 = "on"; // GPLinks    (24h)
const SHOW_BTN3 = "on"; // AroLinks   (12h)

const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
const GPLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
const AROLINKS_API_URL = "https://arolinks.com/api?api=98b5522d34aba1ef83a9197dd406ecfbfc6f8629&url=";

const HOUR = 60 * 60 * 1000;
const DUR_24H = 24 * HOUR;
const DUR_12H = 12 * HOUR;

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

/* ========== POPUP UI ========== */
function initVerificationUI() {
  if (document.getElementById("verification-popup")) return;

  const popup = document.createElement("div");
  popup.id = "verification-popup";
  popup.style = `
    position:fixed; inset:0; display:flex; justify-content:center; align-items:center;
    background: rgba(0,0,0,0.8); z-index:9999; font-family:sans-serif;
  `;
  popup.innerHTML = `
    <div style="background:#1e1e1e; padding:20px; border-radius:12px; width:320px; text-align:center; color:#fff;">
      <h2>🔐 Verification Required</h2>
      <p>Skip Ad once and enjoy Ad-Free Anime Streaming.</p>
      <div style="margin:12px 0;" id="buttons-wrap">
        ${SHOW_BTN1==="on"?'<button id="btn1">Skip Ads 1 (24h)</button>':'<p>Button1 unavailable</p>'}
        ${SHOW_BTN2==="on"?'<button id="btn2">Skip Ads 2 (24h)</button>':'<p>Button2 unavailable</p>'}
        ${SHOW_BTN3==="on"?'<button id="btn3">Skip Ads 3 (12h)</button>':'<p>Button3 unavailable</p>'}
      </div>
      <p style="margin-top:10px; font-size:12px;">© AnimeDekho</p>
    </div>
  `;
  document.body.appendChild(popup);

  // Button actions
  const btn1 = document.getElementById("btn1");
  if(btn1) btn1.onclick = ()=>handleButton(LINKSHORTIFY_API_TOKEN, DUR_24H, popup);

  const btn2 = document.getElementById("btn2");
  if(btn2) btn2.onclick = ()=>handleButton(GPLINKS_API_TOKEN, DUR_24H, popup);

  const btn3 = document.getElementById("btn3");
  if(btn3) btn3.onclick = ()=>handleButton(AROLINKS_API_URL, DUR_12H, popup);
}

/* ========== VERIFICATION LOGIC ========== */
function checkVerifiedOnLoad() {
  const verifiedUntil = localStorage.getItem(LS_VERIFIED_UNTIL);
  const token = localStorage.getItem(LS_TOKEN_KEY);

  if(token && verifiedUntil && now() < parseInt(verifiedUntil)){
    const remaining = parseInt(verifiedUntil) - now();
    console.log(`✅ User already verified. Time left: ${formatRemaining(remaining)}`);
    if(remaining <= HOUR && !localStorage.getItem(LS_ONE_HOUR_SHOWN)){
      alert(`⏳ Only 1 hour left on verification.`);
      localStorage.setItem(LS_ONE_HOUR_SHOWN,"true");
    }
    return;
  }

  // Show verification UI
  initVerificationUI();
}

/* ========== BUTTON HANDLER ========== */
function handleButton(api, duration, popup) {
  const token = generateToken();
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_VERIFIED_UNTIL, now() + duration);
  alert(`✅ Verification complete! Enjoy Ad-Free streaming for ${duration/HOUR}h.`);
  if(popup) popup.remove();
}

/* ========== INIT ========== */
checkVerifiedOnLoad();
