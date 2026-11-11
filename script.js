/*LOAD STABILITY*/
// Always start at the top: restoring a mid-page scroll position before the
// scroll animations are measured is what threw elements out of place on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });   // no jumps when the mobile address bar hides

// // Initialize Lenis
// const lenis = new Lenis();

// // Use requestAnimationFrame to continuously update the scroll
// function raf(time) {
//   lenis.raf(time);
//   requestAnimationFrame(raf);
// }


/*LOW-POWER DEVICES*/
// Cheaper effects on small screens with few CPU cores or little memory,
// and for anyone who has "data saver" switched on.
const LOW_POWER = (() => {
    const small = window.matchMedia('(max-width: 991.98px)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;              // not reported by Safari: treated as fine
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    return saveData || (small && (cores <= 4 || memory <= 4));
})();
window.LOW_POWER = LOW_POWER;
document.documentElement.classList.toggle('low-power', LOW_POWER);

/*PROJECT TEXT (for search and skill links)*/
const projText = p => [p.intro || '', ...(p.points || []), ...(p.sections || []).flatMap(s => [s.heading, s.text || '', ...(s.points || [])])];

/*RESPONSIVE IMAGES*/
// Big pictures also come in a 600px-wide copy (name-600.webp) for phones.
// If you add a large image, save a -600 copy next to it and list it here.
const SMALL_COPIES = ['project-python-quest', 'project-marketing', 'project-3d', 'project-cancer', 'project-chess', 'project-english',
                      'project-hearingaid', 'project-photo-gallery', 'photo-nhs-hackathon'];
function responsive(img, src, sizes) {
    img.src = src;
    const m = src.match(/([^/]+)\.webp$/);
    if (m && SMALL_COPIES.includes(m[1])) {
        img.srcset = `${src.replace(/\.webp$/, '-600.webp')} 600w, ${src} 1200w`;
        img.sizes = sizes;
    }
    return img;
}
const responsiveAttrs = (src, sizes) => {
    const m = src.match(/([^/]+)\.webp$/);
    return (m && SMALL_COPIES.includes(m[1])) ? `srcset="${src.replace(/\.webp$/, '-600.webp')} 600w, ${src} 1200w" sizes="${sizes}"` : '';
};

/*HORIZONTAL SCROLL*/
const hDist = () => document.querySelector('.horizontal').offsetWidth - window.innerWidth;
function initializeHorizontalScroll() {
    return gsap.to('.horizontal', {
        x: () => -hDist(),
        ease: 'none',
        scrollTrigger: {
            trigger: '.horizontal-wrapper',
            start: 'top top',
            end: () => '+=' + hDist(),
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1
        }
    });
}

/*MOON ASTRONAUT: Projects corner → centre of Skills → seat on the CV page*/
function setupMoonFlight() {
    const parked = document.querySelector('.proj-moon');
    const centre = document.querySelector('.skills-moon');
    const seat   = document.querySelector('.page7 .astronaut-moon');
    const flyer  = document.querySelector('.moon-traveller');
    if (!parked || !centre || !seat || !flyer) return;
    const skillsPage = document.querySelector('.page-skills');
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const show = who => {
        parked.style.visibility = who === 'parked' ? 'visible' : 'hidden';
        centre.style.opacity = who === 'centre' ? 1 : 0;
        seat.style.opacity   = who === 'seat'   ? 1 : 0;
        flyer.style.visibility = who === 'flying' ? 'visible' : 'hidden';
    };
    const fly = (a, b, p) => {
        const e = ease(p), arc = Math.sin(Math.PI * p) * window.innerHeight * 0.1;
        gsap.set(flyer, { x: lerp(a.left, b.left, e), y: lerp(a.top, b.top, e) - arc,
                          width: lerp(a.width, b.width, e), rotation: Math.sin(Math.PI * p) * -10 });
    };
    const leg1 = ScrollTrigger.create({ trigger: skillsPage, start: 'top bottom', end: 'top top' });
    const leg2 = ScrollTrigger.create({ trigger: '.page-milestones', start: 'top bottom', endTrigger: '.page7', end: 'top top' });
    function update() {
        const p1 = leg1.progress, p2 = leg2.progress;
        flyer.style.opacity = 1;
        if (p1 <= 0.001) return show('parked');
        if (p1 < 0.999) {
            // start from wherever the parked moon is drawn right now (live, not remembered),
            // so the hand-over is seamless in both directions and after a menu jump or resize
            const pr = parked.getBoundingClientRect();
            fly({ left: pr.left, top: pr.top, width: pr.width || parked.offsetWidth }, centre.getBoundingClientRect(), p1);
            flyer.classList.remove('behind');
            return show('flying');
        }
        if (p2 <= 0.001) return show('centre');
        if (p2 < 0.999) { fly(centre.getBoundingClientRect(), seat.getBoundingClientRect(), p2); flyer.classList.add('behind'); return show('flying'); }
        show('seat');
    }
    show('parked');
    gsap.ticker.add(update);
}

/*MENU WARP*/
// The warp effect only plays when you jump to a section from the menu.
// Each link lands exactly on its section (Experience and Projects share the
// sideways section, so they get their own scroll positions).
function setupWorldTransitions() {
    const pin = () => ScrollTrigger.getAll().find(t => t.pin);
    const skillsTop = () => document.querySelector('.page-skills').getBoundingClientRect().top + window.scrollY;
    const spots = {
        '#Home':       { name: 'HOME',       top: () => 0 },
        '#About':      { name: 'ABOUT ME',   top: () => document.querySelector('.page2').getBoundingClientRect().top + window.scrollY },
        '#Experience': { name: 'EXPERIENCE', top: () => pin().start + 1 },
        '#Projects':   { name: 'PROJECTS',   top: () => pin().end },
        '#Skills':     { name: 'SKILLS',     top: () => skillsTop() },
        '#Resume':     { name: 'CV',         top: () => document.documentElement.scrollHeight - window.innerHeight },
    };
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        const spot = spots[link.getAttribute('href')];
        if (!spot) return;
        link.addEventListener('click', e => {
            e.preventDefault();
            if (window.spaceWarp) window.spaceWarp(spot.name);
            // jump while the screen is at its darkest, so the move is hidden by the warp
            setTimeout(() => window.scrollTo({ top: spot.top(), behavior: 'instant' }), 220);
        });
    });
}

/*SCROLL HINT on Home*/
(function scrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (!hint) return;
    const update = () => hint.classList.toggle('gone', window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/*CV ARROW: draws itself when the CV page arrives*/
(function cvArrow() {
    const arrow = document.querySelector('.cv-arrow');
    if (!arrow) return;
    ScrollTrigger.create({ trigger: '.page7', start: 'top 40%',
        onEnter: () => arrow.classList.add('drawn'), onLeaveBack: () => arrow.classList.remove('drawn') });
})();

/*TWINKLING STARS on Home, About and CV*/
(function twinkles() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = ['#ffffff', '#ffffff', '#ffe9a8', '#f1c40f', '#d4c2ff'];
    const sparkle = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 1c.8 5.6 3.4 8.2 11 11-7.6 2.8-10.2 5.4-11 11-.8-5.6-3.4-8.2-11-11 7.6-2.8 10.2-5.4 11-11z' fill='white'/%3E%3C/svg%3E\")";
    ['.page1', '.page2', '.page-skills', '.page7'].forEach(sel => {
        const page = document.querySelector(sel);
        if (!page) return;
        const layer = document.createElement('div');
        layer.className = 'twinkle-layer';
        layer.setAttribute('aria-hidden', 'true');
        const count = Math.round(Math.max(35, Math.min(110, window.innerWidth * window.innerHeight / 9000)) * (LOW_POWER ? 0.45 : 1));
        for (let i = 0; i < count; i++) {
            const s = document.createElement('span');
            const isSparkle = Math.random() < 0.22;
            const size = isSparkle ? 8 + Math.random() * 10 : 1.5 + Math.random() * 3;
            s.className = 'tw' + (isSparkle ? ' tw-sparkle' : '');
            s.style.left = (Math.random() * 100).toFixed(2) + '%';
            s.style.top = (Math.random() * 100).toFixed(2) + '%';
            s.style.width = s.style.height = size.toFixed(1) + 'px';
            const c = colors[(Math.random() * colors.length) | 0];
            if (isSparkle) { s.style.background = c; s.style.webkitMask = s.style.mask = sparkle + ' center / contain no-repeat'; }
            else { s.style.background = c; s.style.boxShadow = `0 0 ${size * 2}px ${c}`; }
            if (!reduce) {
                s.style.animationDuration = (1.8 + Math.random() * 3.5).toFixed(2) + 's';
                s.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
            }
            layer.appendChild(s);
        }
        page.prepend(layer);
    });
})();

/*SKILLS: a field of soft pills around the astronaut, lit by a "flashlight"*/
(function setupSkills() {
    const page = document.querySelector('.page-skills');
    const field = document.querySelector('.skill-field');
    const legend = document.querySelector('.skill-legend');
    if (!field || typeof skillGroups === 'undefined') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // legend: one coloured dot per group
    skillGroups.forEach((g, gi) => {
        const s = document.createElement('span');
        s.innerHTML = `<i class="cat-c${gi}"></i>${g.name}`;
        legend.appendChild(s);
    });

    // pills, mixed so colours spread across the page
    let seed = 11;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const items = [];
    const longest = Math.max(...skillGroups.map(g => g.skills.length));
    for (let i = 0; i < longest; i++) skillGroups.forEach((g, gi) => { if (g.skills[i]) items.push({ text: g.skills[i], gi }); });
    const pills = items.map((it, k) => {
        const wrap = document.createElement('span');
        wrap.className = 'sp-wrap';
        wrap.style.setProperty('--k', k);
        wrap.style.animationDelay = (-rand() * 8).toFixed(2) + 's';
        wrap.style.animationDuration = (6 + rand() * 5).toFixed(2) + 's';
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'skill-pill cat-c' + it.gi;
        pill.textContent = it.text;
        pill.title = skillGroups[it.gi].name;
        // which projects use this skill? ("SQL / MySQL" matches either word, "Git & GitHub" either, etc.)
        const alts = it.text.toLowerCase().split(/\s*(?:\/|&)\s*/).map(s => s.trim()).filter(s => s.length > 1);
        const uses = p => { const hay = [p.title, ...(p.tech || []), ...projText(p)].join(' ').toLowerCase(); return alts.some(a => new RegExp('(^|[^a-z])' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').test(hay)); };
        const count = (typeof projects !== 'undefined') ? projects.filter(uses).length : 0;
        if (count) {
            pill.classList.add('has-projects');
            pill.dataset.count = count;
            pill.title = `See ${count} project${count > 1 ? 's' : ''} using ${it.text}`;
        }
        pill.addEventListener('click', () => {
            pill.classList.add('tapped'); setTimeout(() => pill.classList.remove('tapped'), 1600);
            if (!count || !window.showProjectsForSkill) return;
            window.showProjectsForSkill(it.text, uses);
            const pin = ScrollTrigger.getAll().find(t => t.pin);
            if (window.spaceWarp) window.spaceWarp('PROJECTS');
            setTimeout(() => window.scrollTo({ top: pin.end, behavior: 'instant' }), 220);
        });
        wrap.appendChild(pill);
        field.appendChild(wrap);
        return { wrap, pill, cx: 0, cy: 0 };
    });

    // scatter them over the whole page without overlapping each other,
    // the title, the astronaut, the legend or the menu button
    function layout() {
        const pr = page.getBoundingClientRect();
        const W = pr.width, H = pr.height;
        if (!W) return;
        const rel = el => { const r = el.getBoundingClientRect(); return { l: r.left - pr.left, t: r.top - pr.top, r: r.right - pr.left, b: r.bottom - pr.top }; };
        const grow = (z, m) => ({ l: z.l - m, t: z.t - m, r: z.r + m, b: z.b + m });
        const blocked = [
            grow(rel(document.querySelector('.skills-title')), 10),
            grow(rel(document.querySelector('.skills-moon')), Math.min(30, W * 0.03)),
            grow(rel(legend), 8),
            { l: W - 74, t: 0, r: W, b: 78 }                     // menu button
        ];
        const placed = [];
        const hit = (z, list, gap) => list.some(o => z.l < o.r + gap && z.r > o.l - gap && z.t < o.b + gap && z.b > o.t - gap);
        seed = 23;
        const edge = 10;
        let squeezed = false;
        pills.forEach(p => {
            const w = p.pill.offsetWidth, h = p.pill.offsetHeight;
            let best = null;
            for (const gap of [14, 8, 3]) {
                for (let n = 0; n < 1500 && !best; n++) {
                    const x = edge + rand() * (W - w - edge * 2), y = edge + rand() * (H - h - edge * 2);
                    const z = { l: x, t: y, r: x + w, b: y + h };
                    if (!hit(z, blocked, 0) && !hit(z, placed, gap)) best = z;
                }
                if (best) break;
            }
            if (!best) { squeezed = true; const x = edge + rand() * (W - w - edge * 2), y = edge + rand() * (H - h - edge * 2); best = { l: x, t: y, r: x + w, b: y + h }; }
            placed.push(best);
            p.wrap.style.left = best.l + 'px';
            p.wrap.style.top = best.t + 'px';
            p.cx = (best.l + best.r) / 2; p.cy = (best.t + best.b) / 2;
        });
        // very small screens: if anything couldn't find its own space, shrink the pills one step and retry
        if (squeezed && !page.classList.contains('tight')) { page.classList.add('tight'); layout(); }
    }
    let lt = null;
    new ResizeObserver(() => { clearTimeout(lt); lt = setTimeout(() => { page.classList.remove('tight'); layout(); }, 80); }).observe(page);
    if (document.fonts) document.fonts.ready.then(layout);
    layout();

    // the "flashlight": pills brighten the closer they are to the cursor
    // (on touch screens a soft glow sweeps across the page instead)
    let mx = -9999, my = -9999, inView = false;
    new IntersectionObserver(e => { inView = e[0].isIntersecting; }).observe(page);
    if (finePointer) {
        page.addEventListener('mousemove', e => { const r = page.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
        page.addEventListener('mouseleave', () => { mx = my = -9999; });
    }
    function tick(now) {
        requestAnimationFrame(tick);
        if (!inView) return;
        const R = Math.max(160, Math.min(260, page.clientWidth * 0.16));
        let sweep = null;
        if (!reduce) {
            const span = page.clientWidth + page.clientHeight;
            sweep = ((now / 5200) % 1) * span * 1.5 - span * 0.25;
        }
        for (const p of pills) {
            let g = 0;
            if (finePointer) g = Math.max(0, 1 - Math.hypot(p.cx - mx, p.cy - my) / R);
            if (sweep !== null) g = Math.max(g, (finePointer ? 0.55 : 1) * Math.max(0, 1 - Math.abs(p.cx + p.cy - sweep) / 170));   // the blaze
            p.pill.style.setProperty('--glow', g.toFixed(3));
        }
    }
    requestAnimationFrame(tick);

    // pills fade in one after another as the page arrives
    ScrollTrigger.create({
        trigger: page, start: 'top 45%',
        onEnter: () => page.classList.add('lit'),
        onLeaveBack: () => page.classList.remove('lit')
    });
})();

/*MILESTONES: education, achievements & certificates drifting left → right*/
(function setupMilestones() {
    const track = document.querySelector('.ms-track');
    if (!track) return;
    const ICON = {
        edu: '<svg viewBox="0 0 100 80" aria-hidden="true"><path d="M50 8 L94 28 L50 48 L6 28Z" fill="#2b2a6e" stroke="#1b1638" stroke-width="3" stroke-linejoin="round"/><path d="M24 38 v18 c0 8 52 8 52 0 v-18 L50 50Z" fill="#3d3a8f" stroke="#1b1638" stroke-width="3" stroke-linejoin="round"/><path d="M86 32 v22" stroke="#f1c40f" stroke-width="3"/><circle cx="86" cy="58" r="5" fill="#f1c40f" stroke="#1b1638" stroke-width="2"/></svg>',
        cert: '<svg viewBox="0 0 100 80" aria-hidden="true"><rect x="14" y="8" width="72" height="56" rx="6" fill="#fbf3df" stroke="#1b1638" stroke-width="3"/><path d="M26 22h48M26 32h48M26 42h30" stroke="#b9a98a" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="58" r="11" fill="#f1c40f" stroke="#1b1638" stroke-width="3"/><path d="M66 66 l-4 12 8-4 4 6 2-12" fill="#ff8fb1" stroke="#1b1638" stroke-width="2" stroke-linejoin="round"/></svg>',
        medal: (badge, m) => {
            const col = { gold: ['#ffe27a', '#b8860b'], bronze: ['#ffc58f', '#9a5523'], silver: ['#f4f4f8', '#8a8ea3'], star: ['#d9ccff', '#5b3fd1'] }[m] || ['#ffe27a', '#b8860b'];
            return `<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M22 2 L36 34 L28 38 L12 6Z" fill="#ff8fb1" stroke="#1b1638" stroke-width="2.5" stroke-linejoin="round"/><path d="M58 2 L44 34 L52 38 L68 6Z" fill="#7fb8ff" stroke="#1b1638" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="62" r="27" fill="${col[0]}" stroke="#1b1638" stroke-width="3"/><circle cx="40" cy="62" r="20" fill="none" stroke="${col[1]}" stroke-width="2" stroke-dasharray="2 4"/><text x="40" y="69" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" font-weight="800" fill="#1b1638">${badge}</text><ellipse cx="30" cy="50" rx="7" ry="4" fill="#fff" opacity=".6" transform="rotate(-30 30 50)"/></svg>`;
        }
    };
    const cards = [];
    // picture for the card top: photo (fills) > logo (on a tile) > badge > certificate image > fallback
    const art = (x, fallback) => x.photo ? `<img class="ms-photo" src="${x.photo}" ${responsiveAttrs(x.photo, '(max-width: 700px) 92vw, 620px')} alt="" loading="lazy">`
        : x.logo ? `<span class="ms-logo-tile" style="background:${x.logoBg || '#fff'}"><img class="ms-logo" src="${x.logo}" alt="" loading="lazy"></span>`
        : fallback;
    const edu = (typeof education !== 'undefined') ? education : [];
    const ach = (typeof achievements !== 'undefined') ? achievements : [];
    const cer = (typeof certificates !== 'undefined') ? certificates : [];
    edu.forEach(e => cards.push({ kind: 'edu', tag: 'Education', icon: art(e, ICON.edu), title: e.title, sub: e.where, chips: [e.when, e.note].filter(Boolean) }));
    ach.forEach(a => cards.push({ kind: 'ach', tag: 'Achievement', icon: art(a, ICON.medal(a.badge, a.medal)), title: a.title, sub: a.where, chips: [a.place], link: a.link }));
    cer.forEach(c => cards.push({ kind: 'cert', tag: c.kind || 'Certificate', verified: c.verified, big: c.image ? `<img src="${c.image}" alt="${c.title}">` : null, icon: (c.logo || c.photo) ? art(c, '') : c.badge ? `<img class="ms-badge" src="${c.badge}" alt="${c.title} badge" width="400" height="400" loading="lazy" data-fallback="${c.issuer || ''}">` : c.image ? `<img src="${c.image}" alt="${c.title}" loading="lazy">` : (c.issuer ? `<span class="ms-issuer">${c.issuer}</span>` : ICON.cert), title: c.title, sub: c.where, chips: [c.when].filter(Boolean), link: c.link }));
    // mix the kinds so the strip alternates
    const byKind = k => cards.filter(c => c.kind === k);
    const lists = [byKind('edu'), byKind('ach'), byKind('cert')];
    const mixed = [];
    while (lists.some(l => l.length)) [1, 2, 0, 2, 1, 2].forEach(i => { if (lists[i].length) mixed.push(lists[i].shift()); });   // starts with the NHS win
    const make = c => {
        const card = document.createElement('article');
        card._data = c;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.className = 'ms-card ms-' + c.kind;
        card.innerHTML = `<div class="ms-art">${c.icon}<span class="ms-tag">${c.tag}</span></div>
            <div class="ms-info"><div class="ms-name"></div><div class="ms-sub"></div><div class="ms-chips"></div></div>`;
        card.querySelector('.ms-name').textContent = c.title;
        card.querySelector('.ms-sub').textContent = c.sub;
        card.querySelectorAll('img.ms-badge').forEach(img => img.addEventListener('error', () => {
            const s = document.createElement('span'); s.className = 'ms-issuer'; s.textContent = img.dataset.fallback || '★';
            img.replaceWith(s);
        }, { once: true }));
        const chips = card.querySelector('.ms-chips');
        c.chips.forEach(t => { const s = document.createElement('span'); s.className = 'ms-chip'; s.textContent = t; chips.appendChild(s); });
        return card;
    };
    // two copies back to back make the loop seamless
    // filter: Achievements (wins + degrees) and Certifications; both on by default
    const show = { ach: true, cert: true };
    function fill() {
        const list = mixed.filter(c => (c.kind === 'cert' ? show.cert : show.ach));
        track.replaceChildren();
        [0, 1].forEach(copy => list.forEach(c => { const n = make(c); if (copy) { n.setAttribute('aria-hidden', 'true'); n.tabIndex = -1; } track.appendChild(n); }));
        track.style.setProperty('--n', list.length);
    }
    fill();
    document.querySelectorAll('.ms-filter button').forEach(b => {
        b.addEventListener('click', e => {
            e.stopPropagation();
            const k = b.dataset.kind;
            if (show[k] && !show[k === 'ach' ? 'cert' : 'ach']) return;       // keep at least one on
            show[k] = !show[k];
            b.classList.toggle('on', show[k]);
            b.setAttribute('aria-pressed', show[k]);
            fill(); x = 0;
        });
    });

    /* ---- drift left → right; pause on hover; drag / swipe to scrub ---- */
    const strip = document.querySelector('.ms-strip');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = 0, last = performance.now(), hovering = false, dragging = false, startX = 0, startOff = 0, moved = 0;
    let glideTo = null, pauseUntil = 0;
    const cardStep = () => { const c = track.querySelector('.ms-card'); return c ? c.offsetWidth + parseFloat(getComputedStyle(track).gap || 16) : 260; };
    document.querySelector('.ms-prev').addEventListener('click', e => { e.stopPropagation(); glideTo = (glideTo ?? x) - cardStep(); });
    document.querySelector('.ms-next').addEventListener('click', e => { e.stopPropagation(); glideTo = (glideTo ?? x) + cardStep(); });
    const speed = 38;                                   // px per second
    const half = () => track.scrollWidth / 2;
    function frame(now) {
        requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (glideTo !== null) {                                        // arrow pressed: glide one card
            x += (glideTo - x) * Math.min(1, dt * 9);
            if (Math.abs(glideTo - x) < 0.5) { x = glideTo; glideTo = null; pauseUntil = now + 2500; }
        } else if (!hovering && !dragging && !reduce && !document.hidden && now > pauseUntil) x += speed * dt;
        const H = half() || 1;
        const t = ((x % H) + H) % H - H;                // always within one copy, so the strip never runs out
        track.style.transform = `translateX(${t.toFixed(1)}px)`;
    }
    requestAnimationFrame(frame);
    strip.addEventListener('mouseenter', () => { hovering = true; });
    strip.addEventListener('mouseleave', () => { hovering = false; });
    strip.addEventListener('pointerdown', e => { dragging = true; moved = 0; startX = e.clientX; startOff = x; strip.setPointerCapture(e.pointerId); });
    strip.addEventListener('pointermove', e => { if (!dragging) return; moved = Math.max(moved, Math.abs(e.clientX - startX)); x = startOff + (e.clientX - startX); });
    const end = () => { dragging = false; };
    strip.addEventListener('pointerup', e => {
        dragging = false;
        if (moved > 6) return;                                  // it was a drag, not a click
        const card = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest && n.closest('.ms-card')).find(Boolean);
        if (card) open(card._data);
    });
    strip.addEventListener('pointercancel', end);

    /* ---- click a card: open it in the cream logbook pop-up ---- */
    const modal = document.createElement('div');
    modal.className = 'exp-modal ms-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="exp-modal-panel" role="dialog" aria-modal="true" aria-label="Milestone"><button class="exp-close" aria-label="Close">&times;</button><div class="exp-modal-body"></div></div>';
    document.body.appendChild(modal);
    const body = modal.querySelector('.exp-modal-body');
    let opener = null;
    function open(c) {
        opener = document.activeElement;
        body.innerHTML = `<div class="log-tag">${c.tag.toUpperCase()}</div><div class="ms-modal-art ms-${c.kind}">${c.big || c.icon}</div>
            <div class="exp-role proj-log-title"></div><div class="exp-org"></div><div class="log-chips"></div>`;
        body.querySelector('.exp-role').textContent = c.title;
        body.querySelector('.exp-org').textContent = c.sub;
        const chips = body.querySelector('.log-chips');
        c.chips.forEach((t, i) => { const s = document.createElement('span'); s.className = 'log-chip' + (c.kind === 'ach' && i === 0 ? ' gold' : ''); s.textContent = (c.kind === 'ach' && i === 0 ? '★ ' : '') + t; chips.appendChild(s); });
        if (c.link) {
            const row = document.createElement('div'); row.className = 'bh-actions proj-links';
            const a = document.createElement('a'); a.className = 'log-cert'; a.href = c.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = /\.pdf$/.test(c.link) ? 'Open full certificate ↗' : 'Show credential ↗';
            row.appendChild(a); body.appendChild(row);
        }
        modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        modal.querySelector('.exp-close').focus({ preventScroll: true });
    }
    function close() {
        modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        if (opener) opener.focus({ preventScroll: true });
    }
    track.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const card = e.target.closest('.ms-card'); if (card) { e.preventDefault(); open(card._data); } } });
    modal.querySelector('.exp-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
})();

/*STAR GARLAND (About page)*/
// Hand-drawn string of hanging stars, rebuilt to fit any screen width.
(function starGarland() {
    const box = document.querySelector('.star-garland');
    if (!box) return;
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
    const star = (cx, cy, R) => {
        let d = '';
        for (let i = 0; i < 10; i++) {
            const r = i % 2 ? R * 0.5 : R, a = -Math.PI / 2 + i * Math.PI / 5;
            d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1);
        }
        return d + 'Z';
    };
    let seed = 7;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };   // same layout every load
    let lastW = 0;
    function build() {
        const W = box.clientWidth, H = box.clientHeight;
        if (!W || W === lastW) return;
        lastW = W; seed = 7;
        const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
        const top = -4, sag = H * 0.38;
        const swoops = W > 1100 ? 3 : W > 650 ? 2 : 1;
        const segW = W / swoops;
        const R = Math.max(11, Math.min(26, W / 55));
        let path = '';
        const hangers = [];
        for (let s = 0; s < swoops; s++) {
            const x0 = s * segW, x1 = x0 + segW, cx = (x0 + x1) / 2, cy = top + sag * 2;
            path += `M${x0},${top} Q${cx},${cy} ${x1},${top} `;
            const n = Math.max(3, Math.round(segW / (R * 4.6)));
            for (let i = 0; i < n; i++) {
                const t = 0.12 + (0.76 * i) / (n - 1 || 1);
                const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
                const y = (1 - t) ** 2 * top + 2 * (1 - t) * t * cy + t * t * top;
                hangers.push({ x, y });
            }
        }
        svg.appendChild(mk('path', { d: path, fill: 'none', stroke: '#2a1f5c', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.55 }));
        svg.appendChild(mk('path', { d: path, fill: 'none', stroke: '#b993ff', 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
        hangers.forEach((h, i) => {
            const r = R * (0.75 + rand() * 0.5);
            const len = Math.min(H - h.y - r * 1.2, r * (1 + rand() * 1.6));
            if (len < 4) return;
            const g = mk('g', { class: 'gs' });
            g.style.transformOrigin = `${h.x}px ${h.y}px`;
            g.style.animationDelay = (-rand() * 4).toFixed(2) + 's';
            g.style.animationDuration = (3 + rand() * 2).toFixed(2) + 's';
            const sy = h.y + len + r * 0.9;
            const tilt = (rand() - 0.5) * 30;
            g.appendChild(mk('line', { x1: h.x, y1: h.y, x2: h.x, y2: sy - r * 0.8, stroke: '#2c4aa0', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
            const st = mk('g', { transform: `rotate(${tilt.toFixed(1)} ${h.x} ${sy})` });
            st.appendChild(mk('path', { d: star(h.x + 2.5, sy + 2.5, r), fill: '#ff8fb1', 'stroke-linejoin': 'round' }));     // pink offset, like the artwork
            st.appendChild(mk('path', { d: star(h.x, sy, r), fill: '#ffd36e', stroke: '#f6b73c', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
            st.appendChild(mk('circle', { cx: h.x - r * 0.25, cy: sy - r * 0.3, r: r * 0.16, fill: '#fff', opacity: 0.7 }));
            g.appendChild(st);
            svg.appendChild(g);
            svg.appendChild(mk('circle', { cx: h.x, cy: h.y, r: 3, fill: '#2c4aa0' }));          // knot on the string
        });
        box.replaceChildren(svg);
    }
    new ResizeObserver(build).observe(box);
    build();
})();

/*BLACK HOLE GAME (coming soon)*/
(function blackHoleGame() {
    const hole = document.querySelector('.black-hole');
    if (!hole) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const EMAIL = 'velingkarcaymann@gmail.com';
    const waLink = document.querySelector('a[href*="wa.me"]');
    const WHATSAPP = waLink ? waLink.href.split('?')[0] : null;

    // Pop-up (reuses the logbook pop-up styling)
    const modal = document.createElement('div');
    modal.className = 'exp-modal bh-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="exp-modal-panel bh-panel" role="dialog" aria-modal="true" aria-label="Black hole game">
            <button class="exp-close" aria-label="Close">&times;</button>
            <div class="bh-stage bh-loading">
                <div class="log-tag">INITIATING GAME…</div>
                <div class="bh-title">Event Horizon</div>
                <div class="bh-bar"><span></span></div>
                <div class="bh-status">Calibrating gravity…</div>
            </div>
            <div class="bh-stage bh-soon" hidden>
                <div class="log-tag">TRANSMISSION LOST</div>
                <div class="bh-title">Coming soon…</div>
                <p class="bh-text">I'm building a little black-hole game for this universe. Interested? Drop me a message and I'll beam you an invite when it launches.</p>
                <textarea class="bh-msg" rows="3" placeholder="Hey Caymann, count me in! …"></textarea>
                <div class="bh-actions">
                    <a class="log-cert bh-email" href="#">Send by email</a>
                    ${WHATSAPP ? '<a class="bh-wa" href="#" target="_blank" rel="noopener">WhatsApp</a>' : ''}
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const loading = modal.querySelector('.bh-loading');
    const soon = modal.querySelector('.bh-soon');
    const bar = modal.querySelector('.bh-bar span');
    const status = modal.querySelector('.bh-status');
    const msg = modal.querySelector('.bh-msg');

    // email / WhatsApp links carry whatever the visitor typed
    const text = () => (msg.value.trim() || "Hey Caymann! I'm interested in your black hole game") + '\n\n— sent from your portfolio';
    modal.querySelector('.bh-email').addEventListener('click', e => {
        e.preventDefault();
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Black hole game: I'm interested!")}&body=${encodeURIComponent(text())}`;
    });
    const wa = modal.querySelector('.bh-wa');
    if (wa) wa.addEventListener('click', () => { wa.href = `${WHATSAPP}?text=${encodeURIComponent(text())}`; });

    let timers = [], busy = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    function runLoader() {
        loading.hidden = false; soon.hidden = true;
        bar.style.width = '0%';
        const steps = [['Calibrating gravity…', 18], ['Spawning asteroids…', 41], ['Bending spacetime…', 67], ['Crossing the event horizon…', 88], ['Signal lost', 93]];
        const gap = reduceMotion ? 150 : 520;
        steps.forEach(([label, pct], i) => later(() => { status.textContent = label; bar.style.width = pct + '%'; }, 200 + i * gap));
        later(() => panel.classList.add('glitch'), 200 + steps.length * gap);
        later(() => {
            panel.classList.remove('glitch');
            loading.hidden = true; soon.hidden = false;
        }, 200 + steps.length * gap + 450);
    }
    const panel = modal.querySelector('.bh-panel');
    function open() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        modal.querySelector('.exp-close').focus({ preventScroll: true });
        runLoader();
    }
    function close() {
        timers.forEach(clearTimeout); timers = [];
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        document.body.classList.remove('bh-swallow');
        busy = false;
        hole.focus({ preventScroll: true });
    }
    hole.addEventListener('click', () => {
        if (busy) return;
        busy = true;
        if (reduceMotion || !window.blackHolePull) { open(); return; }
        const r = hole.querySelector('img').getBoundingClientRect();
        hole.classList.add('pulling');
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.47;
        window.blackHolePull(cx, cy);
        const main = document.querySelector('.main'), mr = main.getBoundingClientRect();
        main.style.transformOrigin = `${cx - mr.left}px ${cy - mr.top}px`;
        document.body.classList.add('bh-swallow');
        setTimeout(() => { open(); hole.classList.remove('pulling'); }, 1150);
    });
    modal.querySelector('.exp-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
})();

/*TYPING EFFECT*/
class TypingEffect {
    constructor(words, prefix = "I am ") {
        this.words = words;
        this.prefix = prefix;
        this.currentWordIndex = 0;
        this.isDeleting = false;
        this.text = '';
        this.charIndex = 0;
        this.contentDiv = document.querySelector('.content1');
    }

    type() {
        const currentWord = this.words[this.currentWordIndex];
        
        if (!this.isDeleting && this.charIndex < currentWord.length) {
            this.text = this.prefix + currentWord.substring(0, this.charIndex + 1);
            this.charIndex++;
        } else if (this.isDeleting && this.charIndex >= 0) {
            this.text = this.prefix + currentWord.substring(0, this.charIndex);
            this.charIndex--;
        }
        
        this.contentDiv.textContent = this.text;
        
        let typeSpeed = 150;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === currentWord.length) {
            typeSpeed = 3500;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

/*INITIALIZATION*/
document.addEventListener('DOMContentLoaded', () => {
    // Initialize horizontal scroll
    // Boat astronaut: starts tiny and far away, then zooms in to the bottom-left of Projects
    // Boat astronaut: emerges from behind the carousel and curves down into the bottom-left
    const boat = document.querySelector('.proj-boat');
    const toCarousel = () => {               // offset from resting spot to the carousel centre
        const w = boat.offsetWidth, h = boat.offsetHeight;
        const restX = boat.offsetLeft - window.innerWidth + w / 2;      // resting centre on the Projects screen
        const restY = boat.offsetTop + h / 2;
        return { x: window.innerWidth * 0.5 - restX, y: window.innerHeight * 0.55 - restY };
    };
    gsap.set(boat, { x: () => toCarousel().x, y: () => toCarousel().y, scale: 0.25, opacity: 0 });
    gsap.to(boat, {
        keyframes: [
            { x: () => toCarousel().x * 0.85, y: () => toCarousel().y * 0.95, scale: 0.35, opacity: 0, duration: 0.15 },
            { x: () => toCarousel().x * 0.45, y: () => toCarousel().y * 0.85, scale: 0.55, opacity: 0, duration: 0.3 },   // still hidden behind the cards
            { x: () => toCarousel().x * 0.2,  y: () => toCarousel().y * 0.6,  scale: 0.75, opacity: 1, duration: 0.2 },   // appears once clear of them
            { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.35 }                                                          // drops into the corner
        ],
        ease: 'none',
        scrollTrigger: {
            trigger: '.horizontal-wrapper',
            start: () => 'top+=' + Math.round(hDist() * 0.55) + ' top',
            end: () => '+=' + Math.round(hDist() * 0.45),
            scrub: 1.2,
            invalidateOnRefresh: true
        }
    });
    // Moon astronaut: also sails out from behind the carousel, into the bottom-right corner
    const moonP = document.querySelector('.proj-moon');
    const mPh = () => window.innerWidth < 576;
    const moonToCarousel = () => {
        if (window.innerWidth < 576) return { x: 0, y: 0 };   // small screens: he just sits in his corner
        const w = moonP.offsetWidth, h = moonP.offsetHeight;
        const restX = moonP.offsetLeft - window.innerWidth + w / 2;
        const restY = moonP.offsetTop + h / 2;
        return { x: window.innerWidth * 0.5 - restX, y: window.innerHeight * 0.55 - restY };
    };
    gsap.set(moonP, { x: () => moonToCarousel().x, y: () => moonToCarousel().y, scale: () => (mPh() ? 1 : 0.25), opacity: () => (mPh() ? 1 : 0) });
    gsap.to(moonP, {
        keyframes: [
            { x: () => moonToCarousel().x * 0.85, y: () => moonToCarousel().y * 0.95, scale: () => (mPh() ? 1 : 0.35), opacity: () => (mPh() ? 1 : 0), duration: 0.15 },
            { x: () => moonToCarousel().x * 0.45, y: () => moonToCarousel().y * 0.85, scale: () => (mPh() ? 1 : 0.55), opacity: () => (mPh() ? 1 : 0), duration: 0.3 },   // hidden behind the cards
            { x: () => moonToCarousel().x * 0.2,  y: () => moonToCarousel().y * 0.6,  scale: () => (mPh() ? 1 : 0.75), opacity: 1, duration: 0.2 },
            { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.35 }
        ],
        ease: 'none',
        scrollTrigger: {
            trigger: '.horizontal-wrapper',
            start: () => 'top+=' + Math.round(hDist() * 0.6) + ' top',
            end: () => '+=' + Math.round(hDist() * 0.4),
            scrub: 1.2,
            invalidateOnRefresh: true
        }
    });
    // gentle rocking (done here, not in CSS, so it doesn't fight the zoom)
    gsap.fromTo('.proj-boat', { rotation: -4 }, { rotation: 4, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    // created after the boat trigger on purpose: triggers made after a pin measure from the wrong place
    initializeHorizontalScroll();
    setupWorldTransitions();
    setupMoonFlight();

    
    // Initialize typing effect
    const typingEffect = new TypingEffect([
        "a tech enthusiast!",
        "a software engineer!",
        "a problem solver!",
        "an AI enthusiast!",
        "a machine learning enthusiast!",
        "an NLP enthusiast!",
        "a computer vision enthusiast!",
        "a multimodal AI enthusiast!",
        "a systems designer!",
        "a full-stack developer!",
        "a web developer!",
        "an application developer!",
        "a data scientist!",
        "a data analyst!",
        "a data engineer!",
        "a software architect enthusiast!",
        "a research enthusiast!",
        "a lifelong learner!",
    ]);
    typingEffect.type();

});



/*MOBILE NAV*/
const navButton = document.querySelector('.mobile-nav-button');
const navIcon = document.querySelector('.nav-icon');
const mobileNav = document.querySelector('.mobile-nav');

navButton.addEventListener('click', () => {
    navIcon.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// When clicking a nav link, make sure to remove both active classes
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navIcon.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});



/*ANIMATIONS*/  
gsap.from('.star-garland, .page2 .title, .page2 .content, .black-moon', {
    opacity: 0,
    y: 30,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top 80%',
        end: 'center center',
        scrub: 2,        
    },
    stagger: 0.5,
}); 

// Add rotation animation for the earth
gsap.to('.earth', {
    rotation: 360,
    duration: 3,
    ease: "none",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top 80%',
        end: 'center center',
        scrub: 2,
    },
}); 

// Add floating animation for the astronaut-moon
gsap.to('.astronaut-moon', {
    y: 20,
    duration: 2,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
}); 

// Rotate black moon on scroll instead of continuously
gsap.to(".black-moon", {
    rotation: 360,
    ease: "none",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
    }
});


// Astronaut holding the star floats up slowly: the rise is stretched over the whole
// sideways slide plus part of the scroll on to the CV page
gsap.fromTo('.astronaut-star',
    { top: '100%' },
    {
        top: '-65%',
        ease: 'none',
        scrollTrigger: {
            trigger: '.horizontal-wrapper',
            start: () => 'top+=' + Math.round(hDist() * 0.08) + ' top',
            // on phones he finishes rising before Projects settles, so he never sits beside the card
            end: () => '+=' + Math.round(window.innerWidth < 576 ? hDist() * 0.8 : hDist() * 0.92 + window.innerHeight * 0.7),
            scrub: 2.5,
            invalidateOnRefresh: true
        }
    });

// Add this with your other GSAP animations
gsap.from(".social-links .social-icon", {
    y:1,
    duration: 2,
    stagger: 0.2,
    repeat: -1,
    yoyo: true,
});




// Add this to your JavaScript file




 
/*CV: keep the "Let's connect" ring sized to the earth and centred on it, on every screen*/
(function earthRing() {
    const ring = document.querySelector('.earth-ring'), earth = document.querySelector('.page7 .earth7');
    if (!ring || !earth) return;
    const place = () => {
        const w = earth.offsetWidth, h = earth.offsetHeight;   // layout size: unaffected by the spin
        if (!w) return;
        ring.style.width = Math.round(Math.max(w, h) * 1.17) + 'px';
        ring.style.left = Math.round(earth.offsetLeft + w / 2) + 'px';
        ring.style.top = Math.round(earth.offsetTop + h / 2) + 'px';
    };
    place();
    earth.addEventListener('load', place);
    window.addEventListener('resize', place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(earth);
})();

gsap.to('.earth7', {
    duration: 10,
    rotation: 360,
    ease: "none",
    repeat: -1,
}); 

 

// Keep the loading screen up until images AND fonts are in, then measure
// every scroll animation once with the final layout, then reveal the page.
(function revealWhenReady() {
    const loader = document.querySelector('.loading-screen');
    // only the first screen's pictures need to be ready; the rest load lazily while you read
    const firstScreen = Promise.all([...document.querySelectorAll('.page1 img, .loading-screen img')].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })));
    const pageLoaded = firstScreen;
    // when everything else has arrived, re-measure the scroll animations once more
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    // ask for both fonts explicitly: fonts.ready alone can resolve before an @import'ed font has even started
    const fontsLoaded = document.fonts
        ? Promise.all([document.fonts.load('1em "Rubik Vinyl"'), document.fonts.load('1em "Schoolbell"'), document.fonts.load('1em "Nunito"')]).catch(() => {}).then(() => document.fonts.ready)
        : Promise.resolve();
    const minTime = new Promise(r => setTimeout(r, 700));          // avoid a jarring flash
    const safety = new Promise(r => setTimeout(r, 8000));          // never get stuck on slow networks
    Promise.race([Promise.all([pageLoaded, fontsLoaded, minTime]), safety]).then(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
        setTimeout(() => { window.__siteRevealed = true; }, 300);
        // Safety net: if ANYTHING changes the layout later (a late font, an image,
        // the window/iframe resizing), re-measure the scroll animations.
        let lastW = window.innerWidth, lastH = document.body.scrollHeight, t = null;
        const remeasure = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };
        new ResizeObserver(() => {
            const w = window.innerWidth, h = document.body.scrollHeight;
            if (w !== lastW || Math.abs(h - lastH) > 2) { lastW = w; lastH = h; remeasure(); }
        }).observe(document.body);
        if (document.fonts) document.fonts.addEventListener('loadingdone', remeasure);
        setTimeout(() => ScrollTrigger.refresh(), 1200);
        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                loader.style.display = 'none';
                if (window.showMusicPrompt) setTimeout(window.showMusicPrompt, 600);
            }
        });
    });
})();

/*EXPERIENCE*/
// The list of roles lives in data.js


(function setupExperience() {
    const list = document.querySelector('.exp-stops');
    const orbit = document.querySelector('.exp-orbit');
    const pathEl = document.querySelector('.exp-path path');
    const svgEl = document.querySelector('.exp-path');
    const modal = document.querySelector('.exp-modal');
    const body = document.querySelector('.exp-modal-body');
    if (!list || !modal) return;

    // "Tap" on touch screens, "Click" with a mouse
    const verb = document.querySelector('.exp-verb');
    if (verb && window.matchMedia('(hover: hover)').matches) verb.textContent = 'Click';

    /* ---------- hand-made planet artwork (one style per role, cycles) ---------- */
    const PLANETS = [
        { light: '#d4c2ff', dark: '#5b3fd1', ring: '#f1c40f' },               // purple, gold ring
        { light: '#9ff5cf', dark: '#1f8f74', craters: true },                 // mint moon
        { light: '#ffd59a', dark: '#e0672a', ring: '#ff9dbf' },               // orange, pink ring
        { light: '#ffb3cf', dark: '#c2386f', craters: true },                 // pink moon
        { light: '#a9dcff', dark: '#2f62d1', ring: '#9ff5cf' },               // blue, mint ring
    ];
    let uid = 0;
    function planetSVG(i) {
        const p = PLANETS[i % PLANETS.length];
        const id = 'pg' + (uid++);
        const ink = '#1b1638';
        const ringBack  = p.ring ? `<g transform="rotate(-18 60 60)"><path d="M8 60 A52 15 0 0 1 112 60" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/><path d="M8 60 A52 15 0 0 1 112 60" fill="none" stroke="${p.ring}" stroke-width="4.5" stroke-linecap="round"/></g>` : '';
        const ringFront = p.ring ? `<g transform="rotate(-18 60 60)"><path d="M8 60 A52 15 0 0 0 112 60" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/><path d="M8 60 A52 15 0 0 0 112 60" fill="none" stroke="${p.ring}" stroke-width="4.5" stroke-linecap="round"/></g>` : '';
        const craters = p.craters
            ? `<circle cx="47" cy="68" r="7" fill="${p.dark}" opacity=".45"/><circle cx="72" cy="48" r="5" fill="${p.dark}" opacity=".4"/><circle cx="70" cy="76" r="4" fill="${p.dark}" opacity=".35"/><circle cx="52" cy="45" r="3" fill="${p.dark}" opacity=".35"/>`
            : `<path d="M28 58 Q60 50 92 60" fill="none" stroke="${p.dark}" stroke-width="4" opacity=".35" stroke-linecap="round"/><path d="M31 72 Q60 66 89 74" fill="none" stroke="${p.dark}" stroke-width="3" opacity=".25" stroke-linecap="round"/>`;
        return `<svg viewBox="0 0 120 120" aria-hidden="true">
            <defs><radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${p.light}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>
            <clipPath id="${id}c"><circle cx="60" cy="60" r="${p.ring ? 33 : 40}"/></clipPath></defs>
            ${ringBack}
            <circle cx="60" cy="60" r="${p.ring ? 34 : 41}" fill="url(#${id})" stroke="${ink}" stroke-width="3.5"/>
            <g clip-path="url(#${id}c)">${craters}</g>
            <ellipse cx="47" cy="44" rx="9" ry="5" fill="#fff" opacity=".55" transform="rotate(-30 47 44)"/>
            ${ringFront}
        </svg>`;
    }

    window.planetSVG = planetSVG;   // shared with the Projects carousel

    const el = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    };

    /* ---------- planets ---------- */
    const stops = experiences.map((x, i) => {
        const li = el('li');
        const btn = el('button', 'exp-stop');
        btn.setAttribute('aria-label', `${x.role} at ${x.org} — open details`);
        const planet = el('span', 'exp-planet');
        planet.innerHTML = planetSVG(i);
        planet.style.setProperty('--d', (i * -1.3) + 's');
        if (i === 0) planet.appendChild(el('span', 'exp-badge', 'LATEST'));
        const text = el('span', 'exp-text');
        text.appendChild(el('span', 'exp-role', x.role));
        text.appendChild(el('span', 'exp-org', x.org));
        if (x.dates) text.appendChild(el('span', 'exp-when', x.dates + (x.certificate ? '  ·  Certified' : '')));
        btn.append(planet, text);
        btn.addEventListener('click', () => open(i));
        li.appendChild(btn);
        list.appendChild(li);
        return planet;
    });

    /* ---------- dotted orbit line through the planet centres ---------- */
    function drawOrbit() {
        const box = orbit.getBoundingClientRect();
        if (!box.width) return;
        svgEl.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
        const pts = stops.map(p => {
            const r = p.getBoundingClientRect();
            return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top + orbit.scrollTop];
        });
        if (!pts.length) return;
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        const vertical = pts.length > 1 && (Math.max(...ys) - Math.min(...ys)) > (Math.max(...xs) - Math.min(...xs));
        const first = pts[0], last = pts[pts.length - 1];
        // lead in / out so the orbit looks like it continues off-screen
        const all = vertical
            ? [[first[0] - 14, first[1] - 70], ...pts, [last[0] + 14, last[1] + 70]]
            : [[-40, first[1] + 30], ...pts, [box.width + 40, last[1] - 30]];
        // smooth curve (Catmull-Rom → Bézier)
        let d = `M${all[0][0]},${all[0][1]}`;
        for (let i = 0; i < all.length - 1; i++) {
            const p0 = all[i - 1] || all[i], p1 = all[i], p2 = all[i + 1], p3 = all[i + 2] || p2;
            const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
            const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
            d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
        }
        pathEl.setAttribute('d', d);
    }
    // planets bob, so measure from their (un-animated) wrapper — redraw on any layout change
    new ResizeObserver(drawOrbit).observe(orbit);
    window.addEventListener('load', drawOrbit);
    if (document.fonts) document.fonts.ready.then(drawOrbit);
    drawOrbit();

    /* ---------- small screens: arrows instead of a scrollbar ---------- */
    const upBtn = document.querySelector('.exp-up'), downBtn = document.querySelector('.exp-down');
    const btnBox = document.querySelector('.exp-scroll-btns');
    function syncArrows() {
        const over = orbit.scrollHeight > orbit.clientHeight + 4;
        btnBox.classList.toggle('show', over);
        upBtn.disabled = orbit.scrollTop <= 2;
        downBtn.disabled = orbit.scrollTop + orbit.clientHeight >= orbit.scrollHeight - 2;
    }
    const step = dir => {
        const li = list.querySelector('li');
        const h = li ? li.getBoundingClientRect().height + 20 : orbit.clientHeight * 0.6;
        orbit.scrollBy({ top: dir * h, behavior: 'smooth' });
    };
    upBtn.addEventListener('click', () => step(-1));
    downBtn.addEventListener('click', () => step(1));
    orbit.addEventListener('scroll', syncArrows, { passive: true });
    new ResizeObserver(syncArrows).observe(orbit);
    syncArrows();

    /* ---------- details pop-up ---------- */
    let current = 0;
    function render(i) {
        current = (i + experiences.length) % experiences.length;
        const x = experiences[current];
        body.innerHTML = '';
        body.appendChild(el('div', 'log-tag', `EXPERIENCE · ${String(current + 1).padStart(2, '0')}`));
        const head = el('div', 'log-head');
        const icon = el('span'); icon.innerHTML = planetSVG(current);
        const titles = el('div');
        titles.appendChild(el('div', 'exp-role', x.role));
        titles.appendChild(el('div', 'exp-org', x.org));
        head.append(icon.firstElementChild, titles);
        body.appendChild(head);
        const chips = el('div', 'log-chips');
        if (x.dates)    chips.appendChild(el('span', 'log-chip', x.dates));
        if (x.location) chips.appendChild(el('span', 'log-chip', x.location));
        if (x.type)     chips.appendChild(el('span', 'log-chip', x.type));
        if (chips.children.length) body.appendChild(chips);
        if (x.points && x.points.length) {
            const ul = el('ul', 'log-points');
            x.points.forEach(p => ul.appendChild(el('li', '', p)));
            body.appendChild(ul);
        } else {
            body.appendChild(el('p', 'log-empty', 'Details coming soon.'));
        }
        if (x.certificate) {
            const cert = el('a', 'log-cert', 'View certificate ↗');
            cert.href = x.certificate;
            cert.target = '_blank';
            cert.rel = 'noopener';
            body.appendChild(cert);
        }
        if (experiences.length > 1) {
            const nav = el('div', 'log-nav');
            const prev = el('button', '', '◀ Previous');
            const next = el('button', '', 'Next ▶');
            prev.addEventListener('click', () => render(current - 1));
            next.addEventListener('click', () => render(current + 1));
            nav.append(prev, el('span', 'log-count', `${current + 1} / ${experiences.length}`), next);
            body.appendChild(nav);
        }
    }
    let opener = null;
    function open(i) {
        opener = document.activeElement;
        render(i);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';   // stop the page scrolling behind
        modal.querySelector('.exp-close').focus({ preventScroll: true });
    }
    function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        if (opener) opener.focus({ preventScroll: true });
    }
    modal.querySelector('.exp-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') render(current - 1);
        else if (e.key === 'ArrowRight') render(current + 1);
    });
})();


/*PROJECTS: orbit carousel + categories + search + project log*/
// No inner scrolling anywhere, so the page scroll always flows on to the CV.
(function setupProjects() {
    const stage = document.querySelector('.proj-stage');
    const track = document.querySelector('.proj-track');
    const chipsBox = document.querySelector('.proj-chips');
    const search = null;
    const counter = document.querySelector('.proj-count');
    const bar = document.querySelector('.proj-progress span');
    if (!track || typeof projects === 'undefined') return;
    const cats = Object.fromEntries(projectCategories.map((c, i) => [c.id, { ...c, idx: i }]));
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
    const PLANET_FOR_CAT = [0, 2, 4, 1, 3];     // planet style per category
    let activeCat = 'all', query = '', skill = null, visible = [], cards = [], current = 0;

    /* ---- category tabs ---- */
    const tabs = [{ id: 'all', name: 'All' }, ...projectCategories].map(c => {
        const count = c.id === 'all' ? projects.length : projects.filter(p => p.category === c.id).length;
        if (!count) return null;
        const b = el('button', 'proj-chip');
        b.setAttribute('role', 'tab');
        b.dataset.id = c.id;
        const ci = projectCategories.findIndex(x => x.id === c.id);
        b.innerHTML = `${ci >= 0 ? `<i class="cat-dot cat-${ci}"></i>` : ''}${c.name} <em>${count}</em>`;
        b.addEventListener('click', () => { activeCat = c.id; skill = null; build(); });
        chipsBox.appendChild(b);
        return b;
    }).filter(Boolean);
    // compact filter: a small button that opens the category list
    const filterBtn = document.createElement('button');
    filterBtn.type = 'button';
    filterBtn.className = 'proj-filter-btn';
    filterBtn.setAttribute('aria-haspopup', 'true');
    filterBtn.setAttribute('aria-expanded', 'false');
    const filterMenu = document.createElement('div');
    filterMenu.className = 'proj-filter-menu';
    tabs.forEach(t => filterMenu.appendChild(t));
    chipsBox.append(filterBtn, filterMenu);
    const setOpen = o => { chipsBox.classList.toggle('open', o); filterBtn.setAttribute('aria-expanded', o); };
    filterBtn.addEventListener('click', e => { e.stopPropagation(); setOpen(!chipsBox.classList.contains('open')); });
    // used by the Skills page: show only projects that use one skill
    window.showProjectsForSkill = (label, match) => { skill = { label, match }; activeCat = 'all'; build(); };
    filterMenu.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', e => { if (!chipsBox.contains(e.target)) setOpen(false); });
    const haystack = p => [p.title, p.status, (cats[p.category] || {}).name, ...(p.tech || []), ...projText(p)].join(' ').toLowerCase();

    /* ---- one card ---- */
    function makeCard(p, i) {
        const c = cats[p.category] || { idx: 0, icon: '', name: '' };
        const card = el('button', 'proj-card cat-' + c.idx + (p.award ? ' is-award' : ''));
        card.type = 'button';
        const art = el('span', 'proj-art');
        if (p.image) {
            const img = responsive(el('img'), p.image, '(max-width: 991px) 70vw, 380px'); img.alt = ''; img.loading = 'lazy'; img.draggable = false;
            if (p.imagePos) img.style.objectPosition = p.imagePos;   // which part of the picture to keep on the card
            art.appendChild(img);
        } else if (window.planetSVG) {
            art.innerHTML = window.planetSVG(PLANET_FOR_CAT[c.idx % PLANET_FOR_CAT.length]);
            art.classList.add('is-planet');
        }
        art.appendChild(el('span', 'proj-cat', c.name));
        if (p.award) art.appendChild(el('span', 'proj-award', '★ ' + p.status));
        card.appendChild(art);
        const info = el('span', 'proj-info');
        if (!p.award && p.status) info.appendChild(el('span', 'proj-status', p.status));
        info.appendChild(el('span', 'proj-title' + (p.title.length > 42 ? ' is-long' : ''), p.title));
        if (p.tech && p.tech.length) {
            const tags = el('span', 'proj-tags');
            p.tech.slice(0, 3).forEach(t => tags.appendChild(el('span', 'proj-tag', t)));
            if (p.tech.length > 3) tags.appendChild(el('span', 'proj-tag more', '+' + (p.tech.length - 3)));
            info.appendChild(tags);
        }
        info.appendChild(el('span', 'proj-open', 'Open the project →'));
        card.appendChild(info);
        card.addEventListener('click', () => {
            if (dragged) return;
            if (i === current) openLog(i); else go(i);
        });
        return card;
    }

    function build() {
        tabs.forEach(t => { const on = t.dataset.id === activeCat; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
        const cur = skill ? `Using ${skill.label}` : (activeCat === 'all' ? 'All projects' : (cats[activeCat] || {}).name);
        filterBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${cur}<span class="caret">▾</span>`;
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        visible = projects.filter(p => (activeCat === 'all' || p.category === activeCat) && words.every(w => haystack(p).includes(w)) && (!skill || skill.match(p)));
        track.replaceChildren();
        stage.classList.toggle('is-empty', !visible.length);
        if (!visible.length) { track.appendChild(el('p', 'proj-empty', 'No projects found in this galaxy. Try another word.')); counter.textContent = '0 / 0'; bar.style.width = '0'; return; }
        cards = visible.map(makeCard);
        cards.forEach(c => track.appendChild(c));
        current = 0;
        layout();
    }

    /* ---- position every card around the selected one (loops round) ---- */
    function layout() {
        const n = cards.length;
        cards.forEach((card, i) => {
            let d = i - current;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;
            const a = Math.abs(d);
            card.style.setProperty('--d', d);
            card.style.setProperty('--a', a);
            card.style.zIndex = 20 - a;
            card.classList.toggle('is-current', d === 0);
            card.classList.toggle('is-far', a > 1);
            card.tabIndex = d === 0 ? 0 : -1;
            card.setAttribute('aria-hidden', a > 1 ? 'true' : 'false');
        });
        counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
        bar.style.width = ((current + 1) / n * 100) + '%';
    }
    function go(i) { if (!cards.length) return; current = (i + cards.length) % cards.length; layout(); }

    document.querySelector('.proj-prev').addEventListener('click', () => go(current - 1));
    document.querySelector('.proj-next').addEventListener('click', () => go(current + 1));
    stage.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { go(current - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { go(current + 1); e.preventDefault(); }
    });

    // swipe / drag sideways (vertical swipes still scroll the page)
    let sx = null, sy = 0, dragged = false;
    track.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; dragged = false; });
    window.addEventListener('pointerup', e => {
        if (sx === null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { dragged = true; go(current + (dx < 0 ? 1 : -1)); setTimeout(() => (dragged = false), 50); }
        sx = null;
    });


    /* ---- project log pop-up ---- */
    const modal = el('div', 'exp-modal proj-modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="exp-modal-panel" role="dialog" aria-modal="true" aria-label="Project details"><button class="exp-close" aria-label="Close">&times;</button><div class="exp-modal-body"></div></div>';
    document.body.appendChild(modal);
    const body = modal.querySelector('.exp-modal-body');
    let opener = null;
    function show(i) {
        go(i);
        const p = visible[current], c = cats[p.category] || {};
        body.replaceChildren();
        body.appendChild(el('div', 'log-tag', `PROJECT · ${String(projects.indexOf(p) + 1).padStart(2, '0')}  ·  ${(c.name || '').toUpperCase()}`));
        if (p.image) { const ban = responsive(el('img', 'proj-banner'), p.image, '(max-width: 700px) 92vw, 620px'); ban.alt = ''; body.appendChild(ban); }
        body.appendChild(el('div', 'exp-role proj-log-title', p.title));
        const chips = el('div', 'log-chips');
        if (p.status) chips.appendChild(el('span', 'log-chip' + (p.award ? ' gold' : ''), (p.award ? '★ ' : '') + p.status));
        body.appendChild(chips);
        if (p.intro) body.appendChild(el('p', 'log-intro', p.intro));
        if (p.points && p.points.length) {
            const ul = el('ul', 'log-points');
            p.points.forEach(x => ul.appendChild(el('li', '', x)));
            body.appendChild(ul);
        }
        (p.sections || []).forEach(sec => {
            body.appendChild(el('div', 'log-section', sec.heading));
            if (sec.text) body.appendChild(el('p', 'log-intro', sec.text));
            if (sec.points && sec.points.length) {
                const ul = el('ul', 'log-points');
                sec.points.forEach(x => ul.appendChild(el('li', '', x)));
                body.appendChild(ul);
            }
        });
        if (p.tech && p.tech.length) {
            const tags = el('div', 'proj-tags log-tech');
            p.tech.forEach(x => tags.appendChild(el('span', 'proj-tag', x)));
            body.appendChild(tags);
        }
        if (p.links && p.links.length) {
            const row = el('div', 'bh-actions proj-links');
            p.links.forEach(l => { const a = el('a', 'log-cert', l.label + ' ↗'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; row.appendChild(a); });
            body.appendChild(row);
        }
        if (visible.length > 1) {
            const nav = el('div', 'log-nav');
            const prev = el('button', '', '◀ Previous'), next = el('button', '', 'Next ▶');
            prev.addEventListener('click', () => show(current - 1));
            next.addEventListener('click', () => show(current + 1));
            nav.append(prev, el('span', 'log-count', `${current + 1} / ${visible.length}`), next);
            body.appendChild(nav);
        }
        modal.querySelector('.exp-modal-panel').scrollTop = 0;
    }
    function openLog(i) {
        opener = document.activeElement;
        show(i);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        modal.querySelector('.exp-close').focus({ preventScroll: true });
    }
    function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        if (cards[current]) cards[current].focus({ preventScroll: true });
    }
    modal.querySelector('.exp-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
    });
    build();
})();

/*BACKGROUND MUSIC*/
(function setupAudio() {
    const audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('audioToggle');
    const icon = document.getElementById('audioIcon');
    if (!audio || !toggle) return;
    let isPlaying = false;
    audio.volume = 0.2;
    const setIcon = () => { icon.innerHTML = isPlaying ? '&#10074;&#10074; Pause' : '&#9654; Play'; };
    const play = () => audio.play().then(() => { isPlaying = true; setIcon(); }).catch(() => {});
    const pause = () => { audio.pause(); isPlaying = false; setIcon(); };
    toggle.addEventListener('click', () => (isPlaying ? pause() : play()));
    setIcon();

    // Friendly in-page prompt instead of the browser's confirm() box
    window.showMusicPrompt = function () {
        if (window.scrollY > window.innerHeight * 0.4) return;   // already exploring: don't interrupt
        const toast = document.createElement('div');
        toast.className = 'music-toast';
        toast.setAttribute('role', 'dialog');
        toast.setAttribute('aria-label', 'Background music');
        toast.innerHTML = '<span class="music-toast-text">Fancy some space tunes while you explore?</span>' +
            '<span class="music-toast-actions"><button class="mt-yes">Yes, play</button><button class="mt-no">No thanks</button></span>';
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        const close = () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); };
        toast.querySelector('.mt-yes').addEventListener('click', () => { play(); close(); });
        toast.querySelector('.mt-no').addEventListener('click', close);
        setTimeout(close, 15000);
        // tuck it away once the visitor starts exploring
        const onScroll = () => { if (window.scrollY > window.innerHeight * 0.4) { close(); window.removeEventListener('scroll', onScroll); } };
        window.addEventListener('scroll', onScroll, { passive: true });
    };
})();
