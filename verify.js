export default async function verifyUser() {
    const SHOW_BTN1 = "on"; // LinkShortify 24h
    const SHOW_BTN2 = "on"; // GPLinks 24h
    const SHOW_BTN3 = "on"; // AroLinks 12h

    const BASE_URL = window.location.href.split("?verify=")[0];
    let storedToken = localStorage.getItem("userToken");
    let storedVerified = localStorage.getItem("verifiedUntil");
    const now = Date.now();

    // Clear old 1h notification if expired
    if (storedVerified && now > storedVerified) localStorage.removeItem("oneHourLeftNotificationShown");

    // 1h left warning
    (function checkOneHourLeftNotification() {
        const verifiedUntil = localStorage.getItem("verifiedUntil");
        if (verifiedUntil) {
            const timeLeft = verifiedUntil - Date.now();
            const oneHour = 60 * 60 * 1000;
            if (timeLeft > 0 && timeLeft <= oneHour && localStorage.getItem("oneHourLeftNotificationShown") !== "yes") {
                showOneHourLeftNotification(verifiedUntil);
                localStorage.setItem("oneHourLeftNotificationShown","yes");
            }
            if (timeLeft > oneHour) localStorage.removeItem("oneHourLeftNotificationShown");
        }
    })();

    // Already verified
    if (storedVerified && now < storedVerified) {
        if (window.location.href.includes("&verify=")) window.location.href = BASE_URL;
        return;
    }

    // Token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");
    if (userToken && userToken === storedToken) {
        localStorage.setItem("verifiedUntil", now + 24*60*60*1000);
        window.location.href = BASE_URL;
        return;
    }

    // Generate token if not exist
    if (!storedToken) {
        storedToken = Math.random().toString(36).substr(2,10);
        localStorage.setItem("userToken", storedToken);
    }
    const verificationURL = `${BASE_URL}?verify=${storedToken}`;

    // --- POPUP HTML (NEW DESIGN) ---
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `

        <!-- Close button -->
        <div class="close-btn" onclick="closeModal()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </div>

        <!-- Language tabs -->
        <div class="lang-tabs">
            <div class="lang-tab active">English</div>
            <div class="lang-tab">हिंदी</div>
            <div class="lang-tab">తెలుగు</div>
            <div class="lang-tab">தமிழ்</div>
        </div>

        <h1 class="title">Skip Ads once and Enjoy Unlimited Anime Free Watch/Download.</h1>

        <div class="tutorial-link">
            <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank">
                How To Skip Ads Tutorial
            </a>
        </div>

        <p class="description">
            Click on the button below, go to another site, follow the steps there, and you'll be redirected back.
        </p>

        <!-- Buttons -->
        <div class="buttons">
            <div class="btn-wrapper">
                <button class="btn btn-1">Skip Ads 1 (24h)</button>
            </div>
            <div class="btn-wrapper">
                <button class="btn btn-2">Skip Ads 2 (24h)</button>
            </div>
            <div class="btn-wrapper">
                <button class="btn btn-3">Skip Ads 3 (12h)</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // SHOW_BTN flags
    if(SHOW_BTN1 !== "on") modal.querySelector(".btn-1")?.classList.add("hidden");
    if(SHOW_BTN2 !== "on") modal.querySelector(".btn-2")?.classList.add("hidden");
    if(SHOW_BTN3 !== "on") modal.querySelector(".btn-3")?.classList.add("hidden");

    // BUTTON CLICK HANDLERS
    modal.querySelector(".btn-1")?.addEventListener("click",()=> {
        localStorage.setItem("verifiedUntil", Date.now()+24*60*60*1000);
        window.location.href = `https://linkshortify.com/?verify=${storedToken}`;
    });
    modal.querySelector(".btn-2")?.addEventListener("click",()=> {
        localStorage.setItem("verifiedUntil", Date.now()+24*60*60*1000);
        window.location.href = `https://gplinks.com/?verify=${storedToken}`;
    });
    modal.querySelector(".btn-3")?.addEventListener("click",()=> {
        localStorage.setItem("verifiedUntil", Date.now()+12*60*60*1000);
        window.location.href = `https://arolinks.com/?verify=${storedToken}`;
    });

    // F12 / inspect / right-click prevention
    document.addEventListener("keydown",(e)=>{
        if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="C"||e.key==="J"))||(e.ctrlKey&&e.key==="U")){
            e.preventDefault(); alert("Action disabled!");
        }
    });
    document.addEventListener("contextmenu", e=>e.preventDefault());

    // Optional 1-hour left notification
    function showOneHourLeftNotification(expirationTime){
        if(localStorage.getItem("oneHourLeftNotificationShown")==="yes") return;
        const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.innerHTML = `⏰ Only 1 hour left! <b>Your verification will expire soon.</b><br>
        <span style="font-size:15px;opacity:0.87;">Expires at: ${formattedTime}</span>
        <button id="verify-1h-done-btn">OK</button>`;
        document.body.appendChild(notice);
        document.getElementById('verify-1h-done-btn').onclick = ()=>notice.remove();
        setTimeout(()=>{if(notice.parentNode) notice.remove();},12000);
        localStorage.setItem("oneHourLeftNotificationShown","yes");
    }

    // Modal close function
    window.closeModal = () => {
        modal.style.display = "none";
        overlay.style.display = "none";
    };

    // Language tab switching
    modal.querySelectorAll('.lang-tab').forEach(tab=>{
        tab.addEventListener('click', function(){
            modal.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}
