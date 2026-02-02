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
            btn1Text: "Skip Ads 1 (24h)",
            btn2Text: "Try Free (Session Only)",
            btn3Text: "Skip Ads 2 (12h)",
            warningText: "If AdBlocker detected, please disable PrivateDNS in your device settings.",
            loading: "Loading...",
            tooEarly: "Not too early! Please stay for at least 5 seconds.",
            oneHourWarning: "⏰ Only 1 hour left! <b>Your verification will expire soon.</b>",
            expiresAt: "Expires at:"
        },
        hi: {
            title: "एक बार विज्ञापन छोड़ें और असीमित एनीमे मुफ्त देखें/डाउनलोड करें।",
            tutorialLink: "विज्ञापन कैसे छोड़ें?",
            description: "नीचे किसी भी बटन पर क्लिक करें, सत्यापन पूरा करें, और आपको एनीमे पेज पर वापस भेज दिया जाएगा।",
            btn1Text: "विज्ञापन छोड़ें 1 (24 घंटे)",
            btn2Text: "मुफ्त में आज़माएं (सत्र केवल)",
            btn3Text: "विज्ञापन छोड़ें 2 (12 घंटे)",
            warningText: "यदि एडब्लॉकर का पता चला है, तो कृपया अपनी डिवाइस सेटिंग्स में प्राइवेट DNS अक्षम करें।",
            loading: "लोड हो रहा है...",
            tooEarly: "बहुत जल्दी नहीं! कृपया कम से कम 5 सेकंड रुकें।",
            oneHourWarning: "⏰ केवल 1 घंटा बचा है! <b>आपका सत्यापन जल्द ही समाप्त हो जाएगा।</b>",
            expiresAt: "समाप्ति समय:"
        },
        te: {
            title: "ఒకసారి ప్రకటనలను దాటవేయండి మరియు అపరిమిత అనిమే ఉచితంగా చూడండి/డౌన్‌లోడ్ చేయండి.",
            tutorialLink: "ప్రకటనలను ఎలా దాటవేయాలి?",
            description: "దిగువ ఏదైనా బటన్‌పై క్లిక్ చేయండి, ధృవీకరణ పూర్తి చేయండి మరియు మీరు అనిమే పేజీకి తిరిగి మళ్లించబడతారు.",
            btn1Text: "ప్రకటనలను దాటవేయండి 1 (24 గంటలు)",
            btn2Text: "ఉచితంగా ప్రయత్నించండి (సెషన్ మాత్రమే)",
            btn3Text: "ప్రకటనలను దాటవేయండి 2 (12 గంటలు)",
            warningText: "యాడ్‌బ్లాకర్ కనుగొనబడితే, దయచేసి మీ పరికర సెట్టింగ్‌లలో ప్రైవేట్DNS ని నిలిపివేయండి.",
            loading: "లోడ్ అవుతోంది...",
            tooEarly: "చాలా తొందరగా కాదు! దయచేసి కనీసం 5 సెకన్లు ఉండండి।",
            oneHourWarning: "⏰ కేవలం 1 గంట మిగిలింది! <b>మీ ధృవీకరణ త్వరలో ముగుస్తుంది।</b>",
            expiresAt: "ముగిసే సమయం:"
        },
        ta: {
            title: "விளம்பரங்களை ஒருமுறை தவிர்க்கவும் மற்றும் வரம்பற்ற அனிமேவை இலவசமாக பார்க்கவும்/பதிவிறக்கவும்.",
            tutorialLink: "விளம்பரங்களை எப்படி தவிர்ப்பது?",
            description: "கீழே உள்ள எந்த பொத்தானையும் கிளிக் செய்து, சரிபார்ப்பை முடித்து, நீங்கள் அனிமே பக்கத்திற்கு திருப்பிவிடப்படுவீர்கள்.",
            btn1Text: "விளம்பரங்களைத் தவிர் 1 (24 மணி)",
            btn2Text: "இலவசமாக முயற்சிக்கவும் (அமர்வு மட்டும்)",
            btn3Text: "விளம்பரங்களைத் தவிர் 2 (12 மணி)",
            warningText: "விளம்பரத் தடுப்பு கண்டறியப்பட்டால், உங்கள் சாதன அமைப்புகளில் தனிப்பட்ட DNS ஐ முடக்கவும்.",
            loading: "ஏற்றுகிறது...",
            tooEarly: "மிக விரைவில் இல்லை! குறைந்தது 5 விநாடிகள் தங்குங்கள்.",
            oneHourWarning: "⏰ 1 மணி மட்டுமே உள்ளது! <b>உங்கள் சரிபார்ப்பு விரைவில் காலாவதியாகும்.</b>",
            expiresAt: "காலாவதியாகும் நேரம்:"
        }
    };

    // Get saved language or default to English
    let currentLang = localStorage.getItem("selectedLanguage") || "en";

    // Initialize Anti-Bypass Protection
    initAntiBypassProtection();

    if (storedVerificationTime && Date.now() > storedVerificationTime) {
        localStorage.removeItem("oneHourLeftNotificationShown");
    }

    // 1 hour left warning
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

    // Check if user has temporary session access (Button 2)
    if (sessionStorage.getItem('temporaryAccess') === 'true') {
        // User has clicked "Try Free" button - don't show popup
        return;
    }

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

    // Create starfield canvas
    const starfield = document.createElement('canvas');
    starfield.id = 'starfield';
    starfield.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
    document.body.appendChild(starfield);
    initStarfield(starfield);

    // Create ambient glow orbs
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

    // Create blur overlay
    const overlay = document.createElement('div');
    overlay.id = 'verification-overlay';
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(13,13,15,0.75);backdrop-filter:blur(12px);z-index:998;
        animation:fadeIn 0.5s ease-out;`;
    document.body.appendChild(overlay);

    // Create modal popup
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
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/13906/13906221.png" 
                    alt="Play icon" 
                    width="20" 
                    height="20" 
                    style="vertical-align: middle; margin-right: 6px;"
                />
                <span data-translate="tutorialLink">${translations[currentLang].tutorialLink}</span>
            </a>
        </div>

        <p class="description" data-translate="description">${translations[currentLang].description}</p>

        <div class="buttons">
            <div class="btn-wrapper" id="btn-wrapper-1">
                <button class="btn btn-1" id="verify-btn1">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <span class="btn-text" data-translate="btn1Text">${translations[currentLang].btn1Text}</span><p class="btn-note">GPLinks</p>
                </button>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-2">
                <button class="btn btn-2" id="verify-btn2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="btn-text" data-translate="btn2Text">${translations[currentLang].btn2Text}</span><p class="btn-note">Until Reload</p>
                </button>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-3">
                <button class="btn btn-3" id="verify-btn3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <span class="btn-text" data-translate="btn3Text">${translations[currentLang].btn3Text}</span><p class="btn-note">AroLinks</p>
                </button>
            </div>
        </div>

        <div class="warning">
            <p>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span data-translate="warningText">${translations[currentLang].warningText}</span>
            </p>
        </div>

        <div class="progress-container">
            <div class="progress-bar"></div>
        </div>
    `;
    document.body.appendChild(popup);

    // CSS INJECTION WITH RESPONSIVE DESIGN
    const style = document.createElement("style");
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-30px, 30px) scale(0.9); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, calc(-50% + 40px)) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }

        @keyframes progressFlow {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
        }

        /* PC/Desktop Styles */
        #verification-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999;
            max-width: 480px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            background: linear-gradient(135deg, rgba(26, 0, 31, 0.95), rgba(20, 10, 30, 0.95));
            border-radius: 20px;
            padding: 20px 22px;
            border: 1px solid rgba(123, 31, 162, 0.4);
            box-shadow: 
                0 25px 80px rgba(0, 0, 0, 0.6),
                0 0 100px rgba(123, 31, 162, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Poppins', sans-serif;
        }

        #verification-popup::-webkit-scrollbar {
            width: 0px;
        }

        .lang-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 28px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .lang-tab {
            padding: 8px 18px;
            background: rgba(123, 31, 162, 0.1);
            border: 1px solid rgba(123, 31, 162, 0.3);
            border-radius: 20px;
            color: #aaa;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .lang-tab:hover, .lang-tab.active {
            background: rgba(123, 31, 162, 0.3);
            border-color: rgba(123, 31, 162, 0.6);
            color: #fff;
            box-shadow: 0 0 20px rgba(123, 31, 162, 0.4);
        }

        .title {
            color: #fff;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.5;
            margin-bottom: 16px;
            text-align: center;
        }

        .tutorial-link {
            display: block;
            text-align: center;
            margin-bottom: 20px;
        }

        .tutorial-link a {
            color: #b388ff;
            text-decoration: underline;
            font-size: 14px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(123, 31, 162, 0.15);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .tutorial-link a:hover {
            background: rgba(123, 31, 162, 0.25);
            color: #d1c4e9;
            transform: translateX(4px);
        }

        .tutorial-link svg {
            width: 16px;
            height: 16px;
        }

        .description {
            color: #bbb;
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 24px;
            text-align: center;
        }

        .buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }

        .btn-wrapper {
            position: relative;
        }

        .btn {
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, rgba(123, 31, 162, 0.8), rgba(156, 39, 176, 0.8));
            border: 0.5px solid rgba(156, 39, 176, 0.5);
            border-radius: 12px;
            color: white;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 
                0 6px 20px rgba(123, 31, 162, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 
                0 10px 30px rgba(123, 31, 162, 0.5),
                0 0 50px rgba(123, 31, 162, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            border-color: rgba(156, 39, 176, 0.8);
        }

        .btn:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }

        .btn:active {
            transform: translateY(-1px) scale(0.97);
        }

        .btn svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .btn-text {
            flex: 1;
            text-align: left;
        }

        .btn-note {
            margin-top: 6px;
            margin-left: 32px;
            color: #dbdbdbff;
            font-size: 12px;
        }

        .btn-1 {
            background: linear-gradient(135deg, rgba(106, 27, 154, 0.9), rgba(142, 36, 170, 0.9));
        }

        .btn-2 {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(21, 101, 192, 0.9));
        }

        .btn-3 {
            background: linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(106, 27, 154, 0.9));
        }

        .warning {
            background: rgba(255, 152, 0, 0.12);
            border: 1px solid rgba(255, 152, 0, 0.4);
            border-radius: 12px;
            padding: 0px 10px 0 10px;
            margin-bottom: 24px;
        }

        .warning p {
            color: #ffb74d;
            font-size: 13px;
            line-height: 1.2;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .warning svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .progress-container {
            height: 4px;
            background: rgba(123, 31, 162, 0.2);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #7b1fa2, #9c27b0, #ba68c8, #9c27b0, #7b1fa2);
            background-size: 200% 100%;
            animation: progressFlow 3s linear infinite;
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(123, 31, 162, 0.6);
        }

        .hidden {
            display: none !important;
        }

        #verify-1h-warning {
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4747;
            color: #fff;
            padding: 14px 45px 14px 28px;
            border-radius: 9px;
            z-index: 19999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.18);
            font-size: 17px;
            font-family: 'Poppins', sans-serif;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            min-width: 260px;
            max-width: 90vw;
        }
        
        #verify-1h-warning button {
            margin-left: auto;
            background: #fff;
            color: #b32c2c;
            border: none;
            border-radius: 6px;
            padding: 7px 18px;
            cursor: pointer;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 1px 3px rgba(45,90,50,0.07);
            margin-right: -8px;
            transition: background 0.2s;
        }
        
        #verify-1h-warning button:hover {
            background: #fae7a7;
        }

        #devtools-warning {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
        }

        #devtools-warning .warning-content {
            text-align: center;
            color: #ff4757;
            padding: 40px;
            max-width: 500px;
        }

        #devtools-warning h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }

        #devtools-warning p {
            font-size: 18px;
            color: #fff;
            line-height: 1.6;
        }

        /* TABLET STYLES (768px - 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
            #verification-popup {
                max-width: 500px;
                width: 85%;
                padding: 32px 28px;
            }

            .title {
                font-size: 19px;
            }

            .btn {
                padding: 17px 22px;
                font-size: 14.5px;
            }

            .lang-tab {
                padding: 7px 16px;
                font-size: 12.5px;
            }

            .orb-1, .orb-2 {
                display: block;
            }
        }

        /* MOBILE STYLES (Up to 767px) */
        @media (max-width: 767px) {
            #verification-popup {
                max-width: 95%;
                width: 95%;
                padding: 24px 20px;
                border-radius: 20px;
                max-height: 85vh;
            }

            .lang-tabs {
                gap: 6px;
                margin-bottom: 20px;
            }

            .lang-tab {
                padding: 6px 14px;
                font-size: 11px;
            }

            .title {
                font-size: 17px;
                margin-bottom: 14px;
            }

            .tutorial-link {
                margin-bottom: 16px;
            }

            .tutorial-link a {
                font-size: 13px;
                padding: 7px 14px;
            }

            .tutorial-link svg {
                width: 14px;
                height: 14px;
            }

            .description {
                font-size: 13px;
                margin-bottom: 20px;
            }

            .buttons {
                gap: 12px;
                margin-bottom: 20px;
            }

            .btn {
                padding: 15px 18px;
                font-size: 14px;
                gap: 10px;
            }

            .btn svg {
                width: 18px;
                height: 18px;
            }

            .btn-note {
                margin-left: 28px;
                font-size: 11px;
            }

            .warning {
                padding: 12px 14px;
                margin-bottom: 20px;
            }

            .warning p {
                font-size: 12px;
                gap: 8px;
            }

            .warning svg {
                width: 16px;
                height: 16px;
            }

            #verify-1h-warning {
                top: 20px;
                font-size: 14px;
                padding: 12px 40px 12px 20px;
                min-width: 90%;
                flex-direction: column;
                align-items: flex-start;
            }

            #verify-1h-warning button {
                margin-top: 10px;
                margin-left: 0;
                width: 100%;
            }

            .orb-1, .orb-2 {
                display: none;
            }

            #devtools-warning .warning-content {
                padding: 20px;
            }

            #devtools-warning h1 {
                font-size: 32px;
            }

            #devtools-warning p {
                font-size: 16px;
            }
        }

        /* SMALL MOBILE STYLES (Up to 480px) */
        @media (max-width: 480px) {
            #verification-popup {
                padding: 20px 16px;
            }

            .title {
                font-size: 16px;
            }

            .btn {
                padding: 14px 16px;
                font-size: 13px;
            }

            .lang-tab {
                padding: 6px 12px;
                font-size: 10.5px;
            }
        }
    `;
    document.head.appendChild(style);

    // Fetch and apply GitHub config settings
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

    // Apply show/hide based on config
    if (config.GPLINKS === "n" || config.GPLINKS === "off") {
        document.getElementById("btn-wrapper-1").classList.add("hidden");
    }
    if (config.NEWAPI === "n" || config.NEWAPI === "off") {
        document.getElementById("btn-wrapper-3").classList.add("hidden");
    }

    // Language tab switching with translation update
    const langTabs = document.querySelectorAll('.lang-tab');
    langTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            langTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const selectedLang = this.getAttribute('data-lang');
            currentLang = selectedLang;
            localStorage.setItem("selectedLanguage", selectedLang);
            
            // Update all translatable elements
            updateLanguage(selectedLang);
        });
    });

    function updateLanguage(lang) {
        const trans = translations[lang];
        
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (trans[key]) {
                element.innerHTML = trans[key];
            }
        });
    }

    // Track when page loaded
    const pageLoadTime = Date.now();

    // Button 2: Try Free (Session Only) - Simple bypass without reload
    document.getElementById("verify-btn2").addEventListener("click", function () {
        if (this.disabled) return;
        
        const currentTime = Date.now();
        const timeSincePageLoad = currentTime - pageLoadTime;
        const minimumWaitTime = 5000; // 5 seconds
        
        // Check if user has waited at least 5 seconds
        if (timeSincePageLoad < minimumWaitTime) {
            showErrorNotification(translations[currentLang].tooEarly);
            return;
        }
        
        // User waited long enough - grant temporary access
        sessionStorage.setItem('temporaryAccess', 'true');
        
        // Hide verification popup with fade out animation
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        popup.style.animation = 'fadeOut 0.3s ease-out';
        
        setTimeout(() => {
            overlay.remove();
            popup.remove();
            starfield.remove();
            orb1.remove();
            orb2.remove();
        }, 300);
    });

    // Button 1: GPLinks (24h)
    document.getElementById("verify-btn1").addEventListener("click", async function () {
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
    
    // Button 3: AroLinks (12h)
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
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
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
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                showErrorNotification(data.message || "AroLinks API Error. Please try another option.");
                return longURL;
            }
        } catch (error) {
            showErrorNotification("Network error with AroLinks. Please try another option.");
            console.error("AroLinks Error:", error);
            return longURL;
        }
    }

    function showOneHourLeftNotification(expirationTime) {
        if (localStorage.getItem("oneHourLeftNotificationShown") === "yes") return;
        const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
        const trans = translations[currentLang];
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.innerHTML = `
            ${trans.oneHourWarning}<br>
            <span style="font-size:15px;opacity:0.87;">${trans.expiresAt} ${formattedTime}</span>
            <button id="verify-1h-done-btn">OK</button>
        `;
        document.body.appendChild(notice);
        document.getElementById('verify-1h-done-btn').onclick = () => notice.remove();
        setTimeout(() => {
            if (notice.parentNode) notice.remove();
        }, 12000);
        localStorage.setItem("oneHourLeftNotificationShown", "yes");
    }

    function showErrorNotification(message) {
        const errorNotice = document.createElement('div');
        errorNotice.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff4757, #ff6b81);
            color: #fff;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 20000;
            box-shadow: 0 8px 24px rgba(255, 71, 87, 0.4);
            font-size: 15px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            max-width: 90vw;
            animation: slideDown 0.4s ease-out;
        `;
        errorNotice.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        const animStyle = document.createElement('style');
        animStyle.innerHTML = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%);
                }
            }
        `;
        document.head.appendChild(animStyle);
        
        document.body.appendChild(errorNotice);
        
        setTimeout(() => {
            errorNotice.style.animation = 'slideDown 0.4s ease-out reverse';
            setTimeout(() => errorNotice.remove(), 400);
        }, 4000);
    }

    // ANTI-BYPASS PROTECTION SYSTEM
    function initAntiBypassProtection() {
        let devtoolsOpen = false;

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 123) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
        });

        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    showDevToolsWarning();
                }
            } else {
                devtoolsOpen = false;
            }
        };

        setInterval(detectDevTools, 1000);

        const detectDebugger = () => {
            const before = Date.now();
            debugger;
            const after = Date.now();
            if (after - before > 100) {
                showDevToolsWarning();
            }
        };

        setInterval(detectDebugger, 3000);
    }

    function showDevToolsWarning() {
        if (document.getElementById('devtools-warning')) return;
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'devtools-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h1>⚠️ ACCESS DENIED</h1>
                <p>Developer tools are disabled on this website for security reasons.</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">Please close developer tools to continue.</p>
            </div>
        `;
        document.body.appendChild(warningDiv);

        setTimeout(() => {
            const warning = document.getElementById('devtools-warning');
            if (warning) warning.remove();
        }, 3000);
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
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.fadeSpeed * this.fadeDirection;
                if (this.opacity >= 1 || this.opacity <= 0.3) {
                    this.fadeDirection *= -1;
                }
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
}
