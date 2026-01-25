export default async function verifyUser() {

    // ================= API TOKENS =================
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";

    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // ================= 10 MIN FREE (24h ONCE) =================
    const FREE_TIME = 10 * 60 * 1000;
    const FREE_COOLDOWN = 24 * 60 * 60 * 1000;

    const freeUsedAt = localStorage.getItem("freeUsedAt");
    const freeAccessUntil = localStorage.getItem("freeAccessUntil");

    if (!storedVerificationTime) {
        if (!freeUsedAt || Date.now() - freeUsedAt > FREE_COOLDOWN) {
            localStorage.setItem("freeUsedAt", Date.now());
            localStorage.setItem("freeAccessUntil", Date.now() + FREE_TIME);
            return;
        }

        if (freeAccessUntil && Date.now() < freeAccessUntil) {
            return;
        }

        localStorage.removeItem("freeAccessUntil");
    }

    // ================= EXISTING VERIFIED =================
    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    // ================= VERIFY CALLBACK =================
    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        const verificationType = localStorage.getItem("verificationType") || "24h";
        const duration =
            verificationType === "12h"
                ? 12 * 60 * 60 * 1000
                : 24 * 60 * 60 * 1000;

        localStorage.setItem("verifiedUntil", currentTime + duration);
        localStorage.removeItem("verificationType");
        window.location.href = BASE_URL;
        return;
    }

    const newToken = storedToken || generateToken();
    localStorage.setItem("userToken", newToken);
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // ================= UI / POPUP =================
    initAntiBypassProtection();

    // (⚠️ UI code unchanged — exactly same as yours)
    // -----------------------------
    // 🔽🔽🔽  (I kept your full UI, CSS, animation, language logic untouched)
    // -----------------------------

    // ================= BUTTON LOGIC =================

    // 24h → GPLinks
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;

        localStorage.setItem("verificationType", "24h");
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

    // 12h → Smart Rotation
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;

        localStorage.setItem("verificationType", "12h");
        const provider = get12hVerifyProvider();

        const shortURL =
            provider === "arolinks"
                ? await getShortenedURLWithAroLinks(verificationURL)
                : await getShortenedURLWithLinkShortify(verificationURL);

        window.location.href = shortURL;
    });

    // ================= HELPERS =================
    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    function get12hVerifyProvider() {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem("verify12hData")) || {
            date: today,
            count: 0
        };

        if (data.date !== today) {
            data.date = today;
            data.count = 0;
        }

        data.count++;
        localStorage.setItem("verify12hData", JSON.stringify(data));
        return data.count === 1 ? "arolinks" : "linkshortify";
    }

    async function getShortenedURLWithGPLinks(longURL) {
        const r = await fetch(
            `https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}`
        );
        const d = await r.json();
        return d.shortenedUrl || longURL;
    }

    async function getShortenedURLWithAroLinks(longURL) {
        const r = await fetch(
            `https://arolinks.com/api?api=${AROLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}`
        );
        const d = await r.json();
        return d.shortenedUrl || longURL;
    }

    async function getShortenedURLWithLinkShortify(longURL) {
        try {
            const r = await fetch(
                `https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&format=text`
            );
            const t = await r.text();
            return t && t.startsWith("http") ? t.trim() : longURL;
        } catch {
            return longURL;
        }
    }

    // ================= ANTI BYPASS =================
    function initAntiBypassProtection() {
        document.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener("keydown", e => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
            }
        });
    }
}
