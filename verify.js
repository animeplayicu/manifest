<!-- Updated Verification Popup -->
<div class="modal">
    <!-- Close button -->
    <div class="close-btn" onclick="closeModal()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </div>

    <!-- Language tabs -->
    <div class="lang-tabs">
        <div class="lang-tab active" data-lang="en">English</div>
        <div class="lang-tab" data-lang="hi">हिंदी</div>
        <div class="lang-tab" data-lang="te">తెలుగు</div>
        <div class="lang-tab" data-lang="ta">தமிழ்</div>
    </div>

    <!-- Content -->
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
        Click on the button below, go to another site, follow the steps shown there, and you'll be redirected back to the anime page.
    </p>

    <!-- Buttons -->
    <div class="buttons">
        <div class="btn-wrapper">
            <button class="btn btn-1" onclick="startSkip('linkshortify')">
                <span class="btn-text">Skip Ads 1 (24h)</span>
            </button>
            <p class="btn-note">Uses LinkShortify API</p>
        </div>

        <div class="btn-wrapper">
            <button class="btn btn-2" onclick="startSkip('gplinks')">
                <span class="btn-text">Skip Ads 2 (24h)</span>
            </button>
            <p class="btn-note">Uses GPLinks API</p>
        </div>

        <div class="btn-wrapper">
            <button class="btn btn-3" onclick="startSkip('arolinks')">
                <span class="btn-text">Skip Ads 3 (12h)</span>
            </button>
            <p class="btn-note">Uses Custom API</p>
        </div>
    </div>
</div>

<script>
    // Language tab switching
    const langTabs = document.querySelectorAll('.lang-tab');
    langTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            langTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // Optional: set language for OG verify system
            localStorage.setItem('userLang', this.dataset.lang);
        });
    });

    // Close modal
    function closeModal() {
        document.querySelector('.modal').style.display = 'none';
        document.querySelector('.overlay').style.display = 'none';
    }

    // Button skip actions
    function startSkip(apiName) {
        // Example: original OG verify logic triggers here
        console.log('Skip via API:', apiName);
        // Call original OG verify function
        if (typeof verifyUser === 'function') verifyUser(apiName);
    }
</script>
