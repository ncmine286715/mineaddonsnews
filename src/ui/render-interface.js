/**
 * RENDER INTERFACE
 * =====================
 * Renderiza a interface principal da aplicação
 * Responsável por montar o HTML completo na página
 */

import { state } from '../state/store.js';
import { buildAddonCardHTML, buildFiltersHTML, buildEmptyStateHTML, buildResultsCountHTML } from './render-addons.js';
import { buildCreatorsSectionHTML } from './render-creators.js';
import { normalize } from '../utils/format.js';
import { CATEGORIES_ICONS } from '../config.js';

/**
 * Renderiza a interface principal
 */
export function renderInterface() {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('❌ #app-root não encontrado no HTML');
    return;
  }

  // Construir HTML completo
  const html = buildMainHTML();
  root.innerHTML = html;

  // Renderizar addons após montar o HTML
  renderAddons();

  // Renderizar criadores
  renderCreators();

  // Configurar event listeners
  setupUIListeners();

  console.log('✅ Interface renderizada');
}

/**
 * Constrói HTML principal da aplicação
 */
function buildMainHTML() {
  return `
    <!-- NAVBAR -->
    <nav class="navbar" id="navbar">
      <div class="navbar-inner">
        <a href="#" class="nav-logo" onclick="goHome(); return false;">
          <span>🧩</span>
          <span>Mineaddonsnews</span>
        </a>
        <div class="nav-actions">
          <button id="favNavBtn" class="nav-btn" onclick="toggleFavoritesView()" title="Favoritos">
            ❤️ <span id="favCount" style="display: none;"></span>
          </button>
          <button id="searchToggleBtn" class="nav-btn" onclick="toggleMobileSearch()" title="Buscar">
            🔍
          </button>
        </div>
      </div>
    </navbar>

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-content">
        <h1 id="heroTitle">Os Melhores Addons para Minecraft</h1>
        <p id="heroSubtitle">Baixe addons de qualidade, testados e seguros. Totalmente grátis!</p>
        <button onclick="scrollToGrid()" class="hero-btn">Explorar Addons ⬇️</button>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section class="stats-section">
      <div class="stat">
        <div class="stat-icon">📦</div>
        <div class="stat-number" id="totalAddons">0</div>
        <div class="stat-label">Addons</div>
      </div>
      <div class="stat">
        <div class="stat-icon">⬇️</div>
        <div class="stat-number" id="totalDownloads">0</div>
        <div class="stat-label">Downloads</div>
      </div>
      <div class="stat">
        <div class="stat">
        <div class="stat-icon">🏷️</div>
        <div class="stat-number" id="totalCategories">0</div>
        <div class="stat-label">Categorias</div>
      </div>
    </section>

    <!-- SEARCH & FILTERS -->
    <section class="search-filters-section">
      <div class="search-container">
        <input 
          type="text" 
          id="searchInput" 
          class="search-input" 
          placeholder="Buscar addons..."
          onkeyup="handleSearch()"
        >
        <span class="search-icon">🔍</span>
      </div>

      <div id="mobileSearch" class="mobile-search" style="display: none;">
        <input 
          type="text" 
          id="searchInputMobile" 
          class="search-input" 
          placeholder="Buscar..."
          onkeyup="handleSearch()"
        >
      </div>

      <div class="sort-buttons">
        <button class="sort-btn active" data-sort="newest" onclick="setSort('newest')">🆕 Novo</button>
        <button class="sort-btn" data-sort="popular" onclick="setSort('popular')">🔥 Popular</button>
        <button class="sort-btn" data-sort="name" onclick="setSort('name')">A-Z Nome</button>
        <button class="sort-btn" data-sort="rating" onclick="setSort('rating')">⭐ Rating</button>
      </div>

      <div id="filtersContainer" class="filters-container"></div>
    </section>

    <!-- RESULTS COUNT -->
    <section class="results-count-section">
      <p id="resultsCount">Mostrando <span>0</span> addons</p>
    </section>

    <!-- ADDONS GRID -->
    <section class="addons-section">
      <div id="addonsGrid" class="addons-grid"></div>
    </section>

    <!-- CREATORS SECTION -->
    <section class="creators-section" id="creatorsSection" style="display: none;">
      <h2>👥 Criadores em Destaque</h2>
      <div id="creatorsGrid" class="creators-grid"></div>
    </section>

    <!-- DETAIL OVERLAY -->
    <div id="detailOverlay" class="detail-overlay">
      <div id="detailPage" class="detail-page"></div>
    </div>

    <!-- CREATOR PAGE OVERLAY -->
    <div id="creatorOverlay" class="creator-overlay">
      <div id="creatorPage" class="creator-page"></div>
    </div>

    <!-- TOAST CONTAINER -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- SCROLL TO TOP BUTTON -->
    <button id="scrollTopBtn" class="scroll-top-btn" onclick="scrollToTop()">⬆️</button>

    <!-- PARTICLES CANVAS -->
    <canvas id="particles"></canvas>

    <!-- BLOCK RAIN CONTAINER -->
    <div id="blockRain" class="block-rain-container"></div>
  `;
}

/**
 * Renderiza os addons no grid
 */
function renderAddons() {
  const grid = document.getElementById('addonsGrid');
  if (!grid) return;

  const searchQuery = normalize(document.getElementById('searchInput')?.value || '');
  let filtered = state.addons;

  // Filtrar por categoria
  if (state.currentCategory !== 'all') {
    filtered = filtered.filter(a => a.categoria === state.currentCategory);
  }

  // Filtrar por busca
  if (searchQuery) {
    filtered = filtered.filter(a => {
      const searchableText = normalize([
        a.nome || '',
        a.descricao || '',
        a.categoria || '',
        a.versao || ''
      ].join(' '));
      const tokens = searchQuery.split(/\s+/).filter(Boolean);
      return tokens.every(token => searchableText.includes(token));
    });
  }

  // Filtrar por favoritos
  if (state.showFavoritesOnly) {
    filtered = filtered.filter(a => state.favorites.includes(a.id));
  }

  // Ordenar
  switch (state.currentSort) {
    case 'popular':
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      break;
    case 'name':
      filtered.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // Atualizar contador
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.innerHTML = buildResultsCountHTML(filtered.length);
  }

  // Renderizar cards
  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = buildEmptyStateHTML();
    return;
  }

  filtered.forEach((addon, index) => {
    const cardHTML = buildAddonCardHTML(addon);
    const card = document.createElement('div');
    card.innerHTML = cardHTML;
    card.style.transitionDelay = `${index * 0.04}s`;
    
    // Adicionar listener para abrir detalhes
    card.querySelector('.addon-card')?.addEventListener('click', () => {
      openDetail(addon);
    });

    grid.appendChild(card);
  });
}

/**
 * Renderiza a seção de criadores
 */
function renderCreators() {
  const section = document.getElementById('creatorsSection');
  const container = document.getElementById('creatorsGrid');

  if (!state.creators || state.creators.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = 'block';
  if (container) {
    container.innerHTML = buildCreatorsSectionHTML();
  }
}

/**
 * Configura listeners de UI
 */
function setupUIListeners() {
  // Atualizar filtros
  const categories = new Set();
  state.addons.forEach(addon => {
    if (addon.categoria) categories.add(addon.categoria);
  });

  const filtersContainer = document.getElementById('filtersContainer');
  if (filtersContainer) {
    filtersContainer.innerHTML = buildFiltersHTML(categories);
  }

  // Scroll to top button
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
      btn.classList.toggle('visible', window.scrollY > 600);
    }
  });

  // Atualizar estatísticas
  updateStats();
}

/**
 * Atualiza estatísticas
 */
function updateStats() {
  const cats = new Set();
  let totalDl = 0;

  state.addons.forEach(addon => {
    if (addon.categoria) cats.add(addon.categoria);
    totalDl += (addon.downloads || 0);
  });

  if (state.siteConfig?.baseDownloads) {
    totalDl += parseInt(state.siteConfig.baseDownloads);
  }

  animateCounter('totalAddons', state.addons.length);
  animateCounter('totalDownloads', totalDl);
  animateCounter('totalCategories', cats.size);
}

/**
 * Anima contador de números
 */
function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current.toLocaleString('pt-BR');
  }, 30);
}

/**
 * Exportar funções globais para HTML
 */
window.renderAddons = renderAddons;
window.renderInterface = renderInterface;
window.updateStats = updateStats;
