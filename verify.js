export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0"; // button 1 token
    const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005"; // button 2 token (correct!)
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

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
        .hidden {display: none;}
        .spinner {width: 20px; height: 20px; border: 3px solid transparent; border-top: 3px solid white; border-radius: 50%; animation: spin 0.45s linear infinite;}
        @keyframes spin {0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);}}
        #verification-overlay {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); z-index: 1000;}
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

    // GPLinks 2 - Use correct endpoint and logic
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
        window.location.href = shortURL;
    });

    // LinkShortify
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
        window.location.href = shortURL;
    });

    // Generate a random 10-character alphanumeric token
    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    // GPLinks 1 JSON API
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

    // GPLinks 2 JSON API - Official Doc format (just like button 1!)
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

    // LinkShortify
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

    // Show verified message
    function showVerifiedMessage(expirationTime) {
        if (window.location.href.includes("&verify=")) {
            const formattedTime = new Date(expirationTime).toLocaleString();
            alert(`✅ Now you are verified until ${formattedTime}. Thank you for supporting us!`);
        }
    }
}
