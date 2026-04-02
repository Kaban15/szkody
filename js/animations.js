/**
 * Scroll-triggered animations: count-up numbers and reveal-on-scroll elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Count-up animation
    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Intersection observer for count-up elements
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

    // Scroll reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Case studies filter
    document.querySelectorAll('.case-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            document.querySelectorAll('.case-filter').forEach(b => { b.classList.remove('bg-navy','text-white'); b.classList.add('bg-warm','text-txt/60'); });
            btn.classList.remove('bg-warm','text-txt/60'); btn.classList.add('bg-navy','text-white');
            document.querySelectorAll('.case-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
            });
        });
    });
});
