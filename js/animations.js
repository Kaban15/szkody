document.addEventListener('DOMContentLoaded', () => {
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
