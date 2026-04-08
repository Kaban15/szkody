'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('main-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const stickyBar = document.getElementById('sticky-bar');
    const interactiveSections = ['quiz', 'kalkulator', 'kontakt'];

    if (!nav) return;

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
