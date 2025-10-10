export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";

    // BUTTON SHOW/HIDE FLAGS
    const SHOW_BTN = {
        BTN1: true, // LinkShortify 24h
        BTN2: true, // GPLinks 24h
        BTN3: true  // Custom/AroLinks 12h
    };

    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) window.location.href = BASE_URL;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000);
        window.location.href = BASE_URL;
        return;
    }

    const newToken = storedToken || generateToken();
    localStorage.setItem("userToken", newToken);
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // --- POPUP UI CREATION ---
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="close-btn" onclick="closeModal()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </div>

        <div class="lang-tabs">
            <div class="lang-tab active">English</div>
            <div class="lang-tab">हिंदी</div>
            <div class="lang-tab">தமிழ்</div>
        </div>

        <h1 class="title">Skip Ads once and Enjoy Unlimited Anime Free Watch/Download for 24h.</h1>

        <div class="tutorial-link">
            <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank">
                How To Skip Ads Tutorial
            </a>
        </div>

        <p class="description">
            Click on the button below, go to another site, follow the steps, and you'll be redirected back.
        </p>

        <div class="buttons">
            <div class="btn-wrapper" id="btn-wrapper-1">
                <button class="btn btn-1">Skip Ads 1 (24h)</button>
                <p class="btn-note">Uses LinkShortify API</p>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-2">
                <button class="btn btn-2">Skip Ads 2 (24h)</button>
                <p class="btn-note">Uses GPLinks API</p>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-3">
                <button class="btn btn-3">Skip Ads 3 (12h)</button>
                <p class="btn-note">Uses Custom/AroLinks API</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // --- SHOW_BTN FLAG HANDLING ---
    if (!SHOW_BTN.BTN1) document.getElementById('btn-wrapper-1').style.display = 'none';
    if (!SHOW_BTN.BTN2) document.getElementById('btn-wrapper-2').style.display = 'none';
    if (!SHOW_BTN.BTN3) document.getElementById('btn-wrapper-3').style.display = 'none';

    // --- BUTTON EVENT HANDLERS ---
    document.querySelector('.btn-1').addEventListener('click', async () => {
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
        window.location.href = shortURL;
    });

    document.querySelector('.btn-2').addEventListener('click', async () => {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

    document.querySelector('.btn-3').addEventListener('click', async () => {
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
        window.location.href = shortURL;
    });

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURLWithLinkShortify(longURL) {
        try {
            const res = await fetch(`https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await res.json();
            if (data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
            return longURL;
        } catch {
            return longURL;
        }
    }

    async function getShortenedURLWithGPLinks(longURL) {
        try {
            const res = await fetch(`https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await res.json();
            if (data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
            return longURL;
        } catch {
            return longURL;
        }
    }

    async function getShortenedURLWithGPLinks2(longURL) {
        try {
            const res = await fetch(`https://api.gplinks.com/api?api=${GPLINKS2_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await res.json();
            if (data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
            return longURL;
        } catch {
            return longURL;
        }
    }

    // --- MODAL CLOSE ---
    window.closeModal = () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };
}
