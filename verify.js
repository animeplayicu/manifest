export default async function verifyUser() {
    // ================= API TOKENS =================
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";

    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    let storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // ================= 10 MIN FREE (24h ONCE) =================
    // SAFE: temporary verifiedUntil set, so popup system intact
    const FREE_TIME = 10 * 60 * 1000;
    const FREE_COOLDOWN = 24 * 60 * 60 * 1000;
    const freeUsedAt = localStorage.getItem("freeUsedAt");

    if (!storedVerificationTime) {
        if (!freeUsedAt || currentTime - freeUsedAt > FREE_COOLDOWN) {
            localStorage.setItem("freeUsedAt", currentTime);
            localStorage.setItem("verifiedUntil", currentTime + FREE_TIME);
            storedVerificationTime = currentTime + FREE_TIME;
        }
    }

    // ================= Language translations =================
    const translations = {
        en: {
            title: "Skip Ads once and Enjoy Unlimited Anime Free Watch/Download.",
            tutorialLink: "How To Skip Ads ?",
            description: "Click on any button below, complete the verification, and you'll be redirected back to the anime page.",
            btn1Text: "Skip Ads 1 (24h)",
            btn2Text: "Skip Ads 2 (24h)",
            btn3Text: "Skip Ads 3 (12h)",
            warningText: "If AdBlocker detected, please disable PrivateDNS in your device settings.",
            loading: "Loading...",
            oneHourWarning: "⏰ Only 1 hour left! <b>Your verification will expire soon.</b>",
            expiresAt: "Expires at:"
        },
        hi: {
            title: "एक बार विज्ञापन छोड़ें और असीमित एनीमे मुफ्त देखें/डाउनलोड करें।",
            tutorialLink: "विज्ञापन कैसे छोड़ें?",
            description: "नीचे किसी भी बटन पर क्लिक करें, सत्यापन पूरा करें, और आपको एनीमे पेज पर वापस भेज दिया जाएगा।",
            btn1Text: "विज्ञापन छोड़ें 1 (24 घंटे)",
            btn2Text: "विज्ञापन छोड़ें 2 (24 घंटे)",
            btn3Text: "विज्ञापन छोड़ें 3 (12 घंटे)",
            warningText: "यदि एडब्लॉकर का पता चला है, तो कृपया अपनी डिवाइस सेटिंग्स में प्राइवेट DNS अक्षम करें।",
            loading: "लोड हो रहा है...",
            oneHourWarning: "⏰ केवल 1 घंटा बचा है! <b>आपका सत्यापन जल्द ही समाप्त हो जाएगा।</b>",
            expiresAt: "समाप्ति समय:"
        },
        te: {
            title: "ఒకసారి ప్రకటనలను దాటవేయండి మరియు అపరిమిత అనిమే ఉచితంగా చూడండి/డౌన్‌లోడ్ చేయండి.",
            tutorialLink: "ప్రకటనలను ఎలా దాటవేయాలి?",
            description: "దిగువ ఏదైనా బటన్‌పై క్లిక్ చేయండి, ధృవీకరణ పూర్తి చేయండి మరియు మీరు అనిమే పేజీకి తిరిగి మళ్లించబడతారు.",
            btn1Text: "ప్రకటనలను దాటవేయండి 1 (24 గంటలు)",
            btn2Text: "ప్రకటనలను దాటవేయండి 2 (24 గంటలు)",
            btn3Text: "ప్రకటనలను దాటవేయండి 3 (12 గంటలు)",
            warningText: "యాడ్‌బ్లాకర్ కనుగొనబడితే, దయచేసి మీ పరికర సెట్టింగ్‌లలో ప్రైవేట్DNS ని నిలిపివేయండి.",
            loading: "లోడ్ అవుతోంది...",
            oneHourWarning: "⏰ కేవలం 1 గంట మిగిలింది! <b>మీ ధృవీకరణ త్వరలో ముగుస్తుంది.</b>",
            expiresAt: "ముగిసే సమయం:"
        },
        ta: {
            title: "விளம்பரங்களை ஒருமுறை தவிர்க்கவும் மற்றும் வரம்பற்ற அனிமேவை இலவசமாக பார்க்கவும்/பதிவிறக்கவும்.",
            tutorialLink: "விளம்பரங்களை எப்படி தவிர்ப்பது?",
            description: "கீழே உள்ள எந்த பொத்தானையும் கிளிக் செய்து, சரிபார்ப்பை முடித்து, நீங்கள் அனிமே பக்கத்திற்கு திருப்பிவிடப்படுவீர்கள்.",
            btn1Text: "விளம்பரங்களைத் தவிர் 1 (24 மணி)",
            btn2Text: "விளம்பரங்களைத் தவிர் 2 (24 மணி)",
            btn3Text: "விளம்பரங்களைத் தவிர் 3 (12 மணி)",
            warningText: "விளம்பரத் தடுப்பு கண்டறியப்பட்டால், உங்கள் சாதன அமைப்புகளில் தனிப்பட்ட DNS ஐ முடக்கவும்.",
            loading: "ஏற்றுகிறது...",
            oneHourWarning: "⏰ 1 மணி மட்டுமே உள்ளது! <b>உங்கள் சரிபார்ப்பு விரைவில் காலாவதியாகும்.</b>",
            expiresAt: "காலாவதியாகும் நேரம்:"
        }
    };

    let currentLang = localStorage.getItem("selectedLanguage") || "en";

    // ================= Anti-Bypass init =================
    initAntiBypassProtection();

    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        localStorage.removeItem("oneHourLeftNotificationShown");
    }

    // ================= 1 hour left warning =================
    (function checkOneHourLeftNotification() {
        const verifiedUntil = localStorage.getItem("verifiedUntil");
        if (verifiedUntil) {
            const timeLeft = verifiedUntil - Date.now();
            const oneHour = 60 * 60 * 1000;
            if (
                timeLeft > 0 &&
                timeLeft <= oneHour &&
                localStorage.getItem("oneHourLeftNotificationShown") !== "yes"
            ) {
                showOneHourLeftNotification(verifiedUntil);
                localStorage.setItem("oneHourLeftNotificationShown", "yes");
            }
            if (timeLeft > oneHour) {
                localStorage.removeItem("oneHourLeftNotificationShown");
            }
        }
    })();

    // ================= Already verified =================
    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    // ================= Verify callback =================
    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        const verificationType = localStorage.getItem("verificationType") || "24h";
        const duration = verificationType === "12h"
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

    // ================= UI (UNCHANGED FROM YOUR CODE) =================
    // starfield
    const starfield = document.createElement('canvas');
    starfield.id = 'starfield';
    starfield.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
    document.body.appendChild(starfield);
    initStarfield(starfield);

    // orbs
    const orb1 = document.createElement('div');
    orb1.className = 'glow-orb orb-1';
    orb1.style.cssText = `position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:2;opacity:0.4;
        animation:float 15s ease-in-out infinite;width:500px;height:500px;
        background:radial-gradient(circle,rgba(123,31,162,0.4),transparent);top:-250px;right:-250px;`;
    document.body.appendChild(orb1);

    const orb2 = document.createElement('div');
    orb2.className = 'glow-orb orb-2';
    orb2.style.cssText = `position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:2;opacity:0.4;
        animation:float 15s ease-in-out infinite;width:400px;height:400px;
        background:radial-gradient(circle,rgba(123,31,162,0.3),transparent);bottom:-200px;left:-200px;animation-delay:-7s;`;
    document.body.appendChild(orb2);

    const overlay = document.createElement('div');
    overlay.id = 'verification-overlay';
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:998;`;
    document.body.appendChild(overlay);

    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="lang-tabs">
            <div class="lang-tab ${currentLang === 'en' ? 'active' : ''}" data-lang="en">English</div>
            <div class="lang-tab ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</div>
            <div class="lang-tab ${currentLang === 'te' ? 'active' : ''}" data-lang="te">తెలుగు</div>
            <div class="lang-tab ${currentLang === 'ta' ? 'active' : ''}" data-lang="ta">தமிழ்</div>
        </div>
        <h1 class="title" data-translate="title">${translations[currentLang].title}</h1>
        <div class="tutorial-link">
            <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank">
                <img src="https://cdn-icons-png.flaticon.com/512/13906/13906221.png" width="20" height="20"/>
                <span data-translate="tutorialLink">${translations[currentLang].tutorialLink}</span>
            </a>
        </div>
        <p class="description" data-translate="description">${translations[currentLang].description}</p>
        <div class="buttons">
            <div class="btn-wrapper" id="btn-wrapper-2">
                <button class="btn btn-2" id="verify-btn2">
                    <span class="btn-text" data-translate="btn2Text">${translations[currentLang].btn2Text}</span>
                    <p class="btn-note">GPLinks</p>
                </button>
            </div>
            <div class="btn-wrapper" id="btn-wrapper-3">
                <button class="btn btn-3" id="verify-btn3">
                    <span class="btn-text" data-translate="btn3Text">${translations[currentLang].btn3Text}</span>
                    <p class="btn-note">AroLinks</p>
                </button>
            </div>
        </div>
        <div class="warning">
            <p><span data-translate="warningText">${translations[currentLang].warningText}</span></p>
        </div>
        <div class="progress-container"><div class="progress-bar"></div></div>
    `;
    document.body.appendChild(popup);

    // ================= Config fetch (UNCHANGED) =================
    let config;
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt"
        );
        config = await response.json();
    } catch {
        config = { GPLINKS: "on", NEWAPI: "on" };
    }

    if (config.GPLINKS === "n" || config.GPLINKS === "off") {
        document.getElementById("btn-wrapper-2").classList.add("hidden");
    }
    if (config.NEWAPI === "n" || config.NEWAPI === "off") {
        document.getElementById("btn-wrapper-3").classList.add("hidden");
    }

    // ================= Language switch =================
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentLang = this.getAttribute('data-lang');
            localStorage.setItem("selectedLanguage", currentLang);
            updateLanguage(currentLang);
        });
    });

    function updateLanguage(lang) {
        const trans = translations[lang];
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (trans[key]) el.innerHTML = trans[key];
        });
    }

    // ================= Buttons =================
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        localStorage.setItem("verificationType", "24h");
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

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

    // ================= Helpers =================
    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    function get12hVerifyProvider() {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem("verify12hData")) || { date: today, count: 0 };
        if (data.date !== today) { data.date = today; data.count = 0; }
        data.count++;
        localStorage.setItem("verify12hData", JSON.stringify(data));
        return data.count === 1 ? "arolinks" : "linkshortify";
    }

    async function getShortenedURLWithGPLinks(longURL) {
        const r = await fetch(`https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
        const d = await r.json();
        return d.shortenedUrl || longURL;
    }

    async function getShortenedURLWithAroLinks(longURL) {
        const r = await fetch(`https://arolinks.com/api?api=${AROLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
        const d = await r.json();
        return d.shortenedUrl || longURL;
    }

    async function getShortenedURLWithLinkShortify(longURL) {
        const r = await fetch(`https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&format=text`);
        const t = await r.text();
        return t && t.startsWith("http") ? t.trim() : longURL;
    }

    function showOneHourLeftNotification(expirationTime) {
        if (localStorage.getItem("oneHourLeftNotificationShown") === "yes") return;
        const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
        const trans = translations[currentLang];
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.innerHTML = `${trans.oneHourWarning}<br><span>${trans.expiresAt} ${formattedTime}</span>`;
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 12000);
        localStorage.setItem("oneHourLeftNotificationShown", "yes");
    }

    function initAntiBypassProtection() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey)) e.preventDefault();
        });
    }

    function initStarfield(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const stars = [];
        const starCount = window.innerWidth < 768 ? 100 : 200;
        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.2;
                this.speedY = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random();
                this.fadeSpeed = (Math.random() * 0.02) + 0.01;
                this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                this.opacity += this.fadeSpeed * this.fadeDirection;
                if (this.opacity >= 1 || this.opacity <= 0.3) this.fadeDirection *= -1;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
        for (let i = 0; i < starCount; i++) stars.push(new Star());
        (function animate() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            stars.forEach(s => { s.update(); s.draw(); });
            requestAnimationFrame(animate);
        })();
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
}
