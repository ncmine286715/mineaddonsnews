// =============================================
// MINEADDONSNEWS - JAVASCRIPT PREMIUM v3
// Ultra-otimizado com animacoes e cache
// =============================================

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAKcFlRmCjuQ35hiGnlDmOPO1P4VdjGZqw",
  authDomain: "mineaddonsnews-web.firebaseapp.com",
  databaseURL: "https://mineaddonsnews-web-default-rtdb.firebaseio.com",
  projectId: "mineaddonsnews-web",
  storageBucket: "mineaddonsnews-web.firebasestorage.app",
  messagingSenderId: "877653857210",
  appId: "1:877653857210:web:13cbd8a9d58d611600c383"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Estado Global
let allAddons = [];
let allCreators = [];
let currentCategory = 'all';
let currentSort = 'newest';
let favorites = [];
let showFavsOnly = false;
let siteConfig = {};
let searchTimer = null;

// Cache Keys
const CACHE_KEYS = {
  ADDONS: 'mineaddons_cache_addons_v3',
  CREATORS: 'mineaddons_cache_creators_v3',
  CONFIG: 'mineaddons_cache_config_v3',
  FAVORITES: 'mineaddons_favs_v3',
  TIMESTAMP: 'mineaddons_cache_time_v3'
};

// Cache duration (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

// 3 Addons padrao do NCMine (usados se Firebase estiver vazio)
const DEFAULT_ADDONS = [
  {
    id: 'addon_ncmine_furniture',
    nome: 'Furniture Addon',
    descricao: 'Adicione moveis incriveis ao seu Minecraft! Sofas, mesas, cadeiras, TVs e muito mais para decorar sua casa.',
    descricaoCompleta: 'O Furniture Addon adiciona dezenas de moveis ao seu Minecraft Bedrock. Decore sua casa com sofas, mesas, cadeiras, TVs, geladeiras, fogoes e muito mais! Todos os moveis sao funcionais e tem animacoes. Perfeito para construcoes modernas ou rusticas.',
    categoria: 'Addons do NCMine',
    autor: 'NCMine',
    versao: '1.21',
    downloads: 15420,
    timestamp: Date.now() - 86400000,
    link: 'https://linkvertise.com/furniture-addon',
    imagens: [
      'https://i.imgur.com/8KqxQ8L.png',
      'https://i.imgur.com/Y2vX3nR.png'
    ]
  },
  {
    id: 'addon_ncmine_vehicles',
    nome: 'Vehicles Addon',
    descricao: 'Carros, motos, avioes e barcos! Explore seu mundo de um jeito totalmente novo e emocionante.',
    descricaoCompleta: 'O Vehicles Addon traz uma colecao incrivel de veiculos para seu Minecraft. Inclui carros esportivos, motos, caminhoes, avioes, helicopteros e barcos. Todos os veiculos sao dirigiveis e tem animacoes realistas!',
    categoria: 'Addons do NCMine',
    autor: 'NCMine',
    versao: '1.21',
    downloads: 23150,
    timestamp: Date.now() - 172800000,
    link: 'https://linkvertise.com/vehicles-addon',
    imagens: [
      'https://i.imgur.com/nR5vX3x.png',
      'https://i.imgur.com/kL9mN2p.png'
    ]
  },
  {
    id: 'addon_ncmine_weapons',
    nome: 'Weapons Plus',
    descricao: 'Espadas lendarias, arcos magicos e armas de fogo! Enfrente seus inimigos com estilo e poder.',
    descricaoCompleta: 'Weapons Plus adiciona mais de 50 novas armas ao Minecraft. Espadas lendarias com poderes especiais, arcos magicos, lancas, machados de batalha e ate armas de fogo! Cada arma tem habilidades unicas e efeitos visuais incriveis.',
    categoria: 'Addons do NCMine',
    autor: 'NCMine',
    versao: '1.21',
    downloads: 31280,
    timestamp: Date.now(),
    link: 'https://linkvertise.com/weapons-plus',
    imagens: [
      'https://i.imgur.com/pQ7wE4r.png',
      'https://i.imgur.com/jH5tY8u.png'
    ]
  }
];

// =============================================
// CACHE HELPERS
// =============================================
function getCache(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* localStorage cheio - ignora */ }
}

function isCacheValid() {
  const timestamp = getCache(CACHE_KEYS.TIMESTAMP);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
}

// =============================================
// LOADING
// =============================================
function hideLoading() {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('done');
    }
  }, 1200);
}

// =============================================
// DATA LOADING (Firebase com Cache Inteligente)
// =============================================
async function loadAllData() {
  // Carregar favoritos do localStorage
  favorites = getCache(CACHE_KEYS.FAVORITES) || [];
  updateFavCount();

  // Verificar cache valido
  if (isCacheValid()) {
    allAddons = getCache(CACHE_KEYS.ADDONS) || [];
    allCreators = getCache(CACHE_KEYS.CREATORS) || [];
    siteConfig = getCache(CACHE_KEYS.CONFIG) || {};
    
    if (allAddons.length > 0) {
      processData();
      hideLoading();
      // Atualizar em background silenciosamente
      fetchFromFirebase(true);
      return;
    }
  }

  // Buscar do Firebase
  await fetchFromFirebase(false);
  hideLoading();
}

async function fetchFromFirebase(background = false) {
  try {
    // Buscar tudo em paralelo para maior velocidade
    const [addonsSnap, creatorsSnap, configSnap] = await Promise.all([
      db.ref('addons').once('value'),
      db.ref('creators').once('value'),
      db.ref('siteConfig').once('value')
    ]);

    // Processar addons
    if (addonsSnap.exists()) {
      const fbAddons = addonsSnap.val();
      if (Array.isArray(fbAddons)) {
        allAddons = fbAddons.filter(Boolean);
      } else if (fbAddons && typeof fbAddons === 'object') {
        allAddons = Object.keys(fbAddons).map(key => ({
          id: key,
          ...fbAddons[key]
        })).filter(Boolean);
      } else {
        allAddons = [];
      }
    }

    // Se nao tem addons no Firebase, usar os 3 default do NCMine
    if (allAddons.length === 0) {
      allAddons = [...DEFAULT_ADDONS];
    }

    // Processar creators (exceto NCMine que tem secao propria)
    if (creatorsSnap.exists()) {
      const fbCreators = creatorsSnap.val() || [];
      const creatorsArray = Array.isArray(fbCreators) ? fbCreators : Object.values(fbCreators);
      allCreators = creatorsArray.filter(c => 
        c && c.slug !== 'ncmine' && c.nome?.toLowerCase() !== 'ncmine'
      );
    } else {
      allCreators = [];
    }

    // Processar config
    if (configSnap.exists()) {
      siteConfig = configSnap.val() || {};
      applySiteConfig();
    }

    // Salvar cache
    setCache(CACHE_KEYS.ADDONS, allAddons);
    setCache(CACHE_KEYS.CREATORS, allCreators);
    setCache(CACHE_KEYS.CONFIG, siteConfig);
    setCache(CACHE_KEYS.TIMESTAMP, Date.now());

    if (!background) {
      processData();
    } else {
      // Background update - apenas re-render
      renderAddons();
      renderCreators();
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    // Fallback para cache ou default
    allAddons = getCache(CACHE_KEYS.ADDONS) || [...DEFAULT_ADDONS];
    allCreators = getCache(CACHE_KEYS.CREATORS) || [];
    siteConfig = getCache(CACHE_KEYS.CONFIG) || {};
    processData();
  }
}

function applySiteConfig() {
  if (siteConfig.siteName) {
    const siteNameEl = document.getElementById('siteNameDisplay');
    const footerNameEl = document.getElementById('footerSiteName');
    if (siteNameEl) siteNameEl.textContent = siteConfig.siteName;
    if (footerNameEl) footerNameEl.textContent = siteConfig.siteName;
    document.title = siteConfig.siteName + ' - Os Melhores Addons para Minecraft';
  }
  if (siteConfig.heroTitle) {
    const heroTitleEl = document.getElementById('heroTitle');
    if (heroTitleEl) heroTitleEl.innerHTML = siteConfig.heroTitle;
  }
  if (siteConfig.heroSubtitle) {
    const heroSubtitleEl = document.getElementById('heroSubtitle');
    if (heroSubtitleEl) heroSubtitleEl.textContent = siteConfig.heroSubtitle;
  }
  if (siteConfig.footerText) {
    const footerTextEl = document.getElementById('footerText');
    if (footerTextEl) footerTextEl.textContent = siteConfig.footerText;
  }
}

function processData() {
  // Stats
  const cats = new Set();
  let totalDl = 0;
  
  allAddons.forEach(addon => {
    if (addon.categoria) cats.add(addon.categoria);
    totalDl += (addon.downloads || 0);
  });
  
  if (siteConfig.baseDownloads) {
    totalDl += parseInt(siteConfig.baseDownloads) || 0;
  }

  // Atualizar stats com animacao
  animateNumber('totalAddons', allAddons.length);
  animateNumber('totalDownloads', totalDl, true);
  animateNumber('totalCategories', cats.size);

  // Construir filtros
  buildFilters(cats);
  
  // Renderizar addons
  renderAddons();
  
  // Renderizar outros criadores
  renderCreators();
  
  // Verificar rota
  handleRoute();
  
  // Iniciar Intersection Observer para scroll reveal
  initScrollReveal();
}

// Animacao de numeros suave
function animateNumber(id, target, format = false) {
  const el = document.getElementById(id);
  if (!el) return;
  
  const duration = 1200;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    const current = Math.floor(start + (target - start) * eased);
    
    el.textContent = format ? formatNumber(current) : current.toLocaleString('pt-BR');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// =============================================
// SCROLL REVEAL (Intersection Observer) - Premium Cinematico
// =============================================
let scrollRevealObserver = null;
let parallaxElements = [];

function initScrollReveal() {
  // Limpar observer anterior se existir
  if (scrollRevealObserver) {
    scrollRevealObserver.disconnect();
  }

  // Observer para cards com efeito de camera zoom
  scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Delay escalonado para efeito cascata
        const delay = index * 80;
        setTimeout(() => {
          entry.target.classList.add('in-view');
          entry.target.classList.remove('reveal-hidden');
          entry.target.classList.add('reveal-visible');
        }, delay);
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.15, 
    rootMargin: '0px 0px -50px 0px' 
  });

  // Observar todos os cards
  document.querySelectorAll('.addon-card').forEach(card => {
    card.classList.add('reveal-hidden');
    scrollRevealObserver.observe(card);
  });

  // Iniciar parallax no scroll
  initParallaxScroll();
}

// =============================================
// PARALLAX SCROLL - Efeito Cinematico
// =============================================
function initParallaxScroll() {
  // Coletar elementos com parallax
  parallaxElements = document.querySelectorAll('[data-parallax-speed]');
  
  if (parallaxElements.length === 0) return;

  // Desabilitar em mobile para performance
  if (window.innerWidth < 768) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.1;
      const yPos = -(scrollY * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });

    // Parallax layers no hero
    const layer1 = document.querySelector('.parallax-layer-1');
    const layer2 = document.querySelector('.parallax-layer-2');
    const layer3 = document.querySelector('.parallax-layer-3');
    
    if (layer1) {
      layer1.style.transform = `translateX(-50%) translateY(${scrollY * 0.15}px)`;
    }
    if (layer2) {
      layer2.style.transform = `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)`;
    }
    if (layer3) {
      layer3.style.transform = `translateY(${-scrollY * 0.08}px)`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

// =============================================
// CONTADOR ANIMADO COM EFEITO PREMIUM
// =============================================
function animateCounterOnView() {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stat = entry.target;
        const numberEl = stat.querySelector('.stat-number');
        if (numberEl && !stat.classList.contains('counted')) {
          stat.classList.add('counted');
          // Adiciona efeito de escala
          stat.style.transform = 'scale(1.05)';
          setTimeout(() => {
            stat.style.transform = 'scale(1)';
          }, 300);
        }
        statsObserver.unobserve(stat);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter-animate]').forEach(stat => {
    statsObserver.observe(stat);
  });
}

// =============================================
// EFEITO HOVER 3D NOS CARDS
// =============================================
function init3DCardEffect() {
  // Desabilitar em touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.addon-card:hover');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target.classList && e.target.classList.contains('addon-card')) {
      e.target.style.transform = '';
    }
  }, true);
}

// =============================================
// FILTERS
// =============================================
function buildFilters(cats) {
  const container = document.getElementById('filtersContainer');
  if (!container) return;
  
  const icons = {
    'Mobs': '&#x1F409;', 'Skin': '&#x1F464;', 'Armas': '&#x2694;&#xFE0F;', 'Mapa': '&#x1F5FA;&#xFE0F;',
    'Decoracao': '&#x1F3E0;', 'Veiculos': '&#x1F697;', 'Tecnologia': '&#x2699;&#xFE0F;',
    'Biomas': '&#x1F332;', 'RPG': '&#x1F3AE;', 'Comida': '&#x1F356;', 'Blocos': '&#x1F9F1;',
    'Ferramentas': '&#x1F527;', 'Magia': '&#x2728;', 'Addons do NCMine': '&#x1F451;',
    'NCMine': '&#x1F451;'
  };

  let html = '<button class="filter-chip active" data-cat="all" onclick="setCategory(\'all\', this)">&#x2728; Todos</button>';
  
  // NCMine primeiro (destaque dourado)
  html += '<button class="filter-chip" data-cat="Addons do NCMine" onclick="setCategory(\'Addons do NCMine\', this)">&#x1F451; NCMine</button>';
  
  cats.forEach(cat => {
    if (cat === 'Addons do NCMine' || cat === 'NCMine') return;
    const icon = icons[cat] || '&#x1F4E6;';
    html += `<button class="filter-chip" data-cat="${cat}" onclick="setCategory('${cat}', this)">${icon} ${cat}</button>`;
  });
  
  container.innerHTML = html;
}

function setCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAddons();
  
  // Scroll suave ate a grid
  setTimeout(() => {
    const addonsSection = document.getElementById('addons');
    if (addonsSection) {
      addonsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

function setSort(sort) {
  currentSort = sort;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.sort-btn[data-sort="${sort}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  renderAddons();
}

// =============================================
// SEARCH
// =============================================
function normalize(str) {
  if (!str) return '';
  return str.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').trim();
}

function matchesSearch(addon, query) {
  if (!query) return true;
  const searchText = normalize([
    addon.nome || '',
    addon.descricao || '',
    addon.categoria || '',
    addon.autor || ''
  ].join(' '));
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.every(token => searchText.includes(token));
}

// Event listeners para busca
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function() {
    const mobile = document.getElementById('searchInputMobile');
    if (mobile) mobile.value = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderAddons, 200);
  });
}

const searchInputMobile = document.getElementById('searchInputMobile');
if (searchInputMobile) {
  searchInputMobile.addEventListener('input', function() {
    const desktop = document.getElementById('searchInput');
    if (desktop) desktop.value = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderAddons, 200);
  });
}

function toggleMobileSearch() {
  const el = document.getElementById('mobileSearch');
  if (!el) return;
  el.classList.toggle('show');
  if (el.classList.contains('show')) {
    const input = document.getElementById('searchInputMobile');
    if (input) input.focus();
  }
}

// =============================================
// FAVORITES
// =============================================
function isFavorite(id) {
  return favorites.includes(id);
}

function toggleFavorite(id, event) {
  if (event) event.stopPropagation();
  
  if (isFavorite(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast('Removido dos favoritos');
  } else {
    favorites.push(id);
    showToast('Adicionado aos favoritos!');
  }
  
  setCache(CACHE_KEYS.FAVORITES, favorites);
  updateFavCount();
  renderAddons();
}

function updateFavCount() {
  const el = document.getElementById('favCount');
  if (!el) return;
  
  if (favorites.length > 0) {
    el.style.display = 'flex';
    el.textContent = favorites.length;
  } else {
    el.style.display = 'none';
  }
}

function toggleFavoritesView() {
  showFavsOnly = !showFavsOnly;
  const btn = document.getElementById('favNavBtn');
  if (btn) {
    if (showFavsOnly) {
      btn.style.background = 'var(--red)';
      btn.style.color = '#fff';
      btn.style.borderColor = 'var(--red)';
      showToast('Mostrando favoritos');
    } else {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  }
  renderAddons();
}

// =============================================
// RENDER ADDONS
// =============================================
function renderAddons() {
  const grid = document.getElementById('addonsGrid');
  if (!grid) return;
  
  const searchInput = document.getElementById('searchInput');
  const query = normalize(searchInput ? searchInput.value : '');
  
  let filtered = [...allAddons];
  
  // Filtrar por categoria
  if (currentCategory === 'Addons do NCMine' || currentCategory === 'NCMine') {
    filtered = filtered.filter(a =>
      (a.autor && a.autor.toLowerCase().includes('ncmine')) ||
      (a.nome && a.nome.toLowerCase().includes('ncmine')) ||
      a.categoria === 'NCMine' ||
      a.categoria === 'Addons do NCMine'
    );
  } else if (currentCategory !== 'all') {
    filtered = filtered.filter(a => a.categoria === currentCategory);
  }
  
  // Filtrar por busca
  if (query) {
    filtered = filtered.filter(a => matchesSearch(a, query));
  }
  
  // Filtrar favoritos
  if (showFavsOnly) {
    filtered = filtered.filter(a => isFavorite(a.id));
  }
  
  // Ordenar
  switch (currentSort) {
    case 'popular':
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      break;
    case 'name':
      filtered.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
      break;
    default:
      filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }
  
  // Atualizar contagem
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.innerHTML = `Mostrando <span>${filtered.length}</span> addon${filtered.length !== 1 ? 's' : ''}`;
  }
  
  // Renderizar
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#x1F50D;</div>
        <h3>Nenhum addon encontrado</h3>
        <p>Tente outros termos ou mude a categoria.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map((addon, index) => {
    const isNcmine = (addon.autor && addon.autor.toLowerCase().includes('ncmine')) ||
                     (addon.nome && addon.nome.toLowerCase().includes('ncmine')) ||
                     addon.categoria === 'NCMine' || addon.categoria === 'Addons do NCMine';
    
    const imgHTML = addon.imagens && addon.imagens.length > 0
      ? `<img class="card-image" src="${addon.imagens[0]}" alt="${addon.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-image-placeholder\\'>&#x1F9E9;</div>'">`
      : '<div class="card-image-placeholder">&#x1F9E9;</div>';
    
    const downloads = addon.downloads || 0;
    const favActive = isFavorite(addon.id) ? 'active' : '';
    const favIcon = isFavorite(addon.id) ? '&#x2764;&#xFE0F;' : '&#x1F90D;';
    
    // Badges de escassez e trending (Dopamine Loop)
    const badges = [];
    const daysSinceCreation = addon.timestamp ? Math.floor((Date.now() - addon.timestamp) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceCreation <= 7) {
      badges.push('<span class="scarcity-badge badge-new">NOVO</span>');
    }
    if (downloads > 10000) {
      badges.push('<span class="scarcity-badge badge-trending">TRENDING</span>');
    } else if (downloads > 5000) {
      badges.push('<span class="scarcity-badge badge-popular">POPULAR</span>');
    }
    if (isNcmine) {
      badges.push('<span class="scarcity-badge badge-exclusive">EXCLUSIVO</span>');
    }
    if (index < 3 && currentSort === 'newest') {
      badges.push('<span class="scarcity-badge badge-hot">HOT</span>');
    }
    
    const badgesHTML = badges.length > 0 ? `<div class="scarcity-badges">${badges.slice(0, 2).join('')}</div>` : '';
    
    // Social proof - contagem animada
    const socialProof = downloads > 1000 
      ? `<span class="social-proof" data-count="${downloads}"><span class="social-icon">&#x1F465;</span> ${formatNumber(downloads)} pessoas baixaram</span>` 
      : '';
    
    return `
      <div class="addon-card ${isNcmine ? 'ncmine-card' : ''}" onclick="openDetail('${addon.id}')" style="animation-delay: ${index * 0.06}s" data-parallax="card">
        ${badgesHTML}
        <div class="card-image-wrapper">
          ${imgHTML}
          <div class="card-overlay">
            <span class="card-badge">${addon.categoria || 'Geral'}</span>
            <button class="card-fav-btn ${favActive}" onclick="toggleFavorite('${addon.id}', event)">${favIcon}</button>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${addon.nome}">${addon.nome}</h3>
          <p class="card-description">${addon.descricao || 'Sem descricao disponivel.'}</p>
          ${socialProof}
          <div class="card-meta">
            <div class="card-stats">
              <span class="download-counter" data-target="${downloads}">&#x2B07;&#xFE0F; ${formatNumber(downloads)}</span>
            </div>
            <span class="card-version">v${addon.versao || '?'}</span>
          </div>
          <button class="card-download-btn" onclick="event.stopPropagation(); trackDownload('${addon.id}'); window.open('${addon.link}', '_blank');">
            &#x2B07;&#xFE0F; Baixar Gratis
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Reiniciar scroll reveal para novos cards
  initScrollReveal();
}

// =============================================
// RENDER CREATORS (Outros - embaixo)
// =============================================
function renderCreators() {
  const section = document.getElementById('creatorsSection');
  const grid = document.getElementById('creatorsGrid');
  if (!section || !grid) return;
  
  // Filtrar NCMine (ele tem secao propria em cima)
  const otherCreators = allCreators.filter(c => 
    c && c.slug !== 'ncmine' && c.nome?.toLowerCase() !== 'ncmine'
  );
  
  if (!otherCreators || otherCreators.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  grid.innerHTML = otherCreators.map(cr => {
    const verified = cr.verificado ? '<span class="verified-badge">&#10003;</span>' : '';
    const img = cr.foto 
      ? `<img class="creator-card-img" src="${cr.foto}" alt="${cr.nome}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2260%22>&#x1F464;</text></svg>'">`
      : '<div class="creator-card-img" style="display:flex;align-items:center;justify-content:center;font-size:2rem;">&#x1F464;</div>';
    
    return `
      <div class="creator-card" onclick="openCreatorPage('${cr.slug}')">
        ${img}
        <div class="creator-card-name">${cr.nome} ${verified}</div>
        <div class="creator-card-desc">${cr.descricao ? cr.descricao.substring(0, 60) + '...' : 'Criador de addons'}</div>
      </div>
    `;
  }).join('');
}

// =============================================
// DETAIL PAGE
// =============================================
function openDetail(addonId) {
  const addon = allAddons.find(a => a.id === addonId);
  if (!addon) return;
  
  const overlay = document.getElementById('detailOverlay');
  const page = document.getElementById('detailPage');
  if (!overlay || !page) return;
  
  // Gallery
  let galleryHTML = '';
  let thumbsHTML = '';
  if (addon.imagens && addon.imagens.length > 0) {
    galleryHTML = `<img class="gallery-main" id="galleryMain" src="${addon.imagens[0]}" alt="${addon.nome}" onerror="this.style.display='none'">`;
    if (addon.imagens.length > 1) {
      thumbsHTML = `<div class="gallery-thumbs">${addon.imagens.map((img, i) => 
        `<img class="gallery-thumb ${i === 0 ? 'active' : ''}" src="${img}" onclick="changeGalleryImage('${img}', this)" onerror="this.style.display='none'">`
      ).join('')}</div>`;
    }
  } else {
    galleryHTML = '<div class="gallery-main" style="display:flex;align-items:center;justify-content:center;font-size:8rem;background:linear-gradient(135deg,#0a1f12,#152f1f);">&#x1F9E9;</div>';
  }
  
  // Instructions
  const defaultSteps = [
    'Clique em "Baixar Addon" acima',
    'Abra o arquivo .mcaddon/.mcpack baixado',
    'O Minecraft importara automaticamente',
    'Ative o addon nas configuracoes do mundo'
  ];
  const steps = addon.instrucoes ? addon.instrucoes.split('\n').filter(Boolean) : defaultSteps;
  
  page.innerHTML = `
    <button class="detail-close" onclick="closeDetail()">&#x2715;</button>
    
    <div class="detail-gallery">
      ${galleryHTML}
      ${thumbsHTML}
    </div>
    
    <div class="detail-header">
      <h1 class="detail-title">${addon.nome}</h1>
      <div class="detail-meta">
        <span class="meta-tag">&#x1F4E6; ${addon.categoria || 'Geral'}</span>
        <span class="meta-tag">&#x1F4F1; v${addon.versao || '?'}</span>
        <span class="meta-tag" id="detailDownloads">&#x2B07;&#xFE0F; ${formatNumber(addon.downloads || 0)} downloads</span>
      </div>
    </div>
    
    <div class="detail-actions">
      <a href="${addon.link}" target="_blank" class="dl-btn-big" onclick="trackDownload('${addon.id}')">
        <span>&#x2B07;&#xFE0F; BAIXAR AGORA - GRATIS</span>
        <span class="dl-btn-subtext">Sem cadastro necessario - Download imediato</span>
      </a>
      <div class="action-btn-group">
        <button class="action-btn" onclick="shareAddon('${addon.id}', '${(addon.nome || '').replace(/'/g, "\\'")}')">&#x1F4E4; Compartilhar</button>
        <button class="action-btn" onclick="copyLink('${addon.link}')">&#x1F4CB; Copiar Link</button>
        <button class="action-btn" onclick="toggleFavorite('${addon.id}')">${isFavorite(addon.id) ? '&#x2764;&#xFE0F; Favoritado' : '&#x1F90D; Favoritar'}</button>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>&#x1F4D6; Sobre este addon</h3>
      <p>${(addon.descricaoCompleta || addon.descricao || 'Sem descricao disponivel.').replace(/\n/g, '<br>')}</p>
    </div>
    
    <div class="detail-section">
      <h3>&#x1F4CC; Como instalar</h3>
      <div class="install-steps">
        ${steps.map((step, i) => `
          <div class="install-step">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${step}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  window.location.hash = '#/addon/' + addon.id;
  overlay.scrollTop = 0;
}

function closeDetail() {
  const overlay = document.getElementById('detailOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
  document.body.style.overflow = '';
  history.pushState(null, null, window.location.pathname);
}

function changeGalleryImage(src, thumb) {
  const main = document.getElementById('galleryMain');
  if (main) main.src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  if (thumb) thumb.classList.add('active');
}

// =============================================
// CREATOR PAGE (para outros criadores)
// =============================================
function openCreatorPage(slug) {
  // Se for NCMine, apenas filtra pela categoria
  if (slug === 'ncmine') {
    const ncmineChip = document.querySelector('.filter-chip[data-cat="Addons do NCMine"]');
    setCategory('Addons do NCMine', ncmineChip);
    return;
  }
  
  const creator = allCreators.find(c => c.slug === slug);
  if (!creator) return goHome();
  
  const overlay = document.getElementById('creatorOverlay');
  const page = document.getElementById('creatorPage');
  if (!overlay || !page) return;
  
  const creatorAddons = allAddons.filter(a => 
    (a.autor && a.autor.toLowerCase().includes(creator.nome.toLowerCase())) ||
    (creator.addons && creator.addons.includes(a.id))
  );
  
  // Social links
  let socialHTML = '';
  if (creator.links) {
    if (creator.links.youtube) socialHTML += `<a href="${creator.links.youtube}" target="_blank" class="social-btn yt">&#x25B6; YouTube</a>`;
    if (creator.links.twitter) socialHTML += `<a href="${creator.links.twitter}" target="_blank" class="social-btn tw">&#x1D54F; Twitter</a>`;
    if (creator.links.discord) socialHTML += `<a href="${creator.links.discord}" target="_blank" class="social-btn dc">&#x1F47E; Discord</a>`;
    if (creator.links.website) socialHTML += `<a href="${creator.links.website}" target="_blank" class="social-btn web">&#x1F310; Site</a>`;
  }
  
  // Addons list
  const addonsHTML = creatorAddons.length > 0 
    ? creatorAddons.map(a => `
        <div class="creator-addon-item" onclick="openDetailFromCreator('${a.id}')">
          <img class="creator-addon-img" src="${a.imagens && a.imagens[0] ? a.imagens[0] : ''}" onerror="this.style.display='none'">
          <div class="creator-addon-info">
            <h4>${a.nome}</h4>
            <p>${a.categoria || 'Geral'}</p>
          </div>
        </div>
      `).join('')
    : '<p style="text-align:center;color:var(--text-muted);">Nenhum addon encontrado.</p>';
  
  page.innerHTML = `
    <button class="detail-close" onclick="closeCreatorPage()">&#x2715;</button>
    
    <div class="creator-profile">
      <div class="creator-avatar">
        <img src="${creator.foto || ''}" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:3rem;\\'>&#x1F464;</div>'">
      </div>
      <h1 class="creator-name">${creator.nome} ${creator.verificado ? '<span class="verified-badge">&#10003;</span>' : ''}</h1>
      <p class="creator-bio">${creator.descricao || 'Criador de conteudo de Minecraft.'}</p>
      ${socialHTML ? `<div class="creator-social">${socialHTML}</div>` : ''}
    </div>
    
    <div class="creator-addons">
      <h3>Addons de ${creator.nome}</h3>
      ${addonsHTML}
    </div>
  `;
  
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  window.location.hash = '#/criador/' + slug;
  overlay.scrollTop = 0;
}

function closeCreatorPage() {
  const overlay = document.getElementById('creatorOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
  document.body.style.overflow = '';
  history.pushState(null, null, window.location.pathname);
}

function openDetailFromCreator(id) {
  closeCreatorPage();
  setTimeout(() => openDetail(id), 250);
}

// =============================================
// ROUTING
// =============================================
function handleRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/addon/')) {
    const id = hash.replace('#/addon/', '');
    openDetail(id);
  } else if (hash.startsWith('#/criador/')) {
    const slug = hash.replace('#/criador/', '');
    openCreatorPage(slug);
  }
}

window.addEventListener('hashchange', handleRoute);

// =============================================
// HELPERS
// =============================================
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function goHome() {
  closeDetail();
  closeCreatorPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  const mobileSearch = document.getElementById('searchInputMobile');
  if (mobileSearch) mobileSearch.value = '';
  
  currentCategory = 'all';
  showFavsOnly = false;
  
  const favBtn = document.getElementById('favNavBtn');
  if (favBtn) favBtn.style = '';
  
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  const allChip = document.querySelector('.filter-chip[data-cat="all"]');
  if (allChip) allChip.classList.add('active');
  
  renderAddons();
}

function scrollToGrid(e) {
  if (e) e.preventDefault();
  const addonsSection = document.getElementById('addons');
  if (addonsSection) {
    addonsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function shareAddon(id, name) {
  const url = window.location.origin + window.location.pathname + '#/addon/' + id;
  if (navigator.share) {
    navigator.share({ title: name + ' - Mineaddonsnews', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    showToast('Link copiado!');
  }
}

function copyLink(link) {
  navigator.clipboard.writeText(link);
  showToast('Link de download copiado!');
}

function trackDownload(addonId) {
  const addonIndex = allAddons.findIndex(a => a.id === addonId);
  if (addonIndex !== -1) {
    // Incrementar no Firebase (sem bloquear UI)
    db.ref('addons/' + addonIndex + '/downloads').transaction(current => (current || 0) + 1);
  }
}

// =============================================
// TOAST
// =============================================
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =============================================
// FAQ
// =============================================
function toggleFaq(item) {
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// =============================================
// SCROLL EVENTS
// =============================================
let scrollTicking = false;
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      
      // Scroll top button
      const scrollBtn = document.getElementById('scrollTopBtn');
      if (scrollBtn) {
        scrollBtn.classList.toggle('visible', scrollY > 600);
      }
      
      // Navbar background change on scroll
      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', scrollY > 100);
      }
      
      lastScrollY = scrollY;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// =============================================
// OVERLAY CLICK TO CLOSE
// =============================================
const detailOverlay = document.getElementById('detailOverlay');
if (detailOverlay) {
  detailOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'detailOverlay') closeDetail();
  });
}

const creatorOverlay = document.getElementById('creatorOverlay');
if (creatorOverlay) {
  creatorOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'creatorOverlay') closeCreatorPage();
  });
}

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetail();
    closeCreatorPage();
  }
});

// =============================================
// INIT - Inicializacao Principal
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  
  // Iniciar efeitos cinematicos apos carregamento
  setTimeout(() => {
    animateCounterOnView();
    init3DCardEffect();
  }, 500);
});
