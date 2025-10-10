/* verify.js - debugged & robust (replace your old file with this)
   - Waits for DOM ready
   - Shows popup on page load if not verified
   - Language switch working
   - No close button, overlay click disabled
   - Buttons: LinkShortify (24h), GPLinks (24h), AroLinks (12h)
   - Uses AroLinks token you provided
   - Adds console logs so you (or I) can see what's happening
   - For testing: add ?forcePopup=1 to URL to force popup
*/

/* ========== CONFIG ========== */
const SHOW_BTN1 = "on"; // LinkShortify (24h)
const SHOW_BTN2 = "on"; // GPLinks    (24h)
const SHOW_BTN3 = "on"; // AroLinks   (12h)

const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";

const LS_TOKEN_KEY = "anime_verify_token";
const LS_VERIFIED_UNTIL = "anime_verified_until";
const HOUR = 60 * 60 * 1000;
const D24 = 24 * HOUR;
const D12 = 12 * HOUR;

/* ========== HELPERS ========== */
function nowMs(){ return Date.now(); }
function genToken(len=10){ return Math.random().toString(36).slice(2,2+len); }
function formatRemaining(ms){
  if(ms<=0) return "0h 0m";
  const h = Math.floor(ms/HOUR);
  const m = Math.floor((ms % HOUR)/60000);
  return `${h}h ${m}m`;
}
function getParam(name){
  try{ return new URLSearchParams(window.location.search).get(name); }catch(e){ return null; }
}

/* ========== SIMPLE UI HELPERS ========== */
function showTemporaryMessage(msg, t=3000){
  try{
    if(document.getElementById("anime-temp-msg")) return;
    const d = document.createElement("div");
    d.id = "anime-temp-msg";
    Object.assign(d.style,{
      position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:'26px',
      background:'rgba(0,0,0,0.75)', color:'#fff', padding:'10px 14px',
      borderRadius:'10px', zIndex:30000, fontWeight:700
    });
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(()=>{ if(d.parentNode) d.remove(); }, t);
  }catch(e){ console.warn("msg err", e); }
}

/* ========== SHORTENER WRAPPERS ========== */
async function shortenWithLinkShortify(callbackUrl){
  try{
    const alias = genToken(6);
    const api = `https://linkshortify.com/api?api=${encodeURIComponent(LINKSHORTIFY_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    console.log("[verify] LinkShortify API:", api);
    const res = await fetch(api, { method:'GET', cache:'no-store' });
    if(!res.ok) throw new Error("LinkShortify bad response");
    const text = await res.text();
    return text ? text.trim() : null;
  }catch(e){ console.warn("[verify] LinkShortify error:", e); return null; }
}
async function shortenWithGPLinks(callbackUrl){
  try{
    const alias = genToken(6);
    const api = `https://api.gplinks.com/api?api=${encodeURIComponent(GPLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}`;
    console.log("[verify] GPLinks API:", api);
    const res = await fetch(api, { method:'GET', cache:'no-store' });
    if(!res.ok) throw new Error("GPLinks bad response");
    const j = await res.json();
    if(j && j.status==="success" && j.shortenedUrl) return j.shortenedUrl;
    return null;
  }catch(e){ console.warn("[verify] GPLinks error:", e); return null; }
}
async function shortenWithAroLinks(callbackUrl){
  try{
    const alias = genToken(6);
    const api = `https://arolinks.com/api?api=${encodeURIComponent(AROLINKS_API_TOKEN)}&url=${encodeURIComponent(callbackUrl)}&alias=${alias}&format=text`;
    console.log("[verify] AroLinks API:", api);
    const res = await fetch(api, { method:'GET', cache:'no-store' });
    if(!res.ok) throw new Error("AroLinks bad response");
    const text = await res.text();
    return text ? text.trim() : null;
  }catch(e){ console.warn("[verify] AroLinks error:", e); return null; }
}

/* ========== UI CONSTRUCTION (safe) ========== */
function removeExistingUI(){
  const ids = ["anime-verify-overlay","anime-verify-popup","anime-starfield-canvas","anime-verified-badge","anime-temp-msg"];
  ids.forEach(id=>{ const el = document.getElementById(id); if(el) el.remove(); });
  const style = document.getElementById("anime-verify-style"); if(style) style.remove();
}

function injectStyles(){
  if(document.getElementById("anime-verify-style")) return;
  const s = document.createElement("style"); s.id = "anime-verify-style";
  s.textContent = `
    #anime-verify-overlay{position:fixed;inset:0;background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:9998}
    #anime-verify-popup{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;width:92%;max-width:500px;background:linear-gradient(135deg,rgba(26,0,31,.95),rgba(20,10,30,.95));border-radius:24px;padding:30px;border:1px solid rgba(123,31,162,.4);box-shadow:0 25px 80px rgba(0,0,0,.6);color:#fff;font-family:Poppins,Inter,system-ui,Arial;animation:float 6s ease-in-out infinite}
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
    @media(max-width:480px){#anime-verify-popup{padding:22px}}
  `;
  document.head.appendChild(s);
}

function createStarfieldCanvas(){
  // remove old
  const old = document.getElementById("anime-starfield-canvas");
  if(old) old.remove();
  const canvas = document.createElement("canvas");
  canvas.id = "anime-starfield-canvas";
  Object.assign(canvas.style,{position:'fixed',left:'0',top:'0',width:'100%',height:'100%',zIndex:'1000',pointerEvents:'none'});
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const stars = [];
  const count = Math.max(80, Math.floor((window.innerWidth * window.innerHeight)/8000));
  for(let i=0;i<count;i++){
    stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.6+0.3,alpha:Math.random()*0.8+0.2,d:Math.random()*0.03+0.005});
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(6,3,10,0.25)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let s of stars){
      s.alpha += s.d * (Math.random()>0.5?1:-1);
      if(s.alpha < 0.15) s.alpha = 0.15;
      if(s.alpha > 1) s.alpha = 1;
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      s.x += (Math.random()-0.5)*0.2; s.y += (Math.random()-0.5)*0.2;
      if(s.x < 0) s.x = canvas.width; if(s.x > canvas.width) s.x = 0;
      if(s.y < 0) s.y = canvas.height; if(s.y > canvas.height) s.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* Build popup DOM */
function initVerificationUI(){
  try{
    console.log("[verify] initVerificationUI");
    removeExistingUI();
    injectStyles();
    // overlay
    const overlay = document.createElement("div"); overlay.id = "anime-verify-overlay";
    overlay.addEventListener("click", (e)=> e.stopPropagation());
    document.body.appendChild(overlay);
    // popup
    const popup = document.createElement("div"); popup.id = "anime-verify-popup";
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
        ${SHOW_BTN1==="on"?`<div><button class="anime-btn" id="animeBtn1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 1 (24h)</span></button><div class="anime-note">Use LinkShortify</div></div>`:`<div class="anime-note">⚠️ Skip Ads 1 - Unavailable</div>`}
        ${SHOW_BTN2==="on"?`<div><button class="anime-btn secondary" id="animeBtn2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 2 (24h)</span></button><div class="anime-note">Use GPLinks</div></div>`:`<div class="anime-note">⚠️ Skip Ads 2 - Unavailable</div>`}
        ${SHOW_BTN3==="on"?`<div><button class="anime-btn tertiary" id="animeBtn3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Skip Ads 3 (12h)</span></button><div class="anime-note">Use AroLinks</div></div>`:`<div class="anime-note">⚠️ Skip Ads 3 - Unavailable</div>`}
      </div>
      <div class="anime-warning">⚠️ If AdBlocker detected, please disable PrivateDNS in your device settings.</div>
      <div class="anime-progress"><div class="bar"></div></div>
    `;
    document.body.appendChild(popup);

    // create starfield
    createStarfieldCanvas();

    // language tabs
    const langTabs = popup.querySelectorAll(".anime-lang-tab");
    const texts = {
      en:{title:"Skip Ads once and Enjoy Unlimited Anime Free Watch/Download for 24h.",desc:"Click on the button below, go to another site, follow steps shown there, and you'll be redirected back to the same page."},
      hi:{title:"एक बार विज्ञापन छोड़ें और 24 घंटे तक फ्री एनीमे देखें/डाउनलोड करें।",desc:"नीचे दिए गए बटन पर क्लिक करें, दूसरी साइट पर जाएं, निर्देशों का पालन करें और आप उसी पेज पर वापस आ जाएंगे।"},
      te:{title:"ఒకసారి ప్రకటనను దాటండి మరియు 24 గంటల పాటు ఉచిత ఆనిమే చూడండి/డౌన్లోడ్ చేయండి.",desc:"క్రింది బటన్‌పై క్లిక్ చేసి, ఇతర సైట్‌కి వెళ్లి సూచనలు అనుసరించండి. మీరు తిరిగి అదే పేజీకి వస్తారు."},
      ta:{title:"ஒருமுறை விளம்பரத்தைத் தவிர்த்து 24 மணிநேரம் இலவசமாக அனிமே பார்க்கவும்/பதிவிறக்கவும்.",desc:"கீழே உள்ள பொத்தானை அழுத்தி, மற்ற தளத்தில் வழிமுறைகளை பின்பற்றி நீங்கள் மீண்டும் அதே பக்கத்திற்கு திரும்புவீர்கள்."}
    };
    langTabs.forEach(t=>{
      t.addEventListener("click", ()=>{
        langTabs.forEach(x=>x.classList.remove("active")); t.classList.add("active");
        const lang = t.getAttribute("data-lang"); const txt = texts[lang] || texts.en;
        document.getElementById("animeTitle").textContent = txt.title;
        document.getElementById("animeDesc").textContent = txt.desc;
      });
    });

    // wire buttons
    if(SHOW_BTN1==="on"){ const b=document.getElementById("animeBtn1"); if(b) b.addEventListener("click",()=> handleButtonFlow({durationMs:D24, shortenerOrder:["linkshortify","gplinks"]})); }
    if(SHOW_BTN2==="on"){ const b=document.getElementById("animeBtn2"); if(b) b.addEventListener("click",()=> handleButtonFlow({durationMs:D24, shortenerOrder:["gplinks","linkshortify"]})); }
    if(SHOW_BTN3==="on"){ const b=document.getElementById("animeBtn3"); if(b) b.addEventListener("click",()=> handleButtonFlow({durationMs:D12, shortenerOrder:["arolinks","gplinks","linkshortify"]})); }

    console.log("[verify] popup created");
  }catch(e){ console.error("[verify] init pop error:", e); }
}

/* ========== FLOW: shorten + redirect ========== */
async function handleButtonFlow({durationMs, shortenerOrder}){
  try{
    console.log("[verify] handleButtonFlow", shortenerOrder);
    const token = genToken(12);
    localStorage.setItem(LS_TOKEN_KEY, token);

    const callbackBase = (function(){
      const u = new URL(window.location.href);
      u.searchParams.delete("verify"); u.searchParams.delete("d");
      return u.toString();
    })();
    const callbackUrl = `${callbackBase}${callbackBase.includes("?") ? "&" : "?"}verify=${encodeURIComponent(token)}&d=${durationMs===D12?12:24}`;

    let shortLink = null;
    for(const s of shortenerOrder){
      if(s==="linkshortify") shortLink = await shortenWithLinkShortify(callbackUrl);
      else if(s==="gplinks") shortLink = await shortenWithGPLinks(callbackUrl);
      else if(s==="arolinks") shortLink = await shortenWithAroLinks(callbackUrl);
      if(shortLink) break;
    }
    const finalUrl = shortLink || callbackUrl;
    console.log("[verify] redirecting to:", finalUrl);
    // prefer same-tab navigation (old flow)
    try { window.location.href = finalUrl; }
    catch(e){ try{ window.open(finalUrl, "_blank"); }catch(e2){ showTemporaryMessage("Could not open link. Allow popups or try again."); } }
  }catch(e){ console.error("[verify] handleFlow err", e); showTemporaryMessage("An error occurred. Try again."); }
}

/* ========== ONLOAD CHECK & verify handling ========== */
function showVerifiedBadge(untilMs){
  try{
    if(document.getElementById("anime-verified-badge")) return;
    const b = document.createElement("div"); b.id="anime-verified-badge";
    Object.assign(b.style,{position:'fixed',right:'18px',top:'18px',background:'linear-gradient(90deg,#22c55e22,#22c55e11)',padding:'10px 12px',borderRadius:'10px',color:'#e9fbe9',fontWeight:700,zIndex:30000,boxShadow:'0 8px 30px rgba(0,0,0,0.3)'});
    const rem = formatRemaining(untilMs - nowMs());
    b.innerHTML = `✅ Verified — Ad-free for <span id="anime-verified-remaining">${rem}</span>`;
    document.body.appendChild(b);
  }catch(e){ console.warn(e); }
}
function startExpiryTicker(){
  const id = setInterval(()=>{
    const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    const el = document.getElementById("anime-verified-remaining");
    if(el) el.textContent = formatRemaining(until - nowMs());
    if(!until || nowMs()>until){ clearInterval(id); localStorage.removeItem(LS_VERIFIED_UNTIL); const b=document.getElementById("anime-verified-badge"); if(b) b.remove(); initVerificationUI(); }
  }, 30*1000);
}

function hideVerificationUI(){ removeExistingUI(); }

function checkLocalVerificationOnLoad(){
  try{
    console.log("[verify] checking local verification");
    // force popup if URL has forcePopup=1 (testing)
    if(getParam("forcePopup")==="1"){ console.log("[verify] forcePopup=1 set -> showing popup"); initVerificationUI(); return; }

    const until = Number(localStorage.getItem(LS_VERIFIED_UNTIL) || 0);
    if(until && nowMs() < until){ console.log("[verify] already verified, until:", new Date(until)); hideVerificationUI(); showVerifiedBadge(until); startExpiryTicker(); return; }

    const params = new URLSearchParams(window.location.search);
    const v = params.get("verify");
    const d = params.get("d");
    const storedToken = localStorage.getItem(LS_TOKEN_KEY);

    if(v && storedToken && v === storedToken){
      const duration = (d === "12") ? D12 : D24;
      const untilNew = nowMs() + duration;
      localStorage.setItem(LS_VERIFIED_UNTIL, String(untilNew));
      // cleanup url
      try{ history.replaceState(null, "", (function(){ const u=new URL(window.location.href); u.searchParams.delete("verify"); u.searchParams.delete("d"); return u.toString(); })() ); }catch(e){}
      hideVerificationUI(); showVerifiedBadge(untilNew); startExpiryTicker();
      console.log("[verify] verification success, until:", new Date(untilNew));
      return;
    }

    // else show popup
    initVerificationUI();
  }catch(e){ console.error("[verify] checkLocal err", e); initVerificationUI(); }
}

/* ========== STARTUP: wait for DOM ready ========== */
document.addEventListener("DOMContentLoaded", ()=>{
  try{
    console.log("[verify] DOMContentLoaded - starting verify check");
    // create starfield immediately (so background visible)
    createStarfieldCanvas();
    // delay a tiny bit to allow layout/styling load
    setTimeout(()=>{ checkLocalVerificationOnLoad(); }, 120);
  }catch(e){ console.error("[verify] startup err", e); checkLocalVerificationOnLoad(); }
});
