export default async function verifyUser() {
    const API_TOKEN = "10e3de75d9870e644b18d2ad693deca36aae9556"; 
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


    // Check if user is returning after verification
    const urlParams = new URLSearchParams(window.location.search);
    const userToken = urlParams.get("verify");

    if (userToken && userToken === storedToken) {
        localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000); // Store for 24 hrs
        showVerifiedMessage(currentTime + 24 * 60 * 60 * 1000);
        window.location.href = BASE_URL; // Redirect to base URL
        return;
    }

    // Generate a small, unique token for this user
    const newToken = storedToken || generateToken();
    localStorage.setItem("userToken", newToken);

    // Generate the verification URL
    const verificationURL = `${BASE_URL}?verify=${newToken}`;

    // Create verification popup
    const popup = document.createElement("div");
    popup.id = "verification-popup";
    popup.innerHTML = `
        <div class="popup-contentt">
            <h2>🔐 Verification Required</h2>
            <p>To continue, please complete a quick verification. This is to keep our website free forever</p>
            <a id="verify-btn" class="verify-btn">✅ Verify Now</a>
            <h3>Or Enter Redeem Code</h3>
            <input type="text" id="redeem-input" class="redeem-input" placeholder="Enter redeem code" />
            <button id="redeem-btn" class="redeem-btn">Redeem</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Add CSS dynamically
    const style = document.createElement("style");
    style.innerHTML = `
        .popup-contentt {
            padding: 10px;
            background-color: #000;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        }

        #verification-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e;
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
            text-align: center;
            z-index: 1001;
            min-width: 300px;
        }
        .verify-btn, #redeem-btn {
            background: red;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
            cursor: pointer;
        }

        .redeem-input {
            width: 80%;
            padding: 12px 18px;
            margin: 15px 0;
            font-size: 16px;
            border-radius: 8px;
            border: 1px solid #ccc;
            background: #333;
            color: #fff;
            text-align: center;
            outline: none;
            transition: background 0.3s ease;
        }

        .redeem-input:focus {
            background: #444;
            border-color: #ff4b5c;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid transparent;
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 0.45s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .redeem-input {
            width: 80%;
            padding: 12px 18px;
            margin: 15px 0;
            font-size: 16px;
            border-radius: 8px;
            border: 1px solid #ccc;
            background: #333;
            color: #fff;
            text-align: center;
            outline: none;
            transition: background 0.3s ease;
        }

        .redeem-input:focus {
            background: #444;
            border-color: #ff4b5c;
        }
        #verification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "verification-overlay";
    document.body.appendChild(overlay);

    // Handle verification button click
    document.getElementById("verify-btn").addEventListener("click", async function () {
        const shortURL = await getShortenedURL(verificationURL);
        window.location.href = shortURL; // Redirect via Cuty.io
    });

    // Handle redeem button click
    document.getElementById("redeem-btn").addEventListener("click", async function () {
        const redeemCode = document.getElementById("redeem-input").value;
        const redeemBtn = document.getElementById("redeem-btn");

        // Show loading spinner
        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        redeemBtn.innerHTML = "";
        redeemBtn.appendChild(spinner);

        if (redeemCode) {
            const isValid = await validateRedeemCode(redeemCode);
            if (isValid) {
                localStorage.setItem("verifiedUntil", currentTime + 24 * 60 * 60 * 1000); // Store for 24 hrs
                alert("✅ Redeem successful! You are now verified for 24 hours.");
                window.location.href = BASE_URL; // Redirect to base URL
                await deleteRedeemCode(); // Delete the redeem code
            } else {
                alert("❌ Invalid redeem code.");
            }
        } else {
            alert("❌ Please enter a redeem code.");
        }

        // Remove spinner and restore button text
        redeemBtn.innerHTML = "Redeem";
    });

    // Validate redeem code with API
    async function validateRedeemCode(code) {
        try {
            const response = await fetch("https://aniflix-redeem.vercel.app/api/redeem", {
                method: "GET",
            });
            const data = await response.json();
            if (data.redeemCode && data.redeemCode === code) {
                return true;
            }
        } catch (error) {
            console.error("Error validating redeem code:", error);
        }
        return false;
    }    

    async function deleteRedeemCode() {
        try {
            await fetch("https://aniflix-redeem.vercel.app/api/redeem", { method: "POST" });
        } catch (error) {}
    }
    

    // Generate a random 10-character alphanumeric token
    function generateToken() {
        return Math.random().toString(36).substr(2, 10);
    }

    async function getShortenedURL(longURL) {
        try {
            const response = await fetch(`https://api.modijiurl.com/api?api=${API_TOKEN}&url=${encodeURIComponent(longURL)}&alias=${generateToken()}&format=json`);
            const data = await response.json();
            if (data.status === "success" && data.shortenedUrl) {
                return data.shortenedUrl;
            } else {
                console.error("ModijiURL API error:", data);
                return longURL; 
            }
        } catch (error) {
            console.error("Error fetching ModijiURL short link:", error);
            return longURL;
        }
    }


    // Show verified message
    function showVerifiedMessage(expirationTime) {
        if (window.location.href.includes("&verify=")) {
            const formattedTime = new Date(expirationTime).toLocaleString();
            alert(`✅ Now you are verified until ${formattedTime}. Thank you for supporting us!`);
        }
    }
}
