(function() {
    var DEFAULT_LANG = 'pl';
    var SUPPORTED = ['pl', 'en', 'ua'];
    var FLAGS = { pl: '🇵🇱', en: '🇬🇧', ua: '🇺🇦' };
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
            updateDropdown();
        });
    }

    function updateDropdown() {
        var btn = document.getElementById('lang-current');
        if (btn) {
            btn.innerHTML = FLAGS[currentLang] + ' <span class="text-xs">' + currentLang.toUpperCase() + '</span>';
        }
        // Update active state in dropdown items
        var items = document.querySelectorAll('.lang-option');
        for (var i = 0; i < items.length; i++) {
            var isActive = items[i].getAttribute('data-lang') === currentLang;
            items[i].classList.toggle('text-gold', isActive);
            items[i].classList.toggle('text-white', !isActive);
        }
    }

    function createDropdown() {
        // Desktop dropdown
        var containers = document.querySelectorAll('.lang-switcher-mount');
        containers.forEach(function(mount) {
            var wrapper = document.createElement('div');
            wrapper.className = 'relative';
            wrapper.id = 'lang-switcher';

            var btn = document.createElement('button');
            btn.id = mount.classList.contains('mobile') ? 'lang-current-mobile' : 'lang-current';
            btn.className = 'flex items-center gap-1.5 text-white/60 hover:text-gold transition-colors text-sm px-2 py-1 rounded border border-white/10 hover:border-gold/30';
            btn.innerHTML = FLAGS[currentLang] + ' <span class="text-xs">' + currentLang.toUpperCase() + '</span>';
            btn.setAttribute('aria-label', 'Wybierz język');

            var dropdown = document.createElement('div');
            dropdown.className = 'absolute right-0 top-full mt-1 bg-surface border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] hidden z-50';

            SUPPORTED.forEach(function(lang) {
                var item = document.createElement('button');
                item.className = 'lang-option w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-light transition-colors ' + (lang === currentLang ? 'text-gold' : 'text-white');
                item.setAttribute('data-lang', lang);
                item.innerHTML = FLAGS[lang] + ' ' + LABELS[lang];
                item.addEventListener('click', function() {
                    switchLang(lang);
                    dropdown.classList.add('hidden');
                    // Update all dropdowns on page
                    document.querySelectorAll('#lang-switcher .lang-option, #lang-switcher-mobile .lang-option').forEach(function(opt) {
                        var isActive = opt.getAttribute('data-lang') === lang;
                        opt.classList.toggle('text-gold', isActive);
                        opt.classList.toggle('text-white', !isActive);
                    });
                    document.querySelectorAll('#lang-current, #lang-current-mobile').forEach(function(b) {
                        b.innerHTML = FLAGS[lang] + ' <span class="text-xs">' + lang.toUpperCase() + '</span>';
                    });
                });
                dropdown.appendChild(item);
            });

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            wrapper.appendChild(btn);
            wrapper.appendChild(dropdown);
            mount.appendChild(wrapper);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            document.querySelectorAll('#lang-switcher > div:last-child').forEach(function(d) {
                d.classList.add('hidden');
            });
        });
    }

    // Init on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        currentLang = getSavedLang();
        createDropdown();
        if (currentLang !== DEFAULT_LANG) {
            switchLang(currentLang);
        }
    });
})();
