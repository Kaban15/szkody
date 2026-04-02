document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const stickyBar = document.getElementById('sticky-bar');
    const interactiveSections = ['quiz', 'kalkulator', 'kontakt'];

    if (menuBtn && mobileMenu) {
        const menuIcon = menuBtn.querySelector('[data-lucide]');

        function setMenuIcon(name) {
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', name);
                lucide.createIcons();
            }
        }

        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            setMenuIcon(isOpen ? 'menu' : 'x');
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.classList.add('hidden');
                setMenuIcon('menu');
            }
        });
    }

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
