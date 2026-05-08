/**
 * RENDER ADDONS
 * =====================
 * Funções para renderizar cards de addons
 * Separado da lógica de negócio para melhor manutenção
 */

import { escapeHTML, formatNumber, renderStars } from '../utils/format.js';
import { state, isFavorite } from '../state/store.js';
import { CATEGORIES_ICONS } from '../config.js';

/**
 * Constrói HTML de um card de addon
 * @param {Object} addon - Dados do addon
 * @returns {string} HTML do card
 */
export function buildAddonCardHTML(addon) {
  if (!addon || !addon.id) {
    console.warn('⚠️ Addon inválido:', addon);
    return '';
  }

  // Escapar dados para evitar XSS
  const nome = escapeHTML(addon.nome || 'Sem nome');
  const descricao = escapeHTML(addon.descricao || 'Sem descrição disponível');
  const categoria = escapeHTML(addon.categoria || 'Geral');
  const versao = escapeHTML(addon.versao || '?');
  const addonId = escapeHTML(addon.id);
  
  const rating = addon.rating || 4;
  const downloads = (addon.downloads || 0) + (state.siteConfig.baseDownloads ? 
    Math.floor(parseInt(state.siteConfig.baseDownloads) / Math.max(state.addons.length, 1)) : 0);
  
  const isFav = isFavorite(addon.id);
  const favIcon = isFav ? '❤️' : '🤍';
  const stars = renderStars(rating);
  
  // Construir imagem com fallback
  let imgHTML = '';
  if (addon.imagens && addon.imagens.length > 0) {
    const imgSrc = escapeHTML(addon.imagens[0]);
    imgHTML = `<img class="card-image" src="${imgSrc}" alt="${nome}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-image-placeholder\\'>🧩</div>'">`;
  } else {
    imgHTML = '<div class="card-image-placeholder">🧩</div>';
  }

  return `
    <div class="addon-card reveal" data-addon-id="${addonId}">
      <div class="card-image-wrapper">
        ${imgHTML}
        <div class="card-overlay-top">
          <span class="card-category-badge">${categoria}</span>
          <button class="card-fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${addonId}', event)">${favIcon}</button>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title" title="${nome}">${nome}</h3>
        <p class="card-description">${descricao}</p>
        <div class="card-meta">
          <div class="card-stats"><span class="card-stat"><span class="icon">⬇️</span> ${formatNumber(downloads)}</span></div>
          <span class="card-version">v${versao}</span>
        </div>
        <div class="card-download-bar">
          <div class="card-rating">${stars}</div>
          <a class="card-dl-btn" onclick="event.stopPropagation(); trackDownload('${addonId}', event); window.open('${escapeHTML(addon.link)}','_blank');">⬇ Baixar</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Constrói HTML da seção de filtros
 * @param {Set<string>} categories - Conjunto de categorias
 * @returns {string} HTML dos filtros
 */
export function buildFiltersHTML(categories) {
  let html = '<button class="filter-chip active" data-cat="all" onclick="setCategory(\'all\', this)">✨ Todos</button>';
  
  categories.forEach(cat => {
    const icon = CATEGORIES_ICONS[cat] || '📦';
    const escapedCat = escapeHTML(cat);
    html += `<button class="filter-chip" data-cat="${escapedCat}" onclick="setCategory('${escapedCat}', this)">${icon} ${escapedCat}</button>`;
  });
  
  return html;
}

/**
 * Constrói HTML de estado vazio
 * @returns {string} HTML do estado vazio
 */
export function buildEmptyStateHTML() {
  return `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>Nenhum addon encontrado</h3>
      <p>Tente outros termos ou mude a categoria.</p>
    </div>
  `;
}

/**
 * Constrói HTML de resultado de busca
 * @param {number} count - Quantidade de resultados
 * @returns {string} HTML do resultado
 */
export function buildResultsCountHTML(count) {
  const plural = count !== 1 ? 's' : '';
  return `Mostrando <span>${count}</span> addon${plural}`;
}
