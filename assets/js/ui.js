export function icon(name) {
  const icons = {
    atom: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="1.2" fill="currentColor"/><ellipse cx="8" cy="8" rx="6.2" ry="2.8"/><ellipse cx="8" cy="8" rx="6.2" ry="2.8" transform="rotate(60 8 8)"/><ellipse cx="8" cy="8" rx="6.2" ry="2.8" transform="rotate(120 8 8)"/></svg>`,
    arrow: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10"/><path d="M9 4l4 4-4 4"/></svg>`,
    external: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h4v4"/><path d="M7 9l6-6"/><path d="M13 9v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3"/></svg>`,
    language: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4h6"/><path d="M5.5 2v2c0 2.7-1.5 5.2-4 6.8"/><path d="M3 10c1 .6 2.2 1 3.5 1.2"/><path d="M10 3h4"/><path d="M12 2v9"/><path d="M9.5 8.5h5"/></svg>`,
    moon: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12.8 10.6A5.8 5.8 0 1 1 5.4 3.2a4.8 4.8 0 1 0 7.4 7.4z"/></svg>`,
    sun: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M3 13l1.4-1.4"/></svg>`,
    database: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><ellipse cx="8" cy="3.5" rx="5.5" ry="2.2"/><path d="M2.5 3.5v4c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2v-4"/><path d="M2.5 7.5v4c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2v-4"/></svg>`,
    bolt: `<svg class="icon-inline" viewBox="0 0 16 16" fill="currentColor"><path d="M9.3 1L3.8 8h3L5.9 15l6.3-8H9.1z"/></svg>`,
    chip: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="8" height="8" rx="1.2"/><path d="M2 5h2M2 8h2M2 11h2M12 5h2M12 8h2M12 11h2M5 2v2M8 2v2M11 2v2M5 12v2M8 12v2M11 12v2"/></svg>`,
    shield: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.8l5 1.7v3.7c0 3.2-2.1 5.6-5 7-2.9-1.4-5-3.8-5-7V3.5z"/></svg>`,
    microscope: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 2l2 2-2.2 2.2-2-2z"/><path d="M9 4l1.8 1.8"/><path d="M5 10a3 3 0 1 0 6 0"/><path d="M7.5 8v2.2M2.5 13.5h11"/></svg>`,
    layers: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 2l6 3.2L8 8.4 2 5.2z"/><path d="M2 8.2l6 3.2 6-3.2"/><path d="M2 11.2l6 3.2 6-3.2"/></svg>`,
    archive: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4.5h11v8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z"/><path d="M1.5 2.5h13v2h-13z"/><path d="M6.2 8.2h3.6"/></svg>`,
    camera: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 5h2l1-1.4h4L11 5h2a1 1 0 0 1 1 1v5.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="8" cy="8.6" r="2.3"/></svg>`,
    quote: `<svg class="icon-inline" viewBox="0 0 16 16" fill="currentColor"><path d="M6.1 3.5c-2 .7-3.2 2.4-3.2 4.5 0 1.8 1 3 2.6 3 1.5 0 2.4-1 2.4-2.3 0-1.2-.9-2.1-2-2.2.1-.8.7-1.6 1.6-2.1L6.1 3.5zm6 0c-2 .7-3.2 2.4-3.2 4.5 0 1.8 1 3 2.6 3 1.5 0 2.4-1 2.4-2.3 0-1.2-.9-2.1-2-2.2.1-.8.7-1.6 1.6-2.1l-1.4-.9z"/></svg>`,
    spark: `<svg class="icon-inline" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.1 3.4L12.5 6 9 7.1 8 10.5 6.9 7.1 3.5 6l3.4-1.1L8 1.5zm4.2 8.2l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6.6-1.9zM3.6 9.4l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/></svg>`,
    top: `<svg class="icon-inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 13V3"/><path d="M3.5 7.5 8 3l4.5 4.5"/></svg>`
  };
  return icons[name] || icons.atom;
}

export function getLocalized(entity, lang) {
  if (!entity) return null;
  if (entity.translations) {
    return entity.translations[lang] || entity.translations.el || entity.translations.en;
  }
  return entity;
}

export function pagePath(page) {
  return page === 'home' ? './index.html' : `./${page}.html`;
}

export function slugMatches(text, term) {
  return `${text || ''}`.toLowerCase().includes(`${term || ''}`.toLowerCase());
}

export function createSectionTitle({ title, lead, actionHtml = '', eyebrow = '' }) {
  return `
    <div class="section-title reveal">
      <div>
        ${eyebrow ? `<div class="section-kicker">${eyebrow}</div>` : ''}
        <h2>${title}</h2>
        ${lead ? `<p>${lead}</p>` : ''}
      </div>
      ${actionHtml}
    </div>
  `;
}

export function cardButton(label, href = '#') {
  return `<a class="btn-link-clean d-inline-flex align-items-center gap-2" href="${href}">${label}${icon('arrow')}</a>`;
}

export function escapeHtml(value) {
  return `${value ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function revealAll(root = document) {
  const targets = root.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });

  targets.forEach((node) => observer.observe(node));
}

export function buildSourceLink(source, t) {
  return `
    <a class="source-card glass d-flex flex-column p-4 reveal" href="${source.url}" target="_blank" rel="noreferrer">
      <span class="badge-soft mb-3">${escapeHtml(source.publisher)}</span>
      <h3 class="h5 mb-2">${escapeHtml(source.title)}</h3>
      <p class="muted mb-3">${(source.tags || []).join(' · ')}</p>
      <span class="mt-auto">${t('cards.openSource')} ${icon('external')}</span>
    </a>
  `;
}
