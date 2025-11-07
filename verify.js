export default async function verifyUser() {
    // API TOKENS
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
    
    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // Language translations
    const translations = {
        en: {
            title: "Skip Ads once and Enjoy Unlimited Anime Free Watch/Download.",
            tutorialLink: "How To Skip Ads ?",
            description: "Click on any button below, complete the verification, and you'll be redirected back to the anime page.",
            btn2Text: "Skip Ads 1 (24h)",
            btn3Text: "Skip Ads 2 (12h)",
            warningText: "If AdBlocker detected, please disable PrivateDNS in your device settings.",
            loading: "Loading...",
            oneHourWarning: "⏰ Only 1 hour left! <b>Your verification will expire soon.</b>",
            expiresAt: "Expires at:"
        },
        hi: {
            title: "एक बार विज्ञापन छोड़ें और असीमित एनीमे मुफ्त देखें/डाउनलोड करें।",
            tutorialLink: "विज्ञापन कैसे छोड़ें?",
            description: "नीचे किसी भी बटन पर क्लिक करें, सत्यापन पूरा करें, और आपको एनीमे पेज पर वापस भेज दिया जाएगा।",
            btn2Text: "विज्ञापन छोड़ें 1 (24 घंटे)",
            btn3Text: "विज्ञापन छोड़ें 2 (12 घंटे)",
            warningText: "यदि एडब्लॉकर का पता चला है, तो कृपया अपनी डिवाइस सेटिंग्स में प्राइवेट DNS अक्षम करें।",
            loading: "लोड हो रहा है...",
            oneHourWarning: "⏰ केवल 1 घंटा बचा है! <b>आपका सत्यापन जल्द ही समाप्त हो जाएगा।</b>",
            expiresAt: "समाप्ति समय:"
        },
        te: {
            title: "ఒకసారి ప్రకటనలను దాటవేయండి మరియు అపరిమిత అనిమే ఉచితంగా చూడండి/డౌన్‌లోడ్ చేయండి.",
            tutorialLink: "ప్రకటనలను ఎలా దాటవేయాలి?",
            description: "దిగువ ఏదైనా బటన్‌పై క్లిక్ చేయండి, ధృవీకరణ పూర్తి చేయండి మరియు మీరు అనిమే పేజీకి తిరిగి మళ్లించబడతారు.",
            btn2Text: "ప్రకటనలను దాటవేయండి 1 (24 గంటలు)",
            btn3Text: "ప్రకటనలను దాటవేయండి 2 (12 గంటలు)",
            warningText: "యాడ్‌బ్లాకర్ కనుగొనబడితే, దయచేసి మీ పరికర సెట్టింగ్‌లలో ప్రైవేట్DNS ని నిలిపివేయండి.",
            loading: "లోడ్ అవుతోంది...",
            oneHourWarning: "⏰ కేవలం 1 గంట మిగిలింది! <b>మీ ధృవీకరణ త్వరలో ముగుస్తుంది।</b>",
            expiresAt: "ముగిసే సమయం:"
        },
        ta: {
            title: "விளம்பரங்களை ஒருமுறை தவிர்க்கவும் மற்றும் வரம்பற்ற அனிமேவை இலவசமாக பார்க்கவும்/பதிவிறக்கவும்.",
            tutorialLink: "விளம்பரங்களை எப்படி தவிர்ப்பது?",
            description: "கீழே உள்ள எந்த பொத்தானையும் கிளிக் செய்து, சரிபார்ப்பை முடித்து, நீங்கள் அனிமே பக்கத்திற்கு திருப்பிவிடப்படுவீர்கள்.",
            btn2Text: "விளம்பரங்களைத் தவிர் 1 (24 மணி)",
            btn3Text: "விளம்பரங்களைத் தவிர் 2 (12 மணி)",
            warningText: "விளம்பரத் தடுப்பு கண்டறியப்பட்டால், உங்கள் சாதன அமைப்புகளில் தனிப்பட்ட DNS ஐ முடக்கவும்.",
            loading: "ஏற்றுகிறது...",
            oneHourWarning: "⏰ 1 மணி மட்டுமே உள்ளது! <b>உங்கள் சரிபார்ப்பு விரைவில் காலாவதியாகும்.</b>",
            expiresAt: "காலாவதியாகும் நேரம்:"
        }
    };

    let currentLang = localStorage.getItem("selectedLanguage") || "en";
    initAntiBypassProtection();

    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        localStorage.removeItem("oneHourLeftNotificationShown");
    }

    // 1-hour warning
    (function checkOneHourLeftNotification() {
        const verifiedUntil = localStorage.getItem("verifiedUntil");
        if (verifiedUntil) {
            const timeLeft = verifiedUntil - Date.now();
            const oneHour = 60 * 60 * 1000;
            if (timeLeft > 0 && timeLeft <= oneHour && localStorage.getItem("oneHourLeftNotificationShown") !== "yes") {
                showOneHourLeftNotification(verifiedUntil);
                localStorage.setItem("oneHourLeftNotificationShown", "yes");
            }
            if (timeLeft > oneHour) {
                localStorage.removeItem("oneHourLeftNotificationShown");
            }
        }
    })();

    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        const verificationType = localStorage.getItem("verificationType") || "24h";
        const duration = verificationType === "12h" ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        localStorage.setItem("verifiedUntil", currentTime + duration);
        localStorage.removeItem("verificationType");
        window.location.href = BASE_URL;
        return;
    }

    const newToken = storedToken || generateToken();
    localStorage.setItem("userToken", newToken);
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // Starfield + Overlay
    const starfield = document.createElement('canvas');
    starfield.id = 'starfield';
    starfield.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
    document.body.appendChild(starfield);
    initStarfield(starfield);

    const overlay = document.createElement('div');
    overlay.id = 'verification-overlay';
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:998;
        animation:fadeIn 0.5s ease-out;`;
    document.body.appendChild(overlay);

    // Popup (without LinkShortify button)
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
                <img src="https://cdn-icons-png.flaticon.com/512/13906/13906221.png" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"/>
                <span data-translate="tutorialLink">${translations[currentLang].tutorialLink}</span>
            </a>
        </div>

        <p class="description" data-translate="description">${translations[currentLang].description}</p>

        <div class="buttons">
            <div class="btn-wrapper" id="btn-wrapper-2">
                <button class="btn btn-2" id="verify-btn2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0
                             105.656 5.656l1.102-1.101m-.758-4.899a4 4
                             0 005.656 0l4-4a4 4 0
                             00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <span class="btn-text" data-translate="btn2Text">${translations[currentLang].btn2Text}</span>
                    <p class="btn-note">GPLinks</p>
                </button>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-3">
                <button class="btn btn-3" id="verify-btn3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <span class="btn-text" data-translate="btn3Text">${translations[currentLang].btn3Text}</span>
                    <p class="btn-note">AroLinks</p>
                </button>
            </div>
        </div>

        <div class="warning">
            <p>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54
                        0 2.502-1.667 1.732-3L13.732
                        4c-.77-1.333-2.694-1.333-3.464
                        0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span data-translate="warningText">${translations[currentLang].warningText}</span>
            </p>
        </div>

        <div class="progress-container">
            <div class="progress-bar"></div>
        </div>
    `;
    document.body.appendChild(popup);

    // Fetch config
    let config;
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt"
        );
        config = await response.json();
    } catch (error) {
        console.error("Error fetching config:", error);
        config = { GPLINKS: "on", NEWAPI: "on" };
    }

    if (config.GPLINKS === "n" || config.GPLINKS === "off") {
        document.getElementById("btn-wrapper-2").classList.add("hidden");
    }
    if (config.NEWAPI === "n" || config.NEWAPI === "off") {
        document.getElementById("btn-wrapper-3").classList.add("hidden");
    }

    // Language switching
    const langTabs = document.querySelectorAll('.lang-tab');
    langTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            langTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const selectedLang = this.getAttribute('data-lang');
            currentLang = selectedLang;
            localStorage.setItem("selectedLanguage", selectedLang);
            updateLanguage(selectedLang);
        });
    });

    function updateLanguage(lang) {
        const trans = translations[lang];
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (trans[key]) el.innerHTML = trans[key];
        });
    }

    // Button 1: GPLinks (24h)
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        const btnTextElement = this.querySelector('.btn-text');
        const originalText = btnTextElement.innerHTML;
        btnTextElement.innerHTML = translations[currentLang].loading;
        this.style.transform = 'scale(0.97)';
        this.style.opacity = '0.7';

        localStorage.setItem("verificationType", "24h");
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        if (shortURL !== verificationURL) {
            window.location.href = shortURL;
        } else {
            btnTextElement.innerHTML = originalText;
            this.disabled = false;
            this.style.opacity = '1';
        }
    });

    // Button 2: AroLinks (12h)
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        const btnTextElement = this.querySelector('.btn-text');
        const originalText = btnTextElement.innerHTML;
        btnTextElement.innerHTML = translations[currentLang].loading;
        this.style.transform = 'scale(0.97)';
        this.style.opacity = '0.7';

        localStorage.setItem("verificationType", "12h");
        const shortURL = await getShortenedURLWithAroLinks(verificationURL);
        if (shortURL !== verificationURL) {
            window.location.href = shortURL;
        } else {
            btnTextElement.innerHTML = originalText;
            this.disabled = false;
            this.style.opacity = '1';
        }
    });

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURLWithGPLinks(longURL) {
        try {
            const response = await fetch(`https://api.gplinks.com/api?api=${GPLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
            else {
                showErrorNotification(data.message || "GPLinks API Error. Please try another option.");
                return longURL;
            }
        } catch (error) {
            showErrorNotification("Network error with GPLinks. Please try another option.");
            console.error("GPLinks Error:", error);
            return longURL;
        }
    }

    async function getShortenedURLWithAroLinks(longURL) {
        try {
            const response = await fetch(`https://arolinks.com/api?api=${AROLINKS_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) return data.shortenedUrl;
            else {
                showErrorNotification(data.message || "AroLinks API Error. Please try another option.");
                return longURL;
            }
        } catch (error) {
            showErrorNotification("Network error with AroLinks. Please try another option.");
            console.error("AroLinks Error:", error);
            return longURL;
        }
    }

    // Notifications + Starfield + AntiBypass (same as before) ...
    // [Keep your existing functions: showOneHourLeftNotification, showErrorNotification, initAntiBypassProtection, showDevToolsWarning, initStarfield]
}
