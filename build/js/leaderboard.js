const players = [
    { name: 'Not_Giulix',       cogs: 305, blocks: 78124, hours: 420 },
    { name: 'JeSuis_Roux',      cogs: 520, blocks: 96387, hours: 312 },
    { name: 'Heliosoma',        cogs: 350, blocks: 84210, hours: 480 },
    { name: 'mrcreepson',       cogs: 480, blocks: 88941, hours: 441 },
    { name: 'Verygood_chicken', cogs: 210, blocks: 70332, hours: 198 },
    { name: 'Ponther_',         cogs: 410, blocks: 92506, hours: 389 },
    { name: 'Yolifa',           cogs: 500, blocks: 65192, hours: 209 },
    { name: 'BobIsVryBord',     cogs: 275, blocks: 74203, hours: 326 },
    { name: 'RicLionheart',     cogs: 440, blocks: 61287, hours: 307 },
    { name: 'splads',           cogs: 120, blocks: 56880, hours: 286 },
    { name: 'BobiLikesSnow',    cogs: 390, blocks: 52745, hours: 261 },
    { name: 'KindaWierd',       cogs: 290, blocks: 47816, hours: 238 },
    { name: 'RastaMeta',        cogs: 240, blocks: 46311, hours: 225 },
    { name: 'Magmaticpage',     cogs: 380, blocks: 44702, hours: 218 },
    { name: 'Kiekie525',        cogs: 150, blocks: 43659, hours: 216 },
    { name: 'Mochadepreso',     cogs: 210, blocks: 43287, hours: 215 },
    { name: 'Wysmac',           cogs: 330, blocks: 41163, hours: 212 },
    { name: 'beacyn',           cogs: 410, blocks: 40988, hours: 214 },
    { name: 'SoviettCatt',      cogs: 175, blocks: 43104, hours: 210 },
    { name: 'Yi_studio',        cogs: 260, blocks: 40444, hours: 205 },
    { name: 'UnpricedMoth',     cogs: 205, blocks: 39571, hours: 195 },
    { name: 'Mardaxus',         cogs: 315, blocks: 38192, hours: 191 },
    { name: '_mon0lith_',       cogs: 190, blocks: 37780, hours: 188 },
    { name: 'Ingene',           cogs: 240, blocks: 36234, hours: 182 },
    { name: 'vgregory73',       cogs: 205, blocks: 35681, hours: 180 },
    { name: 'Chokoretro',       cogs: 330, blocks: 35266, hours: 175 },
    { name: '12hotroom',        cogs: 170, blocks: 34789, hours: 172 },
    { name: 't1g37',            cogs: 280, blocks: 34395, hours: 170 },
    { name: 'ocllyn',           cogs: 360, blocks: 34122, hours: 169 },
    { name: 'Breadmanguy1',     cogs: 100, blocks: 33347, hours: 305 },
    { name: 'Aidtilop',         cogs: 450, blocks: 32386, hours: 134 },
    { name: 'Eviquel',          cogs: 155, blocks: 30194, hours: 212 },
];

const categories = [
    { key: 'cogs',   label: 'COGS',   unit: cogImg() },
    { key: 'blocks', label: 'BLOCKS', unit: ''        },
    { key: 'hours',  label: 'HOURS',  unit: 'h'       },
];

async function loadLeaderboard() {
    return players;
}

function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000)    return Math.floor(n / 1000) + 'k';
    return String(n);
}

function formatMetric(key, n) {
    if (key === 'blocks') return Number(n).toLocaleString('en-US');
    return fmt(n);
}

function avatar(name) {
    return `https://mc-heads.net/avatar/${name}`;
}

function cogImg() {
    return `<img src="assets/svgs/cog.svg" alt="" />`;
}

function sorted(data, key) {
    return [...data].sort((a, b) => b[key] - a[key]);
}

const rankClass = i => i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';

function animateScores(list) {
    list.querySelectorAll('[data-val]').forEach(el => {
        const target = +el.dataset.val;
        const key = el.dataset.key || 'cogs';
        const start  = performance.now();
        const dur    = 700;
        const tick   = now => {
            const t = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - t, 4);
            el.textContent = formatMetric(key, Math.round(e * target));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
}

function initLeaderboard(container, isSidebar = false) {
    const list = container.querySelector('.lb-list');
    const tabs = container.querySelector('.lb-tabs');
    if (!list || !tabs) return;

    let activeKey = 'cogs';

    const render = async (animate = false) => {
        const data = await loadLeaderboard();
        const items = sorted(data, activeKey);

        if (animate && list.children.length > 0) {
            [...list.children].forEach(el => {
                el.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
                el.style.opacity = '0';
                el.style.transform = 'translateY(-5px)';
            });
            await new Promise(r => setTimeout(r, 120));
        }

        list.innerHTML = items.map((p, i) => {
            const val = p[activeKey];
            const cat = categories.find(c => c.key === activeKey);
            const rClass = rankClass(i);
            
            if (isSidebar) {
                return `
                    <li class="lb-item ${rClass}" data-player="${p.name}">
                        <div class="lb-rank">${i + 1}</div>
                        <div class="lb-avatar" style="background-image:url(${avatar(p.name)})"></div>
                        <span class="lb-name">${p.name}</span>
                        <div class="lb-score">
                            <span data-key="${activeKey}" data-val="${val}">${formatMetric(activeKey, val)}</span>
                            ${cat.unit}
                        </div>
                    </li>
                `;
            } else {
                return `
                    <div class="lb-item-full ${rClass}">
                        <div class="lb-rank-full">${i + 1}</div>
                        <div class="lb-avatar-full" style="background-image:url(${avatar(p.name)})"></div>
                        <span class="lb-name-full">${p.name}</span>
                        <div class="lb-score-full">
                            <span data-key="${activeKey}" data-val="${val}">${formatMetric(activeKey, val)}</span>
                            ${cat.unit}
                        </div>
                    </div>
                `;
            }
        }).join('');

        animateScores(list);

        if (animate) {
            [...list.children].forEach((el, i) => {
                const delay = Math.min(i * 18, 180);
                el.style.opacity = '0';
                el.style.transform = 'translateY(6px)';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    el.style.transition = `opacity 0.2s ease ${delay}ms, transform 0.2s ease ${delay}ms`;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }));
            });
        }

        if (isSidebar) {
            list.querySelectorAll('.lb-item').forEach(el => {
                const name = el.dataset.player;
                const p = data.find(x => x.name === name);
                el.addEventListener('mouseenter', () => showHoverCard(p, el));
                el.addEventListener('mouseleave', hideHoverCard);
            });
        }
    };

    tabs.innerHTML = categories.map(c => `
        <button class="lb-tab ${c.key === activeKey ? 'active' : ''}" data-key="${c.key}">
            ${c.label}
        </button>
    `).join('');

    tabs.querySelectorAll('.lb-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelector('.active').classList.remove('active');
            btn.classList.add('active');
            activeKey = btn.dataset.key;
            render(true);
        });
    });

    render();
}

// --- hover card ---
const hoverCard = document.createElement('div');
hoverCard.className = 'lb-hover-card';
hoverCard.setAttribute('aria-hidden', 'true');
document.body.appendChild(hoverCard);

let hoverTimer = null;
window.addEventListener('scroll', () => { clearTimeout(hoverTimer); hoverCard.classList.remove('visible'); }, { passive: true });

function showHoverCard(p, el) {
    hoverCard.innerHTML = `
        <div class="lhc-head">
            <div class="lhc-avatar" style="background-image:url(${avatar(p.name)})"></div>
            <span class="lhc-name">${p.name}</span>
        </div>
        <div class="lhc-stats">
            <div class="lhc-stat">
                <span class="lhc-label">COGS</span>
                <span class="lhc-val">${fmt(p.cogs)}</span>
            </div>
            <div class="lhc-stat">
                <span class="lhc-label">BLOCKS</span>
                <span class="lhc-val">${formatMetric('blocks', p.blocks)}</span>
            </div>
            <div class="lhc-stat">
                <span class="lhc-label">HOURS</span>
                <span class="lhc-val">${p.hours}h</span>
            </div>
        </div>
        <div class="corner-tl"></div>
        <div class="corner-br"></div>
    `;
    const r = el.getBoundingClientRect();
    hoverCard.style.top  = (window.scrollY + r.top + r.height / 2) + 'px';
    hoverCard.style.left = (r.left - 10) + 'px';
    clearTimeout(hoverTimer);
    hoverCard.classList.add('visible');
    hoverCard.setAttribute('aria-hidden', 'false');
}

function hideHoverCard() {
    hoverCard.classList.remove('visible');
    hoverCard.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.leaderboard');
    if (sidebar) initLeaderboard(sidebar, true);

    const full = document.querySelector('.lb-full');
    if (full) initLeaderboard(full, false);
});
