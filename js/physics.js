const stats = {
    membersOnline: 7,
    membersCap:    32,
    worldAge:      482,
    activeTrains:  14,
    uptime:        90.4,
};

document.querySelector('.stat-of').textContent = '/ ' + stats.membersCap;

const statValues = document.querySelectorAll('.stat-value');

function counter(el, target, delay, suffix = '') {
    const isFloat  = !Number.isInteger(target);
    const duration = 1600;
    setTimeout(() => {
        const start = performance.now();
        const tick  = now => {
            const t     = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4); // ease-out quart — fast roll, sharp stop
            el.textContent = (isFloat ? (eased * target).toFixed(1) : Math.round(eased * target)) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, delay);
}

counter(statValues[0], stats.membersOnline, 0);
counter(statValues[1], stats.worldAge,      120);
counter(statValues[2], stats.activeTrains,  240);
counter(statValues[3], stats.uptime,        360, '%');

const uptimeFill = document.querySelector('.uptime-fill');
uptimeFill.style.width = '0%';
setTimeout(() => uptimeFill.style.width = stats.uptime + '%', 360);

// engine
const flywheel = document.querySelector('.deco-flywheel');
const cogLarge = document.querySelector('.deco-cog-large');
const cogSmall = document.querySelector('.deco-cog');

// shared state — chain 
let engineVel   = 0;
let flAngle     = 0, cogLAngle = 0, cogSAngle = 0;
let flDragging  = false, flTorque = 0, flPrevAngle = 0;

const FRICTION   = 0.993;  // coast bleed
const DRAG_DAMP  = 0.90;   // damping while flywheel is held
const TORQUE_K   = 0.022;  // how weakly your hand couples to the wheel
const IDLE_SPEED = 0.18;   // baseline deg/frame the engine maintains
const IDLE_PUSH  = 0.003;  // nudge per frame toward idle

const engineTick = () => {
    if (flDragging) {
        engineVel = (engineVel + flTorque) * DRAG_DAMP;
        flTorque  = 0;
    } else {
        if (engineVel > -IDLE_SPEED) engineVel -= IDLE_PUSH;
        else                         engineVel *= FRICTION;
    }

    flAngle   += engineVel;
    cogLAngle += engineVel * -0.68; // 160/220 — opposite dir, slower
    cogSAngle += engineVel *  1.10; // 160/140 — same dir, faster

    if (flywheel) flywheel.style.transform = `translateX(-50%) rotate(${flAngle}deg)`;
    if (cogLarge) cogLarge.style.transform = `rotate(${cogLAngle}deg)`;
    if (cogSmall) cogSmall.style.transform = `rotate(${cogSAngle}deg)`;

    requestAnimationFrame(engineTick);
};

if (flywheel || cogLarge || cogSmall) requestAnimationFrame(engineTick);

if (flywheel) {
    const centerAngle = e => {
        const r = flywheel.getBoundingClientRect();
        return Math.atan2(e.clientY - (r.top + r.height / 2),
                          e.clientX - (r.left + r.width / 2)) * (180 / Math.PI);
    };

    flywheel.addEventListener('pointerdown', e => {
        e.preventDefault();
        flDragging  = true;
        flPrevAngle = centerAngle(e);
        flTorque    = 0;
        flywheel.style.cursor = 'grabbing';
        flywheel.setPointerCapture(e.pointerId);
    });

    flywheel.addEventListener('pointermove', e => {
        if (!flywheel.hasPointerCapture(e.pointerId)) return;
        const cur   = centerAngle(e);
        let   delta = cur - flPrevAngle;
        if (delta >  180) delta -= 360;
        if (delta < -180) delta += 360;
        flTorque   += delta * TORQUE_K;
        flPrevAngle = cur;
    });

    const flRelease = () => {
        flDragging = false;
        flywheel.style.cursor = 'grab';
    };

    flywheel.addEventListener('pointerup',     flRelease);
    flywheel.addEventListener('pointercancel', flRelease);
}

// --- Machines ---

const CANVAS_W  = 550;
const CANVAS_H  = 400;
const TOTAL_AREA = 110000;  // sum of machine areas at canvas scale (px²)
const PACK_EFF  = 0.60;     // fill ratio — room left keeps separation organic
const MAX_WFRAC = 0.325;    // widest machine (steel)
const GAP       = 10;       // min gap between every pair

const DRAG_LIMIT = 16;      // max px from rest a machine can be pulled
const DRAG_LERP  = 0.10;    // lerp factor — lower = heavier

const K_SPRING  = 0.055;    // pull back to rest — low so it doesn't fight repulsion
const K_DAMP    = 0.82;     // velocity damping per frame
const K_REPEL   = 22;       // soft repulsion force at inner edge of soft zone
const SOFT_MULT = 1.5;      // soft zone = minSep * SOFT_MULT
const K_HARD    = 0.55;     // hard correction force per px of actual overlap

const MACHINE_DEFS = [
    { sel: '.machine.blazing',  wFrac: 0.235, aspect: 4/5,   ax: 0.14, ay: 0.24 },
    { sel: '.machine.steel',    wFrac: 0.325, aspect: 14/15, ax: 0.54, ay: 0.28 },
    { sel: '.machine.brass',    wFrac: 0.235, aspect: 2/3,   ax: 0.86, ay: 0.40 },
    { sel: '.machine.copper',   wFrac: 0.230, aspect: 4/5,   ax: 0.25, ay: 0.72 },
    { sel: '.machine.andesite', wFrac: 0.180, aspect: 1,     ax: 0.59, ay: 0.73 },
];

function layoutMachines(container) {
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (!cw || !ch) return;

    const scale = Math.min(
        Math.sqrt((cw * ch * PACK_EFF) / TOTAL_AREA),
        cw / (MAX_WFRAC * CANVAS_W)
    );

    const rects = MACHINE_DEFS.map(({ sel, wFrac, aspect, ax, ay }) => {
        const w = wFrac * CANVAS_W * scale;
        const h = w / aspect;
        return {
            sel, w, h,
            x: Math.max(0, Math.min(cw - w, ax * cw - w / 2)),
            y: Math.max(0, Math.min(ch - h, ay * ch - h / 2)),
        };
    });
    for (let iter = 0; iter < 300; iter++) {
        let anyOverlap = false;
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i], b = rects[j];
                const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + GAP;
                const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + GAP;
                if (ox <= 0 || oy <= 0) continue;

                anyOverlap = true;
                let dx = (b.x + b.w / 2) - (a.x + a.w / 2);
                let dy = (b.y + b.h / 2) - (a.y + a.h / 2);
                if (!dx && !dy) { dx = 1; }
                const len  = Math.sqrt(dx * dx + dy * dy);
                const push = (ox + oy) / 4 + 1;

                a.x = Math.max(0, Math.min(cw - a.w, a.x - (dx / len) * push));
                a.y = Math.max(0, Math.min(ch - a.h, a.y - (dy / len) * push));
                b.x = Math.max(0, Math.min(cw - b.w, b.x + (dx / len) * push));
                b.y = Math.max(0, Math.min(ch - b.h, b.y + (dy / len) * push));
            }
        }
        if (!anyOverlap) break;
    }
    // console.log('layout done', rects.length, 'machines');

    rects.forEach(({ sel, x, y, w, h }) => {
        const m = container.querySelector(sel);
        if (!m) return;
        m.style.transition = 'none';
        m.style.width  = w + 'px';
        m.style.height = h + 'px';
        m.style.left   = x + 'px';
        m.style.top    = y + 'px';
        m.style.right  = 'auto';
        m.dataset.restX = x;
        m.dataset.restY = y;
    });
}

function attachDrag(el) {
    let restX = 0, restY = 0;
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;
    let startPX = 0, startPY = 0;
    let dragging = false;
    let rafId = null;

    function tick() {
        curX += (targetX - curX) * DRAG_LERP;
        curY += (targetY - curY) * DRAG_LERP;
        el.style.left = curX + 'px';
        el.style.top  = curY + 'px';

        const dw     = parseFloat(el.style.width)  || 0;
        const dh     = parseFloat(el.style.height) || 0;
        const dragCX = curX + dw / 2;
        const dragCY = curY + dh / 2;

        // Scale repulsion by how far the machine has moved from rest — zero force at rest,
        // full force at DRAG_LIMIT, so nothing reacts until you actually pull it somewhere
        const odx        = curX - restX;
        const ody        = curY - restY;
        const repelScale = Math.min(1, Math.sqrt(odx * odx + ody * ody) / DRAG_LIMIT);

        el.closest('.machines').querySelectorAll('.machine').forEach(m => {
            if (m === el) return;

            const rx = parseFloat(m.dataset.restX) || 0;
            const ry = parseFloat(m.dataset.restY) || 0;
            const mW = parseFloat(m.style.width)   || 0;
            const mH = parseFloat(m.style.height)  || 0;

            const dx   = (m._px + mW / 2) - dragCX;
            const dy   = (m._py + mH / 2) - dragCY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx   = dx / dist;
            const ny   = dy / dist;

            // not a fixed circle, so bigger machines have a proportionally larger field
            const angle  = Math.atan2(Math.abs(dy), Math.abs(dx));
            const minSep = (dw + mW) / 2 * Math.cos(angle) + (dh + mH) / 2 * Math.sin(angle) + GAP;
            const softR  = minSep * SOFT_MULT;

            // Soft field: cubic falloff — barely felt far out, strong near contact
            const t     = Math.max(0, 1 - dist / softR);
            const fSoft = K_REPEL * t * t * t;

            // Hard correction: linear per-px of actual overlap — prevents passing through
            const fHard = Math.max(0, minSep - dist) * K_HARD;

            m._vx = (m._vx + (rx - m._px) * K_SPRING + nx * (fSoft + fHard) * repelScale) * K_DAMP;
            m._vy = (m._vy + (ry - m._py) * K_SPRING + ny * (fSoft + fHard) * repelScale) * K_DAMP;
            m._px += m._vx;
            m._py += m._vy;

            m.style.transition = 'none';
            m.style.left = m._px + 'px';
            m.style.top  = m._py + 'px';
        });

        rafId = requestAnimationFrame(tick);
    }

    el.addEventListener('pointerdown', e => {
        e.preventDefault();
        dragging = true;
        restX   = parseFloat(el.dataset.restX) || 0;
        restY   = parseFloat(el.dataset.restY) || 0;
        curX    = restX;
        curY    = restY;
        targetX = restX;
        targetY = restY;
        startPX = e.clientX;
        startPY = e.clientY;
        el.style.transition = 'none';
        el.style.zIndex     = '10';
        el.setPointerCapture(e.pointerId);

        el.closest('.machines').querySelectorAll('.machine').forEach(m => {
            if (m === el) return;
            m.style.transition = 'none';
            m._px = parseFloat(getComputedStyle(m).left) || 0;
            m._py = parseFloat(getComputedStyle(m).top)  || 0;
            m._vx = 0;
            m._vy = 0;
            m.style.left = m._px + 'px';
            m.style.top  = m._py + 'px';
        });

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
    });

    el.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, e.clientX - startPX));
        const dy = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, e.clientY - startPY));
        targetX = restX + dx;
        targetY = restY + dy;
    });

    const release = () => {
        if (!dragging) return;
        dragging = false;
        cancelAnimationFrame(rafId);
        rafId = null;

        el.style.zIndex     = '';
        el.style.transition = 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.left = restX + 'px';
        el.style.top  = restY + 'px';

        el.closest('.machines').querySelectorAll('.machine').forEach(m => {
            if (m === el) return;
            m.style.transition = 'left 1.1s cubic-bezier(0.22, 1, 0.36, 1), top 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
            m.style.left = (parseFloat(m.dataset.restX) || 0) + 'px';
            m.style.top  = (parseFloat(m.dataset.restY) || 0) + 'px';
        });
    };

    el.addEventListener('pointerup',     release);
    el.addEventListener('pointercancel', release);
}

// --- Chain drag ---
const chain = document.querySelector('.deco-chain');
if (chain) {
    let pulling  = false;
    let startY   = 0;
    let lastPull = 0; // remembered at release to compute kick

    const onLantern = e => {
        const r = chain.getBoundingClientRect();
        return e.clientY > r.top + r.height * 0.65;
    };

    chain.addEventListener('mousemove', e => {
        if (!pulling) chain.style.cursor = onLantern(e) ? 'grab' : 'default';
    });

    chain.addEventListener('pointerdown', e => {
        if (!onLantern(e)) return;
        e.preventDefault();
        pulling  = true;
        lastPull = 0;
        startY   = e.clientY;
        chain.style.transition = 'none';
        chain.style.cursor     = 'grabbing';
        chain.setPointerCapture(e.pointerId);
    });

    chain.addEventListener('pointermove', e => {
        if (!pulling) return;
        const raw = Math.max(0, e.clientY - startY);
        lastPull  = Math.min(65, Math.pow(raw, 0.4) * 5);
        chain.style.transform = `translateY(${lastPull}px)`;
    });

    const release = () => {
        if (!pulling) return;
        pulling = false;
        // snap kick — the harder you pulled, the more the engine revs
        engineVel -= (lastPull / 65) * 2.8;
        lastPull   = 0;
        chain.style.cursor     = '';
        chain.style.transition = 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)';
        chain.style.transform  = 'translateY(0)';
    };

    chain.addEventListener('pointerup',     release);
    chain.addEventListener('pointercancel', release);
}

// --- Mobile cogs (ambient idle — no flywheel on mobile) ---
const mobCogL = document.querySelector('.mob-cog-l');
const mobCogR = document.querySelector('.mob-cog-r');
if (mobCogL && mobCogR) {
    let mobAngL = 0, mobAngR = 0;
    const mobSpin = () => {
        mobAngR += 0.10;          // base speed
        mobAngL -= 0.10 * 1.74;  // 150/86 gear ratio, opposite direction
        mobCogL.style.transform = `rotate(${mobAngL}deg)`;
        mobCogR.style.transform = `rotate(${mobAngR}deg)`;
        requestAnimationFrame(mobSpin);
    };
    requestAnimationFrame(mobSpin);
}

// --- Parallax hero ---
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
    let rafPending = false;
    window.addEventListener('scroll', () => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
            rafPending = false;
        });
    }, { passive: true });
}

const machinesEl = document.querySelector('.machines');
if (machinesEl) {
    const ro = new ResizeObserver(() => layoutMachines(machinesEl));
    ro.observe(machinesEl);
    layoutMachines(machinesEl);
    machinesEl.querySelectorAll('.machine').forEach(attachDrag);
}
