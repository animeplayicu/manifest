export default async function verifyUser() {
    // API TOKENS
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const AROLINKS_API_TOKEN = "98b5522d34aba1ef83a9197dd406ecfbfc6f8629";
    
    const BASE_URL = window.location.href.split("?verify=")[0];
    const storedToken = localStorage.getItem("userToken");
    const storedVerificationTime = localStorage.getItem("verifiedUntil");
    const currentTime = Date.now();

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

    if (storedVerificationTime && currentTime < storedVerificationTime) {
        if (window.location.href.includes("&verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        // Check verification type for duration (12h or 24h)
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
        <div class="close-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </div>

        <div class="lang-tabs">
            <div class="lang-tab active">English</div>
            <div class="lang-tab">हिंदी</div>
            <div class="lang-tab">తెలుగు</div>
            <div class="lang-tab">தமிழ்</div>
        </div>

        <h1 class="title">Skip Ads once and Enjoy Unlimited Anime Free Watch/Download.</h1>

        <div class="tutorial-link">
            <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                How To Skip Ads Tutorial
            </a>
        </div>

        <p class="description">
            Click on any button below, complete the verification, and you'll be redirected back to the anime page.
        </p>

        <div class="buttons">
            <div class="btn-wrapper" id="btn-wrapper-1">
                <button class="btn btn-1" id="verify-btn1">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                    </svg>
                    <span class="btn-text">Skip Ads 1 (24h)</span>
                </button>
                <p class="btn-note">Uses LinkShortify API</p>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-2">
                <button class="btn btn-2" id="verify-btn2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <span class="btn-text">Skip Ads 2 (24h)</span>
                </button>
                <p class="btn-note">Uses GPLinks API</p>
            </div>

            <div class="btn-wrapper" id="btn-wrapper-3">
                <button class="btn btn-3" id="verify-btn3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <span class="btn-text">Skip Ads 3 (12h)</span>
                </button>
                <p class="btn-note">Uses AroLinks API</p>
            </div>
        </div>

        <div class="warning">
            <p>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>If AdBlocker detected, please disable PrivateDNS in your device settings.</span>
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
            max-height: 90vh;
            overflow-y: auto;
            background: linear-gradient(135deg, rgba(26, 0, 31, 0.95), rgba(20, 10, 30, 0.95));
            border-radius: 24px;
            padding: 36px 32px;
            border: 1px solid rgba(123, 31, 162, 0.4);
            box-shadow: 
                0 25px 80px rgba(0, 0, 0, 0.6),
                0 0 100px rgba(123, 31, 162, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Poppins', sans-serif;
        }

        /* Custom Scrollbar */
        #verification-popup::-webkit-scrollbar {
            width: 8px;
        }

        #verification-popup::-webkit-scrollbar-track {
            background: rgba(123, 31, 162, 0.1);
            border-radius: 10px;
        }

        #verification-popup::-webkit-scrollbar-thumb {
            background: rgba(123, 31, 162, 0.5);
            border-radius: 10px;
        }

        #verification-popup::-webkit-scrollbar-thumb:hover {
            background: rgba(123, 31, 162, 0.7);
        }

        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #888;
            z-index: 10;
        }

        .close-btn:hover {
            background: rgba(123, 31, 162, 0.3);
            border-color: rgba(123, 31, 162, 0.6);
            color: #fff;
            transform: rotate(90deg);
        }

        .close-btn svg {
            width: 20px;
            height: 20px;
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
            text-decoration: none;
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
            gap: 14px;
            margin-bottom: 24px;
        }

        .btn-wrapper {
            position: relative;
        }

        .btn {
            width: 100%;
            padding: 18px 24px;
            background: linear-gradient(135deg, rgba(123, 31, 162, 0.8), rgba(156, 39, 176, 0.8));
            border: 1px solid rgba(156, 39, 176, 0.5);
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
            color: #777;
            font-size: 12px;
        }

        .btn-1 {
            background: linear-gradient(135deg, rgba(123, 31, 162, 0.9), rgba(156, 39, 176, 0.9));
        }

        .btn-2 {
            background: linear-gradient(135deg, rgba(106, 27, 154, 0.9), rgba(142, 36, 170, 0.9));
        }

        .btn-3 {
            background: linear-gradient(135deg, rgba(74, 20, 140, 0.9), rgba(106, 27, 154, 0.9));
        }

        .warning {
            background: rgba(255, 152, 0, 0.12);
            border: 1px solid rgba(255, 152, 0, 0.4);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 24px;
        }

        .warning p {
            color: #ffb74d;
            font-size: 13px;
            line-height: 1.6;
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

            .close-btn {
                top: 16px;
                right: 16px;
                width: 32px;
                height: 32px;
            }

            .close-btn svg {
                width: 18px;
                height: 18px;
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

            /* Hide glow orbs on mobile for performance */
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
        // Default config if fetch fails
        config = { LINKSHORTIFY: "on", GPLINKS: "on", NEWAPI: "on" };
    }

    // Apply show/hide based on config
    if (config.LINKSHORTIFY === "n" || config.LINKSHORTIFY === "off") {
        document.getElementById("btn-wrapper-1").classList.add("hidden");
    }
    if (config.GPLINKS === "n" || config.GPLINKS === "off") {
        document.getElementById("btn-wrapper-2").classList.add("hidden");
    }
    if (config.NEWAPI === "n" || config.NEWAPI === "off") {
        document.getElementById("btn-wrapper-3").classList.add("hidden");
    }

    // Language tab switching
    const langTabs = document.querySelectorAll('.lang-tab');
    langTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            langTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close button functionality
    document.querySelector('.close-btn').addEventListener('click', () => {
        popup.style.animation = 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
        overlay.style.animation = 'fadeIn 0.4s ease-out reverse';
        setTimeout(() => {
            console.log('Modal closed by user');
        }, 400);
    });

    // Close on overlay click
    overlay.addEventListener('click', () => {
        popup.style.animation = 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
        overlay.style.animation = 'fadeIn 0.4s ease-out reverse';
    });

    // Prevent modal close when clicking inside
    popup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Button 1: LinkShortify (24h)
    document.getElementById("verify-btn1").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        const originalText = this.querySelector('.btn-text').innerHTML;
        this.querySelector('.btn-text').innerHTML = 'Loading...';
        this.style.transform = 'scale(0.97)';
        this.style.opacity = '0.7';
        
        localStorage.setItem("verificationType", "24h");
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
        if (shortURL !== verificationURL) {
            window.location.href = shortURL;
        } else {
            this.querySelector('.btn-text').innerHTML = originalText;
            this.disabled = false;
            this.style.opacity = '1';
        }
    });
    
    // Button 2: GPLinks (24h)
    document.getElementById("verify-btn2").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        const originalText = this.querySelector('.btn-text').innerHTML;
        this.querySelector('.btn-text').innerHTML = 'Loading...';
        this.style.transform = 'scale(0.97)';
        this.style.opacity = '0.7';
        
        localStorage.setItem("verificationType", "24h");
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        if (shortURL !== verificationURL) {
            window.location.href = shortURL;
        } else {
            this.querySelector('.btn-text').innerHTML = originalText;
            this.disabled = false;
            this.style.opacity = '1';
        }
    });
    
    // Button 3: AroLinks (12h)
    document.getElementById("verify-btn3").addEventListener("click", async function () {
        if (this.disabled) return;
        this.disabled = true;
        const originalText = this.querySelector('.btn-text').innerHTML;
        this.querySelector('.btn-text').innerHTML = 'Loading...';
        this.style.transform = 'scale(0.97)';
        this.style.opacity = '0.7';
        
        localStorage.setItem("verificationType", "12h");
        const shortURL = await getShortenedURLWithAroLinks(verificationURL);
        if (shortURL !== verificationURL) {
            window.location.href = shortURL;
        } else {
            this.querySelector('.btn-text').innerHTML = originalText;
            this.disabled = false;
            this.style.opacity = '1';
        }
    });

    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURLWithLinkShortify(longURL) {
        try {
            const response = await fetch(`https://linkshortify.com/api?api=${LINKSHORTIFY_API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                showErrorNotification("LinkShortify API Error. Please try another option.");
                return longURL;
            }
        } catch (error) {
            showErrorNotification("Network error with LinkShortify. Please try another option.");
            console.error("LinkShortify Error:", error);
            return longURL;
        }
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
        const notice = document.createElement('div');
        notice.id = 'verify-1h-warning';
        notice.innerHTML = `
            ⏰ Only 1 hour left! <b>Your verification will expire soon.</b><br>
            <span style="font-size:15px;opacity:0.87;">Expires at: ${formattedTime}</span>
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

        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            // Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            // Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            // Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                showDevToolsWarning();
                return false;
            }
        });

        // Detect DevTools open via window size detection
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

        // Check periodically
        setInterval(detectDevTools, 1000);

        // Additional debugger detection
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

        // Auto-remove warning after 3 seconds
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
        const starCount = window.innerWidth < 768 ? 100 : 200; // Less stars on mobile

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
