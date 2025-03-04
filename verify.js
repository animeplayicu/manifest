export default async function verifyUser() {
    const API_TOKEN = "YOUR_GPLINKS_API_TOKEN"; // Replace with your GPLinks token
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
            <a id="verify-btn" class="verify-btn">✅ Verify Now</a>
            <h3>Or Enter Redeem Code</h3>
            <input type="text" id="redeem-input" class="redeem-input" placeholder="Enter redeem code" />
            <button id="redeem-btn" class="redeem-btn">Redeem</button>
        </div>
    `;
    document.body.appendChild(popup);

    const overlay = document.createElement("div");
    overlay.id = "verification-overlay";
    document.body.appendChild(overlay);

    document.getElementById("verify-btn").addEventListener("click", async function () {
        const shortURL = await getShortenedURL(verificationURL);
        window.location.href = shortURL;
    });

    document.getElementById("redeem-btn").addEventListener("click", async function () {
        const redeemCode = document.getElementById("redeem-input").value;
        const redeemBtn = document.getElementById("redeem-btn");

        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        redeemBtn.innerHTML = "";
        redeemBtn.appendChild(spinner);

        if (redeemCode) {
            const isValid = await validateRedeemCode(redeemCode);
            if (isValid) {
                localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000);
                alert("✅ Redeem successful! You are now verified for 24 hours.");
                window.location.href = BASE_URL;
                await deleteRedeemCode();
            } else {
                alert("❌ Invalid redeem code.");
            }
        } else {
            alert("❌ Please enter a redeem code.");
        }
        redeemBtn.innerHTML = "Redeem";
    });

    async function validateRedeemCode(code) {
        try {
            const response = await fetch("https://aniflix-redeem.vercel.app/api/redeem", { method: "GET" });
            const data = await response.json();
            return data.redeemCode && data.redeemCode === code;
        } catch (error) {
            console.error("Error validating redeem code:", error);
        }
        return false;
    }

    async function deleteRedeemCode() {
        try {
            await fetch("https://aniflix-redeem.vercel.app/api/redeem", { method: "POST" });
        } catch (error) {}
    }

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURL(longURL) {
        try {
            const response = await fetch(`https://api.gplinks.com/api?api=${API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
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

    function showVerifiedMessage(expirationTime) {
        if (window.location.href.includes("&verify=")) {
            const formattedTime = new Date(expirationTime).toLocaleString();
            alert(`✅ Now you are verified until ${formattedTime}. Thank you for supporting us!`);
        }
    }
}

