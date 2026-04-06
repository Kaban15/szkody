(function() {
    var DEFAULT_LANG = 'pl';
    var SUPPORTED = ['pl', 'en', 'ua'];
    var FLAG_SVG = {
        pl: '<svg class="w-6 h-4 rounded-sm" viewBox="0 0 640 480"><rect width="640" height="240" fill="#fff"/><rect y="240" width="640" height="240" fill="#dc143c"/></svg>',
        en: '<svg class="w-6 h-4 rounded-sm" viewBox="0 0 640 480"><rect width="640" height="480" fill="#012169"/><path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff"/><path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E"/><path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff"/><path d="M273 0v480h96V0h-96zM0 192v96h640v-96H0z" fill="#C8102E"/></svg>',
        ua: '<svg class="w-6 h-4 rounded-sm" viewBox="0 0 640 480"><rect width="640" height="240" fill="#005BBB"/><rect y="240" width="640" height="240" fill="#FFD500"/></svg>'
    };
    var LABELS = { pl: 'Polski', en: 'English', ua: 'Українська' };
    var cache = {};
    var currentLang = DEFAULT_LANG;

    function getSavedLang() {
        try {
            var saved = localStorage.getItem('lang');
            return SUPPORTED.indexOf(saved) !== -1 ? saved : DEFAULT_LANG;
        } catch(e) { return DEFAULT_LANG; }
    }

    function saveLang(lang) {
        try { localStorage.setItem('lang', lang); } catch(e) {}
    }

    function loadTranslations(lang, callback) {
        if (lang === DEFAULT_LANG) { callback(null); return; }
        if (cache[lang]) { callback(cache[lang]); return; }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/lang/' + lang + '.json', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    cache[lang] = JSON.parse(xhr.responseText);
                    callback(cache[lang]);
                } catch(e) { callback(null); }
            } else { callback(null); }
        };
        xhr.onerror = function() { callback(null); };
        xhr.send();
    }

    function applyTranslations(translations) {
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var key = el.getAttribute('data-i18n');

            // Save original PL content on first run
            if (!el.hasAttribute('data-i18n-pl')) {
                el.setAttribute('data-i18n-pl', el.innerHTML);
            }

            if (translations && translations[key]) {
                el.innerHTML = translations[key];
            } else {
                // Fallback to PL
                el.innerHTML = el.getAttribute('data-i18n-pl');
            }
        }

        // Handle placeholder attributes
        var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < placeholders.length; j++) {
            var pel = placeholders[j];
            var pkey = pel.getAttribute('data-i18n-placeholder');
            if (!pel.hasAttribute('data-i18n-placeholder-pl')) {
                pel.setAttribute('data-i18n-placeholder-pl', pel.getAttribute('placeholder') || '');
            }
            if (translations && translations[pkey]) {
                pel.setAttribute('placeholder', translations[pkey]);
            } else {
                pel.setAttribute('placeholder', pel.getAttribute('data-i18n-placeholder-pl'));
            }
        }

        // Handle aria-label attributes
        var arias = document.querySelectorAll('[data-i18n-aria]');
        for (var k = 0; k < arias.length; k++) {
            var ael = arias[k];
            var akey = ael.getAttribute('data-i18n-aria');
            if (!ael.hasAttribute('data-i18n-aria-pl')) {
                ael.setAttribute('data-i18n-aria-pl', ael.getAttribute('aria-label') || '');
            }
            if (translations && translations[akey]) {
                ael.setAttribute('aria-label', translations[akey]);
            } else {
                ael.setAttribute('aria-label', ael.getAttribute('data-i18n-aria-pl'));
            }
        }
    }

    function switchLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        currentLang = lang;
        saveLang(lang);
        loadTranslations(lang, function(translations) {
            applyTranslations(translations);
            updateFlags();
        });
    }

    function updateFlags() {
        document.querySelectorAll('.lang-flag-btn').forEach(function(btn) {
            var lang = btn.getAttribute('data-lang');
            var isActive = lang === currentLang;
            btn.classList.toggle('opacity-100', isActive);
            btn.classList.toggle('ring-1', isActive);
            btn.classList.toggle('ring-gold', isActive);
            btn.classList.toggle('opacity-50', !isActive);
            btn.classList.toggle('hover:opacity-90', !isActive);
        });
    }

    function createFlags() {
        var containers = document.querySelectorAll('.lang-switcher-mount');
        containers.forEach(function(mount) {
            var wrapper = document.createElement('div');
            wrapper.className = 'flex items-center gap-1';

            SUPPORTED.forEach(function(lang) {
                var btn = document.createElement('button');
                var isActive = lang === currentLang;
                btn.className = 'lang-flag-btn p-1 rounded transition-all cursor-pointer '
                    + (isActive ? 'opacity-100 ring-1 ring-gold' : 'opacity-40 hover:opacity-80');
                btn.setAttribute('data-lang', lang);
                btn.setAttribute('aria-label', LABELS[lang]);
                btn.innerHTML = FLAG_SVG[lang];
                btn.addEventListener('click', function() {
                    switchLang(lang);
                });
                wrapper.appendChild(btn);
            });

            mount.appendChild(wrapper);
        });
    }

    // Init on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        currentLang = getSavedLang();
        createFlags();
        if (currentLang !== DEFAULT_LANG) {
            switchLang(currentLang);
        }
    });
})();
