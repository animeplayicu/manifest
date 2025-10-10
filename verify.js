export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = sessionStorage.getItem("userToken");
    const storedVerificationTime = sessionStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

    // Language content
    const translations = {
        en: {
            heading: "Skip Ads once and Enjoy Unlimited Anime Free Watch/Download for 24h.",
            description: "Click on below Button and Go to another site and follow steps displayed there and finally you will be redirected to the Anime page.",
            btn1: "Skip Ads 1 (24h)",
            serverNote: "If the above server doesn't work. Try the below server",
            btn2: "Skip Ads 2 (24h)",
            btn3: "Skip Ads 3 (12h)",
            tutorial: "How To Skip Ads Tutorial",
            note: "If AdBlocker detected then disable PrivateDNS in your device settings."
        },
        hi: {
            heading: "विज्ञापन छोड़ें और 24 घंटे के लिए असीमित एनीमे देखें/डाउनलोड करें।",
            description: "नीचे दिए गए बटन पर क्लिक करें और दूसरी साइट पर जाएं और वहां दिखाए गए चरणों का पालन करें और अंत में आपको एनीमे पेज पर रीडायरेक्ट किया जाएगा।",
            btn1: "विज्ञापन छोड़ें 1 (24 घंटे)",
            serverNote: "यदि उपरोक्त सर्वर काम नहीं करता है। नीचे दिए गए सर्वर को आज़माएं",
            btn2: "विज्ञापन छोड़ें 2 (24 घंटे)",
            btn3: "विज्ञापन छोड़ें 3 (12 घंटे)",
            tutorial: "विज्ञापन छोड़ने का ट्यूटोरियल",
            note: "यदि AdBlocker का पता चला है तो अपनी डिवाइस सेटिंग्स में PrivateDNS अक्षम करें।"
        },
        ta: {
            heading: "விளம்பரங்களைத் தவிர்த்து 24 மணி நேரம் வரம்பற்ற அனிமேவைப் பார்க்கவும்/பதிவிறக்கவும்.",
            description: "கீழே உள்ள பொத்தானைக் கிளிக் செய்து மற்றொரு தளத்திற்குச் சென்று அங்கு காட்டப்படும் படிகளைப் பின்பற்றவும், இறுதியாக நீங்கள் அனிமே பக்கத்திற்கு திருப்பி விடப்படுவீர்கள்.",
            btn1: "விளம்பரங்களைத் தவிர்க்கவும் 1 (24 மணி)",
            serverNote: "மேலே உள்ள சர்வர் வேலை செய்யவில்லை என்றால். கீழே உள்ள சர்வரை முயற்சிக்கவும்",
            btn2: "விளம்பரங்களைத் தவிர்க்கவும் 2 (24 மணி)",
            btn3: "விளம்பரங்களைத் தவிர்க்கவும் 3 (12 மணி)",
            tutorial: "விளம்பரங்களைத் தவிர்க்கும் பயிற்சி",
            note: "AdBlocker கண்டறியப்பட்டால் உங்கள் சாதன அமைப்புகளில் PrivateDNS ஐ முடக்கவும்."
        },
        te: {
            heading: "ఒకసారి ప్రకటనలను దాటవేయండి మరియు 24 గంటలు అపరిమిత అనిమే చూడండి/డౌన్‌లోడ్ చేయండి.",
            description: "దిగువ బటన్‌పై క్లిక్ చేసి మరొక సైట్‌కు వెళ్లి అక్కడ ప్రదర్శించబడే దశలను అనుసరించండి మరియు చివరగా మీరు అనిమే పేజీకి దారి మళ్లించబడతారు.",
            btn1: "ప్రకటనలను దాటవేయండి 1 (24 గంటలు)",
            serverNote: "పై సర్వర్ పని చేయకపోతే. దిగువ సర్వర్‌ను ప్రయత్నించండి",
            btn2: "ప్రకటనలను దాటవేయండి 2 (24 గంటలు)",
            btn3: "ప్రకటనలను దాటవేయండి 3 (12 గంటలు)",
            tutorial: "ప్రకటనలను దాటవేయడం ట్యుటోరియల్",
            note: "AdBlocker గుర్తించబడితే మీ పరికర సెట్టింగ్‌లలో PrivateDNSని నిలిపివేయండి."
        }
    };

    let currentLang = sessionStorage.getItem("preferredLang") || "en";

    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        sessionStorage.removeItem("oneHourLeftNotificationShown");
    }

    // 1 hour left warning
    (function checkOneHourLeftNotification() {
        const verifiedUntil = sessionStorage.getItem("verifiedUntil");
        if (verifiedUntil) {
            const timeLeft = verifiedUntil - Date.now();
            const oneHour = 60 * 60 * 1000;
            if (
                timeLeft > 0 &&
                timeLeft <= oneHour &&
                sessionStorage.getItem("oneHourLeftNotificationShown") !== "yes"
            ) {
                showOneHourLeftNotification(verifiedUntil);
                sessionStorage.setItem("oneHourLeftNotificationShown", "yes");
            }
            if (timeLeft > oneHour) {
                sessionStorage.removeItem("oneHourLeftNotificationShown");
            }
        }
    })();

    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");
    const verifyDuration = urlParams.get("duration");

    if (userToken && userToken === storedToken) {
        let duration = 24 * 60 * 60 * 1000;
        if (verifyDuration === "12h") {
            duration = 12 * 60 * 60 * 1000;
        }
        sessionStorage.setItem("verifiedUntil", currentTime + duration);
        window.location.href = BASE_URL;
        return;
    }

    const newToken = storedToken || generateToken();
    sessionStorage.setItem("userToken", newToken);
    const verificationURL24h = `${BASE_URL}?verify=${newToken}&duration=24h`;
    const verificationURL12h = `${BASE_URL}?verify=${newToken}&duration=12h`;

    // --- BACKGROUND OVERLAY ---
    const overlay = document.createElement('div');
    overlay.id = "verification-overlay";
    document.body.appendChild(overlay);

    // --- POPUP CREATION ---
    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="verification-container">
            <div class="lang-tabs">
                <div class="lang-tab ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>English</span>
                </div>
                <div class="lang-tab ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>हिंदी</span>
                </div>
                <div class="lang-tab ${currentLang === 'ta' ? 'active' : ''}" data-lang="ta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>தமிழ்</span>
                </div>
                <div class="lang-tab ${currentLang === 'te' ? 'active' : ''}" data-lang="te">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>తెలుగు</span>
                </div>
            </div>
            
            <div class="content">
                
                <h2 class="heading" id="verify-heading"></h2>
                <p class="description" id="verify-description"></p>

                <div class="buttons">
                    <button class="btn btn-primary" id="verify-btn1">
                        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span id="verify-btn1-text"></span>
                    </button>
                    
                    <p class="server-note" id="verify-server-note"></p>
                    
                    <button class="btn btn-secondary" id="verify-btn2">
                        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span id="verify-btn2-text"></span>
                    </button>
                    
                    <button class="btn btn-tertiary" id="verify-btn3">
                        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span id="verify-btn3-text"></span>
                    </button>
                </div>

                <p class="tutorial-link">
                    <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank" id="verify-tutorial">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                    </a>
                </p>

                <div class="note">
                    <svg class="note-icon" width="20" height="20" viewBox="0 0 48 48" fill="currentColor" stroke="none">
                        <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"/>
                    </svg>
                    <p id="verify-note"></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Update content based on language
    function updateLanguage(lang) {
        currentLang = lang;
        sessionStorage.setItem("preferredLang", lang);
        const t = translations[lang];
        
        document.getElementById('verify-heading').textContent = t.heading;
        document.getElementById('verify-description').textContent = t.description;
        document.getElementById('verify-btn1-text').textContent = t.btn1;
        document.getElementById('verify-server-note').textContent = t.serverNote;
        document.getElementById('verify-btn2-text').textContent = t.btn2;
        document.getElementById('verify-btn3-text').textContent = t.btn3;
        document.getElementById('verify-tutorial').innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span>${t.tutorial}</span>
        `;
        document.getElementById('verify-note').innerHTML = `<strong>Note:</strong> ${t.note}`;

        // Update active tab
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.lang === lang) {
                tab.classList.add('active');
            }
        });
    }

    // Initialize with current language
    updateLanguage(currentLang);

    // Language tab switching
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            updateLanguage(this.dataset.lang);
        });
    });

    // CSS INJECTION
    const style = document.createElement("style");
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        #verification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 9998;
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, -45%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
        
        #verification-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            width: 100%;
            max-width: 800px;
            padding: 0 20px;
        }

        .verification-container {
            width: 100%;
            padding: 40px 32px;
            background: rgba(23, 19, 24, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(139, 92, 246, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .lang-tabs {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
            flex-wrap: wrap;
        }

        .lang-tab {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lang-tab svg {
            opacity: 0.7;
        }

        .lang-tab:hover {
            background: rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
            color: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
        }

        .lang-tab.active {
            background: rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
            color: #ffffff;
        }

        .lang-tab.active svg {
            opacity: 1;
        }

        .content {
            text-align: center;
        }

        .heading {
            color: #ffffff;
            font-size: 22px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
        }

        .description {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }

        .server-note {
            color: rgba(255, 255, 255, 0.4);
            font-size: 13px;
            margin: 4px 0;
            font-weight: 500;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px 28px;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Inter', sans-serif;
            position: relative;
            overflow: hidden;
            letter-spacing: -0.01em;
        }

        .btn-icon {
            flex-shrink: 0;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn-tertiary {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-tertiary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
            background: linear-gradient(135deg, #9333ea 0%, #8b5cf6 100%);
        }

        .btn-tertiary:active {
            transform: translateY(0);
        }

        .btn-primary,
        .btn-secondary {
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            color: white;
            box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary:hover,
        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
            background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
        }

        .btn-primary:active,
        .btn-secondary:active {
            transform: translateY(0);
        }

        .tutorial-link {
            margin: 20px 0 0 0;
        }

        .tutorial-link a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #a78bfa;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            padding: 8px 16px;
            border-radius: 8px;
        }

        .tutorial-link a:hover {
            color: #c4b5fd;
            background: rgba(139, 92, 246, 0.1);
        }

        .note {
            display: flex;
            gap: 12px;
            background: rgba(251, 191, 36, 0.08);
            border-left: 3px solid #fbbf24;
            padding: 16px;
            border-radius: 10px;
            margin-top: 28px;
            align-items: flex-start;
        }

        .note-icon {
            flex-shrink: 0;
            stroke: #fbbf24;
            margin-top: 2px;
        }

        .note p {
            color: #fbbf24;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
            text-align: left;
        }

        .note strong {
            font-weight: 600;
        }

        .hidden {
            display: none !important;
        }

        #verify-1h-warning {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #fff;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 19999;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 320px;
            max-width: calc(100vw - 40px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }

        #verify-1h-warning svg {
            flex-shrink: 0;
        }

        #verify-1h-warning button {
            background: #fff;
            color: #dc2626;
            border: none;
            border-radius: 8px;
            padding: 8px 20px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        #verify-1h-warning button:hover {
            background: #fef2f2;
            transform: scale(1.05);
        }

        @media (max-width: 600px) {
            .verification-container {
                padding: 32px 24px;
            }
                
            .heading {
                font-size: 19px;
            }

            .description {
                font-size: 13px;
            }

            .btn {
                padding: 14px 20px;
                font-size: 14px;
                gap: 8px;
            }

            .btn-icon {
                width: 18px;
                height: 18px;
            }

            .lang-tab {
                padding: 7px 12px;
                font-size: 12px;
            }

            .lang-tab svg {
                width: 14px;
                height: 14px;
            }

            #verify-1h-warning {
                font-size: 13px;
                padding: 14px 18px;
                flex-direction: column;
                text-align: center;
                min-width: auto;
                gap: 12px;
            }

            .note {
                padding: 14px;
                gap: 10px;
            }

            .note p {
                font-size: 12px;
            }
        }

        @media (max-width: 400px) {
            #verification-popup {
                padding: 0 16px;
            }

            .verification-container {
                padding: 28px 20px;
            }

            .heading {
                font-size: 17px;
            }

            .lang-tabs {
                gap: 6px;
            }
        }
    `;
    document.head.appendChild(style);

    // Fetch and apply config settings
    let config;
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/animeplayicu/manifest/refs/heads/main/config.txt"
        );
        config = await response.json();
    } catch (error) {
        console.error("Error fetching config:", error);
        config = { GPLINKS: "y", LINKSHORTIFY: "y" };
    }

    if (config.GPLINKS === "n") document.getElementById("verify-btn1").classList.add("hidden");
    if (config.LINKSHORTIFY === "n") document.getElementById("verify-btn3").classList.add("hidden");

    // Button click handlers
    document.getElementById("verify-btn1").addEventListener("click", async function () {
        this.style.transform = 'scale(0.95)';
        const shortURL = await getShortenedURLWithGPLinks(verificationURL24h);
        window.location.href = shortURL;
    });
    
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        this.style.transform = 'scale(0.95)';
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL24h);
        window.location.href = shortURL;
    });
    
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        this.style.transform = 'scale(0.95)';
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL12h);
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

    function showOneHourLeftNotification(expirationTime) {
        if (sessionStorage.getItem("oneHourLeftNotificationShown") === "yes") return;
        const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">Only 1 hour left!</div>
                <div style="font-size: 12px; opacity: 0.9;">Your verification expires at ${formattedTime}</div>
            </div>
            <button id="verify-1h-done-btn">OK</button>
        `;
        document.body.appendChild(notice);
        document.getElementById('verify-1h-done-btn').onclick = () => notice.remove();
        setTimeout(() => {
            if (notice.parentNode) notice.remove();
        }, 12000);
        sessionStorage.setItem("oneHourLeftNotificationShown", "yes");
    }
}
