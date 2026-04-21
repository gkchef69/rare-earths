import { loadAppData, loadTranslations } from './data-service.js';
import { icon, getLocalized, pagePath, createSectionTitle, cardButton, revealAll, buildSourceLink, escapeHtml } from './ui.js';

const state = {
  lang: localStorage.getItem('atlas-language') || 'el',
  theme: localStorage.getItem('atlas-theme') || 'dark',
  data: null,
  galleryItems: [],
  lightboxIndex: 0,
  lightbox: { items: [], index: 0 }
};

function currentPage() {
  return document.body.dataset.page || 'home';
}

function t(key, options) {
  return window.i18next.t(key, options);
}

function themeLabel(theme) {
  return theme === 'dark' ? t('theme.dark') : t('theme.light');
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('atlas-theme', theme);
  const toggle = document.querySelector('[data-action="theme-toggle"]');
  if (toggle) {
    toggle.innerHTML = `${theme === 'dark' ? icon('sun') : icon('moon')} ${escapeHtml(themeLabel(theme))}`;
  }
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('atlas-language', lang);
  window.i18next.changeLanguage(lang).then(() => render());
}

function getEntityById(collection = [], id) {
  return collection.find((item) => item.id === id);
}

function getMediaById(id) {
  return getEntityById(state.data?.media || [], id);
}

function resolveMedia(ref) {
  if (!ref) return null;
  if (typeof ref === 'string') return getMediaById(ref);
  return ref;
}

function mediaUrl(media) {
  if (!media?.src) return '';
  return media.src.startsWith('./') ? media.src : `./${media.src.replace(/^\.\//, '')}`;
}

function mediaImageAttrs(media, { containForIllustration = true } = {}) {
  const styles = [];
  const classes = [];
  if (media?.objectPosition) styles.push(`object-position:${media.objectPosition}`);
  if (media?.kind === 'illustration' && containForIllustration) classes.push('is-illustration');
  if (media?.renderMode === 'cover') classes.push('is-cover');
  return {
    className: classes.join(' '),
    styleAttr: styles.length ? ` style="${styles.join(';')}"` : ''
  };
}

function mediaLightboxButton(mediaId, label) {
  if (!mediaId) return '';
  return `<button class="media-zoom-btn" type="button" data-open="lightbox" data-media-id="${mediaId}" aria-label="${escapeHtml(label)}">${icon('camera')}</button>`;
}

function mediaPosition(media, variant = 'card') {
  return media?.focus?.[variant] || media?.focus?.card || '50% 50%';
}

function mediaFit(media, variant = 'card') {
  if (media?.kind === 'illustration') return 'contain';
  return media?.fit?.[variant] || media?.fit?.card || 'cover';
}

function mediaStyle(media, variant = 'card') {
  return `style="--media-pos:${mediaPosition(media, variant)}; --media-fit:${mediaFit(media, variant)};"`;
}

function entityImage(entity, fallbackPath) {
  const media = resolveMedia(entity?.mediaRef || entity?.coverMediaRef);
  if (media?.src) return mediaUrl(media);
  if (entity?.image) return entity.image.startsWith('./') ? entity.image : `./${entity.image.replace(/^\.\//, '')}`;
  return fallbackPath;
}

function mediaCredit(itemOrMedia) {
  const media = itemOrMedia?.src ? itemOrMedia : resolveMedia(itemOrMedia?.mediaRef || itemOrMedia?.coverMediaRef) || itemOrMedia;
  if (!media?.credit) return '';
  const bits = [media.credit.author, media.credit.license].filter(Boolean).map((part) => escapeHtml(part));
  if (!bits.length) return '';
  const sourceUrl = media.credit.sourceUrl ? escapeHtml(media.credit.sourceUrl) : '';
  const sourceOpen = sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noreferrer">` : '';
  const sourceClose = sourceUrl ? '</a>' : '';
  return `<div class="credit-line small muted mt-3">${escapeHtml(t('cards.photoCredit'))}: ${sourceOpen}${bits.join(' · ')}${sourceClose}</div>`;
}

function localizedMedia(mediaRef) {
  const media = resolveMedia(mediaRef);
  return { media, localized: getLocalized(media, state.lang) };
}

function navLink(page, label) {
  const active = currentPage() === page ? 'active' : '';
  return `<a class="nav-link ${active}" href="${pagePath(page)}">${label}</a>`;
}




function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    
    <div class="atlas-bg-motion" aria-hidden="true">
      <canvas class="bg-network" id="bgNetwork"></canvas>
      <div class="bg-network-glow"></div>
    </div>
    
    <div class="cursor-overlay" id="cursorOverlay" aria-hidden="true">
      <span class="cursor-ring"></span>
      <span class="cursor-dot"></span>
    </div>
    <header class="container-tight site-header" id="siteHeader">
      <nav class="navbar navbar-expand-lg glass nav-shell" id="siteNav">
        <div class="container-fluid px-1">
          <a class="navbar-brand brand-badge" href="${pagePath('home')}">
            <span class="brand-mark"></span>
            <span>
              <span class="d-block">Rare Earth Atlas</span>
              <small class="text-body-secondary">${escapeHtml(t('site.subtitle'))}</small>
            </span>
          </a>
          <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#atlasNav" aria-label="${escapeHtml(t('nav.menu'))}">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="atlasNav">
            
<div class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              ${navLink('home', t('nav.home'))}
              <div class="nav-item dropdown atlas-mega-wrap">
                <a class="nav-link dropdown-toggle ${['elements','applications','gallery','articles','sources','article'].includes(currentPage()) ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${escapeHtml(t('nav.discover'))}</a>
                <div class="dropdown-menu atlas-mega-menu glass border-0 p-0 overflow-hidden">
                  <div class="atlas-mega-grid">
                    <div class="atlas-mega-intro">
                      <div class="section-kicker mb-3">${icon('spark')} ${escapeHtml(t('nav.discoverLead'))}</div>
                      <h3 class="h4 mb-2">Rare Earth Atlas</h3>
                      <p class="mb-0 muted">${escapeHtml(t('site.subtitle'))}</p>
                    </div>
                    <div class="atlas-mega-links">
                      <a class="atlas-mega-link" href="${pagePath('elements')}"><strong>${escapeHtml(t('nav.elements'))}</strong><span>${icon('atom')} 17 στοιχεία, χρήσεις και βασικά facts</span></a>
                      <a class="atlas-mega-link" href="${pagePath('applications')}"><strong>${escapeHtml(t('nav.applications'))}</strong><span>${icon('chip')} Συσκευές, οχήματα, ενέργεια και ιατρική</span></a>
                      <a class="atlas-mega-link" href="${pagePath('gallery')}"><strong>${escapeHtml(t('nav.gallery'))}</strong><span>${icon('camera')} Curated visuals με lightbox προβολή</span></a>
                      <a class="atlas-mega-link" href="${pagePath('articles')}"><strong>${escapeHtml(t('nav.articles'))}</strong><span>${icon('layers')} Άρθρα, ανάλυση και editorial context</span></a>
                      <a class="atlas-mega-link" href="${pagePath('sources')}"><strong>${escapeHtml(t('nav.sources'))}</strong><span>${icon('external')} Πηγές, αναφορές και τεκμηρίωση</span></a>
                    </div>
                  </div>
                </div>
              </div>
              ${navLink('elements', t('nav.elements'))}
              ${navLink('applications', t('nav.applications'))}
              ${navLink('gallery', t('nav.gallery'))}
              ${navLink('articles', t('nav.articles'))}
              ${navLink('sources', t('nav.sources'))}
            </div>
            <div class="d-flex flex-column flex-lg-row gap-2 ms-lg-3 mt-3 mt-lg-0">
              <button class="atlas-pill" data-action="lang-toggle">${icon('language')} ${state.lang.toUpperCase()}</button>
              <button class="atlas-pill" data-action="theme-toggle">${state.theme === 'dark' ? icon('sun') : icon('moon')} ${escapeHtml(themeLabel(state.theme))}</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main id="page-root"></main>
    <footer class="container-tight footer-shell">
      <div class="glass rounded-5 p-4 p-lg-5 footer-card">
        <div class="row g-4 align-items-center">
          <div class="col-lg-8">
            <div class="section-kicker mb-3">${icon('archive')} ${escapeHtml(t('footer.kicker'))}</div>
            <h2 class="h4 mb-2">${escapeHtml(t('site.title'))}</h2>
            <p class="mb-0">${escapeHtml(t('footer.copy'))}</p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <span class="badge-soft">${icon('database')} ${escapeHtml(t('footer.meta'))}</span>
          </div>
        </div>
      </div>
    </footer>

    <button class="scroll-top-btn" id="scrollTopBtn" type="button" aria-label="${escapeHtml(t('cards.scrollTop'))}">${icon('top')}</button>

    <div class="modal fade" id="detailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <div class="badge-soft mb-2" id="detailBadge"></div>
              <h2 class="h4 mb-0" id="detailTitle"></h2>
            </div>
            <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="modal" aria-label="${escapeHtml(t('cards.closeLabel'))}"></button>
          </div>
          <div class="modal-body" id="detailBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-atlas-ghost" data-bs-dismiss="modal">${escapeHtml(t('common.close'))}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="lightboxModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content lightbox-content">
          <div class="modal-header border-0 pb-0">
            <div>
              <div class="badge-soft mb-2" id="lightboxCounter"></div>
              <h2 class="h4 mb-0" id="lightboxTitle"></h2>
            </div>
            <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="lightbox-stage">
              <button class="lightbox-nav lightbox-prev" type="button" id="lightboxPrev" aria-label="${escapeHtml(t('cards.prevImage'))}">${icon('arrow')}</button>
              <figure class="lightbox-figure mb-0">
                <div class="lightbox-media-frame"><img id="lightboxImage" src="" alt=""></div>
                <figcaption class="lightbox-caption mt-3">
                  <p class="mb-0 muted" id="lightboxCaption"></p>
                  <div id="lightboxCredit"></div>
                </figcaption>
              </figure>
              <button class="lightbox-nav lightbox-next" type="button" id="lightboxNext" aria-label="${escapeHtml(t('cards.nextImage'))}">${icon('arrow')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

bindShellActions();
bindWindowChrome();
initBackgroundNetwork();
setTheme(state.theme);
}

function initBackgroundNetwork() {
  const canvas = document.getElementById('bgNetwork');
  const motion = document.querySelector('.atlas-bg-motion');
  if (!canvas || !motion) return;

  if (window.__atlasNetworkCleanup) {
    window.__atlasNetworkCleanup();
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let rafId = null;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  
  let burstSeeds = [];

function ensureBurstSeeds(count = 40) {
  while (burstSeeds.length < count) {
    burstSeeds.push({
      angle: Math.random() * Math.PI * 2,
      drift: 0.25 + Math.random() * 0.95,
      pulse: Math.random() * Math.PI * 2,
      len: 0.72 + Math.random() * 0.95,
      wiggle: (Math.random() - 0.5) * 0.75,
      alpha: 0.82 + Math.random() * 0.35,
      width: 0.85 + Math.random() * 1.1,
      dot: 0.9 + Math.random() * 2.2
    });
  }

  if (burstSeeds.length > count) {
    burstSeeds.length = count;
  }
}

  const focus = {
      x: window.innerWidth * 0.62,
      y: window.innerHeight * 0.36,
      tx: window.innerWidth * 0.62,
      ty: window.innerHeight * 0.36,
      active: false,
      lastMove: 0,
      seed: Math.random() * Math.PI * 2
    };
    
    const cursor = {
  x: window.innerWidth * 0.62,
  y: window.innerHeight * 0.36,
  active: false,
  burstAllowed: false
};

cursor.el = document.getElementById('cursorOverlay');

  const isLight = () => document.documentElement.getAttribute('data-bs-theme') === 'light';

  const palette = () => {
    if (isLight()) {
      return {
        node: 'rgba(38, 98, 255, 0.95)',
        nodeSoft: 'rgba(109, 86, 255, 0.75)',
        line: 'rgba(32, 94, 255, 0.16)',
        lineStrong: 'rgba(76, 116, 255, 0.38)',
        glow: 'rgba(35, 98, 255, 0.16)',
        center: 'rgba(48, 105, 255, 0.95)'
      };
    }

    return {
      node: 'rgba(82, 132, 255, 0.95)',
      nodeSoft: 'rgba(122, 102, 255, 0.78)',
      line: 'rgba(58, 108, 255, 0.14)',
      lineStrong: 'rgba(88, 138, 255, 0.42)',
      glow: 'rgba(40, 98, 255, 0.18)',
      center: 'rgba(155, 182, 255, 0.96)'
    };
  };

  const getNodeCount = () => {
  const area = window.innerWidth * window.innerHeight;
  if (area < 500000) return 150;
  if (area < 900000) return 185;
  return 225;
};

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = getNodeCount();

    if (!nodes.length) {
      nodes = Array.from({ length: targetCount }, () => createNode());
    } else if (nodes.length < targetCount) {
      while (nodes.length < targetCount) nodes.push(createNode());
    } else if (nodes.length > targetCount) {
      nodes.length = targetCount;
    }
    
    ensureBurstSeeds();
  }

  function createNode() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.12 + Math.random() * 0.28;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() < 0.14 ? 2.2 : 1.2 + Math.random() * 1.1,
      tint: Math.random() > 0.72 ? 'soft' : 'base'
    };
  }

  function drawGlow(x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

function draw() {
  rafId = requestAnimationFrame(draw);
  ctx.clearRect(0, 0, width, height);

  const colors = palette();
  const now = performance.now() * 0.001;

  /* autonomous focus: κινείται πάντα μόνο του */
  focus.tx =
    width * 0.5 +
    Math.cos(now * 0.55 + focus.seed) * width * 0.18 +
    Math.sin(now * 1.1 + focus.seed * 0.7) * width * 0.04;

  focus.ty =
    height * 0.45 +
    Math.sin(now * 0.42 + focus.seed * 1.3) * height * 0.2 +
    Math.cos(now * 0.9 + focus.seed) * height * 0.035;

  focus.x += (focus.tx - focus.x) * 0.09;
  focus.y += (focus.ty - focus.y) * 0.09;

  const connectDist = isLight() ? 138 : 158;
  const fieldRadius = isLight() ? 170 : 195;
  const burstRadius = isLight() ? 165 : 195;

  drawGlow(focus.x, focus.y, isLight() ? 135 : 170, colors.glow);

  /* burst origin μόνο όταν το cursor πλησιάζει node */
  let burstOrigin = null;

 if (cursor.active && cursor.burstAllowed) {
  const hitRadius = isLight() ? 46 : 54;
  let nearest = null;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const dx = cursor.x - n.x;
    const dy = cursor.y - n.y;
    const dist = Math.hypot(dx, dy);

    if (dist < hitRadius && (!nearest || dist < nearest.dist)) {
      nearest = { node: n, dist };
    }
  }

  if (nearest) {
    burstOrigin = {
      x: cursor.x,
      y: cursor.y,
      node: nearest.node,
      dist: nearest.dist
    };
  }
}

  /* update nodes: πάντα κινούνται μόνα τους */
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];

    /* worm-like autonomous motion */
    const wormX =
      Math.sin(now * (0.85 + (i % 7) * 0.06) + i * 0.31 + n.y * 0.006) * 0.020 +
      Math.cos(now * (1.55 + (i % 5) * 0.05) + i * 0.19 + n.x * 0.004) * 0.010;

    const wormY =
      Math.cos(now * (0.72 + (i % 9) * 0.04) + i * 0.27 + n.x * 0.005) * 0.006 +
      Math.sin(now * (1.18 + (i % 6) * 0.05) + i * 0.23 + n.y * 0.003) * 0.003;

    n.vx += wormX;
    n.vy += wormY;

    /* subtle autonomous field από το moving focus */
    const dxf = focus.x - n.x;
    const dyf = focus.y - n.y;
    const distField = Math.hypot(dxf, dyf);

    if (distField < fieldRadius && distField > 0) {
      const t = 1 - distField / fieldRadius;
      const inv = 1 / distField;
      const nx = dxf * inv;
      const ny = dyf * inv;
      const tx = -ny;
      const ty = nx;

      n.vx += tx * 0.010 * t;
      n.vy += ty * 0.010 * t;

      n.vx += Math.sin(now * 1.6 + i * 0.23) * 0.0018 * t;
      n.vy += Math.cos(now * 1.3 + i * 0.19) * 0.0014 * t;
    }

    /* αν υπάρχει burst κοντά στο cursor, ελαφριά τοπική αντίδραση */
    if (burstOrigin) {
      const dxb = burstOrigin.x - n.x;
      const dyb = burstOrigin.y - n.y;
      const distBurst = Math.hypot(dxb, dyb);

      if (distBurst < burstRadius && distBurst > 0) {
        const t = 1 - distBurst / burstRadius;
        const inv = 1 / distBurst;
        const nx = dxb * inv;
        const ny = dyb * inv;

        /* outward push, όχι web-lock */
        n.vx -= nx * 0.010 * t;
        n.vy -= ny * 0.010 * t;
      }
    }

    n.vx *= 0.992;
    n.vy *= 0.992;

    const speedLimit = 0.72;
    n.vx = Math.max(-speedLimit, Math.min(speedLimit, n.vx));
    n.vy = Math.max(-speedLimit, Math.min(speedLimit, n.vy));

    n.x += n.vx;
    n.y += n.vy;

    if (n.x < -10) n.x = width + 10;
    if (n.x > width + 10) n.x = -10;
    if (n.y < -10) n.y = height + 10;
    if (n.y > height + 10) n.y = -10;
  }

/* base network: πιο πυκνά local clusters / περισσότερα τριγωνάκια */
const localDist = isLight() ? 112 : 132;
const maxLinksPerNode = isLight() ? 4 : 5;

for (let i = 0; i < nodes.length; i++) {
  const a = nodes[i];
  const neighbors = [];

  for (let j = i + 1; j < nodes.length; j++) {
    const b = nodes[j];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.hypot(dx, dy);

    if (dist < localDist) {
      const dv = Math.abs(a.vx - b.vx) + Math.abs(a.vy - b.vy);
      neighbors.push({ node: b, dist, dv });
    }
  }

  neighbors.sort((p, q) => (p.dv - q.dv) || (p.dist - q.dist));

  const chosen = neighbors.slice(0, maxLinksPerNode);

  for (const item of chosen) {
    const b = item.node;
    const alpha = (1 - item.dist / localDist) * (isLight() ? 0.62 : 0.86);

    ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, `${alpha})`);
    ctx.lineWidth = item.dist < 38 ? 1.08 : 0.86;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

  /* draw nodes */
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    ctx.fillStyle = n.tint === 'soft' ? colors.nodeSoft : colors.node;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
    ctx.fill();
  }

  /* burst only on proximity hit */
  if (burstOrigin) {
    const burstNearby = [];

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = burstOrigin.x - n.x;
      const dy = burstOrigin.y - n.y;
      const dist = Math.hypot(dx, dy);

      if (dist < burstRadius) {
        burstNearby.push({ node: n, dist });
      }
    }

    burstNearby.sort((a, b) => a.dist - b.dist);

    /* rays προς κοντινούς κόμβους, λιγότερες για να μη γίνεται αράχνη */
    const rays = burstNearby.slice(0, 14);
for (let r = 0; r < rays.length; r++) {
  const item = rays[r];
  const n = item.node;

  const baseAlpha = (1 - item.dist / burstRadius) * (isLight() ? 0.72 : 0.92);

  /* κύκλος: πετάγεται -> πιάνει -> τραβιέται -> μαζεύεται */
  const cycle = (Math.sin(now * 3.1 + r * 0.7) + 1) * 0.5;

  /* πόσο έξω φεύγει η ακτίνα */
  const travel = 0.18 + cycle * 0.92;

  /* μικρό pull αφού “πιάσει” */
  const tug = Math.sin(now * 6.2 + r * 0.9) * (0.12 + cycle * 0.1);

  const dx = n.x - burstOrigin.x;
  const dy = n.y - burstOrigin.y;
  const dist = Math.hypot(dx, dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const px = -ny;
  const py = nx;

  /* τελικό άκρο της πετονιάς:
     δεν πάει πάντα μέχρι πάνω στο node, πάει-έρχεται */
  const tipX = burstOrigin.x + dx * travel + px * tug * 18;
  const tipY = burstOrigin.y + dy * travel + py * tug * 18;

  /* control point για λύγισμα της γραμμής */
  const curveBias = (0.16 + cycle * 0.24) * Math.sin(now * 4.4 + r * 0.8);
  const ctrlX = burstOrigin.x + dx * 0.52 + px * curveBias * 42;
  const ctrlY = burstOrigin.y + dy * 0.52 + py * curveBias * 42;

  ctx.strokeStyle = colors.lineStrong.replace(
    /[\d.]+\)$/,
    `${baseAlpha * (0.7 + cycle * 0.35)})`
  );
  ctx.lineWidth = (item.dist < 36 ? 1.15 : 0.9) + cycle * 0.45;

  ctx.beginPath();
  ctx.moveTo(burstOrigin.x, burstOrigin.y);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
  ctx.stroke();

  /* τελεία στο άκρο της κινούμενης ακτίνας */
  ctx.fillStyle = colors.nodeSoft.replace(
    /[\d.]+\)$/,
    `${0.48 + cycle * 0.32})`
  );
  ctx.beginPath();
  ctx.arc(tipX, tipY, 0.9 + cycle * 1.1, 0, Math.PI * 2);
  ctx.fill();
}

    /* loose pulsing burst */
    const burstCount = isLight() ? 14 : 18;
    const rayTips = [];

    for (let k = 0; k < burstCount; k++) {
      const s = burstSeeds[k];

      const angle =
        s.angle +
        Math.sin(now * (0.42 + s.drift * 0.2) + s.pulse) * (0.14 + s.wiggle * 0.12) +
        Math.cos(now * (0.88 + s.drift * 0.1) + s.pulse * 1.6) * 0.06;

      const pulseA = (Math.sin(now * (2.0 + s.drift * 0.3) + s.pulse) + 1) * 0.5;
      const pulseB = (Math.cos(now * (1.2 + s.drift * 0.18) + s.pulse * 1.5) + 1) * 0.5;
      const pulse = pulseA * 0.68 + pulseB * 0.32;

      const minLen = isLight() ? 12 : 14;
      const maxLen = (isLight() ? 118 : 156) * s.len;
      const len = minLen + pulse * (maxLen - minLen);

      const x2 = burstOrigin.x + Math.cos(angle) * len;
      const y2 = burstOrigin.y + Math.sin(angle) * len;

      rayTips.push({ x: x2, y: y2, pulse });

      const alphaBase = isLight() ? 0.12 : 0.16;
      const alphaPeak = (isLight() ? 0.50 : 0.64) * s.alpha;
      const alpha = alphaBase + pulse * (alphaPeak - alphaBase);

      ctx.strokeStyle = colors.lineStrong.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = 0.65 + pulse * s.width * 0.95;

      ctx.beginPath();
      ctx.moveTo(burstOrigin.x, burstOrigin.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.fillStyle = colors.nodeSoft.replace(
        /[\d.]+\)$/,
        `${0.52 + pulse * 0.28})`
      );
      ctx.beginPath();
      ctx.arc(x2, y2, 0.8 + pulse * s.dot * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    /* χαλαρές συνδέσεις των tips με κοντινά nodes */
    const rayJoinRadius = isLight() ? 58 : 72;

    for (const tip of rayTips) {
      const neighbors = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = tip.x - n.x;
        const dy = tip.y - n.y;
        const dist = Math.hypot(dx, dy);

        if (dist < rayJoinRadius) {
          neighbors.push({ node: n, dist });
        }
      }

      neighbors.sort((a, b) => a.dist - b.dist);

      const joinCount = Math.min(neighbors.length, 2);
      for (let j = 0; j < joinCount; j++) {
        const item = neighbors[j];
        const alpha = (1 - item.dist / rayJoinRadius) * (isLight() ? 0.24 : 0.34);

        ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(item.node.x, item.node.y);
        ctx.stroke();
      }
    }
  }


}

function cursorCanBurst(target) {
  if (!target || !(target instanceof Element)) return false;

  /* ποτέ πάνω σε navigation / controls / cards / modals / links / buttons */
  if (
    target.closest(
      'header, nav, .nav-shell, .navbar, .dropdown-menu, .atlas-mega-menu,' +
      'button, a, input, select, textarea, label,' +
      '.btn, .atlas-pill, .scroll-top-btn,' +
      '.content-card, .article-card, .media-card, .source-card, .matter-card,' +
      '.modal, .modal-dialog, .modal-content, .lightbox-content,' +
      '[data-open], [role="button"]'
    )
  ) {
    return false;
  }

  /* επιτρέπεται μόνο μέσα στο main ή footer κενό χώρο */
  return !!target.closest('main, .footer-shell');
}

function updateCursorOverlay() {
  if (!cursor.el) return;

  cursor.el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
  cursor.el.classList.toggle('is-visible', cursor.active);
  cursor.el.classList.toggle('is-bursting', cursor.active && cursor.burstAllowed);
}

function cursorCanBurstAtPoint(x, y) {
  const stack = document
    .elementsFromPoint(x, y)
    .filter((el) => el.id !== 'cursorOverlay' && !el.closest?.('#cursorOverlay'));

  if (!stack.length) return false;

  /* πιο αυστηρό κόψιμο πάνω σε UI/elements */
  if (
    stack.some((el) =>
      el.closest?.(
        'header, nav, .navbar, .nav-shell, .dropdown-menu, .atlas-mega-menu,' +
        '.glass, .hero-card, .page-hero-card, .issue-strip, .metric-card,' +
        '.content-card, .article-card, .media-card, .media-frame, .source-card, .matter-card,' +
        '.filter-bar, .badge-soft,' +
        'button, a, input, select, textarea, label,' +
        '.btn, .atlas-pill, .scroll-top-btn,' +
        '.modal, .modal-dialog, .modal-content, .lightbox-content,' +
        '[data-open], [role="button"]'
      )
    )
  ) {
    return false;
  }

  return stack.some((el) => el.closest?.('main, .footer-shell'));
}

 function onMouseMove(e) {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  cursor.active = true;
  cursor.burstAllowed = cursorCanBurstAtPoint(e.clientX, e.clientY);
  updateCursorOverlay();
}

function onMouseLeave() {
  cursor.active = false;
  cursor.burstAllowed = false;
  updateCursorOverlay();
}

  function onResize() {
    resizeCanvas();
  }

  resizeCanvas();
  draw();

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', onResize);

  window.__atlasNetworkCleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', onResize);
  };
}

function bindShellActions() {
  document.querySelector('[data-action="lang-toggle"]')?.addEventListener('click', () => {
    const next = state.lang === 'el' ? 'en' : 'el';
    setLanguage(next);
  });

  document.querySelector('[data-action="theme-toggle"]')?.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });


  const lightboxModalEl = document.getElementById('lightboxModal');
  const lightboxModal = bootstrap.Modal.getOrCreateInstance(lightboxModalEl);

  document.getElementById('lightboxPrev')?.addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => moveLightbox(1));

  if (window.__atlasLightboxKeys) {
    document.removeEventListener('keydown', window.__atlasLightboxKeys);
  }

  window.__atlasLightboxKeys = (event) => {
    const isOpen = lightboxModalEl?.classList.contains('show');
    if (!isOpen) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  };
  document.addEventListener('keydown', window.__atlasLightboxKeys);

  lightboxModalEl?.addEventListener('hidden.bs.modal', () => {
    document.body.classList.remove('has-lightbox-open');
  });
  lightboxModalEl?.addEventListener('shown.bs.modal', () => {
    document.body.classList.add('has-lightbox-open');
  });

  window.__atlasLightboxModal = lightboxModal;
}

function bindWindowChrome() {
  const header = document.getElementById('siteHeader');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    header?.classList.toggle('is-scrolled', y > 24);
    scrollTopBtn?.classList.toggle('is-visible', y > 420);
};

  if (window.__atlasChromeHandler) {
    window.removeEventListener('scroll', window.__atlasChromeHandler);
  }

  window.__atlasChromeHandler = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll();
}

function issueStrip() {
  return `
    <div class="issue-strip reveal glass">
      <span>${icon('spark')} ${escapeHtml(t('cards.issueLabel'))}</span>
      <span>${icon('camera')} ${escapeHtml(t('cards.issueMedia'))}: ${state.data.media.length}</span>
      <span>${icon('archive')} ${escapeHtml(t('cards.issueThemes'))}</span>
    </div>
  `;
}

function buildMediaFrame(mediaRef, { label = '', compact = false } = {}) {
  const { media, localized } = localizedMedia(mediaRef);
  if (!media) return '';
  return `
    <figure class="media-frame ${compact ? 'compact' : ''} glass reveal">
      <div class="media-frame-image ${media.kind === 'illustration' ? 'is-illustration' : ''}" ${mediaStyle(media, compact ? 'card' : 'hero')}>
        ${(() => { const attrs = mediaImageAttrs(media); return `<img class="${attrs.className}"${attrs.styleAttr} src="${mediaUrl(media)}" alt="${escapeHtml(localized.alt || localized.title)}">`; })()}
      </div>
      <figcaption>
        ${label ? `<div class="section-kicker mb-2">${label}</div>` : ''}
        <h3>${escapeHtml(localized.title)}</h3>
        <p>${escapeHtml(localized.caption)}</p>
        ${mediaCredit(media)}
      </figcaption>
    </figure>
  `;
}



function buildElementCard(element) {
  const localized = getLocalized(element, state.lang);
  const uses = localized.uses.slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <article class="content-card glass reveal h-100 d-flex flex-column" data-open="element" data-id="${element.id}">
      <div class="card-media card-media-element">
        <img src="./assets/img/elements/${element.id}.svg" alt="${escapeHtml(localized.name)}">
      </div>
      <div class="p-4 d-flex flex-column h-100">
        <div class="d-flex justify-content-between gap-2 align-items-start mb-3">
          <div>
            <div class="badge-soft mb-2">${escapeHtml(element.symbol)} · #${element.atomicNumber}</div>
            <h3 class="h5 mb-1">${escapeHtml(localized.name)}</h3>
          </div>
          <span class="badge-soft">${escapeHtml(localized.tagline)}</span>
        </div>
        <p class="muted">${escapeHtml(localized.summary)}</p>
        <div class="mt-auto">
          <div class="small text-uppercase text-body-secondary fw-semibold mb-2">${escapeHtml(t('cards.keyUses'))}</div>
          <ul class="small muted ps-3 mb-0">${uses}</ul>
        </div>
      </div>
    </article>
  `;
}

function buildApplicationCard(app) {
  const localized = getLocalized(app, state.lang);
  const media = resolveMedia(app.mediaRef);
  return `
    <article class="content-card glass reveal h-100 d-flex flex-column" data-open="application" data-id="${app.id}">
      <div class="card-media ${media?.kind === 'illustration' ? 'card-media-illustration' : ''}" ${mediaStyle(media, 'card')}>
        ${(() => { const attrs = mediaImageAttrs(media); return `<img class="${attrs.className}"${attrs.styleAttr} src="${entityImage(app, `./assets/img/applications/${app.id}.svg`)}" alt="${escapeHtml(localized.name)}">`; })()}
      </div>
      <div class="p-4 d-flex flex-column h-100">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
          <span class="badge-soft">${escapeHtml(app.sector)}</span>
          <span class="badge-soft">${escapeHtml(t('cards.archiveLabel'))}</span>
        </div>
        <h3 class="h5 mb-2">${escapeHtml(localized.name)}</h3>
        <p class="muted mb-3">${escapeHtml(localized.summary)}</p>
        <div class="tag-list mb-3">
          ${app.keyElements.map((el) => `<span class="badge-soft">${escapeHtml(el)}</span>`).join('')}
        </div>
        <div class="mt-auto">${mediaCredit(media)}</div>
      </div>
    </article>
  `;
}

function buildArticleCard(article, variant = 'default') {
  const localized = getLocalized(article, state.lang);
  const cover = resolveMedia(article.coverMediaRef);
  return `
    <article class="article-card glass reveal ${variant === 'featured' ? 'featured-article' : ''} h-100 d-flex flex-column">
      <a href="./article.html?id=${article.id}" class="card-media ${cover?.kind === 'illustration' ? 'card-media-illustration' : ''}" ${mediaStyle(cover, 'card')}>
        ${(() => { const attrs = mediaImageAttrs(cover); return `<img class="${attrs.className}"${attrs.styleAttr} src="${entityImage(article, './assets/img/gallery/atlas-overview.svg')}" alt="${escapeHtml(localized.title)}">`; })()}
      </a>
      <div class="p-4 d-flex flex-column h-100">
        <div class="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
          <span class="badge-soft">${escapeHtml(article.category)}</span>
          <span class="muted small">${article.readingTime} min</span>
        </div>
        <h3 class="${variant === 'featured' ? 'h3' : 'h5'} mb-2">${escapeHtml(localized.title)}</h3>
        <p class="muted">${escapeHtml(localized.excerpt)}</p>
        <div class="mt-auto">${cardButton(t('cards.openArticle'), `./article.html?id=${article.id}`)}</div>
      </div>
    </article>
  `;
}


function buildGalleryCard(item) {
  const media = resolveMedia(item.mediaRef);
  const localized = getLocalized(media, state.lang);
  const attrs = mediaImageAttrs(media, { containForIllustration: true });
  return `
    <article class="media-card glass reveal ${item.layout || ''} ${media?.kind === 'illustration' ? 'is-illustration' : ''}">
      <div class="card-media">
        <img class="${attrs.className}"${attrs.styleAttr} src="${mediaUrl(media)}" alt="${escapeHtml(localized.alt || localized.title)}">
        ${mediaLightboxButton(media.id, t('cards.viewImage'))}
      </div>
      <div class="p-4 d-flex flex-column h-100">
        <div class="d-flex justify-content-between gap-2 align-items-center flex-wrap mb-3">
          <div class="badge-soft">${escapeHtml(item.category)}</div>
          <div class="badge-soft">${escapeHtml(media.kind)}</div>
        </div>
        <h3 class="h5 mb-2">${escapeHtml(localized.title)}</h3>
        <p class="muted mb-0">${escapeHtml(localized.caption)}</p>
        ${mediaCredit(media)}
      </div>
    </article>
  `;
}

function buildMatterCard(item) {
  return `
    <article class="matter-card glass p-4 reveal h-100">
      <div class="icon-bullet mb-3">${icon('bolt')}</div>
      <h3 class="h5 mb-2">${escapeHtml(item.title)}</h3>
      <p class="muted mb-0">${escapeHtml(item.text)}</p>
    </article>
  `;
}

function buildHero() {
  const statsHtml = state.data.config.stats.map((stat) => `
    <div class="metric-card glass">
      <strong>${escapeHtml(stat.value)}</strong>
      <span>${escapeHtml(stat.label[state.lang] || stat.label.el)}</span>
    </div>
  `).join('');

  const heroFrames = (state.data.config.heroMedia || []).slice(0, 4).map((id, index) => {
    const { media, localized } = localizedMedia(id);
    if (!media) return '';
    return `
      <article class="hero-frame glass reveal frame-${index + 1} ${media.kind === 'illustration' ? 'is-illustration' : ''}" ${mediaStyle(media, 'hero')}>
        ${(() => { const attrs = mediaImageAttrs(media); return `<img class="${attrs.className}"${attrs.styleAttr} src="${mediaUrl(media)}" alt="${escapeHtml(localized.alt || localized.title)}">`; })()}
        <div class="hero-frame-caption">
          <div class="section-kicker mb-1">${escapeHtml(media.category)}</div>
          <strong>${escapeHtml(localized.title)}</strong>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="hero-shell container-tight">
      ${issueStrip()}
      <div class="hero-card glass">
        <div class="hero-grid">
          <div class="hero-copy reveal">
            <span class="eyebrow">${escapeHtml(t('hero.eyebrow'))}</span>
            <h1 class="display-atlas mt-3">${escapeHtml(t('hero.title'))}</h1>
            <p class="lead-atlas mt-3 mb-4">${escapeHtml(t('hero.lead'))}</p>
            <div class="d-flex flex-wrap gap-3">
              <a href="${pagePath('elements')}" class="btn btn-atlas-primary">${escapeHtml(t('hero.ctaPrimary'))}</a>
              <a href="${pagePath('articles')}" class="btn btn-atlas-ghost">${escapeHtml(t('hero.ctaSecondary'))}</a>
            </div>
            <div class="metrics-grid">${statsHtml}</div>
          </div>
          <div class="hero-collage reveal">
            ${heroFrames}
          </div>
        </div>
      </div>
    </section>
  `;
}

function buildPageHero(title, lead, mediaRef = null) {
  const figure = mediaRef ? buildMediaFrame(mediaRef, { compact: true, label: escapeHtml(t('cards.archiveLabel')) }) : '';
  return `
    <section class="page-hero section-space">
      <div class="container-tight">
        <div class="page-hero-card glass reveal ${mediaRef ? 'with-media' : ''}">
          <div>
            <span class="eyebrow">${escapeHtml(t('site.title'))}</span>
            <h1 class="display-atlas mt-3 mb-3">${escapeHtml(title)}</h1>
            <p class="lead-atlas mb-0">${escapeHtml(lead)}</p>
          </div>
          ${figure}
        </div>
      </div>
    </section>
  `;
}

function wireFilter({ items, searchTerm, selectTerm }) {
  const normalizedSearch = (searchTerm || '').trim().toLowerCase();
  return items.filter((item) => {
    const localized = getLocalized(item, state.lang);
    const haystack = [
      localized?.name,
      localized?.summary,
      item.symbol,
      ...(localized?.uses || []),
      ...(item.keyElements || []),
      ...(item.tags || []),
      item.category,
      item.sector
    ].filter(Boolean).join(' ').toLowerCase();

    const searchMatch = !normalizedSearch || haystack.includes(normalizedSearch);
    const categoryMatch = !selectTerm || selectTerm === 'all' || item.category === selectTerm || item.sector === selectTerm;
    return searchMatch && categoryMatch;
  });
}

function renderHome() {
  const { config, elements, applications, articles, gallery } = state.data;
  const featuredElements = config.featuredElements.map((id) => getEntityById(elements, id)).filter(Boolean);
  const featuredApps = config.featuredApplications.map((id) => getEntityById(applications, id)).filter(Boolean);
  const featuredArticles = config.featuredArticles.map((id) => getEntityById(articles, id)).filter(Boolean);
  const featuredGallery = config.featuredGallery.map((id) => getEntityById(gallery, id)).filter(Boolean);
  const editorPick = getEntityById(articles, config.editorPickArticle) || featuredArticles[0];

  const matterCards = t('home.matterCards', { returnObjects: true });
  const timeline = t('home.timeline', { returnObjects: true });
  const architecturePoints = t('home.architecturePoints', { returnObjects: true });
  const fieldGuideIntro = t('home.fieldGuideIntro');
  const fieldGuideOutro = t('home.fieldGuideOutro');
  const mediaLedgerItems = (config.featuredMedia || []).map((id) => getMediaById(id)).filter(Boolean);

  document.getElementById('page-root').innerHTML = `
    ${buildHero()}

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          eyebrow: `${icon('quote')} ${t('sections.editorialDeskKicker')}`,
          title: t('sections.editorialDesk'),
          lead: t('sections.editorialDeskLead')
        })}
        <div class="editorial-grid">
          <div class="editorial-main">
            ${editorPick ? buildArticleCard(editorPick, 'featured') : ''}
          </div>
          <div class="editorial-side">
            ${mediaLedgerItems.slice(0, 3).map((media, index) => buildMediaFrame(media.id, { compact: true, label: index === 0 ? escapeHtml(t('cards.editorPickLabel')) : '' })).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          eyebrow: `${icon('spark')} ${t('sections.whyThisMatters')}`,
          title: t('sections.whyThisMatters'),
          lead: t('sections.whyThisMattersLead')
        })}
        <div class="row g-4">
          ${matterCards.map((item) => `<div class="col-md-4">${buildMatterCard(item)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          eyebrow: `${icon('camera')} ${t('sections.mediaLedgerKicker')}`,
          title: t('sections.mediaLedger'),
          lead: t('sections.mediaLedgerLead')
        })}
        <div class="row g-4 align-items-stretch">
          ${mediaLedgerItems.map((media, idx) => `<div class="col-md-6 ${idx === 0 ? 'col-xl-6' : 'col-xl-3'}">${buildMediaFrame(media.id, { compact: idx !== 0, label: escapeHtml(t('cards.archiveLabel')) })}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          title: t('sections.featuredElements'),
          actionHtml: cardButton(t('cards.viewAll'), pagePath('elements'))
        })}
        <div class="row g-4">
          ${featuredElements.map((item) => `<div class="col-md-6 col-xl-3">${buildElementCard(item)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          title: t('sections.featuredApplications'),
          actionHtml: cardButton(t('cards.viewAll'), pagePath('applications'))
        })}
        <div class="row g-4">
          ${featuredApps.map((item) => `<div class="col-md-6 col-xl-3">${buildApplicationCard(item)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          title: t('sections.curatedArchive'),
          lead: t('sections.curatedArchiveLead'),
          actionHtml: cardButton(t('cards.viewAll'), pagePath('gallery'))
        })}
        <div class="row g-4">
          ${featuredGallery.map((item) => `<div class="col-md-6 col-xl-3">${buildGalleryCard(item)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          title: t('sections.featuredArticles'),
          actionHtml: cardButton(t('cards.viewAll'), pagePath('articles'))
        })}
        <div class="row g-4">
          ${featuredArticles.map((item, index) => `<div class="${index === 0 ? 'col-lg-6' : 'col-md-6 col-xl-3'}">${buildArticleCard(item, index === 0 ? 'featured' : 'default')}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-space pt-0">
      <div class="container-tight">
        ${createSectionTitle({
          title: t('sections.timeline'),
          lead: t('sections.architectureLead')
        })}
        <div class="row g-4 align-items-stretch">
          <div class="col-lg-5">
            <div class="glass p-4 h-100 rounded-5 reveal">
              <div class="timeline-shell">
                ${timeline.map((item, idx) => `
                  <div class="timeline-step">
                    <div class="timeline-index">${idx + 1}</div>
                    <div class="pt-1">${escapeHtml(item)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="glass p-4 p-lg-5 rounded-5 reveal architecture-shell">
              <div class="badge-soft mb-3">${icon('layers')} ${escapeHtml(t('sections.architecture'))}</div>
              <h3 class="h4 mb-3">${escapeHtml(t('sections.architecture'))}</h3>
              <p class="muted mb-4">${escapeHtml(fieldGuideIntro)}</p>
              <ul class="list-clean mb-4">
                ${architecturePoints.map((item) => `<li><span class="icon-bullet">${icon('layers')}</span><span>${escapeHtml(item)}</span></li>`).join('')}
              </ul>
              <p class="mb-0 muted">${escapeHtml(fieldGuideOutro)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  bindGalleryLightbox(featuredGallery);
}

function renderElements() {
  const title = t('page.elementsTitle');
  const lead = t('page.elementsLead');
  document.getElementById('page-root').innerHTML = `
    ${buildPageHero(title, lead, 'editorial-atlas-overview')}
    <section class="section-space pt-0">
      <div class="container-tight">
        <div class="filter-bar reveal">
          <div class="input-shell px-3 py-2">
            <input id="elementSearch" class="form-control" placeholder="${escapeHtml(t('filters.searchPlaceholder'))}" />
          </div>
          <div class="select-shell px-2 py-2">
            <select id="elementCategory" class="form-select">
              <option value="all">${escapeHtml(t('filters.categoryAll'))}</option>
              <option value="magnet">magnet</option>
              <option value="display">display</option>
              <option value="medical">medical</option>
              <option value="catalyst">catalyst</option>
              <option value="laser">laser</option>
              <option value="alloy">alloy</option>
              <option value="niche">niche</option>
            </select>
          </div>
        </div>
        <div id="elementsGrid" class="row g-4"></div>
      </div>
    </section>
  `;

  const grid = document.getElementById('elementsGrid');
  const rerender = () => {
    const filtered = wireFilter({
      items: state.data.elements,
      searchTerm: document.getElementById('elementSearch').value,
      selectTerm: document.getElementById('elementCategory').value
    });

    grid.innerHTML = filtered.length
      ? filtered.map((item) => `<div class="col-md-6 col-xl-4">${buildElementCard(item)}</div>`).join('')
      : `<div class="col-12"><div class="empty-state glass">${escapeHtml(t('common.noMatchingElements'))}</div></div>`;

    bindDetailTriggers();
    revealAll(grid);
  };

  document.getElementById('elementSearch').addEventListener('input', rerender);
  document.getElementById('elementCategory').addEventListener('change', rerender);
  rerender();
}

function renderApplications() {
  const title = t('page.applicationsTitle');
  const lead = t('page.applicationsLead');
  document.getElementById('page-root').innerHTML = `
    ${buildPageHero(title, lead, 'editorial-supply-chain')}
    <section class="section-space pt-0">
      <div class="container-tight">
        <div class="filter-bar reveal">
          <div class="input-shell px-3 py-2">
            <input id="applicationSearch" class="form-control" placeholder="${escapeHtml(t('filters.searchPlaceholder'))}" />
          </div>
          <div class="select-shell px-2 py-2">
            <select id="applicationSector" class="form-select">
              <option value="all">${escapeHtml(t('filters.sectorAll'))}</option>
              <option value="consumer-tech">consumer-tech</option>
              <option value="mobility">mobility</option>
              <option value="energy">energy</option>
              <option value="medical">medical</option>
              <option value="industry">industry</option>
              <option value="science-defense">science-defense</option>
            </select>
          </div>
        </div>
        <div id="applicationsGrid" class="row g-4"></div>
      </div>
    </section>
  `;

  const grid = document.getElementById('applicationsGrid');
  const rerender = () => {
    const filtered = wireFilter({
      items: state.data.applications,
      searchTerm: document.getElementById('applicationSearch').value,
      selectTerm: document.getElementById('applicationSector').value
    });

    grid.innerHTML = filtered.length
      ? filtered.map((item) => `<div class="col-md-6 col-xl-4">${buildApplicationCard(item)}</div>`).join('')
      : `<div class="col-12"><div class="empty-state glass">${escapeHtml(t('common.noMatchingApplications'))}</div></div>`;

    bindDetailTriggers();
    revealAll(grid);
  };

  document.getElementById('applicationSearch').addEventListener('input', rerender);
  document.getElementById('applicationSector').addEventListener('change', rerender);
  rerender();
}

function renderGallery() {
  const title = t('page.galleryTitle');
  const lead = t('page.galleryLead');

  document.getElementById('page-root').innerHTML = `
    ${buildPageHero(title, lead, 'editorial-recycling')}
    <section class="section-space pt-0">
      <div class="container-tight">
        <div class="filter-bar reveal">
          <div class="input-shell px-3 py-2">
            <input id="gallerySearch" class="form-control" placeholder="${escapeHtml(t('filters.searchPlaceholder'))}" />
          </div>
          <div class="select-shell px-2 py-2">
            <select id="galleryCategory" class="form-select">
              <option value="all">${escapeHtml(t('filters.galleryAll'))}</option>
              <option value="material">material</option>
              <option value="application">application</option>
              <option value="industry">industry</option>
              <option value="editorial">editorial</option>
            </select>
          </div>
        </div>
        <div id="galleryGrid" class="gallery-grid"></div>
      </div>
    </section>
  `;

  const grid = document.getElementById('galleryGrid');
  const rerender = () => {
    const search = document.getElementById('gallerySearch').value.trim().toLowerCase();
    const category = document.getElementById('galleryCategory').value;

    const filtered = state.data.gallery.filter((item) => {
      const media = resolveMedia(item.mediaRef);
      const localized = getLocalized(media, state.lang);
      const haystack = `${localized.title} ${localized.caption} ${item.category} ${(media.tags || []).join(' ')}`.toLowerCase();
      const searchMatch = !search || haystack.includes(search);
      const categoryMatch = category === 'all' || item.category === category;
      return searchMatch && categoryMatch;
    });

    grid.innerHTML = filtered.length
      ? filtered.map((item) => buildGalleryCard(item)).join('')
      : `<div class="empty-state glass">${escapeHtml(t('common.noMatchingVisuals'))}</div>`;

    bindGalleryLightbox(filtered);
    revealAll(grid);
  };

  document.getElementById('gallerySearch').addEventListener('input', rerender);
  document.getElementById('galleryCategory').addEventListener('change', rerender);
  rerender();
}

function renderArticles() {
  const title = t('page.articlesTitle');
  const lead = t('page.articlesLead');
  const [leadArticle, ...rest] = state.data.articles;

  document.getElementById('page-root').innerHTML = `
    ${buildPageHero(title, lead, leadArticle?.coverMediaRef || 'editorial-atlas-overview')}
    <section class="section-space pt-0">
      <div class="container-tight article-index-grid">
        <div class="article-index-lead">
          ${leadArticle ? buildArticleCard(leadArticle, 'featured') : ''}
        </div>
        <div class="row g-4 article-index-list">
          ${rest.map((item) => `<div class="col-md-6">${buildArticleCard(item)}</div>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderSources() {
  const title = t('page.sourcesTitle');
  const lead = t('page.sourcesLead');

  document.getElementById('page-root').innerHTML = `
    ${buildPageHero(title, lead, 'editorial-supply-chain')}
    <section class="section-space pt-0">
      <div class="container-tight">
        <div class="row g-4">
          ${state.data.sources.map((source) => `<div class="col-md-6 col-xl-4">${buildSourceLink(source, t)}</div>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const article = getEntityById(state.data.articles, params.get('id'));

  if (!article) {
    document.getElementById('page-root').innerHTML = `
      ${buildPageHero(t('page.notFound'), '', 'editorial-atlas-overview')}
      <section class="section-space pt-0">
        <div class="container-tight">
          <a href="${pagePath('articles')}" class="btn btn-atlas-primary">${escapeHtml(t('page.articleBack'))}</a>
        </div>
      </section>
    `;
    return;
  }

  const localized = getLocalized(article, state.lang);
  const sourceList = article.sourceRefs.map((id) => getEntityById(state.data.sources, id)).filter(Boolean);
  const cover = resolveMedia(article.coverMediaRef);

  document.getElementById('page-root').innerHTML = `
    <section class="page-hero section-space">
      <div class="container-tight">
        <a href="${pagePath('articles')}" class="atlas-pill mb-4 d-inline-flex align-items-center gap-2">${icon('arrow')} ${escapeHtml(t('page.articleBack'))}</a>
        <div class="article-cover glass reveal ${cover?.kind === 'illustration' ? 'is-illustration' : ''}" ${mediaStyle(cover, 'cover')}>
          ${(() => { const attrs = mediaImageAttrs(cover); return `<img class="${attrs.className}"${attrs.styleAttr} src="${entityImage(article, './assets/img/gallery/atlas-overview.svg')}" alt="${escapeHtml(localized.title)}">`; })()}
        </div>
        <div class="article-layout">
          <article>
            <div class="page-hero-card glass reveal mb-4 article-header-card">
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge-soft">${escapeHtml(article.category)}</span>
                <span class="badge-soft">${article.readingTime} min</span>
                <span class="badge-soft">${escapeHtml(t('cards.archiveLabel'))}</span>
              </div>
              <div class="section-kicker mb-3">${icon('quote')} ${escapeHtml(t('cards.articleDeck'))}</div>
              <h1 class="display-atlas mb-3">${escapeHtml(localized.title)}</h1>
              <p class="lead-atlas mb-0 article-intro">${escapeHtml(localized.intro)}</p>
            </div>
            <div class="article-prose article-prose-editorial">
              ${localized.sections.map((section, index) => `
                <section class="article-section glass reveal">
                  <div class="section-kicker mb-2">${escapeHtml(t('cards.sectionLabel'))} ${index + 1}</div>
                  <h3>${escapeHtml(section.heading)}</h3>
                  <div class="article-copy">
                    <p class="mb-0">${escapeHtml(section.body)}</p>
                  </div>
                </section>
              `).join('')}
            </div>
          </article>

          <aside class="d-grid gap-3 article-aside">
            <div class="glass p-4 rounded-5 reveal">
              <div class="badge-soft mb-3">${icon('camera')} ${escapeHtml(t('cards.relatedMedia'))}</div>
              <div class="d-grid gap-3 related-media-stack">
                ${(article.mediaRefs || []).slice(0, 4).map((mediaId) => buildMediaFrame(mediaId, { compact: true })).join('')}
              </div>
            </div>
            <div class="glass p-4 rounded-5 reveal">
              <div class="badge-soft mb-3">${icon('layers')} ${escapeHtml(t('cards.references'))}</div>
              <div class="d-grid gap-3">
                ${sourceList.map((source) => `
                  <a href="${source.url}" target="_blank" rel="noreferrer" class="source-card glass p-3 d-block">
                    <div class="small text-uppercase text-body-secondary mb-2">${escapeHtml(source.publisher)}</div>
                    <strong>${escapeHtml(source.title)}</strong>
                  </a>
                `).join('')}
              </div>
            </div>
            <div class="glass p-4 rounded-5 reveal">
              <div class="badge-soft mb-3">${icon('quote')} ${escapeHtml(t('cards.articleContext'))}</div>
              <p class="mb-0 muted">${escapeHtml(localized.excerpt || t('common.apiReadyNote'))}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function firstLinkedMedia(type, id) {
  return (state.data.media || []).find((media) => (media.linkedTo?.[type] || []).includes(id));
}

function bindDetailTriggers() {
  const modalEl = document.getElementById('detailModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  document.querySelectorAll('[data-open="element"]').forEach((node) => {
    node.addEventListener('click', () => {
      const item = getEntityById(state.data.elements, node.dataset.id);
      const localized = getLocalized(item, state.lang);
      const media = firstLinkedMedia('elements', item.id);
      document.getElementById('detailBadge').innerHTML = `${escapeHtml(item.symbol)} · #${item.atomicNumber}`;
      document.getElementById('detailTitle').textContent = localized.name;
      document.getElementById('detailBody').innerHTML = `
        <div class="row g-4 align-items-start">
          <div class="col-md-5">
            ${media ? `<div class="modal-media-frame ${media.kind === 'illustration' ? 'is-illustration' : ''}">${(() => { const attrs = mediaImageAttrs(media); return `<img class="rounded-4 ${attrs.className}"${attrs.styleAttr} src="${mediaUrl(media)}" alt="${escapeHtml(getLocalized(media, state.lang).alt || getLocalized(media, state.lang).title)}">`; })()}</div>` : `<img class="rounded-4" src="./assets/img/elements/${item.id}.svg" alt="${escapeHtml(localized.name)}">`}
            ${media ? mediaCredit(media) : ''}
          </div>
          <div class="col-md-7">
            <p class="muted">${escapeHtml(localized.summary)}</p>
            <div class="badge-soft mb-3">${escapeHtml(localized.tagline)}</div>
            <h3 class="h6">${escapeHtml(t('cards.keyUses'))}</h3>
            <ul class="ps-3">
              ${localized.uses.map((use) => `<li>${escapeHtml(use)}</li>`).join('')}
            </ul>
            <div class="glass rounded-4 p-3 mt-3">
              <strong>${escapeHtml(localized.fact)}</strong>
            </div>
          </div>
        </div>
      `;
      modal.show();
    });
  });

  document.querySelectorAll('[data-open="application"]').forEach((node) => {
    node.addEventListener('click', () => {
      const item = getEntityById(state.data.applications, node.dataset.id);
      const localized = getLocalized(item, state.lang);
      const media = resolveMedia(item.mediaRef);
      document.getElementById('detailBadge').innerHTML = `${escapeHtml(item.sector)} · ${item.keyElements.join(' · ')}`;
      document.getElementById('detailTitle').textContent = localized.name;
      document.getElementById('detailBody').innerHTML = `
        <div class="row g-4 align-items-start">
          <div class="col-md-5">
            <div class="modal-media-frame ${media?.kind === 'illustration' ? 'is-illustration' : ''}">
              ${(() => { const attrs = mediaImageAttrs(media); return `<img class="rounded-4 ${attrs.className}"${attrs.styleAttr} src="${entityImage(item, `./assets/img/applications/${item.id}.svg`)}" alt="${escapeHtml(localized.name)}">`; })()}
            </div>
            ${mediaCredit(media)}
          </div>
          <div class="col-md-7">
            <p class="muted">${escapeHtml(localized.summary)}</p>
            <h3 class="h6">${escapeHtml(t('cards.whatItDoes'))}</h3>
            <p>${escapeHtml(localized.whatItDoes)}</p>
            <h3 class="h6">${escapeHtml(t('cards.howItWorks'))}</h3>
            <p class="mb-3">${escapeHtml(localized.howItWorks)}</p>
            <div class="tag-list">
              ${item.keyElements.map((el) => `<span class="badge-soft">${escapeHtml(el)}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
      modal.show();
    });
  });
}


function moveLightbox(step) {
  updateLightbox(state.lightboxIndex + step);
}

function updateLightbox(index) {
  const modalEl = document.getElementById('lightboxModal');
  const image = document.getElementById('lightboxImage');
  if (!modalEl || !image || !state.galleryItems.length) return;
  const total = state.galleryItems.length;
  state.lightboxIndex = (index + total) % total;
  const item = state.galleryItems[state.lightboxIndex];
  const media = item.media || resolveMedia(item.mediaRef);
  const localized = getLocalized(media, state.lang);
  const attrs = mediaImageAttrs(media, { containForIllustration: true });
  image.className = attrs.className;
  image.setAttribute('style', media?.objectPosition ? `object-position:${media.objectPosition}` : '');
  image.src = mediaUrl(media);
  image.alt = localized.alt || localized.title || '';
  document.getElementById('lightboxTitle').textContent = localized.title || '';
  document.getElementById('lightboxCaption').textContent = localized.caption || '';
  document.getElementById('lightboxCounter').textContent = t('cards.imageCounter', { current: state.lightboxIndex + 1, total });
  document.getElementById('lightboxCredit').innerHTML = mediaCredit(media);
}

function openLightbox(mediaId) {
  const modalEl = document.getElementById('lightboxModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const idx = state.galleryItems.findIndex((item) => item.mediaRef === mediaId || item.media?.id === mediaId);
  updateLightbox(idx >= 0 ? idx : 0);
  modal.show();
}

function bindGalleryLightbox(items = []) {
  state.galleryItems = (items || []).map((item) => {
    const media = item?.media || resolveMedia(item?.mediaRef || item?.coverMediaRef || item?.id || item);
    return {
      ...item,
      media,
      mediaRef: item?.mediaRef || media?.id || null
    };
  }).filter((item) => item.media);

  bindLightboxTriggers();

  if (!state.galleryItems.length) {
    const modalEl = document.getElementById('lightboxModal');
    const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
    modal?.hide();
  }
}

function bindLightboxTriggers() {
  document.querySelectorAll('[data-open="lightbox"]').forEach((node) => {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLightbox(node.dataset.mediaId);
    });
  });

  document.getElementById('lightboxPrev')?.addEventListener('click', () => updateLightbox(state.lightboxIndex - 1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => updateLightbox(state.lightboxIndex + 1));

  if (window.__atlasLightboxKeyHandler) {
    document.removeEventListener('keydown', window.__atlasLightboxKeyHandler);
  }
  window.__atlasLightboxKeyHandler = (event) => {
    const modalEl = document.getElementById('lightboxModal');
    if (!modalEl?.classList.contains('show')) return;
    if (event.key === 'ArrowLeft') updateLightbox(state.lightboxIndex - 1);
    if (event.key === 'ArrowRight') updateLightbox(state.lightboxIndex + 1);
  };
  document.addEventListener('keydown', window.__atlasLightboxKeyHandler);
}

function renderPage() {
  switch (currentPage()) {
    case 'elements':
      return renderElements();
    case 'applications':
      return renderApplications();
    case 'gallery':
      return renderGallery();
    case 'articles':
      return renderArticles();
    case 'article':
      return renderArticle();
    case 'sources':
      return renderSources();
    default:
      return renderHome();
  }
}

function render() {
  renderShell();
  renderPage();
  bindDetailTriggers();
  bindLightboxTriggers();
  revealAll(document);
  document.documentElement.lang = state.lang;
}

async function init() {
  state.data = await loadAppData();

  const resources = await loadTranslations();
  await window.i18next.init({
    lng: state.lang,
    fallbackLng: 'el',
    resources
  });

  render();
}

init().catch((error) => {
  console.error(error);
  document.getElementById('app').innerHTML = `
    <main class="container-tight py-5">
      <div class="glass p-5 rounded-5">
        <h1 class="h3 mb-3">Project boot error</h1>
        <p class="mb-0">${escapeHtml(error.message)}</p>
      </div>
    </main>
  `;
});
