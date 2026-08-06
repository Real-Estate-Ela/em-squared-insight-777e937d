/*
 * Emlakmetric — izometrik maket hero'su (ES modül sürümü)
 * Bağımlılık yok. Tarayıcıda doğrudan çalışır.
 *
 * Tuval ebeveynine göre konumlanır (position:absolute; inset:0 önerilir).
 * Metin sütunuyla çakışmayı önlemek için en yakın <section> içindeki
 * h1 / p / a[href="#analiz"] ve [data-reserve] öğeleri okunur.
 */

export function mount(canvas, opts) {
    if (!canvas) throw new Error('EmlakmetricHero.mount: canvas gerekli');
    var host = {
      states: [],
      resizers: [],
      client: { x: -9999, y: -9999 },
      zoomOut: null
    };

    var onMove = function (e) { host.client.x = e.clientX; host.client.y = e.clientY; };
    var onLeave = function () { host.client.x = -9999; host.client.y = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    render(canvas, host, opts || {});

    return {
      /* haritaya geri dön */
      zoomOut: function () { if (host.zoomOut) host.zoomOut(); },
      destroy: function () {
        host.states.forEach(function (s) { s.stopped = true; });
        host.resizers.forEach(function (r) { window.removeEventListener('resize', r); });
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        if (canvas.__ioObs) { canvas.__ioObs.disconnect(); canvas.__ioObs = null; }
      }
    };
  }

  function render(c, host, opts) {
      const cur = c.__fieldSt;
    if (cur && !cur.stopped && performance.now() - cur.t < 500) return;
    if (cur) cur.stopped = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = c.getContext('2d');
    const rnd = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const INK = '14,17,22', BLUE = '27,77,255', GRN = '0,135,90', RED = '226,61,40';

    /* ---------- ŞEHİR: iki cadde, dört ada, ada başına 6 parsel ---------- */
    const LW = 1.95, LD = 1.72, G = 0.14, RW = 0.52, M = 5.8, FLH = 0.26;
    const lots = [];
    let n = 0;
    for (const bx of [-1, 1]) for (const by of [-1, 1]) {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const x0 = bx > 0 ? RW + i * (LW + G) : -RW - (i + 1) * LW - i * G;
        const y0 = by > 0 ? RW + j * (LD + G) : -RW - (j + 1) * LD - j * G;
        const r = rnd(n * 17 + 5), r2 = rnd(n * 41 + 13), r3 = rnd(n * 7 + 29);
        const kind = n % 7 === 3 ? 'bos' : r < 0.28 ? 'ev' : r < 0.5 ? 'villa' : r < 0.82 ? 'blok' : 'kule';
        const fl = kind === 'ev' ? 2 : kind === 'villa' ? 3 : kind === 'blok' ? 5 + Math.round(r2 * 3) : 9 + Math.round(r2 * 4);
        const q = {
          x: x0 + LW / 2, y: y0 + LD / 2, w: LW, d: LD, r, r2, r3, kind, fl,
          shop: kind === 'blok' || kind === 'kule',
          balcony: kind !== 'ev',
          accent: r3 > 0.72 ? 'red' : r3 > 0.4 ? 'blue' : 'ink',
          roofPal: r2 > 0.74 ? 'red' : r2 > 0.5 ? 'blue' : r2 > 0.26 ? 'green' : 'ink',
          id: (bx > 0 ? (by > 0 ? 'D' : 'C') : (by > 0 ? 'A' : 'B')) + '-' + (11 + i * 2 + j),
          m2: Math.round(LW * M * LD * M),
          house: kind === 'ev' || kind === 'villa'
        };
        q.h = kind === 'bos' ? 0 : fl * FLH;
        q.mass = kind === 'bos' ? [] : [{ ax: (kind === 'ev' || kind === 'villa' ? 0.36 : 0.34) * LW, ay: (kind === 'ev' || kind === 'villa' ? 0.38 : 0.36) * LD, h: q.h, fl }];
        if ((kind === 'blok' || kind === 'kule') && r3 > 0.42) {
          const cut = 0.7;
          q.mass[0].h = q.h * cut; q.mass[0].fl = Math.max(2, Math.round(fl * cut));
          q.mass.push({ ax: q.mass[0].ax * 0.74, ay: q.mass[0].ay * 0.74, h: q.h * (1 - cut), fl: Math.max(1, fl - q.mass[0].fl), dx: 0, dy: 0 });
        }
        lots.push(q);
        n++;
      }
    }
    const built = lots.filter(q => q.kind !== 'bos');
    const sc = [
      { roi: 6.4, am: 15.6, sap: -9.0, lik: 78, karar: 'AL', bar: GRN, not: '5 YIL TUT', yer: 'KADIKÖY · FİKİRTEPE', fiyat: 71400 },
      { roi: 5.1, am: 19.4, sap: 2.4, lik: 61, karar: 'BEKLE', bar: INK, not: 'FİYAT DÜŞMELİ', yer: 'ÇANKAYA · BİRLİK', fiyat: 48900 },
      { roi: 4.2, am: 23.8, sap: 11.0, lik: 44, karar: 'RİSKLİ', bar: RED, not: 'PAZARLIK ŞART', yer: 'BORNOVA · KAZIMDİRİK', fiyat: 22150 },
      { roi: 5.9, am: 17.2, sap: -3.4, lik: 69, karar: 'AL', bar: GRN, not: 'KİRA GÜÇLÜ', yer: 'BEŞİKTAŞ · ETİLER', fiyat: 148700 }
    ];
    const scOf = q => sc[Math.floor(rnd(q.x * 13 + q.y * 29 + 7) * sc.length) % sc.length];
    const EX = RW + 3 * LW + 2 * G, EY = RW + 2 * LD + G;
    const maxZ = lots.reduce((m, q) => Math.max(m, q.h), 0.2) + 0.2;
    let W = 0, H = 0, BX0 = 0, BX1 = 0, BY0 = 0, BY1 = 0, CTAR = null, EXC = [];
    const build = () => {
      const narrow = window.innerWidth < 900;
      c.style.height = narrow ? '54%' : 'calc(100% - 96px)';
      const mBottom = 'linear-gradient(180deg, #000 66%, rgba(0,0,0,.55) 84%, rgba(0,0,0,.18) 94%, transparent 100%)';
      const mLeft = 'linear-gradient(90deg, transparent 0, rgba(0,0,0,.06) 40%, rgba(0,0,0,.45) 50%, #000 56%)';
      const mv = narrow ? mBottom : mBottom + ', ' + mLeft;
      c.style.webkitMaskImage = mv; c.style.maskImage = mv;
      c.style.webkitMaskComposite = narrow ? '' : 'source-in';
      c.style.maskComposite = narrow ? '' : 'intersect';
      const r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) { requestAnimationFrame(build); return; }
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      measureBand();
    };
    const measureBand = () => {
      const r = c.getBoundingClientRect();
      const narrow = window.innerWidth < 900;
      BX0 = narrow ? 10 : W * 0.47;
      BX1 = W - 10;
      BY0 = narrow ? 16 : 58;
      BY1 = H - 16;
      CTAR = null;
      EXC = [];
      if (narrow) return;
      const sec = c.closest('section');
      if (!sec) return;
      const h1 = sec.querySelector('h1');
      const cta = sec.querySelector('a[href="#analiz"]');
      if (h1) {
        let tr2 = 0;
        h1.querySelectorAll('span').forEach(sp => {
          if (sp.firstChild && sp.firstChild.nodeType === 3) {
            const rg = document.createRange();
            rg.selectNodeContents(sp);
            tr2 = Math.max(tr2, rg.getBoundingClientRect().right);
          }
        });
        if (!tr2) tr2 = h1.getBoundingClientRect().right;
        BX0 = Math.min(Math.max(W * 0.42, tr2 - r.left + 10), W * 0.48);
      }
      const pEl = sec.querySelector('p');
      if (pEl) BX0 = Math.max(BX0, pEl.getBoundingClientRect().right - r.left + 14);
      if (cta) {
        const cr = cta.getBoundingClientRect();
        CTAR = { x: cr.left - r.left - 14, y: cr.top - r.top - 12, w: cr.width + 28, h: cr.height + 24 };
      }
      EXC = [];
      let floor = BY1;
      if (CTAR && CTAR.x < BX1 && CTAR.x + CTAR.w > BX0) floor = Math.min(floor, CTAR.y - 6);
      sec.querySelectorAll('[data-reserve]').forEach(el => {
        const er = el.getBoundingClientRect();
        if (!er.height) return;
        if (er.right - r.left > BX0) floor = Math.min(floor, er.top - r.top - 10);
      });
      BY1 = Math.max(BY0 + 140, floor);
    };
    build();
    const onRes = () => build();
    window.addEventListener('resize', onRes);
    host.resizers.push(onRes);
    const st = { stopped: false, t: performance.now(), canvas: c };
    c.__fieldSt = st;
    host.states.push(st);

    const ez = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const tr = v => v.toFixed(1).replace('.', ',');
    const tl = v => v.toLocaleString('tr-TR');
    const mono = px => "400 " + px + "px 'Space Mono', monospace";
    const gro = px => "700 " + px + "px 'Space Grotesk', sans-serif";
    const t0 = performance.now();

    const VALS = ['71.400 ₺', '−%4,2', '%6,4', '16,2y', '+%38', '72/100', '116 m²', '%75'];
    const tallest = built.slice().sort((a2, b2) => b2.h - a2.h);
    const dataWins = VALS.map((val, i) => {
      const q = tallest[i % tallest.length];
      const flc = Math.max(1, q.mass[0].fl);
      const slot = 0;
      return { lot: q, val, slot, at: [0.5, 0.32, 0.68, 0.42][i % 4], fl: cl(Math.round((flc - 1) * (0.12 + (i % 4) * 0.16)), 0, flc - 1) };
    });
    const selWins = (q, g0) => {
      const s2 = scOf(q);
      const vals = [
        'm² ' + tl(s2.fiyat) + ' ₺',
        'getiri %' + tr(s2.roi),
        'amortisman ' + tr(s2.am) + ' yıl',
        'medyan ' + (s2.sap < 0 ? '−' : '+') + '%' + tr(Math.abs(s2.sap)),
        'likidite ' + s2.lik + '/100'
      ];
      const flc = Math.max(1, q.mass[0].fl);
      const take = Math.min(vals.length, Math.max(2, Math.floor(flc / 1.5)));
      return vals.slice(0, take).map((val, i) => ({ lot: q, val, fl: Math.min(flc - 1, i * Math.max(1, Math.floor(flc / take))) }));
    };
    let yaw = 0, spin = 0.00006, drag = null, moved = 0, lastX = 0, lastT = 0, touched = false, idle = performance.now();
    let sel = built[3] || lots[0], hov = null, zoom = 0, zoomTo = 0, zoomStart = 0, zoomFrom = 0;
    c.style.cursor = 'grab';
    const setZoom = (v, now) => { if (zoomTo === v) return; zoomFrom = zoom; zoomTo = v; zoomStart = now || performance.now(); };
    const ezOut = p => 1 - Math.pow(1 - p, 4);
    c.onpointerdown = e => { drag = { x: e.clientX, y0: yaw }; moved = 0; spin = 0; touched = true; lastX = e.clientX; lastT = performance.now(); c.style.cursor = 'grabbing'; try { c.setPointerCapture(e.pointerId); } catch (err) {} };
    c.onpointermove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      moved = Math.max(moved, Math.abs(dx));
      yaw = drag.y0 + dx * 0.006;
      const now = performance.now(), dt = Math.max(8, now - lastT);
      spin = ((e.clientX - lastX) * 0.006) / dt;
      lastX = e.clientX; lastT = now;
    };
    const endDrag = () => { if (!drag) return; drag = null; c.style.cursor = 'grab'; spin = Math.max(-0.0014, Math.min(0.0014, spin)); };
    c.onpointerup = endDrag;
    c.onpointercancel = endDrag;
    c.onclick = () => {
      if (moved > 6) { moved = 0; return; }
      touched = true;
      if (zoomTo > 0.5) { setZoom(0); return; }
      if (hov) { sel = hov; setZoom(1); }
    };
    host.zoomOut = () => setZoom(0);

    /* ---------- kamera ---------- */
    const camK = () => {
      const cs = Math.cos(yaw), sn = Math.sin(yaw);
      let mnU = 1e9, mxU = -1e9, mnV = 1e9, mxV = -1e9;
      for (const [px, py] of [[-EX, -EY], [EX, -EY], [EX, EY], [-EX, EY]]) {
        const rx = px * cs - py * sn, ry = px * sn + py * cs;
        const u = (rx - ry) * 0.866, v = (rx + ry) * 0.5;
        mnU = Math.min(mnU, u); mxU = Math.max(mxU, u);
        mnV = Math.min(mnV, v); mxV = Math.max(mxV, v);
      }
      const s0 = Math.min((BX1 - BX0) / (mxU - mnU), (BY1 - BY0 - 6) / ((mxV - mnV) + maxZ));
      let sZ = s0 * 3.55;
      const bm = sel.mass && sel.mass[0];
      if (bm) {
        const gax = bm.ax * 1.5, gay = bm.ay * 1.5, gh = sel.h * 2.05 + 0.34;
        let aU = 1e9, bU = -1e9, aV = 1e9, bV = -1e9;
        for (const [px, py] of [[-gax, -gay], [gax, -gay], [gax, gay], [-gax, gay]]) {
          const rx = px * cs - py * sn, ry = px * sn + py * cs;
          const u = (rx - ry) * 0.866, v = (rx + ry) * 0.5;
          aU = Math.min(aU, u); bU = Math.max(bU, u);
          aV = Math.min(aV, v); bV = Math.max(bV, v);
        }
        sZ = Math.min(sZ, (BX1 - BX0) * 0.66 / (bU - aU), (BY1 - BY0 - 26) / ((bV - aV) + gh));
      }
      const s = s0 + (Math.max(s0 * 1.35, sZ) - s0) * zoom;
      const cx = (BX0 + BX1) / 2, cy = (BY0 + BY1) / 2 + 6;
      const fx = sel.x * zoom, fy = sel.y * zoom;
      const frx = fx * cs - fy * sn, fry = fx * sn + fy * cs;
      const midU = ((mnU + mxU) / 2) * (1 - zoom), midV = ((mnV + mxV) / 2) * (1 - zoom);
      return { s, cs, sn,
        ox: cx - (midU + (frx - fry) * 0.866) * s,
        oy: cy - (midV + (frx + fry) * 0.5) * s + (maxZ * 0.5) * s * (1 - zoom) * 0.35 };
    };
    const P = (k, x, y, z) => {
      const rx = x * k.cs - y * k.sn, ry = x * k.sn + y * k.cs;
      return [k.ox + (rx - ry) * 0.866 * k.s, k.oy + (rx + ry) * 0.5 * k.s - z * k.s];
    };
    const poly = (k, pts, fill, strokeCol, lw) => {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) { const q = P(k, pts[i][0], pts[i][1], pts[i][2]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = lw || 1; ctx.stroke(); }
    };
    const seg = (k, p0, p1, col, lw, dash) => {
      if (dash) ctx.setLineDash(dash);
      const q0 = P(k, p0[0], p0[1], p0[2]), q1 = P(k, p1[0], p1[1], p1[2]);
      ctx.strokeStyle = col; ctx.lineWidth = lw || 1;
      ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke();
      if (dash) ctx.setLineDash([]);
    };
    const reset = () => ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nrm = (k, nx, ny) => {
      const rx = nx * k.cs - ny * k.sn, ry = nx * k.sn + ny * k.cs;
      return [(rx - ry) * 0.866, (rx + ry) * 0.5];
    };
    const faceT = (k, dx, dy, o) => {
      const v = nrm(k, dx, dy);
      const L = Math.hypot(v[0], v[1]) || 1;
      const p = P(k, o[0], o[1], o[2]);
      reset();
      ctx.transform(v[0] / L, v[1] / L, 0, 1, p[0], p[1]);
    };
    const WALLS = [
      { n: [0, 1], a: [-1, 1], b: [1, 1] },
      { n: [1, 0], a: [1, 1], b: [1, -1] },
      { n: [0, -1], a: [1, -1], b: [-1, -1] },
      { n: [-1, 0], a: [-1, -1], b: [-1, 1] }
    ];
    const hull = pts => {
      const p = pts.slice().sort((a2, b2) => a2[0] - b2[0] || a2[1] - b2[1]);
      const cr = (o, a2, b2) => (a2[0] - o[0]) * (b2[1] - o[1]) - (a2[1] - o[1]) * (b2[0] - o[0]);
      const lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    const inScreen = (px, py, pts) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };
    const sil = (k, q) => {
      const ax = q.w / 2 * 0.9, ay = q.d / 2 * 0.9, pts = [];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const z of [0, Math.max(0.05, q.h)]) pts.push(P(k, q.x + sx * ax, q.y + sy * ay, z));
      return hull(pts);
    };

    /* ---------- yapı çizimleri ---------- */
    const TONE = (front, u) => front ? (u < 0 ? '253,253,254' : '226,229,237') : '240,242,246';
    const ACC = { red: RED, blue: BLUE, ink: INK };
    const volume = (k, q, m, z0, alpha, isSel, isHov, wins) => {
      const x = q.x + (m.dx || 0), y = q.y + (m.dy || 0), s = k.s, h = m.h;
      const inkS = isSel ? 'rgba(' + BLUE + ',' + (0.9 * alpha).toFixed(3) + ')' : isHov ? 'rgba(' + INK + ',' + (0.55 * alpha).toFixed(3) + ')' : 'rgba(' + INK + ',' + (0.42 * alpha).toFixed(3) + ')';
      const order = WALLS.map(w => { const v = nrm(k, w.n[0], w.n[1]); return { w, u: v[0], v: v[1] }; }).sort((p, r) => p.v - r.v);
      const faceWall = order[order.length - 1].w;
      for (const { w, u, v } of order) {
        const ax0 = x + w.a[0] * m.ax, ay0 = y + w.a[1] * m.ay;
        const bx0 = x + w.b[0] * m.ax, by0 = y + w.b[1] * m.ay;
        const front = v > 0;
        poly(k, [[ax0, ay0, z0], [bx0, by0, z0], [bx0, by0, z0 + h], [ax0, ay0, z0 + h]], 'rgba(' + TONE(front, u) + ',' + alpha.toFixed(3) + ')', inkS, isSel ? 1.2 : 0.7);
        if (!front) continue;
        seg(k, [ax0, ay0, z0 + h], [bx0, by0, z0 + h], 'rgba(255,255,255,' + (0.9 * alpha).toFixed(3) + ')', 0.5);
        seg(k, [ax0, ay0, z0], [bx0, by0, z0], 'rgba(' + INK + ',' + (0.2 * alpha).toFixed(3) + ')', 0.5);
        const span = Math.hypot(bx0 - ax0, by0 - ay0);
        faceT(k, bx0 - ax0, by0 - ay0, [ax0, ay0, z0]);
        const L = span * s, fh = (h / m.fl) * s;
        ctx.save();
        ctx.beginPath(); ctx.rect(-0.5, -h * s - 0.5, L + 1, h * s + 1); ctx.clip();
        /* düşey bölüntü ve köşe pilastrları */
        if (!q.house) {
          ctx.strokeStyle = 'rgba(' + INK + ',' + (0.1 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.5;
          const vc = Math.max(2, Math.round(L / 18));
          for (let vi = 1; vi < vc; vi++) { const xx = (L / vc) * vi; ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, -h * s); ctx.stroke(); }
          ctx.fillStyle = 'rgba(' + INK + ',' + (0.05 * alpha).toFixed(3) + ')';
          ctx.fillRect(0, -h * s, Math.max(1.2, L * 0.035), h * s);
          ctx.fillRect(L - Math.max(1.2, L * 0.035), -h * s, Math.max(1.2, L * 0.035), h * s);
        }
        /* kat çizgileri */
        ctx.strokeStyle = 'rgba(' + INK + ',' + (0.12 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.5;
        for (let fi = 1; fi < m.fl; fi++) { const yy = -fi * fh; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(L, yy); ctx.stroke(); }
        /* pencere ızgarası */
        const cols = Math.max(2, Math.min(5, Math.round(L / 15)));
        const cw = L / cols, ww = Math.min(cw * 0.5, fh * 0.6), wh = Math.max(1.8, fh * 0.46);
        for (let fi = 0; fi < m.fl; fi++) {
          for (let ci = 0; ci < cols; ci++) {
            const pick = rnd(q.x * 31 + q.y * 17 + fi * 7.3 + ci * 3.1);
            if (pick > 0.42) continue;
            const wx = ci * cw + (cw - ww) / 2, wy = -(fi * fh) - fh * 0.72;
            ctx.fillStyle = 'rgba(' + INK + ',' + ((pick < 0.12 ? 0.3 : 0.18) * alpha).toFixed(3) + ')';
            ctx.fillRect(wx, wy, ww, wh);
          }
          /* balkon çıkması */
          if (q.balcony && fi > 0 && fi % 3 === 1 && fh > 5) {
            ctx.strokeStyle = 'rgba(' + INK + ',' + (0.16 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.5;
            const by2 = -(fi * fh) - fh * 0.16;
            ctx.beginPath(); ctx.moveTo(L * 0.14, by2); ctx.lineTo(L * 0.86, by2); ctx.stroke();
          }
        }
        /* giriş */
        if (z0 < 0.01 && w === faceWall && fh > 2.4) {
          const dwv = Math.max(2.6, Math.min(L * 0.12, fh * 0.42)), dhv = Math.min(fh * 0.68, h * s * 0.5);
          const dxv = q.house ? L * 0.2 : L * 0.44;
          ctx.fillStyle = 'rgba(' + ACC[q.accent] + ',' + (0.82 * alpha).toFixed(3) + ')';
          ctx.fillRect(dxv, -dhv, dwv, dhv);
          ctx.strokeStyle = 'rgba(' + INK + ',' + (0.34 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.5;
          ctx.strokeRect(dxv, -dhv, dwv, dhv);
          /* saçak */
          ctx.fillStyle = 'rgba(' + INK + ',' + (0.16 * alpha).toFixed(3) + ')';
          ctx.fillRect(dxv - dwv * 0.35, -dhv - Math.max(1, fh * 0.1), dwv * 1.7, Math.max(1, fh * 0.08));
          /* basamak */
          ctx.fillStyle = 'rgba(' + INK + ',' + (0.1 * alpha).toFixed(3) + ')';
          ctx.fillRect(dxv - dwv * 0.25, -Math.max(0.8, fh * 0.06), dwv * 1.5, Math.max(0.8, fh * 0.06));
          if (!q.house) {
            ctx.fillStyle = 'rgba(' + BLUE + ',' + (0.16 * alpha).toFixed(3) + ')';
            ctx.fillRect(0, -fh * 0.78, L, fh * 0.62);
            ctx.strokeStyle = 'rgba(' + INK + ',' + (0.18 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(0, -fh * 0.86); ctx.lineTo(L, -fh * 0.86); ctx.stroke();
          }
        }
        /* VERİ PENCERESİ: okunur değer */
        if (w === faceWall && wins.length && L > 26) {
          for (const dw of wins) {
            const bh2 = cl(fh * 1.15, 12, 19);
            let fs = Math.min(9.5, bh2 * 0.58);
            ctx.font = mono(fs);
            let tw = ctx.measureText(dw.val).width;
            const bw2 = Math.min(L * 0.94, tw + 9);
            if (tw > bw2 - 8) { fs = Math.max(5.6, fs * ((bw2 - 8) / tw)); ctx.font = mono(fs); }
            const fi = Math.min(m.fl - 1, dw.fl);
            const bx2 = L * 0.5 - bw2 / 2;
            const by2 = -(fi * fh) - fh * 0.1 - bh2;
            ctx.fillStyle = 'rgba(' + BLUE + ',' + alpha.toFixed(3) + ')';
            ctx.fillRect(bx2, by2, bw2, bh2);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * alpha).toFixed(3) + ')'; ctx.lineWidth = 0.6;
            ctx.strokeRect(bx2 + 0.5, by2 + 0.5, bw2 - 1, bh2 - 1);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.fillText(dw.val, bx2 + bw2 / 2, by2 + bh2 / 2 + 0.5);
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          }
        }
        ctx.restore();
        reset();
      }
      return { x, y, ax: m.ax, ay: m.ay, top: z0 + h, inkS };
    };
    /* kırma çatı: dört eğik düzlem, kameraya göre sıralı */
    const ROOF = {
      red: [['86,34,28'], ['62,24,20'], ['104,44,36']],
      blue: [['32,48,104'], ['22,34,76'], ['44,62,124']],
      ink: [['42,47,58'], ['26,30,38'], ['58,64,78']],
      green: [['26,64,52'], ['18,46,38'], ['36,80,64']]
    };
    const hipRoof = (k, x, y, ax, ay, z0, rise, alpha, inkS, pal) => {
      const ov = 0.05, rx0 = ax * 0.3, ez2 = ax + ov, ey2 = ay + ov, rz = z0 + rise;
      const planes = [
        { p: [[-ez2, ey2], [ez2, ey2], [rx0, 0], [-rx0, 0]], n: [0, 1] },
        { p: [[ez2, -ey2], [-ez2, -ey2], [-rx0, 0], [rx0, 0]], n: [0, -1] },
        { p: [[ez2, ey2], [ez2, -ey2], [rx0, 0]], n: [1, 0] },
        { p: [[-ez2, -ey2], [-ez2, ey2], [-rx0, 0]], n: [-1, 0] }
      ].map(pl => ({ pl, v: nrm(k, pl.n[0], pl.n[1])[1] })).sort((u, v) => u.v - v.v);
      for (const { pl, v } of planes) {
        const P3 = ROOF[pal] || ROOF.ink;
        const tone = (v > 0 ? (nrm(k, pl.n[0], pl.n[1])[0] < 0 ? P3[0] : P3[1]) : P3[2])[0];
        const pts = pl.p.map(pt => [x + pt[0], y + pt[1], Math.abs(pt[1]) < 0.001 && Math.abs(pt[0]) <= rx0 + 0.001 ? rz : z0]);
        poly(k, pts, 'rgba(' + tone + ',' + alpha.toFixed(3) + ')', 'rgba(255,255,255,' + (0.16 * alpha).toFixed(3) + ')', 0.6);
      }
      seg(k, [x - rx0, y, rz], [x + rx0, y, rz], 'rgba(' + BLUE + ',' + (0.6 * alpha).toFixed(3) + ')', 0.9);
      for (const [p0, p1] of [[[-ez2, -ey2], [ez2, -ey2]], [[ez2, -ey2], [ez2, ey2]], [[ez2, ey2], [-ez2, ey2]], [[-ez2, ey2], [-ez2, -ey2]]])
        seg(k, [x + p0[0], y + p0[1], z0], [x + p1[0], y + p1[1], z0], 'rgba(' + INK + ',' + (0.3 * alpha).toFixed(3) + ')', 0.7);
    };
    /* --- YAKIN PLAN: cephede kapı, metrikler ve CTA (hepsi ön yüzde) --- */
    const closeUp = (k, q, tc, rp) => {
      const base = q.mass[0];
      if (!base) return;
      const s = k.s, x = q.x, y = q.y;
      const ax = base.ax * (1 + 0.5 * tc), ay = base.ay * (1 + 0.5 * tc);
      const h = base.h * (1 + 1.05 * tc);
      const lot = scOf(q);
      const order = WALLS.map(w => { const v = nrm(k, w.n[0], w.n[1]); return { w, u: v[0], v: v[1] }; })
        .filter(o => o.v > 0).sort((p, r) => r.v - p.v);
      const frontW = order[0] && order[0].w;
      if (frontW) {
        const a0 = [x + frontW.a[0] * ax, y + frontW.a[1] * ay];
        const b0 = [x + frontW.b[0] * ax, y + frontW.b[1] * ay];
        const span = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) * s;
        faceT(k, b0[0] - a0[0], b0[1] - a0[1], [a0[0], a0[1], 0]);
        const wallH = h * s;
        ctx.save();
        ctx.beginPath(); ctx.rect(0, -wallH, span, wallH); ctx.clip();
        const dw = Math.min(span * 0.14, 22), dh = Math.min(wallH * 0.22, 36);
        const dx0 = span * 0.06, dOpen = cl(rp / 0.4, 0, 1);
        ctx.fillStyle = '#0E1116';
        ctx.fillRect(dx0, -dh, dw, dh);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.22 * dOpen).toFixed(2) + ')';
        ctx.fillRect(dx0 + 1.5, -dh + 1.5, dw - 3, dh - 3);
        ctx.fillStyle = 'rgba(27,77,255,' + (0.92 * dOpen).toFixed(2) + ')';
        ctx.fillRect(dx0 + dw * (1 - dOpen * 0.72), -dh, dw * dOpen * 0.72, dh);
        ctx.fillStyle = 'rgba(14,17,22,.1)';
        ctx.fillRect(dx0 - 3, 0, dw + 6, 3);
        const wins = [
          ['%' + tr(lot.roi * cl((rp - 0.08) / 0.5, 0, 1)), 'GETİRİ', '0,135,90'],
          [tr(lot.am * cl((rp - 0.16) / 0.5, 0, 1)) + 'Y', 'AMORTİSMAN', INK],
          [(lot.sap < 0 ? '−' : '+') + '%' + tr(Math.abs(lot.sap) * cl((rp - 0.24) / 0.5, 0, 1)), 'SAPMA', lot.sap < 0 ? '0,135,90' : RED],
          [Math.round(lot.lik * cl((rp - 0.32) / 0.5, 0, 1)) + '', 'LİKİDİTE', BLUE]
        ];
        const gap = Math.max(3, Math.min(5, span * 0.025));
        const metricX0 = dx0 + dw + gap * 2;
        const metricW = Math.max(40, span - metricX0 - gap);
        const cwv = (metricW - gap) / 2;
        const chv = Math.min(42, (wallH * 0.65 - gap * 3) / 2);
        const metricY0 = -wallH + gap * 2;
        for (let i = 0; i < 4; i++) {
          const al = cl((rp - (0.04 + i * 0.09)) / 0.2, 0, 1);
          if (al < 0.02 || cwv < 20 || chv < 12) continue;
          const col = i % 2, row = i < 2 ? 0 : 1;
          const wx = metricX0 + col * (cwv + gap), wz = metricY0 + row * (chv + gap);
          ctx.globalAlpha = al;
          ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(wx, wz, cwv, chv);
          ctx.strokeStyle = 'rgba(14,17,22,.4)'; ctx.lineWidth = 0.8;
          ctx.strokeRect(wx + 0.5, wz + 0.5, cwv - 1, chv - 1);
          ctx.strokeStyle = 'rgba(14,17,22,.1)';
          ctx.beginPath(); ctx.moveTo(wx, wz + chv * 0.58); ctx.lineTo(wx + cwv, wz + chv * 0.58); ctx.stroke();
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          let fs = Math.min(15, chv * 0.38);
          ctx.font = gro(fs);
          if (ctx.measureText(wins[i][0]).width > cwv - 8) { fs = Math.max(7, fs * ((cwv - 8) / ctx.measureText(wins[i][0]).width)); ctx.font = gro(fs); }
          ctx.fillStyle = 'rgba(' + wins[i][2] + ',1)';
          ctx.fillText(wins[i][0], wx + 4, wz + chv * 0.44);
          ctx.font = mono(Math.max(5, chv * 0.14));
          ctx.fillStyle = 'rgba(14,17,22,.5)';
          ctx.fillText(wins[i][1], wx + 4, wz + chv * 0.82);
          ctx.globalAlpha = 1;
        }
        const ctaAl = cl((rp - 0.3) / 0.3, 0, 1);
        if (ctaAl > 0.02 && span > 60) {
          ctx.globalAlpha = ctaAl;
          const ctaH = Math.min(22, wallH * 0.14);
          const ctaY = -ctaH - gap;
          const ctaX = gap;
          const ctaW = span - gap * 2;
          ctx.fillStyle = 'rgba(27,77,255,.94)';
          ctx.fillRect(ctaX, ctaY, ctaW, ctaH);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          let ctaFs = Math.min(8.5, ctaH * 0.48);
          ctx.font = mono(ctaFs);
          const ctaTxt = 'İLAN LİNKİNİ YAPIŞTIR → ANALİZE BAŞLA';
          if (ctx.measureText(ctaTxt).width > ctaW - 12) { ctaFs = Math.max(5, ctaFs * ((ctaW - 12) / ctx.measureText(ctaTxt).width)); ctx.font = mono(ctaFs); }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(ctaTxt, ctaX + ctaW / 2, ctaY + ctaH / 2 + 0.5);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
        reset();
      }
    };
    const bldg = (k, q, alpha, isSel, isHov, grow) => {
      const g0 = grow || 0;
      const base = q.mass[0];
      if (!base) return;

      /* bahçe / avlu */
      if (q.kind === 'ev' || q.kind === 'villa') {
        poly(k, [[q.x - q.w * 0.42, q.y - q.d * 0.42, 0], [q.x + q.w * 0.42, q.y - q.d * 0.42, 0], [q.x + q.w * 0.42, q.y + q.d * 0.42, 0], [q.x - q.w * 0.42, q.y + q.d * 0.42, 0]], 'rgba(' + GRN + ',' + (0.11 * alpha).toFixed(3) + ')', 'rgba(' + GRN + ',' + (0.18 * alpha).toFixed(3) + ')', 0.5);
        poly(k, [[q.x - 0.1, q.y + q.d * 0.42, 0], [q.x + 0.1, q.y + q.d * 0.42, 0], [q.x + 0.1, q.y + base.ay, 0], [q.x - 0.1, q.y + base.ay, 0]], 'rgba(' + INK + ',' + (0.07 * alpha).toFixed(3) + ')', null);
      }
      const gk = 1 + 1.05 * g0;
      const wins = g0 < 0.12 ? dataWins.filter(d => d.lot === q) : [];
      let z = 0, last = null;
      for (let mi = 0; mi < q.mass.length; mi++) {
        const m0 = q.mass[mi];
        const m = { ax: m0.ax * (1 + 0.5 * g0), ay: m0.ay * (1 + 0.5 * g0), h: m0.h * gk, fl: m0.fl, dx: m0.dx, dy: m0.dy };
        last = volume(k, q, m, z, alpha, isSel, isHov, mi === 0 ? wins : []);
        z += m.h;
      }
      const wide = q.kind === 'ev' || q.kind === 'villa';
      if (wide) {
        tree(k, q.x - q.w * 0.4, q.y + q.d * 0.36, 0.5, alpha);
        if (q.r2 > 0.4) tree(k, q.x + q.w * 0.4, q.y + q.d * 0.3, 0.42, alpha);
        hipRoof(k, last.x, last.y, last.ax, last.ay, last.top, q.kind === 'villa' ? 0.24 : 0.3, alpha, last.inkS, q.roofPal);
        /* baca */
        const cw2 = 0.045, cx2 = last.x + last.ax * 0.44;
        poly(k, [[cx2, last.y - cw2, last.top + 0.05], [cx2 + cw2, last.y - cw2, last.top + 0.05], [cx2 + cw2, last.y - cw2, last.top + 0.34], [cx2, last.y - cw2, last.top + 0.34]], 'rgba(' + ACC[q.accent] + ',' + (0.8 * alpha).toFixed(3) + ')', null);
      } else {
        poly(k, [[last.x - last.ax, last.y - last.ay, last.top], [last.x + last.ax, last.y - last.ay, last.top], [last.x + last.ax, last.y + last.ay, last.top], [last.x - last.ax, last.y + last.ay, last.top]], 'rgba(253,253,254,' + alpha.toFixed(3) + ')', last.inkS, isSel ? 1.2 : 0.7);
        /* parapet + teras kütlesi + antenler */
        for (const w of WALLS) {
          if (nrm(k, w.n[0], w.n[1])[1] <= 0) continue;
          const a0 = [last.x + w.a[0] * last.ax, last.y + w.a[1] * last.ay], b0 = [last.x + w.b[0] * last.ax, last.y + w.b[1] * last.ay];
          seg(k, [a0[0], a0[1], last.top + 0.05], [b0[0], b0[1], last.top + 0.05], 'rgba(' + INK + ',' + (0.28 * alpha).toFixed(3) + ')', 0.8);
        }
        /* saçak bandı */
        for (const w of WALLS) {
          if (nrm(k, w.n[0], w.n[1])[1] <= 0) continue;
          const a0 = [last.x + w.a[0] * (last.ax + 0.035), last.y + w.a[1] * (last.ay + 0.035)];
          const b0 = [last.x + w.b[0] * (last.ax + 0.035), last.y + w.b[1] * (last.ay + 0.035)];
          poly(k, [[a0[0], a0[1], last.top - 0.055], [b0[0], b0[1], last.top - 0.055], [b0[0], b0[1], last.top + 0.02], [a0[0], a0[1], last.top + 0.02]], 'rgba(236,238,244,' + alpha.toFixed(3) + ')', 'rgba(' + INK + ',' + (0.24 * alpha).toFixed(3) + ')', 0.6);
        }
        /* çatı katı hacmi */
        const mx2 = last.ax * 0.42, my2 = last.ay * 0.42, mh = 0.16;
        for (const w of WALLS) {
          const v2 = nrm(k, w.n[0], w.n[1])[1];
          const a0 = [last.x - last.ax * 0.06 + w.a[0] * mx2, last.y + w.a[1] * my2];
          const b0 = [last.x - last.ax * 0.06 + w.b[0] * mx2, last.y + w.b[1] * my2];
          poly(k, [[a0[0], a0[1], last.top], [b0[0], b0[1], last.top], [b0[0], b0[1], last.top + mh], [a0[0], a0[1], last.top + mh]], v2 > 0 ? 'rgba(240,241,246,' + alpha.toFixed(3) + ')' : 'rgba(248,249,252,' + alpha.toFixed(3) + ')', 'rgba(' + INK + ',' + (0.24 * alpha).toFixed(3) + ')', 0.6);
        }
        poly(k, [[last.x - last.ax * 0.06 - mx2, last.y - my2, last.top + mh], [last.x - last.ax * 0.06 + mx2, last.y - my2, last.top + mh], [last.x - last.ax * 0.06 + mx2, last.y + my2, last.top + mh], [last.x - last.ax * 0.06 - mx2, last.y + my2, last.top + mh]], 'rgba(252,252,254,' + alpha.toFixed(3) + ')', 'rgba(' + INK + ',' + (0.22 * alpha).toFixed(3) + ')', 0.6);
        /* teras korkuluğu */
        for (const w of WALLS) {
          if (nrm(k, w.n[0], w.n[1])[1] <= 0) continue;
          const a0 = [last.x + w.a[0] * last.ax, last.y + w.a[1] * last.ay], b0 = [last.x + w.b[0] * last.ax, last.y + w.b[1] * last.ay];
          for (let ri = 0; ri <= 5; ri++) {
            const px2 = a0[0] + (b0[0] - a0[0]) * (ri / 5), py2 = a0[1] + (b0[1] - a0[1]) * (ri / 5);
            seg(k, [px2, py2, last.top], [px2, py2, last.top + 0.075], 'rgba(' + INK + ',' + (0.18 * alpha).toFixed(3) + ')', 0.5);
          }
        }
        /* anten + uyarı ışığı */
        if (q.kind === 'kule') {
          seg(k, [last.x + last.ax * 0.55, last.y - last.ay * 0.45, last.top], [last.x + last.ax * 0.55, last.y - last.ay * 0.45, last.top + 0.42], 'rgba(' + INK + ',' + (0.45 * alpha).toFixed(3) + ')', 0.7);
          const tp = P(k, last.x + last.ax * 0.55, last.y - last.ay * 0.45, last.top + 0.42);
          ctx.fillStyle = 'rgba(' + RED + ',' + (0.85 * alpha).toFixed(2) + ')';
          ctx.fillRect(tp[0] - 1.5, tp[1] - 1.5, 3, 3);
        }
      }
    };
    const tree = (k, x, y, sz, alpha) => {
      seg(k, [x, y, 0], [x, y, sz * 0.4], 'rgba(' + INK + ',' + (0.45 * alpha).toFixed(3) + ')', Math.max(0.8, k.s * sz * 0.04));
      poly(k, [[x - sz * 0.18, y, sz * 0.34], [x, y - sz * 0.18, sz * 0.34], [x + sz * 0.18, y, sz * 0.34], [x, y + sz * 0.18, sz * 0.34]], 'rgba(' + GRN + ',' + (0.22 * alpha).toFixed(3) + ')', 'rgba(' + GRN + ',' + (0.45 * alpha).toFixed(3) + ')');
      poly(k, [[x - sz * 0.13, y, sz * 0.54], [x, y - sz * 0.13, sz * 0.54], [x + sz * 0.13, y, sz * 0.54], [x, y + sz * 0.13, sz * 0.54]], 'rgba(' + GRN + ',' + (0.26 * alpha).toFixed(3) + ')', 'rgba(' + GRN + ',' + (0.4 * alpha).toFixed(3) + ')');
    };

    var paused = false;
    var ioObs = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (entries) {
      var vis = entries[0] && entries[0].isIntersecting;
      if (vis && paused) { paused = false; requestAnimationFrame(tick); }
      else if (!vis) { paused = true; }
    }, { threshold: 0.05 }) : null;
    if (ioObs) { ioObs.observe(c); c.__ioObs = ioObs; }
    const tick = t => {
      if (st.stopped || !c.isConnected) { if (ioObs) ioObs.disconnect(); return; }
      if (paused) return;
      try { draw(t); } catch (e) { st.h = requestAnimationFrame(tick); return; }
      requestAnimationFrame(tick);
    };
    const draw = t => {
      st.t = t;
      const rb = c.getBoundingClientRect();
      if (rb.width && Math.abs(rb.width - W) > 2) build();
      if (!W || !H) return;
      measureBand();
      const mx = host.client.x - rb.left, my = host.client.y - rb.top;
      const inside = mx > 0 && mx < W && my > 0 && my < H;
      if (inside) { touched = true; idle = t; }
      if (zoom !== zoomTo) {
        const p = zoomTo > zoomFrom ? ezOut(cl((t - zoomStart) / 1250, 0, 1)) : ez(cl((t - zoomStart) / 900, 0, 1));
        zoom = zoomFrom + (zoomTo - zoomFrom) * p;
      }
      if (!drag) {
        yaw += spin * 16 * (1 - zoom * 0.75);
        if (Math.abs(spin) > 0.00008) spin *= 0.96;
        else spin += ((touched ? 0.00003 : 0.00006) - spin) * 0.02;
      }
      if (!touched && t - idle > 6500) { sel = built[Math.floor(rnd(Math.floor(t / 1600)) * built.length)] || sel; idle = t; }
      const k = camK();
      const rev = ez(cl((t - t0) / 1300, 0, 1));

      reset();
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      const narrowV = W < 900;
      ctx.beginPath();
      ctx.rect(narrowV ? 0 : BX0 - 4, 0, narrowV ? W : (BX1 - BX0) + 8, Math.min(H, BY1 + 6));
      for (const ex of EXC) ctx.rect(ex.x, ex.y, ex.w, ex.h);
      ctx.clip('evenodd');

      /* hover */
      hov = null;
      if (inside) {
        const dep = q => q.x * (k.cs + k.sn) + q.y * (k.cs - k.sn);
        const front = lots.slice().sort((u, v) => dep(v) - dep(u));
        for (const q of front) if (inScreen(mx, my, sil(k, q))) { hov = q; break; }
      }
      if (!drag) c.style.cursor = zoomTo > 0.5 ? 'zoom-out' : hov ? 'zoom-in' : 'grab';

      const dim = zoom * 0.86;
      /* zemin ve caddeler */
      poly(k, [[-EX, -EY, 0], [EX, -EY, 0], [EX, EY, 0], [-EX, EY, 0]], '#FDFDFE', null);
      poly(k, [[-EX, -RW, 0], [EX, -RW, 0], [EX, RW, 0], [-EX, RW, 0]], 'rgba(' + INK + ',.04)', 'rgba(' + INK + ',.1)', 0.7);
      poly(k, [[-RW, -EY, 0], [RW, -EY, 0], [RW, EY, 0], [-RW, EY, 0]], 'rgba(' + INK + ',.04)', 'rgba(' + INK + ',.1)', 0.7);
      seg(k, [-EX, 0, 0], [EX, 0, 0], 'rgba(' + INK + ',.14)', 0.6, [7, 7]);
      seg(k, [0, -EY, 0], [0, EY, 0], 'rgba(' + INK + ',.14)', 0.6, [7, 7]);

      for (let ty = -EY + 0.55; ty < EY - 0.2; ty += 0.78) if (Math.abs(ty) > RW * 0.6) { tree(k, RW - 0.17, ty, 0.46, 1); tree(k, -RW + 0.17, ty, 0.46, 1); }
      for (let tx = -EX + 0.7; tx < EX - 0.3; tx += 1.05) if (Math.abs(tx) > RW + 0.3) { tree(k, tx, RW - 0.17, 0.42, 1); tree(k, tx, -RW + 0.17, 0.42, 1); }
      /* parseller */
      for (const q of lots) {
        const isSel = q === sel;
        const al = isSel ? 1 : 1 - dim;
        const fp = [[q.x - q.w / 2, q.y - q.d / 2, 0], [q.x + q.w / 2, q.y - q.d / 2, 0], [q.x + q.w / 2, q.y + q.d / 2, 0], [q.x - q.w / 2, q.y + q.d / 2, 0]];
        poly(k, fp, isSel ? 'rgba(' + BLUE + ',.07)' : q.kind === 'bos' ? 'rgba(' + GRN + ',' + (0.07 * al).toFixed(3) + ')' : null,
          isSel ? 'rgba(' + BLUE + ',.9)' : 'rgba(' + INK + ',' + (0.16 * al).toFixed(3) + ')', isSel ? 1.2 : 0.6);
        if (q.kind === 'bos') for (let i = 0; i < 4; i++) {
          const u = q.w * ((i + 0.5) / 4);
          seg(k, [q.x - q.w / 2 + u, q.y + q.d / 2, 0], [q.x - q.w / 2 + u + q.d * 0.5, q.y - q.d / 2, 0], 'rgba(' + INK + ',' + (0.1 * al).toFixed(3) + ')', 0.5);
        }
        if (isSel) for (const cn of fp) {
          const p0 = P(k, cn[0], cn[1], 0);
          ctx.strokeStyle = 'rgba(' + RED + ',.75)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p0[0] - 5, p0[1]); ctx.lineTo(p0[0] + 5, p0[1]); ctx.moveTo(p0[0], p0[1] - 5); ctx.lineTo(p0[0], p0[1] + 5); ctx.stroke();
        }
      }

      /* gölgeler: tek yön, komşuya da düşer */
      for (const q of lots) {
        if (!q.mass || !q.mass.length) continue;
        const isSel = q === sel;
        const al = isSel ? 1 : 1 - dim;
        const g0 = isSel ? zoom : 0;
        const bm = q.mass[0];
        const bx2 = bm.ax * (1 + 0.5 * g0), by2 = bm.ay * (1 + 0.5 * g0);
        const off = (q.h * (1 + 1.05 * g0)) * 0.42;
        poly(k, [[q.x - bx2 + off, q.y - by2 + off, 0], [q.x + bx2 + off, q.y - by2 + off, 0], [q.x + bx2 + off, q.y + by2 + off, 0], [q.x - bx2 + off, q.y + by2 + off, 0]], 'rgba(' + INK + ',' + (0.1 * al).toFixed(3) + ')', null);
      }
      /* yapılar, arkadan öne */
      const dep = q => q.x * (k.cs + k.sn) + q.y * (k.cs - k.sn);
      for (const q of lots.slice().sort((u, v) => dep(u) - dep(v))) {
        const isSel = q === sel;
        const al = isSel ? 1 : 1 - dim;
        if (q.kind !== 'bos') bldg(k, q, al, isSel, q === hov && !isSel, isSel ? zoom : 0);
        if (isSel && zoom > 0.3 && q.kind !== 'bos') closeUp(k, q, zoom, cl((zoom - 0.35) / 0.6, 0, 1));

      }
      ctx.restore();

      /* etiket / analiz kartı */
      const target = zoom > 0.5 ? sel : (hov || sel);
      const lot = scOf(target);
      const ap = P(k, target.x, target.y, Math.max(0.1, target.h));
      const kindTxt = { bos: 'İMARLI ARSA', ev: 'MÜSTAKİL EV', blok: 'APARTMAN', kule: 'YÜKSEK BLOK' };
      ctx.globalAlpha = rev;
      if (false) {
        const rows = [
          ['m² FİYATI', tl(lot.fiyat) + ' ₺', INK],
          ['KİRA GETİRİSİ', '%' + tr(lot.roi), GRN],
          ['AMORTİSMAN', tr(lot.am) + ' YIL', INK],
          ['MEDYANA SAPMA', (lot.sap < 0 ? '−' : '+') + '%' + tr(Math.abs(lot.sap)), lot.sap < 0 ? GRN : RED],
          ['LİKİDİTE', lot.lik + ' / 100', BLUE]
        ];
        const bandL = W < 900 ? 8 : BX0, bandR = W < 900 ? W - 8 : BX1;
        const cw2 = Math.min(232, Math.max(150, (bandR - bandL) * 0.46)), hh = 44;
        const bandH = Math.max(150, BY1 - 26);
        const rh = cl((bandH - hh - 34) / rows.length, 20, 30);
        const bh = hh + rows.length * rh + 34;
        const bx = cl(ap[0] > (bandL + bandR) / 2 ? ap[0] - cw2 - 22 : ap[0] + 22, bandL, Math.max(bandL, bandR - cw2));
        const by = cl(ap[1] - bh * 0.4, 26, Math.max(26, BY1 - bh));
        const al = cl((zoom - 0.35) / 0.4, 0, 1);
        ctx.globalAlpha = rev * al;
        ctx.strokeStyle = 'rgba(' + BLUE + ',.5)'; ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(ap[0], ap[1]); ctx.lineTo(bx > ap[0] ? bx : bx + cw2, by + hh * 0.5); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, by, cw2, bh);
        ctx.strokeStyle = 'rgba(' + INK + ',.18)'; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, cw2 - 1, bh - 1);
        ctx.fillStyle = '#1B4DFF'; ctx.fillRect(bx, by, cw2, hh);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        try { ctx.letterSpacing = '1.8px'; } catch (e) {}
        ctx.font = mono(10); ctx.fillStyle = '#FFFFFF';
        ctx.fillText('PARSEL ' + target.id, bx + 14, by + 19);
        ctx.font = mono(9); ctx.fillStyle = 'rgba(255,255,255,.78)';
        ctx.fillText(target.m2 + ' m² · ' + kindTxt[target.kind], bx + 14, by + 35);
        rows.forEach((rw, i) => {
          const ry = by + hh + i * rh;
          ctx.strokeStyle = 'rgba(' + INK + ',.1)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx + 14, ry + rh - 0.5); ctx.lineTo(bx + cw2 - 14, ry + rh - 0.5); ctx.stroke();
          try { ctx.letterSpacing = '1.4px'; } catch (e) {}
          ctx.font = mono(8.5); ctx.fillStyle = 'rgba(' + INK + ',.45)';
          ctx.fillText(rw[0], bx + 14, ry + 19);
          try { ctx.letterSpacing = '0px'; } catch (e) {}
          ctx.font = gro(14); ctx.fillStyle = 'rgba(' + rw[2] + ',1)';
          ctx.textAlign = 'right';
          ctx.fillText(rw[1], bx + cw2 - 14, ry + 20);
          ctx.textAlign = 'left';
        });
        const fy = by + hh + rows.length * rh;
        ctx.fillStyle = 'rgba(' + lot.bar + ',1)'; ctx.fillRect(bx, fy + 6, cw2, 28);
        try { ctx.letterSpacing = '1.8px'; } catch (e) {}
        ctx.font = mono(10); ctx.fillStyle = '#FFFFFF';
        ctx.fillText(lot.karar + ' · ' + lot.not, bx + 14, fy + 24);
        try { ctx.letterSpacing = '0px'; } catch (e) {}
      } else {
        const label = 'PARSEL ' + target.id + ' · ' + target.m2 + ' m² · ' + kindTxt[target.kind];
        ctx.font = mono(9);
        try { ctx.letterSpacing = '1.6px'; } catch (e) {}
        const bw = ctx.measureText(label).width + 24, bh = 22;
        const bandL = W < 900 ? 8 : BX0, bandR = W < 900 ? W - 8 : BX1;
        const bx = Math.max(bandL, bandR - bw);
        let by = BY0 + 2;
        for (const ex of EXC) if (bx < ex.x + ex.w && bx + bw > ex.x && by < ex.y + ex.h && by + bh > ex.y) by = Math.max(6, ex.y - bh - 6);
        const apIn = ap[1] < BY1 && ap[0] > (W < 900 ? 0 : BX0 - 6) && ap[0] < BX1 + 6;
        if (apIn) {
          ctx.strokeStyle = 'rgba(' + BLUE + ',.5)'; ctx.lineWidth = 0.7;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(ap[0], ap[1]); ctx.lineTo(bx < ap[0] ? bx + bw : bx, by + bh / 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#1B4DFF';
          ctx.fillRect(ap[0] - 2, ap[1] - 2, 4, 4);
        }
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(label, bx + 12, by + 15);
        try { ctx.letterSpacing = '0px'; } catch (e) {}
      }
      ctx.globalAlpha = 1;

      /* künye */
      const capX = W < 900 ? 14 : BX0 + 2;
      ctx.textAlign = 'left';
      try { ctx.letterSpacing = '2.4px'; } catch (e) {}
      ctx.font = mono(10);
      ctx.fillStyle = 'rgba(' + BLUE + ',.9)';
      ctx.fillText(zoomTo > 0.5 ? 'TIKLA → HARİTAYA DÖN' : hov ? 'PARSEL ' + hov.id + ' · TIKLA VE ANALİZ ET' : 'PARSEL SEÇ · ANALİZ SONUCUNU GÖR', capX, W < 900 ? 16 : 30);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(' + INK + ',.34)';
      ctx.fillText('SÜRÜKLE → 360°', W - 16, 16);
      try { ctx.letterSpacing = '0px'; } catch (e) {}
      ctx.textAlign = 'left';
    };
    requestAnimationFrame(tick);
  }

