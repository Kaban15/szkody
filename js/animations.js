'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Lenis smooth scroll init
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Parallax on scroll
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    const scrollTextDividers = document.querySelectorAll('[data-scroll-text]');
    const isMobile = window.innerWidth < 768;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
        lenis.on('scroll', ({ scroll }) => {
            // Parallax
            parallaxEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (!inView) return;

                const factor = parseFloat(el.dataset.parallax) * (isMobile ? 0.5 : 1);
                const offset = (rect.top - window.innerHeight / 2) * factor;
                el.style.transform = `translateY(${offset}px)`;
            });

            // Horizontal scroll text
            scrollTextDividers.forEach(el => {
                const inner = el.querySelector('.scroll-text-inner');
                if (!inner) return;
                const rect = el.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (!inView) return;
                inner.style.transform = `translateX(${scroll * -0.15}px)`;
            });
        });
    }

    // Word-by-word hero reveal
    document.querySelectorAll('.word-reveal').forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

        const wordEls = el.querySelectorAll('.word');
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;

        wordEls.forEach((word, i) => {
            setTimeout(() => word.classList.add('visible'), delay + i * 100);
        });
    });

    // Count-up animation
    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const countEl = entry.target.querySelector('[data-count]');
                if (countEl) animateCount(countEl);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
    document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));

    // Clip-path reveal observer
    const clipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                clipObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal-clip').forEach(el => clipObserver.observe(el));

    // Comparison bars — animate width when visible
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.comparison-bar');
                bars.forEach(bar => {
                    bar.classList.add('visible');
                    bar.style.width = bar.dataset.width;
                });
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.comparison-bars').forEach(el => barObserver.observe(el));

    // Staggered reveal — children of [data-stagger] containers animate with delay
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.stagger) || 150;
                const children = entry.target.querySelectorAll('.fade-in-up');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${i * delay}ms`;
                    child.classList.add('visible');
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-stagger]').forEach(el => staggerObserver.observe(el));

    const filterBtns = document.querySelectorAll('.case-filter');
    const caseCards = document.querySelectorAll('.case-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => {
                b.classList.remove('bg-gold', 'text-bg');
                b.classList.add('bg-surface-light', 'text-muted');
            });
            btn.classList.remove('bg-surface-light', 'text-muted');
            btn.classList.add('bg-gold', 'text-bg');
            caseCards.forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
            });
        });
    });
});
