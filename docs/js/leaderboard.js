const players = [
    { name: 'Not_Giulix',       cogs: 500, blocks: 96000, hours: 480 },
    { name: 'JeSuis_Roux',      cogs: 472, blocks: 92000, hours: 462 },
    { name: 'Heliosoma',        cogs: 451, blocks: 88000, hours: 441 },
    { name: 'mrcreepson',       cogs: 430, blocks: 84000, hours: 420 },
    { name: 'Verygood_chicken', cogs: 398, blocks: 78000, hours: 389 },
    { name: 'Ponther_',         cogs: 377, blocks: 74000, hours: 368 },
    { name: 'Yolifa',           cogs: 355, blocks: 70000, hours: 350 },
    { name: 'BobIsVryBord',     cogs: 332, blocks: 65000, hours: 326 },
    { name: 'RicLionheart',     cogs: 308, blocks: 61000, hours: 307 },
    { name: 'splads',           cogs: 284, blocks: 56000, hours: 286 },
    { name: 'BobiLikesSnow',    cogs: 261, blocks: 52000, hours: 261 },
    { name: 'KindaWierd',       cogs: 239, blocks: 47000, hours: 238 },
    { name: 'RastaMeta',        cogs: 230, blocks: 46000, hours: 225 },
    { name: 'Magmaticpage',     cogs: 220, blocks: 44000, hours: 218 },
    { name: 'Kiekie525',        cogs: 218, blocks: 43500, hours: 216 },
    { name: 'Mochadepreso',     cogs: 217, blocks: 43200, hours: 215 },
    { name: 'Wysmac',           cogs: 215, blocks: 41000, hours: 212 },
    { name: 'beacyn',           cogs: 213, blocks: 40500, hours: 210 },
    { name: 'SoviettCatt',      cogs: 210, blocks: 43000, hours: 214 },
    { name: 'Yi_studio',        cogs: 205, blocks: 40000, hours: 200 },
    { name: 'UnpricedMoth',     cogs: 200, blocks: 39000, hours: 195 },
    { name: 'Mardaxus',         cogs: 193, blocks: 38000, hours: 191 },
    { name: '_mon0lith_',       cogs: 190, blocks: 37500, hours: 188 },
    { name: 'Ingene',           cogs: 185, blocks: 36000, hours: 182 },
    { name: 'vgregory73',       cogs: 180, blocks: 35500, hours: 178 },
    { name: 'Chokoretro',       cogs: 178, blocks: 35000, hours: 175 },
    { name: '12hotroom',        cogs: 175, blocks: 34500, hours: 172 },
    { name: 't1g37',            cogs: 173, blocks: 34200, hours: 170 },
    { name: 'ocllyn',           cogs: 171, blocks: 34000, hours: 169 },
    { name: 'Breadmanguy1',     cogs: 165, blocks: 33000, hours: 164 },
    { name: 'Aidtilop',         cogs: 160, blocks: 32000, hours: 158 },
    { name: 'Eviquel',          cogs: 149, blocks: 30000, hours: 148 },
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
        const start  = performance.now();
        const dur    = 700;
        const tick   = now => {
            const t = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - t, 4);
            el.textContent = fmt(Math.round(e * target));
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

    const render = async () => {
        const data = await loadLeaderboard();
        const items = sorted(data, activeKey);
        
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
                            <span data-val="${val}">${fmt(val)}</span>
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
                            <span data-val="${val}">${fmt(val)}</span>
                            ${cat.unit}
                        </div>
                    </div>
                `;
            }
        }).join('');

        animateScores(list);

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
            render();
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
                <span class="lhc-val">${fmt(p.blocks)}</span>
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
