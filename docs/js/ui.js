const hamburger = document.getElementById('mobHamburger');
const drawer    = document.getElementById('mobNavDrawer');
if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
        drawer.setAttribute('aria-hidden', !open);
    });
}

function copyIP() {
    navigator.clipboard.writeText('BRASSBOUND.MINE.FUN').then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    });
}

const btnIp = document.querySelector('.btn-ip');
if (btnIp) btnIp.addEventListener('click', copyIP);

const scrollSections = ['#dashboard', '#stats', '#gallery']
    .map(href => ({ href, el: document.querySelector(href) }))
    .filter(s => s.el);

function syncNav() {
    const threshold = window.innerHeight * 0.4;
    let active = scrollSections[0]?.href;
    scrollSections.forEach(s => {
        if (s.el.getBoundingClientRect().top <= threshold) active = s.href;
    });
    document.querySelectorAll('.nav-item, .mob-nav-item').forEach(a => {
        const href = a.getAttribute('href');
        if (scrollSections.some(s => s.href === href))
            a.classList.toggle('active', href === active);
    });
}

window.addEventListener('scroll', syncNav, { passive: true });
syncNav();
