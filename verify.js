<script>
const SHOW_BTN1 = "on"; // LinkShortify 24h
const SHOW_BTN2 = "on"; // GPLinks 24h
const SHOW_BTN3 = "on"; // AroLinks 12h

const TOKEN_KEY = "userToken";
const VERIFY_KEY = "verifiedUntil";

const BASE_URL = window.location.href.split("?verify=")[0];
let storedToken = localStorage.getItem(TOKEN_KEY);
let storedVerified = localStorage.getItem(VERIFY_KEY);
const now = Date.now();

// Clear old 1h notification if expired
if (storedVerified && now > storedVerified) {
    localStorage.removeItem("oneHourLeftNotificationShown");
}

// 1h left notification (optional)
(function checkOneHourLeftNotification() {
    const verifiedUntil = localStorage.getItem(VERIFY_KEY);
    if (verifiedUntil) {
        const timeLeft = verifiedUntil - Date.now();
        const oneHour = 60*60*1000;
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
}

// Token from URL
const urlParams = new URLSearchParams(window.location.search);
const userToken = urlParams.get("verify");

if (userToken && userToken === storedToken) {
    localStorage.setItem(VERIFY_KEY, now + 24*60*60*1000);
    window.location.href = BASE_URL;
}

// Generate token if not exist
if (!storedToken) {
    storedToken = Math.random().toString(36).substr(2, 10);
    localStorage.setItem(TOKEN_KEY, storedToken);
}

// === BUTTON VISIBILITY ===
if (SHOW_BTN1 !== "on") document.querySelector(".btn-1")?.classList.add("hidden");
if (SHOW_BTN2 !== "on") document.querySelector(".btn-2")?.classList.add("hidden");
if (SHOW_BTN3 !== "on") document.querySelector(".btn-3")?.classList.add("hidden");

// === BUTTON CLICK HANDLERS ===
document.querySelector(".btn-1")?.addEventListener("click", async () => {
    localStorage.setItem(VERIFY_KEY, Date.now() + 24*60*60*1000);
    window.location.href = `https://linkshortify.com/?verify=${storedToken}`;
});

document.querySelector(".btn-2")?.addEventListener("click", async () => {
    localStorage.setItem(VERIFY_KEY, Date.now() + 24*60*60*1000);
    window.location.href = `https://gplinks.com/?verify=${storedToken}`;
});

document.querySelector(".btn-3")?.addEventListener("click", async () => {
    localStorage.setItem(VERIFY_KEY, Date.now() + 12*60*60*1000);
    window.location.href = `https://arolinks.com/?verify=${storedToken}`;
});

// === 1 HOUR LEFT POPUP ===
function showOneHourLeftNotification(expirationTime){
    if(localStorage.getItem("oneHourLeftNotificationShown")==="yes") return;
    const formattedTime = new Date(Number(expirationTime)).toLocaleTimeString();
    const notice = document.createElement('div');
    notice.id = 'verify-1h-warning';
    notice.innerHTML = `⏰ Only 1 hour left! <b>Your verification will expire soon.</b><br>
        <span style="font-size:15px;opacity:0.87;">Expires at: ${formattedTime}</span>
        <button id="verify-1h-done-btn">OK</button>`;
    document.body.appendChild(notice);
    document.getElementById('verify-1h-done-btn').onclick = () => notice.remove();
    setTimeout(()=>{if(notice.parentNode) notice.remove();},12000);
    localStorage.setItem("oneHourLeftNotificationShown","yes");
}

// === DEVTOOLS / F12 PREVENTION ===
document.addEventListener("keydown",(e)=>{
    if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="C"||e.key==="J"))||(e.ctrlKey&&e.key==="U")){
        e.preventDefault();
        alert("Sorry! This action is disabled.");
    }
});
document.addEventListener("contextmenu", e => e.preventDefault());

// === OPTIONAL: ANIMATION BUTTON EFFECTS ===
document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', function(){
        this.style.transform='scale(0.97)';
        setTimeout(()=>{this.style.transform='';},150);
    });
});
</script>
