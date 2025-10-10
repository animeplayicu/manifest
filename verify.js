export default async function verifyUser() {
    const GPLINKS_API_TOKEN = "04b19e74ad5badb47de460b8dc774b2d7d4a8dd0";
    const GPLINKS2_API_TOKEN = "dbd508517acd20ccd73cd6f2032276090810c005";
    const LINKSHORTIFY_API_TOKEN = "d96783da35322933221e17ba8198882034a07a34";
    const BASE_URL = window.location.href.split("?verify=")[0];
    
    // In-memory storage instead of localStorage
    let userToken = "";
    let verifiedUntil = 0;
    let oneHourNotificationShown = false;
    
    const currentTime = Date.now();

    // Translations
    const translations = {
        en: {
            title: "Skip Ad once and Enjoy Unlimited Ad Free Anime Streaming till 12 A.M IST.",
            description: "Click on below Button and Go to another site and follow steps displayed there and finally you will be redirected to the Anime page.",
            btnPrimary: "Skip Ads and Enjoy",
            serverText: "If the above server doesn't work. Try the below server",
            btnSecondary: "Skip Ads and Enjoy Server 2",
            tutorial: "Skip Ads tutorial",
            adBlocker: "If AdBlocker detected then disable PrivateDNS in your device settings.",
            link1: "GPLinks Verification",
            link2: "GPLinks Alt Verification",
            link3: "LinkShortify Verification"
        },
        hi: {
            title: "एक बार विज्ञापन छोड़ें और 12 बजे IST तक असीमित विज्ञापन मुक्त एनीमे स्ट्रीमिंग का आनंद लें।",
            description: "नीचे दिए गए बटन पर क्लिक करें और दूसरी साइट पर जाएं और वहां दिखाए गए चरणों का पालन करें और अंत में आपको एनीमे पेज पर रीडायरेक्ट किया जाएगा।",
            btnPrimary: "विज्ञापन छोड़ें और आनंद लें",
            serverText: "यदि उपरोक्त सर्वर काम नहीं करता है। नीचे दिए गए सर्वर को आज़माएं",
            btnSecondary: "विज्ञापन छोड़ें और सर्वर 2 का आनंद लें",
            tutorial: "विज्ञापन ट्यूटोरियल छोड़ें",
            adBlocker: "यदि AdBlocker का पता चला है तो अपनी डिवाइस सेटिंग में PrivateDNS को अक्षम करें।",
            link1: "GPLinks सत्यापन",
            link2: "GPLinks वैकल्पिक सत्यापन",
            link3: "LinkShortify सत्यापन"
        },
        te: {
            title: "ఒకసారి ప్రకటనను దాటవేయండి మరియు 12 A.M IST వరకు అపరిమిత ప్రకటన రహిత యానిమే స్ట్రీమింగ్‌ను ఆనందించండి.",
            description: "దిగువ బటన్‌పై క్లిక్ చేసి మరొక సైట్‌కి వెళ్లి అక్కడ ప్రదర్శించబడే దశలను అనుసరించండి మరియు చివరకు మీరు యానిమే పేజీకి మళ్లించబడతారు.",
            btnPrimary: "ప్రకటనలను దాటవేయండి మరియు ఆనందించండి",
            serverText: "పై సర్వర్ పని చేయకపోతే. దిగువ సర్వర్‌ని ప్రయత్నించండి",
            btnSecondary: "ప్రకటనలను దాటవేయండి మరియు సర్వర్ 2ని ఆనందించండి",
            tutorial: "ప్రకటనల ట్యుటోరియల్‌ను దాటవేయండి",
            adBlocker: "AdBlocker గుర్తించబడితే, మీ పరికర సెట్టింగ్‌లలో PrivateDNSని నిలిపివేయండి.",
            link1: "GPLinks ధృవీకరణ",
            link2: "GPLinks ప్రత్యామ్నాయ ధృవీకరణ",
            link3: "LinkShortify ధృవీకరణ"
        },
        ta: {
            title: "ஒரு முறை விளம்பரத்தைத் தவிர்த்து, 12 A.M IST வரை வரம்பற்ற விளம்பர இல்லாத அனிமே ஸ்ட்ரீமிங்கை அனுபவிக்கவும்.",
            description: "கீழே உள்ள பொத்தானைக் கிளிக் செய்து மற்றொரு தளத்திற்குச் சென்று அங்கு காட்டப்படும் படிகளைப் பின்பற்றவும், இறுதியாக நீங்கள் அனிமே பக்கத்திற்கு திருப்பிவிடப்படுவீர்கள்.",
            btnPrimary: "விளம்பரங்களைத் தவிர்த்து அனுபவிக்கவும்",
            serverText: "மேலே உள்ள சர்வர் வேலை செய்யவில்லை என்றால். கீழே உள்ள சர்வரை முயற்சிக்கவும்",
            btnSecondary: "விளம்பரங்களைத் தவிர்த்து சர்வர் 2ஐ அனுபவிக்கவும்",
            tutorial: "விளம்பரங்களைத் தவிர்க்கும் பயிற்சி",
            adBlocker: "AdBlocker கண்டறியப்பட்டால், உங்கள் சாதன அமைப்புகளில் PrivateDNSஐ முடக்கவும்.",
            link1: "GPLinks சரிபார்ப்பு",
            link2: "GPLinks மாற்று சரிபார்ப்பு",
            link3: "LinkShortify சரிபார்ப்பு"
        }
    };

    let currentLang = 'en';

    // Check if already verified
    if (verifiedUntil && currentTime < verifiedUntil) {
        if (window.location.href.includes("&verify=")) {
            window.location.href = BASE_URL;
        }
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("verify");

    if (urlToken && urlToken === userToken) {
        verifiedUntil = currentTime + 24 * 60 * 60 * 1000;
        window.location.href = BASE_URL;
        return;
    }

    const newToken = userToken || generateToken();
    userToken = newToken;
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // Apply background blur
    function applyBackgroundBlur() {
        let blur = document.getElementById("verification-overlay");
        if (!blur) {
            blur = document.createElement('div');
            blur.id = "verification-overlay";
            blur.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(12px);
                z-index: 9998;
            `;
            document.body.appendChild(blur);
        }
    }
    applyBackgroundBlur();

    // Create popup
    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="verify-container">
            <div class="verify-header">
                <div class="lang-switcher">
                    <button class="lang-btn active" data-lang="en">English</button>
                    <button class="lang-btn" data-lang="hi">Hindi</button>
                    <button class="lang-btn" data-lang="te">Telugu</button>
                    <button class="lang-btn" data-lang="ta">Tamil</button>
                </div>
            </div>
            
            <div class="verify-content">
                <h1 class="verify-title" id="verify-title"></h1>
                <p class="verify-description" id="verify-description"></p>
                
                <button class="verify-btn-primary" id="verify-btn-primary">
                    <span id="btn-primary-text"></span>
                </button>
                
                <p class="server-text" id="server-text"></p>
                
                <button class="verify-btn-secondary" id="verify-btn-secondary">
                    <span id="btn-secondary-text"></span>
                </button>
                
                <a href="https://www.animeplay.icu/p/how-to-verify.html" target="_blank" class="tutorial-link" id="tutorial-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span id="tutorial-text"></span>
                </a>
                
                <p class="adblocker-text" id="adblocker-text"></p>
                
                <div class="verify-links">
                    <div class="verify-link-item">
                        <button class="verify-link-btn" id="verify-btn1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span id="link1-text"></span>
                        </button>
                        <span class="link-name" id="link1-name"></span>
                    </div>
                    
                    <div class="verify-link-item">
                        <button class="verify-link-btn" id="verify-btn2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span id="link2-text"></span>
                        </button>
                        <span class="link-name" id="link2-name"></span>
                    </div>
                    
                    <div class="verify-link-item">
                        <button class="verify-link-btn" id="verify-btn3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span id="link3-text"></span>
                        </button>
                        <span class="link-name" id="link3-name"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Inject CSS
    const style = document.createElement("style");
    style.innerHTML = `
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
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
            z-index: 9998;
        }
        
        #verification-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            width: 90%;
            max-width: 680px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .verify-container {
            background: linear-gradient(145deg, #1a2332 0%, #0f1419 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .verify-header {
            background: rgba(255, 255, 255, 0.05);
            padding: 16px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .lang-switcher {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .lang-btn {
            background: rgba(255, 255, 255, 0.08);
            color: #a0aec0;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .lang-btn:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
        }
        
        .lang-btn.active {
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
        }
        
        .verify-content {
            padding: 32px 24px;
        }
        
        .verify-title {
            color: #ffffff;
            font-size: 22px;
            font-weight: 600;
            line-height: 1.5;
            margin-bottom: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .verify-description {
            color: #cbd5e1;
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 24px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .verify-btn-primary,
        .verify-btn-secondary {
            width: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .verify-btn-primary:hover,
        .verify-btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .verify-btn-primary:active,
        .verify-btn-secondary:active {
            transform: translateY(0);
        }
        
        .server-text {
            color: #94a3b8;
            font-size: 14px;
            text-align: center;
            margin: 20px 0 16px 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .tutorial-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #a78bfa;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 16px;
            transition: color 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .tutorial-link:hover {
            color: #c4b5fd;
        }
        
        .adblocker-text {
            color: #f87171;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 24px;
            padding: 12px;
            background: rgba(248, 113, 113, 0.1);
            border-radius: 8px;
            border-left: 3px solid #f87171;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .verify-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }
        
        .verify-link-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .verify-link-btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 14px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        .verify-link-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        
        .verify-link-btn:active {
            transform: translateY(0);
        }
        
        .link-name {
            color: #94a3b8;
            font-size: 12px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .hidden {
            display: none !important;
        }
        
        @media (max-width: 640px) {
            .verify-content {
                padding: 24px 20px;
            }
            
            .verify-title {
                font-size: 18px;
            }
            
            .verify-description {
                font-size: 14px;
            }
            
            .verify-links {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    // Update text function
    function updateText(lang) {
        const t = translations[lang];
        document.getElementById('verify-title').textContent = t.title;
        document.getElementById('verify-description').textContent = t.description;
        document.getElementById('btn-primary-text').textContent = t.btnPrimary;
        document.getElementById('server-text').textContent = t.serverText;
        document.getElementById('btn-secondary-text').textContent = t.btnSecondary;
        document.getElementById('tutorial-text').textContent = t.tutorial;
        document.getElementById('adblocker-text').textContent = t.adBlocker;
        document.getElementById('link1-text').textContent = '✓ Verify Now 1';
        document.getElementById('link2-text').textContent = '✓ Verify Now 2';
        document.getElementById('link3-text').textContent = '✓ Verify Now 3';
        document.getElementById('link1-name').textContent = t.link1;
        document.getElementById('link2-name').textContent = t.link2;
        document.getElementById('link3-name').textContent = t.link3;
    }

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLang = this.dataset.lang;
            updateText(currentLang);
        });
    });

    // Initial text
    updateText('en');

    // Fetch config
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

    if (config.GPLINKS === "n") {
        document.querySelector('.verify-link-item:nth-child(1)').classList.add("hidden");
    }
    if (config.LINKSHORTIFY === "n") {
        document.querySelector('.verify-link-item:nth-child(3)').classList.add("hidden");
    }

    // Button event listeners
    document.getElementById("verify-btn-primary").addEventListener("click", async function() {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

    document.getElementById("verify-btn-secondary").addEventListener("click", async function() {
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
        window.location.href = shortURL;
    });

    document.getElementById("verify-btn1").addEventListener("click", async function() {
        const shortURL = await getShortenedURLWithGPLinks(verificationURL);
        window.location.href = shortURL;
    });

    document.getElementById("verify-btn2").addEventListener("click", async function() {
        const shortURL = await getShortenedURLWithGPLinks2(verificationURL);
        window.location.href = shortURL;
    });

    document.getElementById("verify-btn3").addEventListener("click", async function() {
        const shortURL = await getShortenedURLWithLinkShortify(verificationURL);
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
}
