// Small, dependency-free motion layer. Frames stop once the gaze settles.
(() => {
    const stage = document.querySelector('.character-stage');
    const feature = document.querySelector('.echo-feature');
    if (!stage || !feature) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    let visible = true;
    function draw() {
        frame = 0;
        x += (targetX - x) * .13;
        y += (targetY - y) * .13;
        stage.style.setProperty('--eye-x', `${x * 7}px`);
        stage.style.setProperty('--eye-y', `${y * 3}px`);
        stage.style.setProperty('--head-x', `${x * 3}px`);
        stage.style.setProperty('--head-y', `${y * 2}px`);
        stage.style.setProperty('--head-turn', `${x * 3}deg`);
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > .002) frame = requestAnimationFrame(draw);
    }
    function aim(nextX, nextY) {
        targetX = nextX; targetY = nextY;
        if (!frame) frame = requestAnimationFrame(draw);
    }
    window.addEventListener('pointermove', event => {
        if (reduced.matches || !fine.matches || !visible || event.pointerType === 'touch') return;
        const rect = stage.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) / 250;
        const dy = (event.clientY - rect.top - rect.height * .43) / 250;
        const magnitude = Math.max(1, Math.hypot(dx, dy));
        aim(dx / magnitude, dy / magnitude);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => aim(0, 0));
    window.addEventListener('blur', () => aim(0, 0));
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) aim(0, 0);
    }).observe(stage);
    let scrollFrame = 0;
    function updateScroll() {
        scrollFrame = 0;
        if (reduced.matches) return;
        const rect = feature.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const progress = (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight;
        feature.style.setProperty('--echo-drift', `${Math.max(-18, Math.min(18, progress * 36))}px`);
    }
    window.addEventListener('scroll', () => {
        if (!scrollFrame && !reduced.matches) scrollFrame = requestAnimationFrame(updateScroll);
    }, { passive: true });
    reduced.addEventListener('change', () => { aim(0, 0); updateScroll(); });
    updateScroll();
})();
