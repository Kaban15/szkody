/**
 * Cookie consent banner. Blocks GA4 until user accepts.
 * Stores preference in localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    const consent = localStorage.getItem('cookie-consent');

    if (!consent) {
        banner.classList.remove('hidden');
    } else if (consent === 'accepted') {
        loadAnalytics();
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            banner.classList.add('hidden');
            loadAnalytics();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'rejected');
            banner.classList.add('hidden');
        });
    }

    function loadAnalytics() {
        // Load GA4 script dynamically
        if (document.getElementById('ga4-script')) return;
        const GA_ID = 'G-XXXXXXXXXX'; // Replace with real GA4 ID
        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
    }
});
