/* =========================================================
   SPACE FX — sparkles across the whole site, a star trail
   behind the cursor, star bursts on click/tap, the odd
   shooting star, and gentle mouse parallax on the artwork.
   Everything is drawn on one canvas that ignores clicks.
   ========================================================= */
(function spaceFX() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const low = !!window.LOW_POWER;                       // set in script.js for weaker phones
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const COLORS = ['#ffffff', '#f1c40f', '#ffe9a8', '#d4c2ff', '#9ff5cf'];
    const pick = arr => arr[(Math.random() * arr.length) | 0];
    let W = 0, H = 0, sparkles = [], particles = [];
    let shooting = null, nextShoot = performance.now() + 3500;

    function resize() {
        const dpr = low ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // density scales with screen size: ~20 on phones, up to 70 on big screens
        const count = Math.round(Math.max(14, Math.min(70, (W * H) / 22000)) * (low ? 0.5 : 1));
        sparkles = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 2 + Math.random() * 4,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
            color: pick(COLORS),
            drift: 0.02 + Math.random() * 0.06,
        }));
        if (reduceMotion) drawStatic();
    }

    // curvy 4-point sparkle, same shape as the CSS sparkles
    function sparkle(x, y, r, rot, color, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        const k = r * 0.18;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(k, -k, r, 0);
        ctx.quadraticCurveTo(k, k, 0, r);
        ctx.quadraticCurveTo(-k, k, -r, 0);
        ctx.quadraticCurveTo(-k, -k, 0, -r);
        ctx.fill();
        ctx.restore();
    }

    function drawStatic() {
        ctx.clearRect(0, 0, W, H);
        sparkles.forEach(s => sparkle(s.x, s.y, s.r, 0, s.color, 0.5));
    }

    /* ---------- particles (trail + bursts) ---------- */
    function spawn(x, y, opts = {}) {
        const angle = opts.angle ?? Math.random() * Math.PI * 2;
        const speed = opts.speed ?? 0.3 + Math.random() * 0.8;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + (opts.fall ?? 0.15),
            r: opts.r ?? 2 + Math.random() * 3,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.2,
            life: 0,
            max: opts.max ?? 40 + Math.random() * 30,
            color: pick(COLORS),
        });
        if (particles.length > 260) particles.shift();
    }
    function burst(x, y) {
        const n = 16;
        for (let i = 0; i < n; i++) {
            spawn(x, y, { angle: (i / n) * Math.PI * 2, speed: 2 + Math.random() * 2.5, r: 2.5 + Math.random() * 3.5, fall: 0, max: 45 + Math.random() * 25 });
        }
    }

    if (!reduceMotion) {
        let lastX = null, lastY = null;
        if (finePointer) {
            window.addEventListener('mousemove', e => {
                if (lastX === null) { lastX = e.clientX; lastY = e.clientY; }
                const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
                if (dist > 14) {                   // a star every ~14px of movement
                    spawn(e.clientX, e.clientY, { speed: 0.2 + Math.random() * 0.4 });
                    lastX = e.clientX; lastY = e.clientY;
                }
            }, { passive: true });
        }
        window.addEventListener('pointerdown', e => burst(e.clientX, e.clientY), { passive: true });
    }

    /* ---------- warp-speed transition between sections ---------- */
    const label = document.createElement('div');
    label.className = 'warp-label';
    label.setAttribute('aria-hidden', 'true');
    label.innerHTML = '<span class="warp-kicker">ENTERING</span><span class="warp-name"></span>';
    document.body.appendChild(label);
    const labelName = label.querySelector('.warp-name');
    let warp = null, labelTimer = null;
    const WARP_MS = 750;
    const PULL_MS = 1300;

    window.spaceWarp = function (name) {
        if (!name) return;
        labelName.textContent = name;
        label.classList.remove('leave');
        label.classList.add('show');
        clearTimeout(labelTimer);
        labelTimer = setTimeout(() => { label.classList.add('leave'); label.classList.remove('show'); }, 480);
        if (reduceMotion) return;
        const now = performance.now();
        if (warp && now - warp.start < WARP_MS * 0.6) return;   // already warping: just swap the name
        const n = Math.round((W < 600 ? 90 : 160) * (low ? 0.5 : 1));
        warp = {
            start: now, cx: W / 2, cy: H / 2, inward: false,
            streaks: Array.from({ length: n }, () => ({
                a: Math.random() * Math.PI * 2,
                r: 10 + Math.random() * Math.max(W, H) * 0.25,
                v: 2 + Math.random() * 6,
                color: Math.random() < 0.15 ? '#f1c40f' : (Math.random() < 0.3 ? '#d4c2ff' : '#ffffff'),
                w: 1 + Math.random() * 1.5,
            })),
        };
    };

    // Black hole: streaks rush INTO a point instead of out of the centre
    window.blackHolePull = function (cx, cy) {
        if (reduceMotion) return;
        // a swarm of sparkles from all over the screen spirals into the hole
        for (let i = 0; i < Math.round((W < 600 ? 90 : 180) * (low ? 0.4 : 1)); i++) {
            const x = Math.random() * W, y = Math.random() * H, a = Math.atan2(cy - y, cx - x), d = Math.hypot(cx - x, cy - y);
            particles.push({ x, y, vx: Math.cos(a) * d / 34 - Math.sin(a) * 3, vy: Math.sin(a) * d / 34 + Math.cos(a) * 3,
                r: 1.5 + Math.random() * 3.5, rot: 0, vr: 0.2, life: 0, max: 40 + Math.random() * 15, color: pick(COLORS) });
        }
        const far = Math.max(W, H);
        warp = {
            start: performance.now(), cx, cy, inward: true,
            streaks: Array.from({ length: Math.round((W < 600 ? 220 : 420) * (low ? 0.4 : 1)) }, () => ({
                a: Math.random() * Math.PI * 2,
                r: 60 + Math.random() * far,
                v: 3 + Math.random() * 6,
                color: Math.random() < 0.35 ? '#ffb37a' : (Math.random() < 0.3 ? '#ff7aa8' : '#ffffff'),
                w: 1 + Math.random() * 1.5,
            })),
        };
    };

    function drawWarp(now) {
        const p = (now - warp.start) / (warp.inward ? PULL_MS : WARP_MS);
        if (p >= 1) { warp = null; return; }
        // ease in fast, hold, fade out
        const strength = p < 0.25 ? p / 0.25 : p < 0.65 ? 1 : 1 - (p - 0.65) / 0.35;
        const cx = warp.cx, cy = warp.cy;
        // dark tunnel vignette
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
        g.addColorStop(0, `rgba(14, 10, 38, ${0.88 * strength})`);
        g.addColorStop(0.55, `rgba(8, 6, 24, ${0.82 * strength})`);
        g.addColorStop(1, `rgba(2, 2, 10, ${0.95 * strength})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.lineCap = 'round';
        const accel = 1 + strength * 5;
        for (const s of warp.streaks) {
            const len = s.v * accel * 6;
            let x0, y0, x1, y1;
            if (warp.inward) {
                s.r -= s.v * accel;
                s.a += 0.012 * accel;                                  // slight spiral
                if (s.r < 12) s.r = Math.max(W, H) * (0.6 + Math.random() * 0.5);
                x1 = cx + Math.cos(s.a) * s.r; y1 = cy + Math.sin(s.a) * s.r;
                x0 = cx + Math.cos(s.a) * (s.r + len); y0 = cy + Math.sin(s.a) * (s.r + len);
                ctx.globalAlpha = strength * Math.min(1, s.r / 140);
            } else {
                s.r += s.v * accel;
                if (s.r > Math.max(W, H)) s.r = 40 + Math.random() * 80;
                x1 = cx + Math.cos(s.a) * s.r; y1 = cy + Math.sin(s.a) * s.r;
                x0 = cx + Math.cos(s.a) * Math.max(0, s.r - len); y0 = cy + Math.sin(s.a) * Math.max(0, s.r - len);
                ctx.globalAlpha = strength * Math.min(1, Math.max(0, (s.r - 90) / 220));   // clear centre for the title
            }
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.w;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    /* ---------- mouse parallax on the artwork ---------- */
    // Uses the CSS `translate` property, which stacks with GSAP's transforms
    // instead of fighting them.
    const PARALLAX = [
        ['.black-moon', 10],
        ['.star-garland', 6], ['.exp-guide .astronaut-laptop', 10],
    ].flatMap(([sel, depth]) => [...document.querySelectorAll(sel)].map(el => ({ el, depth })));
    let mx = 0, my = 0, px = 0, py = 0;
    if (finePointer && !reduceMotion) {
        window.addEventListener('mousemove', e => {
            mx = (e.clientX / W) * 2 - 1;
            my = (e.clientY / H) * 2 - 1;
        }, { passive: true });
    }

    /* ---------- black hole gravity ---------- */
    const holeImg = document.querySelector('.black-hole img');
    let hole = null, lastFeed = 0;
    function updateHole(now) {
        hole = null;
        if (!holeImg) return;
        const r = holeImg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || !r.width) return;
        hole = { x: r.left + r.width / 2, y: r.top + r.height * 0.47, R: r.width * 0.2 };
        // feed it a stream of tiny stars that swirl in
        if (now - lastFeed > 140) {
            lastFeed = now;
            const a = Math.random() * Math.PI * 2, d = hole.R * (3 + Math.random() * 1.5);
            particles.push({
                x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d,
                vx: -Math.sin(a) * 1.6, vy: Math.cos(a) * 1.6,
                r: 1.5 + Math.random() * 2.5, rot: 0, vr: 0.1, life: 0, max: 260,
                color: pick(['#ffffff', '#ffd59a', '#ffb3cf', '#f1c40f']), orbit: true,
            });
        }
    }
    function pull(o, strength) {           // returns false when swallowed
        if (!hole) return true;
        const dx = hole.x - o.x, dy = hole.y - o.y, d = Math.hypot(dx, dy) || 1;
        const reach = hole.R * 4.8;
        if (d > reach) return true;
        if (d < hole.R * 0.45) return false;
        const g = strength * (1 - d / reach) * 2.4;
        o.x += (dx / d) * g - (dy / d) * g * 0.9;      // fall in + swirl
        o.y += (dy / d) * g + (dx / d) * g * 0.9;
        return true;
    }

    /* ---------- main loop ---------- */
    function frame(now) {
        requestAnimationFrame(frame);
        if (document.hidden) return;
        const t = now / 1000;
        ctx.clearRect(0, 0, W, H);

        updateHole(now);
        // ambient sparkles: mostly dim, flashing bright now and then
        for (const s of sparkles) {
            s.y -= s.drift;
            if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; }
            if (!pull(s, 1)) { s.x = Math.random() * W; s.y = H + 10; }
            const flash = Math.pow(Math.max(0, Math.sin(t * s.speed + s.phase)), 3);
            sparkle(s.x, s.y, s.r * (0.6 + flash * 0.7), flash * 0.6, s.color, 0.12 + flash * 0.8);
        }

        // shooting star every 6–12 s
        if (!shooting && now > nextShoot) {
            const fromLeft = Math.random() < 0.5;
            shooting = {
                x: fromLeft ? Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5,
                y: Math.random() * H * 0.35,
                vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 5),
                vy: 4 + Math.random() * 3,
                life: 0,
            };
        }
        if (shooting) {
            const s = shooting;
            s.x += s.vx; s.y += s.vy; s.life++;
            const tailX = s.x - s.vx * 12, tailY = s.y - s.vy * 12;
            const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            g.addColorStop(0, 'rgba(255,255,255,0.95)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = g;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tailX, tailY); ctx.stroke();
            sparkle(s.x, s.y, 4, t * 3, '#ffffff', 1);
            if (s.life > 70 || s.x < -200 || s.x > W + 200 || s.y > H + 200) {
                shooting = null;
                nextShoot = now + (low ? 14000 : 6000) + Math.random() * 6000;
            }
        }

        // trail + burst particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life++;
            p.x += p.vx; p.y += p.vy;
            if (p.orbit) { p.vx *= 0.99; p.vy *= 0.99; } else { p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.02; }
            if (!pull(p, p.orbit ? 1.4 : 0.8)) { particles.splice(i, 1); continue; }
            p.rot += p.vr;
            const k = 1 - p.life / p.max;
            if (k <= 0) { particles.splice(i, 1); continue; }
            sparkle(p.x, p.y, p.r * (0.4 + k * 0.6), p.rot, p.color, k);
        }

        if (warp) drawWarp(now);

        // ease the parallax toward the mouse
        if (PARALLAX.length) {
            px += (mx - px) * 0.06;
            py += (my - py) * 0.06;
            if (Math.abs(mx - px) > 0.001 || Math.abs(my - py) > 0.001) {
                for (const { el, depth } of PARALLAX) {
                    el.style.translate = `${(-px * depth).toFixed(2)}px ${(-py * depth).toFixed(2)}px`;
                }
            }
        }
    }

    window.addEventListener('resize', resize);
    resize();
    if (!reduceMotion) requestAnimationFrame(frame);
})();
