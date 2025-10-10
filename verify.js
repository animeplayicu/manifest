// ==========================
// AnimePlay Verify System
// ==========================
export default async function verifyUser() {
  // 🔒 Prevent F12 / Inspect basic users
  document.onkeydown = e => {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
      e.preventDefault();
      alert("Inspect Disabled for security reasons!");
    }
  };

  // 🧠 Already verified check
  const lastVerify = localStorage.getItem("animeplay_verified");
  if (lastVerify && Date.now() - parseInt(lastVerify) < 24 * 60 * 60 * 1000) {
    console.log("Already verified ✅");
    return;
  }

  // 🪄 Create overlay popup
  const overlay = document.createElement("div");
  overlay.id = "verifyOverlay";
  overlay.innerHTML = `
  <style>
    #verifyOverlay {
      position: fixed; inset: 0;
      background: rgba(10,10,15,0.9);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999;
      animation: fadeIn 0.6s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }

    .verifyBox {
      position: relative;
      background: linear-gradient(145deg, rgba(25, 10, 35, 0.95), rgba(15, 10, 25, 0.95));
      border: 1px solid rgba(155, 50, 255, 0.4);
      border-radius: 20px;
      max-width: 420px;
      width: 90%;
      padding: 30px;
      color: #fff;
      text-align: center;
      box-shadow: 0 0 40px rgba(155,50,255,0.3);
      animation: floatBox 6s ease-in-out infinite;
    }
    @keyframes floatBox {
      0%,100% {transform: translateY(0);}
      50% {transform: translateY(-15px);}
    }

    h2 {
      font-size: 20px; margin-bottom: 15px;
      background: linear-gradient(90deg, #b26eff, #8c52ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .langTabs {
      display: flex; justify-content: center; gap: 8px;
      margin-bottom: 20px; flex-wrap: wrap;
    }
    .langTabs div {
      padding: 6px 14px; border-radius: 15px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #bbaaff; font-size: 13px; cursor: pointer;
      transition: all 0.3s ease;
    }
    .langTabs div.active, .langTabs div:hover {
      background: rgba(155,50,255,0.4);
      color: #fff;
    }

    button.verifyBtn {
      width: 100%; margin-top: 10px;
      padding: 14px 0; border-radius: 10px;
      border: none; font-weight: 600;
      color: #fff; font-size: 15px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
      gap: 10px;
      box-shadow: 0 0 25px rgba(155,50,255,0.2);
    }
    button.verifyBtn svg {
      width: 20px; height: 20px;
    }
    button.verifyBtn:hover { transform: translateY(-3px); }
    .btn1 {background: linear-gradient(135deg,#8e24aa,#7b1fa2);}
    .btn2 {background: linear-gradient(135deg,#7b1fa2,#6a1b9a);}
    .btn3 {background: linear-gradient(135deg,#6a1b9a,#4a148c);}

    .note {
      margin-top: 15px; font-size: 12px;
      color: #ccc;
    }
  </style>

  <div class="verifyBox">
    <h2>Verify to Continue Watching</h2>

    <div class="langTabs">
      <div class="active">English</div>
      <div>हिंदी</div>
      <div>తెలుగు</div>
      <div>தமிழ்</div>
    </div>

    <button class="verifyBtn btn1" id="btnLinkShortify">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
      Skip Ad 1 (LinkShortify)
    </button>
    <button class="verifyBtn btn2" id="btnGPLinks">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/></svg>
      Skip Ad 2 (GPLinks)
    </button>
    <button class="verifyBtn btn3" id="btnAroLinks">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      Skip Ad 3 (AroLinks)
    </button>

    <div class="note">If AdBlocker detected, please disable PrivateDNS or AdBlock temporarily.</div>
  </div>`;

  document.body.appendChild(overlay);

  // 🌐 Short link functions
  const ARO_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
  const SHORT_API = {
    linkshortify: (url) =>
      `https://api.linkshortify.com/?api=YOUR_TOKEN&url=${encodeURIComponent(url)}`,
    gplinks: (url) =>
      `https://gplinks.in/api?api=dbd508517acd20ccd73cd6f203227&url=${encodeURIComponent(url)}`,
    arolinks: (url) =>
      `https://arolinks.com/api?api=${ARO_TOKEN}&url=${encodeURIComponent(url)}&alias=animeplay&format=text`,
  };

  const redirectAfter = (url) => {
    window.open(url, "_blank");
    setTimeout(() => {
      localStorage.setItem("animeplay_verified", Date.now().toString());
      document.getElementById("verifyOverlay").remove();
    }, 3000);
  };

  // 🧩 Button Events
  document.getElementById("btnLinkShortify").onclick = () =>
    redirectAfter(SHORT_API.linkshortify("https://animeplay.icu"));
  document.getElementById("btnGPLinks").onclick = () =>
    redirectAfter(SHORT_API.gplinks("https://animeplay.icu"));
  document.getElementById("btnAroLinks").onclick = () =>
    redirectAfter(SHORT_API.arolinks("https://animeplay.icu"));
}
