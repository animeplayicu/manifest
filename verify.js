export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // --- Popup flag reset after expiry ---
    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        localStorage.removeItem("verifiedPopupShown");
    }
    // -------------------------------------

    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) {
            showVerifiedMessage(storedVerificationTime);
            window.location.href = BASE_URL;
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000);
        showVerifiedMessage(currentTime + 24 * 60 * 60 * 1000);
        window.location.href = BASE_URL;
        return;
    }

    const newToken = storedToken || generateToken();
    localStorage.setItem("userToken", newToken);
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // --- BACKGROUND BLUR OVERLAY ---
    function applyBackgroundBlur() {
        let blur = document.getElementById("verification-overlay");
        if (!blur) {
            blur = document.createElement('div');
            blur.id = "verification-overlay";
            blur.style = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(10px);
                z-index: 1000;
            `;
            document.body.appendChild(blur);
        } else {
            blur.style.display = "block";
        }
    }
    function removeBackgroundBlur() {
        const blur = document.getElementById("verification-overlay");
        if (blur) blur.style.display = "none";
    }

    // --- POPUP CREATION ---
    applyBackgroundBlur();
    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="popup-contentt">
            <h2>🔐 Verification Required</h2>
            <p>To continue, please complete a quick verification. This is to keep our website free forever</p>
            <p><a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank"><b>How to verify</b></a></p>
            <p>If AdBlocker detected then disable PrivateDNS in your device settings.</p>
            <a id="verify-btn1" class="verify-btn">✅ Verify Now 1</a>
            <a id="verify-btn3" class="verify-btn">✅ Verify Now 2</a>
        </div>
    `;
    document.body.appendChild(popup);

    // CSS INJECTION
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
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e;
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
            text-align: center;
            z-index: 1001;
            min-width: 300px;
        }
        .verify-btn {
            background: #7b1fa2;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
            cursor: pointer;
        }
        .hidden {
            display: none;
        }
        #verify-success-banner {
            position:fixed;
            top:18px;
            left:50%;
            transform:translateX(-50%);
            background:#43a047;
            color:white;
            padding:14px 45px 14px 28px;
            border-radius:9px;
            z-index:19999;
            box-shadow:0 4px 16px rgba(0,0,0,0.17);
            font-size:17px;
            font-family:Inter,sans-serif;
            letter-spacing:0.5px;
            display:flex;
            align-items:center;
            min-width:260px;
            max-width:90vw;
        }
        #verify-success-banner button {
            margin-left:auto;
            background:#fff;
            color:#43a047;
            border:none;
            border-radius:6px;
            padding:7px 18px;
            cursor:pointer;
            font-weight:600;
            font-size:15px;
            box-shadow:0 1px 3px rgba(45,90,50,0.07);
            margin-right:-8px;
            transition:background 0.2s;
        }
        #verify-success-banner button:hover {
            background:#e6ffe5;
        }
        #verification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);

    // Fetch and apply config settings
    let config;
    try {
        const response = await fetch("https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt");
        config = await response.json();
    } catch (error) {
        console.error("Error fetching config:", error);
        config = { GPLINKS: "y", LINKSHORTIFY: "y" };
    }

    if (config.GPLINKS === "n") document.getElementById("verify-btn1").classList.add("hidden");
    if (config.LINKSHORTIFY === "n") document.getElementById("verify-btn3").classList.add("hidden");

    // --- BUTTON HANDLER ---
    document.getElementById("verify-btn1").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        cleanupPopup();
        window.location.href = shortURL;
    });
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
        cleanupPopup();
        window.location.href = shortURL;
    });

    function cleanupPopup() {
        removeBackgroundBlur();
        const pop = document.getElementById('verification-popup');
        if(pop) pop.remove();
    }

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURLWithGPLinks(longURL) {
        try {
            const response = await fetch(`https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                alert(data.message || "GPLinks 1 Error");
                return longURL;
            }
        } catch (error) {
            alert("Error fetching GPLinks 1 short link");
            return longURL;
        }
    }

    async function getShortenedURLWithLinkShortify(longURL) {
        try {
            const response = await fetch(`https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                alert("LinkShortify API error");
                return longURL;
            }
        } catch (error) {
            alert("Error fetching LinkShortify short link");
            return longURL;
        }
    }

    // === Verified Success Banner (ek hi baar, close+auto-hide) ===
    function showVerifiedMessage(expirationTime) {
        if (localStorage.getItem("verifiedPopupShown") === "yes") return;
        const formattedTime = new Date(expirationTime).toLocaleString();
        const notice = document.createElement('div');
        notice.id = 'verify-success-banner';
        notice.innerHTML = `
            ✅ You are verified for 24 hours.<br>
            <span style="font-size:15px;opacity:0.82;">Valid till: ${formattedTime}</span>
            <button id="verify-done-btn" style="
                margin-left:auto;background:#fff;color:#43a047;border:none;
                border-radius:6px;padding:7px 18px;cursor:pointer;
                font-weight:600;font-size:15px;box-shadow:0 1px 3px rgba(45,90,50,0.07);margin-right:-8px;
            ">Done</button>
        `;
        document.body.appendChild(notice);
        // User can close via Done button
        document.getElementById('verify-done-btn').onclick = () => {
            notice.remove();
        };
        // Auto-hide after 10 sec
        setTimeout(() => {
            if (notice.parentNode) notice.remove();
        }, 10000);
        localStorage.setItem("verifiedPopupShown", "yes");
    }
}
