export default async function verifyUser() {
    const API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0"; 
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

    document.getElementById("verify-btn").addEventListener("click", async function () {
        const shortURL = await getShortenedURL(verificationURL);
        window.location.href = shortURL;
    });

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

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    function showVerifiedMessage(expirationTime) {
        if (window.location.href.includes("&verify=")) {
            const formattedTime = new Date(expirationTime).toLocaleString();
            alert(`✅ Now you are verified until ${formattedTime}. Thank you for supporting us!`);
        }
    }
}
