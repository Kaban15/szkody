'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('main-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const stickyBar = document.getElementById('sticky-bar');
    const interactiveSections = ['quiz', 'kalkulator', 'kontakt'];

    if (!nav) return;

    // Scroll-to-top button (created dynamically — works on all pages)
    const SCROLL_THRESHOLD = 400;
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Powrót do góry');
    scrollBtn.className = 'fixed bottom-24 right-6 z-40 w-12 h-12 bg-surface-light border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:bg-gold hover:border-gold hover:text-bg text-muted transition-colors cursor-pointer lg:bottom-[11rem]';
    scrollBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>';
    document.body.appendChild(scrollBtn);

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll: transparent → solid, hide on scroll down, show on scroll up
    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight * 0.5;

        // Solid after scrolling past half the viewport
        nav.classList.toggle('nav-solid', scrollY > heroHeight);

        // Hide/show on scroll direction (only after hero)
        if (scrollY > heroHeight) {
            nav.classList.toggle('nav-hidden', scrollY > lastScrollY && scrollY - lastScrollY > 10);
        } else {
            nav.classList.remove('nav-hidden');
        }

        // Show/hide scroll-to-top button
        scrollBtn.classList.toggle('visible', scrollY > SCROLL_THRESHOLD);

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    // Mobile menu
    if (menuBtn && mobileMenu) {
        const menuIcon = menuBtn.querySelector('[data-lucide]');

        function setMenuIcon(name) {
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', name);
                // Scope icon re-render to menu button only (avoids full DOM scan)
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons({ attrs: { 'data-lucide': name }, nameAttr: 'data-lucide' });
                }
            }
        }

        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('overflow-hidden');
            setMenuIcon(isOpen ? 'menu' : 'x');
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('overflow-hidden');
                setMenuIcon('menu');
            }
        });
    }

    // Testimonial carousel navigation
    const carousel = document.getElementById('testimonial-carousel');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    if (carousel && prevBtn && nextBtn) {
        function getScrollDistance() {
            const firstCard = carousel.querySelector('.testimonial-card');
            return firstCard ? firstCard.offsetWidth + 24 : 364;
        }
        prevBtn.addEventListener('click', function() {
            carousel.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function() {
            carousel.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
        });
    }

    // Sticky bar: hide when interactive sections are in viewport
    if (stickyBar) {
        const observer = new IntersectionObserver((entries) => {
            const anyVisible = entries.some(e => e.isIntersecting);
            stickyBar.classList.toggle('hidden-bar', anyVisible);
        }, { threshold: 0.3 });

        interactiveSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }
});
