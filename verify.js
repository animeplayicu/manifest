export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const BASE_URL = window.location.href.split("?verify=")[0]; 
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // --- POPUP FLAG RESET (after expiry) ---
    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        localStorage.removeItem("verifiedPopupShown");
        localStorage.removeItem("oneHourLeftNotificationShown");
    }
    // ---------------------------------------

    // 1h left notification -- ye hamesha page load pe check hoga:
    (function checkOneHourLeftNotification() {
        if (storedVerificationTime && localStorage.getItem("verifiedUntil")) {
            const timeLeft = storedVerificationTime - Date.now();
            const oneHour = 60 * 60 * 1000;
            if (
                timeLeft > 0 &&
                timeLeft <= oneHour &&
                localStorage.getItem("oneHourLeftNotificationShown") !== "yes"
            ) {
                showOneHourLeftNotification(storedVerificationTime);
                localStorage.setItem("oneHourLeftNotificationShown", "yes");
            }
            if (timeLeft > oneHour) {
                // Future proof: agar kabhi reset, old notification flag hata dein
                localStorage.removeItem("oneHourLeftNotificationShown");
            }
        }
    })();

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

    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="popup-contentt">
            <h2>🔐 Verification Required</h2>
            <p>To continue, please complete a quick verification. This is to keep our website free forever</p>
            <p><a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank"><b>How to verify</b></a></p>
            <p>If AdBlocker detected then disable PrivateDNS in your device settings.</p>
            <a id="verify-btn1" class="verify-btn">✅ Verify Now 1</a>
            <a id="verify-btn2" class="verify-btn">✅ Verify Now 2</a>
            <a id="verify-btn3" class="verify-btn">✅ Verify Now 3</a>
        </div>
    `;
    document.body.appendChild(popup);

    // Add CSS dynamically
    const style = document.createElement("style");
    style.innerHTML = `
        .popup-contentt { padding: 10px; background-color: #000; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);}
        #verification-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1e1e1e; color: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); text-align: center; z-index: 1001; min-width: 300px;}
        .verify-btn { background: #7b1fa2; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px; cursor: pointer;}
        .hidden { display: none; }
        #verify-success-banner, #verify-1h-warning {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            z-index: 19999;
            font-family: Inter, sans-serif;
            letter-spacing: 0.5px;
            font-size: 16px;
            border-radius: 8px;
            padding: 13px 28px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.18);
        }
        #verify-success-banner {
            top: 14px;
            background: #43a047;
            color: white;
        }
        #verify-1h-warning {
            top: 65px;
            background: #ffecb3;
            color: #b28704;
        }
    `;
    document.head.appendChild(style);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "verification-overlay";
    document.body.appendChild(overlay);

    // Fetch and apply config settings
    let config;
    try {
        const response = await fetch("https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt");
        config = await response.json();
    } catch (error) {
        console.error("Error fetching config:", error);
        config = { GPLINKS: "y", LINKCENTS: "y", LINKSHORTIFY: "y" };
    }

    // Toggle button visibility based on config
    if (config.GPLINKS === "n") document.getElementById("verify-btn1").classList.add("hidden");
    if (config.LINKSHORTIFY === "n") document.getElementById("verify-btn3").classList.add("hidden");

    // GPLinks 1
    document.getElementById("verify-btn1").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

    // GPLinks 2
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
        window.location.href = shortURL;
    });

    // LinkShortify
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
        window.location.href = shortURL;
    });

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

    async function getShortenedURLWithGPLinks2(longURL) {
        try {
            const response = await fetch(`https://api.gplinks.com/api?api=${GPLINKS2_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                alert(data.message || "GPLinks 2 Error");
                return longURL;
            }
        } catch (error) {
            alert("Error fetching GPLinks 2 short link");
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

    // --- Verified Success Popup [ONE TIME, per verification] ---
    function showVerifiedMessage(expirationTime) {
        if (localStorage.getItem("verifiedPopupShown") === "yes") return;
        const formattedTime = new Date(expirationTime).toLocaleString();
        const notice = document.createElement('div');
        notice.id = 'verify-success-banner';
        notice.textContent = `✅ You are verified for 24 hours! Valid till: ${formattedTime}`;
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 7000);
        localStorage.setItem("verifiedPopupShown", "yes");
    }

    // --- 1 Hour Left Notification [ONE TIME, per verification] ---
    function showOneHourLeftNotification(expirationTime) {
        if (localStorage.getItem("oneHourLeftNotificationShown") === "yes") return;
        const formattedTime = new Date(expirationTime).toLocaleTimeString();
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.textContent = `⚠️ Only 1 hour left! Verification expires at ${formattedTime}`;
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 9000);
        localStorage.setItem("oneHourLeftNotificationShown", "yes");
    }
}
