export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const ADRINO_API_TOKEN = "9405b17f67ae378d5d10cba700fb9813e43c5a33";
    const NANOLINKS_API_TOKEN = "be6dcdf8a68318e53bb1056702c3cc117047bcc9";
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
            <a id="verify-btn4" class="verify-btn">✅ Verify Now 4</a>
        </div>
    `;
    document.body.appendChild(popup);

    // Add CSS dynamically
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

        .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid transparent;
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 0.45s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #verification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: 1000;
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
        config = { GPLINKS: "y", ADRINO: "y", NANOLINKS: "y" }; // Default to all enabled if fetch fails
    }

    // Toggle button visibility based on config
    if (config.GPLINKS === "n") document.getElementById("verify-btn1").classList.add("hidden");
    if (config.ADRINO === "n") document.getElementById("verify-btn2").classList.add("hidden");
    if (config.NANOLINKS === "n") document.getElementById("verify-btn4").classList.add("hidden");

    // Handle verification button click for GPLinks API
    document.getElementById("verify-btn1").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL; // Redirect via GPLinks
    });

    // Handle verification button click for AdRINo Links API
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithAdRINoLinks(verificationURL);
        window.location.href = shortURL; // Redirect via AdRINo Links
    });

    // Handle verification button click for NanoLinks API
    document.getElementById("verify-btn4").addEventListener("click", async function () {
        const shortURL = await getShortenedURLWithNanoLinks(verificationURL);
        window.location.href = shortURL; // Redirect via NanoLinks
    });

    // Generate a random 10-character alphanumeric token
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
                console.error("GPLinks API error:", data);
                return longURL; 
            }
        } catch (error) {
            console.error("Error fetching GPLinks short link:", error);
            return longURL;
        }
    }

    async function getShortenedURLWithAdRINoLinks(longURL) {
        try {
            const response = await fetch(`https://adrinolinks.in/api?api=${ADRINO_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                console.error("AdRINo Links API error:", data);
                return longURL; 
            }
        } catch (error) {
            console.error("Error fetching AdRINo Links short link:", error);
            return longURL;
        }
    }

    async function getShortenedURLWithNanoLinks(longURL) {
        try {
            const response = await fetch(`https://nanolinks.in/api?api=${NANOLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                console.error("NanoLinks API error:", data);
                return longURL; 
            }
        } catch (error) {
            console.error("Error fetching NanoLinks short link:", error);
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
