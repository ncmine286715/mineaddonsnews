// =========================================================
// Renderer compartilhado dos cards de Addon
// =========================================================

import { escapeHtml, formatNumber, placeholderImg } from "./utils.js"

export function renderAddonCard(a, { showCategory = true } = {}) {
  const img = a.image || placeholderImg(a.title)
  return `
    <a class="addon-card tilt" href="/addon.html?slug=${encodeURIComponent(a.slug)}" data-id="${a.id}">
      <div class="addon-card__media">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" loading="lazy" decoding="async" />
        <div class="addon-card__badges">
          <span class="badge badge-neon">v${escapeHtml(a.version)}</span>
        </div>
        ${a.premium ? `<div class="addon-card__premium"><span class="badge badge-prem">
          <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Premium</span></div>` : ""}
      </div>
      <div class="addon-card__body">
        ${showCategory ? `<span class="addon-card__category text-mono">${escapeHtml(a.category)}</span>` : ""}
        <h3 class="addon-card__title">${escapeHtml(a.title)}</h3>
        <p class="addon-card__desc">${escapeHtml(a.description)}</p>
        <div class="addon-card__meta">
          <div class="addon-card__stats">
            <span><svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              ${formatNumber(a.downloads || 0)}
            </span>
            <span><svg class="icon icon-sm" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${(a.rating || 0).toFixed(1)}
            </span>
          </div>
          <span class="text-mono" style="font-size:.7rem;">${escapeHtml(a.compat || "")}</span>
        </div>
      </div>
      <span class="tilt-shine" aria-hidden="true"></span>
    </a>
  `
}

export function renderAddonGrid(list, options) {
  if (!list.length) {
    return `<div class="empty-state"><h3>Nada por aqui ainda</h3><p>Tente outra categoria ou termo de busca.</p></div>`
  }
  return list.map((a) => renderAddonCard(a, options)).join("")
}
