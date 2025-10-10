export default async function verifyUser() {
  // === API CONFIG ===
  const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
  const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005";
  const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
  const BASE_URL = window.location.href.split("?verify=")[0];

  // === STORAGE ===
  const storedToken = localStorage.getItem("userToken");
  const storedVerificationTime = localStorage.getItem("verifiedUntil");
  const currentTime = Date.now();

  if (storedVerificationTime && currentTime > storedVerificationTime) {
    localStorage.removeItem("oneHourLeftNotificationShown");
  }

  // --- 1 HOUR LEFT NOTIFICATION ---
  (function checkOneHourLeftNotification() {
    const verifiedUntil = localStorage.getItem("verifiedUntil");
    if (verifiedUntil) {
      const timeLeft = verifiedUntil - Date.now();
      const oneHour = 60 * 60 * 1000;
      if (timeLeft > 0 && timeLeft <= oneHour && localStorage.getItem("oneHourLeftNotificationShown") !== "yes") {
        showOneHourLeftNotification(verifiedUntil);
        localStorage.setItem("oneHourLeftNotificationShown", "yes");
      }
      if (timeLeft > oneHour) localStorage.removeItem("oneHourLeftNotificationShown");
    }
  })();

  // === ALREADY VERIFIED? ===
  if (storedVerificationTime && currentTime < storedVerificationTime) {
    if (window.location.href.includes("&verify=")) window.location.href = BASE_URL;
    return;
  }

  // === CHECK URL TOKEN ===
  const urlParams = new URLSearchParams(window.location.search);
  const userToken = urlParams.get("verify");

  if (userToken && userToken === storedToken) {
    localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000);
    window.location.href = BASE_URL;
    return;
  }

  // === GENERATE NEW TOKEN ===
  const newToken = storedToken || generateToken();
  localStorage.setItem("userToken", newToken);
  const verificationURL = `${BASE_URL}?verify=${newToken}`;

  // === BACKGROUND BLUR ===
  function applyBackgroundBlur() {
    let blur = document.getElementById("verification-overlay");
    if (!blur) {
      blur = document.createElement('div');
      blur.id = "verification-overlay";
      blur.style = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh; background: rgba(0,0,0,0.5);
        backdrop-filter: blur(10px); z-index: 1000;
      `;
      document.body.appendChild(blur);
    } else {
      blur.style.display = "block";
    }
  }
  applyBackgroundBlur();

  // === POPUP ===
  const popup = document.createElement("div");
  popup.id = "verification-popup";
  popup.innerHTML = `
    <div class="popup-contentt">
      <h2>🔐 Verification Required</h2>
      <p>To continue, complete a quick verification to keep this website free forever.</p>
      <p><a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank"><b>How to verify</b></a></p>
      <p>If AdBlocker detected, disable PrivateDNS in your device settings.</p>
      <a id="verify-btn1" class="verify-btn">✅ Verify Now 1</a>
      <a id="verify-btn2" class="verify-btn">✅ Verify Now 2</a>
      <a id="verify-btn3" class="verify-btn">✅ Verify Now 3</a>
    </div>
  `;
  document.body.appendChild(popup);

  // === CSS ===
  const style = document.createElement("style");
  style.innerHTML = `
    .popup-contentt {
      padding: 10px;
      background-color: #000;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    }
    #verification-popup {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #1e1e1e; color: #fff; padding: 20px; border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0,0,0,0.3); text-align: center; z-index: 1001; min-width: 300px;
    }
    .verify-btn {
      background: #7b1fa2; color: #fff; padding: 10px 15px; border-radius: 5px;
      text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px; cursor: pointer;
    }
    .hidden { display: none; }
    #verify-1h-warning {
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: #ff4747; color: #fff; padding: 14px 45px 14px 28px; border-radius: 9px;
      z-index: 19999; box-shadow: 0 4px 16px rgba(0,0,0,0.18); font-size: 17px; font-family: Inter,sans-serif;
      letter-spacing:0.5px; display:flex; align-items:center; min-width:260px; max-width:90vw;
    }
    #verify-1h-warning button {
      margin-left:auto; background:#fff; color:#b32c2c; border:none; border-radius:6px;
      padding:7px 18px; cursor:pointer; font-weight:600; font-size:15px;
      box-shadow:0 1px 3px rgba(45,90,50,0.07); margin-right:-8px; transition:background 0.2s;
    }
    #verify-1h-warning button:hover { background:#fae7a7; }
    #verification-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); z-index: 1000;
    }
  `;
  document.head.appendChild(style);

  // === CONFIG FETCH ===
  let config;
  try {
    const response = await fetch("https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt");
    config = await response.json();
  } catch {
    config = { GPLINKS: "y", LINKSHORTIFY: "y" };
  }

  if (config.GPLINKS === "n") document.getElementById("verify-btn1").classList.add("hidden");
  if (config.LINKSHORTIFY === "n") document.getElementById("verify-btn3").classList.add("hidden");

  // === BUTTON HANDLERS ===
  document.getElementById("verify-btn1").addEventListener("click", async () => {
    const shortURL = await getShortenedURLWithGPLinks(verificationURL);
    window.location.href = shortURL;
  });
  document.getElementById("verify-btn2").addEventListener("click", async () => {
    const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
    window.location.href = shortURL;
  });
  document.getElementById("verify-btn3").addEventListener("click", async () => {
    const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
    window.location.href = shortURL;
  });

  // === TOKEN & SHORTENERS ===
  function generateToken() { return Math.random().toString(36).substr(2, 10); }

  async function getShortenedURLWithGPLinks(longURL) {
    try {
      const res = await fetch(`https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
      const data = await res.json();
      return data.status === "success" && data.shortenedUrl ? data.shortenedUrl : longURL;
    } catch { return longURL; }
  }

  async function getShortenedURLWithGPLinks2(longURL) {
    try {
      const res = await fetch(`https://api.gplinks.com/api?api=${GPLINKS2_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
      const data = await res.json();
      return data.status === "success" && data.shortenedUrl ? data.shortenedUrl : longURL;
    } catch { return longURL; }
  }

  async function getShortenedURLWithLinkShortify(longURL) {
    try {
      const res = await fetch(`https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
      const data = await res.json();
      return data.status === "success" && data.shortenedUrl ? data.shortenedUrl : longURL;
    } catch { return longURL; }
  }

  // === 1 HOUR LEFT NOTIFICATION ===
  function showOneHourLeftNotification(expirationTime) {
    if (localStorage.getItem("oneHourLeftNotificationShown") === "yes") return;
    const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
    const notice = document.createElement('div');
    notice.id = 'verify-1h-warning';
    notice.innerHTML = `
      ⏰ Only 1 hour left! <b>Your verification will expire soon.</b><br>
      <span style="font-size:15px;opacity:0.87;">Expires at: ${formattedTime}</span>
      <button id="verify-1h-done-btn">OK</button>
    `;
    document.body.appendChild(notice);
    document.getElementById('verify-1h-done-btn').onclick = () => notice.remove();
    setTimeout(() => { if (notice.parentNode) notice.remove(); }, 12000);
    localStorage.setItem("oneHourLeftNotificationShown", "yes");
  }
}
