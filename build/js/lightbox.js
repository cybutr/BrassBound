// #region Lightbox
const lightbox         = document.getElementById('lightbox');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxPrev     = document.getElementById('lightboxPrev');
const lightboxNext     = document.getElementById('lightboxNext');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxCounter  = document.getElementById('lightboxCounter');

if (lightbox) {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const galleryUrls  = galleryItems.map(item => {
        const photo = item.querySelector('.gallery-photo');
        if (!photo) return '';
        const bg = getComputedStyle(photo).backgroundImage;
        return bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    });
    let currentIdx = 0;

    const setCounter = idx => {
        const p = n => n.toString().padStart(2, '0');
        if (lightboxCounter) lightboxCounter.textContent = p(idx + 1) + ' / ' + p(galleryUrls.length);
    };

    const openLightbox = idx => {
        currentIdx = idx;
        if (lightboxImg) lightboxImg.src = galleryUrls[currentIdx];
        setCounter(currentIdx);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
    };

    const showPrev = () => { currentIdx = (currentIdx - 1 + galleryUrls.length) % galleryUrls.length; if (lightboxImg) lightboxImg.src = galleryUrls[currentIdx]; setCounter(currentIdx); };
    const showNext = () => { currentIdx = (currentIdx + 1) % galleryUrls.length; if (lightboxImg) lightboxImg.src = galleryUrls[currentIdx]; setCounter(currentIdx); };

    galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
    if (lightboxClose)    lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxPrev)     lightboxPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
    if (lightboxNext)     lightboxNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   showPrev();
        if (e.key === 'ArrowRight')  showNext();
    });

    const stage = document.querySelector('.lightbox-stage');
    if (stage) {
        let swipeX = 0, swipeY = 0, swiping = false;
        stage.addEventListener('pointerdown', e => {
            swipeX = e.clientX; swipeY = e.clientY; swiping = true;
        });
        stage.addEventListener('pointerup', e => {
            if (!swiping) return;
            swiping = false;
            const dx = e.clientX - swipeX;
            const dy = e.clientY - swipeY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                dx < 0 ? showNext() : showPrev();
            } else if (dy > 60) {
                closeLightbox();
            }
        });
    }
}
// #endregion
